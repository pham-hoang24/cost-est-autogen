# agents/decision_engine.py
from autogen import ConversableAgent, GroupChat, GroupChatManager, SelectorAgent

def build_decision_engine(llm_config, members):
    selector = SelectorAgent(
        name="TechniqueSelector",
        llm_config=llm_config,
        system_message=(
            "You route to the best estimator(s) based on available inputs:\n"
            "- If KSLOC + cost drivers: COCOMOAgent\n"
            "- If Function Points: FPAAgent (may convert to KSLOC then COCOMO)\n"
            "- If Story Points + Velocity + Agile: StoryPointsAgent\n"
            "- If strong historical analogue provided: AnalogousAgent\n"
            "- If parametric rate (e.g., cost per FP/LOC) available: ParametricAgent\n"
            "- If detailed WBS/feature list with hours: BottomUpAgent\n"
            "If multiple fit, invoke 2-3 and blend with confidence weights. "
            "If missing inputs, return a short list of required fields."
        ),
    )
    chat = GroupChat(agents=[selector] + members, messages=[], max_round=3)
    return GroupChatManager(groupchat=chat, llm_config=llm_config)
