# tools/schema.py
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class RoleCount(BaseModel):
    level: Literal["junior","mid","senior"]
    count: int

class TeamComposition(BaseModel):
    developers: List[RoleCount]
    designers: Optional[List[RoleCount]] = []

class Milestone(BaseModel):
    name: str
    duration: str  # e.g. "1 month"

class CostEstimate(BaseModel):
    total_cost: float
    labor_cost: float
    infrastructure_cost: float
    other_expenses: float

class TimelineEstimate(BaseModel):
    total_duration: str
    milestones: List[Milestone]

class FeatureCost(BaseModel):
    name: str
    hours: float
    cost: float

class TimelineTask(BaseModel):
    task: str
    start_date: str
    end_date: str

class EstimationOutput(BaseModel):
    executive_summary: str
    team_composition: TeamComposition
    cost_estimate: CostEstimate
    timeline_estimate: TimelineEstimate
    resource_allocation: dict
    explanation: str
    success_criteria: List[str]
    deliverables: List[str]
    features: List[FeatureCost]
    timeline: List[TimelineTask]
