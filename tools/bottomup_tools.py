"""
tools/bottomup_tools.py
======================

Provide Bottom-Up estimation helpers that aggregate detailed task breakdowns.
"""

from dataclasses import dataclass
from datetime import date, timedelta
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
class WorkPackage:
    name: str
    hours: float
    role: str = "developer"


def _build_team_composition(allocation: Iterable[WorkPackage]) -> TeamComposition:
    developers: List[RoleCount] = []
    designers: List[RoleCount] = []

    role_map = {}
    for package in allocation:
        role = package.role.lower()
        role_map.setdefault(role, 0.0)
        role_map[role] += package.hours

    def _add_role(collection: List[RoleCount], level: str, hours: float):
        headcount = max(1, round(hours / 152.0))
        collection.append(RoleCount(level=level, count=headcount))

    for role, hours in role_map.items():
        if role in {"designer", "ux", "ui"}:
            _add_role(designers, "mid", hours)
        else:
            level = "senior" if hours > 320 else "mid"
            _add_role(developers, level, hours)

    if not developers:
        developers.append(RoleCount(level="senior", count=1))

    return TeamComposition(developers=developers, designers=designers)


def _build_timeline(total_hours: float, start: date) -> List[TimelineTask]:
    total_days = max(1, round(total_hours / 6.0))  # 6 productive hours/day
    phases = [
        ("Planning & Setup", 0.15),
        ("Implementation", 0.6),
        ("Validation & Deployment", 0.25),
    ]
    timeline: List[TimelineTask] = []
    current = start
    for name, ratio in phases:
        days = max(1, round(total_days * ratio))
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


def _build_milestones(total_hours: float) -> List[Milestone]:
    total_weeks = max(1, round(total_hours / 30.0))
    return [
        Milestone(name="Requirements & Design Sign-off", duration="2 weeks"),
        Milestone(name="Build Complete", duration=f"{max(2, total_weeks - 4)} weeks"),
        Milestone(name="Testing & Launch", duration="2 weeks"),
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
    team_composition = _build_team_composition(packages)

    labor_cost = total_hours * hourly_rate
    infrastructure_cost = labor_cost * infrastructure_pct
    other_expenses = labor_cost * other_expenses_pct
    total_cost = labor_cost + infrastructure_cost + other_expenses

    feature_costs = [
        FeatureCost(
            name=pkg.name,
            hours=round(pkg.hours, 2),
            cost=round(pkg.hours * hourly_rate, 2),
        )
        for pkg in packages
    ]

    effort_pm = total_hours / 152.0
    schedule_months = max(1.0, total_hours / (team_composition.developers[0].count * 152.0))

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
            "total_hours": round(total_hours, 2),
            "effort_person_months": round(effort_pm, 2),
            "estimated_duration_months": round(schedule_months, 2),
            "hourly_rate": hourly_rate,
            "work_packages": [pkg.__dict__ for pkg in packages],
        },
        explanation=explanation,
        success_criteria=success_criteria,
        deliverables=deliverables,
        features=feature_costs,
        timeline=timeline,
    )


__all__ = ["WorkPackage", "generate_bottom_up_estimation"]

