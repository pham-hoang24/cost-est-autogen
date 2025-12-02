from __future__ import annotations

from typing import Dict, List, Optional, Tuple

from .schemas import MethodType, ParsedContextV1, SelectionPayload


class MethodSelector:
    """
    Deterministic rule engine deciding which estimation technique(s) fit best.
    """

    def evaluate(self, context: ParsedContextV1) -> SelectionPayload:
        scores: Dict[MethodType, float] = {
            "cocomo2": self._score_cocomo(context),
            "fpa": self._score_fpa(context),
            "agile_sp": self._score_agile(context),
            "analogous": self._score_analogous(context),
            "parametric": self._score_parametric(context),
            "bottomup": self._score_bottomup(context),
        }

        primary, backups, blend_weights = self._choose(scores, context)
        rationale = self._build_rationale(primary, backups, scores, context)
        required_inputs = self._build_required_inputs(context)
        confidence = self._confidence_from_scores(primary, scores)

        return SelectionPayload(
            primary=primary,
            backups=backups,
            rationale=rationale,
            completeness_scores=scores,
            required_inputs=required_inputs,
            confidence_level=confidence,
            blend_weights=blend_weights,
        )

    def _score_cocomo(self, context: ParsedContextV1) -> float:
        """
        Prefer COCOMO II when we have any reasonable size signal.
        This matches the desired 'method A' behavior where rich descriptions
        and inferred KSLOC should drive deterministic COCOMO selection.
        """
        score = 0.0
        has_ksloc = bool(context.size.ksloc)
        has_other_size = bool(context.size.ufp or context.size.story_points)

        if has_ksloc:
            score += 0.7  # stronger weight on explicit/inferred KSLOC
        if has_other_size:
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
        """
        Analogous is a good fallback when we lack hard size metrics.
        If we already have KSLOC/FP/story points, de-prioritize it slightly
        so COCOMO/FP-style methods win when close.
        """
        has_any_size = bool(context.size.ksloc or context.size.ufp or context.size.story_points)

        # Lower baseline if hard size metrics are available
        score = 0.25 if has_any_size else 0.4
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

    def _score_bottomup(self, context: ParsedContextV1) -> float:
        score = 0.0
        if context.team.pref_size:
            score += 0.3
        if context.size.ufp:
            score += 0.2
        if context.size.ksloc:
            score += 0.2
        if context.platforms:
            score += 0.1
        if context.complexity_signals.integrations_count:
            score += 0.2
        return min(score, 1.0)

    def _choose(
        self,
        scores: Dict[MethodType, float],
        context: ParsedContextV1,
    ) -> Tuple[MethodType, List[MethodType], Optional[Dict[MethodType, float]]]:
        sorted_methods = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        top_method, top_score = sorted_methods[0]
        second_score = sorted_methods[1][1] if len(sorted_methods) > 1 else 0.0
        backups: List[MethodType] = [method for method, score in sorted_methods[1:] if score > 0.0]

        # If we have solid size information, bias tie-breaks towards COCOMO II
        has_any_size = bool(context.size.ksloc or context.size.ufp or context.size.story_points)
        cocomo_score = scores.get("cocomo2", 0.0)
        if has_any_size and top_method != "cocomo2":
            # If COCOMO is within 0.1 of the top method, promote it to primary.
            if cocomo_score >= 0.5 and cocomo_score + 0.1 >= top_score:
                top_method = "cocomo2"

        if top_score == 0.0:
            # Default fallback is analogous with priority to data gathering.
            fallback_backups = [method for method in scores if method != "analogous"]
            return "analogous", fallback_backups, None

        if top_score >= 0.80:
            return top_method, backups, None

        blended_candidates = [(method, score) for method, score in sorted_methods if score >= 0.70]
        if len(blended_candidates) > 1:
            weights = self._normalize_weights(blended_candidates)
            blend_methods = [method for method, _ in blended_candidates]
            return "blend", blend_methods, weights

        if top_score < 0.70:
            return top_method, backups, None

        return top_method, backups, None

    def _build_rationale(
        self,
        primary: MethodType,
        backups: List[MethodType],
        scores: Dict[MethodType, float],
        context: ParsedContextV1,
    ) -> str:
        if primary == "blend":
            methods = ", ".join(backups or scores.keys())
            return f"Multiple methods meet readiness criteria; recommend blending: {methods}."

        reasons = [f"{primary} selected with completeness {scores[primary]:.2f}."]
        if backups:
            reasons.append(f"Backup methods: {', '.join(backups)}.")
        if context.missing_signals:
            reasons.append(f"Missing signals: {', '.join(context.missing_signals)}.")
        return " ".join(reasons)

    def _normalize_weights(self, candidates: List[Tuple[MethodType, float]]) -> Dict[MethodType, float]:
        total = sum(score for _, score in candidates)
        if total <= 0.0:
            return {}
        return {method: score / total for method, score in candidates}

    def _build_required_inputs(self, context: ParsedContextV1) -> List[Dict[str, str]]:
        prompts: List[Dict[str, str]] = []
        signal_prompts = {
            "Provide one: ksloc OR ufp counts (ILF/EIF/EI/EO/EQ) OR story_points+velocity": (
                "size_metrics",
                "Provide either KSLOC, function point counts, or story points with team velocity.",
                "critical",
            ),
            "If reuse: dm_pct, cm_pct, im_pct (and optional su_pct, unfm, aa_pct)": (
                "reuse_profile",
                "Share reuse percentages for design, code, integration, testing (if applicable).",
                "high",
            ),
            "Optional: region or blended rate for cost calibration": (
                "cost_rates",
                "Select delivery region or supply blended labor rate for cost calibration.",
                "medium",
            ),
        }
        for signal in context.missing_signals:
            if signal in signal_prompts:
                field, prompt, priority = signal_prompts[signal]
                prompts.append({"field": field, "prompt": prompt, "priority": priority})
        return prompts[:3]

    def _confidence_from_scores(self, primary: MethodType, scores: Dict[MethodType, float]) -> str:
        score = scores.get(primary, 0.0)
        if primary == "blend":
            score = max(scores.values()) if scores else 0.0
        if score >= 0.85:
            return "high"
        if score >= 0.6:
            return "medium"
        return "low"

