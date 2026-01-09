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


def build_method_selector_agent(llm_config, session_id: str = None) -> ConversableAgent:
    if llm_config in (None, False):
        raise ValueError("Method selector agent requires an active LLM configuration.")

    project_id_instruction = f'"{session_id}"' if session_id else "the session_id from the conversation"

    system_message = (
        "You are the Method Selector agent. YOUR JOB IS TO EVALUATE METHODS, NOT EXECUTE THEM.\\n\\n"
        f"SESSION/PROJECT ID: {project_id_instruction}\\n"
        f"CRITICAL: When calling tools that require project_id, use {project_id_instruction} - this is the actual session/project identifier.\\n"
        f"DO NOT invent placeholder values like '1', 'project_id', or '12345' - use {project_id_instruction} instead.\\n\\n"
        "CRITICAL BEHAVIOR RULES:\\n"
        "1. During baseline collection (status NEW, BASELINE_COLLECTED, or AWAITING_EXPANSION), remain SILENT.\\n"
        "2. Only respond when project status is EXPANSION_CONFIRMED or AWAITING_METHOD_SELECTION.\\n\\n"
        "YOUR WORKFLOW:\\n"
        f"1. Call `evaluate_methods_tool({project_id_instruction})` to analyze available methods.\\n"
        "2. Review the SelectionPayload to identify `primary` method, `backups`, and completeness scores.\\n"
        "3. Present recommendations to the user in natural language.\\n"
        "4. **CRITICAL: STOP HERE. DO NOT CALL ANY ESTIMATION AGENTS. DO NOT EXECUTE CALCULATIONS.**\\n"
        "5. Ask the user: 'Which estimation method would you like to use?' and include the hidden signal for the UI.\\n"
        "6. Append this EXACT signal: `RECOMMENDATION_READY: [method_ids]` where method_ids map backend names to UI card IDs:\\n"
        "   - cocomo2 → cocomo\\n"
        "   - fpa → function-points\\n"
        "   - agile_sp → story-points\\n"
        "   - analogous → analogous\\n"
        "   - parametric → parametric\\n"
        "   - bottomup → bottom-up\\n"
        "7. End with `[WAITING FOR USER INPUT]` and STOP.\\n"
        "8. ONLY proceed with estimation if user explicitly selects a method (e.g., 'Use COCOMO' or 'Select Analogous').\\n\\n"
        "FORBIDDEN ACTIONS:\\n"
        "- DO NOT say 'I'll have the [Agent] perform the estimation' unless user has chosen.\\n"
        "- DO NOT call estimation agents automatically.\\n"
        "- DO NOT proceed to calculation without explicit user confirmation."
    )

    return ConversableAgent(
        name="MethodSelectorAgent",
        llm_config=llm_config,
        system_message=system_message,
        functions=[evaluate_methods_tool, get_project_context_tool],
        human_input_mode="NEVER",
        max_consecutive_auto_reply=10,
    )


__all__ = ["build_method_selector_agent"]

