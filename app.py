# app.py
import os
from uuid import uuid4

from autogen import GroupChat, GroupChatManager, UserProxyAgent  # type: ignore[import]

from agents.intake_agent import build_intake_agent
from agents.runner_agent import build_runner_agent
from tools.cocomo_tools import generate_cocomo_ii_estimation
from tools.intake_tools import (
    consume_final_payload,
    offline_intake_flow,
    reset_session,
)
from tools.parametric_tools import generate_parametric_estimation
from tools.schema import EstimationOutput
from tools.storypoints_tools import generate_storypoints_estimation

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
USE_LLM = os.getenv("USE_INTAKE_LLM", "1") != "0" and bool(OPENAI_API_KEY)

LLM_CFG = (
    {"model": "gpt-4o-mini", "temperature": 0, "api_key": OPENAI_API_KEY}
    if USE_LLM and OPENAI_API_KEY
    else False
)

ESTIMATORS = {
    "storypoints": generate_storypoints_estimation,
    "cocomo": generate_cocomo_ii_estimation,
    "parametric": generate_parametric_estimation,
}


def _execute_estimation(payload: dict) -> EstimationOutput:
    method = payload.get("method")
    kwargs = payload.get("kwargs", {})
    if method not in ESTIMATORS:
        raise ValueError(f"Unsupported estimation method '{method}'.")
    estimator = ESTIMATORS[method]
    return estimator(**kwargs)


def build_estimation_team(llm_config) -> tuple[GroupChatManager, UserProxyAgent, str]:
    """Construct the intake + runner team for conversational estimation."""
    if llm_config in (None, False):
        raise ValueError("LLM configuration is required to build the estimation team.")

    session_id = str(uuid4())
    intake_agent = build_intake_agent(llm_config, session_id)
    runner_agent = build_runner_agent(llm_config)
    user_agent = UserProxyAgent(
        name="PM",
        code_execution_config=False,
        human_input_mode="ALWAYS",
        max_consecutive_auto_reply=0,
    )

    chat = GroupChat(
        agents=[user_agent, intake_agent, runner_agent],
        messages=[],
        max_round=20,
        speaker_selection_method="round_robin",
        send_introductions=True,
    )
    manager = GroupChatManager(groupchat=chat, llm_config=llm_config)
    return manager, user_agent, session_id


def run_team_conversation(initial_text: str, llm_config=LLM_CFG) -> EstimationOutput:
    """Execute the full intake + runner pipeline via Autogen."""
    manager, user_agent, session_id = build_estimation_team(llm_config)
    try:
        manager.initiate_chat(user_agent, message=initial_text)
        payload = consume_final_payload(session_id)
        return _execute_estimation(payload)
    finally:
        reset_session(session_id)


def estimate(user_request: str) -> EstimationOutput:
    """Public API for triggering an estimation from free-form text."""
    if not isinstance(user_request, str):
        raise TypeError("estimate expects a free-form textual request.")

    if LLM_CFG:
        return run_team_conversation(user_request, LLM_CFG)
    payload = offline_intake_flow(user_request)
    return _execute_estimation(payload)


def run_team_cli():
    """CLI entry point for manual testing."""
    print("Describe your project and estimation context (press Enter when done):")
    try:
        user_description = input("> ").strip()
        if not user_description:
            raise ValueError("No description provided.")
        result = estimate(user_description)
        print("\nEstimation Result:")
        print(result.model_dump_json(indent=2))
    except Exception as err:  # pragma: no cover - CLI convenience
        print(f"Estimation failed: {err}")


def build_team_for_gui(llm_config=LLM_CFG) -> dict:
    """
    Helper for Autogen GUI integrations.

    Returns a dictionary with the group chat manager, user proxy agent,
    and the session identifier so the host can manage the conversation.
    """
    manager, user_agent, session_id = build_estimation_team(llm_config)
    return {
        "manager": manager,
        "user_agent": user_agent,
        "session_id": session_id,
    }


if __name__ == "__main__":
    run_team_cli()
