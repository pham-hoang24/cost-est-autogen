"""
agents/storypoints_agent.py
===========================

Conversable agent wiring for Story Point–based estimation.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.storypoints_tools import generate_storypoints_estimation


def build_storypoints_agent(llm_config):
    return ConversableAgent(
        name="StoryPointsAgent",
        system_message=(
            "You are a Story Point estimator. "
            "Collect total story points, team velocity, sprint cadence, and productivity assumptions. "
            "Call `generate_storypoints_estimation` to produce the structured estimate. "
            "Clarify missing agile inputs when necessary."
        ),
        llm_config=llm_config,
        functions=[generate_storypoints_estimation],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_storypoints_agent"]

