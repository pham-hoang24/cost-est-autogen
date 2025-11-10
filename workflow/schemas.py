from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, validator

SourceType = Literal["user", "inferred"]
PlatformType = Literal["web", "ios", "android", "desktop", "cloud", "other"]
MethodType = Literal["cocomo2", "fpa", "agile_sp", "analogous", "parametric", "blend"]
StatusType = Literal["OK", "NEEDS_CONFIRMATION", "BLOCKED", "ERROR"]


class NamedItem(BaseModel):
    name: str
    source: SourceType = Field(..., description="Origin of the information.")


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

    @validator("completeness_scores")
    def _clip_scores(cls, value: Dict[MethodType, float]) -> Dict[MethodType, float]:
        clipped = {}
        for method, score in value.items():
            clipped[method] = max(0.0, min(1.0, score))
        return clipped


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

