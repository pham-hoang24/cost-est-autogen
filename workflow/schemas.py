from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, validator

# Import method coefficients for tracking
try:
    from workflow.method_coefficients import MethodCoefficients
except ImportError:
    MethodCoefficients = None  # Fallback if module not yet available

SourceType = Literal["user", "inferred"]
PlatformType = Literal["web", "ios", "android", "desktop", "cloud", "other"]
MethodType = Literal["cocomo2", "fpa", "agile_sp", "analogous", "parametric", "bottomup", "blend"]
StatusType = Literal["OK", "NEEDS_CONFIRMATION", "BLOCKED", "ERROR"]


class NamedItem(BaseModel):
    name: str
    source: SourceType = Field(..., description="Origin of the information.")
    confidence: Optional[float] = Field(
        default=None, ge=0.0, le=1.0, description="Confidence score when inferred."
    )


class TraceEntry(BaseModel):
    field: str
    value: str
    source: SourceType
    note: Optional[str] = Field(default=None, description="Free-form explanation or diff.")


class ConstraintEntry(BaseModel):
    text: str
    source: SourceType


class PlatformEntry(BaseModel):
    name: PlatformType
    source: SourceType


class ExpansionV1(BaseModel):
    summary: str
    features: List[NamedItem] = Field(default_factory=list)
    non_functionals: List[NamedItem] = Field(default_factory=list)
    platforms: List[PlatformEntry] = Field(default_factory=list)
    constraints: List[ConstraintEntry] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    trace: List[TraceEntry] = Field(default_factory=list)
    missing_signals: List[str] = Field(default_factory=list)


class ParsedSize(BaseModel):
    ksloc: Optional[float] = None
    ufp: Optional[float] = None
    story_points: Optional[float] = None


class ParsedAgile(BaseModel):
    velocity_sp_per_sprint: Optional[float] = None
    sprint_days: Optional[int] = None


class ComplexitySignals(BaseModel):
    external_if_count: Optional[int] = None
    real_time: bool = False
    data_intensity: Optional[Literal["low", "med", "high"]] = None
    integrations_count: Optional[int] = None


class QualityTargets(BaseModel):
    reliability: Optional[Literal["low", "nominal", "high", "very_high"]] = None
    performance: Optional[Literal["low", "nominal", "high"]] = None
    availability_target: Optional[str] = None


class TeamProfile(BaseModel):
    pref_size: Optional[int] = None
    region: Optional[str] = None
    delivery_model: Optional[Literal["inhouse", "vendor", "hybrid"]] = None


class ReuseProfile(BaseModel):
    dm_pct: Optional[float] = None
    cm_pct: Optional[float] = None
    im_pct: Optional[float] = None
    aa_pct: Optional[float] = None
    su_pct: Optional[float] = None
    unfm: Optional[float] = None
    auto_translation_pct: Optional[float] = None
    atprod: float = 2400.0


class RateProfile(BaseModel):
    currency: str = "USD"
    blended_rate: Optional[float] = None
    region_rate_profile: Optional[str] = None


class ProvenanceEntry(BaseModel):
    field: str
    source: SourceType
    span: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class ParsedContextV1(BaseModel):
    size: ParsedSize = Field(default_factory=ParsedSize)
    agile: ParsedAgile = Field(default_factory=ParsedAgile)
    complexity_signals: ComplexitySignals = Field(default_factory=ComplexitySignals)
    platforms: List[PlatformType] = Field(default_factory=list)
    quality: QualityTargets = Field(default_factory=QualityTargets)
    team: TeamProfile = Field(default_factory=TeamProfile)
    reuse: ReuseProfile = Field(default_factory=ReuseProfile)
    rates: RateProfile = Field(default_factory=RateProfile)
    provenance: List[ProvenanceEntry] = Field(default_factory=list)
    missing_signals: List[str] = Field(default_factory=list)

    @validator("platforms", each_item=True)
    def _validate_platform(cls, value: PlatformType) -> PlatformType:
        return value


class SelectionPayload(BaseModel):
    primary: MethodType
    backups: List[MethodType] = Field(default_factory=list)
    rationale: str
    completeness_scores: Dict[MethodType, float] = Field(default_factory=dict)
    required_inputs: List[Dict[str, str]] = Field(
        default_factory=list,
        description="List of missing inputs with prompts and priorities.",
    )
    confidence_level: Literal["high", "medium", "low"] = "medium"
    blend_weights: Optional[Dict[MethodType, float]] = None

    @validator("completeness_scores")
    def _clip_scores(cls, value: Dict[MethodType, float]) -> Dict[MethodType, float]:
        clipped = {}
        for method, score in value.items():
            clipped[method] = max(0.0, min(1.0, score))
        return clipped

    @validator("blend_weights")
    def _normalize_blend(cls, value: Optional[Dict[MethodType, float]]) -> Optional[Dict[MethodType, float]]:
        if value is None:
            return None
        total = sum(value.values())
        if total <= 0:
            return None
        return {method: weight / total for method, weight in value.items()}


class EventEntry(BaseModel):
    type: str
    at: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any] = Field(default_factory=dict)


