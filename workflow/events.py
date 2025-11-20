from __future__ import annotations

from typing import Dict, Optional

from .repository import ProjectContextRepository
from .schemas import EventEntry, ProjectContext


class EventLogger:
    """
    Centralized event logging supporting auditability across the workflow.
    """

    def __init__(self, repository: Optional[ProjectContextRepository] = None) -> None:
        self._repository = repository or ProjectContextRepository()

    def log(self, project_id: str, event_type: str, data: Optional[Dict] = None) -> ProjectContext:
        event = EventEntry(type=event_type, data=data or {})
        return self._repository.append_event(project_id, event)

    def snapshot(self, context: ProjectContext) -> ProjectContext:
        return self._repository.save(context)

