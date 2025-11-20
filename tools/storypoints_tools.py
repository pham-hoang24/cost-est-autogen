"""
tools/storypoints_tools.py
==========================

Helpers for producing Story Point–driven estimates conforming to the shared
`EstimationOutput` schema.
"""

from dataclasses import dataclass
from datetime import date, timedelta
import math
from typing import Dict, Iterable, List, Optional

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


def _build_team_roles(team_size: int, hourly_rate: float) -> List[TeamRoleCount]:
    if team_size <= 0:
        return []
    if team_size <= 2:
        return [
            TeamRoleCount(role="senior delivery lead", count=team_size, hourly_rate=round(hourly_rate * 1.25, 2))
        ]

    senior = max(1, math.floor(team_size * 0.35))
    mid = max(1, math.floor(team_size * 0.4))
    junior = max(0, team_size - senior - mid)

    roles: List[TeamRoleCount] = []
    if senior > 0:
        roles.append(TeamRoleCount(role="senior engineer", count=senior, hourly_rate=round(hourly_rate * 1.25, 2)))
    if mid > 0:
        roles.append(TeamRoleCount(role="mid engineer", count=mid, hourly_rate=round(hourly_rate, 2)))
    if junior > 0:
        roles.append(TeamRoleCount(role="junior engineer", count=junior, hourly_rate=round(hourly_rate * 0.75, 2)))
    return roles


def _build_timeline(sprints: int, sprint_length_weeks: int, start: date) -> List[Dict[str, str]]:
    tasks: List[Dict[str, str]] = []
    current = start
    for idx in range(1, sprints + 1):
        end = current + timedelta(weeks=sprint_length_weeks)
        tasks.append(
            {
                "task": f"Sprint {idx}",
                "start_date": current.isoformat(),
                "end_date": (end - timedelta(days=1)).isoformat(),
            }
        )
        current = end
    return tasks


def _build_milestones(sprints: int, sprint_length_weeks: int) -> List[MilestoneDetail]:
    total_weeks = sprints * sprint_length_weeks
    discovery = max(1, round(total_weeks * 0.2))
    build = max(1, round(total_weeks * 0.6))
    stabilize = max(1, total_weeks - discovery - build)
    return [
        MilestoneDetail(name="Discovery & Planning", duration_days=discovery * 7),
        MilestoneDetail(name="Build & Iteration", duration_days=build * 7),
        MilestoneDetail(name="Stabilization & Launch", duration_days=stabilize * 7),
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
    team_roles = _build_team_roles(team_size, hourly_rate)

    start_date = start or date.today()
    timeline_tasks = _build_timeline(sprints, sprint_length_weeks, start_date)
    milestones = _build_milestones(sprints, sprint_length_weeks)

    labor_cost = total_hours * hourly_rate
    infrastructure_cost = labor_cost * infrastructure_pct
    other_expenses = labor_cost * other_expenses_pct
    total_cost = labor_cost + infrastructure_cost + other_expenses

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

    inputs_snapshot = {
        "project_name": project_name,
        "total_story_points": total_story_points,
        "team_velocity": team_velocity,
        "sprint_length_weeks": sprint_length_weeks,
        "hours_per_point": hours_per_point,
        "hourly_rate": hourly_rate,
        "planned_team_size": planned_team_size,
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
        "labor_cost": round(labor_cost, 2),
        "infrastructure_cost": round(infrastructure_cost, 2),
        "other_expenses": round(other_expenses, 2),
        "feature_breakdown": feature_costs,
        "timeline": timeline_tasks,
        "agile": {
            "sprints": sprints,
            "velocity": team_velocity,
            "hours_per_point": hours_per_point,
        },
        "deliverables": deliverables,
        "executive_summary": executive_summary,
        "explanation": explanation,
    }

    drivers = [
        Driver(
            factor="Labor cost",
            contribution_pct=round((labor_cost / total_cost) * 100, 2),
            note="Story points converted to labor hours and blended rate",
        ),
        Driver(
            factor="Infrastructure uplift",
            contribution_pct=round((infrastructure_cost / total_cost) * 100, 2),
            note=f"{infrastructure_pct * 100:.1f}% applied to labor cost",
        ),
        Driver(
            factor="Other expenses",
            contribution_pct=round((other_expenses / total_cost) * 100, 2),
            note=f"{other_expenses_pct * 100:.1f}% contingency",
        ),
    ]

    assumptions_objects = [
        Assumption(text="Velocity is assumed to remain steady across sprints."),
        Assumption(text="Cost multipliers for infrastructure and other expenses use configured percentages."),
    ]

    return EstimationOutput(
        method="agile_sp",
        inputs_snapshot=inputs_snapshot,
        results=results_block,
        drivers=drivers,
        confidence=0.5,
        assumptions=assumptions_objects,
        cost_range=cost_range,
        duration_range=duration_range,
        team=team_roles,
        milestones=milestones,
        recommendations=success_criteria,
    )


__all__ = ["FeatureInput", "generate_storypoints_estimation"]

