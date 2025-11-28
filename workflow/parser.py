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
        inferred_fields: Optional[Dict[str, Any]] = None,
    ) -> ParsedContextV1:
        context = ParsedContextV1()
        provenance: list[ProvenanceEntry] = []

        self._ingest_prior_answers(context, prior_answers, provenance)
        self._extract_numerics(user_text, context, provenance)
        if expansion:
            seed_missing = self._ingest_expansion(expansion, context, provenance)
        else:
            seed_missing = []
            
        if inferred_fields:
            self._ingest_inferred_fields(context, inferred_fields, provenance)

        context.provenance = provenance
        context.missing_signals = self._compute_missing_signals(context, seed_missing)
        return context

    def _ingest_inferred_fields(
        self,
        context: ParsedContextV1,
        inferred: Dict[str, Any],
        provenance: list[ProvenanceEntry],
    ) -> None:
        """Map inferred fields to ParsedContextV1 structure."""
        # KSLOC
        if ksloc_data := inferred.get("ksloc"):
            if context.size.ksloc is None:  # Only if not already set by user
                context.size.ksloc = ksloc_data.get("value")
                provenance.append(ProvenanceEntry(
                    field="size.ksloc", 
                    source="inferred", 
                    span="auto-inferred", 
                    confidence=ksloc_data.get("confidence", 0.5)
                ))
        
        # Function Points
        if fp_data := inferred.get("unadjusted_fp"):
            if context.size.ufp is None:
                context.size.ufp = fp_data.get("value")
                provenance.append(ProvenanceEntry(
                    field="size.ufp", 
                    source="inferred", 
                    span="auto-inferred", 
                    confidence=fp_data.get("confidence", 0.5)
                ))
                
        # Story Points
        if sp_data := inferred.get("story_points"):
            if context.size.story_points is None:
                context.size.story_points = sp_data.get("value")
                provenance.append(ProvenanceEntry(
                    field="size.story_points", 
                    source="inferred", 
                    span="auto-inferred", 
                    confidence=sp_data.get("confidence", 0.5)
                ))
                
        # Velocity
        if vel_data := inferred.get("team_velocity"):
            if context.agile.velocity_sp_per_sprint is None:
                context.agile.velocity_sp_per_sprint = vel_data.get("value")
                provenance.append(ProvenanceEntry(
                    field="agile.velocity_sp_per_sprint", 
                    source="inferred", 
                    span="auto-inferred", 
                    confidence=vel_data.get("confidence", 0.5)
                ))
                
        # Reuse Profile
        if reuse_data := inferred.get("reuse_profile"):
            values = reuse_data.get("value", {})
            if isinstance(values, dict):
                # Map reuse profile keys to context.reuse fields
                if context.reuse.dm_pct is None: context.reuse.dm_pct = values.get("design")
                if context.reuse.cm_pct is None: context.reuse.cm_pct = values.get("code")
                if context.reuse.im_pct is None: context.reuse.im_pct = values.get("integration")
                # Testing reuse maps to aa_pct (assessment & assimilation) or su_pct (software understanding)
                # For now, let's map testing to aa_pct as a proxy
                if context.reuse.aa_pct is None: context.reuse.aa_pct = values.get("testing")
                
                provenance.append(ProvenanceEntry(
                    field="reuse.profile", 
                    source="inferred", 
                    span="auto-inferred", 
                    confidence=reuse_data.get("confidence", 0.5)
                ))

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
        
        # Extract sprint length from phrases like "two-week sprints" or "2 week sprints"
        if context.agile.sprint_days is None:
            # Match numeric weeks: "2-week", "2 week", etc.
            sprint_week_match = re.search(r"(\d+)[\s-]week[\s-]sprint", lowered)
            if sprint_week_match:
                weeks = float(sprint_week_match.group(1))
                context.agile.sprint_days = int(weeks * 7)
                provenance.append(
                    ProvenanceEntry(
                        field="agile.sprint_days",
                        source="user",
                        span=sprint_week_match.group(0),
                        confidence=0.7,
                    )
                )
            else:
                # Match word-based numbers: "two-week", "three-week", etc.
                word_to_num = {
                    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
                    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
                }
                for word, num in word_to_num.items():
                    if re.search(rf"{word}[\s-]week[\s-]sprint", lowered):
                        context.agile.sprint_days = int(num * 7)
                        provenance.append(
                            ProvenanceEntry(
                                field="agile.sprint_days",
                                source="user",
                                span=f"{word}-week sprint",
                                confidence=0.7,
                            )
                        )
                        break
        
        for match in NUMBER_RE.finditer(lowered):
            value = float(match.group("value"))
            label = match.group("label").strip()

            # Check for velocity first (e.g., "20 story points per sprint")
            if ("per sprint" in label or "velocity" in label) and context.agile.velocity_sp_per_sprint is None:
                if "story point" in label or "point" in label:
                    context.agile.velocity_sp_per_sprint = max(1.0, value)
                    provenance.append(
                        ProvenanceEntry(
                            field="agile.velocity_sp_per_sprint",
                            source="user",
                            span=match.group(0),
                            confidence=0.7,
                        )
                    )
                    continue
            elif "story point" in label and context.size.story_points is None:
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
    ) -> list[str]:
        seed_missing: list[str] = []
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
        for feature in expansion.features:
            if feature.source == "user" and context.size.ufp is None and "function" in feature.name.lower():
                context.size.ufp = (context.size.ufp or 0) + 5
        if expansion.missing_signals:
            seed_missing.extend(expansion.missing_signals)
        return seed_missing

    def _compute_missing_signals(self, context: ParsedContextV1, seed: list[str]) -> list[str]:
        missing: list[str] = []
        if not (context.size.ksloc or context.size.ufp or context.size.story_points):
            missing.append("Provide one: ksloc OR ufp counts (ILF/EIF/EI/EO/EQ) OR story_points+velocity")
        if context.reuse.dm_pct is None or context.reuse.cm_pct is None or context.reuse.im_pct is None:
            missing.append("If reuse: dm_pct, cm_pct, im_pct (and optional su_pct, unfm, aa_pct)")
        if context.rates.blended_rate is None and context.team.region is None:
            missing.append("Optional: region or blended rate for cost calibration")
        merged = seed + [item for item in missing if item not in seed]
        return merged[:3]

