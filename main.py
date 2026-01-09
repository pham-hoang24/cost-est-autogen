"""
main.py
=======

Cost Estimation Microservice - Entry Point

This is the application factory that:
1. Creates the FastAPI application
2. Configures middleware (CORS)
3. Registers all API routers

Business logic is in services/, schemas in api/schemas.py, routes in api/routes/.
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
import traceback
import os
import autogen
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from agents.conversational_agent import build_conversational_agent
from agents.interpreter_agent import build_interpreter_agent
from agents.method_selector_agent import build_method_selector_agent
from agents.cocomo_agent import build_cocomo_agent
from agents.explainer_agent import build_explainer_agent
from tools.orchestrator_tools import (
    start_new_project_tool,
    record_baseline_field_tool,
    update_project_baseline_tool,
    submit_user_description_tool,
    draft_expansion_tool,
    confirm_expansion_tool,
    evaluate_methods_tool,
    generate_explanation_tool,
    register_estimate_tool,
    get_project_context_tool,
    normalize_and_infer_tool,
    validate_step1_tool,
    get_method_requirements_tool,
    generate_full_report_tool,
)

app = FastAPI(title="Cost Estimation Microservice")

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",  # Alternative port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

# Data Models

class BaselineInputs(BaseModel):
    project_type: str = Field(..., description="Type of the project e.g. 'web application'")
    complexity: str = Field(..., description="Complexity level: low, medium, high, very high")
    tech_stack: str = Field(..., description="Primary tech stack")
    team_pref: int = Field(..., description="Desired team size")
    region: str = Field(..., description="Primary delivery region")
    duration: Optional[str] = Field(None, description="Expected duration")  # Made optional
    description: Optional[str] = Field(None, description="Project description")  # Added

class MethodSelection(BaseModel):
    method_name: str
    description: str

class EstimationRequest(BaseModel):
    session_id: Optional[str] = None
    method_name: str
    baseline_inputs: BaselineInputs
    additional_inputs: Dict[str, Any] = {}

class MissingInput(BaseModel):
    field: str
    prompt: str
    priority: str

class EstimateResult(BaseModel):
    effort_person_months: Optional[float] = None
    duration_months: Optional[float] = None
    total_cost: Optional[float] = None
    currency: str = "USD"

class MethodResponse(BaseModel):
    method_name: str
    is_sufficient: bool
    missing_inputs: List[MissingInput] = []
    estimate: Optional[EstimateResult] = None
    diagnostics: Dict[str, Any] = {}
    explanation: Optional[str] = None

class HybridRequest(BaseModel):
    baseline_inputs: BaselineInputs

class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: List[Dict[str, str]] = []
    baseline_inputs: Optional[Dict[str, Any]] = None
    estimation_config: Optional[Dict[str, Any]] = None  # Added field

class RunEstimationRequest(BaseModel):
    """Request to run estimation with a specific method."""
    session_id: str
    method_id: str  # e.g., "cocomo", "function-points", "story-points"
    inputs: Optional[Dict[str, Any]] = None  # User-provided inputs (e.g., {"ksloc": 50})


class SelectMethodRequest(BaseModel):
    session_id: str
    method_id: str
    # Optional: user-provided answers from previous prompts (e.g., KSLOC=15)
    input_overrides: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    is_ready: bool
    recommended_methods: List[str] = []
    summary_confirmed: bool = False


def generate_fallback_response(message: str, history: List[Dict[str, str]] = []) -> ChatResponse:
    """Generate intelligent responses without AI when OpenAI key is unavailable."""
    message_lower = message.lower()
    
    # Count conversation turns to determine when to recommend
    conversation_depth = len(history)
    
    # Detect e-commerce/specific features
    if any(word in message_lower for word in ['e-commerce', 'ecommerce', 'shop', 'cart', 'checkout', 'payment']):
        if conversation_depth >= 1:
            return ChatResponse(
                response="I see you're building an e-commerce platform with complex features. Based on the story points and KSLOC estimates you mentioned, I recommend using a combination of COCOMO II for the codebase estimation and Story Points for agile planning. Shall we proceed with the estimation?",
                is_ready=True,
                recommended_methods=["cocomo", "story-points"]
            )
        return ChatResponse(
            response="An e-commerce platform sounds exciting! I can see it includes features like authentication, product catalog, shopping cart, payment integration, and admin dashboard. Could you tell me more about the complexity and technology stack you're planning to use?",
            is_ready=False
        )
    
    # Detect project type mentions
    if any(word in message_lower for word in ['web', 'website', 'application', 'app', 'platform']):
        return ChatResponse(
            response="Great! A web application project. To recommend the best estimation methodology, could you tell me about the complexity level and key features? For example, is it a simple CRUD application or does it involve complex integrations and workflows?",
            is_ready=False
        )
    
    # Detect complexity/scale mentions
    if any(word in message_lower for word in ['complex', 'high', 'large', 'enterprise', 'story points', 'ksloc', '15 ksloc']):
        return ChatResponse(
            response="Based on the high complexity and scale you've described, I recommend using COCOMO II or Analogous estimation methods. These are well-suited for larger projects. Would you like to proceed with generating an estimate?",
            is_ready=True,
            recommended_methods=["cocomo", "analogous"]
        )
    
    # Detect simple/small mentions
    if any(word in message_lower for word in ['simple', 'small', 'quick', 'low', 'basic']):
        return ChatResponse(
            response="For a simpler project, I recommend using Analogous estimation or the Hybrid method for a quick estimate. These approaches work well when you have limited information. Ready to generate an estimate?",
            is_ready=True,
            recommended_methods=["analogous", "hybrid"]
        )
    
    # Detect agile mentions
    if any(word in message_lower for word in ['agile', 'scrum', 'sprint', 'velocity', 'story', 'points']):
        return ChatResponse(
            response="Perfect! Since you're working in an agile environment, I recommend using Story Points & Velocity estimation. This method aligns well with sprint planning. Shall we proceed?",
            is_ready=True,
            recommended_methods=["story-points"]
        )
    
    # Default response - encourage more details
    if conversation_depth == 0:
        return ChatResponse(
            response="Thank you for sharing! To recommend the best estimation method, could you provide a bit more detail about your project's complexity, technology stack, and any specific requirements?",
            is_ready=False
        )
    
    # If we have some conversation history, make a recommendation
    return ChatResponse(
        response="Based on what you've told me, I recommend starting with Analogous estimation or COCOMO II. These methods work well for the scope you've described. Ready to generate your cost estimate?",
        is_ready=True,
        recommended_methods=["analogous", "cocomo"]
    )


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Chat with the FSM-based workflow controller.
    Uses explicit state transitions instead of LLM-based routing.
    """
    import time
    from workflow.tracing import get_trace_store, TraceEvent, TraceEventType
    from workflow.fsm_controller import FSMController
    
    session_id = request.session_id or f"chat_{int(time.time() * 1000)}"
    store = get_trace_store()
    
    # Log user input
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.USER_INPUT,
        step_name="chat",
        input_data={"message": request.message, "history_length": len(request.history)}
    ))
    
    try:
        # Use FSM Controller for explicit state-based routing
        controller = FSMController()
        result = await controller.process_message(
            session_id=session_id,
            message=request.message,
            history=request.history,
            estimation_config=request.estimation_config
        )
        
        # Log FSM response
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.AGENT_RESPONSE,
            agent_name="FSMController",
            output_data={
                "response": result.response[:200] if result.response else "",
                "state": result.current_state.value,
                "is_ready": result.is_ready,
                "recommended_methods": result.recommended_methods
            }
        ))
        
        print(f"FSM Response - State: {result.current_state.value}, Ready: {result.is_ready}")
        
        return ChatResponse(
            response=result.response,
            is_ready=result.is_ready,
            recommended_methods=result.recommended_methods
        )
        
    except Exception as e:
        print(f"FSM Chat error: {e}")
        traceback.print_exc()
        
        # Log error
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            step_name="chat",
            output_data={"error": str(e)}
        ))
        
        # Fallback response
        return generate_fallback_response(request.message, request.history)


