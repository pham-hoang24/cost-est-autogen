"""
workflow/repository.py
======================

Provides a persistence layer for storing and retrieving project context
across conversational sessions. Replaces the in-memory `_SESSION_STORE`
with a database-backed repository.
"""

from __future__ import annotations

from typing import List, Optional

from sqlmodel import Field, Session, SQLModel, create_engine, select

from .schemas import EventEntry, ProjectContext


class ProjectContextRecord(SQLModel, table=True):
    """
    Database representation of a project context snapshot.
    """

    project_id: str = Field(primary_key=True)
    version: int = Field(default=0)
    context_json: str


class ProjectContextRepository:
    """
    Manages persistence of ProjectContext objects using SQLite.
    """

    def __init__(self, db_path: str = "app/autogen04202.db"):
        self.engine = create_engine(f"sqlite:///{db_path}")
        SQLModel.metadata.create_all(self.engine)

    def list_project_ids(self) -> List[str]:
        with Session(self.engine) as session:
            results = session.exec(select(ProjectContextRecord.project_id))
            return list(results)

    def load(self, project_id: str) -> Optional[ProjectContext]:
        with Session(self.engine) as session:
            record = session.get(ProjectContextRecord, project_id)
            if not record:
                return None
            return ProjectContext.model_validate_json(record.context_json)

    def save(self, context: ProjectContext) -> ProjectContext:
        with Session(self.engine) as session:
            record = session.get(ProjectContextRecord, context.project_id)
            context.version += 1
            if record:
                record.version = context.version
                record.context_json = context.model_dump_json()
            else:
                record = ProjectContextRecord(
                    project_id=context.project_id,
                    version=context.version,
                    context_json=context.model_dump_json(),
                )
            session.add(record)
            session.commit()
            session.refresh(record)
            return ProjectContext.model_validate_json(record.context_json)

    def delete(self, project_id: str) -> None:
        with Session(self.engine) as session:
            record = session.get(ProjectContextRecord, project_id)
            if record:
                session.delete(record)
                session.commit()

    def append_event(self, project_id: str, event: EventEntry) -> ProjectContext:
        context = self.load(project_id)
        if context is None:
            context = ProjectContext(project_id=project_id)
        context.events.append(event)
        return self.save(context)