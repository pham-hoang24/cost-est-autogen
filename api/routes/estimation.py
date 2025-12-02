"""
api/routes/estimation.py
========================

Estimation endpoints router.
Handles /run-estimation, /generate-report endpoints.
"""

import time as time_module
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from api.schemas import EstimationRequest, RunEstimationRequest
from api.dependencies import get_orchestrator, get_estimation_service
from services.estimation_service import EstimationService
from utils.method_mapping import map_ui_method_to_backend, apply_input_overrides
from workflow.controller import WorkflowOrchestrator
from workflow.tracing import get_trace_store, TraceEvent, TraceEventType

router = APIRouter(tags=["estimation"])


@router.post("/run-estimation")
async def run_estimation(
    request: RunEstimationRequest,
    orchestrator: WorkflowOrchestrator = Depends(get_orchestrator),
    estimation_service: EstimationService = Depends(get_estimation_service)
):
    """
    Run estimation using the selected method's agent.
    
    This endpoint:
    1. Loads ProjectContext and extracts relevant data
    2. If user provided inputs, saves them to context first
    3. Validates inputs and either:
       - Calls estimation tool and returns result
       - Reports missing inputs
    4. Returns estimation result or missing inputs list
    
    Response:
    - status: "ESTIMATION_COMPLETE" | "INPUTS_REQUIRED" | "ERROR"
    - estimate: {...} if complete
    - missing_inputs: [...] if inputs required
    """
    session_id = request.session_id
    method_id = request.method_id
    user_inputs = request.inputs or {}
    
    store = get_trace_store()
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.AGENT_CALL,
        input_data={"method_id": method_id, "inputs": user_inputs},
        metadata={"endpoint": "/run-estimation"}
    ))
    
    try:
        # Load existing context
        try:
            context = orchestrator.load_context(session_id)
            print(f"[run-estimation] Loaded context for {session_id}, status: {context.status}")
        except Exception:
            raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
        
        # Map UI method to backend method
        backend_method = map_ui_method_to_backend(method_id)
        if not backend_method:
            raise HTTPException(status_code=400, detail=f"Unknown method: {method_id}")
        
        print(f"[run-estimation] Method: {method_id} -> {backend_method}")
        
        # Step 1: Save user-provided inputs to context
        if user_inputs:
            print(f"[run-estimation] Applying user inputs: {user_inputs}")
            apply_input_overrides(orchestrator, context, backend_method, user_inputs)
            orchestrator.repository.save(context)
            context = orchestrator.load_context(session_id)
        
        # Step 2: Extract context data for injection
        injected_context = estimation_service.extract_context_for_agent(context, backend_method)
        print(f"[run-estimation] Injected context: {injected_context}")
        
        # Step 3: Check if we have required inputs
        missing_inputs = estimation_service.check_required_inputs(backend_method, injected_context)
        
        if missing_inputs:
            print(f"[run-estimation] Missing inputs: {missing_inputs}")
            orchestrator.report_missing_inputs(session_id, backend_method, missing_inputs)
            return {
                "status": "INPUTS_REQUIRED",
                "method": method_id,
                "missing_inputs": missing_inputs,
                "available_data": injected_context
            }
        
        # Step 4: Run estimation
        print(f"[run-estimation] All inputs available, running {backend_method} estimation...")
        
        estimate_result = await estimation_service.run_estimation(
            session_id=session_id,
            backend_method=backend_method,
            injected_context=injected_context
        )
        
        if estimate_result.get("status") == "error":
            return {
                "status": "ERROR",
                "method": method_id,
                "error": estimate_result.get("error", "Unknown error")
            }
        
        # Step 5: Save estimate to context
        if estimate_result.get("estimate"):
            orchestrator.attach_estimate(session_id, estimate_result["estimate"], mark_complete=True)
            print(f"[run-estimation] Estimate saved, status updated to ESTIMATION_COMPLETE")
        
        return {
            "status": "ESTIMATION_COMPLETE",
            "method": method_id,
            "estimate": estimate_result.get("estimate"),
            "summary": estimate_result.get("summary")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[run-estimation] Error: {e}")
        import traceback
        traceback.print_exc()
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            output_data={"error": str(e), "error_type": type(e).__name__}
        ))
        raise HTTPException(status_code=500, detail=f"Estimation failed: {str(e)}")


@router.post("/generate-report")
async def generate_report(
    request: EstimationRequest,
    orchestrator: WorkflowOrchestrator = Depends(get_orchestrator)
):
    """
    Generate complete cost estimation report matching frontend schema.
    This endpoint triggers the full report generation workflow.
    """
    # Generate or use provided session_id
    session_id = request.session_id or f"report_{int(time_module.time())}"
    store = get_trace_store()
    
    # Log session start
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.SESSION_START,
        input_data={
            "baseline_inputs": (
                request.baseline_inputs.model_dump()
                if hasattr(request.baseline_inputs, "model_dump")
                else request.baseline_inputs.dict()
            ),
            "method_name": request.method_name,
            "additional_inputs": request.additional_inputs
        },
        metadata={"endpoint": "/generate-report"}
    ))
    
    try:
        # Use session_id as project_id for workflow tracing
        project_id = session_id
        
        # Try to load existing context first
        try:
            context = orchestrator.load_context(project_id)
            print(f"Loaded existing context for {project_id}, status: {context.status}")
        except Exception:
            print(f"No existing context for {project_id}, starting new project")
            context = orchestrator.start_new_project(project_id)
            
            # Record baseline inputs only if new project
            baseline = request.baseline_inputs
            orchestrator.record_baseline_field(project_id, "project_type", baseline.project_type)
            orchestrator.record_baseline_field(project_id, "complexity", baseline.complexity)
            orchestrator.record_baseline_field(project_id, "tech_stack", baseline.tech_stack)
            orchestrator.record_baseline_field(project_id, "team_pref", str(baseline.team_pref))
            orchestrator.record_baseline_field(project_id, "region", baseline.region)
            
            # Generate expansion and select methods
            orchestrator.generate_expansion(project_id)
            orchestrator.confirm_expansion(project_id, "approve")
            orchestrator.evaluate_methods(project_id)
        
        # Prepare estimation config
        estimation_config = {
            "includeRisk": True,
            "includeContingency": True,
            "includeOverhead": True,
            "includeProfit": True,
            "currency": "EUR",
            "accuracy": "high"
        }
        
        # Generate full report
        report = orchestrator.generate_full_report(
            project_id=project_id, 
            estimation_config=estimation_config,
            selected_method=request.method_name
        )
        
        # Log session completion
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.SESSION_END,
            output_data={"status": "completed"},
            metadata={
                "total_cost": report.estimation_result.cost_estimate.total_cost,
                "methods_used": report.estimation_result.methods_used,
                "duration": report.estimation_result.timeline_estimate.total_duration
            }
        ))
        store.update_session_status(session_id, "completed")
        
        return report.dict()
        
    except Exception as e:
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            output_data={
                "error": str(e),
                "error_type": type(e).__name__
            }
        ))
        store.update_session_status(session_id, "error")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


__all__ = ["router"]

