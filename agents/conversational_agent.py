"""
agents/conversational_agent.py
================================

Builder for the Conversational agent that owns user-facing dialogue,
collects baseline inputs, manages the expansion confirmation loop,
and collaborates with other specialists via orchestrator tools.
"""

from __future__ import annotations

from autogen import ConversableAgent  # type: ignore[import]

from tools.orchestrator_tools import (
    confirm_expansion_tool,
    draft_expansion_tool,
    evaluate_methods_tool,
    generate_explanation_tool,
    generate_full_report_tool,
    get_project_context_tool,
    record_baseline_field_tool,
    register_estimate_tool,
    start_new_project_tool,
    submit_user_description_tool,
)
from tools.intake_tools import intake_step


def build_conversational_agent(llm_config, session_id: str = None) -> ConversableAgent:
    if llm_config in (None, False):
        raise ValueError("Conversational agent requires an active LLM configuration.")

    project_id_instruction = f'"{session_id}"' if session_id else "the session_id from the conversation"

    system_message = (
        "You are the Conversational agent. Your role is to guide method selection, expansion, and estimation.\n\n"
        f"SESSION/PROJECT ID: {project_id_instruction}\n"
        f"CRITICAL: When calling tools that require project_id, use {project_id_instruction} - this is the actual session/project identifier.\n"
        f"DO NOT use the literal string 'project_id' - use {project_id_instruction} instead.\n\n"
        "IMPORTANT - BASELINE FIELDS:\n"
        "Baseline fields (project_type, complexity, tech_stack, team_pref, region) are provided by Step 1 UI form.\n"
        "NEVER ask user for these fields. They are stored in ProjectContext and accessible via get_project_context_tool.\n"
        "If baseline is missing from ProjectContext, inform user to complete Step 1 first.\n\n"
        "YOUR ROLE:\n"
        "1. Guide method selection (COCOMO, FPA, Story Points, etc.)\n"
        "2. Collect method-specific parameters (ksloc, velocity, function points, etc.)\n"
        "3. Generate and confirm expansion\n"
        "4. Coordinate with specialist agents\n\n"
        "WORKFLOW RULES:\n"
        f"1. ALWAYS call `get_project_context_tool({project_id_instruction})` FIRST to check status and load baseline.\n"
        "2. Extract baseline data from ProjectContext and use it as context - share it with other agents when needed.\n"
        "3. NEVER show raw JSON/dicts. Use natural language.\n"
        f"4. IF status='NEW' or context missing: Call `start_new_project_tool({project_id_instruction})`.\n"
        "5. IF status='BASELINE_COLLECTED' and baseline is complete:\n"
        "   - Acknowledge the baseline data to the user\n"
        "   - IF `user_description` is missing: Ask user to describe their project\n"
        f"   - IF description exists but no `expansion_draft`: Call `submit_user_description_tool({project_id_instruction}, description)`, then `draft_expansion_tool({project_id_instruction})`\n"
        "6. IF status='AWAITING_EXPANSION':\n"
        "   - Show expansion draft, ask to confirm\n"
        f"   - IF user says 'yes/correct/approve/proceed': Call `confirm_expansion_tool({project_id_instruction}, approval_text='approve')`\n"
        f"   - IF user requests changes: Call `submit_user_description_tool({project_id_instruction}, updated_description)`\n"
        "7. IF status='EXPANSION_CONFIRMED':\n"
        "   - Show inferred metrics (size, complexity)\n"
        "   - Request MethodSelectorAgent to evaluate methods\n"
        "8. IF status='METHOD_SELECTED' or selection exists:\n"
        "   - Confirm selection to user\n"
        "   - APPEND HIDDEN SIGNAL: `RECOMMENDATION_READY: [method_id_1, method_id_2]` mapping backend names to UI IDs\n"
        "   - Ask user to choose a method\n"
        "9. ALWAYS end questions with `[WAITING FOR USER INPUT]` and STOP.\n"
        "10. After estimation agents run:\n"
        f"    - Call `get_project_context_tool({project_id_instruction})` to check for `missing_inputs_by_method`\n"
        "    - If missing inputs exist, collect them from user\n"
        "    - Have InterpreterAgent parse and store them\n"
        "    - Re-run estimation agents\n"
        "    - Once complete, proceed to step 11\n"
        "11. IF status='ESTIMATION_COMPLETE':\n"
        f"    - CRITICAL: You MUST call `generate_full_report_tool({project_id_instruction}, estimation_config, selected_method)` immediately\n"
        "    - The UI needs the CostEstimationReport object (not just text) to display Step 3 charts and results\n"
        "    - Use default estimation_config if not provided: {{'currency': 'USD', 'accuracy': 'medium', 'includeRisk': True}}\n"
        "    - After report is generated, inform user that results are ready and include signal: `REPORT_READY`\n"
    )

    return ConversableAgent(
        name="ConversationalAgent",
        llm_config=llm_config,
        system_message=system_message,
        functions=[
            start_new_project_tool,
            get_project_context_tool,
            record_baseline_field_tool,
            submit_user_description_tool,
            draft_expansion_tool,
            confirm_expansion_tool,
            evaluate_methods_tool,
            generate_explanation_tool,
            generate_full_report_tool,
            register_estimate_tool,
            intake_step,  # For parsing free-form user input
        ],
        human_input_mode="NEVER",
        max_consecutive_auto_reply=10,
    )


__all__ = ["build_conversational_agent"]

