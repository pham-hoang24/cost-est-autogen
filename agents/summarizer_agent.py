# agents/summarizer_agent.py
from typing import Dict, Any
from autogen import ConversableAgent  # type: ignore[import]

from tools.orchestrator_tools import (
    get_project_context_tool,
    draft_expansion_tool,
)

def build_summarizer_agent(llm_config: Dict[str, Any]) -> ConversableAgent:
    """
    Builds the Summarizer Agent responsible for generating project summaries
    and assumption checklists for user confirmation.
    """
    return ConversableAgent(
        name="SummarizerAgent",
        system_message=(
            "You are a Project Summarizer. Your role is to read the project context "
            "and generate a concise, structured summary for the user to confirm.\n\n"
            "When activated:\n"
            "1. Call `get_project_context_tool(project_id)` to get the current state.\n"
            "2. If `expansion_draft` is missing, call `draft_expansion_tool(project_id)`.\n"
            "3. Present the summary to the user in a clear, markdown format.\n"
            "4. List key assumptions made during expansion.\n"
            "5. Ask the user to confirm if the summary is accurate or if they want to make changes.\n"
            "   - If accurate, they should say 'Yes' or 'Confirm'.\n"
            "   - If not, they should provide corrections.\n\n"
            "Output Format:\n"
            "**Project Summary**\n"
            "[Concise description of what is being built]\n\n"
            "**Key Assumptions**\n"
            "- [Assumption 1]\n"
            "- [Assumption 2]\n\n"
            "Does this look correct? (Yes/No)"
        ),
        llm_config=llm_config,
        functions=[get_project_context_tool, draft_expansion_tool],
        human_input_mode="NEVER",
    )
