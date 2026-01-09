"""
agents/storypoints_agent.py
===========================

Conversable agent wiring for Story Point–based estimation.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.storypoints_tools import generate_storypoints_estimation
from tools.orchestrator_tools import (
    get_project_context_tool,
    register_estimate_tool,
    report_missing_inputs_tool,
)


def build_storypoints_agent(llm_config):
    return ConversableAgent(
        name="StoryPointsAgent",
        system_message=(
            "You are a Story Point estimator. CRITICAL: You must remain SILENT until explicitly requested by MethodSelectorAgent or ConversationalAgent.\n\n"
            "When activated, follow these steps:\n"
            "1. First, call `get_project_context_tool(project_id)` to retrieve the project context. Use the project_id from the context or 'new_project' as default.\n"
            "2. Extract available data from the context:\n"
            "   - Check `parsed_context.size.story_points` for total story points\n"
            "   - Check `parsed_context.agile.velocity_sp_per_sprint` for team velocity\n"
            "   - Check `parsed_context.agile.sprint_days` for sprint length\n"
            "   - Check `expansion_confirmed.features` for feature information\n"
            "   - Check `baseline.team_pref` or `parsed_context.team.pref_size` for team size\n"
            "3. Attempt to infer missing values:\n"
            "   - If story_points is missing, estimate from features (e.g., 5-8 points per major feature, 2-3 points per minor feature)\n"
            "   - If velocity is missing, estimate based on team size (e.g., 20-30 points per sprint for a team of 5-8)\n"
            "   - If sprint_length is missing, use default of 2 weeks (14 days)\n"
            "   - Extract team size from baseline or parsed_context\n"
            "   - Extract team size from baseline or parsed_context\n"
            "4. LOOP PREVENTION: Check `context.asked_fields['story_points']`.\n"
            "   - If a critical input is missing BUT is listed in `asked_fields`, DO NOT ASK AGAIN. Use a default value or the inferred value.\n"
            "5. If critical inputs are still missing and NOT in `asked_fields`:\n"
            "   - Call `report_missing_inputs_tool(project_id, \"agile_sp\", [list of missing inputs with field, prompt, priority])\n"
            "   - Each missing input should be: {\"field\": \"field_name\", \"prompt\": \"user-friendly prompt\", \"priority\": \"critical\" or \"high\" or \"medium\"}\n"
            "   - Critical missing inputs: total_story_points (critical), team_velocity (critical), sprint_length (medium)\n"
            "   - Report back: \"I need the following inputs to proceed: [list missing inputs]\"\n"
            "6. If estimate is successfully generated, call `register_estimate_tool(project_id, estimate)` to register it with the workflow orchestrator."
        ),
        llm_config=llm_config,
        functions=[generate_storypoints_estimation, get_project_context_tool, register_estimate_tool, report_missing_inputs_tool],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_storypoints_agent"]

