from __future__ import annotations

import re
from typing import Dict, Iterable, Optional

from .schemas import ParsedContextV1, ProvenanceEntry, PlatformType, ExpansionV1


NUMBER_RE = re.compile(r"(?P<value>\d+(?:\.\d+)?)\s*(?P<label>[a-zA-Z\%\/ ]+)")


class ParserService:
    """
    Lightweight rule-based parser that extracts estimation signals.

    Designed to be swapped with a richer ML/NLP parser later without affecting
    callers.
    """

    def parse(
        self,
        user_text: str,
        prior_answers: Dict[str, str],
        expansion: Optional[ExpansionV1] = None,
    ) -> ParsedContextV1:
        context = ParsedContextV1()
        provenance: list[ProvenanceEntry] = []

        self._ingest_prior_answers(context, prior_answers, provenance)
        self._extract_numerics(user_text, context, provenance)
        if expansion:
            self._ingest_expansion(expansion, context, provenance)

        context.provenance = provenance
        context.missing_signals = self._compute_missing_signals(context)
        return context

    def _ingest_prior_answers(
        self,
        context: ParsedContextV1,
        prior_answers: Dict[str, str],
        provenance: list[ProvenanceEntry],
    ) -> None:
        if team_pref := prior_answers.get("team_pref"):
            try:
                context.team.pref_size = int(team_pref)
                provenance.append(
                    ProvenanceEntry(field="team.pref_size", source="user", span=team_pref, confidence=0.9)
                )
            except ValueError:
                pass
        if region := prior_answers.get("region"):
            context.team.region = region
            provenance.append(
                ProvenanceEntry(field="team.region", source="user", span=region, confidence=0.9)
            )
        if stack := prior_answers.get("tech_stack"):
            for platform in self._map_stack_to_platforms(stack):
                if platform not in context.platforms:
                    context.platforms.append(platform)
                    provenance.append(
                        ProvenanceEntry(field="platforms", source="user", span=stack, confidence=0.8)
                    )

    def _map_stack_to_platforms(self, stack: str) -> Iterable[PlatformType]:
        mapping = {
            "web": "web",
            "mobile": "android",
            "ios": "ios",
            "android": "android",
            "desktop": "desktop",
            "cloud": "cloud",
        }
        lowered = stack.lower()
        for needle, platform in mapping.items():
            if needle in lowered:
                yield platform  # type: ignore[return-value]

    def _extract_numerics(
        self,
        text: str,
        context: ParsedContextV1,
        provenance: list[ProvenanceEntry],
    ) -> None:
        lowered = text.lower()
        for match in NUMBER_RE.finditer(lowered):
            value = float(match.group("value"))
            label = match.group("label").strip()

            if "story point" in label and context.size.story_points is None:
                context.size.story_points = value
                provenance.append(
                    ProvenanceEntry(
                        field="size.story_points",
                        source="user",
                        span=match.group(0),
                        confidence=0.7,
                    )
                )
            elif "velocity" in label and context.agile.velocity_sp_per_sprint is None:
                context.agile.velocity_sp_per_sprint = max(1.0, value)
                provenance.append(
                    ProvenanceEntry(
                        field="agile.velocity_sp_per_sprint",
                        source="user",
                        span=match.group(0),
                        confidence=0.7,
                    )
                )
            elif any(token in label for token in ("ksloc", "sloc", "lines of code")) and context.size.ksloc is None:
                context.size.ksloc = value
                provenance.append(
                    ProvenanceEntry(
                        field="size.ksloc",
                        source="user",
                        span=match.group(0),
                        confidence=0.6,
                    )
                )

    def _ingest_expansion(
        self,
        expansion: ExpansionV1,
        context: ParsedContextV1,
        provenance: list[ProvenanceEntry],
    ) -> None:
        for platform in expansion.platforms:
            if platform.name not in context.platforms:
                context.platforms.append(platform.name)
                provenance.append(
                    ProvenanceEntry(
                        field="platforms",
                        source=platform.source,
                        span=platform.name,
                        confidence=0.6 if platform.source == "inferred" else 0.9,
                    )
                )

    def _compute_missing_signals(self, context: ParsedContextV1) -> list[str]:
        missing: list[str] = []
        if not (context.size.ksloc or context.size.ufp or context.size.story_points):
            missing.append("Provide one: ksloc OR ufp counts (ILF/EIF/EI/EO/EQ) OR story_points+velocity")
        if context.reuse.dm_pct is None or context.reuse.cm_pct is None or context.reuse.im_pct is None:
            missing.append("If reuse: dm_pct, cm_pct, im_pct (and optional su_pct, unfm, aa_pct)")
        if context.rates.blended_rate is None and context.team.region is None:
            missing.append("Optional: region or blended rate for cost calibration")
        return missing[:3]

