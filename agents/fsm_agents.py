from typing import Any, Dict, List
from agent_framework import ChatAgent
from agent_framework.openai import OpenAIChatClient
from core.contract import WorkflowContext, ExtractedRequirements, MethodSelection, InferredParameters
from core.workers import MethodScoring

class IntakeAgent:
    """
    Agent responsible for conversational extraction of requirements.
    """
    def __init__(self, model_client: OpenAIChatClient):
        self.agent = ChatAgent(
            model_client,
            name="IntakeAgent",
            instructions="""
            You are an expert Software Cost Estimation Intake Specialist.
            Your goal is to extract a complete project description and baseline requirements from the user.
            
            You need to collect:
            1. Project Type (e.g., Web, Mobile, AI)
            2. Complexity (Low, Medium, High)
            3. Tech Stack
            4. Team Preference (Size)
            5. Region
            
            If information is missing or ambiguous, ask CLARIFYING questions.
            Do NOT attempt to estimate costs. Your job is ONLY to gather facts.
            """
        )

    async def run(self, user_input: str, context: WorkflowContext) -> str:
        # In a real implementation, we would inject the current context into the prompt
        response = await self.agent.run(user_input)
        return response.text

class ReasoningAgent:
    """
    Agent responsible for method selection and explanation.
    """
    def __init__(self, model_client: OpenAIChatClient, scoring_worker: MethodScoring):
        self.agent = ChatAgent(
            model_client,
            name="ReasoningAgent",
            instructions="""
            You are a Senior Software Architect.
            Your goal is to select the best cost estimation method based on the provided scoring.
            
            CRITICAL RULES:
            1. You MUST choose a method from the provided 'Ranked Methods' list.
            2. You MUST cite the 'Rationale Facts' provided in the context.
            3. Do NOT invent new reasons or contradict the scoring.
            4. Explain the choice clearly to the user.
            """
        )
        self.scoring_worker = scoring_worker

    async def select_method(self, context: WorkflowContext) -> MethodSelection:
        # 1. Run deterministic scoring
        if not context.parameters:
             # Fallback if parameters missing (should be handled by FSM transition logic)
             return MethodSelection(selected_method="error", rationale_facts=["Missing parameters"], rank=0)
             
        ranked, rationale = self.scoring_worker.score_methods(context.parameters)
        
        # 2. Ask agent to explain (and technically 'select', but we bind it to the top rank)
        # For this implementation, we force the top rank but ask the agent to generate the explanation text.
        top_method = ranked[0]
        
        # We could use the agent here to generate a user-friendly explanation string
        # explanation = await self.agent.run(f"Explain why {top_method['method']} is the best choice based on: {rationale}")
        
        return MethodSelection(
            selected_method=top_method["method"],
            rationale_facts=rationale,
            rank=1,
            alternatives=[m["method"] for m in ranked[1:]]
        )
