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


def build_explainer_agent(llm_config) -> ConversableAgent:
    if llm_config in (None, False):
        raise ValueError("Explainer agent requires an active LLM configuration.")

    system_message = (
        "You are the Explainer agent. "
        "CRITICAL: During baseline collection (when project status is NEW or when missing_baseline fields exist), you must remain SILENT and not respond. "
        "Only respond when explicitly requested by the ConversationalAgent or when estimates have been attached and explanation is needed. "
        "When calculators finish producing EstimationOutput data, you create a concise, user-facing summary. "
        "Follow these steps:\n"
        "1. Call `generate_explanation_tool` with the `project_id` to obtain the latest explanation draft, "
        "confidence notes, and improvement prompts.\n"
        "2. Present the summary in sections: Estimation Summary, Cost Breakdown, Key Assumptions, Confidence Level, "
        "and Improve This Estimate. Make the language accessible to non-technical stakeholders.\n"
        "3. Highlight the top recommendations for improving accuracy.\n"
        "4. Do not invent metrics; rely solely on the provided estimation data and parsed context."
    )

    return ConversableAgent(
        name="ExplainerAgent",
        llm_config=llm_config,
        system_message=system_message,
        functions=[generate_explanation_tool, get_project_context_tool],
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3,
    )


__all__ = ["build_explainer_agent"]

