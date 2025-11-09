"""
agents/bottomup_agent.py
========================

Conversable agent wiring for Bottom-Up estimation.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.bottomup_tools import generate_bottom_up_estimation


def build_bottomup_agent(llm_config):
    return ConversableAgent(
        name="BottomUpAgent",
        system_message=(
            "You are a bottom-up estimator. "
            "Collect detailed work packages with hour estimates and roles. "
            "Use `generate_bottom_up_estimation` to aggregate into a structured output. "
            "If work packages are incomplete, request clarifications."
        ),
        llm_config=llm_config,
        tools=[generate_bottom_up_estimation],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_bottomup_agent"]

