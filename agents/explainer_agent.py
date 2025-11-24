"""
agents/explainer_agent.py
=========================

Explainer agent translates technical estimation outputs into clear,
user-friendly narratives with assumptions, confidence levels, and
recommended next steps.
"""

from __future__ import annotations

from autogen import ConversableAgent  # type: ignore[import]

from tools.orchestrator_tools import (
    generate_explanation_tool,
    get_project_context_tool,
)


def build_evaluate_agent(llm_config) -> ConversableAgent:
    if llm_config in (None, False):
        raise ValueError("Evaluate agent requires an active LLM configuration.")

    system_message = (
        "You are the Evaluate agent (formerly Explainer). "
        "CRITICAL: During baseline collection, remain SILENT. "
        "Only respond when explicitly requested or when estimates have been attached. "
        "Your responsibilities:\n"
        "1. Validate and sanity-check estimates provided by MethodAgents.\n"
        "2. Merge or compare results across methods if multiple are present (e.g. Hybrid mode).\n"
        "3. Produce human-readable summaries using `generate_explanation_tool`.\n"
        "4. Highlight confidence levels, especially if inferred inputs were used.\n"
        "5. If estimates vary significantly, explain why based on the method differences."
    )

    return ConversableAgent(
        name="EvaluateAgent",
        llm_config=llm_config,
        system_message=system_message,
        functions=[generate_explanation_tool, get_project_context_tool],
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3,
    )


__all__ = ["build_evaluate_agent"]

