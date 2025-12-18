from agent_framework import SequentialBuilder, WorkflowContext
from agents.fsm_agents import IntakeAgent, ReasoningAgent
from core.workers import EstimationEngine, MethodScoring

class FSMWorkflow:
    def __init__(self, intake_agent: IntakeAgent, reasoning_agent: ReasoningAgent, est_engine: EstimationEngine):
        self.intake_agent = intake_agent
        self.reasoning_agent = reasoning_agent
        self.est_engine = est_engine

    def build(self):
        # Create a sequential workflow: Intake -> Reasoning
        # The Reasoning agent will handle the scoring and estimation logic internally for now
        # to simplify the workflow structure and avoid graph construction errors.
        
        builder = SequentialBuilder()
        
        # Add Agents
        builder.participants([self.intake_agent.agent, self.reasoning_agent.agent])
        
        return builder.build()
