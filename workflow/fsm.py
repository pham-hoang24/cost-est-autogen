from agent_framework import SequentialBuilder, Workflow
from agents.fsm_agents import IntakeAgent, ReasoningAgent
from core.workers import EstimationEngine
from core.contract import WorkflowState

class FSMWorkflow:
    def __init__(self, intake_agent: IntakeAgent, reasoning_agent: ReasoningAgent, est_engine: EstimationEngine):
        self.intake_agent = intake_agent
        self.reasoning_agent = reasoning_agent
        self.est_engine = est_engine

    def build(self, current_state: WorkflowState) -> Workflow:
        """Build workflow based on current FSM state."""
        builder = SequentialBuilder()
        
        if current_state in [WorkflowState.INTAKE, WorkflowState.CONFIRMING, WorkflowState.CLARIFYING, WorkflowState.COLLECTING_METHOD_INPUTS]:
            # Intake agent handles gathering, confirming, clarifying, and collecting method inputs
            builder.participants([self.intake_agent.agent])
        elif current_state == WorkflowState.RECOMMENDING:
            # Reasoning agent handles method recommendation
            builder.participants([self.reasoning_agent.agent])
        elif current_state == WorkflowState.ESTIMATING:
            # For now, use reasoning agent for estimation too
            builder.participants([self.reasoning_agent.agent])
        else:
            # Default fallback
            builder.participants([self.intake_agent.agent])
        
        return builder.build()
