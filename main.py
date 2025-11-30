from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
import uvicorn
import os
import autogen
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from agents.conversational_agent import build_conversational_agent
from agents.interpreter_agent import build_interpreter_agent
from agents.method_selector_agent import build_method_selector_agent
from tools.orchestrator_tools import (
    start_new_project_tool,
    record_baseline_field_tool,
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
    baseline_inputs: Optional[Dict[str, Any]] = None  # Added field

class ChatResponse(BaseModel):
    response: str
    is_ready: bool
    recommended_methods: List[str] = []
    summary_confirmed: bool = False

# Endpoints

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
    Chat with the conversational agent and interpreter.
    If session_id exists and has complete baseline from Step 1 form,
    the chatbot will not re-ask for baseline fields.
    """
    import time
    from workflow.tracing import get_trace_store, TraceEvent, TraceEventType
    
    session_id = request.session_id or f"chat_{int(time.time() * 1000)}"
    store = get_trace_store()
    
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.USER_INPUT,
        step_name="chat",
        input_data={"message": request.message, "history_length": len(request.history)}
    ))
    
    # NEW: Check if ProjectContext exists from Step 1 form submission
    baseline_from_step1 = False
    baseline_summary = ""
    
    try:
        from tools.orchestrator_tools import get_project_context_tool
        from tools.intake_tools import intake_step
        
        # Try to load existing context
        project_context = get_project_context_tool(session_id)
        
        # Check if baseline was already collected in Step 1
        baseline_data = project_context.get("baseline", {})
        missing_baseline = project_context.get("missing_baseline", {})
        
        # AUTO-INTAKE: If baseline is empty/incomplete AND user message is rich, try to parse it immediately
        if (not baseline_data or missing_baseline) and len(request.message) > 20 and "WAITING FOR USER INPUT" not in request.message:
            print(f"Auto-running intake_step for session {session_id} with message length {len(request.message)}")
            try:
                intake_result = intake_step(session_id=session_id, user_text=request.message)
                # Reload context to see if baseline was updated
                project_context = get_project_context_tool(session_id)
                baseline_data = project_context.get("baseline", {})
                missing_baseline = project_context.get("missing_baseline", {})
            except Exception as e:
                print(f"Auto-intake failed: {e}")

        if baseline_data and not missing_baseline:
            # Baseline is complete from Step 1 form OR auto-intake
            baseline_from_step1 = True
            baseline_summary = (
                f"Session {session_id} has complete baseline data:\n"
                f"- Project Type: {baseline_data.get('project_type', 'N/A')}\n"
                f"- Complexity: {baseline_data.get('complexity', 'N/A')}\n"
                f"- Tech Stack: {baseline_data.get('tech_stack', 'N/A')}\n"
                f"- Team Preference: {baseline_data.get('team_pref', 'N/A')}\n"
                f"- Region: {baseline_data.get('region', 'N/A')}\n"
                f"- Project Duration: {baseline_data.get('project_duration', 'N/A')}\n"
                f"IMPORTANT: Do NOT re-ask for these baseline fields. Proceed directly to the next workflow step."
            )
    except Exception as e:
        # Context doesn't exist yet or error loading - proceed normally
        pass
    
    # Prepend system message if baseline exists from Step 1
    if baseline_from_step1:
        system_context_message = {
            "role": "system",
            "content": baseline_summary,
            "name": "System"
        }
        
        if not request.history:
            request.history = [system_context_message]
        else:
            # Insert at beginning so agents see it first
            request.history.insert(0, system_context_message)
    
    # Read project context to know what's already captured
    context_data = None
    baseline_info = ""
    missing_info = ""
    try:
        from tools.orchestrator_tools import get_project_context_tool
        context = get_project_context_tool(session_id)
        if context and context.get("baseline"):
            baseline = context["baseline"]
            missing_by_method = context.get("missing_by_method", {})
            
            # Build baseline summary
            baseline_items = []
            for key, value in baseline.items():
                if value:
                    baseline_items.append(f"  - {key.replace('_', ' ').title()}: {value}")
            
            if baseline_items:
                baseline_info = "\n".join(baseline_items)
            
            # Build missing inputs summary
            if missing_by_method:
                missing_items = []
                for method, fields in missing_by_method.items():
                    missing_items.append(f"  - {method}: {', '.join(fields)}")
                missing_info = "\n".join(missing_items)
    except Exception as e:
        print(f"Could not load context: {e}")
    
    # ============================================================================
    # NEW: Confirmation Flow Logic
    # ============================================================================
    # Check if we need to handle summary confirmation flow
    try:
        from tools.orchestrator_tools import get_project_context_tool
        context = get_project_context_tool(session_id)
        
        # Check if expansion is confirmed and we should show summary
        if context.get("status") == "EXPANSION_CONFIRMED" and context.get("expansion_confirmed"):
            # Phase 1: Generate and show summary for confirmation
            expansion = context["expansion_confirmed"]
            
            # Check if user is responding to confirm or modify the summary
            message_lower = request.message.lower()
            confirmation_keywords = ["yes", "correct", "looks good", "look good", "right", "yep", "approve", "confirmed", "confirm", "ok", "okay", "good"]
            modification_keywords = ["change", "modify", "update", "wrong", "no", "not", "different", "should be"]
            
            is_confirmation = any(kw in message_lower for kw in confirmation_keywords)
            is_modification = any(kw in message_lower for kw in modification_keywords)
            
            if is_confirmation and not is_modification:
                # Phase 2: User confirmed! Now show methods
                # Let agents process and return methods
                # We'll mark this so agents know to proceed with method selection
                pass  # Continue to agent processing below
            elif is_modification:
                # User wants to change something - let agents handle the modification
                pass  # Continue to agent processing
            else:
                # First time seeing EXPANSION_CONFIRMED - show summary
                # Build readable summary from expansion_confirmed
                summary_parts = [
                    "Based on your description, here's what I understand:\n"
                ]
                
                baseline = context.get("baseline", {})
                if baseline.get("project_type"):
                    summary_parts.append(f"- **Project Type**: {baseline['project_type']}")
                if baseline.get("complexity"):
                    summary_parts.append(f"- **Complexity**: {baseline['complexity']}")
                if baseline.get("tech_stack"):
                    summary_parts.append(f"- **Tech Stack**: {baseline['tech_stack']}")
                if baseline.get("team_pref"):
                    summary_parts.append(f"- **Team Size**: {baseline['team_pref']}")
                if baseline.get("region"):
                    summary_parts.append(f"- **Region**: {baseline['region']}")
                
                # Add features if available
                features = expansion.get("features", [])
                if features:
                    summary_parts.append("\n**Features Detected:**")
                    for feature in features[:5]:  # Show top 5 features
                        if isinstance(feature, dict):
                            name = feature.get("name", "Unknown")
                            summary_parts.append(f"  • {name}")
                        else:
                            summary_parts.append(f"  • {feature}")
                
                # Add assumptions if available
                assumptions = expansion.get("assumptions", [])
                if assumptions:
                    summary_parts.append("\n**Assumptions:**")
                    for assumption in assumptions[:3]:  # Show top 3 assumptions
                        summary_parts.append(f"  • {assumption}")
                
                summary_parts.append("\n**Is this understanding correct?** Please confirm or tell me what to change.")
                
                summary_text = "\n".join(summary_parts)
                
                # Log summary generation
                store.add_event(session_id, TraceEvent(
                    session_id=session_id,
                    event_type=TraceEventType.AGENT_RESPONSE,
                    agent_name="ChatBot_SummaryGeneration",
                    output_data={
                        "response": summary_text[:200],
                        "is_ready": True,
                        "recommended_methods": [],
                        "summary_confirmed": False
                    }
                ))
                
                return ChatResponse(
                    response=summary_text,
                    is_ready=True,
                    recommended_methods=[],  # Don't show methods yet
                    summary_confirmed=False
                )
    except Exception as e:
        print(f"Error in confirmation flow: {e}")
        import traceback
        traceback.print_exc()
    
    # ============================================================================
    # End of Confirmation Flow Logic
    # ============================================================================
    
    # Check for OpenRouter API key only  
    api_key = os.environ.get("OPENROUTER_API_KEY")
    model = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o")
    
    if not api_key:
        print("No OPENROUTER_API_KEY found, using fallback responses")
        response = generate_fallback_response(request.message, request.history)
        
        # Log fallback response
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.AGENT_RESPONSE,
            agent_name="ChatBotFallback",
            output_data={
                "response": response.response[:200],
                "is_ready": response.is_ready,
                "recommended_methods": response.recommended_methods
            }
        ))
        
        return response
    
    try:
        # Initialize agents (in a real app, these would be persistent or cached)
        # For now, we create them per request for simplicity, but pass history
        
        # Configure AutoGen for OpenRouter
        config_list = [
            {
                "model": model,
                "api_key": api_key,
                "base_url": "https://openrouter.ai/api/v1",
                "api_type": "openai",  # OpenRouter is OpenAI-compatible
                "price": [0.01, 0.03]  # Silence warning about missing model price
            }
        ]
        
        print(f"Using OpenRouter API with model: {model}")
        
        llm_config = {
            "config_list": config_list,
            "temperature": 0.7,
            "timeout": 120,  # Increase timeout for OpenRouter
        }
        
        # User Proxy Agent
        def check_termination(msg):
            content = msg.get("content", "")
            if content and "WAITING FOR USER INPUT" in content:
                print(f"DEBUG: Termination condition met. Content: {content[:50]}...")
                return True
            return False

        user_proxy = autogen.UserProxyAgent(
            name="User",
            human_input_mode="NEVER",
            max_consecutive_auto_reply=10,
            code_execution_config=False,
            is_termination_msg=check_termination,
        )
        
        # Register all orchestrator tools with user_proxy for execution
        from tools.intake_tools import intake_step
        from tools.cocomo_tools import generate_cocomo_ii_estimation
        from tools.storypoints_tools import generate_storypoints_estimation
        from tools.fpa_tools import generate_fpa_estimation  
        from tools.analogous_tools import generate_analogous_estimation
        from tools.parametric_tools import generate_parametric_estimation
        from tools.bottomup_tools import generate_bottom_up_estimation
        
        user_proxy.register_function(
            function_map={
                # Orchestrator tools
                "start_new_project_tool": start_new_project_tool,
                "record_baseline_field_tool": record_baseline_field_tool,
                "submit_user_description_tool": submit_user_description_tool,
                "get_project_context_tool": get_project_context_tool,
                "draft_expansion_tool": draft_expansion_tool,
                "confirm_expansion_tool": confirm_expansion_tool,
                "evaluate_methods_tool": evaluate_methods_tool,
                "normalize_and_infer_tool": normalize_and_infer_tool,
                "generate_explanation_tool": generate_explanation_tool,
                "validate_step1_tool": validate_step1_tool,
                "get_method_requirements_tool": get_method_requirements_tool,
                "register_estimate_tool": register_estimate_tool,
                "generate_full_report_tool": generate_full_report_tool,  # Added this
                "intake_step": intake_step,
                # Estimation method tools
                "generate_cocomo_ii_estimation": generate_cocomo_ii_estimation,
                "generate_storypoints_estimation": generate_storypoints_estimation,
                "generate_fpa_estimation": generate_fpa_estimation,
                "generate_analogous_estimation": generate_analogous_estimation,
                "generate_parametric_estimation": generate_parametric_estimation,
                "generate_bottom_up_estimation": generate_bottom_up_estimation,
            }
        )
        
        # Instantiate the real agents
        from agents.conversational_agent import build_conversational_agent
        from agents.interpreter_agent import build_interpreter_agent
        from agents.method_selector_agent import build_method_selector_agent
        from agents.cocomo_agent import build_cocomo_agent
        from agents.storypoints_agent import build_storypoints_agent
        from agents.fpa_agent import build_fpa_agent
        from agents.parametric_agent import build_parametric_agent
        from agents.bottomup_agent import build_bottomup_agent
        from agents.analogous_agent import build_analogous_agent
        from agents.explainer_agent import build_explainer_agent

        conversational_agent = build_conversational_agent(llm_config, session_id=session_id)
        interpreter_agent = build_interpreter_agent(llm_config)
        method_selector_agent = build_method_selector_agent(llm_config)
        
        # Instantiate estimation agents
        cocomo_agent = build_cocomo_agent(llm_config)
        storypoints_agent = build_storypoints_agent(llm_config)
        fpa_agent = build_fpa_agent(llm_config)
        parametric_agent = build_parametric_agent(llm_config)
        bottomup_agent = build_bottomup_agent(llm_config)
        analogous_agent = build_analogous_agent(llm_config)
        explainer_agent = build_explainer_agent(llm_config)
        
        # Create GroupChat
        # We pass the history so the agents have context of previous turns
        groupchat = autogen.GroupChat(
            agents=[
                user_proxy, 
                conversational_agent, 
                interpreter_agent, 
                method_selector_agent,
                cocomo_agent,
                storypoints_agent,
                fpa_agent,
                parametric_agent,
                bottomup_agent,
                analogous_agent,
                explainer_agent
            ],
            messages=request.history or [],
            max_round=30,  # Increased to allow full workflow completion
            speaker_selection_method="auto"
        )
        
        manager = autogen.GroupChatManager(
            groupchat=groupchat,
            llm_config=llm_config
        )
        
        # Initiate chat with the user's message
        # The manager handles the orchestration
        chat_result = user_proxy.initiate_chat(
            manager,
            message=request.message,
            clear_history=False # Keep history we just passed
        )
        
        # DEBUG: Dump chat history
        import json
        with open("debug_chat_history.json", "w") as f:
            json.dump(chat_result.chat_history, f, indent=2, default=str)
        
        # Extract the last message from the conversational agent or manager
        # We want the final response to the user, NOT tool execution results
        # Filter out tool response messages and get the last assistant message
        last_message = None
        for msg in reversed(chat_result.chat_history):
            role = msg.get("role")
            content = msg.get("content", "")
            
            # Skip tool messages entirely
            if role == "tool":
                continue
                
            # Skip empty messages or messages with just tool calls
            if not content or "tool_calls" in msg:
                continue
                
            # Skip messages that look like raw JSON/dict outputs
            if content.startswith("{") or content.startswith("["):
                continue
                
            # Skip messages that contain project_id, status, version - these are tool outputs
            if "project_id" in content and ("'status':" in content or "\"status\":" in content):
                continue
            
            # We found a good human-readable message!
            if role in ["assistant", "user"] and content:
                last_message = content
                break
        
        # Fallback: if no clean message found, look for any assistant message
        if not last_message:
            for msg in reversed(chat_result.chat_history):
                if msg.get("role") == "assistant" and msg.get("content"):
                    last_message = msg["content"]
                    break
        
        # Last resort: take the last message with content
        if not last_message:
            for msg in reversed(chat_result.chat_history):
                if msg.get("content"):
                    last_message = msg["content"]
                    break

        
        # Check for recommendation signal
        is_ready = "RECOMMENDATION_READY" in last_message
        recommended_methods = []
        if is_ready:
            import re
            match = re.search(r"RECOMMENDATION_READY:\s*\[(.*?)\]", last_message)
            if match:
                methods_str = match.group(1)
                recommended_methods = [m.strip().strip('"\'') for m in methods_str.split(",")]
        
        # Log agent response
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.AGENT_RESPONSE,
            agent_name="GroupChatManager",
            output_data={
                "response": last_message[:200], # Log first 200 chars
                "is_ready": is_ready,
                "recommended_methods": recommended_methods
            }
        ))
        
        return ChatResponse(
            response=last_message,
            is_ready=is_ready,
            recommended_methods=recommended_methods
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        # Log error to file
        with open("error.log", "w") as f:
            f.write(f"Chat error: {str(e)}\n")
            import traceback
            traceback.print_exc(file=f)
            
        # Fallback for demo if error occurs
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
        from workflow.controller import WorkflowOrchestrator
        
        orchestrator = WorkflowOrchestrator()
        
        # Use session_id as project_id for workflow tracing
        project_id = session_id
        
        # Try to load existing context first
        try:
            context = orchestrator.load_context(project_id)
            print(f"Loaded existing context for {project_id}, status: {context.status}")
        except Exception:
            print(f"No existing context for {project_id}, starting new project")
            context = orchestrator.start_new_project(project_id)
            
            # Record baseline inputs only if new project
            baseline = request.baseline_inputs
            orchestrator.record_baseline_field(project_id, "project_type", baseline.project_type)
            orchestrator.record_baseline_field(project_id, "complexity", baseline.complexity)
            orchestrator.record_baseline_field(project_id, "tech_stack", baseline.tech_stack)
            orchestrator.record_baseline_field(project_id, "team_pref", str(baseline.team_pref))
            orchestrator.record_baseline_field(project_id, "region", baseline.region)
            
            if baseline.description:
                orchestrator.submit_description(project_id, baseline.description)
            
            # Generate expansion and select methods
            orchestrator.generate_expansion(project_id)
            orchestrator.confirm_expansion(project_id, "approve")
            orchestrator.evaluate_methods(project_id)
        
        # If context exists but estimates are missing, we might need to trigger estimation
        # But for now, we assume the Chatbot flow has populated the estimates
        # or that generate_full_report handles it.
        
        # Check if we need to run estimation (if not done yet)
        if not context.estimates and context.status == "METHOD_SELECTED":
             # This might happen if user skipped chat or chat didn't finish estimation
             # We could trigger agents here, but that's complex.
             # For now, let's rely on what we have.
             pass
        
        # Prepare estimation config
        estimation_config = {
            "includeRisk": True,
            "includeContingency": True,
            "includeOverhead": True,
            "includeProfit": True,
            "currency": "EUR",
            "accuracy": "high"
        }
        
        # Generate full report
        report = orchestrator.generate_full_report(
            project_id=project_id, 
            estimation_config=estimation_config,
            selected_method=request.method_name  # Pass user selection
        )
        
        # Log session completion
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.SESSION_END,
            output_data={"status": "completed"},
            metadata={
                "total_cost": report.estimation_result.cost_estimate.total_cost,
                "methods_used": report.estimation_result.methods_used,
                "duration": report.estimation_result.timeline_estimate.total_duration
            }
        ))
        store.update_session_status(session_id, "completed")
        
        return report.dict()
        
    except Exception as e:
        # Log error
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            output_data={
                "error": str(e),
                "error_type": type(e).__name__
            }
        ))
        store.update_session_status(session_id, "error")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

# ==============================================================================
# Session Tracing Endpoints
# ==============================================================================

from workflow.tracing import get_trace_store, SessionTrace, TraceEvent, TraceEventType

@app.get("/traces")
async def list_traces(
    limit: int = 50,
    status: Optional[str] = None
):
    """
    List all session traces with optional filtering.
    
    Query params:
        limit: Maximum number of traces to return (default 50)
        status: Filter by status (active, completed, error)
    """
    store = get_trace_store()
    traces = store.get_all_sessions(limit=limit, status=status)
    
    return [
        {
            "session_id": t.session_id,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat(),
            "status": t.status,
            "event_count": len(t.events),
            "metadata": t.metadata
        }
        for t in traces
    ]


@app.get("/traces/{session_id}")
async def get_trace(session_id: str):
    """Get complete trace for a specific session."""
    store = get_trace_store()
    trace = store.get_session(session_id)
    
    if not trace:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    # Use model_dump for Pydantic v2, dict for v1
    try:
        return trace.model_dump(mode='json')
    except AttributeError:
        return trace.dict()


@app.get("/traces/{session_id}/events")
async def get_trace_events(
    session_id: str,
    event_type: Optional[str] = None,
    agent_name: Optional[str] = None
):
    """
    Get events for a session with optional filtering.
    
    Query params:
        event_type: Filter by event type (session_start, user_input, agent_call, etc.)
        agent_name: Filter by agent name
    """
    store = get_trace_store()
    trace = store.get_session(session_id)
    
    if not trace:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    events = trace.events
    
    # Filter by event_type
    if event_type:
        events = [e for e in events if e.event_type == event_type]
    
    # Filter by agent_name
    if agent_name:
        events = [e for e in events if e.agent_name == agent_name]
    
    # Return as dicts
    try:
        return [e.model_dump(mode='json') for e in events]
    except AttributeError:
        return [e.dict() for e in events]


@app.get("/traces/{session_id}/timeline")
async def get_trace_timeline(session_id: str):
    """Get a formatted timeline view of the session for easy inspection."""
    store = get_trace_store()
    trace = store.get_session(session_id)
    
    if not trace:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    timeline = []
    for event in trace.events:
        summary = _generate_event_summary(event)
        timeline.append({
            "timestamp": event.timestamp.isoformat(),
            "type": event.event_type,
            "agent": event.agent_name or "system",
            "step": event.step_name,
            "duration_ms": event.duration_ms,
            "summary": summary
        })
    
    return {
        "session_id": session_id,
        "status": trace.status,
        "created_at": trace.created_at.isoformat(),
        "total_events": len(timeline),
        "total_duration_ms": sum(e['duration_ms'] for e in timeline if e['duration_ms']),
        "timeline": timeline
    }


def _generate_event_summary(event: TraceEvent) -> str:
    """Generate human-readable summary for an event."""
    if event.event_type == TraceEventType.USER_INPUT:
        msg = event.input_data.get('message', '')
        return f"User: {msg[:100]}..." if len(msg) > 100 else f"User: {msg}"
    elif event.event_type == TraceEventType.AGENT_CALL:
        func = event.input_data.get('function', 'unknown')
        return f"{event.agent_name}.{func}() called"
    elif event.event_type == TraceEventType.AGENT_RESPONSE:
        func = event.output_data.get('function', 'unknown')
        return f"{event.agent_name}.{func}() responded"
    elif event.event_type == TraceEventType.ERROR:
        error = event.output_data.get('error', 'Unknown error')
        return f"Error: {error[:100]}"
    elif event.event_type == TraceEventType.SESSION_START:
        return "Session started"
    elif event.event_type == TraceEventType.SESSION_END:
        return "Session ended"
    elif event.event_type == TraceEventType.WORKFLOW_STEP:
        return f"Workflow step: {event.step_name}"
    else:
        return event.event_type


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
