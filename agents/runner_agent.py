"""
agents/runner_agent.py
======================

Conversable agent responsible for executing estimation helpers once the intake
agent has produced a structured payload.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.cocomo_tools import generate_cocomo_ii_estimation
from tools.fpa_tools import generate_fpa_estimation
from tools.parametric_tools import generate_parametric_estimation
from tools.storypoints_tools import generate_storypoints_estimation

ESTIMATORS = {
    "cocomo": generate_cocomo_ii_estimation,
    "storypoints": generate_storypoints_estimation,
    "parametric": generate_parametric_estimation,
    "fpa": generate_fpa_estimation,
}


def build_runner_agent(llm_config) -> ConversableAgent:
    """Create an agent that runs estimation helpers via a tool call."""

    if llm_config in (None, False):
        raise ValueError("Runner agent requires an active LLM configuration.")

    def run_estimation_tool(payload: dict):
        method = payload.get("method")
        kwargs = payload.get("kwargs", {})
        if method not in ESTIMATORS:
            raise ValueError(f"Unsupported estimation method '{method}'.")
        result = ESTIMATORS[method](**kwargs)
        return result.model_dump_json(indent=2)

    system_message = (
        "You receive structured estimation payloads from the intake agent. "
        "When a payload is provided, call `run_estimation_tool` with it and "
        "return the formatted result to the user. If the payload looks invalid, "
        "ask the intake agent to clarify."
    )

    return ConversableAgent(
        name="EstimatorRunner",
        system_message=system_message,
        llm_config=llm_config,
        functions=[run_estimation_tool],
        max_consecutive_auto_reply=3,
        human_input_mode="NEVER",
    )


__all__ = ["build_runner_agent"]

