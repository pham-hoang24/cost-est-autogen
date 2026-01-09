from pathlib import Path
from uuid import uuid4

import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.storypoints_tools import generate_storypoints_estimation
from tools.bottomup_tools import WorkPackage, generate_bottom_up_estimation
from tools.parametric_tools import UnitBreakdown, generate_parametric_estimation
from tools.fpa_tools import generate_fpa_estimation
from tools.cocomo_tools import generate_cocomo_ii_estimation
from workflow.controller import WorkflowOrchestrator
from workflow.repository import ProjectContextRepository
import pytest


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


def test_bottom_up_estimation(tmp_path):
    """Test bottom-up estimation method through the workflow."""
    repo_path = tmp_path / "workflow.db"
    repository = ProjectContextRepository(db_path=str(repo_path))
    orchestrator = WorkflowOrchestrator(repository=repository)

    project_id = f"test-bottomup-{uuid4()}"
    orchestrator.start_new_project(project_id=project_id)

    orchestrator.record_baseline_field(project_id, "project_type", "software development")
    orchestrator.record_baseline_field(project_id, "complexity", "medium")
    orchestrator.record_baseline_field(project_id, "tech_stack", "web technologies")
    orchestrator.record_baseline_field(project_id, "team_pref", "5")
    orchestrator.record_baseline_field(project_id, "region", "North America")

    description = (
        "We need to build a mobile app with API layer enhancements (180 hours), "
        "mobile UI refresh (140 hours), automation testing (160 hours), and "
        "deployment & monitoring (80 hours)."
    )
    orchestrator.submit_description(project_id, description)
    orchestrator.generate_expansion(project_id)
    orchestrator.confirm_expansion(project_id, approval_text="approve")

    context = orchestrator.evaluate_methods(project_id)
    assert context.selection is not None

    work_packages = [
        WorkPackage(name="API Layer Enhancements", hours=180.0, role="developer"),
        WorkPackage(name="Mobile UI Refresh", hours=140.0, role="designer"),
        WorkPackage(name="Automation Testing", hours=160.0, role="qa"),
        WorkPackage(name="Deployment & Monitoring", hours=80.0, role="devops"),
    ]

    estimate = generate_bottom_up_estimation(
        project_name="Mobile App Expansion",
        work_packages=work_packages,
        hourly_rate=125.0,
    )
    orchestrator.attach_estimate(project_id, estimate.model_dump())

    context = orchestrator.generate_explanation(project_id)
    assert context.explanation is not None
    assert "Estimation Summary" in context.explanation

    final_context = orchestrator.load_context(project_id)
    assert len(final_context.estimates) == 1
    assert final_context.estimates[0]["method"] == "bottomup"
    assert final_context.status == "EXPLANATION_READY"


def test_parametric_estimation(tmp_path):
    """Test parametric estimation method through the workflow."""
    repo_path = tmp_path / "workflow.db"
    repository = ProjectContextRepository(db_path=str(repo_path))
    orchestrator = WorkflowOrchestrator(repository=repository)

    project_id = f"test-parametric-{uuid4()}"
    orchestrator.start_new_project(project_id=project_id)

    orchestrator.record_baseline_field(project_id, "project_type", "system integration")
    orchestrator.record_baseline_field(project_id, "complexity", "high")
    orchestrator.record_baseline_field(project_id, "tech_stack", "data warehouse")
    orchestrator.record_baseline_field(project_id, "team_pref", "6")
    orchestrator.record_baseline_field(project_id, "region", "Europe")

    description = (
        "Data warehouse migration project with 520 total units. "
        "ETL pipelines: 200 units, Reporting views: 180 units, "
        "Validation scripts: 140 units."
    )
    orchestrator.submit_description(project_id, description)
    orchestrator.generate_expansion(project_id)
    orchestrator.confirm_expansion(project_id, approval_text="approve")

    context = orchestrator.evaluate_methods(project_id)
    assert context.selection is not None

    unit_breakdown = [
        UnitBreakdown(name="ETL Pipelines", units=200, rate_per_unit=170.0),
        UnitBreakdown(name="Reporting Views", units=180, rate_per_unit=185.0),
        UnitBreakdown(name="Validation Scripts", units=140, rate_per_unit=160.0),
    ]

    estimate = generate_parametric_estimation(
        project_name="Data Warehouse Migration",
        total_units=520,
        cost_per_unit=180.0,
        hours_per_unit=1.3,
        team_productivity_units_per_week=48,
        unit_breakdown=unit_breakdown,
        hourly_rate=120.0,
    )
    orchestrator.attach_estimate(project_id, estimate.model_dump())

    context = orchestrator.generate_explanation(project_id)
    assert context.explanation is not None

    final_context = orchestrator.load_context(project_id)
    assert len(final_context.estimates) == 1
    assert final_context.estimates[0]["method"] == "parametric"
    assert final_context.status == "EXPLANATION_READY"


