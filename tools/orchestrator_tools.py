

from typing import Any, Dict, List, Optional, Union

from workflow import ProjectContext, WorkflowOrchestrator

_ORCHESTRATOR = WorkflowOrchestrator()
_BASELINE_FIELDS = ["project_type", "complexity", "tech_stack", "team_pref", "region"]


def start_new_project_tool(project_id: Optional[str] = None) -> Dict[str, object]:
    context = _ORCHESTRATOR.start_new_project(project_id=project_id)
    return _serialize_context(context)


def record_baseline_field_tool(project_id: str, field: str, value: str) -> Dict[str, object]:
    if field not in _BASELINE_FIELDS:
        raise ValueError(f"Unsupported baseline field '{field}'. Expected one of {_BASELINE_FIELDS}.")
    context = _ORCHESTRATOR.record_baseline_field(project_id, field, value)
    return _serialize_context(context)


def update_project_baseline_tool(project_id: str, updates: Dict[str, str]) -> Dict[str, object]:
    """
    Bulk update multiple baseline fields at once.
    
    Args:
        project_id: Project identifier
        updates: Dictionary of field->value pairs (e.g., {"complexity": "High", "region": "Europe"})
        
    Returns:
        Serialized project context
    """
    # Validate all fields before updating
    for field in updates.keys():
        if field not in _BASELINE_FIELDS:
            raise ValueError(f"Unsupported baseline field '{field}'. Expected one of {_BASELINE_FIELDS}.")
    
    context = _ORCHESTRATOR.update_baseline_bulk(project_id, updates)
    return _serialize_context(context)


def submit_user_description_tool(project_id: str, description: str) -> Dict[str, object]:
    context = _ORCHESTRATOR.submit_description(project_id, description)
    return _serialize_context(context)

def append_user_message_tool(project_id: str, message: str, role: str = "user") -> Dict[str, object]:
    context = _ORCHESTRATOR.append_user_message(project_id, message, role=role)
    return _serialize_context(context)


def append_llm_extraction_tool(project_id: str, extraction: Dict[str, Any]) -> Dict[str, object]:
    context = _ORCHESTRATOR.append_llm_extraction(project_id, extraction)
    return _serialize_context(context)


def draft_expansion_tool(project_id: str) -> Dict[str, object]:
    context = _ORCHESTRATOR.generate_expansion(project_id)
    return _serialize_context(context)


def confirm_expansion_tool(project_id: str, approval_text: str = "approve") -> Dict[str, object]:
    context = _ORCHESTRATOR.confirm_expansion(project_id, approval_text)
    return _serialize_context(context)


def evaluate_methods_tool(project_id: str) -> Dict[str, object]:
    context = _ORCHESTRATOR.evaluate_methods(project_id)
    return _serialize_context(context)


def select_method_tool(project_id: str, method_id: str) -> Dict[str, object]:
    context = _ORCHESTRATOR.select_method(project_id, method_id)
    return _serialize_context(context)


def normalize_and_infer_tool(project_id: str) -> Dict[str, object]:
    context = _ORCHESTRATOR.normalize_and_infer(project_id)
    return _serialize_context(context)

def update_method_coeffs_tool(project_id: str, method_name: str, updates: Dict[str, Any]) -> Dict[str, object]:
    context = _ORCHESTRATOR.update_method_coeffs(project_id, method_name, updates)
    return _serialize_context(context)


def generate_explanation_tool(project_id: str) -> Dict[str, object]:
    context = _ORCHESTRATOR.generate_explanation(project_id)
    return _serialize_context(context)


def get_project_context_tool(project_id: str) -> Dict[str, object]:
    context = _ORCHESTRATOR.load_context(project_id, create_if_missing=True)
    return _serialize_context(context)


def register_estimate_tool(project_id: str, estimate: Dict[str, Any], mark_complete: bool = True) -> Dict[str, object]:
    context = _ORCHESTRATOR.attach_estimate(project_id, estimate, mark_complete=mark_complete)
    return _serialize_context(context)


def report_missing_inputs_tool(project_id: str, method: str, missing_inputs: List[Dict[str, str]]) -> Dict[str, object]:
    context = _ORCHESTRATOR.report_missing_inputs(project_id, method, missing_inputs)
    return _serialize_context(context)


