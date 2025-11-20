# tools/schema.py
from __future__ import annotations

from typing import Any, Dict, List, Optional, Literal

from pydantic import BaseModel, Field


class CostRange(BaseModel):
    min: float
    likely: float
    max: float
    currency: str = "USD"


class DurationRange(BaseModel):
    min: float
    likely: float
    max: float
    unit: Literal["days", "weeks", "months"] = "months"


class TeamRoleCount(BaseModel):
    role: str
    count: int
    hourly_rate: Optional[float] = None


class MilestoneDetail(BaseModel):
    name: str
    duration_days: int
    dependencies: List[str] = Field(default_factory=list)


class Assumption(BaseModel):
    text: str
    type: Literal["critical", "default"] = "default"
    impact: Literal["high", "medium", "low"] = "medium"


class Driver(BaseModel):
    factor: str
    contribution_pct: float
    note: Optional[str] = None


class BlendComponent(BaseModel):
    method: str
    weight: float
    notes: Optional[str] = None


class EstimationOutput(BaseModel):
    method: str
    inputs_snapshot: Dict[str, Any] = Field(default_factory=dict)
    results: Dict[str, Any] = Field(default_factory=dict)
    drivers: List[Driver] = Field(default_factory=list)
    confidence: float = 0.0
    assumptions: List[Assumption] = Field(default_factory=list)
    cost_range: CostRange
    duration_range: DurationRange
    team: List[TeamRoleCount] = Field(default_factory=list)
    milestones: List[MilestoneDetail] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    blend_components: Optional[List[BlendComponent]] = None
