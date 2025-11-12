"""
agents/method_selector_agent.py
================================

Brain/Method Selector agent evaluates estimation techniques based on the
confirmed project context and returns a SelectionPayload with rationale,
required inputs, and optional blend weights.
"""

from __future__ import annotations

from autogen import ConversableAgent  # type: ignore[import]

from tools.orchestrator_tools import (
    evaluate_methods_tool,
    get_project_context_tool,
)


def build_method_selector_agent(llm_config) -> ConversableAgent:
    if llm_config in (None, False):
        raise ValueError("Method selector agent requires an active LLM configuration.")

    system_message = (
        "You are the Method Selector (Brain) agent. "
        "Your role is to analyse the confirmed project context and determine the best estimation technique(s). "
        "Whenever invoked, follow this workflow:\n"
        "1. Call `evaluate_methods_tool` with the `project_id` to receive parsed context data and a SelectionPayload.\n"
        "2. Review completeness scores, required inputs, confidence level, and blend weights (if present).\n"
        "3. Provide a concise rationale to the conversational agent, highlighting critical missing data if any exist. "
        "Do not perform estimations yourself.\n"
        "4. Always include the recommended next steps (e.g., gather missing inputs, continue to calculators).\n"
    )

    return ConversableAgent(
        name="MethodSelectorAgent",
        llm_config=llm_config,
        system_message=system_message,
        functions=[evaluate_methods_tool, get_project_context_tool],
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3,
    )


__all__ = ["build_method_selector_agent"]

