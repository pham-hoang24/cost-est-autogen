"""
agents/analogous_agent.py
=========================

Conversable agent wiring for analogous estimations using historical data.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.analogous_tools import generate_analogous_estimation
from tools.orchestrator_tools import (
    get_project_context_tool,
    register_estimate_tool,
    report_missing_inputs_tool,
)


def build_analogous_agent(llm_config):
    return ConversableAgent(
        name="AnalogousAgent",
        system_message=(
            "You are an analogous estimator. CRITICAL: You must remain SILENT until explicitly requested by MethodSelectorAgent or ConversationalAgent.\n\n"
            "When activated, follow these steps:\n"
            "1. First, call `get_project_context_tool(project_id)` to retrieve the project context. Use the project_id from the context or 'new_project' as default.\n"
            "2. Extract available data from the context:\n"
            "   - Check `parsed_context.platforms` for platform information\n"
            "   - Check `parsed_context.team.pref_size` for team size\n"
            "   - Check `parsed_context.quality.reliability` for quality targets\n"
            "   - Check `baseline.complexity` for complexity\n"
            "   - Check `expansion_confirmed.features` for feature information\n"
            "3. Attempt to infer missing values:\n"
            "   - Use baseline attributes (project_type, complexity, tech_stack, team_pref, region) as similarity attributes\n"
            "   - Create target_attributes mapping from parsed_context and baseline data\n"
            "   - Map complexity to numeric score (low=0.3, medium=0.5, high=0.7, very_high=0.9)\n"
            "   - Extract team size, platform, and quality attributes from context\n"
            "4. Try to generate the estimate using `generate_analogous_estimation` tool with extracted/inferred values\n"
            "5. If critical inputs are still missing and cannot be inferred:\n"
            "   - Call `report_missing_inputs_tool(project_id, \"analogous\", [list of missing inputs with field, prompt, priority])\n"
            "   - Each missing input should be: {\"field\": \"field_name\", \"prompt\": \"user-friendly prompt\", \"priority\": \"critical\" or \"high\" or \"medium\"}\n"
            "   - Critical missing inputs: historical_projects (critical), target_attributes (high)\n"
            "   - Report back: \"I need the following inputs to proceed: [list missing inputs]\"\n"
            "6. If estimate is successfully generated, call `register_estimate_tool(project_id, estimate)` to register it with the workflow orchestrator."
        ),
        llm_config=llm_config,
        functions=[generate_analogous_estimation, get_project_context_tool, register_estimate_tool, report_missing_inputs_tool],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_analogous_agent"]

