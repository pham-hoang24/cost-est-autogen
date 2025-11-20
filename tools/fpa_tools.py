"""
tools/fpa_tools.py
==================

Utilities for producing Function Point Analysis (FPA) based estimates that
conform to the shared `EstimationOutput` schema.
"""

from dataclasses import dataclass
from datetime import date, datetime, timedelta
import math
from typing import Dict, Iterable, List, Mapping, MutableMapping, Optional, Sequence, Union

from .schema import (
    Assumption,
    CostRange,
    Driver,
    DurationRange,
    EstimationOutput,
    MilestoneDetail,
    TeamRoleCount,
)

Number = Union[int, float]


@dataclass
class FeatureInput:
    """Helper dataclass for optional feature effort distribution."""

    name: str
    effort_percent: float


_COMPONENT_ALIASES: Dict[str, str] = {
    "ei": "external_inputs",
    "external_input": "external_inputs",
    "external_inputs": "external_inputs",
    "input": "external_inputs",
    "inputs": "external_inputs",
    "eo": "external_outputs",
    "external_output": "external_outputs",
    "external_outputs": "external_outputs",
    "output": "external_outputs",
    "outputs": "external_outputs",
    "eq": "external_inquiries",
    "external_inquiry": "external_inquiries",
    "external_inquiries": "external_inquiries",
    "inquiry": "external_inquiries",
    "inquiries": "external_inquiries",
    "ilf": "internal_logical_files",
    "internal_logical_file": "internal_logical_files",
    "internal_logical_files": "internal_logical_files",
    "logical_file": "internal_logical_files",
    "logical_files": "internal_logical_files",
    "eif": "external_interface_files",
    "external_interface_file": "external_interface_files",
    "external_interface_files": "external_interface_files",
    "interface_file": "external_interface_files",
    "interface_files": "external_interface_files",
}

_COMPLEXITY_ALIASES: Dict[str, str] = {
    "l": "low",
    "low": "low",
    "simple": "low",
    "a": "average",
    "avg": "average",
    "average": "average",
    "medium": "average",
    "m": "average",
    "h": "high",
    "high": "high",
    "complex": "high",
}

_COMPONENT_WEIGHTS: Dict[str, Dict[str, int]] = {
    "external_inputs": {"low": 3, "average": 4, "high": 6},
    "external_outputs": {"low": 4, "average": 5, "high": 7},
    "external_inquiries": {"low": 3, "average": 4, "high": 6},
    "internal_logical_files": {"low": 7, "average": 10, "high": 15},
    "external_interface_files": {"low": 5, "average": 7, "high": 10},
}

_GSC_DEFINITIONS: Dict[str, Dict[str, str]] = {
    "data_communications": {
        "description": "Degree of data communication required (APIs, network throughput, protocols).",
        "rating_guidance": "Higher with numerous interfaces, high bandwidth, or real-time comms.",
    },
    "distributed_processing": {
        "description": "Extent of distributed processing across nodes or services.",
        "rating_guidance": "Higher for microservices, orchestrated workloads, or parallel processing.",
    },
    "performance": {
        "description": "Performance constraints for latency and throughput.",
        "rating_guidance": "Higher for stringent response time SLAs or heavy concurrency.",
    },
    "heavily_used_configuration": {
        "description": "Use of heavily used hardware or software configurations.",
        "rating_guidance": "Higher when deploying onto resource constrained or shared environments.",
    },
    "transaction_rate": {
        "description": "Expected transaction volume and peak loads.",
        "rating_guidance": "Higher with frequent transactions, bursty traffic, or 24/7 processing.",
    },
    "online_data_entry": {
        "description": "Volume and complexity of online data entry.",
        "rating_guidance": "Higher for numerous interactive forms and client-side validation.",
    },
    "end_user_efficiency": {
        "description": "Importance of end-user efficiency and usability.",
        "rating_guidance": "Higher when UX/productivity outcomes drive requirements.",
    },
    "online_update": {
        "description": "Complexity of online updates to internal data stores.",
        "rating_guidance": "Higher for frequent, concurrent updates with integrity constraints.",
    },
    "complex_processing": {
        "description": "Degree of complex internal computation or rules.",
        "rating_guidance": "Higher with advanced analytics, rule engines, or algorithmic workloads.",
    },
    "reusability": {
        "description": "Need for reusability and configurability.",
        "rating_guidance": "Higher when components must be generalized for future reuse.",
    },
    "installation_ease": {
        "description": "Operational effort required to install or deploy.",
        "rating_guidance": "Higher for zero-downtime, multi-env installs, or strict deployment constraints.",
    },
    "operational_ease": {
        "description": "Monitoring, observability, backup, and recovery requirements.",
        "rating_guidance": "Higher with advanced ops automation or resilience needs.",
    },
    "multiple_sites": {
        "description": "Number and diversity of installation sites.",
        "rating_guidance": "Higher for multi-region, multi-tenant, or localized deployments.",
    },
    "facilitate_change": {
        "description": "Ease of change, maintainability, and configurability.",
        "rating_guidance": "Higher when rapid change or extensibility is paramount.",
    },
}


