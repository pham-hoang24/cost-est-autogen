from typing import Any, Dict, List, Optional
from agent_framework import ChatAgent
from agent_framework.openai import OpenAIChatClient
from core.contract import WorkflowContext, ExtractedRequirements, MethodSelection, InferredParameters, FPAComponents
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
            
            WORKFLOW:
            - If information is missing or ambiguous, ask CLARIFYING questions.
            - Once you have sufficient information, present a SUMMARY and ask:
              "Is this correct? Please confirm to proceed."
            
            Do NOT attempt to estimate costs. Your job is ONLY to gather facts.
            """
        )

    async def run(self, user_input: str, context: WorkflowContext) -> str:
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
            Your goal is to recommend the best cost estimation method(s) for the project.
            
            AVAILABLE METHODS (use these exact IDs in your response):
            - cocomo: COCOMO II - Best for large traditional projects
            - function-points: Function Point Analysis - Best for business applications
            - story-points: Story Points - Best for Agile projects
            - parametric: Parametric Estimation - Best with historical data
            - bottom-up: Bottom-Up Estimation - Best for detailed planning
            - analogous: Analogous Estimation - Best for early-stage estimates
            
            RESPONSE FORMAT:
            1. Recommend 1-3 methods based on project context
            2. Include the method ID (e.g., `cocomo`, `function-points`) in your response
            3. Briefly explain why each method is suitable
            """
        )
        self.scoring_worker = scoring_worker

    async def select_method(self, context: WorkflowContext) -> MethodSelection:
        if not context.parameters:
             return MethodSelection(selected_method="error", rationale_facts=["Missing parameters"], rank=0)
             
        ranked, rationale = self.scoring_worker.score_methods(context.parameters)
        top_method = ranked[0]
        
        return MethodSelection(
            selected_method=top_method["method"],
            rationale_facts=rationale,
            rank=1,
            alternatives=[m["method"] for m in ranked[1:]]
        )

class FPAInferenceAgent:
    """
    Agent responsible for inferring FPA components from project description.
    """
    def __init__(self, model_client: OpenAIChatClient):
        self.agent = ChatAgent(
            model_client,
            name="FPAInferenceAgent",
            instructions="""
            You are an expert in Function Point Analysis (FPA).
            Your task is to analyze the project description and infer the FPA components.

            FPA COMPONENTS:
            - EI (External Inputs): Data entry forms, file uploads, user inputs
            - EO (External Outputs): Reports, exports, generated documents
            - EQ (External Inquiries): Search/lookup screens, status queries
            - ILF (Internal Logical Files): Database tables, data stores
            - EIF (External Interface Files): External APIs, third-party integrations

            RESPONSE FORMAT (JSON):
            {
                "inferred": {
                    "ei": <number or null>,
                    "eo": <number or null>,
                    "eq": <number or null>,
                    "ilf": <number or null>,
                    "eif": <number or null>
                },
                "confidence": "<high|medium|low>",
                "missing": ["<component names that couldn't be inferred>"],
                "questions": ["<user-friendly questions for missing components>"]
            }

            If you cannot confidently infer a component, set it to null and add a user-friendly 
            question. NEVER ask about "EI" or "UFP" - ask naturally like:
            - "How many data entry screens/forms will your application have?"
            - "How many reports or exports will the system generate?"
            """
        )

    async def infer_components(self, description: str) -> Dict[str, Any]:
        """Infer FPA components from project description."""
        prompt = f"""
Analyze this project description and extract FPA components:

PROJECT DESCRIPTION:
{description}

Respond with JSON only.
"""
        response = await self.agent.run(prompt)
        
        # Parse JSON from response
        import json
        try:
            # Find JSON in response
            text = response.text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start >= 0 and end > start:
                return json.loads(text[start:end])
        except json.JSONDecodeError:
            pass
        
        # Fallback if parsing fails
        return {
            "inferred": {"ei": None, "eo": None, "eq": None, "ilf": None, "eif": None},
            "confidence": "low",
            "missing": ["ei", "eo", "eq", "ilf", "eif"],
            "questions": [
                "How many data entry forms will your application have?",
                "How many reports or exports will the system generate?",
                "How many search or lookup screens are needed?",
                "How many main data tables/entities will be stored?",
                "How many external systems will you integrate with?"
            ]
        }

    def calculate_ufp(self, components: FPAComponents) -> Optional[int]:
        """Calculate UFP from FPA components using average complexity weights."""
        weights = {"ei": 4, "eo": 5, "eq": 4, "ilf": 10, "eif": 7}  # Average weights
        
        if any(getattr(components, k) is None for k in weights.keys()):
            return None
        
        ufp = sum(getattr(components, k) * w for k, w in weights.items())
        return ufp