@app.post("/validate-step1")
async def validate_step1(request: Dict[str, Any]):
    """
    Validate Step 1 baseline data and create project context.
    
    This endpoint validates user inputs from Step 1 without business rules,
    creates a ProjectContext, and determines what's missing for each method.
    """
    from workflow.tracing import get_trace_store, TraceEvent, TraceEventType
    import time as time_module
    
    session_id = request.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    store = get_trace_store()
    
    # Log validation request
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.WORKFLOW_STEP,
        step_name="validate_step1",
        input_data=request
    ))
    
    try:
        # Call validation tool
        from tools.orchestrator_tools import validate_step1_tool
        
        result = validate_step1_tool(
            project_id=session_id,
            baseline_data=request
        )
        
        # Log result
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.WORKFLOW_STEP,
            step_name="validate_step1_complete",
            output_data={
                "is_valid": result["is_valid"],
                "error_count": len(result.get("errors", [])),
                "missing_methods_count": len(result.get("missing_by_method", {}))
            }
        ))
        
        if result["is_valid"]:
            return {
                "status": "ok",
                "step1_validated": True,
                "missing_by_method": result["missing_by_method"]
            }
        else:
            return {
                "status": "error",
                "step1_validated": False,
                "errors": result["errors"]
            }
            
    except Exception as e:
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            step_name="validate_step1_error",
            output_data={"error": str(e)}
        ))
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/method-requirements/{session_id}/{method_name}")
async def get_method_requirements(session_id: str, method_name: str):
    """
    Get known and missing requirements for a specific estimation method.
    
    Args:
        session_id: Project/session identifier
        method_name: Method name (cocomo2, analogous, fpa, story_points)
        
    Returns:
        Known coefficients, missing fields, and baseline data
    """
    try:
        from tools.orchestrator_tools import get_method_requirements_tool
        
        return get_method_requirements_tool(session_id, method_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/intake", response_model=Dict[str, Any])
async def intake_baseline(inputs: BaselineInputs):
    """
    Step 1: Receive baseline inputs from the form.
    Validates data via InterpreterAgent and stores in ProjectContext.
    Returns validation status and missing method-specific inputs.
    """
    from workflow.tracing import get_trace_store, TraceEvent, TraceEventType
    import time as time_module
    
    # Generate session_id if not provided
    session_id = f"intake_{int(time_module.time() * 1000)}"
    store = get_trace_store()
    
    # Log intake request
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.USER_INPUT,
        step_name="intake",
        input_data=inputs.dict()
    ))
    
    try:
        from tools.orchestrator_tools import validate_step1_tool
        
        # Convert BaselineInputs to dict for validation
        baseline_data = inputs.dict(exclude_none=True)
        
        # Call InterpreterAgent's Step 1 validation tool
        # This validates, stores in ProjectContext, and computes missing_by_method
        result = validate_step1_tool(session_id, baseline_data)
        
        # Log validation result
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.AGENT_RESPONSE,
            agent_name="InterpreterAgent",
            step_name="validate_step1",
            output_data={
                "is_valid": result["is_valid"],
                "errors": result.get("errors", []),
                "missing_by_method": result.get("missing_by_method", {})
            }
        ))
        
        return {
            "status": "validated" if result["is_valid"] else "invalid",
            "session_id": session_id,
            "is_valid": result["is_valid"],
            "errors": result.get("errors", []),
            "missing_by_method": result.get("missing_by_method", {}),
            "context": result.get("context", {})
        }
        
    except Exception as e:
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            step_name="intake",
            output_data={"error": str(e)}
        ))
        
        return {
            "status": "error",
            "session_id": session_id,
            "is_valid": False,
            "errors": [f"Validation error: {str(e)}"],
            "missing_by_method": {},
            "context": {}
        }