def list_component_weights() -> Dict[str, Dict[str, int]]:
    """Expose the canonical IFPUG component weight matrix."""

    return {component: weights.copy() for component, weights in _COMPONENT_WEIGHTS.items()}


def list_gsc_definitions() -> Dict[str, Dict[str, str]]:
    """Return the 14 General System Characteristic descriptors."""

    return {name: info.copy() for name, info in _GSC_DEFINITIONS.items()}


def _normalise_component_name(raw: str) -> str:
    token = raw.strip().lower().replace("-", "_").replace(" ", "_")
    if token not in _COMPONENT_ALIASES:
        raise ValueError(f"Unrecognized function point component '{raw}'.")
    return _COMPONENT_ALIASES[token]


def _normalise_complexity(raw: str) -> str:
    token = raw.strip().lower()
    if token not in _COMPLEXITY_ALIASES:
        raise ValueError(f"Invalid complexity level '{raw}'. Expected one of low, average, high.")
    return _COMPLEXITY_ALIASES[token]


def _ensure_non_negative_int(value: Number, *, field: str) -> int:
    try:
        numeric = float(value)
    except Exception as exc:
        raise ValueError(f"Invalid numeric value '{value}' for {field}.") from exc
    if numeric < 0:
        raise ValueError(f"{field} must be non-negative.")
    return int(round(numeric))


def normalise_function_counts(
    raw_counts: Mapping[str, Union[Number, Mapping[str, Number]]],
    default_complexity: str = "average",
) -> Dict[str, Dict[str, int]]:
    """
    Convert user-provided function counts into a normalized structure.

    Parameters
    ----------
    raw_counts:
        Mapping of component names (or aliases) to either a simple count or a
        nested mapping of complexity level to count.
    default_complexity:
        Complexity bucket to assume when a simple integer is provided.
    """

    normalized: Dict[str, Dict[str, int]] = {
        component: {"low": 0, "average": 0, "high": 0} for component in _COMPONENT_WEIGHTS
    }
    default_complexity = _normalise_complexity(default_complexity)

    for raw_component, raw_value in raw_counts.items():
        component = _normalise_component_name(raw_component)
        if isinstance(raw_value, Mapping):
            for raw_complexity, count in raw_value.items():
                complexity = _normalise_complexity(raw_complexity)
                normalized[component][complexity] += _ensure_non_negative_int(
                    count, field=f"{component}.{complexity}"
                )
        else:
            normalized[component][default_complexity] += _ensure_non_negative_int(
                raw_value, field=component
            )

    return normalized


def normalise_gsc_ratings(
    gsc_ratings: Optional[Mapping[str, Union[str, Number]]] = None,
    *,
    default_rating: int = 3,
) -> Dict[str, int]:
    """Normalise GSC ratings to integers within 0–5."""

    normalized = {name: max(0, min(5, int(default_rating))) for name in _GSC_DEFINITIONS}
    if not gsc_ratings:
        return normalized

    for raw_name, raw_value in gsc_ratings.items():
        token = raw_name.strip().lower().replace("-", "_").replace(" ", "_")
        if token not in _GSC_DEFINITIONS:
            raise ValueError(f"Unknown GSC '{raw_name}'.")
        try:
            rating = int(round(float(raw_value)))
        except Exception as exc:
            raise ValueError(f"Invalid rating '{raw_value}' for '{raw_name}'.") from exc
        normalized[token] = max(0, min(5, rating))
    return normalized


