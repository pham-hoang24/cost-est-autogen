from __future__ import annotations

from typing import Dict, Optional

from .repository import ProjectContextRepository
from .schemas import EventEntry, ResponseEnvelope


class EventLogger:
    """
    Centralized event logging supporting auditability across the workflow.
    """

    def __init__(self, repository: Optional[ProjectContextRepository] = None) -> None:
        self._repository = repository or ProjectContextRepository()

    def log(self, project_id: str, event_type: str, data: Optional[Dict] = None) -> EventEntry:
        event = EventEntry(type=event_type, data=data or {})
        self._repository.append_event(project_id, event)
        return event

    def snapshot(self, project_id: str, envelope: ResponseEnvelope) -> ResponseEnvelope:
        return self._repository.save_latest(project_id, envelope)

