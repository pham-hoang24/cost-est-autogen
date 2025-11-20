"""
tools/parametric_tools.py
=========================

Parametric estimation helpers to convert size metrics (FP, LOC, modules, etc.)
into costs and schedules using calibrated rates.
"""

from dataclasses import dataclass
from datetime import date, timedelta
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
class UnitBreakdown:
    name: str
    units: float
    rate_per_unit: float


def _build_team_roles(team_size: int, hourly_rate: float) -> List[TeamRoleCount]:
    if team_size <= 0:
        return []
    if team_size == 1:
        return [TeamRoleCount(role="senior analyst", count=1, hourly_rate=round(hourly_rate * 1.2, 2))]

    senior = max(1, round(team_size * 0.3))
    mid = max(1, round(team_size * 0.5))
    junior = max(0, team_size - senior - mid)

    roles: List[TeamRoleCount] = []
    if senior:
        roles.append(TeamRoleCount(role="senior analyst", count=senior, hourly_rate=round(hourly_rate * 1.2, 2)))
    if mid:
        roles.append(TeamRoleCount(role="mid analyst", count=mid, hourly_rate=round(hourly_rate, 2)))
    if junior:
        roles.append(TeamRoleCount(role="junior analyst", count=junior, hourly_rate=round(hourly_rate * 0.7, 2)))
    return roles


def _build_timeline(total_units: float, productivity: float, start: date) -> List[Dict[str, str]]:
    total_weeks = max(1, round((total_units / max(productivity, 1e-6)) / 40.0))
    phases = [
        ("Calibration & Setup", 0.2),
        ("Execution", 0.6),
        ("Validation & Rollout", 0.2),
    ]
    timeline: List[Dict[str, str]] = []
    current = start
    for name, ratio in phases:
        weeks = max(1, round(total_weeks * ratio))
        end = current + timedelta(weeks=weeks)
        timeline.append(
            {
                "task": name,
                "start_date": current.isoformat(),
                "end_date": (end - timedelta(days=1)).isoformat(),
            }
        )
        current = end
    return timeline


def _build_milestones(total_months: float) -> List[MilestoneDetail]:
    return [
        MilestoneDetail(name="Calibration Complete", duration_days=30),
        MilestoneDetail(name="Execution Complete", duration_days=max(30, round(max(total_months - 1, 1) * 30))),
        MilestoneDetail(name="Validation & Launch", duration_days=30),
    ]


