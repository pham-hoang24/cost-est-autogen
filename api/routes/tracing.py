"""
api/routes/tracing.py
=====================

Session tracing endpoints router.
Handles /traces/* endpoints for debugging and monitoring.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException

from workflow.tracing import get_trace_store, TraceEvent, TraceEventType

router = APIRouter(prefix="/traces", tags=["tracing"])


def _generate_event_summary(event: TraceEvent) -> str:
    """Generate human-readable summary for an event."""
    if event.event_type == TraceEventType.USER_INPUT:
        msg = event.input_data.get('message', '')
        return f"User: {msg[:100]}..." if len(msg) > 100 else f"User: {msg}"
    elif event.event_type == TraceEventType.AGENT_CALL:
        func = event.input_data.get('function', 'unknown')
        return f"{event.agent_name}.{func}() called"
    elif event.event_type == TraceEventType.AGENT_RESPONSE:
        func = event.output_data.get('function', 'unknown')
        return f"{event.agent_name}.{func}() responded"
    elif event.event_type == TraceEventType.ERROR:
        error = event.output_data.get('error', 'Unknown error')
        return f"Error: {error[:100]}"
    elif event.event_type == TraceEventType.SESSION_START:
        return "Session started"
    elif event.event_type == TraceEventType.SESSION_END:
        return "Session ended"
    elif event.event_type == TraceEventType.WORKFLOW_STEP:
        return f"Workflow step: {event.step_name}"
    else:
        return event.event_type


@router.get("")
async def list_traces(
    limit: int = 50,
    status: Optional[str] = None
):
    """
    List all session traces with optional filtering.
    
    Query params:
        limit: Maximum number of traces to return (default 50)
        status: Filter by status (active, completed, error)
    """
    store = get_trace_store()
    traces = store.get_all_sessions(limit=limit, status=status)
    
    return [
        {
            "session_id": t.session_id,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat(),
            "status": t.status,
            "event_count": len(t.events),
            "metadata": t.metadata
        }
        for t in traces
    ]


@router.get("/{session_id}")
async def get_trace(session_id: str):
    """Get complete trace for a specific session."""
    store = get_trace_store()
    trace = store.get_session(session_id)
    
    if not trace:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    # Use model_dump for Pydantic v2, dict for v1
    try:
        return trace.model_dump(mode='json')
    except AttributeError:
        return trace.dict()


@router.get("/{session_id}/events")
async def get_trace_events(
    session_id: str,
    event_type: Optional[str] = None,
    agent_name: Optional[str] = None
):
    """
    Get events for a session with optional filtering.
    
    Query params:
        event_type: Filter by event type (session_start, user_input, agent_call, etc.)
        agent_name: Filter by agent name
    """
    store = get_trace_store()
    trace = store.get_session(session_id)
    
    if not trace:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    events = trace.events
    
    # Filter by event_type
    if event_type:
        events = [e for e in events if e.event_type == event_type]
    
    # Filter by agent_name
    if agent_name:
        events = [e for e in events if e.agent_name == agent_name]
    
    # Return as dicts
    try:
        return [e.model_dump(mode='json') for e in events]
    except AttributeError:
        return [e.dict() for e in events]


@router.get("/{session_id}/timeline")
async def get_trace_timeline(session_id: str):
    """Get a formatted timeline view of the session for easy inspection."""
    store = get_trace_store()
    trace = store.get_session(session_id)
    
    if not trace:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    timeline = []
    for event in trace.events:
        summary = _generate_event_summary(event)
        timeline.append({
            "timestamp": event.timestamp.isoformat(),
            "type": event.event_type,
            "agent": event.agent_name or "system",
            "step": event.step_name,
            "duration_ms": event.duration_ms,
            "summary": summary
        })
    
    return {
        "session_id": session_id,
        "status": trace.status,
        "created_at": trace.created_at.isoformat(),
        "total_events": len(timeline),
        "total_duration_ms": sum(e['duration_ms'] for e in timeline if e['duration_ms']),
        "timeline": timeline
    }


__all__ = ["router"]

