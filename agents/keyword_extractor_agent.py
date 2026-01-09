from __future__ import annotations

import hashlib
import json
import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from agent_framework.openai import OpenAIChatClient


_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


def _strip_code_fences(text: str) -> str:
    return _CODE_FENCE_RE.sub("", text.strip())


def _message_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _default_extraction(message: str) -> Dict[str, Any]:
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "message_hash": _message_hash(message),
        "features": [],
        "non_functionals": [],
        "platforms": [],
        "integrations": [],
        "numeric_hints": {},
        "entities": {"domains": [], "data_types": []},
        "confidence": 0.0,
        "provenance": {"source": "fallback"},
    }


def deterministic_fallback_extract(message: str, baseline: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Deterministic fallback extraction (used when no API key is available or parsing fails).
    Keeps behavior stable for tests/offline mode.
    """
    msg = (message or "").strip()
    baseline = baseline or {}
    out = _default_extraction(msg)

    lowered = msg.lower()

    # Features: naive comma split, cap to avoid noise.
    tokens = [t.strip() for t in msg.split(",") if t.strip()]
    if tokens:
        out["features"] = tokens[:10]
        out["confidence"] = 0.35

    # Non-functionals: keyword spotting.
    nfr_keywords = ["security", "performance", "availability", "scalability", "compliance", "privacy", "audit", "latency"]
    out["non_functionals"] = [k for k in nfr_keywords if k in lowered]
    if out["non_functionals"]:
        out["confidence"] = max(out["confidence"], 0.45)

    # Platforms: infer from tech_stack baseline or message.
    stack = str(baseline.get("tech_stack") or "").lower()
    platform_tokens = set()
    for s in [stack, lowered]:
        if "web" in s:
            platform_tokens.add("web")
        if "mobile" in s or "android" in s:
            platform_tokens.add("android")
        if "ios" in s:
            platform_tokens.add("ios")
        if "cloud" in s:
            platform_tokens.add("cloud")
        if "desktop" in s:
            platform_tokens.add("desktop")
    out["platforms"] = sorted(platform_tokens)[:5]

    out["provenance"] = {"source": "fallback", "notes": "keyword spotting + comma features"}
    return out


class KeywordExtractionAgent:
    """
    OpenRouter-backed keyword extraction.

    Produces strict JSON so it can be persisted safely and consumed by downstream inference.
    """

    def __init__(self, model: Optional[str] = None):
        self.model = model or os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
        self.client = OpenAIChatClient(model=self.model)

    async def extract(
        self,
        message: str,
        baseline: Optional[Dict[str, Any]] = None,
        prior_extractions: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        msg = (message or "").strip()
        baseline = baseline or {}
        prior_extractions = prior_extractions or []

        # No key -> deterministic fallback
        if not os.getenv("OPENROUTER_API_KEY") and not os.getenv("OPENAI_API_KEY"):
            return deterministic_fallback_extract(msg, baseline)

        system = (
            "You extract project keywords/signals for software cost estimation.\n"
            "Return STRICT JSON ONLY (no markdown, no prose)."
        )

        schema = {
            "timestamp": "ISO-8601 string",
            "message_hash": "sha256 hex of the user message",
            "features": ["string"],
            "non_functionals": ["string"],
            "platforms": ["web|ios|android|desktop|cloud|other"],
            "integrations": ["string"],
            "numeric_hints": {"ksloc": "number?", "story_points": "number?", "velocity": "number?", "ufp": "number?"},
            "entities": {"domains": ["string"], "data_types": ["string"]},
            "confidence": "number 0..1",
            "provenance": {"source": "openrouter", "model": "string"},
        }

        user = {
            "instruction": "Extract keywords/signals from the latest user message. Be concise, avoid duplicates.",
            "baseline": baseline,
            "latest_message": msg,
            "prior_extractions_tail": prior_extractions[-2:],  # keep prompt small
            "required_output_schema": schema,
        }

        raw = await self.client.chat(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user, ensure_ascii=False)},
            ],
            temperature=0.0,
        )

        cleaned = _strip_code_fences(raw)
        try:
            data = json.loads(cleaned)
            # Fill required meta
            data.setdefault("timestamp", datetime.utcnow().isoformat())
            data.setdefault("message_hash", _message_hash(msg))
            data.setdefault("provenance", {"source": "openrouter", "model": self.model})
            # Basic shape enforcement
            if not isinstance(data.get("features"), list):
                data["features"] = []
            if not isinstance(data.get("non_functionals"), list):
                data["non_functionals"] = []
            if not isinstance(data.get("platforms"), list):
                data["platforms"] = []
            if not isinstance(data.get("integrations"), list):
                data["integrations"] = []
            if not isinstance(data.get("numeric_hints"), dict):
                data["numeric_hints"] = {}
            if not isinstance(data.get("entities"), dict):
                data["entities"] = {"domains": [], "data_types": []}
            return data
        except Exception:
            return deterministic_fallback_extract(msg, baseline)

