"""
agents/analogous_agent.py
=========================

Conversable agent wiring for analogous estimations using historical data.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.analogous_tools import generate_analogous_estimation


def build_analogous_agent(llm_config):
    return ConversableAgent(
        name="AnalogousAgent",
        system_message=(
            "You are an analogous estimator. "
            "Request similarity attributes and historical project references. "
            "Invoke `generate_analogous_estimation` to produce results. "
            "If historical data is missing, explain what is required."
        ),
        llm_config=llm_config,
        functions=[generate_analogous_estimation],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_analogous_agent"]

