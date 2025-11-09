"""
tools/cocomo_tools.py
=====================

Utility helpers for generating COCOMO II Post-Architecture estimates that
conform to the `EstimationOutput` schema defined in `tools/schema.py`.
"""

from dataclasses import dataclass
from datetime import date, timedelta
import math
from typing import Dict, Iterable, List, Mapping, MutableMapping, Optional, Union

from .schema import (
    CostEstimate,
    EstimationOutput,
    FeatureCost,
    Milestone,
    RoleCount,
    TeamComposition,
    TimelineEstimate,
    TimelineTask,
)

Number = Union[int, float]

_RATING_ALIASES: Dict[str, str] = {
    "vl": "very_low",
    "verylow": "very_low",
    "low": "low",
    "l": "low",
    "nominal": "nominal",
    "n": "nominal",
    "hi": "high",
    "high": "high",
    "h": "high",
    "vh": "very_high",
    "veryhigh": "very_high",
    "xh": "extra_high",
    "extra": "extra_high",
    "extra_high": "extra_high",
}

_SCALE_FACTORS: Dict[str, Dict[str, float]] = {
    "prec": {"very_low": 6.20, "low": 4.96, "nominal": 3.72, "high": 2.48, "very_high": 1.24, "extra_high": 0.00},
    "flex": {"very_low": 5.07, "low": 4.05, "nominal": 3.04, "high": 2.03, "very_high": 1.01, "extra_high": 0.00},
    "resl": {"very_low": 7.07, "low": 5.65, "nominal": 4.24, "high": 2.83, "very_high": 1.41, "extra_high": 0.00},
    "team": {"very_low": 5.48, "low": 4.38, "nominal": 3.29, "high": 2.19, "very_high": 1.10, "extra_high": 0.00},
    "pmat": {"very_low": 7.80, "low": 6.24, "nominal": 4.68, "high": 3.12, "very_high": 1.56, "extra_high": 0.00},
}

_COST_DRIVERS: Dict[str, Dict[str, float]] = {
    "rely": {"very_low": 0.82, "low": 0.92, "nominal": 1.00, "high": 1.10, "very_high": 1.26, "extra_high": 1.40},
    "data": {"low": 0.90, "nominal": 1.00, "high": 1.14, "very_high": 1.28, "extra_high": 1.40},
    "cplx": {"very_low": 0.73, "low": 0.87, "nominal": 1.00, "high": 1.17, "very_high": 1.34, "extra_high": 1.74},
    "ruse": {"low": 0.95, "nominal": 1.00, "high": 1.07, "very_high": 1.15, "extra_high": 1.24},
    "docu": {"very_low": 0.81, "low": 0.91, "nominal": 1.00, "high": 1.11, "very_high": 1.23, "extra_high": 1.35},
    "time": {"nominal": 1.00, "high": 1.11, "very_high": 1.29, "extra_high": 1.63},
    "stor": {"nominal": 1.00, "high": 1.05, "very_high": 1.17, "extra_high": 1.46},
    "pvol": {"low": 0.87, "nominal": 1.00, "high": 1.15, "very_high": 1.30},
    "acap": {"very_low": 1.42, "low": 1.19, "nominal": 1.00, "high": 0.85, "very_high": 0.71},
    "pcap": {"very_low": 1.34, "low": 1.15, "nominal": 1.00, "high": 0.88, "very_high": 0.76},
    "pcon": {"very_low": 1.29, "low": 1.12, "nominal": 1.00, "high": 0.90, "very_high": 0.81},
    "apex": {"very_low": 1.22, "low": 1.10, "nominal": 1.00, "high": 0.88, "very_high": 0.81},
    "plex": {"very_low": 1.19, "low": 1.09, "nominal": 1.00, "high": 0.91, "very_high": 0.85},
    "ltex": {"very_low": 1.20, "low": 1.09, "nominal": 1.00, "high": 0.91, "very_high": 0.84},
    "tool": {"very_low": 1.17, "low": 1.09, "nominal": 1.00, "high": 0.90, "very_high": 0.78},
    "site": {"very_low": 1.22, "low": 1.09, "nominal": 1.00, "high": 0.93, "very_high": 0.86, "extra_high": 0.80},
    "sced": {"very_low": 1.43, "low": 1.14, "nominal": 1.00, "high": 1.00, "very_high": 1.00},
}


