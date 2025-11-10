# app.py
import os

from autogen import UserProxyAgent

from agents.analogous_agent import build_analogous_agent
from agents.bottomup_agent import build_bottomup_agent
from agents.cocomo_agent import build_cocomo_agent
from agents.decision_engine import build_decision_engine
from agents.fpa_agent import build_fpa_agent
from agents.parametric_agent import build_parametric_agent
from agents.storypoints_agent import build_storypoints_agent
from tools.schema import EstimationOutput

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise EnvironmentError(
        "OPENAI_API_KEY is not set. Populate .env and export it before running the app."
    )

# change model to gpt-4o-mini later
LLM_CFG = False


def build_service():
    # Estimation agents
    cocomo = build_cocomo_agent(LLM_CFG)
    fpa = build_fpa_agent(LLM_CFG)
    story = build_storypoints_agent(LLM_CFG)
    parametric = build_parametric_agent(LLM_CFG)
    analogous = build_analogous_agent(LLM_CFG)
    bottomup = build_bottomup_agent(LLM_CFG)

    # Decision engine
    engine = build_decision_engine(
        LLM_CFG,
        [cocomo, fpa, story, parametric, analogous, bottomup],
    )

    # User entry
    user = UserProxyAgent(
        name="PM",
        code_execution_config=False,
        human_input_mode="NEVER",
        max_consecutive_auto_reply=1,
        default_auto_reply="",
    )

    return user, engine


def estimate(project_input: dict) -> EstimationOutput:
    user, engine = build_service()
    user_message = f"Estimate with input:\n{project_input}\nReturn JSON."
    engine.initiate_chat(user, message=user_message)
    # NOTE: Implement message parsing / validation hook in production.
    raise NotImplementedError("Hook engine output into EstimationOutput parsing.")


if __name__ == "__main__":
    project_input = {
        "project_requirements": "E-commerce web app with secure checkout.",
        "functional_requirements": ["Auth", "Catalog", "Cart", "Payments"],
        "app_platform": ["Web"],
        "tech_stack": ["React", "Node.js", "MongoDB"],
        "size": {"ufp": 450, "lang": "javascript"},
        "agile": {"story_points": 900, "velocity": 60},
        "constraints": {"deadline_months": 6},
        "cost_drivers": {"RELY": "High", "CPLX": "Nominal"},
    }
    try:
        estimate(project_input)
    except NotImplementedError:
        pass
