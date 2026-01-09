# tests/test_fsm_recommending_loop.py
import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from workflow.fsm_controller import FSMController, WorkflowState

class TestFSMRecommendingLoop(unittest.IsolatedAsyncioTestCase):
    async def test_recommending_loop(self):
        with patch("workflow.fsm_controller.get_project_context_tool") as mock_get_context, \
             patch("workflow.fsm_controller.append_user_message_tool") as mock_append_msg, \
             patch("workflow.fsm_controller.extract_keywords_for_message", new_callable=AsyncMock) as mock_extract, \
             patch("workflow.fsm_controller.append_llm_extraction_tool") as mock_append_extraction, \
             patch("workflow.fsm_controller.normalize_and_infer_tool") as mock_infer, \
             patch("workflow.fsm_controller.evaluate_methods_tool") as mock_evaluate, \
             patch("tools.orchestrator_tools.select_method_tool") as mock_select, \
             patch("tools.orchestrator_tools.update_fsm_state_tool") as mock_update_state, \
             patch("tools.orchestrator_tools.get_method_requirements_tool") as mock_requirements:

            # Setup context in RECOMMENDING state
            context = {
                "project_id": "test_session",
                "fsm_state": "RECOMMENDING",
                "selection": {
                    "primary": "cocomo2",
                    "backups": ["story_points"],
                    "rationale": "Test rationale"
                }
            }
            # After selection we expect selected_method to be persisted
            context_after_select = dict(context)
            context_after_select["selected_method"] = "cocomo"
            context_after_select["asked_fields"] = {}
            context_after_select["missing_baseline"] = {}
            context["missing_baseline"] = {}

            mock_get_context.side_effect = [context, context_after_select, context_after_select]
            mock_extract.return_value = {"features": ["auth"], "non_functionals": [], "platforms": [], "numeric_hints": {}, "confidence": 0.7}
            mock_requirements.return_value = {"missing_fields": [{"field": "ksloc", "prompt": "How many lines?", "priority": "critical"}]}
            
            controller = FSMController()
            
            # User tries to select a method
            response = await controller.process_message("test_session", "I choose COCOMO")
            
            print(f"Current State: {response.current_state}")
            print(f"Response: {response.response}")

            self.assertEqual(response.current_state, WorkflowState.COLLECTING_METHOD_INPUTS, 
                             "Should transition to COLLECTING_METHOD_INPUTS after user selection")
            
            # Verify select_method_tool was called
            mock_select.assert_called()

if __name__ == "__main__":
    import asyncio
    t = TestFSMRecommendingLoop()
    asyncio.run(t.test_recommending_loop())
