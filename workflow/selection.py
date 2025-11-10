from __future__ import annotations

from typing import Dict, List, Tuple

from .schemas import MethodType, ParsedContextV1, SelectionPayload


class MethodSelector:
    """
    Deterministic rule engine deciding which estimation technique(s) fit best.
    """

    def evaluate(self, context: ParsedContextV1) -> SelectionPayload:
        scores = {
            "cocomo2": self._score_cocomo(context),
            "fpa": self._score_fpa(context),
            "agile_sp": self._score_agile(context),
            "analogous": self._score_analogous(context),
            "parametric": self._score_parametric(context),
        }

        primary, backups = self._choose(scores)
        rationale = self._build_rationale(primary, backups, scores, context)

        return SelectionPayload(
            primary=primary,
            backups=backups,
            rationale=rationale,
            completeness_scores=scores,
        )

    def _score_cocomo(self, context: ParsedContextV1) -> float:
        score = 0.0
        if context.size.ksloc:
            score += 0.6
        if context.size.ufp:
            score += 0.3
        if context.reuse.dm_pct is not None:
            score += 0.05
        if context.rates.blended_rate:
            score += 0.05
        return min(score, 1.0)

    def _score_fpa(self, context: ParsedContextV1) -> float:
        presence = [
            context.size.ufp,
            context.complexity_signals.external_if_count,
            context.complexity_signals.integrations_count,
        ]
        score = sum(0.3 for item in presence if item) + (0.1 if context.reuse.dm_pct else 0.0)
        return min(score, 1.0)

    def _score_agile(self, context: ParsedContextV1) -> float:
        score = 0.0
        if context.size.story_points:
            score += 0.6
        if context.agile.velocity_sp_per_sprint:
            score += 0.3
        if context.agile.sprint_days:
            score += 0.1
        return min(score, 1.0)

    def _score_analogous(self, context: ParsedContextV1) -> float:
        score = 0.4  # baseline readiness
        if context.platforms:
            score += 0.2
        if context.team.pref_size:
            score += 0.2
        if context.quality.reliability:
            score += 0.2
        return min(score, 1.0)

    def _score_parametric(self, context: ParsedContextV1) -> float:
        score = 0.0
        if context.size.ufp:
            score += 0.4
        if context.rates.blended_rate:
            score += 0.3
        if context.team.pref_size:
            score += 0.2
        if context.reuse.dm_pct is not None:
            score += 0.1
        return min(score, 1.0)

    def _choose(self, scores: Dict[MethodType, float]) -> Tuple[MethodType, List[MethodType]]:
        sorted_methods = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        top_method, top_score = sorted_methods[0]
        second_score = sorted_methods[1][1] if len(sorted_methods) > 1 else 0.0
        backups: List[MethodType] = [method for method, score in sorted_methods[1:] if score > 0.0]

        if top_score == 0.0:
            # Default fallback is analogous with priority to data gathering.
            return "analogous", [method for method in scores if method != "analogous"]

        if top_score - second_score <= 0.05 and second_score > 0.0:
            blended = [method for method, score in sorted_methods if score >= second_score]
            return "blend", [method for method in blended]

        return top_method, backups

    def _build_rationale(
        self,
        primary: MethodType,
        backups: List[MethodType],
        scores: Dict[MethodType, float],
        context: ParsedContextV1,
    ) -> str:
        if primary == "blend":
            methods = ", ".join(backups or scores.keys())
            return f"Multiple methods have similar completeness scores; recommend blending: {methods}."

        reasons = [f"{primary} selected with completeness {scores[primary]:.2f}."]
        if backups:
            reasons.append(f"Backup methods: {', '.join(backups)}.")
        if context.missing_signals:
            reasons.append(f"Missing signals: {', '.join(context.missing_signals)}.")
        return " ".join(reasons)

