"""
agents/intake_agent.py
======================

Conversable agent that orchestrates estimation intake using helper tools.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.intake_tools import intake_finalize, intake_snapshot, intake_step, reset_session


def build_intake_agent(llm_config, session_id: str) -> ConversableAgent:
    """
    Build an agent that gathers project details from free-form user input.
    """

    if llm_config in (None, False):
        raise ValueError("Intake agent requires an active LLM configuration.")

    def intake_step_tool(user_text: str, session_id: str = session_id):
        """Wrapper to maintain session context."""
        return intake_step(session_id=session_id, user_text=user_text)

    def intake_snapshot_tool(session_id: str = session_id):
        """Preview the payload without clearing the session."""
        return intake_snapshot(session_id=session_id)

    def intake_finalize_tool(session_id: str = session_id):
        """Return structured payload and clear session."""
        return intake_finalize(session_id=session_id)

    def intake_reset_tool(session_id: str = session_id):
        """Reset the intake session."""
        return reset_session(session_id=session_id)

    system_message = (
        "You are an estimation intake specialist. Your goal is to gather enough "
        "structured information to run a cost estimation. Follow this process:\n"
        "1. For every user message, call `intake_step_tool` with their text.\n"
        "2. Use the returned `next_question` (if any) to ask for missing details.\n"
        "3. When `ready` is true, call `intake_snapshot_tool` to summarise the "
        "payload, present it to the user, and confirm they are satisfied.\n"
        "4. Once the user confirms, call `intake_finalize_tool` to hand off the "
        "structured payload and end the conversation.\n"
        "5. If the user wants to restart, call `intake_reset_tool`.\n"
        "Keep questions concise. If the user provides irrelevant text, politely steer "
        "them back to the required inputs."
    )

    return ConversableAgent(
        name="IntakeAgent",
        system_message=system_message,
        llm_config=llm_config,
        functions=[intake_step_tool, intake_snapshot_tool, intake_finalize_tool, intake_reset_tool],
        max_consecutive_auto_reply=3,
        human_input_mode="NEVER",
    )


__all__ = ["build_intake_agent"]

