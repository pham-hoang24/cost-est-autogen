# agents/cocomo_agent.py
from autogen import ConversableAgent
from tools.cocomo_tools import cocomo_effort_and_schedule

def build_cocomo_agent(llm_config):
    return ConversableAgent(
        name="COCOMOAgent",
        system_message=(
            "You are a COCOMO II estimator. "
            "Input: size (KSLOC), scale factors sum, effort multipliers. "
            "Output: effort (PM), schedule (months). Be explicit about assumptions."
        ),
        llm_config=llm_config,
        tools=[cocomo_effort_and_schedule],
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
    )
