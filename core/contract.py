from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CalibrationProfile(BaseModel):
    """Defines calibration constants for estimation models."""
    profile_name: str = Field(..., description="Name of the calibration profile (e.g., 'default', 'org_calibrated')")
    cocomo_constants: Dict[str, float] = Field(default_factory=dict, description="COCOMO II constants (A, B, C, D)")
    fpa_weights: Dict[str, float] = Field(default_factory=dict, description="Function Point Analysis weights")

class ExtractedRequirements(BaseModel):
    """Raw requirements extracted from user input."""
    project_description: str = Field(..., description="The full project description provided by the user")
    baseline_fields: Dict[str, Any] = Field(default_factory=dict, description="Structured baseline fields (e.g., project_type, complexity)")
    feature_keywords: List[str] = Field(default_factory=list, description="Keywords identified in the description")

class InferredParameters(BaseModel):
    """Parameters inferred from requirements with confidence scores."""
    size_metrics: Dict[str, float] = Field(default_factory=dict, description="Estimated size metrics (e.g., ksloc, ufp)")
    complexity_score: float = Field(..., description="Normalized complexity score (0.0 - 1.0)")
    confidence: float = Field(..., description="Confidence in the inferred parameters (0.0 - 1.0)")
    sources: List[str] = Field(default_factory=list, description="Sources/reasoning for the inferred values")

class MethodSelection(BaseModel):
    """The selected estimation method and rationale."""
    selected_method: str = Field(..., description="The chosen estimation method (e.g., 'cocomo2')")
    rationale_facts: List[str] = Field(default_factory=list, description="Facts from context supporting this choice")
    rank: int = Field(..., description="Rank of the selected method in the scoring list")
    alternatives: List[str] = Field(default_factory=list, description="Alternative methods considered")

class EstimationOutput(BaseModel):
    """The final estimation result."""
    method: str = Field(..., description="The method used for this estimate")
    total_cost: float = Field(..., description="Total estimated cost")
    total_effort_months: float = Field(..., description="Total estimated effort in person-months")
    calibration_profile: CalibrationProfile = Field(..., description="The calibration profile used")
    details: Dict[str, Any] = Field(default_factory=dict, description="Detailed breakdown of the estimate")

class WorkflowContext(BaseModel):
    """The canonical contract for the workflow state."""
    project_id: str = Field(..., description="Unique identifier for the project")
    requirements: Optional[ExtractedRequirements] = None
    parameters: Optional[InferredParameters] = None
    selection: Optional[MethodSelection] = None
    estimation: Optional[EstimationOutput] = None
    conversation_history: List[Dict[str, str]] = Field(default_factory=list, description="History of the conversation")
