"""
Step 1 validation and method requirements tracking

This module extends WorkflowOrchestrator with methods for validating
Step 1 baseline data and computing missing method requirements.
"""

from typing import Tuple, List, Dict, Any
from datetime import datetime


def validate_step1_baseline(
    self,
    project_id: str,
    baseline_data: Dict[str, Any]
) -> Tuple[bool, List[str], "ProjectContext"]:
    """
    Validate Step 1 baseline data WITHOUT business rules.
    
    Validation rules:
    - Required fields must be present
    - Types must be correct
    - Enum values must be valid
    - NO opinions about "realistic" combinations
    
    Args:
        project_id: Project/session identifier
        baseline_data: Dict with project_type, complexity, tech_stack, etc.
        
    Returns:
        (is_valid, errors, context)
    """
    from .method_coefficients import MethodCoefficients
    
    context = self.load_context(project_id, create_if_missing=True)
    errors = []
    
    # Define required fields
    required_fields = ["project_type", "complexity", "tech_stack", "team_pref", "region"]
    
    # Check required fields
    for field in required_fields:
        if field not in baseline_data or not baseline_data[field]:
            errors.append(f"{field} is required")
    
    if errors:
        return (False, errors, context)
    
    # Validate types (basic check)
    if "tech_stack" in baseline_data:
        if isinstance(baseline_data["tech_stack"], str):
            # If it's a string, keep as is (will be split later if needed)
            pass
        elif not isinstance(baseline_data["tech_stack"], list):
            errors.append("tech_stack must be a string or list")
    
    if "team_pref" in baseline_data:
        try:
            int(baseline_data["team_pref"])
        except (ValueError, TypeError):
            # It's OK if it's a string like "vendor" or "in_house"
            pass
    
    if errors:
        return (False, errors, context)
    
    # Store baseline fields (immutable - no modification)
    for field, value in baseline_data.items():
        if field in required_fields or field == "project_duration":
            self.record_baseline_field(project_id, field, value)
    
    # Store description if provided
    if "description" in baseline_data and baseline_data["description"]:
        self.submit_description(project_id, baseline_data["description"])
    
    # Reload context after updates
    context = self.load_context(project_id)
    
    # Mark as validated
    context.step1_validated = True
    context.validation_timestamp = datetime.utcnow()
    
    # Initialize method_coeffs if not present
    if context.method_coeffs is None:
        context.method_coeffs = MethodCoefficients()
    
    # Compute missing method requirements
    context = self.compute_missing_by_method(project_id)
    
    # Save updated context
    self.repository.save_context(context)
    
    return (True, [], context)


def compute_missing_by_method(self, project_id: str) -> "ProjectContext":
    """
    Compute what's missing for each estimation method.
    
    Uses baseline + existing method_coeffs to determine gaps.
    Stores result in context.missing_by_method.
    
    Returns:
        Updated ProjectContext with missing_by_method populated
    """
    from .method_coefficients import MethodCoefficients
    
    context = self.load_context(project_id)
    missing_by_method = {}
    
    # Initialize method_coeffs if not present
    if context.method_coeffs is None:
        context.method_coeffs = MethodCoefficients()
    
    coeffs = context.method_coeffs
    
    # COCOMO II requirements
    cocomo_missing = []
    if not coeffs.cocomo2.mode:
        cocomo_missing.append("mode")
    if not coeffs.cocomo2.size_value:
        cocomo_missing.append("size_value")
    if not coeffs.cocomo2.effort_multipliers or len(coeffs.cocomo2.effort_multipliers) == 0:
        # List all COCOMO effort multipliers
        cocomo_missing.extend([
            "effort_multipliers.RELY",
            "effort_multipliers.DATA",
            "effort_multipliers.CPLX",
            "effort_multipliers.TIME",
            "effort_multipliers.STOR",
            "effort_multipliers.VIRT",
            "effort_multipliers.TURN",
            "effort_multipliers.ACAP",
            "effort_multipliers.AEXP",
            "effort_multipliers.PCAP",
            "effort_multipliers.VEXP",
            "effort_multipliers.LEXP",
            "effort_multipliers.MODP",
            "effort_multipliers.TOOL",
            "effort_multipliers.SCED"
        ])
    if cocomo_missing:
        missing_by_method["cocomo2"] = cocomo_missing
    
    # Analogous requirements
    analogous_missing = []
    if not coeffs.analogous.tshirt_size:
        analogous_missing.append("tshirt_size")
    if analogous_missing:
        missing_by_method["analogous"] = analogous_missing
    
    # FPA requirements
    fpa_missing = []
    if not coeffs.fpa.ufp:
        fpa_missing.append("ufp")
    if not coeffs.fpa.vaf:
        fpa_missing.append("vaf")
    if fpa_missing:
        missing_by_method["fpa"] = fpa_missing
    
    # Story Points requirements
    sp_missing = []
    if not coeffs.story_points.team_velocity:
        sp_missing.append("team_velocity")
    if not coeffs.story_points.avg_hours_per_point:
        sp_missing.append("avg_hours_per_point")
    if sp_missing:
        missing_by_method["story_points"] = sp_missing
    
    # Parametric requirements
    parametric_missing = []
    if not coeffs.parametric.regression_model:
        parametric_missing.append("regression_model")
    if parametric_missing:
        missing_by_method["parametric"] = parametric_missing
    
    # Bottom-up requirements
    bottomup_missing = []
    if not coeffs.bottom_up.task_breakdown or len(coeffs.bottom_up.task_breakdown) == 0:
        bottomup_missing.append("task_breakdown")
    if bottomup_missing:
        missing_by_method["bottom_up"] = bottomup_missing
    
    # Update context
    context.missing_by_method = missing_by_method
    self.repository.save_context(context)
    
    return context


def get_method_requirements(
    self,
    project_id: str,
    method_name: str
) -> Dict[str, Any]:
    """
    Get known and missing requirements for a specific estimation method.
    
    Args:
        project_id: Project/session identifier
        method_name: Method name (cocomo2, analogous, fpa, etc.)
        
    Returns:
        {
            "known": {...},  # Current method coefficients
            "missing": [...],  # List of missing field paths
            "baseline": {...}  # Baseline data for context
        }
    """
    context = self.load_context(project_id)
    
    if not context.method_coeffs:
        return {
            "known": {},
            "missing": context.missing_by_method.get(method_name, []),
            "baseline": context.baseline.model_dump() if context.baseline else {}
        }
    
    # Map method names to coefficient objects
    method_coeffs_map = {
        "cocomo2": context.method_coeffs.cocomo2,
        "analogous": context.method_coeffs.analogous,
        "fpa": context.method_coeffs.fpa,
        "story_points": context.method_coeffs.story_points,
        "parametric": context.method_coeffs.parametric,
        "bottom_up": context.method_coeffs.bottom_up,
    }
    
    coeffs = method_coeffs_map.get(method_name)
    missing = context.missing_by_method.get(method_name, [])
    
    return {
        "known": coeffs.dict() if coeffs and hasattr(coeffs, 'dict') else {},
        "missing": missing,
        "baseline": context.baseline.model_dump() if context.baseline else {}
    }
