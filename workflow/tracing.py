"""
workflow/tracing.py
===================

Session-level tracing infrastructure for multi-agent cost estimation workflow.
Provides models, storage, and decorators for comprehensive trace logging.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from functools import wraps
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional
from uuid import uuid4
import time
import json

from pydantic import BaseModel, Field


class TraceEventType(str, Enum):
    """Types of trace events in the workflow."""
    SESSION_START = "session_start"
    USER_INPUT = "user_input"
    AGENT_CALL = "agent_call"
    AGENT_RESPONSE = "agent_response"
    API_CALL = "api_call"
    WORKFLOW_STEP = "workflow_step"
    ERROR = "error"
    SESSION_END = "session_end"


class TraceEvent(BaseModel):
    """A single trace event in the session timeline."""
    event_id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: TraceEventType
    
    # Agent/Step identification
    agent_name: Optional[str] = None
    step_name: Optional[str] = None
    
    # Event data
    input_data: Dict[str, Any] = Field(default_factory=dict)
    output_data: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Performance tracking
    duration_ms: Optional[float] = None
    parent_event_id: Optional[str] = None
    
    class Config:
        use_enum_values = True


class SessionTrace(BaseModel):
    """Complete trace for a session."""
    session_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    events: List[TraceEvent] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    status: str = "active"  # active, completed, error
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class TraceStore:
    """In-memory and file-based trace storage."""
    
    def __init__(self, persist_dir: str = "traces"):
        self._traces: Dict[str, SessionTrace] = {}
        self._persist_dir = Path(persist_dir)
        self._persist_dir.mkdir(exist_ok=True)
        self._load_existing_traces()
    
    def _load_existing_traces(self):
        """Load existing traces from disk on startup."""
        for trace_file in self._persist_dir.glob("*.json"):
            try:
                with open(trace_file, 'r') as f:
                    data = json.load(f)
                    trace = SessionTrace(**data)
                    self._traces[trace.session_id] = trace
            except Exception as e:
                print(f"Warning: Failed to load trace {trace_file}: {e}")
    
    def get_or_create_session(self, session_id: str, metadata: Optional[Dict] = None) -> SessionTrace:
        """Get existing session or create new one."""
        if session_id not in self._traces:
            self._traces[session_id] = SessionTrace(
                session_id=session_id,
                metadata=metadata or {}
            )
            self._persist(self._traces[session_id])
        return self._traces[session_id]
    
    def add_event(self, session_id: str, event: TraceEvent) -> TraceEvent:
        """Add an event to a session trace."""
        trace = self.get_or_create_session(session_id)
        trace.events.append(event)
        trace.updated_at = datetime.utcnow()
        self._persist(trace)
        return event
    
    def update_session_status(self, session_id: str, status: str):
        """Update session status (active, completed, error)."""
        if session_id in self._traces:
            self._traces[session_id].status = status
            self._traces[session_id].updated_at = datetime.utcnow()
            self._persist(self._traces[session_id])
    
    def get_session(self, session_id: str) -> Optional[SessionTrace]:
        """Get a specific session trace."""
        return self._traces.get(session_id)
    
    def get_all_sessions(self, limit: Optional[int] = None, status: Optional[str] = None) -> List[SessionTrace]:
        """Get all session traces with optional filtering."""
        traces = list(self._traces.values())
        
        # Filter by status
        if status:
            traces = [t for t in traces if t.status == status]
        
        # Sort by created_at descending
        traces = sorted(traces, key=lambda t: t.created_at, reverse=True)
        
        # Limit results
        if limit:
            traces = traces[:limit]
        
        return traces
    
    def _persist(self, trace: SessionTrace):
        """Persist trace to disk as JSON."""
        try:
            filepath = self._persist_dir / f"{trace.session_id}.json"
            with open(filepath, 'w') as f:
                # Use model_dump for Pydantic v2, dict for v1
                try:
                    data = trace.model_dump(mode='json')
                except AttributeError:
                    data = trace.dict()
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            print(f"Warning: Failed to persist trace {trace.session_id}: {e}")


# Global trace store instance
_trace_store: Optional[TraceStore] = None


def get_trace_store() -> TraceStore:
    """Get the global trace store instance."""
    global _trace_store
    if _trace_store is None:
        _trace_store = TraceStore()
    return _trace_store


def trace_agent_call(agent_name: str):
    """
    Decorator to automatically trace agent calls.
    
    Usage:
        @trace_agent_call("MyAgent")
        def my_agent_function(project_id: str, ...):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Extract session_id/project_id from kwargs or args
            session_id = kwargs.get('session_id') or kwargs.get('project_id')
            
            # If first arg is 'self', second might be project_id
            if not session_id and len(args) > 1 and isinstance(args[1], str):
                session_id = args[1]
            
            if not session_id:
                # No session tracking, just execute
                return func(*args, **kwargs)
            
            store = get_trace_store()
            start_time = time.time()
            
            # Create input event
            input_event = TraceEvent(
                session_id=session_id,
                event_type=TraceEventType.AGENT_CALL,
                agent_name=agent_name,
                input_data={
                    'function': func.__name__,
                    'args_preview': str(args)[:500],  # Truncate for storage
                    'kwargs_keys': list(kwargs.keys())
                }
            )
            store.add_event(session_id, input_event)
            
            try:
                # Execute the actual function
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                
                # Create output event
                output_event = TraceEvent(
                    session_id=session_id,
                    event_type=TraceEventType.AGENT_RESPONSE,
                    agent_name=agent_name,
                    output_data={
                        'function': func.__name__,
                        'result_type': type(result).__name__,
                        'result_preview': str(result)[:1000]
                    },
                    duration_ms=duration_ms,
                    parent_event_id=input_event.event_id
                )
                store.add_event(session_id, output_event)
                
                return result
                
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                
                # Create error event
                error_event = TraceEvent(
                    session_id=session_id,
                    event_type=TraceEventType.ERROR,
                    agent_name=agent_name,
                    output_data={
                        'function': func.__name__,
                        'error': str(e),
                        'error_type': type(e).__name__
                    },
                    duration_ms=duration_ms,
                    parent_event_id=input_event.event_id
                )
                store.add_event(session_id, error_event)
                raise
        
        return wrapper
    return decorator


