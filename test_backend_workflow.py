#!/usr/bin/env python3
"""
Test script for backend agentic workflow.
This script tests the full cost estimation workflow from baseline input to report generation.
"""

import sys
import json
from pathlib import Path
from datetime import datetime

# Add project root to path
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from workflow.controller import WorkflowOrchestrator
from workflow.repository import ProjectContextRepository


def save_report(report_dict, output_dir="BE_result"):
    """Save report to JSON file with timestamp."""
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    timestamp = int(datetime.now().timestamp() * 1000)
    filename = f"cost-estimation-report-{timestamp}.json"
    filepath = output_path / filename
    
    with open(filepath, 'w') as f:
        json.dump(report_dict, f, indent=2)
    
    print(f"\n✅ Report saved to: {filepath}")
    return filepath


def print_section(title, char="="):
    """Print formatted section header."""
    print(f"\n{char * 60}")
    print(f"{title}")
    print(f"{char * 60}")


def test_full_workflow():
    """Test the complete cost estimation workflow."""
    
    print_section("🚀 BACKEND AGENTIC WORKFLOW TEST", "=")
    
    # Initialize orchestrator
    print("\n1️⃣  Initializing Workflow Orchestrator...")
    orchestrator = WorkflowOrchestrator()
    
    # Start new project
    project_id = f"test-workflow-{int(datetime.now().timestamp())}"
    print(f"   Project ID: {project_id}")
    
    context = orchestrator.start_new_project(project_id=project_id)
    print(f"   Status: {context.status}")
    
    # Record baseline inputs
    print_section("2️⃣  Recording Baseline Inputs", "-")
    baseline_fields = {
        "project_type": "web application",
        "complexity": "high",
        "tech_stack": "React, Node.js, PostgreSQL",
        "team_pref": "8",
        "region": "North America"
    }
    
    for field, value in baseline_fields.items():
        orchestrator.record_baseline_field(project_id, field, value)
        print(f"   ✓ {field}: {value}")
    
    context = orchestrator.load_context(project_id)
    print(f"   Status: {context.status}")
    
    # Submit project description
    print_section("3️⃣  Submitting Project Description", "-")
    description = """
    We need to build a comprehensive e-commerce platform with the following features:
    - User authentication and authorization
    - Product catalog with search and filtering
    - Shopping cart and checkout process
    - Payment gateway integration (Stripe)
    - Order management system
    - Admin dashboard for inventory management
    - Email notifications
    - Basic analytics and reporting
    
    The platform should handle approximately 10,000 users with expected growth.
    We estimate around 200 story points of work with a team velocity of 25 points per sprint.
    Estimated 15 KSLOC of new code.
    """
    
    orchestrator.submit_description(project_id, description.strip())
    print(f"   ✓ Description submitted ({len(description)} chars)")
    context = orchestrator.load_context(project_id)
    print(f"   Status: {context.status}")
    
    # Generate expansion
    print_section("4️⃣  Generating Expansion Draft", "-")
    try:
        context = orchestrator.generate_expansion(project_id)
        print(f"   ✓ Expansion generated")
        print(f"   Summary: {context.expansion_draft.summary[:100]}...")
        print(f"   Missing signals: {len(context.expansion_draft.missing_signals)}")
        print(f"   Status: {context.status}")
    except Exception as e:
        print(f"   ⚠️  Expansion generation: {e}")
        context = orchestrator.load_context(project_id)
    
    # Confirm expansion
    print_section("5️⃣  Confirming Expansion", "-")
    try:
        context = orchestrator.confirm_expansion(project_id, "approve")
        print(f"   ✓ Expansion confirmed")
        print(f"   Status: {context.status}")
    except Exception as e:
        print(f"   ⚠️  Expansion confirmation: {e}")
        context = orchestrator.load_context(project_id)
    
    # Evaluate methods
    print_section("6️⃣  Evaluating Estimation Methods", "-")
    try:
        context = orchestrator.evaluate_methods(project_id)
        print(f"   ✓ Methods evaluated")
        print(f"   Primary method: {context.selection.primary}")
        print(f"   Confidence: {context.selection.confidence_level}")
        print(f"   Backups: {context.selection.backups}")
        print(f"   Required inputs: {len(context.selection.required_inputs or [])}")
        print(f"   Status: {context.status}")
    except Exception as e:
        print(f"   ⚠️  Method evaluation: {e}")
        context = orchestrator.load_context(project_id)
    
    # Generate mock estimates
    print_section("7️⃣  Generating Estimates", "-")
    
    # Story Points estimate
    sp_estimate = {
        "method": "agile_sp",
        "project_name": "E-commerce Platform",
        "total_story_points": 200,
        "team_velocity": 25,
        "sprint_length_weeks": 2,
        "effort_person_months": 8.0,
        "duration_months": 4.0,
        "total_cost": 160000.0,
        "currency": "USD",
        "confidence": 0.75,
        "breakdown": {
            "sprints_required": 8,
            "team_size": 8,
            "hours_per_point": 6.0
        }
    }
    
    orchestrator.attach_estimate(project_id, sp_estimate, mark_complete=False)
    print(f"   ✓ Story Points estimate attached")
    
    # COCOMO estimate
    cocomo_estimate = {
        "method": "cocomo2",
        "project_name": "E-commerce Platform",
        "ksloc": 15.0,
        "effort_person_months": 7.5,
        "duration_months": 5.2,
        "total_cost": 150000.0,
        "currency": "USD",
        "confidence": 0.70,
        "breakdown": {
            "scale_factor": 1.12,
            "effort_multiplier": 1.05
        }
    }
    
    orchestrator.attach_estimate(project_id, cocomo_estimate, mark_complete=True)
    print(f"   ✓ COCOMO estimate attached")
    
    context = orchestrator.load_context(project_id)
    print(f"   Total estimates: {len(context.estimates)}")
    print(f"   Status: {context.status}")
    
    # Generate explanation
    print_section("8️⃣  Generating Explanation", "-")
    try:
        context = orchestrator.generate_explanation(project_id)
        print(f"   ✓ Explanation generated")
        print(f"   Length: {len(context.explanation)} chars")
        print(f"   Status: {context.status}")
    except Exception as e:
        print(f"   ⚠️  Explanation generation: {e}")
        context = orchestrator.load_context(project_id)
    
    # Generate full report
    print_section("9️⃣  Generating Full Report", "-")
    try:
        estimation_config = {
            "includeRisk": True,
            "includeContingency": True,
            "includeOverhead": True,
            "includeProfit": True,
            "currency": "USD",
            "accuracy": "high"
        }
        
        report = orchestrator.generate_full_report(project_id, estimation_config)
        print(f"   ✓ Full report generated")
        print(f"   Report title: {report.report_title}")
        print(f"   Project type: {report.project_data.project_type}")
        print(f"   Methods used: {len(report.estimation_result.methods_used)}")
        
        # Save report
        report_dict = report.dict()
        filepath = save_report(report_dict)
        
        # Display summary
        print_section("📊 REPORT SUMMARY", "=")
        print(f"   Report Title: {report.report_title}")
        print(f"   Generated At: {report.generated_at}")
        print(f"   Project Type: {report.project_data.project_type}")
        print(f"   Original Type: {report.project_data.original_project_type}")
        print(f"   Estimation Method: {report.estimation_result.estimation_method}")
        print(f"   Methods Used: {', '.join(report.estimation_result.methods_used)}")
        print(f"   Total Cost: ${report.estimation_result.cost_estimate.total_cost:,.2f}")
        print(f"   Labor Cost: ${report.estimation_result.cost_estimate.labor_cost:,.2f}")
        print(f"   Effort: {report.estimation_result.effort_person_months:.1f} person-months")
        print(f"   Duration: {report.estimation_result.timeline_estimate.total_duration}")
        print(f"   Confidence: {report.estimation_result.cost_estimate.confidence_level}")
        print(f"   Team Size: {report.estimation_result.resource_allocation.recommended_team_size}")
        
    except Exception as e:
        print(f"   ❌ Report generation failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print_section("✅ WORKFLOW TEST COMPLETED SUCCESSFULLY", "=")
    return True


def test_multiple_methods():
    """Test with different estimation methods."""
    
    print_section("🔄 TESTING DIFFERENT ESTIMATION METHODS", "=")
    
    test_cases = [
        {
            "name": "Agile Story Points",
            "description": "A mobile app with 120 story points, team velocity of 15 points/sprint.",
            "complexity": "medium"
        },
        {
            "name": "Bottom-up Estimation",
            "description": "Data migration project: ETL development (200h), testing (100h), deployment (50h).",
            "complexity": "high"
        },
        {
            "name": "Parametric Estimation",
            "description": "API integration with 45 endpoints, averaging 4 hours per endpoint.",
            "complexity": "low"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'─' * 60}")
        print(f"Test Case {i}: {test_case['name']}")
        print(f"{'─' * 60}")
        
        orchestrator = WorkflowOrchestrator()
        project_id = f"test-{test_case['name'].lower().replace(' ', '-')}-{int(datetime.now().timestamp())}"
        
        orchestrator.start_new_project(project_id)
        orchestrator.record_baseline_field(project_id, "project_type", "software development")
        orchestrator.record_baseline_field(project_id, "complexity", test_case["complexity"])
        orchestrator.record_baseline_field(project_id, "tech_stack", "web technologies")
        orchestrator.record_baseline_field(project_id, "team_pref", "6")
        orchestrator.record_baseline_field(project_id, "region", "North America")
        orchestrator.submit_description(project_id, test_case["description"])
        
        try:
            orchestrator.generate_expansion(project_id)
            orchestrator.confirm_expansion(project_id, "approve")
            context = orchestrator.evaluate_methods(project_id)
            print(f"   ✓ Primary method selected: {context.selection.primary}")
            print(f"   ✓ Confidence: {context.selection.confidence_level}")
        except Exception as e:
            print(f"   ⚠️  Error: {e}")
    
    print_section("✅ MULTIPLE METHODS TEST COMPLETED", "=")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("BACKEND AGENTIC WORKFLOW TEST SUITE")
    print("=" * 60)
    
    # Test 1: Full workflow
    success = test_full_workflow()
    
    # Test 2: Multiple methods
    if success:
        print("\n" * 2)
        test_multiple_methods()
    
    print("\n" + "=" * 60)
    print("ALL TESTS COMPLETED")
    print("=" * 60 + "\n")
