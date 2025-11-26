"""
Method-specific coefficient models for Step 1 validation and requirement tracking.
These models track what's known and what's missing for each estimation method.
"""

from __future__ import annotations
from typing import Dict, List, Optional, Literal, Any
from pydantic import BaseModel, Field


class COCOMOCoeffs(BaseModel):
    """COCOMO II method coefficients and parameters"""
    mode: Optional[Literal["organic", "semi_detached", "embedded"]] = None
    size_measure: Literal["kloc", "function_points"] = "kloc"
    effort_multipliers: Dict[str, float] = Field(default_factory=dict)
    scale_factors: Dict[str, float] = Field(default_factory=dict)
    size_value: Optional[float] = None  # KLOC or FP count


class AnalogousCoeffs(BaseModel):
    """Analogous estimation method coefficients"""
    tshirt_size: Optional[Literal["xs", "s", "m", "l", "xl"]] = None
    reference_project_id: Optional[str] = None
    adjustment_factors: Dict[str, float] = Field(default_factory=dict)


class FPACoeffs(BaseModel):
    """Function Point Analysis coefficients"""
    ufp: Optional[int] = None  # Unadjusted Function Points
    vaf: Optional[float] = None  # Value Adjustment Factor
    language_gearing: Optional[float] = None


class StoryPointsCoeffs(BaseModel):
    """Agile Story Points estimation coefficients"""
    team_velocity: Optional[int] = None
    avg_hours_per_point: Optional[float] = None
    sprint_length_weeks: Optional[int] = 2
    total_story_points: Optional[int] = None


class ParametricCoeffs(BaseModel):
    """Parametric estimation coefficients"""
    regression_model: Optional[str] = None
    parameters: Dict[str, float] = Field(default_factory=dict)


class BottomUpCoeffs(BaseModel):
    """Bottom-up estimation coefficients"""
    task_breakdown: List[Dict[str, Any]] = Field(default_factory=list)
    identified_tasks_count: Optional[int] = None


class MethodCoefficients(BaseModel):
    """
    Container for all method-specific coefficients.
    Tracks what's been provided vs what's still needed for each method.
    """
    cocomo2: COCOMOCoeffs = Field(default_factory=COCOMOCoeffs)
    analogous: AnalogousCoeffs = Field(default_factory=AnalogousCoeffs)
    fpa: FPACoeffs = Field(default_factory=FPACoeffs)
    story_points: StoryPointsCoeffs = Field(default_factory=StoryPointsCoeffs)
    parametric: ParametricCoeffs = Field(default_factory=ParametricCoeffs)
    bottom_up: BottomUpCoeffs = Field(default_factory=BottomUpCoeffs)
