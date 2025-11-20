"""
tools/analogous_tools.py
========================

Analogous estimation utilities leverage historical project records to infer
effort, schedule, and cost for a new initiative based on similarity scoring.
"""

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Dict, Iterable, List, Mapping, Optional, Sequence, Tuple

from .schema import (
    Assumption,
    CostRange,
    Driver,
    DurationRange,
    EstimationOutput,
    MilestoneDetail,
    TeamRoleCount,
)


@dataclass
class HistoricalProject:
    name: str
    attributes: Mapping[str, float]
    effort_pm: float
    duration_months: float
    cost: float
    feature_breakdown: Optional[Mapping[str, float]] = None  # percent allocation


def _cosine_similarity(project: Mapping[str, float], target: Mapping[str, float]) -> float:
    numerator = 0.0
    denom_project = 0.0
    denom_target = 0.0
    keys = set(project.keys()) | set(target.keys())
    for key in keys:
        p = float(project.get(key, 0.0))
        t = float(target.get(key, 0.0))
        numerator += p * t
        denom_project += p * p
        denom_target += t * t
    if denom_project <= 0 or denom_target <= 0:
        return 0.0
    return numerator / ((denom_project ** 0.5) * (denom_target ** 0.5))


def _weighted_average(values: Sequence[Tuple[float, float]]) -> float:
    numerator = sum(value * weight for value, weight in values)
    denominator = sum(weight for _, weight in values)
    if denominator == 0:
        return 0.0
    return numerator / denominator


def _build_team_roles(effort_pm: float, duration_months: float, base_rate: float) -> List[TeamRoleCount]:
    avg_staff = max(1, round(effort_pm / max(duration_months, 0.5)))
    seniors = max(1, round(avg_staff * 0.3))
    mids = max(1, round(avg_staff * 0.5))
    juniors = max(0, avg_staff - seniors - mids)

    roles: List[TeamRoleCount] = [
        TeamRoleCount(role="senior engineer", count=seniors, hourly_rate=round(base_rate * 1.25, 2)),
        TeamRoleCount(role="mid engineer", count=mids, hourly_rate=round(base_rate, 2)),
    ]
    if juniors > 0:
        roles.append(TeamRoleCount(role="junior engineer", count=juniors, hourly_rate=round(base_rate * 0.75, 2)))
    return roles


def _build_timeline(duration_months: float, start: date) -> List[Dict[str, str]]:
    phases = [
        ("Initiation", 0.2),
        ("Execution", 0.6),
        ("Stabilization", 0.2),
    ]
    timeline: List[Dict[str, str]] = []
    current = start
    for name, ratio in phases:
        phase_months = max(0.1, duration_months * ratio)
        days = int(round(phase_months * 30))
        end = current + timedelta(days=days)
        timeline.append(
            {
                "task": name,
                "start_date": current.isoformat(),
                "end_date": end.isoformat(),
            }
        )
        current = end
    return timeline


def _build_milestones(duration_months: float) -> List[MilestoneDetail]:
    return [
        MilestoneDetail(name="Discovery Complete", duration_days=int(max(30, duration_months * 0.25 * 30))),
        MilestoneDetail(name="Build Complete", duration_days=int(max(30, duration_months * 0.5 * 30))),
        MilestoneDetail(name="Launch", duration_days=int(max(14, duration_months * 0.25 * 30))),
    ]