def calculate_unadjusted_function_points(
    counts: Mapping[str, Mapping[str, int]]
) -> Dict[str, Union[int, Dict[str, int]]]:
    """Calculate subtotals and total UFP for a normalised count structure."""

    total = 0
    breakdown: Dict[str, Union[int, Dict[str, int]]] = {}

    for component, complexities in counts.items():
        component_total = 0
        for complexity, count in complexities.items():
            weight = _COMPONENT_WEIGHTS[component][complexity]
            component_total += count * weight
        breakdown[component] = {
            "counts": complexities,
            "weight": _COMPONENT_WEIGHTS[component],
            "subtotal": component_total,
        }
        total += component_total

    breakdown["total_ufp"] = total
    return breakdown


def calculate_caf(gsc_ratings: Mapping[str, int]) -> Dict[str, Union[int, float]]:
    """Compute Total Degree of Influence (TDI) and CAF multiplier."""

    tdi = 0
    for name in _GSC_DEFINITIONS:
        rating = gsc_ratings.get(name, 0)
        if not isinstance(rating, int):
            raise ValueError(f"GSC '{name}' rating must be an integer.")
        if rating < 0 or rating > 5:
            raise ValueError(f"GSC '{name}' rating must be within 0-5.")
        tdi += rating
    caf = 0.65 + (0.01 * tdi)
    return {"tdi": tdi, "caf": caf}


def _normalize_features(features: Optional[Iterable[FeatureInput]], count: int = 3) -> List[FeatureInput]:
    if not features:
        default_weight = 100 / count
        return [
            FeatureInput(name="Core Functionality", effort_percent=default_weight),
            FeatureInput(name="Integrations & Interfaces", effort_percent=default_weight),
            FeatureInput(name="Testing & Quality Assurance", effort_percent=default_weight),
        ]

    normalized: List[FeatureInput] = []
    total = sum(max(0.0, feature.effort_percent) for feature in features)
    if total == 0:
        return _normalize_features(None, count=count)

    for feature in features:
        normalized.append(
            FeatureInput(
                name=feature.name,
                effort_percent=max(0.0, feature.effort_percent) / total * 100,
            )
        )
    return normalized


def _build_team_roles(staff_count: int, hourly_rate: float) -> List[TeamRoleCount]:
    if staff_count <= 0:
        return []

    if staff_count <= 2:
        return [
            TeamRoleCount(role="senior engineer", count=staff_count, hourly_rate=round(hourly_rate * 1.25, 2))
        ]

    senior = max(1, math.floor(staff_count * 0.3))
    mid = max(1, math.floor(staff_count * 0.45))
    junior = max(0, staff_count - senior - mid)

    roles: List[TeamRoleCount] = []
    if senior > 0:
        roles.append(TeamRoleCount(role="senior engineer", count=senior, hourly_rate=round(hourly_rate * 1.25, 2)))
    if mid > 0:
        roles.append(TeamRoleCount(role="mid engineer", count=mid, hourly_rate=round(hourly_rate, 2)))
    if junior > 0:
        roles.append(TeamRoleCount(role="junior engineer", count=junior, hourly_rate=round(hourly_rate * 0.75, 2)))

    return roles


def _build_timeline(schedule_months: float, start: date) -> List[Dict[str, str]]:
    tasks: List[Dict[str, str]] = []
    phase_ratios = [0.25, 0.5, 0.25]
    phase_names = ["Inception & Requirements", "Construction & Iteration", "Stabilization & Deployment"]

    current_date = start
    for name, ratio in zip(phase_names, phase_ratios):
        duration_days = max(1, round(schedule_months * ratio * 30))
        end_date = current_date + timedelta(days=duration_days)
        tasks.append(
            {
                "task": name,
                "start_date": current_date.isoformat(),
                "end_date": end_date.isoformat(),
            }
        )
        current_date = end_date

    return tasks


def _build_milestones(schedule_months: float) -> List[MilestoneDetail]:
    return [
        MilestoneDetail(name="Inception & Requirements", duration_days=max(15, int(schedule_months * 0.25 * 30))),
        MilestoneDetail(name="Construction & Iteration", duration_days=max(30, int(schedule_months * 0.5 * 30))),
        MilestoneDetail(name="Stabilization & Deployment", duration_days=max(15, int(schedule_months * 0.25 * 30))),
    ]


