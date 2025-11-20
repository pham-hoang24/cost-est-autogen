from __future__ import annotations

from typing import Any, Dict, List, Optional

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
        estimates: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        estimates = estimates or []
        best_estimate = estimates[0] if estimates else {}

        method_label = selection.primary.upper()
        if selection.primary == "blend" and selection.blend_weights:
            blend_details = ", ".join(
                f"{method}: {weight * 100:.0f}%"
                for method, weight in selection.blend_weights.items()
            )
            method_label = f"BLEND ({blend_details})"

        header = [
            f"## Estimation Summary",
            f"- Project `{project_id}` assessed using **{method_label}**",
            f"- Confidence level: **{selection.confidence_level.capitalize()}**",
        ]

        # Cost & duration ranges
        cost_section: List[str] = []
        cost_range = best_estimate.get("cost_range") if isinstance(best_estimate, dict) else None
        if cost_range:
            currency = cost_range.get("currency", "USD")
            cost_section.append(
                f"- Estimated cost: {currency} {cost_range.get('min'):,.0f} – {cost_range.get('likely'):,.0f} – {cost_range.get('max'):,.0f}"
            )

        duration_range = best_estimate.get("duration_range") if isinstance(best_estimate, dict) else None
        if duration_range:
            unit = duration_range.get("unit", "months")
            cost_section.append(
                f"- Estimated duration: {duration_range.get('min'):.1f} – {duration_range.get('likely'):.1f} – {duration_range.get('max'):.1f} {unit}"
            )

        if not cost_section:
            cost_section.append("- Estimation ranges will be available after calculator execution.")

        # Team breakdown
        team_lines: List[str] = []
        team_data = best_estimate.get("team") if isinstance(best_estimate, dict) else None
        if team_data:
            roles = [
                f"{item.get('count', 0)} × {item.get('role')}"
                for item in team_data
                if isinstance(item, dict)
            ]
            if roles:
                team_lines.append("- Indicative team composition: " + ", ".join(roles))

        # Key drivers
        driver_lines: List[str] = []
        drivers_field = best_estimate.get("drivers") if isinstance(best_estimate, dict) else None
        if isinstance(drivers_field, list):
            for driver in drivers_field[:3]:
                if not isinstance(driver, dict):
                    continue
                factor = driver.get("factor", "driver")
                pct = driver.get("contribution_pct")
                note = driver.get("note")
                detail = f"{factor} ({pct:.1f}% impact)" if pct is not None else factor
                if note:
                    detail += f" – {note}"
                driver_lines.append(f"  - {detail}")
        elif isinstance(drivers_field, dict):
            for key, value in list(drivers_field.items())[:3]:
                driver_lines.append(f"  - {key}: {value}")

        # Assumptions
        assumption_lines: List[str] = []
        assumptions_field = best_estimate.get("assumptions") if isinstance(best_estimate, dict) else None
        if isinstance(assumptions_field, list):
            for assumption in assumptions_field[:5]:
                if isinstance(assumption, dict):
                    text = assumption.get("text")
                    impact = assumption.get("impact", "medium")
                    a_type = assumption.get("type", "default")
                    if text:
                        assumption_lines.append(f"  - ({impact}/{a_type}) {text}")
                elif isinstance(assumption, str):
                    assumption_lines.append(f"  - {assumption}")

        # Improvement prompts combine parser and selector requests
        improvement_lines = [f"  - {prompt}" for prompt in improvement_prompts[:5]]
        if not improvement_lines and parsed.missing_signals:
            improvement_lines = [f"  - {signal}" for signal in parsed.missing_signals[:5]]

        summary_sections: List[str] = []
        summary_sections.extend(header)
        summary_sections.append("")
        summary_sections.append("### Cost & Schedule")
        summary_sections.extend(cost_section)
        if team_lines:
            summary_sections.extend(team_lines)

        if driver_lines:
            summary_sections.append("")
            summary_sections.append("### Top Drivers")
            summary_sections.extend(driver_lines)

        if assumption_lines:
            summary_sections.append("")
            summary_sections.append("### Key Assumptions")
            summary_sections.extend(assumption_lines)

        if improvement_lines:
            summary_sections.append("")
            summary_sections.append("### Improve This Estimate")
            summary_sections.extend(improvement_lines)

        if selection.backups:
            summary_sections.append("")
            summary_sections.append(
                f"_Backup methods available_: {', '.join(selection.backups)}"
            )

        return "\n".join(summary_sections)

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