def generate_analogous_estimation(
    project_name: str,
    *,
    target_attributes: Mapping[str, float],
    historical_projects: Iterable[HistoricalProject],
    min_similarity: float = 0.2,
    start: Optional[date] = None,
) -> EstimationOutput:
    """
    Blend historical analogues weighted by similarity to estimate a new project.
    """

    records = list(historical_projects)
    if not records:
        raise ValueError("historical_projects must not be empty.")

    similarities: List[Tuple[HistoricalProject, float]] = []
    for record in records:
        sim = _cosine_similarity(record.attributes, target_attributes)
        if sim >= min_similarity:
            similarities.append((record, sim))

    if not similarities:
        raise ValueError("No historical projects cleared the similarity threshold.")

    effort_pm = _weighted_average([(proj.effort_pm, sim) for proj, sim in similarities])
    duration = _weighted_average([(proj.duration_months, sim) for proj, sim in similarities])
    cost = _weighted_average([(proj.cost, sim) for proj, sim in similarities])

    start_date = start or date.today()
    base_rate = cost / (effort_pm * 152.0) if effort_pm > 0 else 120.0
    team_roles = _build_team_roles(effort_pm, duration, base_rate)
    timeline = _build_timeline(duration, start_date)
    milestones = _build_milestones(duration)

    feature_costs: List[Dict[str, float]] = []
    breakdown = similarities[0][0].feature_breakdown or {}
    for name, percent in breakdown.items():
        feature_costs.append(
            {
                "name": name,
                "hours": round((effort_pm * 152.0) * (percent / 100.0), 2),
                "cost": round(cost * (percent / 100.0), 2),
            }
        )

    executive_summary = (
        f"Analogous estimate for {project_name} based on {len(similarities)} similar historical projects "
        f"projects an effort of {effort_pm:.1f} person-months across {duration:.1f} months with a cost of "
        f"{cost:,.0f}."
    )

    explanation = (
        "Similarity-scored historical projects provide weighted averages for effort, duration, and cost. "
        "Attributes should capture drivers such as complexity, domain, team maturity, or technology."
    )

    success_criteria = [
        "Validate assumptions against the closest historical analogue before execution.",
        "Track variance versus the analogue baseline at each milestone.",
        "Capture actuals to enrich the historical dataset post-delivery.",
    ]

    deliverables = [
        "Analogous estimation worksheet with similarity metrics.",
        "Adjustment log documenting deviations from the closest analogue.",
        "Post-project benchmarking report updating historical records.",
    ]

    inputs_snapshot = {
        "project_name": project_name,
        "target_attributes": dict(target_attributes),
        "historical_projects": [proj.__dict__ for proj in records],
        "min_similarity": min_similarity,
    }

    cost_range = CostRange(
        min=round(cost * 0.85, 2),
        likely=round(cost, 2),
        max=round(cost * 1.15, 2),
    )

    duration_range = DurationRange(
        min=round(duration * 0.9, 2),
        likely=round(duration, 2),
        max=round(duration * 1.1, 2),
    )

    results_block = {
        "effort_pm": round(effort_pm, 2),
        "duration_months": round(duration, 2),
        "cost_total": round(cost, 2),
        "feature_breakdown": feature_costs,
        "timeline": timeline,
        "reference_projects": [
            {"name": proj.name, "similarity": round(sim, 3)} for proj, sim in similarities
        ],
        "deliverables": deliverables,
        "executive_summary": executive_summary,
        "explanation": explanation,
    }

    drivers = [
        Driver(
            factor=f"reference:{proj.name}",
            contribution_pct=round(sim * 100, 2),
            note="Similarity weight applied in averaging",
        )
        for proj, sim in similarities[:3]
    ]
    if not drivers:
        drivers.append(Driver(factor="reference:unknown", contribution_pct=0.0, note="No significant analogue"))

    assumptions_objects = [
        Assumption(text="Historical projects are representative of the new effort."),
        Assumption(text="Cost breakdown splits labor/infrastructure/other using generic ratios."),
    ]

    highest_similarity = max(sim for _, sim in similarities)
    confidence = min(0.8, max(0.3, highest_similarity))

    return EstimationOutput(
        method="analogous",
        inputs_snapshot=inputs_snapshot,
        results=results_block,
        drivers=drivers,
        confidence=round(confidence, 2),
        assumptions=assumptions_objects,
        cost_range=cost_range,
        duration_range=duration_range,
        team=team_roles,
        milestones=milestones,
        recommendations=success_criteria,
    )


__all__ = ["HistoricalProject", "generate_analogous_estimation"]