def generate_fpa_estimation(
    project_name: str,
    *,
    function_counts: Mapping[str, Union[Number, Mapping[str, Number]]],
    gsc_ratings: Optional[Mapping[str, Union[str, Number]]] = None,
    features: Optional[Iterable[FeatureInput]] = None,
    hours_per_fp: float = 12.0,
    hourly_rate: float = 120.0,
    infrastructure_pct: float = 0.12,
    other_expenses_pct: float = 0.06,
    conversion_factor_slc: Optional[float] = None,
    start: Optional[date] = None,
) -> EstimationOutput:
    """
    Produce an estimation payload using Function Point Analysis.

    Parameters
    ----------
    project_name:
        Human readable name for narrative elements.
    function_counts:
        Mapping of component names to counts or complexity buckets.
    gsc_ratings:
        Optional mapping of the 14 GSCs with ratings from 0 to 5.
    features:
        Optional iterable of `FeatureInput` entries describing effort split.
    hours_per_fp:
        Productivity assumption (labor hours per function point).
    hourly_rate:
        Blended hourly rate for labor cost calculations.
    infrastructure_pct:
        Infrastructure/tooling overhead as a fraction of labor cost.
    other_expenses_pct:
        Miscellaneous overhead as a fraction of labor cost.
    conversion_factor_slc:
        Optional conversion factor from FP to KSLOC for downstream models.
    start:
        Optional project start date (defaults to today).
    """

    if hours_per_fp <= 0:
        raise ValueError("hours_per_fp must be positive.")
    if hourly_rate <= 0:
        raise ValueError("hourly_rate must be positive.")
    if infrastructure_pct < 0 or other_expenses_pct < 0:
        raise ValueError("Cost percentages must be non-negative.")

    normalized_counts = normalise_function_counts(function_counts)
    ufp_breakdown = calculate_unadjusted_function_points(normalized_counts)
    total_ufp = int(ufp_breakdown["total_ufp"])

    normalized_gsc = normalise_gsc_ratings(gsc_ratings)
    caf_info = calculate_caf(normalized_gsc)
    caf = caf_info["caf"]

    adjusted_fp = total_ufp * caf
    total_hours = adjusted_fp * hours_per_fp
    effort_pm = total_hours / 152.0
    schedule_months = max(1.0, (effort_pm ** 0.38) * 1.05)
    staff = max(1, round(effort_pm / schedule_months))

    labor_cost = total_hours * hourly_rate
    infrastructure_cost = labor_cost * infrastructure_pct
    other_expenses = labor_cost * other_expenses_pct
    total_cost = labor_cost + infrastructure_cost + other_expenses

    start_date = start or date.today()
    timeline_tasks = _build_timeline(schedule_months, start_date)
    milestones = _build_milestones(schedule_months)

    feature_inputs = _normalize_features(features)
    feature_costs: List[Dict[str, float]] = []
    for feature in feature_inputs:
        hours = total_hours * (feature.effort_percent / 100.0)
        cost = hours * hourly_rate
        feature_costs.append(
            {
                "name": feature.name,
                "hours": round(hours, 2),
                "cost": round(cost, 2),
            }
        )

    executive_summary = (
        f"Function Point Analysis for {project_name} yields {total_ufp} unadjusted function points, "
        f"adjusted by a CAF of {caf:.3f} to {adjusted_fp:.1f} FP. Estimated effort is {effort_pm:.1f} "
        f"person-months over approximately {schedule_months:.1f} months with a team of {staff} engineers."
    )

    explanation = (
        "Unadjusted function points were calculated using standard IFPUG weights across external inputs, "
        "outputs, inquiries, logical files, and interface files. The Complexity Adjustment Factor derives "
        "from the 14 General System Characteristics to tailor the effort multiplier. Adjusted function "
        "points convert to effort and cost via the configured productivity and rate assumptions."
    )

    resource_allocation: Dict[str, Union[str, float, Dict[str, Union[int, float, Dict[str, int]]]]] = {
        "project_name": project_name,
        "team_size": staff,
        "effort_person_months": round(effort_pm, 2),
        "estimated_duration_months": round(schedule_months, 2),
        "hours_per_fp": hours_per_fp,
        "hourly_rate": hourly_rate,
        "total_ufp": total_ufp,
        "caf": round(caf, 3),
        "tdi": caf_info["tdi"],
        "component_breakdown": {
            component: {
                "counts": details["counts"],
                "weights": details["weight"],
                "subtotal": details["subtotal"],
            }
            for component, details in ufp_breakdown.items()
            if component != "total_ufp"
        },
        "gsc_ratings": normalized_gsc,
    }

    if conversion_factor_slc:
        resource_allocation["estimated_ksloc"] = adjusted_fp * conversion_factor_slc

    success_criteria = [
        "Maintain requirements stability to keep function point growth within ±10%.",
        "Deliver each phase without exceeding the modeled schedule by more than one iteration.",
        "Keep actual labor hours within ±12% of the projected effort.",
    ]

    deliverables = [
        "Detailed Function Point estimation report with component breakdown.",
        "Implementation roadmap aligned to modeled milestones.",
        "Risk mitigation plan for high-impact General System Characteristics.",
    ]

    inputs_snapshot = {
        "project_name": project_name,
        "function_counts": function_counts,
        "gsc_ratings": gsc_ratings,
        "hours_per_fp": hours_per_fp,
        "hourly_rate": hourly_rate,
        "infrastructure_pct": infrastructure_pct,
        "other_expenses_pct": other_expenses_pct,
        "conversion_factor_slc": conversion_factor_slc,
    }

    cost_range = CostRange(
        min=round(total_cost * 0.9, 2),
        likely=round(total_cost, 2),
        max=round(total_cost * 1.1, 2),
    )

    duration_range = DurationRange(
        min=round(schedule_months * 0.9, 2),
        likely=round(schedule_months, 2),
        max=round(schedule_months * 1.1, 2),
    )

    results_block = {
        "effort_pm": round(effort_pm, 2),
        "duration_months": round(schedule_months, 2),
        "cost_breakdown": [
            {"category": "Labor", "cost": round(labor_cost, 2)},
            {"category": "Infrastructure", "cost": round(infrastructure_cost, 2)},
            {"category": "Other Expenses", "cost": round(other_expenses, 2)},
        ],
        "feature_breakdown": feature_costs,
        "timeline": timeline_tasks,
        "resource_allocation": resource_allocation,
        "ufp_breakdown": {
            component: {
                "counts": details["counts"],
                "weights": details["weight"],
                "subtotal": details["subtotal"],
            }
            for component, details in ufp_breakdown.items()
            if component != "total_ufp"
        },
        "deliverables": deliverables,
        "executive_summary": executive_summary,
        "explanation": explanation,
    }

    component_impacts = sorted(
        (
            (component, details["subtotal"])
            for component, details in ufp_breakdown.items()
            if component != "total_ufp"
        ),
        key=lambda item: item[1],
        reverse=True,
    )[:3]
    drivers: List[Driver] = [
        Driver(
            factor=f"component:{component}",
            contribution_pct=round((subtotal / total_ufp) * 100, 2) if total_ufp else 0.0,
            note="Function point contribution",
        )
        for component, subtotal in component_impacts
    ]

    drivers.append(
        Driver(
            factor="CAF",
            contribution_pct=round((caf - 1.0) * 100, 2),
            note="Complexity Adjustment Factor influence",
        )
    )

    assumptions_objects = [
        Assumption(text="Function point weights follow standard IFPUG definitions."),
        Assumption(text="CAF derives from provided GSC ratings with defaults applied where missing."),
        Assumption(text="Conversion to KSLOC (if provided) assumes linear backfiring."),
    ]

    team_roles = _build_team_roles(staff, hourly_rate)

    return EstimationOutput(
        method="fpa",
        inputs_snapshot=inputs_snapshot,
        results=results_block,
        drivers=drivers,
        confidence=0.6,
        assumptions=assumptions_objects,
        cost_range=cost_range,
        duration_range=duration_range,
        team=team_roles,
        milestones=milestones,
        recommendations=success_criteria,
    )


__all__ = [
    "FeatureInput",
    "calculate_caf",
    "calculate_unadjusted_function_points",
    "generate_fpa_estimation",
    "list_component_weights",
    "list_gsc_definitions",
    "normalise_function_counts",
    "normalise_gsc_ratings",
]

