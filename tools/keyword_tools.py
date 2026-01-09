from __future__ import annotations

from typing import Any, Dict, List, Optional

from agents.keyword_extractor_agent import KeywordExtractionAgent, deterministic_fallback_extract


_AGENT: Optional[KeywordExtractionAgent] = None


def _get_agent() -> KeywordExtractionAgent:
    global _AGENT
    if _AGENT is None:
        _AGENT = KeywordExtractionAgent()
    return _AGENT


async def extract_keywords_for_message(
    message: str,
    baseline: Optional[Dict[str, Any]] = None,
    prior_extractions: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Extract keywords/signals for a user message.

    Uses OpenRouter when configured; otherwise falls back deterministically.
    """
    try:
        agent = _get_agent()
        return await agent.extract(message=message, baseline=baseline, prior_extractions=prior_extractions)
    except Exception:
        return deterministic_fallback_extract(message, baseline or {})