@dataclass
class FeatureInput:
    """Helper dataclass to capture lightweight feature requirements."""

    name: str
    effort_percent: float


def list_available_ratings() -> List[str]:
    return ["very_low", "low", "nominal", "high", "very_high", "extra_high"]


def get_scale_factor_info() -> Dict[str, Dict[str, Union[str, List[str], Dict[str, float]]]]:
    descriptions = {
        "prec": "Precedentedness - team familiarity with similar projects",
        "flex": "Development flexibility - degree of process constraints",
        "resl": "Architecture & risk resolution - robustness of risk mitigation",
        "team": "Team cohesion - communication effectiveness",
        "pmat": "Process maturity - organizational process capability",
    }
    return {
        factor: {
            "description": descriptions[factor],
            "valid_ratings": list(options.keys()),
            "multipliers": options,
        }
        for factor, options in _SCALE_FACTORS.items()
    }


def get_cost_driver_info() -> Dict[str, Dict[str, Dict[str, Union[str, List[str], Dict[str, float]]]]]:
    descriptions = {
        "rely": "Required software reliability",
        "data": "Database size",
        "cplx": "Product complexity",
        "ruse": "Required reusability",
        "docu": "Documentation needs",
        "time": "Execution time constraints",
        "stor": "Main storage constraints",
        "pvol": "Platform volatility",
        "acap": "Analyst capability",
        "pcap": "Programmer capability",
        "pcon": "Personnel continuity",
        "apex": "Applications experience",
        "plex": "Platform experience",
        "ltex": "Language and tool experience",
        "tool": "Use of software tools",
        "site": "Multisite development",
        "sced": "Required development schedule",
    }
    categories = {
        "Product": ["rely", "data", "cplx", "ruse", "docu"],
        "Platform": ["time", "stor", "pvol"],
        "Personnel": ["acap", "pcap", "pcon", "apex", "plex", "ltex"],
        "Project": ["tool", "site", "sced"],
    }
    result: Dict[str, Dict[str, Dict[str, Union[str, List[str], Dict[str, float]]]]] = {}
    for category, driver_names in categories.items():
        result[category] = {}
        for driver in driver_names:
            result[category][driver] = {
                "description": descriptions[driver],
                "valid_ratings": list(_COST_DRIVERS[driver].keys()),
                "multipliers": _COST_DRIVERS[driver],
            }
    return result


def _normalise_key(raw_key: str) -> str:
    return raw_key.strip().lower()


def _normalise_rating(
    raw_value: Union[str, Number],
    options: Mapping[str, float],
    *,
    factor_name: str,
) -> float:
    if isinstance(raw_value, (int, float)):
        return float(raw_value)
    token = str(raw_value).strip().lower().replace(" ", "_").replace("-", "_")
    token = _RATING_ALIASES.get(token, token)
    if token not in options:
        raise ValueError(
            f"Invalid rating '{raw_value}' for factor '{factor_name}'. Expected one of {sorted(options)}."
        )
    return options[token]


