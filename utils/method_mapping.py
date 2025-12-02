"""
utils/method_mapping.py
=======================

Helper functions for method mapping and input handling.
Extracted from main.py for better testability and reusability.
"""

from typing import Any, Dict, List, Optional


def map_ui_method_to_backend(method_id: str) -> Optional[str]:
    """
    Map frontend method IDs to backend identifiers.
    
    Args:
        method_id: Frontend method identifier (e.g., "cocomo", "function-points")
        
    Returns:
        Backend method identifier or None if not found
    """
    method_id_lower = method_id.strip().lower()
    mapping = {
        "cocomo": "cocomo2",
        "cocomo2": "cocomo2",
        "function-points": "fpa",
        "function_points": "fpa",
        "fpa": "fpa",
        "story-points": "story_points",
        "story_points": "story_points",
        "agile_sp": "story_points",
        "analogous": "analogous",
        "parametric": "parametric",
        "bottom-up": "bottomup",
        "bottomup": "bottomup",
        "hybrid": "blend",
        "blend": "blend",
    }
    return mapping.get(method_id_lower)


def map_backend_method_to_ui(backend_method: str) -> str:
    """
    Map backend method identifiers to frontend-friendly names.
    
    Args:
        backend_method: Backend method identifier
        
    Returns:
        Frontend-friendly method name
    """
    mapping = {
        "cocomo2": "cocomo",
        "fpa": "function-points",
        "story_points": "story-points",
        "agile_sp": "story-points",
        "analogous": "analogous",
        "parametric": "parametric",
        "bottomup": "bottom-up",
        "blend": "hybrid",
    }
    return mapping.get(backend_method, backend_method)


def apply_input_overrides(
    orchestrator,
    context,
    backend_method: str,
    overrides: Dict[str, Any],
):
    """
    Apply user-provided or inferred inputs to method-specific coefficients.
    This keeps get_method_requirements() in sync by updating MethodCoefficients
    and recomputing missing_by_method.
    
    Args:
        orchestrator: WorkflowOrchestrator instance
        context: ProjectContext instance
        backend_method: Backend method identifier
        overrides: Dictionary of field overrides
        
    Returns:
        Updated context
    """
    from workflow.method_coefficients import MethodCoefficients

    project_id = context.project_id

    # Ensure method_coeffs exists and is a proper model
    if not getattr(context, "method_coeffs", None) or isinstance(context.method_coeffs, dict):
        context.method_coeffs = MethodCoefficients()

    coeffs = context.method_coeffs

    # Normalize keys to lowercase for easier matching
    normalized = {k.lower(): v for k, v in overrides.items()}

    if backend_method == "cocomo2":
        target = coeffs.cocomo2
        # Size value (KSLOC or FP)
        size_val = normalized.get("size_value", normalized.get("ksloc"))
        if size_val is not None:
            try:
                target.size_value = float(size_val)
            except (TypeError, ValueError):
                pass
        # Mode (organic, semi_detached, embedded)
        if "mode" in normalized:
            mode_val = str(normalized["mode"]).lower().replace("-", "_")
            if mode_val in {"organic", "semi_detached", "embedded"}:
                target.mode = mode_val  # type: ignore[assignment]

    elif backend_method == "fpa":
        target = coeffs.fpa
        if "ufp" in normalized:
            try:
                target.ufp = int(float(normalized["ufp"]))
            except (TypeError, ValueError):
                pass
        if "vaf" in normalized:
            try:
                target.vaf = float(normalized["vaf"])
            except (TypeError, ValueError):
                pass

    elif backend_method == "analogous":
        target = coeffs.analogous
        if "tshirt_size" in normalized:
            ts = str(normalized["tshirt_size"]).lower()
            if ts in {"xs", "s", "m", "l", "xl"}:
                target.tshirt_size = ts  # type: ignore[assignment]

    elif backend_method == "story_points":
        target = coeffs.story_points
        if "team_velocity" in normalized:
            try:
                target.team_velocity = int(float(normalized["team_velocity"]))
            except (TypeError, ValueError):
                pass

    # Persist changes and recompute missing_by_method
    context = orchestrator.repository.save(context)
    context = orchestrator.compute_missing_by_method(project_id)
    return context


