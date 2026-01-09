# tests/test_fsm_controller.py
import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from workflow.fsm_controller import FSMController, WorkflowState, FSMResponse
from workflow.schemas import ProjectContext, BaselineInputs

class TestFSMFlow(unittest.IsolatedAsyncioTestCase):
    async def test_fsm_flow(self):
        # Mock dependencies
        with patch("workflow.fsm_controller.get_project_context_tool") as mock_get_context, \
             patch("workflow.fsm_controller.append_user_message_tool") as mock_append_msg, \
             patch("workflow.fsm_controller.extract_keywords_for_message", new_callable=AsyncMock) as mock_extract, \
             patch("workflow.fsm_controller.append_llm_extraction_tool") as mock_append_extraction, \
             patch("workflow.fsm_controller.normalize_and_infer_tool") as mock_infer, \
             patch("workflow.fsm_controller.confirm_expansion_tool") as mock_confirm, \
             patch("workflow.fsm_controller.evaluate_methods_tool") as mock_evaluate, \
             patch("workflow.fsm_controller.generate_full_report_tool") as mock_report, \
             patch("tools.orchestrator_tools.update_fsm_state_tool") as mock_update_state, \
             patch("tools.orchestrator_tools.get_method_requirements_tool") as mock_requirements:

            # Setup initial context
            context = {
                "project_id": "test_session",
                "fsm_state": "INTAKE",
                "baseline": {"project_type": "web"},
                "user_description": "A simple web app",
                "missing_baseline": {},
                "asked_fields": {}
            }
            mock_get_context.return_value = context
            
            controller = FSMController()
            
            # 1. Test INTAKE -> CONFIRMING
            mock_extract.return_value = {"features": ["auth"], "non_functionals": [], "platforms": [], "numeric_hints": {}, "confidence": 0.7}
            response = await controller.process_message("test_session", "I want to build a web app")
            
            self.assertEqual(response.current_state, WorkflowState.CONFIRMING)
            mock_update_state.assert_called_with("test_session", "CONFIRMING")
            
            # Update context state for next step
            context["fsm_state"] = "CONFIRMING"
            
            # 2. Test CONFIRMING -> RECOMMENDING
            response = await controller.process_message("test_session", "Yes, that looks correct")
            
            self.assertEqual(response.current_state, WorkflowState.RECOMMENDING)
            mock_update_state.assert_called_with("test_session", "RECOMMENDING")
            
            # Update context state
            context["fsm_state"] = "RECOMMENDING"
            context["selection"] = {"primary": "cocomo2", "backups": [], "rationale": "Test"}
            
            # 3. Test RECOMMENDING -> RECOMMENDING (User needs to select)
            # The controller stays in RECOMMENDING until user selects, but here we simulate user selection via tool separately
            # In the real flow, the user would select via UI, which calls /select-method, updating state to METHOD_SELECTED
            # Let's simulate that update
            context["fsm_state"] = "COLLECTING_METHOD_INPUTS"
            context["selected_method"] = "cocomo"
            
            # 4. Test COLLECTING_INPUTS (Missing Input)
            mock_requirements.return_value = {
                "missing_fields": [{"field": "ksloc", "prompt": "How many lines of code?", "priority": "critical"}]
            }
            
            response = await controller.process_message("test_session", "I chose COCOMO")
            
            self.assertEqual(response.current_state, WorkflowState.COLLECTING_METHOD_INPUTS)
            self.assertTrue(response.needs_input)
            self.assertIn("lines of code", response.response)
            
            # Verify asked_fields updated
            # The mock_update_state should be called with updated asked_fields
            # We need to check the call args
            args, _ = mock_update_state.call_args
            self.assertEqual(args[0], "test_session")
            self.assertEqual(args[1], "COLLECTING_METHOD_INPUTS")
            self.assertEqual(args[2]["cocomo"], ["ksloc"])
            
            # Update context with asked field
            context["asked_fields"] = {"cocomo": ["ksloc"]}
            
            # 5. Test COLLECTING_INPUTS (Loop Prevention / Input Provided)
            # Now we assume the user provided the input (or we skip it if missing)
            # If we call it again, it should see ksloc is in asked_fields and skip it
            
            def report_side_effect(*args, **kwargs):
                print(f"DEBUG: Mock generate_full_report_tool called with {args} {kwargs}")
                return {"status": "success", "report": {"executive_summary": {"total_cost": 100}}}
            
            mock_report.side_effect = report_side_effect
            
            response = await controller.process_message("test_session", "5000 lines")
            print(f"DEBUG RESPONSE: {response}")
            
            # It should skip ksloc and proceed to estimating (since no other missing fields)
            self.assertEqual(response.current_state, WorkflowState.COMPLETED)
            
            print("Test passed!")

if __name__ == "__main__":
    import asyncio
    t = TestFSMFlow()
    asyncio.run(t.test_fsm_flow())
