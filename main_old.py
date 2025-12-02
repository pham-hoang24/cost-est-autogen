from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
import traceback
import uvicorn
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
                f"BASELINE DATA ALREADY PROVIDED (from Step 1 UI form):\\n"
                f"Session {session_id} has complete baseline information stored in ProjectContext:\\n"
                f"- Project Type: {baseline_data.get('project_type', 'N/A')}\\n"
                f"- Complexity: {baseline_data.get('complexity', 'N/A')}\\n"
                f"- Tech Stack: {baseline_data.get('tech_stack', 'N/A')}\\n"
                f"- Team Preference: {baseline_data.get('team_pref', 'N/A')} people\\n"
                f"- Region: {baseline_data.get('region', 'N/A')}\\n"
                f"- Project Duration: {baseline_data.get('project_duration', 'N/A')}\\n\\n"
                f"CRITICAL INSTRUCTION: These baseline fields are COMPLETE. Do NOT ask the user for these fields again.\\n"
                f"Proceed directly with:\\n"
                f"1. Asking for project description (if not provided)\\n"
                f"2. Generating expansion draft\\n"
                f"3. Method selection and method-specific parameters\\n\\n"
                f"Use the baseline data above as context when communicating with other agents."
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
    # Confirmation Flow Logic REMOVED
    # ============================================================================
    # The confirmation flow is now handled entirely by the agents (ConversationalAgent).
    # We do not intercept here to avoid state loops.

    
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
        
        # ============================================================================
        # 1. Model Tiering Configuration
        # ============================================================================
        
        # Cheap Config (Tier 1) - For chat, routing, and basic logic
        cheap_model = os.environ.get("CHEAP_MODEL_NAME", "openai/gpt-4o-mini")
        cheap_llm_config = {
            "config_list": [{
                "model": cheap_model,
                "api_key": api_key,
                "base_url": "https://openrouter.ai/api/v1",
                "api_type": "openai",
                "price": [0.0, 0.0],  # Silence warnings
            }],
            "temperature": 0.5,
            "timeout": 60,
            "max_tokens": 1000,
            "cache_seed": 42,
        }

        # Advanced Config (Tier 2) - For estimation and complex reasoning
        advanced_model = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o")
        advanced_llm_config = {
            "config_list": [{
                "model": advanced_model,
                "api_key": api_key,
                "base_url": "https://openrouter.ai/api/v1",
                "api_type": "openai",
                "price": [0.01, 0.03],
            }],
            "temperature": 0.2,
            "timeout": 120,
            "max_tokens": 4000,
            "cache_seed": 42,
        }
        
        print(f"Tier 1 Model: {cheap_model}")
        print(f"Tier 2 Model: {advanced_model}")

        # ============================================================================
        # 2. Agent Instantiation (Phase-Based)
        # ============================================================================
        
        # Determine Phase based on Project Status
        # Phase 1 (INTAKE): NEW → BASELINE_COLLECTED → AWAITING_EXPANSION → EXPANSION_CONFIRMED
        # Phase 2 (SELECTION): EXPANSION_CONFIRMED → METHOD_SELECTED (MethodSelectorAgent active)
        # Phase 3 (ESTIMATION): METHOD_SELECTED → ESTIMATION_COMPLETE (handled by /select-method endpoint)
        
        current_status = context.get("status", "NEW") if context else "NEW"
        
        # Determine which phase we're in
        intake_statuses = ["NEW", "BASELINE_COLLECTED", "AWAITING_EXPANSION"]
        selection_statuses = ["EXPANSION_CONFIRMED", "METHOD_SELECTED", "INPUTS_REQUESTED"]
        
        is_intake_phase = current_status in intake_statuses
        is_selection_phase = current_status in selection_statuses
        
        print(f"Workflow Phase: INTAKE={is_intake_phase}, SELECTION={is_selection_phase}, Status={current_status}")

        # Common Agents
        def check_termination(msg):
            content = msg.get("content", "")
            if content and "WAITING FOR USER INPUT" in content:
                print(f"DEBUG: Termination condition met. Content: {content[:50]}...")
                return True
            return False

        user_proxy = autogen.UserProxyAgent(
            name="User",
            human_input_mode="NEVER",
            max_consecutive_auto_reply=5,
            code_execution_config=False,
            is_termination_msg=check_termination,
            llm_config=cheap_llm_config,
        )

        # ConversationalAgent is always present - it's the intake lead
        conversational_agent = build_conversational_agent(cheap_llm_config, session_id=session_id)
        
        # MethodSelectorAgent is always present but only activates on EXPANSION_CONFIRMED
        # It uses advanced model for better analysis
        method_selector_agent = build_method_selector_agent(advanced_llm_config, session_id=session_id)
        
        # InterpreterAgent helps with parsing during intake
        interpreter_agent = build_interpreter_agent(cheap_llm_config, session_id=session_id)
        
        # Build agent list with proper ordering for speaker selection:
        # 1. User (proxy)
        # 2. ConversationalAgent (intake lead, speaks first for user messages)
        # 3. InterpreterAgent (helps parse user input)
        # 4. MethodSelectorAgent (speaks LAST, only after EXPANSION_CONFIRMED)
        agents_list = [
            user_proxy,
            conversational_agent,
            interpreter_agent,
            method_selector_agent,  # Last in list - speaks after ConversationalAgent triggers evaluate_methods
        ]
        
        # Note: Estimation agents (cocomo_agent, etc.) are NOT added to the chat.
        # Estimation is now handled by the /select-method endpoint, not by agents.
        
        # ============================================================================
        # Register all tools with user_proxy for EXECUTION
        # ============================================================================
        # In autogen 0.10.x, we need to register functions for execution on user_proxy
        # The agents declare which functions they can call via their functions= parameter,
        # but user_proxy actually executes them.
        
        from tools.intake_tools import intake_step
        from tools.cocomo_tools import generate_cocomo_ii_estimation
        from tools.storypoints_tools import generate_storypoints_estimation
        from tools.fpa_tools import generate_fpa_estimation  
        from tools.analogous_tools import generate_analogous_estimation
        from tools.parametric_tools import generate_parametric_estimation
        from tools.bottomup_tools import generate_bottom_up_estimation
        
        # Create the function map for all tools
        all_tools_map = {
            # Orchestrator tools
            "start_new_project_tool": start_new_project_tool,
            "record_baseline_field_tool": record_baseline_field_tool,
            "update_project_baseline_tool": update_project_baseline_tool,
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
            "generate_full_report_tool": generate_full_report_tool,
            "intake_step": intake_step,
            # Estimation method tools
            "generate_cocomo_ii_estimation": generate_cocomo_ii_estimation,
            "generate_storypoints_estimation": generate_storypoints_estimation,
            "generate_fpa_estimation": generate_fpa_estimation,
            "generate_analogous_estimation": generate_analogous_estimation,
            "generate_parametric_estimation": generate_parametric_estimation,
            "generate_bottom_up_estimation": generate_bottom_up_estimation,
        }
        
        # Register functions on user_proxy for execution
        user_proxy.register_function(function_map=all_tools_map)
        
        # ALSO register functions on each agent that calls them
        # This ensures the GroupChatManager can route function calls correctly
        for agent in [conversational_agent, interpreter_agent, method_selector_agent]:
            agent.register_function(function_map=all_tools_map)
        
        # ============================================================================
        # 3. History Truncation
        # ============================================================================
        MAX_HISTORY = 6
        truncated_history = (request.history or [])[-MAX_HISTORY:]
        
        # ============================================================================
        # 4. Custom Speaker Selection for Proper Handoff
        # ============================================================================
        # This ensures:
        # - ConversationalAgent handles intake (NEW → EXPANSION_CONFIRMED)
        # - MethodSelectorAgent only speaks after EXPANSION_CONFIRMED
        # - Proper handoff when ConversationalAgent calls evaluate_methods_tool
        
        def custom_speaker_selection(last_speaker, groupchat):
            """
            Custom speaker selection to enforce the intake → selection handoff.
            
            Rules:
            1. If last speaker was User, ConversationalAgent speaks next (handles user input)
            2. If ConversationalAgent just called evaluate_methods_tool, MethodSelectorAgent speaks
            3. If MethodSelectorAgent finished (WAITING FOR USER INPUT), stop
            4. Otherwise, let ConversationalAgent continue
            """
            messages = groupchat.messages
            if not messages:
                return conversational_agent
            
            last_msg = messages[-1] if messages else {}
            last_content = last_msg.get("content", "")
            last_name = last_msg.get("name", "")
            
            # If we hit termination signal, stop
            if "WAITING FOR USER INPUT" in last_content:
                return None
            
            # If User just spoke, ConversationalAgent handles it
            if last_speaker == user_proxy or last_name == "User":
                return conversational_agent
            
            # If ConversationalAgent just called evaluate_methods_tool (status changed to METHOD_SELECTED)
            # OR if the message mentions "Analyzing which estimation methods", hand off to MethodSelectorAgent
            if last_speaker == conversational_agent or last_name == "ConversationalAgent":
                # Check if the tool output indicates methods were evaluated
                if "METHOD_SELECTED" in last_content or "selection" in last_content.lower():
                    return method_selector_agent
                # Check if ConversationalAgent is signaling handoff
                if "analyzing" in last_content.lower() and "method" in last_content.lower():
                    return method_selector_agent
                # Otherwise, ConversationalAgent continues
                return conversational_agent
            
            # If InterpreterAgent spoke, go back to ConversationalAgent
            if last_speaker == interpreter_agent or last_name == "InterpreterAgent":
                return conversational_agent
            
            # If MethodSelectorAgent spoke, it should be done (termination)
            if last_speaker == method_selector_agent or last_name == "MethodSelectorAgent":
                return None  # Stop - waiting for user to select method via UI
            
            # Default: ConversationalAgent
            return conversational_agent
        
        # Create GroupChat with custom speaker selection
        groupchat = autogen.GroupChat(
            agents=agents_list,
            messages=truncated_history,
            max_round=12,
            speaker_selection_method=custom_speaker_selection,
            allow_repeat_speaker=True,  # Allow ConversationalAgent to speak multiple times during intake
        )
        
        manager = autogen.GroupChatManager(
            groupchat=groupchat,
            llm_config=cheap_llm_config,  # Manager uses cheap model for routing
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
            # Use model_dump for Pydantic v2, fall back to dict for v1
            "baseline_inputs": (
                request.baseline_inputs.model_dump()
                if hasattr(request.baseline_inputs, "model_dump")
                else request.baseline_inputs.dict()
            ),
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
            
            # Description is handled separately, not part of BaselineInputs schema
            # It's stored in ProjectContext.user_description via submit_description call
            
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


# =============================================================================
# /run-estimation - Agent-Driven Estimation Endpoint
# =============================================================================

@app.post("/run-estimation")
async def run_estimation(request: RunEstimationRequest):
    """
    Run estimation using the selected method's agent.
    
    This endpoint:
    1. Loads ProjectContext and extracts relevant data
    2. If user provided inputs, saves them to context first
    3. Spawns the appropriate estimation agent with INJECTED context (no tool call needed)
    4. Agent validates inputs and either:
       - Calls estimation tool and returns result
       - Reports missing inputs
    5. Returns estimation result or missing inputs list
    
    Response:
    - status: "ESTIMATION_COMPLETE" | "INPUTS_REQUIRED" | "ERROR"
    - estimate: {...} if complete
    - missing_inputs: [...] if inputs required
    """
    from workflow.controller import WorkflowOrchestrator
    from workflow.tracing import get_trace_store, TraceEvent, TraceEventType
    import time as time_module
    
    session_id = request.session_id
    method_id = request.method_id
    user_inputs = request.inputs or {}
    
    store = get_trace_store()
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.AGENT_CALL,
        input_data={"method_id": method_id, "inputs": user_inputs},
        metadata={"endpoint": "/run-estimation"}
    ))
    
    try:
        orchestrator = WorkflowOrchestrator()
        
        # Load existing context
        try:
            context = orchestrator.load_context(session_id)
            print(f"[run-estimation] Loaded context for {session_id}, status: {context.status}")
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
        
        # Map UI method to backend method
        backend_method = _map_ui_method_to_backend(method_id)
        if not backend_method:
            raise HTTPException(status_code=400, detail=f"Unknown method: {method_id}")
        
        print(f"[run-estimation] Method: {method_id} -> {backend_method}")
        
        # =====================================================================
        # Step 1: Save user-provided inputs to context (Optimization B)
        # =====================================================================
        if user_inputs:
            print(f"[run-estimation] Applying user inputs: {user_inputs}")
            _apply_input_overrides(orchestrator, context, backend_method, user_inputs)
            orchestrator.repository.save(context)
            context = orchestrator.load_context(session_id)  # Reload
        
        # =====================================================================
        # Step 2: Extract context data for injection (Optimization A)
        # =====================================================================
        injected_context = _extract_context_for_agent(context, backend_method)
        print(f"[run-estimation] Injected context: {injected_context}")
        
        # =====================================================================
        # Step 3: Check if we have required inputs
        # =====================================================================
        missing_inputs = _check_required_inputs(backend_method, injected_context)
        
        if missing_inputs:
            print(f"[run-estimation] Missing inputs: {missing_inputs}")
            # Report missing inputs - don't run agent
            orchestrator.report_missing_inputs(session_id, backend_method, missing_inputs)
            return {
                "status": "INPUTS_REQUIRED",
                "method": method_id,
                "missing_inputs": missing_inputs,
                "available_data": injected_context
            }
        
        # =====================================================================
        # Step 4: Run estimation agent with injected context
        # =====================================================================
        print(f"[run-estimation] All inputs available, running {backend_method} estimation...")
        
        estimate_result = await _run_estimation_agent(
            session_id=session_id,
            backend_method=backend_method,
            injected_context=injected_context,
            orchestrator=orchestrator
        )
        
        if estimate_result.get("status") == "error":
            return {
                "status": "ERROR",
                "method": method_id,
                "error": estimate_result.get("error", "Unknown error")
            }
        
        # =====================================================================
        # Step 5: Save estimate to context
        # =====================================================================
        if estimate_result.get("estimate"):
            orchestrator.attach_estimate(session_id, estimate_result["estimate"], mark_complete=True)
            print(f"[run-estimation] Estimate saved, status updated to ESTIMATION_COMPLETE")
        
        return {
            "status": "ESTIMATION_COMPLETE",
            "method": method_id,
            "estimate": estimate_result.get("estimate"),
            "summary": estimate_result.get("summary")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[run-estimation] Error: {e}")
        import traceback
        traceback.print_exc()
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            output_data={"error": str(e), "error_type": type(e).__name__}
        ))
        raise HTTPException(status_code=500, detail=f"Estimation failed: {str(e)}")