def _serialize_context(context: ProjectContext) -> Dict[str, object]:
    payload: Dict[str, object] = {
        "project_id": context.project_id,
        "status": context.status,
        "version": context.version,
        "baseline": context.baseline.model_dump(exclude_none=True),
        "user_description": context.user_description,
        "chat_log": context.chat_log,
        "llm_extractions": context.llm_extractions,
        "inferred_fields": context.inferred_fields,
        "fsm_state": getattr(context, "fsm_state", "INTAKE"),
        "asked_fields": getattr(context, "asked_fields", {}),
        "missing_baseline": _missing_baseline(context),
        "events": [event.model_dump() for event in context.events],
    }
    if context.expansion_draft:
        payload["expansion_draft"] = context.expansion_draft.model_dump()
    if context.expansion_confirmed:
        payload["expansion_confirmed"] = context.expansion_confirmed.model_dump()
    if context.parsed_context:
        payload["parsed_context"] = context.parsed_context.model_dump()
    if context.selection:
        payload["selection"] = context.selection.model_dump()
    if context.estimates:
        payload["estimates"] = context.estimates
    if context.explanation:
        payload["explanation"] = context.explanation
    if context.missing_inputs_by_method:
        payload["missing_inputs_by_method"] = context.missing_inputs_by_method
    if getattr(context, "full_report", None):
        payload["full_report"] = context.full_report.model_dump() if hasattr(context.full_report, "model_dump") else context.full_report
    return payload


def _missing_baseline(context: ProjectContext) -> Dict[str, str]:
    prompts = {
        "project_type": "Select project type (software development, ai/ml project, system integration, cloud migration, mobile application, web application).",
        "complexity": "Specify complexity (low, medium, high, very high).",
        "tech_stack": "Describe the technology focus (web technologies, mobile development, ai/ml technologies, cloud technology, enterprise systems).",
        "team_pref": "Provide desired team size (numeric).",
        "region": "Provide the primary delivery region (e.g., North America, EMEA).",
    }
    missing: Dict[str, str] = {}
    baseline = context.baseline.model_dump()
    for field in _BASELINE_FIELDS:
        value = baseline.get(field)
        if value in (None, "", 0):
            missing[field] = prompts[field]
    return missing


def generate_full_report_tool(
    project_id: str, 
    estimation_config: Dict[str, Any],
    selected_method: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate complete cost estimation report matching frontend expectations.
    
    Args:
        project_id: Project identifier
        estimation_config: Dictionary with keys like 'currency', 'accuracy', 'includeRisk', etc.
        selected_method: Optional method name to override default selection
        
    Returns:
        Dictionary representation of the full CostEstimationReport
    """
    orchestrator = WorkflowOrchestrator()
    report = orchestrator.generate_full_report(project_id, estimation_config, selected_method)
    return report.model_dump()


def validate_step1_tool(project_id: str, baseline_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate Step 1 baseline data without business rules.
    
    Args:
        project_id: Project/session identifier
        baseline_data: Dict with project_type, complexity, tech_stack, team_pref, region
        
    Returns:
        {
            "is_valid": bool,
            "errors": List[str],
            "missing_by_method": Dict[str, List[str]],
            "context": Dict
        }
    """
    is_valid, errors, context = _ORCHESTRATOR.validate_step1_baseline(
        project_id,
        baseline_data
    )
    
    return {
        "is_valid": is_valid,
        "errors": errors,
        "missing_by_method": context.missing_by_method,
        "context": _serialize_context(context)
    }


def get_method_requirements_tool(project_id: str, method_name: str) -> Dict[str, Any]:
    """
    Get known and missing requirements for a specific estimation method.
    
    Args:
        project_id: Project/session identifier
        method_name: Method name (cocomo2, analogous, fpa, story_points)
        
    Returns:
        {
            "known": Dict,  # Current method coefficients
            "missing": List[str],  # Missing field paths
            "baseline": Dict  # Baseline data for context
        }
    """
    return _ORCHESTRATOR.get_method_requirements(project_id, method_name)

def update_fsm_state_tool(project_id: str, fsm_state: str, asked_fields: Optional[Dict[str, List[str]]] = None) -> Dict[str, object]:
    context = _ORCHESTRATOR.update_fsm_state(project_id, fsm_state, asked_fields)
    return _serialize_context(context)
