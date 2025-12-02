"""
services/report_service.py
==========================

Report generation service.
Wraps the ReportGeneratorService for use in API routes.
"""

from typing import Any, Dict, Optional

from workflow.controller import WorkflowOrchestrator
from workflow.report_generator import ReportGeneratorService


class ReportService:
    """
    Service class for generating estimation reports.
    Wraps the underlying ReportGeneratorService with additional logic.
    """
    
    def __init__(self, orchestrator: Optional[WorkflowOrchestrator] = None):
        """
        Initialize the report service.
        
        Args:
            orchestrator: WorkflowOrchestrator instance
        """
        self.orchestrator = orchestrator or WorkflowOrchestrator()
        self.report_generator = ReportGeneratorService(self.orchestrator.repository)
    
    def generate_report(
        self,
        session_id: str,
        method_name: Optional[str] = None,
        baseline_inputs: Optional[Dict[str, Any]] = None,
        additional_inputs: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a cost estimation report.
        
        Args:
            session_id: Session identifier
            method_name: Optional method name to use
            baseline_inputs: Optional baseline inputs to merge
            additional_inputs: Optional additional inputs
            
        Returns:
            Report dictionary
        """
        # Load context
        context = self.orchestrator.repository.load(session_id)
        
        if not context:
            raise ValueError(f"Session {session_id} not found")
        
        # Generate the report
        report = self.report_generator.generate_report(session_id)
        
        if hasattr(report, "model_dump"):
            return report.model_dump()
        elif hasattr(report, "dict"):
            return report.dict()
        else:
            return report
    
    def get_report_status(self, session_id: str) -> Dict[str, Any]:
        """
        Get the current status of report generation.
        
        Args:
            session_id: Session identifier
            
        Returns:
            Status dictionary
        """
        context = self.orchestrator.repository.load(session_id)
        
        if not context:
            return {"status": "not_found", "session_id": session_id}
        
        has_estimates = bool(context.estimates)
        
        return {
            "status": context.status,
            "session_id": session_id,
            "has_estimates": has_estimates,
            "estimate_count": len(context.estimates) if context.estimates else 0,
            "can_generate_report": has_estimates and context.status in [
                "ESTIMATION_COMPLETE", "METHOD_SELECTED"
            ]
        }


__all__ = ["ReportService"]