def _extract_context_for_agent(context, backend_method: str) -> Dict[str, Any]:
    """
    Extract relevant data from ProjectContext for injection into agent prompt.
    This eliminates the need for the agent to call get_project_context_tool.
    """
    extracted = {
        "project_id": context.project_id,
        "project_type": context.baseline.project_type if context.baseline else None,
        "complexity": context.baseline.complexity if context.baseline else None,
        "team_size": context.baseline.team_pref if context.baseline else None,
        "region": context.baseline.region if context.baseline else None,
        "tech_stack": context.baseline.tech_stack if context.baseline else None,
    }
    
    # Extract from parsed_context (ParsedContextV1 schema)
    parsed = context.parsed_context
    if parsed:
        # Size metrics (field is 'size', not 'size_metrics')
        if hasattr(parsed, 'size') and parsed.size:
            extracted["ksloc"] = parsed.size.ksloc
            extracted["function_points"] = parsed.size.ufp  # UFP = unadjusted function points
            extracted["story_points"] = parsed.size.story_points
        
        # Agile metrics (field is 'agile', not 'agile_metrics')
        if hasattr(parsed, 'agile') and parsed.agile:
            extracted["velocity"] = parsed.agile.velocity_sp_per_sprint
            extracted["sprint_days"] = parsed.agile.sprint_days
        
        # Team info
        if hasattr(parsed, 'team') and parsed.team:
            extracted["team_pref_size"] = parsed.team.pref_size
        
        # Platforms
        if hasattr(parsed, 'platforms') and parsed.platforms:
            extracted["platforms"] = parsed.platforms
    
    # Extract from method_coeffs if available
    # Handle both MethodCoefficients model and plain dict
    if context.method_coeffs:
        coeffs = context.method_coeffs
        
        # Check if coeffs is a dict or a Pydantic model
        if isinstance(coeffs, dict):
            # Handle dict format
            if backend_method == "cocomo2" and "cocomo2" in coeffs:
                cocomo_data = coeffs.get("cocomo2", {})
                if isinstance(cocomo_data, dict):
                    extracted["cocomo_ksloc"] = cocomo_data.get("ksloc")
                    extracted["cocomo_scale_factors"] = cocomo_data.get("scale_factors")
                    extracted["cocomo_cost_drivers"] = cocomo_data.get("cost_drivers")
            elif backend_method == "fpa" and "fpa" in coeffs:
                fpa_data = coeffs.get("fpa", {})
                if isinstance(fpa_data, dict):
                    extracted["fpa_ufp"] = fpa_data.get("unadjusted_fp")
                    extracted["fpa_gsc"] = fpa_data.get("gsc_ratings")
            elif backend_method == "story_points" and "agile_sp" in coeffs:
                sp_data = coeffs.get("agile_sp", {})
                if isinstance(sp_data, dict):
                    extracted["sp_total"] = sp_data.get("total_story_points")
                    extracted["sp_velocity"] = sp_data.get("velocity")
                    extracted["sp_sprint_weeks"] = sp_data.get("sprint_length_weeks")
        else:
            # Handle Pydantic model format
            if backend_method == "cocomo2" and hasattr(coeffs, 'cocomo2') and coeffs.cocomo2:
                extracted["cocomo_ksloc"] = coeffs.cocomo2.ksloc
                extracted["cocomo_scale_factors"] = coeffs.cocomo2.scale_factors
                extracted["cocomo_cost_drivers"] = coeffs.cocomo2.cost_drivers
            elif backend_method == "fpa" and hasattr(coeffs, 'fpa') and coeffs.fpa:
                extracted["fpa_ufp"] = coeffs.fpa.unadjusted_fp
                extracted["fpa_gsc"] = coeffs.fpa.gsc_ratings
            elif backend_method == "story_points" and hasattr(coeffs, 'agile_sp') and coeffs.agile_sp:
                extracted["sp_total"] = coeffs.agile_sp.total_story_points
                extracted["sp_velocity"] = coeffs.agile_sp.velocity
                extracted["sp_sprint_weeks"] = coeffs.agile_sp.sprint_length_weeks
    
    # Extract from expansion
    expansion = context.expansion_confirmed or context.expansion_draft
    if expansion:
        extracted["features_list"] = [f.name for f in expansion.features] if expansion.features else []
        extracted["platforms"] = expansion.platforms
    
    # Map complexity to numeric factor
    complexity_map = {"low": 0.8, "medium": 1.0, "high": 1.2, "very high": 1.5, "very_high": 1.5}
    complexity_str = (extracted.get("complexity") or "medium").lower()
    extracted["complexity_factor"] = complexity_map.get(complexity_str, 1.0)
    
    return extracted