def test_fpa_estimation(tmp_path):
    """Test Function Point Analysis estimation method."""
    repo_path = tmp_path / "workflow.db"
    repository = ProjectContextRepository(db_path=str(repo_path))
    orchestrator = WorkflowOrchestrator(repository=repository)

    project_id = f"test-fpa-{uuid4()}"
    orchestrator.start_new_project(project_id=project_id)

    orchestrator.record_baseline_field(project_id, "project_type", "software development")
    orchestrator.record_baseline_field(project_id, "complexity", "high")
    orchestrator.record_baseline_field(project_id, "tech_stack", "web application")
    orchestrator.record_baseline_field(project_id, "team_pref", "7")
    orchestrator.record_baseline_field(project_id, "region", "North America")

    description = (
        "Checkout revamp project with external inputs (18 average), "
        "external outputs (10 average), external inquiries (6 low), "
        "internal logical files (4 high), and external interface files (3 average)."
    )
    orchestrator.submit_description(project_id, description)
    orchestrator.generate_expansion(project_id)
    orchestrator.confirm_expansion(project_id, approval_text="approve")

    context = orchestrator.evaluate_methods(project_id)
    assert context.selection is not None

    function_counts = {
        "EI": {"average": 18},
        "EO": {"average": 10},
        "EQ": {"low": 6},
        "ILF": {"high": 4},
        "EIF": {"average": 3},
    }

    gsc_ratings = {
        "data_communications": 4,
        "distributed_processing": 3,
        "performance": 4,
        "heavily_used_configuration": 2,
        "transaction_rate": 4,
        "online_data_entry": 4,
        "end_user_efficiency": 4,
        "online_update": 3,
        "complex_processing": 4,
        "reusability": 3,
        "installation_ease": 3,
        "operational_ease": 3,
        "multiple_sites": 3,
        "facilitate_change": 4,
    }

    estimate = generate_fpa_estimation(
        project_name="Checkout Revamp",
        function_counts=function_counts,
        gsc_ratings=gsc_ratings,
        hours_per_fp=9.5,
        hourly_rate=115.0,
    )
    orchestrator.attach_estimate(project_id, estimate.model_dump())

    context = orchestrator.generate_explanation(project_id)
    assert context.explanation is not None

    final_context = orchestrator.load_context(project_id)
    assert len(final_context.estimates) == 1
    assert final_context.estimates[0]["method"] == "fpa"
    assert final_context.status == "EXPLANATION_READY"


