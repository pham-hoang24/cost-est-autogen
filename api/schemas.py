"""
api/schemas.py
==============

Pydantic request/response models for the Cost Estimation API.
All data models are centralized here for easy maintenance and testing.
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any


# =============================================================================
# Baseline & Project Models
# =============================================================================

class BaselineInputs(BaseModel):
    """Baseline project inputs from Step 1 form."""
    project_type: str = Field(..., description="Type of the project e.g. 'web application'")
    complexity: str = Field(..., description="Complexity level: low, medium, high, very high")
    tech_stack: str = Field(..., description="Primary tech stack")
    team_pref: int = Field(..., description="Desired team size")
    region: str = Field(..., description="Primary delivery region")
    duration: Optional[str] = Field(None, description="Expected duration")
    description: Optional[str] = Field(None, description="Project description")


class MethodSelection(BaseModel):
    """Method selection response item."""
    method_name: str
    description: str


# =============================================================================
# Estimation Models
# =============================================================================

class MissingInput(BaseModel):
    """Describes a missing input required for estimation."""
    field: str
    prompt: str
    priority: str  # "critical", "high", "medium", "low"


class EstimateResult(BaseModel):
    """Result of a single estimation method."""
    effort_person_months: Optional[float] = None
    duration_months: Optional[float] = None
    total_cost: Optional[float] = None
    currency: str = "USD"


class MethodResponse(BaseModel):
    """Response from a method estimation attempt."""
    method_name: str
    is_sufficient: bool
    missing_inputs: List[MissingInput] = []
    estimate: Optional[EstimateResult] = None
    diagnostics: Dict[str, Any] = {}
    explanation: Optional[str] = None


class EstimationRequest(BaseModel):
    """Request for generating an estimation."""
    session_id: Optional[str] = None
    method_name: str
    baseline_inputs: BaselineInputs
    additional_inputs: Dict[str, Any] = {}


class RunEstimationRequest(BaseModel):
    """Request to run estimation with a specific method."""
    session_id: str
    method_id: str  # e.g., "cocomo", "function-points", "story-points"
    inputs: Optional[Dict[str, Any]] = None  # User-provided inputs (e.g., {"ksloc": 50})


class HybridRequest(BaseModel):
    """Request for hybrid/blended estimation."""
    baseline_inputs: BaselineInputs


# =============================================================================
# Chat Models
# =============================================================================

class ChatRequest(BaseModel):
    """Request for chat endpoint."""
    session_id: str
    message: str
    history: List[Dict[str, str]] = []
    baseline_inputs: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    response: str
    is_ready: bool
    recommended_methods: List[str] = []
    summary_confirmed: bool = False


# =============================================================================
# Method Selection Models
# =============================================================================

class SelectMethodRequest(BaseModel):
    """Request to select and execute a specific estimation method."""
    session_id: str
    method_id: str
    input_overrides: Optional[Dict[str, Any]] = None


# =============================================================================
# Validation Models
# =============================================================================

class ValidateStep1Request(BaseModel):
    """Request for Step 1 validation."""
    session_id: str
    project_type: str
    complexity: str
    tech_stack: str
    team_pref: int
    region: str
    project_duration: Optional[str] = None
    description: Optional[str] = None


class ValidateStep1Response(BaseModel):
    """Response from Step 1 validation."""
    status: str  # "ok" or "error"
    is_valid: bool
    errors: List[str] = []
    context_status: Optional[str] = None


__all__ = [
    "BaselineInputs",
    "MethodSelection",
    "MissingInput",
    "EstimateResult",
    "MethodResponse",
    "EstimationRequest",
    "RunEstimationRequest",
    "HybridRequest",
    "ChatRequest",
    "ChatResponse",
    "SelectMethodRequest",
    "ValidateStep1Request",
    "ValidateStep1Response",
]