def _normalize_features(features: Optional[Iterable[FeatureInput]], count: int = 3) -> List[FeatureInput]:
    """Ensure we always operate on a non-empty set of features with relative weights."""
    if not features:
        default_weight = 100 / count
        return [
            FeatureInput(name="Core Functionality", effort_percent=default_weight),
            FeatureInput(name="Integration & APIs", effort_percent=default_weight),
            FeatureInput(name="Testing & QA", effort_percent=default_weight),
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


def _build_team_composition(staff_count: int) -> TeamComposition:
    """Derive a rough team distribution across seniority levels."""
    if staff_count <= 2:
        distribution = {"senior": staff_count}
    else:
        distribution = {
            "senior": max(1, math.floor(staff_count * 0.3)),
            "mid": max(1, math.floor(staff_count * 0.45)),
            "junior": max(0, staff_count - math.floor(staff_count * 0.3) - math.floor(staff_count * 0.45)),
        }

    roles = [
        RoleCount(level=level, count=count)
        for level, count in distribution.items()
        if count > 0
    ]

    return TeamComposition(
        developers=roles,
        designers=[],
    )


def generate_cocomo_ii_estimation(
    project_name: str,
    ksloc: float,
    scale_factor_ratings: Mapping[str, Union[str, Number]],
    cost_driver_ratings: Optional[Mapping[str, Union[str, Number]]] = None,
    *,
    hourly_rate: float = 120.0,
    infrastructure_pct: float = 0.12,
    other_expenses_pct: float = 0.06,
    features: Optional[Iterable[FeatureInput]] = None,
    start: Optional[date] = None,
    cocomo_constants: Mapping[str, Number] = (("a", 2.94), ("b", 0.91), ("c", 3.67)),
) -> EstimationOutput:
    """
    Produce a rich estimation payload using the COCOMO II Post-Architecture model.

    Parameters
    ----------
    project_name:
        Human readable name of the project (used for narrative text).
    ksloc:
        Estimated thousands of source lines of code (KSLOC).
    scale_factor_ratings:
        Mapping of the five scale factors (`prec`, `flex`, `resl`, `team`, `pmat`)
        to rating labels or numeric multipliers.
    cost_driver_ratings:
        Optional mapping for the 17 cost drivers. Unspecified drivers default to nominal.
    hourly_rate:
        Blended hourly rate for engineering effort.
    infrastructure_pct:
        Share of infra/tooling costs as a fraction of labor cost.
    other_expenses_pct:
        Miscellaneous expenses as a fraction of labor cost.
    features:
        Optional iterable of `FeatureInput` instances specifying effort split.
    start:
        Optional project start date. Defaults to today's date.
    cocomo_constants:
        Iterable with keys `a`, `b`, `c` representing the base model coefficients.
    """
    if ksloc <= 0:
        raise ValueError("ksloc must be a positive number.")

    constants = {k: float(v) for k, v in cocomo_constants}
    required_keys = {"a", "b", "c"}
    missing_constants = required_keys.difference(constants)
    if missing_constants:
        raise ValueError(f"Missing COCOMO constants: {sorted(missing_constants)}.")

    if not scale_factor_ratings:
        raise ValueError("scale_factor_ratings must include all five scale factors.")

    sf_inputs: Dict[str, Union[str, Number]] = {}
    for raw_key, raw_value in scale_factor_ratings.items():
        key = _normalise_key(raw_key)
        if key in sf_inputs:
            raise ValueError(f"Duplicate scale factor key provided: '{raw_key}'.")
        sf_inputs[key] = raw_value

    normalised_sf: MutableMapping[str, float] = {}
    for sf_name, options in _SCALE_FACTORS.items():
        if sf_name not in sf_inputs:
            raise ValueError(f"Missing scale factor rating for '{sf_name}'.")
        normalised_sf[sf_name] = _normalise_rating(sf_inputs[sf_name], options, factor_name=sf_name)

    sum_sf = sum(normalised_sf.values())
    b = constants["b"]
    exponent_e = b + 0.01 * sum_sf

    cost_driver_ratings = cost_driver_ratings or {}
    cd_inputs: Dict[str, Union[str, Number]] = {}
    for raw_key, raw_value in cost_driver_ratings.items():
        key = _normalise_key(raw_key)
        if key in cd_inputs:
            raise ValueError(f"Duplicate cost driver key provided: '{raw_key}'.")
        cd_inputs[key] = raw_value

    normalised_cd: MutableMapping[str, float] = {}
    eaf = 1.0
    for driver_name, options in _COST_DRIVERS.items():
        provided_value = cd_inputs.get(driver_name, "nominal")
        normalised_value = _normalise_rating(provided_value, options, factor_name=driver_name)
        normalised_cd[driver_name] = normalised_value
        eaf *= normalised_value

    a = constants["a"]
    effort_pm = a * eaf * (float(ksloc) ** exponent_e)

    exponent_f = 0.28 + 0.2 * (exponent_e - b)
    c = constants["c"]
    schedule_months = c * (effort_pm ** exponent_f)

    staff = max(1, round(effort_pm / schedule_months))
    labor_hours = effort_pm * 152  # person-months to hours
    labor_cost = labor_hours * hourly_rate
    infrastructure_cost = labor_cost * infrastructure_pct
    other_expenses = labor_cost * other_expenses_pct
    total_cost = labor_cost + infrastructure_cost + other_expenses

    start_date = start or date.today()

    feature_inputs = _normalize_features(features)
    feature_costs: List[FeatureCost] = []
    for feature in feature_inputs:
        hours = labor_hours * (feature.effort_percent / 100.0)
        cost = hours * hourly_rate
        feature_costs.append(
            FeatureCost(
                name=feature.name,
                hours=round(hours, 2),
                cost=round(cost, 2),
            )
        )

    milestones = [
        Milestone(name="Inception & Requirements", duration=f"{schedule_months * 0.25:.1f} months"),
        Milestone(name="Construction & Iteration", duration=f"{schedule_months * 0.5:.1f} months"),
        Milestone(name="Stabilization & Deployment", duration=f"{schedule_months * 0.25:.1f} months"),
    ]

    timeline_tasks: List[TimelineTask] = []
    current_date = start_date
    phase_ratios = [0.25, 0.5, 0.25]
    phase_names = ["Inception & Requirements", "Construction & Iteration", "Stabilization & Deployment"]
    for name, ratio in zip(phase_names, phase_ratios):
        duration_days = max(1, round(schedule_months * ratio * 30))
        end_date = current_date + timedelta(days=duration_days)
        timeline_tasks.append(
            TimelineTask(
                task=name,
                start_date=current_date.isoformat(),
                end_date=end_date.isoformat(),
            )
        )
        current_date = end_date

    executive_summary = (
        f"Applying the COCOMO II Post-Architecture model to {project_name} "
        f"at approximately {ksloc:.1f} KSLOC yields an effort of {effort_pm:.1f} person-months "
        f"and an estimated schedule of {schedule_months:.1f} months with a team of about {staff} engineers."
    )

    explanation = (
        "Scale factor ratings influence the exponential growth of effort, while cost driver multipliers "
        "adjust the effort via the Effort Adjustment Factor (EAF). The resulting effort (person-months) "
        "is converted into labor hours and costs using the provided hourly rate, with infrastructure and "
        "other expenses applied as percentages of the labor cost."
    )

    resource_allocation: Dict[str, Union[str, float, Dict[str, float]]] = {
        "project_name": project_name,
        "team_size": staff,
        "effort_person_months": round(effort_pm, 2),
        "estimated_duration_months": round(schedule_months, 2),
        "hourly_rate": hourly_rate,
        "effort_exponent": round(exponent_e, 3),
        "effort_adjustment_factor": round(eaf, 3),
        "scale_factors": {k: round(v, 2) for k, v in normalised_sf.items()},
        "cost_drivers": {k: round(v, 2) for k, v in normalised_cd.items()},
    }

    success_criteria = [
        "Maintain EAF within ±10% by addressing high-impact cost drivers early.",
        "Progress through milestones without exceeding the modeled schedule by more than one iteration.",
        "Keep actual labor hours within ±12% of the projected person-month effort.",
    ]

    deliverables = [
        "Detailed COCOMO II estimation report with factor ratings",
        "Project execution roadmap aligned to modeled milestones",
        "Risk mitigation plan for elevated cost drivers",
    ]

    return EstimationOutput(
        executive_summary=executive_summary,
        team_composition=_build_team_composition(staff),
        cost_estimate=CostEstimate(
            total_cost=round(total_cost, 2),
            labor_cost=round(labor_cost, 2),
            infrastructure_cost=round(infrastructure_cost, 2),
            other_expenses=round(other_expenses, 2),
        ),
        timeline_estimate=TimelineEstimate(
            total_duration=f"{schedule_months:.1f} months",
            milestones=milestones,
        ),
        resource_allocation=resource_allocation,
        explanation=explanation,
        success_criteria=success_criteria,
        deliverables=deliverables,
        features=feature_costs,
        timeline=timeline_tasks,
    )
