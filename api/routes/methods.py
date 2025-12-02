"""
api/routes/methods.py
=====================

Method selection and estimation endpoints router.
Handles /select-method, /methods, /estimate, /hybrid endpoints.
"""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException

from api.schemas import (
    BaselineInputs,
    EstimationRequest,
    HybridRequest,
    MethodResponse,
    MethodSelection,
    SelectMethodRequest,
)
from api.dependencies import get_orchestrator
from services.estimation_service import EstimationService
from utils.method_mapping import (
    map_ui_method_to_backend,
    apply_input_overrides,
    try_infer_missing_inputs,
    build_prompts_for_missing,
)
from workflow.controller import WorkflowOrchestrator

router = APIRouter(tags=["methods"])


@router.post("/select-method")
async def select_method_endpoint(
    request: SelectMethodRequest,
    orchestrator: WorkflowOrchestrator = Depends(get_orchestrator)
):
    """
    Handle user selection of a specific estimation method (from Method Cards).
    
    1. Applies any user-provided overrides (e.g., KSLOC entered by the user).
    2. Checks method-specific requirements via WorkflowOrchestrator.
    3. If inputs are missing, attempts targeted inference for this method.
    4. If still missing, returns INPUTS_REQUIRED with prompts for the UI.
    5. If ready, runs the estimator and returns ESTIMATION_COMPLETE with a report.
    """
    from workflow.inference_service import InferenceService

    project_id = request.session_id
    backend_method = map_ui_method_to_backend(request.method_id)
    if not backend_method:
        raise HTTPException(status_code=400, detail=f"Unknown method_id: {request.method_id}")

    try:
        context = orchestrator.load_context(project_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session not found")

    # 1. Apply any user-provided overrides
    if request.input_overrides:
        context = apply_input_overrides(
            orchestrator,
            context,
            backend_method,
            request.input_overrides,
        )

    # 2. Get requirements for this method
    requirements = orchestrator.get_method_requirements(project_id, backend_method)
    missing_fields = list(requirements.get("missing") or [])

    # 3. Attempt targeted inference for missing fields
    if missing_fields:
        inference_service = InferenceService()
        inferred_updates = try_infer_missing_inputs(
            backend_method=backend_method,
            context=context,
            missing_fields=missing_fields,
            inference_service=inference_service,
        )
        if inferred_updates:
            context = apply_input_overrides(
                orchestrator,
                context,
                backend_method,
                inferred_updates,
            )
            # Re-check requirements after inference
            requirements = orchestrator.get_method_requirements(project_id, backend_method)
            missing_fields = list(requirements.get("missing") or [])

    # 4. If we still lack data, ask the user via structured prompts
    if missing_fields:
        prompts = build_prompts_for_missing(backend_method, missing_fields)
        orchestrator.report_missing_inputs(project_id, backend_method, prompts)
        return {
            "status": "INPUTS_REQUIRED",
            "method": request.method_id,
            "missing_inputs": prompts,
        }

    # 5. Ready to estimate
    estimation_service = EstimationService(orchestrator=orchestrator)
    try:
        estimate_result = estimation_service.run_estimation_for_method(
            backend_method=backend_method,
            context=context,
            requirements=requirements,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Estimation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Estimation failed: {str(e)}")

    # Attach estimate and mark workflow as complete
    context = orchestrator.attach_estimate(
        project_id=project_id,
        estimate=estimate_result,
        mark_complete=True,
    )

    # Generate full report
    estimation_config = {
        "includeRisk": True,
        "includeContingency": True,
        "includeOverhead": True,
        "includeProfit": True,
        "currency": "EUR",
        "accuracy": "high",
    }
    report = orchestrator.generate_full_report(
        project_id=project_id,
        estimation_config=estimation_config,
        selected_method=request.method_id,
    )

    # Return report as dict for JSON response
    report_payload = (
        report.model_dump(mode="json") if hasattr(report, "model_dump") else report.dict()
    )

    return {
        "status": "ESTIMATION_COMPLETE",
        "method": request.method_id,
        "report": report_payload,
    }


@router.get("/methods", response_model=List[MethodSelection])
async def get_methods():
    """
    Return supported estimation methods.
    """
    return [
        {"method_name": "COCOMO", "description": "Constructive Cost Model II"},
        {"method_name": "FPA", "description": "Function Point Analysis"},
        {"method_name": "StoryPoints", "description": "Agile Story Points & Velocity"},
        {"method_name": "Parametric", "description": "Parametric Cost Estimation"},
        {"method_name": "BottomUp", "description": "Bottom-up Estimation"},
        {"method_name": "Analogous", "description": "Analogous Estimation"},
    ]


@router.get("/method-requirements/{session_id}/{method_name}")
async def get_method_requirements(
    session_id: str,
    method_name: str,
    orchestrator: WorkflowOrchestrator = Depends(get_orchestrator)
):
    """
    Get requirements for a specific estimation method.
    
    Args:
        session_id: Project/session identifier
        method_name: Method name (cocomo2, analogous, fpa, story_points)
        
    Returns:
        Known coefficients, missing fields, and baseline data
    """
    try:
        from tools.orchestrator_tools import get_method_requirements_tool
        return get_method_requirements_tool(session_id, method_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/estimate", response_model=MethodResponse)
async def estimate(request: EstimationRequest):
    """
    Trigger a specific estimation method.
    """
    # TODO: Connect to actual agents
    return MethodResponse(
        method_name=request.method_name,
        is_sufficient=False,
        missing_inputs=[
            {"field": "ksloc", "prompt": "Estimated KSLOC", "priority": "critical"}
        ],
        diagnostics={"note": "Mock response"}
    )


@router.post("/hybrid", response_model=Dict[str, Any])
async def hybrid_estimate(request: HybridRequest):
    """
    Hybrid 'Quick & Dirty' estimate.
    """
    return {
        "type": "hybrid",
        "composite_estimate": {
            "total_cost": 100000,
            "confidence": 0.4,
            "range": {"min": 50000, "max": 200000}
        },
        "breakdown": []
    }


__all__ = ["router"]

