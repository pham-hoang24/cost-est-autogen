# agents/cocomo_agent.py
from autogen import ConversableAgent  # type: ignore[import]

from tools.cocomo_tools import generate_cocomo_ii_estimation
from tools.orchestrator_tools import (
    get_project_context_tool,
    register_estimate_tool,
    report_missing_inputs_tool,
)


def build_cocomo_agent(llm_config):
    return ConversableAgent(
        name="COCOMOAgent",
        system_message=(
            "You are a COCOMO II estimator. CRITICAL: You must remain SILENT until explicitly requested by MethodSelectorAgent or ConversationalAgent.\n\n"
            "When activated, follow these steps:\n"
            "1. First, call `get_project_context_tool(project_id)` to retrieve the project context. Use the project_id from the context or 'new_project' as default.\n"
            "2. Extract available data from the context:\n"
            "   - Check `parsed_context.size.ksloc` for lines of code estimate\n"
            "   - Check `parsed_context.complexity_signals` for complexity indicators\n"
            "   - Check `parsed_context.team.pref_size` for team size\n"
            "   - Check `expansion_confirmed.features` for feature information\n"
            "   - Check `baseline` for complexity, team size, region\n"
            "3. Attempt to infer missing values:\n"
            "   - If ksloc is missing, estimate from features count and complexity (e.g., 5-10 KSLOC per major feature for medium complexity)\n"
            "   - Use nominal/default values for scale factors and cost drivers if not available\n"
            "   - Extract team size from baseline.team_pref or parsed_context.team.pref_size\n"
            "4. Try to generate the estimate using `generate_cocomo_ii_estimation` tool with extracted/inferred values\n"
            "5. If critical inputs are still missing and cannot be inferred:\n"
            "   - Call `report_missing_inputs_tool(project_id, \"cocomo2\", [list of missing inputs with field, prompt, priority])\n"
            "   - Each missing input should be: {\"field\": \"field_name\", \"prompt\": \"user-friendly prompt\", \"priority\": \"critical\" or \"high\" or \"medium\"}\n"
            "   - Critical missing inputs: ksloc (critical), scale factors (high), cost drivers (medium)\n"
            "   - Report back: \"I need the following inputs to proceed: [list missing inputs]\"\n"
            "6. If estimate is successfully generated, call `register_estimate_tool(project_id, estimate)` to register it with the workflow orchestrator."
        ),
        llm_config=llm_config,
        functions=[generate_cocomo_ii_estimation, get_project_context_tool, register_estimate_tool, report_missing_inputs_tool],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_cocomo_agent"]
