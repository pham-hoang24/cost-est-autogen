"""
api/dependencies.py
===================

FastAPI dependency injection for shared instances.
Provides singleton access to orchestrator, repository, and services.
"""

from functools import lru_cache
from typing import Generator

from workflow.controller import WorkflowOrchestrator
from workflow.repository import ProjectContextRepository
from workflow.tracing import get_trace_store, TraceStore


# =============================================================================
# Singleton Instances
# =============================================================================

@lru_cache()
def get_orchestrator() -> WorkflowOrchestrator:
    """
    Get singleton WorkflowOrchestrator instance.
    Uses lru_cache to ensure only one instance is created.
    """
    return WorkflowOrchestrator()


@lru_cache()
def get_repository() -> ProjectContextRepository:
    """
    Get singleton repository instance.
    The orchestrator uses this internally, but we expose it for direct access.
    """
    return get_orchestrator().repository


@lru_cache()
def get_trace_store_instance() -> TraceStore:
    """
    Get singleton trace store instance.
    """
    return get_trace_store()


# =============================================================================
# Service Dependencies (will be populated as services are created)
# =============================================================================

def get_estimation_service():
    """
    Get EstimationService instance with injected dependencies.
    """
    from services.estimation_service import EstimationService
    return EstimationService(
        orchestrator=get_orchestrator(),
        repository=get_repository()
    )


def get_chat_service():
    """
    Get ChatService instance with injected dependencies.
    """
    from services.chat_service import ChatService
    return ChatService(orchestrator=get_orchestrator())


def get_report_service():
    """
    Get ReportService instance with injected dependencies.
    """
    from services.report_service import ReportService
    return ReportService(orchestrator=get_orchestrator())


__all__ = [
    "get_orchestrator",
    "get_repository",
    "get_trace_store_instance",
    "get_estimation_service",
    "get_chat_service",
    "get_report_service",
]

