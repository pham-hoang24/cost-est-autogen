# agents/cocomo_agent.py
from autogen import ConversableAgent  # type: ignore[import]

from tools.cocomo_tools import generate_cocomo_ii_estimation


def build_cocomo_agent(llm_config):
    return ConversableAgent(
        name="COCOMOAgent",
        system_message=(
            "You are a COCOMO II estimator. "
            "Collect KSLOC, scale factors, and cost drivers. "
            "Use the `generate_cocomo_ii_estimation` tool to return a structured estimate. "
            "If inputs are missing, ask for them explicitly."
        ),
        llm_config=llm_config,
        functions=[generate_cocomo_ii_estimation],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )


__all__ = ["build_cocomo_agent"]
