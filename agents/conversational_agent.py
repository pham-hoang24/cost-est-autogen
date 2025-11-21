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
        "You are the Conversational agent responsible for collecting baseline information from the user.\n\n"
        "CRITICAL RULES:\n\n"
        "1) On your VERY FIRST reply, call `start_new_project_tool()` with NO arguments to initialize the project.\n\n"
        "2) After calling start_new_project_tool, ask the user for all of the baseline fields at the same time in this order:\n"
        "   - project_type\n"
        "   - complexity\n"
        "   - tech_stack\n"
        "   - team_pref\n"
        "   - region\n\n"
        "3) After asking this question, you MUST end your message with \"[WAITING FOR USER INPUT]\" and then STOP - do not continue, do not call any tools, do not generate responses. Wait for the user's actual response.\n\n"
        "4) When the user responds, extract their answer and call `record_baseline_field_tool` with THREE separate string parameters:\n"
        "   - project_id (from the context)\n"
        "   - field (the field name like \"project_type\")\n"
        "   - value (the user's exact answer)\n"
        "   \n"
        "   Example: record_baseline_field_tool(project_id=\"fitness_app\", field=\"project_type\", value=\"mobile application\")\n\n"
        "5) Once all 5 baseline fields are collected, ask for a project description, end with \"[WAITING FOR USER INPUT]\", wait for response, then call `submit_user_description_tool(project_id=\"<id>\", description=\"<user_text>\")`.\n\n"
        "6) Then coordinate the workflow by presenting expansion drafts and method recommendations."
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

