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
        "You are the Method Selector agent. "
        "CRITICAL: During baseline collection (when project status is NEW or when missing_baseline fields exist), you must remain SILENT and not respond. "
        "Only respond when explicitly requested by the ConversationalAgent or when the project is ready for method evaluation (status is AWAITING_METHOD_SELECTION or later). "
        "When prompted, follow these steps:\n"
        "1. Call `evaluate_methods_tool(project_id)` to retrieve the SelectionPayload.\n"
        "2. Review the SelectionPayload to identify the `primary` method and `backups`.\n"
        "3. Map the primary method to the corresponding calculation agent:\n"
        "   - \"cocomo2\" → COCOMOAgent\n"
        "   - \"fpa\" → FPAAgent\n"
        "   - \"agile_sp\" → StoryPointsAgent\n"
        "   - \"analogous\" → AnalogousAgent\n"
        "   - \"parametric\" → ParametricAgent\n"
        "   - \"bottomup\" → BottomUpAgent\n"
        "4. Explicitly request the corresponding calculation agent to run by saying: \"I recommend [method name]. I'll have the [AgentName] perform the estimation.\" Then wait for the calculation agent to execute.\n"
        "5. If there are backup methods with high scores, you may also request those agents to run for comparison.\n"
        "6. Present the method recommendations, confidence level, and any missing inputs to the ConversationalAgent."
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

