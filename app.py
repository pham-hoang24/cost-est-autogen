from __future__ import annotations

import os
from typing import Dict, Tuple
from uuid import uuid4

from autogen import GroupChat, GroupChatManager, UserProxyAgent  # type: ignore[import]

from agents.conversational_agent import build_conversational_agent
from agents.explainer_agent import build_explainer_agent
from agents.interpreter_agent import build_interpreter_agent
from agents.method_selector_agent import build_method_selector_agent
from workflow.controller import WorkflowOrchestrator

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
USE_LLM = os.getenv("USE_WORKFLOW_LLM", "1") != "0" and bool(OPENAI_API_KEY)

LLM_CFG = (
    {"model": "gpt-4o-mini", "temperature": 0, "api_key": OPENAI_API_KEY}
    if USE_LLM and OPENAI_API_KEY
    else False
)

BASELINE_PROMPTS = {
    "project_type": "Project type (software development, ai/ml project, system integration, cloud migration, mobile application, web application): ",
    "complexity": "Complexity (low, medium, high, very high): ",
    "tech_stack": "Primary tech stack focus: ",
    "team_pref": "Desired team size (integer): ",
    "region": "Primary delivery region: ",
}


def build_workflow_team(llm_config=LLM_CFG) -> Tuple[GroupChatManager, UserProxyAgent]:
    """
    Assemble the multi-agent workflow team for Autogen-driven conversations.
    """
    if llm_config in (None, False):
        raise ValueError("LLM configuration is required to build the workflow team.")

    conversational_agent = build_conversational_agent(llm_config)
    interpreter_agent = build_interpreter_agent(llm_config)
    method_selector_agent = build_method_selector_agent(llm_config)
    explainer_agent = build_explainer_agent(llm_config)

    user_agent = UserProxyAgent(
        name="User",
        code_execution_config=False,
        human_input_mode="ALWAYS",
        max_consecutive_auto_reply=0,
    )

    chat = GroupChat(
        agents=[
            user_agent,
            conversational_agent,
            interpreter_agent,
            method_selector_agent,
            explainer_agent,
        ],
        messages=[],
        max_round=32,
        speaker_selection_method="round_robin",
        send_introductions=True,
    )
    manager = GroupChatManager(groupchat=chat, llm_config=llm_config)
    return manager, user_agent


def run_workflow_conversation(initial_message: str, llm_config=LLM_CFG) -> None:
    """
    Kick off a multi-agent conversation in the console.
    """
    manager, user_agent = build_workflow_team(llm_config)
    manager.initiate_chat(user_agent, message=initial_message)


def estimate_with_workflow(user_request: str, baseline_inputs: Dict[str, str]) -> str:
    """
    Programmatic helper that drives the WorkflowOrchestrator without Autogen.
    Returns the generated explanation text (if available).
    """
    orchestrator = WorkflowOrchestrator()
    project_id = str(uuid4())
    orchestrator.start_new_project(project_id=project_id)

    for field, value in baseline_inputs.items():
        orchestrator.record_baseline_field(project_id, field, value)
    orchestrator.submit_description(project_id, user_request)
    orchestrator.generate_expansion(project_id)
    orchestrator.confirm_expansion(project_id, approval_text="approve")
    orchestrator.evaluate_methods(project_id)
    orchestrator.generate_explanation(project_id)
    context = orchestrator.load_context(project_id)
    return context.explanation or ""


def run_workflow_cli() -> None:
    """
    Console runner that walks through the orchestrated workflow without LLMs.
    """
    orchestrator = WorkflowOrchestrator()
    project_id = str(uuid4())
    orchestrator.start_new_project(project_id=project_id)

    print("=== Cost Estimation Workflow ===")
    print("Provide baseline project information. Press Ctrl+C to abort.\n")

    for field, prompt in BASELINE_PROMPTS.items():
        while True:
            value = input(prompt).strip()
            if not value:
                print("Value required. Please try again.")
                continue
            orchestrator.record_baseline_field(project_id, field, value)
            break

    description = input("\nDescribe the project in a few sentences:\n> ").strip()
    orchestrator.submit_description(project_id, description)
    orchestrator.generate_expansion(project_id)
    orchestrator.confirm_expansion(project_id, approval_text="approve")
    context = orchestrator.evaluate_methods(project_id)

    print("\n--- Method Recommendation ---")
    if context.selection:
        print(f"Primary method: {context.selection.primary}")
        print(f"Completeness scores: {context.selection.completeness_scores}")
        if context.selection.required_inputs:
            print("Missing inputs:")
            for item in context.selection.required_inputs:
                print(f" - {item['prompt']} ({item['priority']})")
    else:
        print("Method selection did not complete.")

    context = orchestrator.generate_explanation(project_id)
    if context.explanation:
        print("\n--- Explanation ---")
        print(context.explanation)
    else:
        print("\nNo explanation available yet. Provide estimator outputs and rerun.")


def build_team_for_gui(llm_config=LLM_CFG) -> Dict[str, object]:
    """
    Helper for Autogen Studio / GUI integrations.
    Returns a dictionary containing the group chat manager and the user agent.
    """
    manager, user_agent = build_workflow_team(llm_config)
    return {
        "manager": manager,
        "user_agent": user_agent,
    }


if __name__ == "__main__":
    run_workflow_cli()
