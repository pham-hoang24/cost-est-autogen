from pathlib import Path
from uuid import uuid4

import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.storypoints_tools import generate_storypoints_estimation
from workflow.controller import WorkflowOrchestrator
from workflow.repository import ProjectContextRepository


def test_workflow_end_to_end(tmp_path):
    repo_path = tmp_path / "workflow.db"
    repository = ProjectContextRepository(db_path=str(repo_path))
    orchestrator = WorkflowOrchestrator(repository=repository)

    project_id = f"test-{uuid4()}"
    orchestrator.start_new_project(project_id=project_id)

    orchestrator.record_baseline_field(project_id, "project_type", "software development")
    orchestrator.record_baseline_field(project_id, "complexity", "medium")
    orchestrator.record_baseline_field(project_id, "tech_stack", "web technologies")
    orchestrator.record_baseline_field(project_id, "team_pref", "8")
    orchestrator.record_baseline_field(project_id, "region", "North America")

    description = (
        "We plan a subscription web platform with roughly 160 story points of work. "
        "The cross-functional squad averages 20 story points per sprint with two-week sprints."
    )
    orchestrator.submit_description(project_id, description)
    orchestrator.generate_expansion(project_id)
    orchestrator.confirm_expansion(project_id, approval_text="approve")

    context = orchestrator.evaluate_methods(project_id)
    assert context.selection is not None
    assert context.selection.primary in {"agile_sp", "blend"}

    estimate = generate_storypoints_estimation(
        project_name="Subscription Platform",
        total_story_points=160,
        team_velocity=20,
        sprint_length_weeks=2,
        hours_per_point=6.0,
        hourly_rate=120.0,
        planned_team_size=8,
    )
    orchestrator.attach_estimate(project_id, estimate.model_dump())

    context = orchestrator.generate_explanation(project_id)
    assert context.explanation is not None
    assert "Estimation Summary" in context.explanation

    final_context = orchestrator.load_context(project_id)
    assert final_context.estimates, "Expected at least one estimator output to be stored."
    assert final_context.status == "EXPLANATION_READY"

