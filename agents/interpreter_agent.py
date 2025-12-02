"""
agents/interpreter_agent.py
===========================

Interpreter agent specialises in semantic expansion of sparse user inputs.
It collaborates with the conversational agent by producing ExpansionV1 drafts
and identifying missing signals.
"""

from autogen import ConversableAgent  # type: ignore[import]

from tools.orchestrator_tools import (
    confirm_expansion_tool,
    draft_expansion_tool,
    evaluate_methods_tool,
    generate_explanation_tool,
    get_project_context_tool,
    record_baseline_field_tool,
    update_project_baseline_tool,
    register_estimate_tool,
    start_new_project_tool,
    submit_user_description_tool,
)


def build_interpreter_agent(llm_config, session_id: str = None) -> ConversableAgent:
    if llm_config in (None, False):
        raise ValueError("Interpreter agent requires an active LLM configuration.")

    project_id_instruction = f'"{session_id}"' if session_id else "the session_id from the conversation"

    system_message = (
        "You are the Interpreter agent. Extract and INFER project metadata from user descriptions.\\n\\n"
        f"SESSION/PROJECT ID: {project_id_instruction}\\n"
        f"CRITICAL: When calling tools that require project_id, use {project_id_instruction} - this is the actual session/project identifier.\\n"
        f"DO NOT use placeholder values like '1', 'project_id', or '12345' - use {project_id_instruction} instead.\\n\\n"
        "CRITICAL RULES:\\n"
        "1. Extract ALL available baseline fields (project_type, complexity, tech_stack, team_pref, region) from user text.\\n"
        "2. PLATFORM HANDLING: Valid platforms are: web, ios, android, desktop, cloud, other.\\n"
        "   - If user says 'mobile' or 'mobile app', map to BOTH 'ios' AND 'android'.\\n"
        "   - NEVER use the generic term 'mobile' in tech_stack or platform fields.\\n"
        "3. INFER missing fields when implied:\\n"
        "   - Complexity:\\n"
        "     * '50k+ users', 'ML/AI', 'real-time', 'high scalability' → High\\n"
        "     * '10k users', 'microservices', 'API integration' → Medium\\n"
        "     * 'simple CRUD', 'small team', 'MVP' → Low\\n"
        "   - Region:\\n"
        "     * 'GDPR', 'Europe', 'EU' → Europe\\n"
        "     * 'CCPA', 'US', 'North America' → North America\\n"
        "     * 'APAC', 'Asia' → Asia Pacific\\n"
        "   - Tech Stack:\\n"
        "     * 'AWS', 'Azure', 'cloud' → Cloud Technology\\n"
        "     * 'iOS', 'Android', 'mobile' → Mobile Development\\n"
        "     * 'React', 'Vue', 'web' → Web Technologies\\n"
        "     * 'TensorFlow', 'PyTorch', 'ML' → AI/ML Technologies\\n"
        "   - Team Size:\\n"
        "     * 'small team' → 5\\n"
        "     * 'medium team' → 10\\n"
        "     * 'large team' → 20\\n"
        f"4. Use `update_project_baseline_tool({project_id_instruction}, updates={{...}})` to update MULTIPLE fields at once.\\n"
        f"   - Example: update_project_baseline_tool({project_id_instruction}, {{'complexity': 'High', 'region': 'Europe', 'team_pref': '10'}})\\n"
        f"5. ALWAYS call `get_project_context_tool({project_id_instruction})` FIRST to check what's missing.\\n"
        f"6. Store the description with `submit_user_description_tool({project_id_instruction}, description)` if user provides project details.\\n"
        f"7. After updating, call `get_project_context_tool({project_id_instruction})` again to verify missing_baseline is empty or reduced.\\n"
        "8. Report back: 'Extracted and inferred [list fields]. Missing: [remaining fields if any].'\\n\\n"
        "Your goal: Extract/infer as much as possible in ONE pass to avoid loops.\\n"
    )

    return ConversableAgent(
        name="InterpreterAgent",
        llm_config=llm_config,
        system_message=system_message,
        functions=[
            draft_expansion_tool,
            get_project_context_tool,
            record_baseline_field_tool,
            update_project_baseline_tool,  # New bulk update tool
            submit_user_description_tool,
        ],
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3,
    )


__all__ = ["build_interpreter_agent"]
