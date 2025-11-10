from __future__ import annotations

from typing import Dict, Optional

from .expansion import ExpansionService
from .parser import ParserService
from .selection import MethodSelector
from .explainer import ExplainerService
from .events import EventLogger
from .repository import ProjectContextRepository
from .schemas import (
    ExpansionV1,
    ParsedContextV1,
    ResponseEnvelope,
    SelectionPayload,
)


class WorkflowOrchestrator:
    """
    High-level coordinator that wires together expansion, parsing, method selection,
    explanation, and persistence.
    """

    def __init__(
        self,
        repository: Optional[ProjectContextRepository] = None,
        expansion_service: Optional[ExpansionService] = None,
        parser_service: Optional[ParserService] = None,
        selector: Optional[MethodSelector] = None,
        explainer: Optional[ExplainerService] = None,
        event_logger: Optional[EventLogger] = None,
    ) -> None:
        self.repository = repository or ProjectContextRepository()
        self.expansion_service = expansion_service or ExpansionService(use_llm=False)
        self.parser_service = parser_service or ParserService()
        self.selector = selector or MethodSelector()
        self.explainer = explainer or ExplainerService()
        self.event_logger = event_logger or EventLogger(self.repository)

    def draft_expansion(
        self,
        project_id: str,
        user_text: str,
        prior_answers: Dict[str, str],
    ) -> ResponseEnvelope:
        draft = self.expansion_service.generate_draft(user_text, prior_answers)
        envelope = ResponseEnvelope(
            status="NEEDS_CONFIRMATION",
            expansion_draft=draft,
            parsed=None,
            selection=None,
            estimates=[],
            events=[],
            message_to_user="Here’s a concise expansion of your idea. Anything to correct? Reply ‘approve’ to proceed or edit inline.",
        )
        self.repository.save_latest(project_id, envelope)
        self.event_logger.log(project_id, "EXPANSION_DRAFTED", {"summary": draft.summary})
        return envelope

    def confirm_and_estimate(
        self,
        project_id: str,
        prior_answers: Dict[str, str],
        user_text: str,
        approval_text: Optional[str] = None,
    ) -> ResponseEnvelope:
        latest = self.repository.get_latest(project_id)
        if not latest or latest.expansion_draft is None:
            raise ValueError("No expansion draft available to confirm.")

        expansion_snapshot = latest.expansion_draft if approval_text is None else self._apply_user_edits(latest.expansion_draft, approval_text)
        parsed = self.parser_service.parse(user_text, prior_answers, expansion_snapshot)
        selection = self.selector.evaluate(parsed)
        improvement_prompts = parsed.missing_signals
        summary = self.explainer.build_summary(project_id, parsed, selection, improvement_prompts)

        envelope = self.explainer.build_envelope(
            status="OK",
            expansion_data=expansion_snapshot,
            parsed=parsed,
            selection=selection,
            estimates=[],  # Estimators plug in later.
            events=list(latest.events),
            message=summary,
        )
        self.repository.save_latest(project_id, envelope)
        self.event_logger.log(project_id, "METHOD_SELECTED", {"primary": selection.primary})
        return envelope

    def _apply_user_edits(self, draft: ExpansionV1, approval_text: str) -> ExpansionV1:
        # For now treat approval text as an affirmation. Future enhancements can diff edits.
        if approval_text.strip().lower() in {"approve", "approved"}:
            return draft
        # Minimal approach: append user correction to assumptions.
        assumptions = list(draft.assumptions)
        assumptions.append(f"User correction: {approval_text.strip()}")
        draft.assumptions = assumptions
        return draft

