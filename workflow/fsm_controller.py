"""
FSM Controller for Cost Estimation Workflow.

This module provides a finite state machine controller that orchestrates
the cost estimation workflow using explicit state transitions instead of
LLM-based routing.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import os

from core.contract import WorkflowState, WorkflowContext
from tools.orchestrator_tools import (
    get_project_context_tool,
    submit_user_description_tool,
    draft_expansion_tool,
    confirm_expansion_tool,
    evaluate_methods_tool,
    generate_full_report_tool,
)
from tools.intake_tools import intake_step



@dataclass
class FSMResponse:
    """Response from FSM controller."""
    response: str
    current_state: WorkflowState
    is_ready: bool = False
    recommended_methods: List[str] = None
    needs_input: bool = True
    
    def __post_init__(self):
        if self.recommended_methods is None:
            self.recommended_methods = []


class FSMController:
    """
    FSM-based workflow controller for cost estimation.
    
    State Transitions:
        INTAKE -> CONFIRMING (baseline complete)
        CONFIRMING -> RECOMMENDING (user confirms)
        CONFIRMING -> CLARIFYING (user rejects)
        CLARIFYING -> CONFIRMING (info provided)
        RECOMMENDING -> COLLECTING_METHOD_INPUTS (methods shown)
        COLLECTING_METHOD_INPUTS -> ESTIMATING (inputs collected)
        ESTIMATING -> COMPLETED (estimate done)
    """
    
    def __init__(self):
        self.api_key = os.environ.get("OPENROUTER_API_KEY")
        self.model = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o-mini")
    
    async def process_message(self, session_id: str, message: str, history: List[Dict] = None, estimation_config: Dict = None) -> FSMResponse:
        """
        Process a user message through the FSM workflow.
        """
        from tools.orchestrator_tools import update_fsm_state_tool

        # 1. Load current state from repository
        try:
            context = get_project_context_tool(session_id)
            # Use explicit FSM state from DB, default to INTAKE if missing
            current_state = WorkflowState(context.get("fsm_state", "INTAKE"))
        except Exception:
            # New session - initialize
            context = None
            current_state = WorkflowState.INTAKE
        
        print(f"FSM State: {current_state}")
        
        # 2. Route to appropriate handler based on state
        response = None
        if current_state == WorkflowState.INTAKE:
            response = await self._handle_intake(session_id, message, context)
        
        elif current_state == WorkflowState.CONFIRMING:
            response = await self._handle_confirming(session_id, message, context)
        
        elif current_state == WorkflowState.CLARIFYING:
            response = await self._handle_clarifying(session_id, message, context)
        
        elif current_state == WorkflowState.RECOMMENDING:
            response = await self._handle_recommending(session_id, message, context)
        
        elif current_state == WorkflowState.COLLECTING_METHOD_INPUTS:
            response = await self._handle_collecting_inputs(session_id, message, context, estimation_config)
        
        elif current_state == WorkflowState.ESTIMATING:
            response = await self._handle_estimating(session_id, message, context, estimation_config)
        
        elif current_state == WorkflowState.COMPLETED:
            response = await self._handle_completed(session_id, message, context)
        
        else:
            response = FSMResponse(
                response="I'm not sure how to proceed. Let's start over.",
                current_state=WorkflowState.INTAKE
            )
            
        # 3. Persist new state
        if context and response.current_state != current_state:
            # Check if we need to update asked_fields (from response metadata if we added it)
            # For now, we rely on the handler to have updated it via tool if needed, 
            # OR we pass it here. 
            # Actually, _handle_collecting_inputs might return needs_input=True
            # We should probably handle asked_fields update inside the handler or here if we pass it back.
            # Let's assume handlers don't update DB directly for state, so we do it here.
            
            update_fsm_state_tool(session_id, response.current_state.value)
            
        return response

    async def _handle_intake(self, session_id: str, message: str, context: Dict) -> FSMResponse:
        """Handle INTAKE state - collecting baseline requirements."""
        
        # Use the intake tool to process the message
        result = intake_step(session_id, message)
        
        if result.get("ready", False):
            # Baseline collection complete, move to confirmation
            try:
                # Trigger expansion draft
                draft_expansion_tool(session_id)
                
                # Call Summarizer Agent (simulated for now, or use tool)
                context = get_project_context_tool(session_id)
                summary = self._build_summary(context.get("baseline", {}), context.get("user_description", ""))
                
                return FSMResponse(
                    response=f"Great! I've collected the baseline information.\n\n**Project Summary:**\n{summary}\n\nI've also drafted a detailed project expansion based on your description. Does this summary look correct?",
                    current_state=WorkflowState.CONFIRMING
                )
            except Exception as e:
                print(f"Error generating expansion: {e}")
                return FSMResponse(
                    response="I've collected the baseline information. Ready to proceed to method selection?",
                    current_state=WorkflowState.CONFIRMING
                )
        else:
            # Still collecting info
            return FSMResponse(
                response=result.get("next_question") or result.get("message", "Please provide more details."),
                current_state=WorkflowState.INTAKE
            )

    async def _handle_confirming(self, session_id: str, message: str, context: Dict) -> FSMResponse:
        """Handle CONFIRMING state - user confirms project details."""
        msg_lower = message.lower()
        
        if any(word in msg_lower for word in ["yes", "correct", "approve", "good", "proceed", "ok"]):
            # User confirmed
            confirm_expansion_tool(session_id, "Approved by user")
            return await self._handle_recommending(session_id, message, context)
            
        elif any(word in msg_lower for word in ["no", "wrong", "change", "incorrect", "wait"]):
            # User wants changes
            return FSMResponse(
                response="What would you like to change or add to the project description?",
                current_state=WorkflowState.CLARIFYING
            )
        else:
            # Unclear response
            return FSMResponse(
                response="I didn't quite catch that. Does the project summary look correct? (Yes/No)",
                current_state=WorkflowState.CONFIRMING
            )

    async def _handle_clarifying(self, session_id: str, message: str, context: Dict) -> FSMResponse:
        """Handle CLARIFYING state - user provides updates."""
        
        # Update description with new info
        current_desc = context.get("user_description", "")
        new_desc = f"{current_desc}\n\nUser clarification: {message}"
        submit_user_description_tool(session_id, new_desc)
        
        # Re-generate expansion
        draft_expansion_tool(session_id)
        
        return FSMResponse(
            response="I've updated the project description. Does it look better now?",
            current_state=WorkflowState.CONFIRMING
        )

    async def _handle_recommending(self, session_id: str, message: str, context: Dict) -> FSMResponse:
        """Handle RECOMMENDING state - suggest estimation methods."""
        
        # Run method evaluation
        eval_result = evaluate_methods_tool(session_id)
        
        # Get context to read selection
        context = get_project_context_tool(session_id)
        selection = context.get("selection", {})
        
        if not selection:
            return FSMResponse(
                response="I'm analyzing your project to recommend the best estimation methods...",
                current_state=WorkflowState.RECOMMENDING
            )
            
        primary = selection.get("primary")
        backups = selection.get("backups", [])
        rationale = selection.get("rationale", "")
        
        response_text = self._build_method_recommendation(
            primary, backups, {}, rationale
        )
        
        return FSMResponse(
            response=response_text,
            current_state=WorkflowState.RECOMMENDING, # Stay here until user selects
            is_ready=True,
            recommended_methods=[primary] + backups[:2]
        )

    async def _handle_collecting_inputs(self, session_id: str, message: str, context: Dict, estimation_config: Dict = None) -> FSMResponse:
        """Handle COLLECTING_METHOD_INPUTS state - gather method-specific inputs."""
        from tools.orchestrator_tools import update_fsm_state_tool
        
        # Check if we have a selected method
        method_id = context.get("selected_method")
        if not method_id:
             return FSMResponse(
                response="Please select an estimation method first.",
                current_state=WorkflowState.RECOMMENDING
            )

        # Check for missing inputs
        from tools.orchestrator_tools import get_method_requirements_tool
        requirements = get_method_requirements_tool(session_id, method_id)
        missing_fields = requirements.get("missing_fields", [])
        
        # Loop prevention: Check asked_fields
        asked_fields_map = context.get("asked_fields", {})
        asked_fields = asked_fields_map.get(method_id, [])
        
        # Filter missing fields that haven't been asked yet
        really_missing = [f for f in missing_fields if f["field"] not in asked_fields]
        
        if not really_missing:
             # All inputs collected (or we gave up asking), proceed to estimation
             return await self._handle_estimating(session_id, message, context, estimation_config)
        
        # Ask for the next missing field
        next_field = really_missing[0]
        
        # Mark as asked
        asked_fields.append(next_field["field"])
        asked_fields_map[method_id] = asked_fields
        
        # Update DB with new asked_fields
        update_fsm_state_tool(session_id, WorkflowState.COLLECTING_METHOD_INPUTS.value, asked_fields_map)
        
        return FSMResponse(
            response=f"{next_field['prompt']}",
            current_state=WorkflowState.COLLECTING_METHOD_INPUTS,
            needs_input=True
        )
    
    async def _handle_estimating(self, session_id: str, message: str, context: Dict, estimation_config: Dict = None) -> FSMResponse:
        """Handle ESTIMATING state - generate the estimate."""
        
        try:
            # Use default config if none provided
            if not estimation_config:
                estimation_config = {"currency": "USD", "hourly_rate": 100}

            # Generate the full report
            result = generate_full_report_tool(session_id, estimation_config)
            
            if result.get("status") == "success":
                report = result.get("report", {})
                summary = report.get("executive_summary", {})
                
                total_cost = summary.get("total_cost", "N/A")
                effort = summary.get("effort_estimate", {}).get("effort_person_months", "N/A")
                duration = summary.get("effort_estimate", {}).get("duration_months", "N/A")
                
                cost_str = f"${total_cost:,.2f}" if isinstance(total_cost, (int, float)) else str(total_cost)
                
                return FSMResponse(
                    response=f"✅ **Estimation Complete!**\n\n"
                    f"**Total Estimated Cost:** {cost_str}\n"
                    f"**Effort:** {effort} person-months\n"
                    f"**Duration:** {duration} months\n\n"
                    f"The full report has been generated. You can view it in Step 3.",
                    current_state=WorkflowState.COMPLETED,
                    is_ready=True
                )
            else:
                error = result.get("error", "Unknown error")
                return FSMResponse(
                    response=f"I encountered an issue generating the estimate: {error}\n\nWould you like to try again or use a different method?",
                    current_state=WorkflowState.RECOMMENDING
                )
        except Exception as e:
            print(f"Estimation error: {e}")
            return FSMResponse(
                response=f"I had trouble generating the estimate. Error: {str(e)}\n\nWould you like to try again?",
                current_state=WorkflowState.RECOMMENDING
            )
    
    async def _handle_completed(self, session_id: str, message: str, context: Dict) -> FSMResponse:
        """Handle COMPLETED state - estimation is done."""
        
        return FSMResponse(
            response="Your cost estimation is complete! You can view the full report in Step 3. Is there anything else you'd like to know about the estimate?",
            current_state=WorkflowState.COMPLETED,
            is_ready=True
        )
    
    def _build_summary(self, baseline: Dict, description: str) -> str:
        """Build a human-readable project summary."""
        lines = []
        
        if baseline.get("project_type"):
            lines.append(f"- **Project Type:** {baseline['project_type']}")
        if baseline.get("complexity"):
            lines.append(f"- **Complexity:** {baseline['complexity']}")
        if baseline.get("tech_stack"):
            lines.append(f"- **Tech Stack:** {baseline['tech_stack']}")
        if baseline.get("team_pref"):
            lines.append(f"- **Team Size:** {baseline['team_pref']} people")
        if baseline.get("region"):
            lines.append(f"- **Region:** {baseline['region']}")
        if baseline.get("project_duration"):
            lines.append(f"- **Duration:** {baseline['project_duration']}")
        
        if description and len(description) > 50:
            lines.append(f"\n**Project Description:** {description[:200]}...")
        
        return "\n".join(lines) if lines else "No baseline information available."
    
    def _build_method_recommendation(self, primary: str, backups: List[str], completeness: Dict, rationale: str) -> str:
        """Build method recommendation response."""
        
        lines = [
            "Based on your project details, I recommend the following estimation methods:\n",
            f"🎯 **Primary Recommendation:** {primary.upper()}",
        ]
        
        if completeness.get(primary):
            score = completeness[primary]
            lines.append(f"   Completeness Score: {score:.0%}")
        
        if backups:
            lines.append(f"\n📋 **Alternative Methods:** {', '.join(b.upper() for b in backups[:2])}")
        
        if rationale:
            lines.append(f"\n💡 **Rationale:** {rationale[:200]}")
        
        lines.append("\nWould you like to proceed with the recommended method, or choose a different one?")
        lines.append("\nRECOMMENDATION_READY: [" + ", ".join([primary] + backups[:2]) + "]")
        
        return "\n".join(lines)
