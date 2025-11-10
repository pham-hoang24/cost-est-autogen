from __future__ import annotations

import json
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine, select

from .schemas import EventEntry, ResponseEnvelope


class ProjectContextRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: str = Field(index=True)
    version: int = Field(index=True)
    payload: str = Field(default="{}")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProjectContextRepository:
    """
    Thin persistence layer for project contexts, snapshots, and audit events.

    Uses SQLite via SQLModel for now; swapping the backend only requires replacing
    this repository.
    """

    def __init__(self, database_url: Optional[str] = None) -> None:
        self._database_url = database_url or "sqlite:///app/autogen04202.db"
        self._engine = create_engine(self._database_url, echo=False)
        SQLModel.metadata.create_all(self._engine)

    def _session(self) -> Session:
        return Session(self._engine)

    def get_latest(self, project_id: str) -> Optional[ResponseEnvelope]:
        with self._session() as session:
            statement = (
                select(ProjectContextRecord)
                .where(ProjectContextRecord.project_id == project_id)
                .order_by(ProjectContextRecord.version.desc())
                .limit(1)
            )
            record = session.exec(statement).first()
            if not record:
                return None
            data = json.loads(record.payload)
            return ResponseEnvelope(**data)

    def save_snapshot(self, project_id: str, version: int, envelope: ResponseEnvelope) -> ResponseEnvelope:
        record = ProjectContextRecord(
            project_id=project_id,
            version=version,
            payload=envelope.json(),
        )
        with self._session() as session:
            session.add(record)
            session.commit()
        return envelope

    def append_event(self, project_id: str, event: EventEntry) -> EventEntry:
        current = self.get_latest(project_id)
        if current is None:
            raise ValueError(f"No context found for project_id '{project_id}'.")
        current.events.append(event)
        self.save_latest(project_id, current)
        return event

    def _next_version(self, project_id: str) -> int:
        with self._session() as session:
            statement = (
                select(ProjectContextRecord.version)
                .where(ProjectContextRecord.project_id == project_id)
                .order_by(ProjectContextRecord.version.desc())
                .limit(1)
            )
            latest = session.exec(statement).first()
            return (latest or 0) + 1

    def save_latest(self, project_id: str, envelope: ResponseEnvelope) -> ResponseEnvelope:
        version = self._next_version(project_id)
        return self.save_snapshot(project_id, version, envelope)


