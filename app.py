# app.py
from autogen import UserProxyAgent
from agents.cocomo_agent import build_cocomo_agent
# ... import other builders ...
from agents.decision_engine import build_decision_engine
from tools.schema import EstimationOutput

LLM_CFG = {"model": "gpt-4o-mini", "temperature": 0}

def build_service():
    # Estimation agents
    cocomo = build_cocomo_agent(LLM_CFG)
    fpa = ...            # build_fpa_agent(...)
    story = ...          # build_storypoints_agent(...)
    parametric = ...     # build_parametric_agent(...)
    analogous = ...      # build_analogous_agent(...)
    bottomup = ...       # build_bottomup_agent(...)

    # Decision engine
    engine = build_decision_engine(LLM_CFG, [cocomo,fpa,story,parametric,analogous,bottomup])

    # User entry
    user = UserProxyAgent(name="PM", code_execution_config=False)

    return user, engine

def estimate(project_input: dict) -> EstimationOutput:
    user, engine = build_service()
    # Kick off conversation: provide structured project_input
    user_message = f"Estimate with input:\n{project_input}\nReturn JSON."
    engine.initiate_chat(user, message=user_message)
    # Parse the final message (ensure formatter agent or post-hook yields schema)
    # Pseudocode: final = EstimationOutput.model_validate_json(engine.last_message().content)
    # return final

if __name__ == "__main__":
    # Example minimal input—adjust to your flow
    project_input = {
        "project_requirements": "E-commerce web app...",
        "functional_requirements": ["Auth","Catalog","Cart","Payments"],
        "app_platform": ["Web"],
        "tech_stack": ["React","Node.js","MongoDB"],
        "size": {"ufp": 450, "lang":"javascript"},   # or {"ksloc": 85}
        "agile": {"story_points": 900, "velocity": 60},
        "constraints": {"deadline_months": 6},
        "cost_drivers": {"RELY": "High", "CPLX": "Nominal", "...":"..."},
    }
    out = estimate(project_input)
    print(out.model_dump_json(indent=2))
