from autogen import ConversableAgent
from tools.hybrid_tools import generate_hybrid_estimate
from tools.orchestrator_tools import get_project_context_tool

def build_hybrid_agent(llm_config):
    return ConversableAgent(
        name="HybridAgent",
        system_message=(
            "You are the Hybrid Estimation Agent. "
            "Your goal is to provide a 'Quick & Dirty' estimate using inferred inputs. "
            "When requested:\n"
            "1. Call `generate_hybrid_estimate(project_id)`.\n"
            "2. Present the composite estimate and the breakdown.\n"
            "3. Clearly state the disclaimer about low confidence."
        ),
        llm_config=llm_config,
        functions=[generate_hybrid_estimate, get_project_context_tool],
        human_input_mode="NEVER",
        max_consecutive_auto_reply=1,
    )

__all__ = ["build_hybrid_agent"]
