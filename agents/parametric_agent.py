"""
agents/parametric_agent.py
==========================

Conversable agent wiring for parametric cost estimations.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.parametric_tools import generate_parametric_estimation
from tools.orchestrator_tools import (
    get_project_context_tool,
    register_estimate_tool,
    report_missing_inputs_tool,
)


def build_parametric_agent(llm_config):
    return ConversableAgent(
        name="ParametricAgent",
        system_message=(
            "You are a parametric estimator. CRITICAL: You must remain SILENT until explicitly requested by MethodSelectorAgent or ConversationalAgent.\n\n"
            "When activated, follow these steps:\n"
            "1. First, call `get_project_context_tool(project_id)` to retrieve the project context. Use the project_id from the context or 'new_project' as default.\n"
            "2. Extract available data from the context:\n"
            "   - Check `parsed_context.size.ufp` or `parsed_context.size.ksloc` for size metrics\n"
            "   - Check `parsed_context.rates.blended_rate` for cost per unit\n"
            "   - Check `expansion_confirmed.features` for feature information\n"
            "   - Check `baseline.team_pref` or `parsed_context.team.pref_size` for team size\n"
            "3. Attempt to infer missing values:\n"
            "   - If total_units is missing, derive from size metrics (use ufp or ksloc if available)\n"
            "   - If cost_per_unit is missing, use default rates from region or parsed_context.rates.blended_rate\n"
            "   - If hours_per_unit is missing, estimate from complexity and feature count\n"
            "   - Extract team size and productivity assumptions from baseline or parsed_context\n"
            "4. Try to generate the estimate using `generate_parametric_estimation` tool with extracted/inferred values\n"
            "5. If critical inputs are still missing and cannot be inferred:\n"
            "   - Call `report_missing_inputs_tool(project_id, \"parametric\", [list of missing inputs with field, prompt, priority])\n"
            "   - Each missing input should be: {\"field\": \"field_name\", \"prompt\": \"user-friendly prompt\", \"priority\": \"critical\" or \"high\" or \"medium\"}\n"
            "   - Critical missing inputs: cost_per_unit (critical), hours_per_unit (critical), total_units (critical)\n"
            "   - Report back: \"I need the following inputs to proceed: [list missing inputs]\"\n"
            "6. If estimate is successfully generated, call `register_estimate_tool(project_id, estimate)` to register it with the workflow orchestrator."
        ),
        llm_config=llm_config,
        functions=[generate_parametric_estimation, get_project_context_tool, register_estimate_tool, report_missing_inputs_tool],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_parametric_agent"]