def try_infer_missing_inputs(
    backend_method: str,
    context,
    missing_fields: List[str],
    inference_service,
) -> Dict[str, Any]:
    """
    Attempt to infer missing inputs for a specific method using the existing
    InferenceService and inferred_fields on the context.
    
    Args:
        backend_method: Backend method identifier
        context: ProjectContext instance
        missing_fields: List of missing field names
        inference_service: InferenceService instance
        
    Returns:
        Dictionary of inferred values
    """
    inferred: Dict[str, Any] = {}

    baseline = context.baseline.model_dump(exclude_none=True)
    description = context.user_description or ""

    # COCOMO: infer size_value (KSLOC) if missing
    if backend_method == "cocomo2" and "size_value" in missing_fields:
        # Prefer existing inferred ksloc if present
        ksloc_data = (context.inferred_fields or {}).get("ksloc")
        if isinstance(ksloc_data, dict):
            k_val = ksloc_data.get("value")
            conf = ksloc_data.get("confidence", 0.5)
            if k_val is not None and conf >= 0.6:
                inferred["size_value"] = k_val
        # If not available or low confidence, call inference service directly
        if "size_value" not in inferred:
            features = []
            if context.expansion_confirmed:
                features = [
                    f.model_dump() if hasattr(f, "model_dump") else f
                    for f in (context.expansion_confirmed.features or [])
                ]
            result = inference_service.infer_ksloc(
                complexity=baseline.get("complexity", "medium"),
                feature_count=len(features),
                tech_stack=baseline.get("tech_stack", ""),
                project_type=baseline.get("project_type", "software development"),
                description=description,
            )
            if result.confidence >= 0.6:
                inferred["size_value"] = result.value

    # FPA: infer UFP if missing
    if backend_method == "fpa" and "ufp" in missing_fields:
        features = []
        if context.expansion_confirmed:
            features = context.expansion_confirmed.features or []
        result = inference_service.infer_function_points(
            project_type=baseline.get("project_type", "software development"),
            feature_count=len(features),
            complexity=baseline.get("complexity", "medium"),
            features_description=description,
        )
        if result.confidence >= 0.6:
            inferred["ufp"] = result.value

    # Story Points, Analogous, Parametric could be extended here as needed.
    return inferred


def build_prompts_for_missing(backend_method: str, missing_fields: List[str]) -> List[Dict[str, Any]]:
    """
    Build human-friendly prompts for missing method-specific inputs.
    
    Args:
        backend_method: Backend method identifier
        missing_fields: List of missing field names
        
    Returns:
        List of prompt dictionaries with field, prompt, and priority
    """
    prompts: List[Dict[str, Any]] = []

    for field_name in missing_fields:
        if backend_method == "cocomo2" and field_name == "size_value":
            prompt = "Estimated KSLOC (thousands of lines of code) for this project."
        elif backend_method == "cocomo2" and field_name == "mode":
            prompt = "COCOMO development mode (organic, semi_detached, or embedded)."
        elif backend_method == "fpa" and field_name == "ufp":
            prompt = "Approximate total unadjusted function points (UFP) for this system."
        elif backend_method == "fpa" and field_name == "vaf":
            prompt = "Value Adjustment Factor (VAF) between 0.65 and 1.35, if known."
        elif backend_method == "analogous" and field_name == "tshirt_size":
            prompt = "Approximate T-shirt size (XS, S, M, L, XL) representing project scale."
        elif backend_method == "story_points" and field_name == "team_velocity":
            prompt = "What is your team's velocity in story points per sprint?"
        else:
            prompt = f"Provide a value for '{field_name}' for the selected estimation method."

        prompts.append(
            {
                "field": field_name,
                "prompt": prompt,
                "priority": "critical",
            }
        )

    return prompts


__all__ = [
    "map_ui_method_to_backend",
    "map_backend_method_to_ui",
    "apply_input_overrides",
    "try_infer_missing_inputs",
    "build_prompts_for_missing",
]

