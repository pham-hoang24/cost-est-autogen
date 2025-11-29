from __future__ import annotations

import textwrap
from typing import Dict

from .schemas import ExpansionV1, NamedItem, PlatformEntry, ConstraintEntry, TraceEntry


class ExpansionService:
    """
    Controlled expansion helper.

    Currently returns deterministic mock expansions so the pipeline can be wired up
    without an LLM. When `use_llm` is True the service will attempt to call the
    backing model (to be implemented later) while preserving provenance metadata.
    """

    def __init__(self, use_llm: bool = False) -> None:
        self.use_llm = use_llm

    def generate_draft(self, user_text: str, prior_answers: Dict[str, str]) -> ExpansionV1:
        if not user_text.strip():
            return ExpansionV1(summary="No project description provided yet.")

        if self.use_llm:
            raise NotImplementedError(
                "LLM-backed expansion is not implemented. Disable the feature flag to use the deterministic stub."
            )

        summary = self._build_summary(user_text, prior_answers)
        features = self._extract_features(user_text)
        non_functionals = self._extract_non_functionals(user_text)
        platforms = self._infer_platforms(prior_answers)
        constraints = self._infer_constraints(user_text)
        trace = self._build_trace(features, non_functionals, platforms, constraints)

        return ExpansionV1(
            summary=summary,
            features=features,
            non_functionals=non_functionals,
            platforms=platforms,
            constraints=constraints,
            assumptions=[],
            trace=trace,
        )

    def _build_summary(self, user_text: str, prior_answers: Dict[str, str]) -> str:
        project_type = prior_answers.get("project_type", "software project")
        complexity = prior_answers.get("complexity", "undisclosed complexity")
        tech_stack = prior_answers.get("tech_stack", "unspecified technologies")

        template = textwrap.dedent(
            """\
            Overview: {text}
            Project Type: {project_type}
            Complexity: {complexity}
            Tech Stack Focus: {tech_stack}
            """
        )
        return template.format(
            text=user_text.strip(),
            project_type=project_type,
            complexity=complexity,
            tech_stack=tech_stack,
        ).strip()

    def _extract_features(self, user_text: str) -> list[NamedItem]:
        tokens = [fragment.strip() for fragment in user_text.split(",") if fragment.strip()]
        if not tokens:
            tokens = [user_text.strip()]
        features = []
        for token in tokens[:5]:
            features.append(NamedItem(name=token, source="inferred"))
        return features

    def _extract_non_functionals(self, user_text: str) -> list[NamedItem]:
        keywords = ["security", "performance", "availability", "scalability", "compliance"]
        results = []
        lowered = user_text.lower()
        for keyword in keywords:
            if keyword in lowered:
                results.append(NamedItem(name=keyword, source="user"))
        return results

    def _infer_platforms(self, prior_answers: Dict[str, str]) -> list[PlatformEntry]:
        stack = prior_answers.get("tech_stack", "").lower()
        mapping = {
            "web": ["web"],
            "mobile": ["ios", "android"],  # Map mobile to both
            "ios": ["ios"],
            "android": ["android"],
            "cloud": ["cloud"],
            "desktop": ["desktop"],
            "ai": ["cloud"],
        }
        platforms = []
        for token, mapped_platforms in mapping.items():
            if token in stack:
                for platform in mapped_platforms:
                    platforms.append(PlatformEntry(name=platform, source="user"))
        return platforms

    def _infer_constraints(self, user_text: str) -> list[ConstraintEntry]:
        constraints = []
        if "regulation" in user_text.lower():
            constraints.append(ConstraintEntry(text="Regulatory compliance required", source="inferred"))
        return constraints

    def _build_trace(
        self,
        features: list[NamedItem],
        non_functionals: list[NamedItem],
        platforms: list[PlatformEntry],
        constraints: list[ConstraintEntry],
    ) -> list[TraceEntry]:
        trace: list[TraceEntry] = []
        for feature in features:
            trace.append(TraceEntry(field="features", value=feature.name, source=feature.source, note="auto"))
        for item in non_functionals:
            trace.append(TraceEntry(field="non_functionals", value=item.name, source=item.source, note="keyword"))
        for item in platforms:
            trace.append(TraceEntry(field="platforms", value=item.name, source=item.source, note="prior_answer"))
        for item in constraints:
            trace.append(TraceEntry(field="constraints", value=item.text, source=item.source, note="heuristic"))
        return trace