def _check_required_inputs(backend_method: str, context_data: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Check if all required inputs for a method are available.
    Returns list of missing inputs with prompts.
    """
    missing = []
    
    # Helper to check if value exists and is not None/0
    def is_missing(key):
        val = context_data.get(key)
        return val is None or val == 0 or val == ""
    
    if backend_method == "cocomo2":
        # KSLOC is critical - check multiple sources
        ksloc = context_data.get("cocomo_ksloc") or context_data.get("ksloc")
        if not ksloc or ksloc == 0:
            # Try to infer from LOC
            loc = context_data.get("loc")
            if loc and loc > 0:
                context_data["ksloc"] = loc / 1000  # Auto-convert
            else:
                missing.append({
                    "field": "ksloc",
                    "prompt": "Estimated size in thousands of lines of code (KSLOC). For reference: small project ~5-10 KSLOC, medium ~20-50 KSLOC, large ~100+ KSLOC.",
                    "priority": "critical"
                })
    
    elif backend_method == "fpa":
        ufp = context_data.get("fpa_ufp") or context_data.get("function_points")
        if not ufp or ufp == 0:
            missing.append({
                "field": "unadjusted_function_points",
                "prompt": "Unadjusted Function Points (UFP). Estimate based on: External Inputs, External Outputs, External Inquiries, Internal Logical Files, External Interface Files.",
                "priority": "critical"
            })
    
    elif backend_method == "story_points":
        sp = context_data.get("sp_total") or context_data.get("story_points")
        velocity = context_data.get("sp_velocity") or context_data.get("velocity")
        
        if not sp or sp == 0:
            missing.append({
                "field": "total_story_points",
                "prompt": "Total estimated story points for the project. Typical range: 50-500 for medium projects.",
                "priority": "critical"
            })
        if not velocity or velocity == 0:
            missing.append({
                "field": "velocity",
                "prompt": "Team velocity in story points per sprint. Typical range: 15-40 for a team of 5-8.",
                "priority": "critical"
            })
    
    elif backend_method == "analogous":
        # Analogous can work with baseline data, but historical projects help
        # For now, we'll allow it to proceed with defaults
        pass
    
    elif backend_method == "parametric":
        # Parametric needs size metric
        if is_missing("ksloc") and is_missing("function_points") and is_missing("story_points"):
            missing.append({
                "field": "size_metric",
                "prompt": "A size metric is required: KSLOC, Function Points, or Story Points.",
                "priority": "critical"
            })
    
    elif backend_method == "bottomup":
        # Bottom-up can work with features list
        features = context_data.get("features_list") or []
        if len(features) == 0:
            missing.append({
                "field": "work_packages",
                "prompt": "List of work packages or features with effort estimates. Provide as comma-separated list.",
                "priority": "high"
            })
    
    return missing


async def _run_estimation_agent(
    session_id: str,
    backend_method: str,
    injected_context: Dict[str, Any],
    orchestrator
) -> Dict[str, Any]:
    """
    Run the estimation using deterministic tool calls (no LLM agent needed).
    
    Since we've already validated inputs, we can directly call the estimation tools
    without spawning an LLM agent. This is faster and more reliable.
    """
    try:
        # Import estimation tools
        from tools.cocomo_tools import generate_cocomo_ii_estimation
        from tools.fpa_tools import generate_fpa_estimation
        from tools.storypoints_tools import generate_storypoints_estimation
        from tools.analogous_tools import generate_analogous_estimation
        from tools.parametric_tools import generate_parametric_estimation
        from tools.bottomup_tools import generate_bottom_up_estimation
        
        estimate = None
        summary = ""
        
        # Get common parameters
        project_name = f"Project {session_id[:8]}"
        complexity_factor = injected_context.get("complexity_factor", 1.0)
        team_size = injected_context.get("team_size") or injected_context.get("team_pref_size") or 5
        
        if backend_method == "cocomo2":
            ksloc = (
                injected_context.get("cocomo_ksloc") or 
                injected_context.get("ksloc") or 
                (injected_context.get("loc", 0) / 1000 if injected_context.get("loc") else 10)
            )
            
            # Get scale factors and cost drivers from context or use defaults
            scale_factors = injected_context.get("cocomo_scale_factors") or {
                "prec": "nominal", "flex": "nominal", "resl": "nominal", 
                "team": "nominal", "pmat": "nominal"
            }
            cost_drivers = injected_context.get("cocomo_cost_drivers") or {
                "rely": "nominal", "data": "nominal", "cplx": "nominal"
            }
            
            # Adjust cost drivers based on complexity
            if complexity_factor > 1.1:
                cost_drivers["cplx"] = "high"
            elif complexity_factor > 1.3:
                cost_drivers["cplx"] = "very_high"
            
            estimate = generate_cocomo_ii_estimation(
                project_name=project_name,
                ksloc=float(ksloc),
                scale_factor_ratings=scale_factors,
                cost_driver_ratings=cost_drivers,
                hourly_rate=100.0
            )
            summary = f"COCOMO II estimation based on {ksloc:.1f} KSLOC"
            
        elif backend_method == "fpa":
            ufp = (
                injected_context.get("fpa_ufp") or 
                injected_context.get("function_points") or 
                100  # Default
            )
            
            estimate = generate_fpa_estimation(
                project_name=project_name,
                unadjusted_fp=int(ufp),
                vaf=1.0 + (complexity_factor - 1.0) * 0.35,  # Map complexity to VAF
                hourly_rate=100.0
            )
            summary = f"FPA estimation based on {ufp} unadjusted function points"
            
        elif backend_method == "story_points":
            total_sp = (
                injected_context.get("sp_total") or 
                injected_context.get("story_points") or 
                100  # Default
            )
            velocity = (
                injected_context.get("sp_velocity") or 
                injected_context.get("velocity") or 
                25  # Default
            )
            sprint_weeks = injected_context.get("sp_sprint_weeks") or 2
            
            estimate = generate_storypoints_estimation(
                project_name=project_name,
                total_story_points=int(total_sp),
                velocity=int(velocity),
                sprint_length_weeks=int(sprint_weeks),
                hourly_rate=100.0
            )
            summary = f"Story Points estimation: {total_sp} SP at velocity {velocity}/sprint"
            
        elif backend_method == "analogous":
            # Use complexity and project type to generate reference projects
            base_cost = 100000 * complexity_factor
            base_duration = 6 * complexity_factor
            
            estimate = generate_analogous_estimation(
                project_name=project_name,
                reference_projects=[
                    {"name": "Similar Project A", "cost": base_cost * 0.9, "duration_months": base_duration * 0.9, "similarity": 0.85},
                    {"name": "Similar Project B", "cost": base_cost * 1.1, "duration_months": base_duration * 1.1, "similarity": 0.75},
                ],
                target_complexity=complexity_factor,
                hourly_rate=100.0
            )
            summary = f"Analogous estimation based on similar projects"
            
        elif backend_method == "parametric":
            # Use available size metric
            size = (
                injected_context.get("ksloc") or 
                injected_context.get("function_points", 0) / 10 or  # Rough FP to KSLOC
                injected_context.get("story_points", 0) / 5 or  # Rough SP to KSLOC
                10
            )
            
            estimate = generate_parametric_estimation(
                project_name=project_name,
                size_metric=float(size),
                size_type="ksloc",
                complexity_factor=complexity_factor,
                team_size=int(team_size),
                hourly_rate=100.0
            )
            summary = f"Parametric estimation based on size metric"
            
        elif backend_method == "bottomup":
            # Generate work packages from features or defaults
            features = injected_context.get("features_list") or ["Core Functionality"]
            work_packages = []
            
            base_hours = 160 * complexity_factor  # Base hours per feature
            for i, feature in enumerate(features[:10]):  # Max 10 features
                work_packages.append({
                    "name": feature if isinstance(feature, str) else f"Feature {i+1}",
                    "effort_hours": base_hours * (1 + i * 0.1),  # Slight variation
                    "hourly_rate": 100.0
                })
            
            # Add standard phases if few features
            if len(work_packages) < 3:
                work_packages = [
                    {"name": "Requirements & Design", "effort_hours": 200 * complexity_factor, "hourly_rate": 100.0},
                    {"name": "Development", "effort_hours": 600 * complexity_factor, "hourly_rate": 100.0},
                    {"name": "Testing & QA", "effort_hours": 200 * complexity_factor, "hourly_rate": 100.0},
                    {"name": "Deployment & Documentation", "effort_hours": 100 * complexity_factor, "hourly_rate": 100.0},
                ]
            
            estimate = generate_bottom_up_estimation(
                project_name=project_name,
                work_packages=work_packages
            )
            summary = f"Bottom-up estimation with {len(work_packages)} work packages"
        
        if estimate:
            # Convert to dict if it's a Pydantic model
            if hasattr(estimate, "model_dump"):
                estimate_dict = estimate.model_dump()
            elif hasattr(estimate, "dict"):
                estimate_dict = estimate.dict()
            else:
                estimate_dict = estimate
            
            return {
                "status": "success",
                "estimate": estimate_dict,
                "summary": summary
            }
        else:
            return {
                "status": "error",
                "error": f"No estimation generated for method {backend_method}"
            }
            
    except Exception as e:
        print(f"[_run_estimation_agent] Error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "error": str(e)
        }


def _map_ui_method_to_backend(method_id: str) -> Optional[str]:
    """Map frontend method IDs to backend identifiers."""
    method_id_lower = method_id.strip().lower()
    mapping = {
        "cocomo": "cocomo2",
        "cocomo2": "cocomo2",
        "function-points": "fpa",
        "function_points": "fpa",
        "story-points": "story_points",
        "story_points": "story_points",
        "analogous": "analogous",
        "parametric": "parametric",
        "bottom-up": "bottomup",
        "bottomup": "bottomup",
    }
    return mapping.get(method_id_lower)


def _apply_input_overrides(
    orchestrator,
    context,
    backend_method: str,
    overrides: Dict[str, Any],
):
    """
    Apply user-provided or inferred inputs to method-specific coefficients.
    This keeps get_method_requirements() in sync by updating MethodCoefficients
    and recomputing missing_by_method.
    """
    from workflow.method_coefficients import MethodCoefficients

    project_id = context.project_id

    # Ensure method_coeffs exists and is a proper model
    if not getattr(context, "method_coeffs", None) or isinstance(context.method_coeffs, dict):
        context.method_coeffs = MethodCoefficients()

    coeffs = context.method_coeffs

    # Normalize keys to lowercase for easier matching
    normalized = {k.lower(): v for k, v in overrides.items()}

    if backend_method == "cocomo2":
        target = coeffs.cocomo2
        # Size value (KSLOC or FP)
        size_val = normalized.get("size_value", normalized.get("ksloc"))
        if size_val is not None:
            try:
                target.size_value = float(size_val)
            except (TypeError, ValueError):
                pass
        # Mode (organic, semi_detached, embedded)
        if "mode" in normalized:
            mode_val = str(normalized["mode"]).lower().replace("-", "_")
            if mode_val in {"organic", "semi_detached", "embedded"}:
                target.mode = mode_val  # type: ignore[assignment]

    elif backend_method == "fpa":
        target = coeffs.fpa
        if "ufp" in normalized:
            try:
                target.ufp = int(float(normalized["ufp"]))
            except (TypeError, ValueError):
                pass
        if "vaf" in normalized:
            try:
                target.vaf = float(normalized["vaf"])
            except (TypeError, ValueError):
                pass

    elif backend_method == "analogous":
        target = coeffs.analogous
        if "tshirt_size" in normalized:
            ts = str(normalized["tshirt_size"]).lower()
            if ts in {"xs", "s", "m", "l", "xl"}:
                target.tshirt_size = ts  # type: ignore[assignment]

    elif backend_method == "story_points":
        target = coeffs.story_points
        if "team_velocity" in normalized:
            try:
                target.team_velocity = int(float(normalized["team_velocity"]))
            except (TypeError, ValueError):
                pass

    # Persist changes and recompute missing_by_method
    context = orchestrator.repository.save(context)
    context = orchestrator.compute_missing_by_method(project_id)
    return context


def _try_infer_missing_inputs(
    backend_method: str,
    context,
    missing_fields: List[str],
    inference_service,
) -> Dict[str, Any]:
    """
    Attempt to infer missing inputs for a specific method using the existing
    InferenceService and inferred_fields on the context.
    """
    inferred: Dict[str, Any] = {}

    baseline = context.baseline.model_dump(exclude_none=True)
    description = context.user_description or ""

    # COCOMO: infer size_value (KSLOC) if missing
    if backend_method == "cocomo2" and "size_value" in missing_fields:
        # Prefer existing inferred ksloc if present
        ksloc_data = (context.inferred_fields or {}).get("ksloc")
        if isinstance(ksloc_data, dict):
            k_val = ksloc_data.get("value")
            conf = ksloc_data.get("confidence", 0.5)
            if k_val is not None and conf >= 0.6:
                inferred["size_value"] = k_val
        # If not available or low confidence, call inference service directly
        if "size_value" not in inferred:
            features = []
            if context.expansion_confirmed:
                features = [
                    f.model_dump() if hasattr(f, "model_dump") else f
                    for f in (context.expansion_confirmed.features or [])
                ]
            result = inference_service.infer_ksloc(
                complexity=baseline.get("complexity", "medium"),
                feature_count=len(features),
                tech_stack=baseline.get("tech_stack", ""),
                project_type=baseline.get("project_type", "software development"),
                description=description,
            )
            if result.confidence >= 0.6:
                inferred["size_value"] = result.value

    # FPA: infer UFP if missing
    if backend_method == "fpa" and "ufp" in missing_fields:
        features = []
        if context.expansion_confirmed:
            features = context.expansion_confirmed.features or []
        result = inference_service.infer_function_points(
            project_type=baseline.get("project_type", "software development"),
            feature_count=len(features),
            complexity=baseline.get("complexity", "medium"),
            features_description=description,
        )
        if result.confidence >= 0.6:
            inferred["ufp"] = result.value

    # Story Points, Analogous, Parametric could be extended here as needed.
    return inferred


def _build_prompts_for_missing(backend_method: str, missing_fields: List[str]) -> List[Dict[str, Any]]:
    """
    Build human-friendly prompts for missing method-specific inputs.
    """
    prompts: List[Dict[str, Any]] = []

    for field_name in missing_fields:
        if backend_method == "cocomo2" and field_name == "size_value":
            prompt = "Estimated KSLOC (thousands of lines of code) for this project."
        elif backend_method == "cocomo2" and field_name == "mode":
            prompt = "COCOMO development mode (organic, semi_detached, or embedded)."
        elif backend_method == "fpa" and field_name == "ufp":
            prompt = "Approximate total unadjusted function points (UFP) for this system."
        elif backend_method == "fpa" and field_name == "vaf":
            prompt = "Value Adjustment Factor (VAF) between 0.65 and 1.35, if known."
        elif backend_method == "analogous" and field_name == "tshirt_size":
            prompt = "Approximate T-shirt size (XS, S, M, L, XL) representing project scale."
        elif backend_method == "story_points" and field_name == "team_velocity":
            prompt = "What is your team's velocity in story points per sprint?"
        else:
            prompt = f"Provide a value for '{field_name}' for the selected estimation method."

        prompts.append(
            {
                "field": field_name,
                "prompt": prompt,
                "priority": "critical",
            }
        )

    return prompts


def _run_estimation_for_method(
    backend_method: str,
    context,
    requirements: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Execute a specific estimator deterministically for the chosen method.
    Currently supports COCOMO II; other methods can be added over time.
    """
    if backend_method == "cocomo2":
        from tools.cocomo_tools import generate_cocomo_ii_estimation

        known = requirements.get("known") or {}
        size_value = known.get("size_value")
        if size_value is None:
            raise HTTPException(status_code=400, detail="Missing size_value (KSLOC) for COCOMO II estimation.")

        inferred_fields = getattr(context, "inferred_fields", {}) or {}
        cost_drivers = inferred_fields.get("cost_drivers") or {}

        output = generate_cocomo_ii_estimation(
            project_name=context.baseline.project_type or "Software project",
            ksloc=float(size_value),
            cost_driver_ratings=cost_drivers,
        )
        est = output.model_dump()
        # Provide flattened helpers for downstream report aggregation
        est.setdefault("cost", output.cost_range.likely)
        est.setdefault("duration", output.duration_range.likely)
        return est

    # For now, other methods are not yet wired into automatic back-end execution.
    raise HTTPException(
        status_code=400,
        detail=f"Automatic estimation for method '{backend_method}' is not yet supported on the backend.",
    )


@app.post("/select-method")
async def select_method_endpoint(request: SelectMethodRequest):
    """
    Handle user selection of a specific estimation method (from Method Cards).
    1. Applies any user-provided overrides (e.g., KSLOC entered by the user).
    2. Checks method-specific requirements via WorkflowOrchestrator.
    3. If inputs are missing, attempts targeted inference for this method.
    4. If still missing, returns INPUTS_REQUIRED with prompts for the UI.
    5. If ready, runs the estimator and returns ESTIMATION_COMPLETE with a report.
    """
    from workflow.controller import WorkflowOrchestrator
    from workflow.inference_service import InferenceService

    project_id = request.session_id
    backend_method = _map_ui_method_to_backend(request.method_id)
    if not backend_method:
        raise HTTPException(status_code=400, detail=f"Unknown method_id: {request.method_id}")

    orchestrator = WorkflowOrchestrator()
    try:
        context = orchestrator.load_context(project_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session not found")

    # 1. Apply any user-provided overrides
    if request.input_overrides:
        context = _apply_input_overrides(
            orchestrator,
            context,
            backend_method,
            request.input_overrides,
        )

    # 2. Get requirements for this method
    requirements = orchestrator.get_method_requirements(project_id, backend_method)
    missing_fields = list(requirements.get("missing") or [])

    # 3. Attempt targeted inference for missing fields (Branch B)
    if missing_fields:
        inference_service = InferenceService()
        inferred_updates = _try_infer_missing_inputs(
            backend_method=backend_method,
            context=context,
            missing_fields=missing_fields,
            inference_service=inference_service,
        )
        if inferred_updates:
            context = _apply_input_overrides(
                orchestrator,
                context,
                backend_method,
                inferred_updates,
            )
            # Re-check requirements after inference
            requirements = orchestrator.get_method_requirements(project_id, backend_method)
            missing_fields = list(requirements.get("missing") or [])

    # 4. If we still lack data, ask the user via structured prompts
    if missing_fields:
        prompts = _build_prompts_for_missing(backend_method, missing_fields)
        # Log missing inputs for traceability
        orchestrator.report_missing_inputs(project_id, backend_method, prompts)
        return {
            "status": "INPUTS_REQUIRED",
            "method": request.method_id,
            "missing_inputs": prompts,
        }

    # 5. Ready to estimate (Branch A)
    try:
        estimate_result = _run_estimation_for_method(
            backend_method=backend_method,
            context=context,
            requirements=requirements,
        )
    except HTTPException:
        # Re-raise HTTP exceptions directly
        raise
    except Exception as e:
        print(f"Estimation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Estimation failed: {str(e)}")

    # Attach estimate and mark workflow as complete
    context = orchestrator.attach_estimate(
        project_id=project_id,
        estimate=estimate_result,
        mark_complete=True,
    )

    # Generate full report for the selected method so UI can render immediately
    estimation_config = {
        "includeRisk": True,
        "includeContingency": True,
        "includeOverhead": True,
        "includeProfit": True,
        "currency": "EUR",
        "accuracy": "high",
    }
    report = orchestrator.generate_full_report(
        project_id=project_id,
        estimation_config=estimation_config,
        selected_method=request.method_id,
    )

    # Return report as dict for JSON response
    report_payload = (
        report.model_dump(mode="json") if hasattr(report, "model_dump") else report.dict()
    )

    return {
        "status": "ESTIMATION_COMPLETE",
        "method": request.method_id,
        "report": report_payload,
    }

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