@app.get("/methods", response_model=List[MethodSelection])
async def get_methods():
    """
    Step 2: Return supported estimation methods.
    """
    return [
        {"method_name": "COCOMO", "description": "Constructive Cost Model II"},
        {"method_name": "FPA", "description": "Function Point Analysis"},
        {"method_name": "StoryPoints", "description": "Agile Story Points & Velocity"},
        {"method_name": "Parametric", "description": "Parametric Cost Estimation"},
        {"method_name": "BottomUp", "description": "Bottom-up Estimation"},
        {"method_name": "Analogous", "description": "Analogous Estimation"},
    ]

@app.post("/estimate", response_model=MethodResponse)
async def estimate(request: EstimationRequest):
    """
    Step 3: Trigger a specific estimation method.
    """
    # Placeholder: Logic to invoke the specific MethodAgent
    # For now, return a mock response indicating missing inputs or a mock estimate
    
    # TODO: Connect to actual agents
    return MethodResponse(
        method_name=request.method_name,
        is_sufficient=False,
        missing_inputs=[
            {"field": "ksloc", "prompt": "Estimated KSLOC", "priority": "critical"}
        ],
        diagnostics={"note": "Mock response"}
    )

@app.post("/hybrid", response_model=Dict[str, Any])
async def hybrid_estimate(request: HybridRequest):
    """
    Step 4: Hybrid 'Quick & Dirty' estimate.
    """
    # Placeholder: Logic to invoke InterpreterAgent -> MethodAgents (parallel) -> HybridAggregator
    return {
        "type": "hybrid",
        "composite_estimate": {
            "total_cost": 100000,
            "confidence": 0.4,
            "range": {"min": 50000, "max": 200000}
        },
        "breakdown": []
    }