def trace_workflow_step(step_name: str):
    """
    Decorator to trace workflow steps (non-agent operations).
    
    Usage:
        @trace_workflow_step("parse_inputs")
        def parse_data(project_id: str, data: dict):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            session_id = kwargs.get('session_id') or kwargs.get('project_id')
            
            if not session_id and len(args) > 1 and isinstance(args[1], str):
                session_id = args[1]
            
            if not session_id:
                return func(*args, **kwargs)
            
            store = get_trace_store()
            start_time = time.time()
            
            # Create workflow step event
            step_event = TraceEvent(
                session_id=session_id,
                event_type=TraceEventType.WORKFLOW_STEP,
                step_name=step_name,
                input_data={'function': func.__name__}
            )
            store.add_event(session_id, step_event)
            
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                
                step_event.duration_ms = duration_ms
                step_event.output_data = {'status': 'completed'}
                
                return result
                
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                
                error_event = TraceEvent(
                    session_id=session_id,
                    event_type=TraceEventType.ERROR,
                    step_name=step_name,
                    output_data={'error': str(e)},
                    duration_ms=duration_ms,
                    parent_event_id=step_event.event_id
                )
                store.add_event(session_id, error_event)
                raise
        
        return wrapper
    return decorator


__all__ = [
    'TraceEventType',
    'TraceEvent',
    'SessionTrace',
    'TraceStore',
    'get_trace_store',
    'trace_agent_call',
    'trace_workflow_step',
]