def test_cocomo_estimation(tmp_path):
    """Test COCOMO II estimation method."""
    repo_path = tmp_path / "workflow.db"
    repository = ProjectContextRepository(db_path=str(repo_path))
    orchestrator = WorkflowOrchestrator(repository=repository)

    project_id = f"test-cocomo-{uuid4()}"
    orchestrator.start_new_project(project_id=project_id)

    orchestrator.record_baseline_field(project_id, "project_type", "software development")
    orchestrator.record_baseline_field(project_id, "complexity", "high")
    orchestrator.record_baseline_field(project_id, "tech_stack", "web application")
    orchestrator.record_baseline_field(project_id, "team_pref", "8")
    orchestrator.record_baseline_field(project_id, "region", "North America")

    description = (
        "Checkout revamp project estimated at 85 KSLOC. "
        "High precedence, nominal flexibility, high architecture resolution, "
        "nominal team cohesion, and nominal process maturity."
    )
    orchestrator.submit_description(project_id, description)
    orchestrator.generate_expansion(project_id)
    orchestrator.confirm_expansion(project_id, approval_text="approve")

    context = orchestrator.evaluate_methods(project_id)
    assert context.selection is not None

    scale_factor_ratings = {
        "prec": "high",
        "flex": "nominal",
        "resl": "high",
        "team": "nominal",
        "pmat": "nominal",
    }

    cost_driver_ratings = {
        "rely": "high",
        "data": "nominal",
        "cplx": "high",
        "ruse": "nominal",
        "docu": "nominal",
        "acap": "high",
        "pcap": "nominal",
        "tool": "nominal",
        "site": "high",
        "sced": "nominal",
    }

    estimate = generate_cocomo_ii_estimation(
        project_name="Checkout Revamp",
        ksloc=85.0,
        scale_factor_ratings=scale_factor_ratings,
        cost_driver_ratings=cost_driver_ratings,
        hourly_rate=125.0,
    )
    orchestrator.attach_estimate(project_id, estimate.model_dump())

    context = orchestrator.generate_explanation(project_id)
    assert context.explanation is not None

    final_context = orchestrator.load_context(project_id)
    assert len(final_context.estimates) == 1
    assert final_context.estimates[0]["method"] == "cocomo2"
    assert final_context.status == "EXPLANATION_READY"


def test_workflow_state_transitions(tmp_path):
    """Test that workflow state transitions work correctly."""
    repo_path = tmp_path / "workflow.db"
    repository = ProjectContextRepository(db_path=str(repo_path))
    orchestrator = WorkflowOrchestrator(repository=repository)

    project_id = f"test-state-{uuid4()}"
    
    # Start new project - should be NEW
    context = orchestrator.start_new_project(project_id=project_id)
    assert context.status == "NEW"

    # Record baseline fields - should transition to BASELINE_COLLECTED when complete
    orchestrator.record_baseline_field(project_id, "project_type", "software development")
    context = orchestrator.load_context(project_id)
    assert context.status in {"NEW", "BASELINE_COLLECTED"}

    orchestrator.record_baseline_field(project_id, "complexity", "medium")
    orchestrator.record_baseline_field(project_id, "tech_stack", "web technologies")
    orchestrator.record_baseline_field(project_id, "team_pref", "8")
    orchestrator.record_baseline_field(project_id, "region", "North America")
    
    context = orchestrator.load_context(project_id)
    assert context.status == "BASELINE_COLLECTED"

    # Submit description
    orchestrator.submit_description(project_id, "Test project description")
    context = orchestrator.load_context(project_id)
    assert context.status == "BASELINE_COLLECTED"

    # Generate expansion - should transition to AWAITING_EXPANSION
    orchestrator.generate_expansion(project_id)
    context = orchestrator.load_context(project_id)
    assert context.status == "AWAITING_EXPANSION"
    assert context.expansion_draft is not None

    # Confirm expansion - should transition to EXPANSION_CONFIRMED
    orchestrator.confirm_expansion(project_id, approval_text="approve")
    context = orchestrator.load_context(project_id)
    assert context.status == "EXPANSION_CONFIRMED"
    assert context.expansion_confirmed is not None

    # Evaluate methods - should transition to METHOD_SELECTED or INPUTS_REQUESTED
    context = orchestrator.evaluate_methods(project_id)
    assert context.status in {"METHOD_SELECTED", "INPUTS_REQUESTED"}
    assert context.selection is not None
    assert context.parsed_context is not None


def test_error_handling(tmp_path):
    """Test error handling for invalid operations."""
    repo_path = tmp_path / "workflow.db"
    repository = ProjectContextRepository(db_path=str(repo_path))
    orchestrator = WorkflowOrchestrator(repository=repository)

    project_id = f"test-error-{uuid4()}"

    # Try to load non-existent project without create_if_missing
    with pytest.raises(ValueError, match="not found"):
        orchestrator.load_context(project_id)

    # Try to generate expansion without description
    orchestrator.start_new_project(project_id=project_id)
    with pytest.raises(ValueError, match="Cannot generate expansion"):
        orchestrator.generate_expansion(project_id)

    # Try to confirm expansion without draft
    orchestrator.submit_description(project_id, "Test description")
    with pytest.raises(ValueError, match="No expansion draft"):
        orchestrator.confirm_expansion(project_id)

    # Try to evaluate methods without confirmed expansion
    orchestrator.generate_expansion(project_id)
    # New behavior: allow method evaluation using the draft expansion (no confirmation required)
    context = orchestrator.evaluate_methods(project_id)
    assert context.selection is not None

    # Try to generate explanation without method selection
    orchestrator.confirm_expansion(project_id, approval_text="approve")
    # Since we already evaluated methods above, explanation generation should succeed
    context = orchestrator.generate_explanation(project_id)
    assert context.explanation is not None


