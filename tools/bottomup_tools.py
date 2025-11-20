"""
tools/bottomup_tools.py
======================

Provide Bottom-Up estimation helpers that aggregate detailed task breakdowns.
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
class WorkPackage:
    name: str
    hours: float
    role: str = "developer"


def _build_team_roles(allocation: Iterable[WorkPackage], hourly_rate: float) -> List[TeamRoleCount]:
    buckets: Dict[str, float] = {}
    for package in allocation:
        role = package.role.lower()
        buckets.setdefault(role, 0.0)
        buckets[role] += package.hours

    roles: List[TeamRoleCount] = []
    for role, hours in buckets.items():
        headcount = max(1, round(hours / 152.0))
        normalized_role = role if role not in {"ux", "ui"} else "designer"
        multiplier = 1.0
        if normalized_role in {"lead", "architect", "manager", "senior"}:
            multiplier = 1.25
        elif normalized_role in {"junior", "qa"}:
            multiplier = 0.8
        roles.append(
            TeamRoleCount(
                role=normalized_role,
                count=headcount,
                hourly_rate=round(hourly_rate * multiplier, 2),
            )
        )

    if not roles:
        roles.append(TeamRoleCount(role="senior engineer", count=1, hourly_rate=round(hourly_rate * 1.25, 2)))

    return roles


def _build_timeline(total_hours: float, start: date) -> List[Dict[str, str]]:
    total_days = max(1, round(total_hours / 6.0))  # 6 productive hours/day
    phases = [
        ("Planning & Setup", 0.15),
        ("Implementation", 0.6),
        ("Validation & Deployment", 0.25),
    ]
    timeline: List[Dict[str, str]] = []
    current = start
    for name, ratio in phases:
        days = max(1, round(total_days * ratio))
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


def _build_milestones(total_hours: float) -> List[MilestoneDetail]:
    total_weeks = max(1, round(total_hours / 30.0))
    return [
        MilestoneDetail(name="Requirements & Design Sign-off", duration_days=14),
        MilestoneDetail(name="Build Complete", duration_days=max(14, (max(total_weeks - 4, 2)) * 7)),
        MilestoneDetail(name="Testing & Launch", duration_days=14),
    ]


def generate_bottom_up_estimation(
    project_name: str,
    *,
    work_packages: Iterable[WorkPackage],
    hourly_rate: float = 120.0,
    infrastructure_pct: float = 0.1,
    other_expenses_pct: float = 0.05,
    start: Optional[date] = None,
) -> EstimationOutput:
    """
    Aggregate detailed work packages (feature/tasks) into an estimation payload.
    """

    packages = list(work_packages)
    if not packages:
        raise ValueError("work_packages must not be empty.")

    total_hours = sum(max(0.0, pkg.hours) for pkg in packages)
    if total_hours <= 0:
        raise ValueError("Total hours must be positive.")

    start_date = start or date.today()
    timeline = _build_timeline(total_hours, start_date)
    milestones = _build_milestones(total_hours)
    team_roles = _build_team_roles(packages, hourly_rate)

    labor_cost = total_hours * hourly_rate
    infrastructure_cost = labor_cost * infrastructure_pct
    other_expenses = labor_cost * other_expenses_pct
    total_cost = labor_cost + infrastructure_cost + other_expenses

    feature_costs = [
        {
            "name": pkg.name,
            "hours": round(pkg.hours, 2),
            "cost": round(pkg.hours * hourly_rate, 2),
            "role": pkg.role,
        }
        for pkg in packages
    ]

    effort_pm = total_hours / 152.0
    team_size = max(1, sum(role.count for role in team_roles))
    schedule_months = max(1.0, effort_pm / team_size)

    executive_summary = (
        f"Bottom-up estimation for {project_name} spans {len(packages)} work packages totaling "
        f"{total_hours:.1f} hours ({effort_pm:.1f} person-months). The projected budget is "
        f"{total_cost:,.0f} with an indicative timeline of {schedule_months:.1f} months."
    )

    explanation = (
        "Individual work package hours roll up into total effort, which converts to cost via the "
        "blended hourly rate. Supporting overhead percentages account for tooling and miscellaneous expenses."
    )

    success_criteria = [
        "Complete each work package within ±10% of the estimated hours.",
        "Maintain scope stability through change control for new tasks.",
        "Achieve testing exit criteria before deployment milestone.",
    ]

    deliverables = [
        "Detailed work breakdown schedule with resource assignments.",
        "Weekly progress burn-down based on completed packages.",
        "Post-implementation review documenting actuals vs estimate.",
    ]

    inputs_snapshot = {
        "project_name": project_name,
        "hourly_rate": hourly_rate,
        "work_packages": [pkg.__dict__ for pkg in packages],
        "infrastructure_pct": infrastructure_pct,
        "other_expenses_pct": other_expenses_pct,
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
        "team_size": team_size,
        "cost_breakdown": [
            {"category": "Labor", "cost": round(labor_cost, 2)},
            {"category": "Infrastructure", "cost": round(infrastructure_cost, 2)},
            {"category": "Other Expenses", "cost": round(other_expenses, 2)},
        ],
        "feature_breakdown": feature_costs,
        "timeline": timeline,
        "deliverables": deliverables,
        "executive_summary": executive_summary,
        "explanation": explanation,
    }

    drivers = [
        Driver(
            factor="Labor cost",
            contribution_pct=round((labor_cost / total_cost) * 100, 2),
            note="Sum of work package hours times blended rate",
        ),
        Driver(
            factor="Infrastructure uplift",
            contribution_pct=round((infrastructure_cost / total_cost) * 100, 2),
            note=f"{infrastructure_pct * 100:.1f}% applied to labor",
        ),
        Driver(
            factor="Other expenses",
            contribution_pct=round((other_expenses / total_cost) * 100, 2),
            note=f"{other_expenses_pct * 100:.1f}% contingency",
        ),
    ]

    assumptions_objects = [
        Assumption(text="Work package estimates are assumed accurate within ±10%."),
        Assumption(text="Infrastructure and miscellaneous percentages are applied to labor cost."),
    ]

    return EstimationOutput(
        method="bottomup",
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


__all__ = ["WorkPackage", "generate_bottom_up_estimation"]