@app.post("/generate-report", response_model=Dict[str, Any])
async def generate_report(request: EstimationRequest):
    """
    Generate complete cost estimation report matching frontend schema.
    This endpoint triggers the full report generation workflow.
    """
    from workflow.tracing import get_trace_store, TraceEvent, TraceEventType
    import time as time_module
    
    # Generate or use provided session_id
    session_id = request.session_id or f"report_{int(time_module.time())}"
    store = get_trace_store()
    
    # Log session start
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.SESSION_START,
        input_data={
            "baseline_inputs": request.baseline_inputs.dict(),
            "method_name": request.method_name,
            "additional_inputs": request.additional_inputs
        },
        metadata={"endpoint": "/generate-report"}
    ))
    
    try:
        # 1. Register baseline inputs
        from tools.orchestrator_tools import record_baseline_field_tool
        
        # Store baseline fields
        baseline_dict = request.baseline_inputs.dict()
        for key, value in baseline_dict.items():
            if value is not None:
                record_baseline_field_tool(session_id, key, value)
        
        # 2. Register additional inputs (method specific)
        from tools.orchestrator_tools import update_project_baseline_tool
        if request.additional_inputs:
            # Store as method-specific inputs in context
            # This is a simplification - ideally we'd have a specific tool for this
            pass
            
        # 3. Generate Report
        from tools.orchestrator_tools import generate_full_report_tool
        
        # Pass method_name to the tool if needed, or let it infer from context
        # For now, we assume the tool looks at the context
        result = generate_full_report_tool(session_id)
        
        if result.get("status") == "success":
            report = result.get("report", {})
            
            # Log success
            store.add_event(session_id, TraceEvent(
                session_id=session_id,
                event_type=TraceEventType.WORKFLOW_COMPLETE,
                output_data={"report_summary": report.get("executive_summary")}
            ))
            
            return report
        else:
            raise Exception(result.get("error", "Unknown error in report generation"))
            
    except Exception as e:
        # Log error
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            output_data={"error": str(e)}
        ))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/run-estimation")