def test_estimation_tool_validation(tmp_path):
    """Test that estimation tools validate inputs correctly."""
    from tools.storypoints_tools import generate_storypoints_estimation
    from tools.bottomup_tools import WorkPackage, generate_bottom_up_estimation
    from tools.parametric_tools import generate_parametric_estimation
    from tools.fpa_tools import generate_fpa_estimation
    from tools.cocomo_tools import generate_cocomo_ii_estimation

    # Test storypoints validation
    with pytest.raises(ValueError, match="must be positive"):
        generate_storypoints_estimation(
            project_name="Test",
            total_story_points=-10,
            team_velocity=20,
        )

    # Test bottom-up validation
    with pytest.raises(ValueError, match="must not be empty"):
        generate_bottom_up_estimation(
            project_name="Test",
            work_packages=[],
        )

    # Test parametric validation
    with pytest.raises(ValueError, match="must be positive"):
        generate_parametric_estimation(
            project_name="Test",
            total_units=-10,
            cost_per_unit=100,
            hours_per_unit=1,
        )

    # Test FPA validation
    with pytest.raises(ValueError, match="must be positive"):
        generate_fpa_estimation(
            project_name="Test",
            function_counts={"EI": {"average": 10}},
            hours_per_fp=-5,
        )

    # Test COCOMO validation
    with pytest.raises(ValueError, match="must be a positive number"):
        generate_cocomo_ii_estimation(
            project_name="Test",
            ksloc=-10,
            scale_factor_ratings={"prec": "nominal", "flex": "nominal", "resl": "nominal", "team": "nominal", "pmat": "nominal"},
        )


def test_multiple_estimates(tmp_path):
    """Test attaching multiple estimates to a single project."""
    repo_path = tmp_path / "workflow.db"
    repository = ProjectContextRepository(db_path=str(repo_path))
    orchestrator = WorkflowOrchestrator(repository=repository)

    project_id = f"test-multi-{uuid4()}"
    orchestrator.start_new_project(project_id=project_id)

    orchestrator.record_baseline_field(project_id, "project_type", "software development")
    orchestrator.record_baseline_field(project_id, "complexity", "medium")
    orchestrator.record_baseline_field(project_id, "tech_stack", "web technologies")
    orchestrator.record_baseline_field(project_id, "team_pref", "8")
    orchestrator.record_baseline_field(project_id, "region", "North America")

    description = "A web platform project with 160 story points."
    orchestrator.submit_description(project_id, description)
    orchestrator.generate_expansion(project_id)
    orchestrator.confirm_expansion(project_id, approval_text="approve")
    orchestrator.evaluate_methods(project_id)

    # Attach first estimate (storypoints)
    estimate1 = generate_storypoints_estimation(
        project_name="Test Project",
        total_story_points=160,
        team_velocity=20,
    )
    orchestrator.attach_estimate(project_id, estimate1.model_dump(), mark_complete=False)

    # Attach second estimate (bottom-up)
    work_packages = [
        WorkPackage(name="Feature 1", hours=100.0),
        WorkPackage(name="Feature 2", hours=200.0),
    ]
    estimate2 = generate_bottom_up_estimation(
        project_name="Test Project",
        work_packages=work_packages,
    )
    orchestrator.attach_estimate(project_id, estimate2.model_dump(), mark_complete=True)

    final_context = orchestrator.load_context(project_id)
    assert len(final_context.estimates) == 2
    assert final_context.estimates[0]["method"] == "agile_sp"
    assert final_context.estimates[1]["method"] == "bottomup"
    assert final_context.status == "ESTIMATION_COMPLETE"

