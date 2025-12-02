"""
api/routes/validation.py
========================

Validation endpoints router.
Handles /validate-step1, /intake endpoints.
"""

import time as time_module
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from api.schemas import BaselineInputs
from api.dependencies import get_orchestrator
from workflow.controller import WorkflowOrchestrator
from workflow.tracing import get_trace_store, TraceEvent, TraceEventType

router = APIRouter(tags=["validation"])


@router.post("/validate-step1")
async def validate_step1(
    request: Dict[str, Any],
    orchestrator: WorkflowOrchestrator = Depends(get_orchestrator)
):
    """
    Validate Step 1 baseline data and create project context.
    
    This endpoint validates user inputs from Step 1 without business rules,
    creates a ProjectContext, and determines what's missing for each method.
    """
    session_id = request.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    store = get_trace_store()
    
    # Log validation request
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.WORKFLOW_STEP,
        step_name="validate_step1",
        input_data=request
    ))
    
    try:
        from tools.orchestrator_tools import validate_step1_tool
        
        # Call validation tool
        result = validate_step1_tool(session_id, request)
        
        # Log validation result
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.AGENT_RESPONSE,
            agent_name="InterpreterAgent",
            step_name="validate_step1",
            output_data={
                "is_valid": result.get("is_valid", False),
                "errors": result.get("errors", [])
            }
        ))
        
        return {
            "status": "ok" if result.get("is_valid") else "error",
            "is_valid": result.get("is_valid", False),
            "errors": result.get("errors", []),
            "context_status": result.get("context", {}).get("status")
        }
        
    except Exception as e:
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            step_name="validate_step1",
            output_data={"error": str(e)}
        ))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/intake", response_model=Dict[str, Any])
async def intake_baseline(
    inputs: BaselineInputs,
    orchestrator: WorkflowOrchestrator = Depends(get_orchestrator)
):
    """
    Step 1: Receive baseline inputs from the form.
    Validates data via InterpreterAgent and stores in ProjectContext.
    Returns validation status and missing method-specific inputs.
    """
    # Generate session_id
    session_id = f"intake_{int(time_module.time() * 1000)}"
    store = get_trace_store()
    
    # Log intake request
    store.add_event(session_id, TraceEvent(
        session_id=session_id,
        event_type=TraceEventType.USER_INPUT,
        step_name="intake",
        input_data=inputs.dict() if hasattr(inputs, 'dict') else inputs.model_dump()
    ))
    
    try:
        from tools.orchestrator_tools import validate_step1_tool
        
        # Convert BaselineInputs to dict for validation
        baseline_data = inputs.dict(exclude_none=True) if hasattr(inputs, 'dict') else inputs.model_dump(exclude_none=True)
        
        # Call InterpreterAgent's Step 1 validation tool
        result = validate_step1_tool(session_id, baseline_data)
        
        # Log validation result
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.AGENT_RESPONSE,
            agent_name="InterpreterAgent",
            step_name="validate_step1",
            output_data={
                "is_valid": result["is_valid"],
                "errors": result.get("errors", []),
                "missing_by_method": result.get("missing_by_method", {})
            }
        ))
        
        return {
            "status": "validated" if result["is_valid"] else "invalid",
            "session_id": session_id,
            "is_valid": result["is_valid"],
            "errors": result.get("errors", []),
            "missing_by_method": result.get("missing_by_method", {}),
            "context": result.get("context", {})
        }
        
    except Exception as e:
        store.add_event(session_id, TraceEvent(
            session_id=session_id,
            event_type=TraceEventType.ERROR,
            step_name="intake",
            output_data={"error": str(e)}
        ))
        
        return {
            "status": "error",
            "session_id": session_id,
            "is_valid": False,
            "errors": [f"Validation error: {str(e)}"],
            "missing_by_method": {},
            "context": {}
        }


__all__ = ["router"]