async def run_estimation(request: RunEstimationRequest):
    """
    Run a specific estimation method with provided inputs.
    This replaces the agent-based estimation flow for direct execution.
    """
    from workflow.tracing import get_trace_store, TraceEvent, TraceEventType
    
    store = get_trace_store()
    session_id = request.session_id
    
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.WORKFLOW_STEP,
        step_name="run_estimation",
        input_data={"method": request.method_id, "inputs": request.inputs}
    ))
    
    try:
        # 1. Update context with provided inputs
        from tools.orchestrator_tools import get_project_context_tool, update_project_baseline_tool
        
        context = get_project_context_tool(session_id)
        
        # Update inputs if provided
        if request.inputs:
            # Logic to update specific inputs in the context
            # For now, we'll assume the inputs are passed directly to the estimator
            pass
            
        # 2. Call the appropriate estimation tool
        result = None
        
        if request.method_id == "cocomo":
            from tools.cocomo_tools import generate_cocomo_ii_estimation
            result = generate_cocomo_ii_estimation(session_id)
            
        elif request.method_id == "function-points" or request.method_id == "fpa":
            from tools.fpa_tools import generate_fpa_estimation
            result = generate_fpa_estimation(session_id)
            
        elif request.method_id == "story-points":
            from tools.storypoints_tools import generate_storypoints_estimation
            result = generate_storypoints_estimation(session_id)
            
        elif request.method_id == "analogous":
            from tools.analogous_tools import generate_analogous_estimation
            result = generate_analogous_estimation(session_id)
            
        elif request.method_id == "parametric":
            from tools.parametric_tools import generate_parametric_estimation
            result = generate_parametric_estimation(session_id)
            
        elif request.method_id == "bottom-up":
            from tools.bottomup_tools import generate_bottom_up_estimation
            result = generate_bottom_up_estimation(session_id)
            
        else:
            raise HTTPException(status_code=400, detail=f"Unknown method: {request.method_id}")
            
        # 3. Return result
        return {
            "status": "success",
            "method_id": request.method_id,
            "estimation": result
        }
        
    except Exception as e:
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            step_name="run_estimation",
            output_data={"error": str(e)}
        ))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/select-method")
async def select_method(request: SelectMethodRequest):
    """
    Endpoint for the UI to select a method and trigger next steps.
    This handles the transition from Phase 2 (Selection) to Phase 3 (Estimation).
    """
    from workflow.tracing import get_trace_store, TraceEvent, TraceEventType
    from tools.orchestrator_tools import get_project_context_tool, select_method_tool
    
    session_id = request.session_id
    method_id = request.method_id
    
    store = get_trace_store()
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.USER_INPUT,
        step_name="select_method",
        input_data={"method_id": method_id}
    ))
    
    try:
        # 1. Update context with selection
        select_method_tool(session_id, method_id)
        
        # 2. Check requirements for the selected method
        from tools.orchestrator_tools import get_method_requirements_tool
        requirements = get_method_requirements_tool(session_id, method_id)
        
        missing_fields = requirements.get("missing_fields", [])
        
        if missing_fields:
            # Return list of missing inputs so UI can prompt user
            return {
                "status": "INPUTS_REQUIRED",
                "method_id": method_id,
                "missing_fields": missing_fields,
                "message": f"Please provide the following inputs for {method_id} estimation."
            }
        else:
            # All inputs available, trigger estimation immediately
            # We can call the run_estimation logic here or tell UI to call it
            return {
                "status": "READY_FOR_ESTIMATION",
                "method_id": method_id,
                "message": f"All requirements met for {method_id}. Proceeding to estimation."
            }
            
    except Exception as e:
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            step_name="select_method",
            output_data={"error": str(e)}
        ))
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
