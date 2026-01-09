"""
workflow/repository.py
======================

Provides a persistence layer for storing and retrieving project context
across conversational sessions. Replaces the in-memory `_SESSION_STORE`
with a database-backed repository.
"""

from __future__ import annotations

import os
from pathlib import Path
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

    def __init__(self, db_path: Optional[str] = None):
        """
        Args:
            db_path: Path to the sqlite file.
                - If None: read from PROJECT_CONTEXT_DB_PATH, defaulting to 'autogen_sessions.db'
                - If relative: resolve relative to the package root (cost-est-autogen/), not process CWD
        """
        if db_path is None:
            db_path = os.getenv("PROJECT_CONTEXT_DB_PATH", "autogen_sessions.db")

        db_file = Path(db_path)
        if not db_file.is_absolute():
            # repository.py is under cost-est-autogen/workflow/; package root is one level up.
            package_root = Path(__file__).resolve().parents[1]
            db_file = package_root / db_file

        db_file = db_file.resolve()
        db_file.parent.mkdir(parents=True, exist_ok=True)

        self.engine = create_engine(f"sqlite:///{db_file}")
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