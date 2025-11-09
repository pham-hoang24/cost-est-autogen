"""
tools/analogous_tools.py
========================

Analogous estimation utilities leverage historical project records to infer
effort, schedule, and cost for a new initiative based on similarity scoring.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Dict, Iterable, List, Mapping, Optional, Sequence, Tuple

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


def _build_team_composition(effort_pm: float, duration_months: float) -> TeamComposition:
    avg_staff = max(1, round(effort_pm / max(duration_months, 0.5)))
    seniors = max(1, round(avg_staff * 0.3))
    mids = max(1, round(avg_staff * 0.5))
    juniors = max(0, avg_staff - seniors - mids)
    developers = [
        RoleCount(level="senior", count=seniors),
        RoleCount(level="mid", count=mids),
    ]
    if juniors > 0:
        developers.append(RoleCount(level="junior", count=juniors))
    return TeamComposition(developers=developers, designers=[])


def _build_timeline(duration_months: float, start: date) -> List[TimelineTask]:
    phases = [
        ("Initiation", 0.2),
        ("Execution", 0.6),
        ("Stabilization", 0.2),
    ]
    timeline: List[TimelineTask] = []
    current = start
    for name, ratio in phases:
        phase_months = max(0.1, duration_months * ratio)
        days = int(round(phase_months * 30))
        end = current + timedelta(days=days)
        timeline.append(
            TimelineTask(
                task=name,
                start_date=current.isoformat(),
                end_date=end.isoformat(),
            )
        )
        current = end
    return timeline


def _build_milestones(duration_months: float) -> List[Milestone]:
    return [
        Milestone(name="Discovery Complete", duration=f"{max(1.0, duration_months * 0.25):.1f} months"),
        Milestone(name="Build Complete", duration=f"{max(1.0, duration_months * 0.5):.1f} months"),
        Milestone(name="Launch", duration=f"{max(0.5, duration_months * 0.25):.1f} months"),
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
    team_composition = _build_team_composition(effort_pm, duration)
    timeline = _build_timeline(duration, start_date)
    milestones = _build_milestones(duration)

    feature_costs: List[FeatureCost] = []
    breakdown = similarities[0][0].feature_breakdown or {}
    for name, percent in breakdown.items():
        feature_costs.append(
            FeatureCost(
                name=name,
                hours=round((effort_pm * 152.0) * (percent / 100.0), 2),
                cost=round(cost * (percent / 100.0), 2),
            )
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

    resource_allocation: Dict[str, object] = {
        "project_name": project_name,
        "effort_person_months": round(effort_pm, 2),
        "estimated_duration_months": round(duration, 2),
        "estimated_cost": round(cost, 2),
        "reference_projects": [
            {"name": proj.name, "similarity": round(sim, 3)}
            for proj, sim in similarities
        ],
    }

    return EstimationOutput(
        executive_summary=executive_summary,
        team_composition=team_composition,
        cost_estimate=CostEstimate(
            total_cost=round(cost, 2),
            labor_cost=round(cost * 0.75, 2),
            infrastructure_cost=round(cost * 0.15, 2),
            other_expenses=round(cost * 0.10, 2),
        ),
        timeline_estimate=TimelineEstimate(
            total_duration=f"{duration:.1f} months",
            milestones=milestones,
        ),
        resource_allocation=resource_allocation,
        explanation=explanation,
        success_criteria=success_criteria,
        deliverables=deliverables,
        features=feature_costs,
        timeline=timeline,
    )


__all__ = ["HistoricalProject", "generate_analogous_estimation"]

