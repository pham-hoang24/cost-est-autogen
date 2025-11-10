"""
tools/intake_tools.py
=====================

Helpers for conversational intake: extracting an estimation method, collecting
required parameters, and producing structured payloads. Supports both LLM-driven
agents and a deterministic fallback question tree for offline usage.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

_SESSION_STORE: Dict[str, Dict[str, Any]] = {}
_COMPLETED_PAYLOADS: Dict[str, Dict[str, Any]] = {}

_FLOAT_RE = re.compile(r"(-?\d+(?:\.\d+)?)")

_METHOD_SPEC: Dict[str, Dict[str, Any]] = {
    "storypoints": {
        "keywords": ["story point", "velocity", "sprint", "agile"],
        "required": ["total_story_points", "team_velocity"],
        "optional": ["sprint_length_weeks", "hours_per_point", "project_name"],
        "questions": {
            "method": "Which estimation technique should we use? Options: storypoints, cocomo, parametric.",
            "total_story_points": "How many total story points are in scope?",
            "team_velocity": "What is the team's velocity (points per sprint)?",
            "sprint_length_weeks": "How many weeks per sprint?",
            "hours_per_point": "How many hours does one story point typically take?",
            "project_name": "What is the project name?"
        },
    },
    "cocomo": {
        "keywords": ["cocomo", "ksloc", "post-architecture", "cost driver"],
        "required": ["ksloc"],
        "optional": ["hourly_rate", "project_name"],
        "questions": {
            "method": "Which estimation technique should we use? Options: storypoints, cocomo, parametric.",
            "ksloc": "Roughly how many KSLOC (thousands of source lines) are in scope?",
            "hourly_rate": "What blended hourly rate should we use (USD)?",
            "project_name": "What is the project name?"
        },
    },
    "parametric": {
        "keywords": ["per unit", "unit cost", "throughput", "productivity"],
        "required": ["total_units", "cost_per_unit", "hours_per_unit"],
        "optional": ["team_productivity_units_per_week", "project_name"],
        "questions": {
            "method": "Which estimation technique should we use? Options: storypoints, cocomo, parametric.",
            "total_units": "How many deliverable units are required?",
            "cost_per_unit": "What is the target cost per unit (USD)?",
            "hours_per_unit": "How many labor hours does one unit take?",
            "team_productivity_units_per_week": "How many units per week can the team deliver?",
            "project_name": "What is the project name?"
        },
    },
}

_FIELD_LABELS: Dict[str, Dict[str, List[str]]] = {
    "storypoints": {
        "total_story_points": ["story point", "storypoint", "points total"],
        "team_velocity": ["velocity", "points per sprint"],
        "sprint_length_weeks": ["sprint", "weeks per sprint"],
        "hours_per_point": ["hours per point", "hours/story point"],
        "project_name": ["project", "initiative"],
    },
    "cocomo": {
        "ksloc": ["ksloc", "thousand lines"],
        "hourly_rate": ["hourly rate", "rate per hour", "blended rate"],
        "project_name": ["project", "initiative"],
    },
    "parametric": {
        "total_units": ["total units", "units total"],
        "cost_per_unit": ["cost per unit", "unit cost", "usd per unit"],
        "hours_per_unit": ["hours per unit", "hours/unit"],
        "team_productivity_units_per_week": ["units per week", "throughput"],
        "project_name": ["project", "initiative"],
    },
}


def reset_session(session_id: str) -> Dict[str, str]:
    """Clear any stored context for a conversational session."""
    _SESSION_STORE.pop(session_id, None)
    return {"status": "reset", "session_id": session_id}


def _ensure_session(session_id: str) -> Dict[str, Any]:
    if session_id not in _SESSION_STORE:
        _SESSION_STORE[session_id] = {
            "method": None,
            "fields": {},
            "pending_field": None,
        }
    return _SESSION_STORE[session_id]


def _infer_method(text: str) -> Optional[str]:
    lowered = text.lower()
    for method, spec in _METHOD_SPEC.items():
        if any(keyword in lowered for keyword in spec["keywords"]):
            return method
    tokens = lowered.strip()
    if tokens in _METHOD_SPEC:
        return tokens
    return None


def _parse_number(text: str) -> Optional[float]:
    match = _FLOAT_RE.search(text.replace(",", ""))
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None


def _update_fields_from_text(method: str, text: str, session: Dict[str, Any]) -> None:
    field_keywords = _FIELD_LABELS.get(method, {})
    lowered = text.lower()
    for field, keywords in field_keywords.items():
        if field in session["fields"]:
            continue
        for keyword in keywords:
            if keyword in lowered:
                value = _parse_number(text)
                if value is not None:
                    session["fields"][field] = value
                elif field == "project_name":
                    session["fields"][field] = text.strip()
                break


def intake_step(session_id: str, user_text: str) -> Dict[str, Any]:
    """
    Process a conversational turn, updating session state and determining next steps.
    """
    session = _ensure_session(session_id)
    response: Dict[str, Any] = {"session_id": session_id}

    text = user_text.strip()
    lowered = text.lower()

    if session["pending_field"]:
        field = session["pending_field"]
        if field == "project_name" and text:
            session["fields"][field] = text
        else:
            value = _parse_number(text)
            if value is not None:
                session["fields"][field] = value
        session["pending_field"] = None

    if session["method"] is None:
        inferred = _infer_method(lowered)
        if inferred:
            session["method"] = inferred

    method = session["method"]

    if method:
        _update_fields_from_text(method, text, session)

    if (method is None) and text in _METHOD_SPEC:
        session["method"] = text
        method = text

    if method is None:
        session["pending_field"] = "method"
        spec = _METHOD_SPEC["storypoints"]  # use a default prompt
        next_question = spec["questions"]["method"]
        response.update(
            {
                "message": "I need to know which estimation technique to use.",
                "method": None,
                "collected": {},
                "missing": [],
                "ready": False,
                "next_question": next_question,
            }
        )
        return response

    spec = _METHOD_SPEC[method]
    required_fields = spec["required"]
    missing_fields = [field for field in required_fields if field not in session["fields"]]

    ready = len(missing_fields) == 0
    next_question: Optional[str] = None

    if not ready:
        next_field = missing_fields[0]
        session["pending_field"] = next_field
        next_question = spec["questions"].get(next_field, f"Please provide {next_field}.")

    summary_parts = []
    for key, value in session["fields"].items():
        summary_parts.append(f"{key}: {value}")

    summary = ", ".join(summary_parts) if summary_parts else "No parameters captured yet."
    response.update(
        {
            "message": f"Target method: {method}. Currently captured -> {summary}",
            "method": method,
            "collected": session["fields"],
            "missing": missing_fields,
            "ready": ready,
            "next_question": next_question,
        }
    )
    return response


def _default_payload(method: str, fields: Dict[str, Any]) -> Dict[str, Any]:
    project_name = str(fields.get("project_name") or "User Project")
    if method == "storypoints":
        if "total_story_points" not in fields or "team_velocity" not in fields:
            raise ValueError("Story Points estimation requires total_story_points and team_velocity.")
        payload: Dict[str, Any] = {
            "method": method,
            "kwargs": {
                "project_name": project_name,
                "total_story_points": float(fields["total_story_points"]),
                "team_velocity": float(fields["team_velocity"]),
            },
        }
        if "sprint_length_weeks" in fields:
            payload["kwargs"]["sprint_length_weeks"] = float(fields["sprint_length_weeks"])
        if "hours_per_point" in fields:
            payload["kwargs"]["hours_per_point"] = float(fields["hours_per_point"])
        return payload

    if method == "cocomo":
        if "ksloc" not in fields:
            raise ValueError("COCOMO estimation requires ksloc.")
        payload = {
            "method": method,
            "kwargs": {
                "project_name": project_name,
                "ksloc": float(fields["ksloc"]),
                "scale_factor_ratings": {
                    "prec": "nominal",
                    "flex": "nominal",
                    "resl": "nominal",
                    "team": "nominal",
                    "pmat": "nominal",
                },
                "cost_driver_ratings": {},
            },
        }
        if "hourly_rate" in fields:
            payload["kwargs"]["hourly_rate"] = float(fields["hourly_rate"])
        return payload

    if method == "parametric":
        required = {"total_units", "cost_per_unit", "hours_per_unit"}
        if not required.issubset(fields.keys()):
            missing = required.difference(fields.keys())
            raise ValueError(f"Parametric estimation missing fields: {', '.join(sorted(missing))}")
        payload = {
            "method": method,
            "kwargs": {
                "project_name": project_name,
                "total_units": float(fields["total_units"]),
                "cost_per_unit": float(fields["cost_per_unit"]),
                "hours_per_unit": float(fields["hours_per_unit"]),
            },
        }
        if "team_productivity_units_per_week" in fields:
            payload["kwargs"]["team_productivity_units_per_week"] = float(
                fields["team_productivity_units_per_week"]
            )
        return payload

    raise ValueError(f"Unsupported method '{method}'.")


def intake_snapshot(session_id: str) -> Dict[str, Any]:
    """Return a payload preview without clearing stored state."""
    session = _SESSION_STORE.get(session_id)
    if not session:
        raise ValueError("Intake session not found.")
    method = session.get("method")
    fields = session.get("fields", {})
    if not method:
        raise ValueError("Method is still unknown.")
    return _default_payload(method, fields)


def intake_finalize(session_id: str) -> Dict[str, Any]:
    """Return structured payload and clear session."""
    session = _SESSION_STORE.get(session_id)
    if not session:
        raise ValueError("Intake session not found.")
    method = session.get("method")
    fields = session.get("fields", {})
    if not method:
        raise ValueError("Method was never determined.")
    payload = _default_payload(method, fields)
    _COMPLETED_PAYLOADS[session_id] = payload
    reset_session(session_id)
    return payload


def consume_final_payload(session_id: str) -> Dict[str, Any]:
    """Retrieve the payload produced by intake_finalize."""
    if session_id not in _COMPLETED_PAYLOADS:
        raise ValueError("No completed payload available for this session.")
    return _COMPLETED_PAYLOADS.pop(session_id)


def offline_intake_flow(initial_text: str) -> Dict[str, Any]:
    """Deterministic question tree for environments without LLM access."""
    session_id = "offline"
    reset_session(session_id)
    result = intake_step(session_id, initial_text)
    while True:
        if result["ready"]:
            break
        question = result.get("next_question") or "Please provide additional detail:"
        answer = input(f"{question} ").strip()
        if not answer:
            continue
        result = intake_step(session_id, answer)
    intake_finalize(session_id)
    return consume_final_payload(session_id)

