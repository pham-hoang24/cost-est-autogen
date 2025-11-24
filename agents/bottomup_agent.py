"""
agents/bottomup_agent.py
========================

Conversable agent wiring for Bottom-Up estimation.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.bottomup_tools import generate_bottom_up_estimation
from tools.orchestrator_tools import (
    get_project_context_tool,
    register_estimate_tool,
    report_missing_inputs_tool,
)


def build_bottomup_agent(llm_config):
    return ConversableAgent(
        name="BottomUpAgent",
        system_message=(
            "You are a bottom-up estimator. CRITICAL: You must remain SILENT until explicitly requested by MethodSelectorAgent or ConversationalAgent.\n\n"
            "When activated, follow these steps:\n"
            "1. First, call `get_project_context_tool(project_id)` to retrieve the project context. Use the project_id from the context or 'new_project' as default.\n"
            "2. Extract available data from the context:\n"
            "   - Check `parsed_context.size.ufp` or `parsed_context.size.ksloc` for size metrics\n"
            "   - Check `expansion_confirmed.features` for feature information\n"
            "   - Check `baseline.team_pref` or `parsed_context.team.pref_size` for team size\n"
            "   - Check `baseline.complexity` or parsed_context for complexity indicators\n"
            "3. Attempt to infer missing values:\n"
            "   - If work_packages are missing, create work packages from features list\n"
            "   - Estimate hours per feature based on complexity (e.g., 40-80 hours per major feature for medium complexity)\n"
            "   - Break down features into work packages: design, development, testing, integration\n"
            "   - Assign roles based on team size from baseline\n"
            "4. Try to generate the estimate using `generate_bottom_up_estimation` tool with extracted/inferred values\n"
            "5. If critical inputs are still missing and cannot be inferred:\n"
            "   - Call `report_missing_inputs_tool(project_id, \"bottomup\", [list of missing inputs with field, prompt, priority])\n"
            "   - Each missing input should be: {\"field\": \"field_name\", \"prompt\": \"user-friendly prompt\", \"priority\": \"critical\" or \"high\" or \"medium\"}\n"
            "   - Critical missing inputs: work_packages (critical)\n"
            "   - Report back: \"I need the following inputs to proceed: [list missing inputs]\"\n"
            "6. If estimate is successfully generated, call `register_estimate_tool(project_id, estimate)` to register it with the workflow orchestrator."
        ),
        llm_config=llm_config,
        functions=[generate_bottom_up_estimation, get_project_context_tool, register_estimate_tool, report_missing_inputs_tool],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_bottomup_agent"]