class ResponseEnvelope(BaseModel):
    status: StatusType
    expansion_draft: Optional[ExpansionV1] = None
    parsed: Optional[ParsedContextV1] = None
    selection: Optional[SelectionPayload] = None
    estimates: List[Dict[str, Any]] = Field(default_factory=list)
    events: List[EventEntry] = Field(default_factory=list)
    message_to_user: str = ""


class BaselineInputs(BaseModel):
    project_type: Optional[str] = None
    complexity: Optional[str] = None
    tech_stack: Optional[str] = None
    team_pref: Optional[int] = None
    region: Optional[str] = None
    project_duration: Optional[str] = None


class ProjectContext(BaseModel):
    project_id: str
    version: int = 0
    status: Literal[
        "NEW",
        "BASELINE_COLLECTED",
        "AWAITING_EXPANSION",
        "EXPANSION_CONFIRMED",
        "METHOD_SELECTION",
        "METHOD_SELECTED",
        "INPUTS_REQUESTED",
        "EXECUTING_ESTIMATION",
        "ESTIMATION_COMPLETE",
        "EXPLANATION_READY",
    ] = "NEW"
    baseline: BaselineInputs = Field(default_factory=BaselineInputs)
    user_description: str = ""
    expansion_draft: Optional[ExpansionV1] = None
    expansion_confirmed: Optional[ExpansionV1] = None
    parsed_context: Optional[ParsedContextV1] = None
    selection: Optional[SelectionPayload] = None
    estimates: List[Dict[str, Any]] = Field(default_factory=list)
    explanation: Optional[str] = None
    events: List[EventEntry] = Field(default_factory=list)
    missing_inputs_by_method: Dict[str, List[Dict[str, str]]] = Field(default_factory=dict)
    normalized_inputs: Dict[str, Any] = Field(default_factory=dict)
    derived_coefficients: Dict[str, Any] = Field(default_factory=dict)
    
    # NEW: Step 1 validation tracking
    step1_validated: bool = False
    validation_timestamp: Optional[datetime] = None
    
    # NEW: Method coefficients (from method_coefficients.py)
    method_coeffs: Optional[Any] = None  # Will import MethodCoefficients
    
    # NEW: Missing fields per method for Step 2
    missing_by_method: Dict[str, List[str]] = Field(default_factory=dict)
    inferred_fields: Dict[str, Any] = Field(default_factory=dict)
    full_report: Optional["CostEstimationReport"] = None


# Appending new schema models to workflow/schemas.py

# ============================================================================
# Frontend-Compatible Output Schemas
# ============================================================================

class FeatureEstimate(BaseModel):
    """Individual feature estimation with user stories"""
    name: str
    description: str
    tags: List[str]
    hours: float
    user_stories: List[str]
    cost: float


class TimelinePhase(BaseModel):
    """Project timeline phase"""
    task: str
    description: str
    start_date: str  # YYYY-MM-DD format
    end_date: str
    duration_weeks: int
    deliverables: List[str]


class TeamMember(BaseModel):
    """Team member specification"""
    level: str  # "senior", "mid", "junior", "ui/ux"
    count: int


class TeamComposition(BaseModel):
    """Complete team structure"""
    developers: List[TeamMember]
    designers: List[TeamMember] = Field(default_factory=list)
    other_roles: List[TeamMember] = Field(default_factory=list)


class CostEstimate(BaseModel):
    """Detailed cost breakdown"""
    total_cost: float
    labor_cost: float
    infrastructure_cost: float
    other_expenses: float
    confidence_level: str  # "HIGH|MEDIUM|LOW - description"


class TimelineEstimate(BaseModel):
    """Timeline summary"""
    total_duration: str  # "X months"


class ResourceAllocation(BaseModel):
    """Resource recommendations"""
    recommended_team_size: int


class MethodEstimate(BaseModel):
    """Individual method estimation result"""
    methodology: str
    cost: float
    duration: str
    weight: float
    breakdown: Dict[str, float]  # development, testing, management, infrastructure, contingency


class EstimationResult(BaseModel):
    """Complete estimation result"""
    executive_summary: str
    team_composition: TeamComposition
    cost_estimate: CostEstimate
    timeline_estimate: TimelineEstimate
    resource_allocation: ResourceAllocation
    explanation: str
    success_criteria: List[str]
    deliverables: List[str]
    features: List[FeatureEstimate]
    timeline: List[TimelinePhase]
    charts: Dict[str, Any]
    estimation_method: str
    methods_used: List[str]
    individual_estimates: Dict[str, MethodEstimate]
    effort_person_months: float
    warning: Optional[str] = None


class ProjectData(BaseModel):
    """Project context and metadata"""
    original_project_type: str
    project_type: str  # normalized: "organic", "semi-detached", "embedded"
    technical_complexity: Dict[str, bool]
    project_context_description: str
    project_requirements: str
    functional_requirements: List[str]


class CostEstimationReport(BaseModel):
    """Complete cost estimation report for frontend"""
    report_title: str = "Cost Estimation Report"
    generated_at: str
    project_details: Dict[str, Any]
    estimation_config: Dict[str, Any]
    timestamp: str
    project_data: ProjectData
    estimation_result: EstimationResult
