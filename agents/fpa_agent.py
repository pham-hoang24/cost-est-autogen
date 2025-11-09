"""
agents/fpa_agent.py
===================

Conversable agent wiring for Function Point Analysis estimations.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.fpa_tools import generate_fpa_estimation


def build_fpa_agent(llm_config):
    return ConversableAgent(
        name="FPAAgent",
        system_message=(
            "You are a Function Point Analysis estimator. "
            "Collect or receive function counts by component/complexity, GSC ratings, "
            "and productivity/cost assumptions. Use the `generate_fpa_estimation` tool "
            "to produce a structured estimate conforming to the EstimationOutput schema. "
            "If inputs are missing, ask for them explicitly."
        ),
        llm_config=llm_config,
        tools=[generate_fpa_estimation],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_fpa_agent"]

