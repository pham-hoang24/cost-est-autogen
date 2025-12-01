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
            "Do NOT act on 'METHOD_SELECTED' status alone. You MUST wait for the ConversationalAgent to present the options to the user and for the user to confirm.\n\n"
            "When activated, follow these steps:\n"
            "1. First, call `get_project_context_tool(project_id)` to retrieve the project context.\n"
            "2. Extract available data from the context, prioritizing `normalized_inputs` and `inferred_fields`:\n"
            "   - Check `inferred_fields['cost_drivers']` for cost driver ratings (e.g., {'rely': 'high', 'cplx': 'very_high'}).\n"
            "   - Check `normalized_inputs` for 'complexity_factor', 'project_type_factor'.\n"
            "   - Check `inferred_fields` for 'ksloc' or other inferred parameters.\n"
            "   - Check `parsed_context.size.ksloc` if not in inferred fields.\n"
            "   - Check `baseline` for raw inputs.\n"
            "3. Attempt to infer missing values:\n"
            "   - If ksloc is missing, estimate from features count and complexity (e.g., 5-10 KSLOC per major feature for medium complexity)\n"
            "   - Use nominal/default values for scale factors and cost drivers if not available in inferred fields\n"
            "   - Extract team size from baseline.team_pref or parsed_context.team.pref_size\n"
            "4. Try to generate the estimate using `generate_cocomo_ii_estimation` tool with extracted/inferred values\n"
            "   - IMPORTANT: Pass `cost_driver_ratings` found in inferred fields.\n"
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
