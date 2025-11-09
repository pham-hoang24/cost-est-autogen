"""
agents/parametric_agent.py
==========================

Conversable agent wiring for parametric cost estimations.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.parametric_tools import generate_parametric_estimation


def build_parametric_agent(llm_config):
    return ConversableAgent(
        name="ParametricAgent",
        system_message=(
            "You are a parametric estimator. "
            "Gather cost-per-unit, hours-per-unit, and total units information. "
            "Optionally capture unit breakdowns and productivity assumptions. "
            "Use `generate_parametric_estimation` to produce the structured result."
        ),
        llm_config=llm_config,
        functions=[generate_parametric_estimation],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_parametric_agent"]

