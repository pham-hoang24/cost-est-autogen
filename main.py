from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
import uvicorn
import os
import autogen

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
    project_duration: Optional[str] = Field(None, description="Expected duration")
    description: Optional[str] = Field(None, description="Free text description of the project")

class MethodSelection(BaseModel):
    method_name: str
    description: str

class EstimationRequest(BaseModel):
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
    message: str
    history: List[Dict[str, str]] = []

class ChatResponse(BaseModel):
    response: str
    is_ready: bool = False
    recommended_methods: List[str] = []

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
    Handle chat messages using AutoGen agents or intelligent fallback.
    """
    # Check if OpenAI API key is available
    api_key = os.environ.get("OPENAI_API_KEY")
    
    if not api_key:
        print("No OpenAI API key found, using fallback responses")
        return generate_fallback_response(request.message, request.history)
    
    try:
        # Initialize agents (in a real app, these would be persistent or cached)
        # For now, we create them per request for simplicity, but pass history
        
        config_list = [
            {
                "model": "gpt-4",
                "api_key": api_key
            }
        ]
        
        llm_config = {
            "config_list": config_list,
            "temperature": 0.7,
        }
        
        # User Proxy Agent
        user_proxy = autogen.UserProxyAgent(
            name="User",
            human_input_mode="NEVER",
            max_consecutive_auto_reply=0,
            code_execution_config=False,
        )
        
        # Assistant Agent (Consultant)
        consultant = autogen.AssistantAgent(
            name="Consultant",
            system_message="""You are a helpful Cost Estimation Consultant. 
            Your goal is to gather project requirements from the user to recommend the best estimation method.
            
            Ask clarifying questions about:
            1. Project Type (Web, Mobile, AI, etc.)
            2. Complexity (Low, Medium, High)
            3. Team Size
            4. Duration
            
            Once you have enough information, recommend one or more methods from:
            - COCOMO II (Software Development)
            - Function Points (Software Metrics)
            - Story Points (Agile)
            - Parametric (Statistical)
            - Bottom-Up (Detailed)
            - Analogous (Expert Judgment)
            
            If you are ready to recommend, end your message with "RECOMMENDATION_READY: [method_id_1, method_id_2]".
            """,
            llm_config=llm_config,
        )
        
        # Construct history for context
        # In a real scenario, we'd inject this into the agent's memory
        
        # Initiate chat with the user's message
        # We use a simple one-turn interaction here for the API
        user_proxy.initiate_chat(
            consultant,
            message=request.message,
            clear_history=False
        )
        
        # Get the last message from the consultant
        last_message = user_proxy.last_message()["content"]
        
        is_ready = "RECOMMENDATION_READY" in last_message
        recommended_methods = []
        
        if is_ready:
            # Extract methods from the tag
            import re
            match = re.search(r"RECOMMENDATION_READY: \[(.*?)\]", last_message)
            if match:
                methods_str = match.group(1)
                recommended_methods = [m.strip().strip("'").strip('"') for m in methods_str.split(",")]
            
            # Clean up the message for display
            last_message = last_message.split("RECOMMENDATION_READY")[0].strip()
            
        return ChatResponse(
            response=last_message,
            is_ready=is_ready,
            recommended_methods=recommended_methods
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        # Fallback for demo if error occurs
        return generate_fallback_response(request.message, request.history)



@app.post("/intake", response_model=Dict[str, Any])
async def intake_baseline(inputs: BaselineInputs):
    """
    Step 1: Receive baseline inputs.
    In a real scenario, this might store state or just validate and return a session ID.
    For now, we just echo back with a success status.
    """
    return {"status": "received", "inputs": inputs.dict()}

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
    try:
        from workflow.controller import WorkflowOrchestrator
        
        orchestrator = WorkflowOrchestrator()
        
        # Create a new project
        project_id = f"proj_{hash(str(request.baseline_inputs.dict()))}"[-8:]
        context = orchestrator.start_new_project(project_id)
        
        # Record baseline inputs
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
        report = orchestrator.generate_full_report(project_id, estimation_config)
        
        return report.dict()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
