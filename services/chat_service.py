"""
services/chat_service.py
========================

Chat orchestration service.
Contains the business logic for the /chat endpoint.
"""

import json
import re
import time
from typing import Any, Dict, List, Optional

from api.schemas import ChatRequest, ChatResponse
from services.agent_factory import AgentFactory
from workflow.controller import WorkflowOrchestrator
from workflow.tracing import get_trace_store, TraceEvent, TraceEventType


class ChatService:
    """
    Service class for handling chat interactions.
    Orchestrates agent conversations and manages chat state.
    """
    
    MAX_HISTORY = 6
    
    def __init__(
        self,
        orchestrator: Optional[WorkflowOrchestrator] = None,
        agent_factory: Optional[AgentFactory] = None
    ):
        """
        Initialize the chat service.
        
        Args:
            orchestrator: WorkflowOrchestrator instance
            agent_factory: AgentFactory instance
        """
        self.orchestrator = orchestrator or WorkflowOrchestrator()
        self.agent_factory = agent_factory or AgentFactory()
        self.trace_store = get_trace_store()
    
    def generate_fallback_response(
        self,
        message: str,
        history: List[Dict[str, str]] = None
    ) -> ChatResponse:
        """
        Generate intelligent responses without AI when OpenAI key is unavailable.
        
        Args:
            message: User message
            history: Conversation history
            
        Returns:
            ChatResponse with fallback content
        """
        message_lower = message.lower()
        history = history or []
        conversation_depth = len(history)
        
        # Detect e-commerce/specific features
        if any(word in message_lower for word in ['e-commerce', 'ecommerce', 'shop', 'cart', 'checkout', 'payment']):
            return ChatResponse(
                response=(
                    "I understand you're building an e-commerce platform. Based on this, I can recommend:\n\n"
                    "**Recommended Methods:**\n"
                    "1. **Function Point Analysis** - Great for e-commerce with many user interactions\n"
                    "2. **COCOMO II** - Good for estimating development effort\n\n"
                    "Would you like to proceed with method selection?\n\n"
                    "[WAITING FOR USER INPUT]"
                ),
                is_ready=False,
                recommended_methods=["function-points", "cocomo"]
            )
        
        # Default response based on conversation depth
        if conversation_depth < 2:
            return ChatResponse(
                response=(
                    "Thank you for your message! To provide accurate cost estimation, "
                    "I need a few more details about your project.\n\n"
                    "Could you tell me:\n"
                    "1. What type of application is this? (web, mobile, desktop, etc.)\n"
                    "2. What's the expected complexity level?\n"
                    "3. What technologies will you be using?\n\n"
                    "[WAITING FOR USER INPUT]"
                ),
                is_ready=False,
                recommended_methods=[]
            )
        else:
            return ChatResponse(
                response=(
                    "Based on the information provided, I'm ready to recommend estimation methods.\n\n"
                    "RECOMMENDATION_READY: [cocomo, function-points, story-points, analogous]\n\n"
                    "[WAITING FOR USER INPUT]"
                ),
                is_ready=True,
                recommended_methods=["cocomo", "function-points", "story-points", "analogous"]
            )
    
    def _load_context_and_baseline(
        self,
        session_id: str,
        message: str
    ) -> tuple[Optional[Dict], bool, str]:
        """
        Load project context and check baseline status.
        
        Args:
            session_id: Session identifier
            message: User message
            
        Returns:
            Tuple of (context_data, baseline_from_step1, baseline_summary)
        """
        from tools.orchestrator_tools import get_project_context_tool
        from tools.intake_tools import intake_step
        
        baseline_from_step1 = False
        baseline_summary = ""
        context = None
        
        try:
            # Try to load existing context
            context = get_project_context_tool(session_id)
            
            baseline_data = context.get("baseline", {})
            missing_baseline = context.get("missing_baseline", {})
            
            # AUTO-INTAKE: If baseline is empty/incomplete AND user message is rich
            if (not baseline_data or missing_baseline) and len(message) > 20 and "WAITING FOR USER INPUT" not in message:
                try:
                    intake_step(session_id=session_id, user_text=message)
                    context = get_project_context_tool(session_id)
                    baseline_data = context.get("baseline", {})
                    missing_baseline = context.get("missing_baseline", {})
                except Exception as e:
                    print(f"Auto-intake failed: {e}")
            
            if baseline_data and not missing_baseline:
                baseline_from_step1 = True
                baseline_summary = (
                    f"BASELINE DATA ALREADY PROVIDED (from Step 1 UI form):\n"
                    f"Session {session_id} has complete baseline information stored in ProjectContext:\n"
                    f"- Project Type: {baseline_data.get('project_type', 'N/A')}\n"
                    f"- Complexity: {baseline_data.get('complexity', 'N/A')}\n"
                    f"- Tech Stack: {baseline_data.get('tech_stack', 'N/A')}\n"
                    f"- Team Preference: {baseline_data.get('team_pref', 'N/A')} people\n"
                    f"- Region: {baseline_data.get('region', 'N/A')}\n"
                    f"- Project Duration: {baseline_data.get('project_duration', 'N/A')}\n\n"
                    f"CRITICAL INSTRUCTION: These baseline fields are COMPLETE. Do NOT ask the user for these fields again.\n"
                    f"Proceed directly with:\n"
                    f"1. Asking for project description (if not provided)\n"
                    f"2. Generating expansion draft\n"
                    f"3. Method selection and method-specific parameters\n\n"
                    f"Use the baseline data above as context when communicating with other agents."
                )
        except Exception:
            pass
        
        return context, baseline_from_step1, baseline_summary
    
    def _create_speaker_selection(
        self,
        user_proxy,
        conversational_agent,
        interpreter_agent,
        method_selector_agent
    ):
        """
        Create custom speaker selection function for proper handoff.
        
        Returns:
            Speaker selection function
        """
        def custom_speaker_selection(last_speaker, groupchat):
            """
            Custom speaker selection to enforce the intake → selection handoff.
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
            
            # If ConversationalAgent just called evaluate_methods_tool
            if last_speaker == conversational_agent or last_name == "ConversationalAgent":
                if "METHOD_SELECTED" in last_content or "selection" in last_content.lower():
                    return method_selector_agent
                if "analyzing" in last_content.lower() and "method" in last_content.lower():
                    return method_selector_agent
                return conversational_agent
            
            # If InterpreterAgent spoke, go back to ConversationalAgent
            if last_speaker == interpreter_agent or last_name == "InterpreterAgent":
                return conversational_agent
            
            # If MethodSelectorAgent spoke, it should be done
            if last_speaker == method_selector_agent or last_name == "MethodSelectorAgent":
                return None
            
            return conversational_agent
        
        return custom_speaker_selection
    
    def _extract_response(self, chat_result) -> str:
        """
        Extract the final response from chat history.
        
        Args:
            chat_result: Result from initiate_chat
            
        Returns:
            Clean response string
        """
        last_message = None
        
        for msg in reversed(chat_result.chat_history):
            role = msg.get("role")
            content = msg.get("content", "")
            
            # Skip tool messages
            if role == "tool":
                continue
            
            # Skip empty messages or messages with just tool calls
            if not content or "tool_calls" in msg:
                continue
            
            # Skip messages that look like raw JSON/dict outputs
            if content.startswith("{") or content.startswith("["):
                continue
            
            # Skip messages that contain project_id, status - tool outputs
            if "project_id" in content and ("'status':" in content or '"status":' in content):
                continue
            
            # Found a good human-readable message
            if role in ["assistant", "user"] and content:
                last_message = content
                break
        
        # Fallback: any assistant message
        if not last_message:
            for msg in reversed(chat_result.chat_history):
                if msg.get("role") == "assistant" and msg.get("content"):
                    last_message = msg["content"]
                    break
        
        # Last resort: any message with content
        if not last_message:
            for msg in reversed(chat_result.chat_history):
                if msg.get("content"):
                    last_message = msg["content"]
                    break
        
        return last_message or "I apologize, but I couldn't generate a response. Please try again."
    
    def _parse_recommendation_signal(self, response: str) -> tuple[bool, List[str]]:
        """
        Parse recommendation signal from response.
        
        Args:
            response: Response string
            
        Returns:
            Tuple of (is_ready, recommended_methods)
        """
        is_ready = "RECOMMENDATION_READY" in response
        recommended_methods = []
        
        if is_ready:
            match = re.search(r"RECOMMENDATION_READY:\s*\[(.*?)\]", response)
            if match:
                methods_str = match.group(1)
                recommended_methods = [m.strip().strip('"\'') for m in methods_str.split(",")]
        
        return is_ready, recommended_methods
    
    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """
        Process a chat request and return the response.
        
        Args:
            request: ChatRequest with session_id, message, history
            
        Returns:
            ChatResponse with response, is_ready, recommended_methods
        """
        import os
        
        session_id = request.session_id or f"chat_{int(time.time() * 1000)}"
        
        # Log user input
        self.trace_store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.USER_INPUT,
            step_name="chat",
            input_data={"message": request.message, "history_length": len(request.history)}
        ))
        
        # Load context and check baseline
        context, baseline_from_step1, baseline_summary = self._load_context_and_baseline(
            session_id, request.message
        )
        
        # Prepend system message if baseline exists
        history = list(request.history) if request.history else []
        if baseline_from_step1:
            system_context_message = {
                "role": "system",
                "content": baseline_summary,
                "name": "System"
            }
            history.insert(0, system_context_message)
        
        # Check for API key
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            response = self.generate_fallback_response(request.message, history)
            self.trace_store.add_event(session_id, TraceEvent(
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
            # Create agents
            self.agent_factory = AgentFactory(api_key)
            user_proxy, agents_list = self.agent_factory.create_chat_agents(session_id)
            
            # Get individual agents for speaker selection
            conversational_agent = agents_list[1]
            interpreter_agent = agents_list[2]
            method_selector_agent = agents_list[3]
            
            # Register tools
            tools_map = self.agent_factory.get_all_tools_map()
            self.agent_factory.register_tools_on_agents(agents_list, tools_map)
            
            # Truncate history
            truncated_history = history[-self.MAX_HISTORY:]
            
            # Create speaker selection
            speaker_selection = self._create_speaker_selection(
                user_proxy, conversational_agent, interpreter_agent, method_selector_agent
            )
            
            # Create GroupChat
            groupchat, manager = self.agent_factory.create_group_chat(
                agents_list,
                truncated_history,
                speaker_selection=speaker_selection
            )
            
            # Run chat
            chat_result = user_proxy.initiate_chat(
                manager,
                message=request.message,
                clear_history=False
            )
            
            # Debug: dump chat history
            with open("debug_chat_history.json", "w") as f:
                json.dump(chat_result.chat_history, f, indent=2, default=str)
            
            # Extract response
            response_text = self._extract_response(chat_result)
            is_ready, recommended_methods = self._parse_recommendation_signal(response_text)
            
            # Log response
            self.trace_store.add_event(session_id, TraceEvent(
                session_id=session_id,
                event_type=TraceEventType.AGENT_RESPONSE,
                agent_name="GroupChatManager",
                output_data={
                    "response": response_text[:200],
                    "is_ready": is_ready,
                    "recommended_methods": recommended_methods
                }
            ))
            
            return ChatResponse(
                response=response_text,
                is_ready=is_ready,
                recommended_methods=recommended_methods
            )
            
        except Exception as e:
            print(f"Chat error: {e}")
            import traceback
            with open("error.log", "w") as f:
                f.write(f"Chat error: {str(e)}\n")
                traceback.print_exc(file=f)
            
            return self.generate_fallback_response(request.message, history)


__all__ = ["ChatService"]

