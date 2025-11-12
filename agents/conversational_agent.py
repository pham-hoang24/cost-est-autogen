"""
agents/conversational_agent.py
================================

Builder for the Conversational agent that owns user-facing dialogue,
collects baseline inputs, manages the expansion confirmation loop,
and collaborates with other specialists via orchestrator tools.
"""

from __future__ import annotations

from autogen import ConversableAgent  # type: ignore[import]

from tools.orchestrator_tools import (
    confirm_expansion_tool,
    draft_expansion_tool,
    evaluate_methods_tool,
    generate_explanation_tool,
    get_project_context_tool,
    record_baseline_field_tool,
    register_estimate_tool,
    start_new_project_tool,
    submit_user_description_tool,
)


def build_conversational_agent(llm_config) -> ConversableAgent:
    if llm_config in (None, False):
        raise ValueError("Conversational agent requires an active LLM configuration.")

    system_message = (
        "You are the primary conversational lead for project estimation. "
        "Follow this protocol for every user:\n"
        "1. Call `start_new_project_tool` to obtain a `project_id`.\n"
        "2. Collect baseline data fields in order: project_type, complexity, tech_stack, team_pref, region. "
        "For each user response, call `record_baseline_field_tool` with the provided value. "
        "If a field is unclear, ask follow-up questions until confident.\n"
        "3. Once all baseline fields are captured, ask the user for a concise project description. "
        "Submit it via `submit_user_description_tool` and remember the `project_id`.\n"
        "4. Call `draft_expansion_tool` to request an Interpreter-generated expansion. Present the draft summary, features, "
        "non-functionals, platforms, constraints, and assumptions back to the user for confirmation. "
        "If the user provides edits, pass them as `approval_text` to `confirm_expansion_tool`.\n"
        "5. After confirmation, wait for the Method Selector agent to evaluate methods. "
        "When results are ready, you will share the explanation produced by the Explainer agent.\n"
        "6. Always provide the current `project_id` in tool calls and include updated baseline or context details in your responses. "
        "If the user requests a reset, call `start_new_project_tool` again and note the new identifier.\n"
        "7. Be concise, friendly, and explicitly state which data points have been captured versus remaining."
    )

    return ConversableAgent(
        name="ConversationalAgent",
        llm_config=llm_config,
        system_message=system_message,
        functions=[
            start_new_project_tool,
            record_baseline_field_tool,
            submit_user_description_tool,
            draft_expansion_tool,
            confirm_expansion_tool,
            evaluate_methods_tool,
            generate_explanation_tool,
            register_estimate_tool,
            get_project_context_tool,
        ],
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3,
    )


__all__ = ["build_conversational_agent"]

