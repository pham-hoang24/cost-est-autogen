"""
agents/interpreter_agent.py
===========================

Interpreter agent specialises in semantic expansion of sparse user inputs.
It collaborates with the conversational agent by producing ExpansionV1 drafts
and identifying missing signals.
"""

from __future__ import annotations

from autogen import ConversableAgent  # type: ignore[import]

from tools.orchestrator_tools import (
    draft_expansion_tool,
    get_project_context_tool,
)


def build_interpreter_agent(llm_config) -> ConversableAgent:
    if llm_config in (None, False):
        raise ValueError("Interpreter agent requires an active LLM configuration.")

    system_message = (
        "You are the Interpreter agent responsible for expanding sparse project descriptions. "
        "Whenever the conversational agent has collected baseline details and a user narrative, "
        "you are invoked to generate an ExpansionV1 draft. Follow this process:\n"
        "1. Call `draft_expansion_tool` with the active `project_id` to obtain a draft summary, "
        "feature list, non-functional requirements, platforms, constraints, assumptions, and missing signals.\n"
        "2. Inspect the draft and, if any high-impact gaps remain, suggest up to three clarifying questions "
        "for the conversational agent to ask the user.\n"
        "3. Return focused, structured outputs. Do not fabricate information; flag speculative items as assumptions.\n"
        "4. Keep responses concise and machine-readable so downstream agents can parse them easily."
    )

    return ConversableAgent(
        name="InterpreterAgent",
        llm_config=llm_config,
        system_message=system_message,
        functions=[draft_expansion_tool, get_project_context_tool],
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3,
    )


__all__ = ["build_interpreter_agent"]

