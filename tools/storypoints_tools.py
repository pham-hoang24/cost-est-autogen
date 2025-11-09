"""
tools/storypoints_tools.py
==========================

Helpers for producing Story Point–driven estimates conforming to the shared
`EstimationOutput` schema.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
import math
from typing import Iterable, List, Optional

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
class FeatureInput:
    name: str
    effort_percent: float


def _normalize_features(features: Optional[Iterable[FeatureInput]]) -> List[FeatureInput]:
    if not features:
        return [
            FeatureInput(name="Core Sprint Delivery", effort_percent=40.0),
            FeatureInput(name="Technical Debt & QA", effort_percent=30.0),
            FeatureInput(name="Deployment & Support", effort_percent=30.0),
        ]
    total = sum(max(0.0, f.effort_percent) for f in features)
    if total <= 0:
        return _normalize_features(None)
    normalized: List[FeatureInput] = []
    for feature in features:
        normalized.append(
            FeatureInput(
                name=feature.name,
                effort_percent=max(0.0, feature.effort_percent) / total * 100.0,
            )
        )
    return normalized


def _build_team_composition(team_size: int) -> TeamComposition:
    if team_size <= 2:
        distribution = {"senior": team_size}
    else:
        distribution = {
            "senior": max(1, math.floor(team_size * 0.35)),
            "mid": max(1, math.floor(team_size * 0.4)),
            "junior": max(0, team_size - math.floor(team_size * 0.35) - math.floor(team_size * 0.4)),
        }
    developers = [
        RoleCount(level=level, count=count)
        for level, count in distribution.items()
        if count > 0
    ]
    return TeamComposition(developers=developers, designers=[])


def _build_timeline(sprints: int, sprint_length_weeks: int, start: date) -> List[TimelineTask]:
    tasks: List[TimelineTask] = []
    current = start
    for idx in range(1, sprints + 1):
        end = current + timedelta(weeks=sprint_length_weeks)
        tasks.append(
            TimelineTask(
                task=f"Sprint {idx}",
                start_date=current.isoformat(),
                end_date=(end - timedelta(days=1)).isoformat(),
            )
        )
        current = end
    return tasks


def _build_milestones(sprints: int, sprint_length_weeks: int) -> List[Milestone]:
    total_weeks = sprints * sprint_length_weeks
    discovery = max(1, round(total_weeks * 0.2))
    build = max(1, round(total_weeks * 0.6))
    stabilize = max(1, total_weeks - discovery - build)
    return [
        Milestone(name="Discovery & Planning", duration=f"{discovery} weeks"),
        Milestone(name="Build & Iteration", duration=f"{build} weeks"),
        Milestone(name="Stabilization & Launch", duration=f"{stabilize} weeks"),
    ]


def generate_storypoints_estimation(
    project_name: str,
    *,
    total_story_points: float,
    team_velocity: float,
    sprint_length_weeks: int = 2,
    hours_per_point: float = 6.0,
    hourly_rate: float = 120.0,
    infrastructure_pct: float = 0.1,
    other_expenses_pct: float = 0.05,
    planned_team_size: Optional[int] = None,
    features: Optional[Iterable[FeatureInput]] = None,
    start: Optional[date] = None,
) -> EstimationOutput:
    """
    Convert agile Story Point inputs into a structured estimation payload.
    """

    if total_story_points <= 0:
        raise ValueError("total_story_points must be positive.")
    if team_velocity <= 0:
        raise ValueError("team_velocity must be positive.")
    if hours_per_point <= 0:
        raise ValueError("hours_per_point must be positive.")
    if sprint_length_weeks <= 0:
        raise ValueError("sprint_length_weeks must be positive.")

    sprints = math.ceil(total_story_points / team_velocity)
    total_weeks = sprints * sprint_length_weeks
    schedule_months = total_weeks / 4.345

    total_hours = total_story_points * hours_per_point
    effort_pm = total_hours / 152.0

    team_size = planned_team_size or max(1, round(team_velocity / 20))
    team_composition = _build_team_composition(team_size)

    start_date = start or date.today()
    timeline_tasks = _build_timeline(sprints, sprint_length_weeks, start_date)
    milestones = _build_milestones(sprints, sprint_length_weeks)

    labor_cost = total_hours * hourly_rate
    infrastructure_cost = labor_cost * infrastructure_pct
    other_expenses = labor_cost * other_expenses_pct
    total_cost = labor_cost + infrastructure_cost + other_expenses

    feature_inputs = _normalize_features(features)
    feature_costs: List[FeatureCost] = []
    for feature in feature_inputs:
        hours = total_hours * (feature.effort_percent / 100.0)
        cost = hours * hourly_rate
        feature_costs.append(
            FeatureCost(
                name=feature.name,
                hours=round(hours, 2),
                cost=round(cost, 2),
            )
        )

    executive_summary = (
        f"Using Story Point estimation for {project_name}, delivering {total_story_points:.0f} points "
        f"at a velocity of {team_velocity:.0f} points per sprint requires roughly {sprints} sprints "
        f"({schedule_months:.1f} months) with a team of {team_size}. Estimated effort is "
        f"{effort_pm:.1f} person-months."
    )

    explanation = (
        "Total story points are divided by team velocity to derive sprint count, which drives the "
        "schedule. Story points convert to labor hours using the configured productivity assumption "
        "and then to costs using the blended hourly rate."
    )

    success_criteria = [
        "Maintain sprint velocity within ±10% of target.",
        "Meet Definition of Done for each sprint without scope spillover.",
        "Deploy a production-ready increment by the final stabilization milestone.",
    ]

    deliverables = [
        "Sprint-by-sprint delivery plan with committed scope.",
        "Backlog tracking dashboard with burn-up metrics.",
        "Release readiness checklist and deployment playbook.",
    ]

    return EstimationOutput(
        executive_summary=executive_summary,
        team_composition=team_composition,
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
        resource_allocation={
            "project_name": project_name,
            "total_story_points": total_story_points,
            "team_velocity": team_velocity,
            "sprint_length_weeks": sprint_length_weeks,
            "sprints": sprints,
            "effort_person_months": round(effort_pm, 2),
            "estimated_duration_months": round(schedule_months, 2),
            "hours_per_point": hours_per_point,
            "team_size": team_size,
        },
        explanation=explanation,
        success_criteria=success_criteria,
        deliverables=deliverables,
        features=feature_costs,
        timeline=timeline_tasks,
    )


__all__ = ["FeatureInput", "generate_storypoints_estimation"]