def generate_parametric_estimation(
    project_name: str,
    *,
    total_units: float,
    cost_per_unit: float,
    hours_per_unit: float,
    team_productivity_units_per_week: Optional[float] = None,
    unit_breakdown: Optional[Iterable[UnitBreakdown]] = None,
    infrastructure_pct: float = 0.1,
    other_expenses_pct: float = 0.05,
    hourly_rate: Optional[float] = None,
    start: Optional[date] = None,
    assumed_team_size: Optional[int] = None,
) -> EstimationOutput:
    """
    Use a cost-per-unit and productivity rate to derive effort, budget, and schedule.
    """

    if total_units <= 0:
        raise ValueError("total_units must be positive.")
    if cost_per_unit <= 0:
        raise ValueError("cost_per_unit must be positive.")
    if hours_per_unit <= 0:
        raise ValueError("hours_per_unit must be positive.")

    labor_cost = total_units * cost_per_unit
    hourly_rate = hourly_rate or (cost_per_unit / hours_per_unit)
    total_hours = total_units * hours_per_unit
    effort_pm = total_hours / 152.0

    team_productivity = team_productivity_units_per_week or max(1.0, (total_units / max(effort_pm, 1e-6)) / 4.0)
    total_weeks = total_units / team_productivity
    schedule_months = max(1.0, total_weeks / 4.345)

    team_size = assumed_team_size or max(1, round((total_hours / schedule_months) / 152.0))
    team_roles = _build_team_roles(team_size, hourly_rate)

    start_date = start or date.today()
    timeline = _build_timeline(total_units, team_productivity, start_date)
    milestones = _build_milestones(schedule_months)

    infrastructure_cost = labor_cost * infrastructure_pct
    other_expenses = labor_cost * other_expenses_pct
    total_cost = labor_cost + infrastructure_cost + other_expenses

    if unit_breakdown:
        features = [
            {
                "name": item.name,
                "hours": round(item.units * hours_per_unit, 2),
                "cost": round(item.units * item.rate_per_unit, 2),
            }
            for item in unit_breakdown
        ]
    else:
        features = [
            {
                "name": "Aggregated Units",
                "hours": round(total_hours, 2),
                "cost": round(labor_cost, 2),
            }
        ]

    executive_summary = (
        f"Parametric estimate for {project_name} covers {total_units:.1f} units at "
        f"{cost_per_unit:,.2f} per unit, totaling {labor_cost:,.0f} in labor. "
        f"Expected effort is {effort_pm:.1f} person-months over about {schedule_months:.1f} months."
    )

    explanation = (
        "Cost derives from the calibrated cost-per-unit rate, with productivity translating units into "
        "schedule. Hours-per-unit informs labor effort and staffing assumptions."
    )

    success_criteria = [
        "Maintain calibrated unit cost within ±8% during execution.",
        "Track productivity weekly to keep schedule variance under two weeks.",
        "Review unit scope changes via change control to protect baseline.",
    ]

    deliverables = [
        "Parametric basis-of-estimate report detailing unit cost derivation.",
        "Productivity tracking dashboard with actual vs forecast.",
        "Variance analysis and mitigation plan updated bi-weekly.",
    ]

    inputs_snapshot = {
        "project_name": project_name,
        "total_units": total_units,
        "cost_per_unit": cost_per_unit,
        "hours_per_unit": hours_per_unit,
        "team_productivity_units_per_week": team_productivity_units_per_week,
        "hourly_rate": hourly_rate,
        "assumed_team_size": assumed_team_size,
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

    resource_allocation: Dict[str, float] = {
        "effort_person_months": round(effort_pm, 2),
        "estimated_duration_months": round(schedule_months, 2),
        "team_size": team_size,
        "productivity_units_per_week": round(team_productivity, 2),
    }

    results_block = {
        "labor_cost": round(labor_cost, 2),
        "infrastructure_cost": round(infrastructure_cost, 2),
        "other_expenses": round(other_expenses, 2),
        "feature_breakdown": features,
        "timeline": timeline,
        "resource_allocation": resource_allocation,
        "deliverables": deliverables,
        "executive_summary": executive_summary,
        "explanation": explanation,
    }

    drivers = [
        Driver(
            factor="Labor cost",
            contribution_pct=round((labor_cost / total_cost) * 100, 2),
            note="Primary driver via cost-per-unit calibration",
        ),
        Driver(
            factor="Infrastructure uplift",
            contribution_pct=round((infrastructure_cost / total_cost) * 100, 2),
            note=f"{infrastructure_pct * 100:.1f}% applied to labor cost",
        ),
        Driver(
            factor="Other expenses",
            contribution_pct=round((other_expenses / total_cost) * 100, 2),
            note=f"{other_expenses_pct * 100:.1f}% contingency and tooling",
        ),
    ]

    assumptions_objects = [
        Assumption(text="Productivity remains steady across delivery weeks."),
        Assumption(text="Unit cost calibration reflects blended labor assumptions."),
    ]

    return EstimationOutput(
        method="parametric",
        inputs_snapshot=inputs_snapshot,
        results=results_block,
        drivers=drivers,
        confidence=0.55,
        assumptions=assumptions_objects,
        cost_range=cost_range,
        duration_range=duration_range,
        team=team_roles,
        milestones=milestones,
        recommendations=success_criteria,
    )


__all__ = ["UnitBreakdown", "generate_parametric_estimation"]

