import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio

from workflow.fsm import FSMWorkflow
from agents.fsm_agents import IntakeAgent, ReasoningAgent
from core.workers import EstimationEngine, MethodScoring
from agent_framework.openai import OpenAIChatClient
from dotenv import load_dotenv

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"
    project_id: str = "default_project"
    history: list = []
    baseline_inputs: dict = {}

# Dependency to get the workflow instance
# This ensures initialization happens AFTER app startup and env var loading
def get_workflow():
    # Explicitly load .env to be sure
    load_dotenv()
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL")
    
    if api_key:
        print(f"DEBUG: Using OPENROUTER_API_KEY")
        if not base_url:
            base_url = "https://openrouter.ai/api/v1"
            print(f"DEBUG: Setting default OpenRouter base_url: {base_url}")
    else:
        api_key = os.getenv("OPENAI_API_KEY")
        print(f"DEBUG: Using OPENAI_API_KEY: {bool(api_key)}")
    
    if not api_key:
        print("DEBUG: Available Env Vars:", [k for k in os.environ.keys() if "KEY" in k or "SECRET" in k])
        # Fallback for Azure or other configs if needed, or let the client raise
        pass
        
    model_client = OpenAIChatClient(model_id="gpt-4o-mini", api_key=api_key, base_url=base_url)
    intake_agent = IntakeAgent(model_client)
    scoring_worker = MethodScoring()
    reasoning_agent = ReasoningAgent(model_client, scoring_worker)
    est_engine = EstimationEngine()
    return FSMWorkflow(intake_agent, reasoning_agent, est_engine).build()

@router.post("/send")
async def send_message(request: ChatRequest):
    """
    Async endpoint to handle user messages via the FSM Workflow.
    Returns a single JSON response for compatibility with the existing frontend.
    """
    workflow = get_workflow()
    
    # Accumulate response content
    final_response_text = ""
    
    try:
        # Run the workflow
        # The workflow expects a string input (user message)
        result = await workflow.run(request.message)
        
        # Extract the final output
        # Sequential workflow returns a list of outputs.
        # For SequentialBuilder, the output is often the list of messages from the conversation.
        # So outputs might be [[msg1, msg2, msg3]]
        outputs = result.get_outputs()
        
        final_response_text = "No response generated."
        
        if outputs:
            last_output = outputs[-1]
            # Check if the output itself is a list (conversation history)
            if isinstance(last_output, list) and len(last_output) > 0:
                last_message = last_output[-1]
                if hasattr(last_message, 'text'):
                    final_response_text = last_message.text
                else:
                    final_response_text = str(last_message)
            # Check if the output is a single message object
            elif hasattr(last_output, 'text'):
                final_response_text = last_output.text
            else:
                final_response_text = str(last_output)
        
        # Simple heuristic to determine if we are done (for the UI state)
        is_ready = "recommend" in final_response_text.lower() or "estimation" in final_response_text.lower()
        
        return {
            "response": final_response_text,
            "is_ready": is_ready,
            "recommended_methods": ["fpa", "cocomo"] if is_ready else [],
            "summary_confirmed": False
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
