from __future__ import annotations

from typing import Dict, List

from .schemas import ParsedContextV1, SelectionPayload, ResponseEnvelope


class ExplainerService:
    """
    Produces user-facing narratives and machine-readable prompts from workflow outputs.
    """

    def build_summary(
        self,
        project_id: str,
        parsed: ParsedContextV1,
        selection: SelectionPayload,
        improvement_prompts: List[str],
    ) -> str:
        lines = [
            f"Project {project_id}: primary method `{selection.primary}` (score {selection.completeness_scores.get(selection.primary, 0.0):.2f})."
        ]
        if selection.backups:
            lines.append(f"Backup methods: {', '.join(selection.backups)}.")
        if improvement_prompts:
            lines.append(f"To improve accuracy: {', '.join(improvement_prompts)}.")
        if parsed.missing_signals:
            lines.append(f"Still missing: {', '.join(parsed.missing_signals)}.")
        return " ".join(lines)

    def build_envelope(
        self,
        status: str,
        expansion_data,
        parsed: ParsedContextV1,
        selection: SelectionPayload,
        estimates: List[Dict],
        events: List,
        message: str,
    ) -> ResponseEnvelope:
        return ResponseEnvelope(
            status=status,  # type: ignore[arg-type]
            expansion_draft=expansion_data,
            parsed=parsed,
            selection=selection,
            estimates=estimates,
            events=events,
            message_to_user=message,
        )

