"""
services/estimation_service.py
==============================

Core estimation business logic, extracted from main.py for testability.
Contains context extraction, input validation, and estimation execution.
"""

from typing import Any, Dict, List, Optional

from workflow.controller import WorkflowOrchestrator
from workflow.repository import ProjectContextRepository


class EstimationService:
    """
    Service class for running estimations.
    Encapsulates all estimation logic for better testability.
    """
    
    def __init__(
        self,
        orchestrator: Optional[WorkflowOrchestrator] = None,
        repository: Optional[ProjectContextRepository] = None
    ):
        self.orchestrator = orchestrator or WorkflowOrchestrator()
        self.repository = repository or self.orchestrator.repository
    
    def extract_context_for_agent(self, context, backend_method: str) -> Dict[str, Any]:
        """
        Extract relevant data from ProjectContext for injection into agent prompt.
        This eliminates the need for the agent to call get_project_context_tool.
        
        Args:
            context: ProjectContext instance
            backend_method: Backend method identifier
            
        Returns:
            Dictionary of extracted context data
        """
        extracted = {
            "project_id": context.project_id,
            "project_type": context.baseline.project_type if context.baseline else None,
            "complexity": context.baseline.complexity if context.baseline else None,
            "team_size": context.baseline.team_pref if context.baseline else None,
            "region": context.baseline.region if context.baseline else None,
            "tech_stack": context.baseline.tech_stack if context.baseline else None,
        }
        
        # Extract from parsed_context (ParsedContextV1 schema)
        parsed = context.parsed_context
        if parsed:
            # Size metrics (field is 'size', not 'size_metrics')
            if hasattr(parsed, 'size') and parsed.size:
                extracted["ksloc"] = parsed.size.ksloc
                extracted["function_points"] = parsed.size.ufp  # UFP = unadjusted function points
                extracted["story_points"] = parsed.size.story_points
            
            # Agile metrics (field is 'agile', not 'agile_metrics')
            if hasattr(parsed, 'agile') and parsed.agile:
                extracted["velocity"] = parsed.agile.velocity_sp_per_sprint
                extracted["sprint_days"] = parsed.agile.sprint_days
            
            # Team info
            if hasattr(parsed, 'team') and parsed.team:
                extracted["team_pref_size"] = parsed.team.pref_size
            
            # Platforms
            if hasattr(parsed, 'platforms') and parsed.platforms:
                extracted["platforms"] = parsed.platforms
        
        # Extract from method_coeffs if available
        # Handle both MethodCoefficients model and plain dict
        if context.method_coeffs:
            coeffs = context.method_coeffs
            
            # Check if coeffs is a dict or a Pydantic model
            if isinstance(coeffs, dict):
                # Handle dict format
                if backend_method == "cocomo2" and "cocomo2" in coeffs:
                    cocomo_data = coeffs.get("cocomo2", {})
                    if isinstance(cocomo_data, dict):
                        extracted["cocomo_ksloc"] = cocomo_data.get("ksloc")
                        extracted["cocomo_scale_factors"] = cocomo_data.get("scale_factors")
                        extracted["cocomo_cost_drivers"] = cocomo_data.get("cost_drivers")
                elif backend_method == "fpa" and "fpa" in coeffs:
                    fpa_data = coeffs.get("fpa", {})
                    if isinstance(fpa_data, dict):
                        extracted["fpa_ufp"] = fpa_data.get("unadjusted_fp")
                        extracted["fpa_gsc"] = fpa_data.get("gsc_ratings")
                elif backend_method == "story_points" and "agile_sp" in coeffs:
                    sp_data = coeffs.get("agile_sp", {})
                    if isinstance(sp_data, dict):
                        extracted["sp_total"] = sp_data.get("total_story_points")
                        extracted["sp_velocity"] = sp_data.get("velocity")
                        extracted["sp_sprint_weeks"] = sp_data.get("sprint_length_weeks")
            else:
                # Handle Pydantic model format
                if backend_method == "cocomo2" and hasattr(coeffs, 'cocomo2') and coeffs.cocomo2:
                    extracted["cocomo_ksloc"] = coeffs.cocomo2.ksloc
                    extracted["cocomo_scale_factors"] = coeffs.cocomo2.scale_factors
                    extracted["cocomo_cost_drivers"] = coeffs.cocomo2.cost_drivers
                elif backend_method == "fpa" and hasattr(coeffs, 'fpa') and coeffs.fpa:
                    extracted["fpa_ufp"] = coeffs.fpa.unadjusted_fp
                    extracted["fpa_gsc"] = coeffs.fpa.gsc_ratings
                elif backend_method == "story_points" and hasattr(coeffs, 'agile_sp') and coeffs.agile_sp:
                    extracted["sp_total"] = coeffs.agile_sp.total_story_points
                    extracted["sp_velocity"] = coeffs.agile_sp.velocity
                    extracted["sp_sprint_weeks"] = coeffs.agile_sp.sprint_length_weeks
        
        # Extract from expansion
        expansion = context.expansion_confirmed or context.expansion_draft
        if expansion:
            extracted["features_list"] = [f.name for f in expansion.features] if expansion.features else []
            extracted["platforms"] = expansion.platforms
        
        # Map complexity to numeric factor
        complexity_map = {"low": 0.8, "medium": 1.0, "high": 1.2, "very high": 1.5, "very_high": 1.5}
        complexity_str = (extracted.get("complexity") or "medium").lower()
        extracted["complexity_factor"] = complexity_map.get(complexity_str, 1.0)
        
        return extracted
    
    def check_required_inputs(self, backend_method: str, context_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Check if all required inputs for a method are available.
        
        Args:
            backend_method: Backend method identifier
            context_data: Extracted context data dictionary
            
        Returns:
            List of missing inputs with prompts
        """
        missing = []
        
        # Helper to check if value exists and is not None/0
        def is_missing(key):
            val = context_data.get(key)
            return val is None or val == 0 or val == ""
        
        if backend_method == "cocomo2":
            # KSLOC is critical - check multiple sources
            ksloc = context_data.get("cocomo_ksloc") or context_data.get("ksloc")
            if not ksloc or ksloc == 0:
                # Try to infer from LOC
                loc = context_data.get("loc")
                if loc and loc > 0:
                    context_data["ksloc"] = loc / 1000  # Auto-convert
                else:
                    missing.append({
                        "field": "ksloc",
                        "prompt": "Estimated size in thousands of lines of code (KSLOC). For reference: small project ~5-10 KSLOC, medium ~20-50 KSLOC, large ~100+ KSLOC.",
                        "priority": "critical"
                    })
        
        elif backend_method == "fpa":
            ufp = context_data.get("fpa_ufp") or context_data.get("function_points")
            if not ufp or ufp == 0:
                missing.append({
                    "field": "unadjusted_function_points",
                    "prompt": "Unadjusted Function Points (UFP). Estimate based on: External Inputs, External Outputs, External Inquiries, Internal Logical Files, External Interface Files.",
                    "priority": "critical"
                })
        
        elif backend_method == "story_points":
            sp = context_data.get("sp_total") or context_data.get("story_points")
            velocity = context_data.get("sp_velocity") or context_data.get("velocity")
            
            if not sp or sp == 0:
                missing.append({
                    "field": "total_story_points",
                    "prompt": "Total estimated story points for the project. Typical range: 50-500 for medium projects.",
                    "priority": "critical"
                })
            if not velocity or velocity == 0:
                missing.append({
                    "field": "velocity",
                    "prompt": "Team velocity in story points per sprint. Typical range: 15-40 for a team of 5-8.",
                    "priority": "critical"
                })
        
        elif backend_method == "analogous":
            # Analogous can work with baseline data, but historical projects help
            # For now, we'll allow it to proceed with defaults
            pass
        
        elif backend_method == "parametric":
            # Parametric needs size metric
            if is_missing("ksloc") and is_missing("function_points") and is_missing("story_points"):
                missing.append({
                    "field": "size_metric",
                    "prompt": "A size metric is required: KSLOC, Function Points, or Story Points.",
                    "priority": "critical"
                })
        
        elif backend_method == "bottomup":
            # Bottom-up can work with features list
            features = context_data.get("features_list") or []
            if len(features) == 0:
                missing.append({
                    "field": "work_packages",
                    "prompt": "List of work packages or features with effort estimates. Provide as comma-separated list.",
                    "priority": "high"
                })
        
        return missing
    
    async def run_estimation(
        self,
        session_id: str,
        backend_method: str,
        injected_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run the estimation using deterministic tool calls (no LLM agent needed).
        
        Since we've already validated inputs, we can directly call the estimation tools
        without spawning an LLM agent. This is faster and more reliable.
        
        Args:
            session_id: Session identifier
            backend_method: Backend method identifier
            injected_context: Pre-extracted context data
            
        Returns:
            Dictionary with status, estimate, and summary
        """
        try:
            # Import estimation tools
            from tools.cocomo_tools import generate_cocomo_ii_estimation
            from tools.fpa_tools import generate_fpa_estimation
            from tools.storypoints_tools import generate_storypoints_estimation
            from tools.analogous_tools import generate_analogous_estimation
            from tools.parametric_tools import generate_parametric_estimation
            from tools.bottomup_tools import generate_bottom_up_estimation
            
            estimate = None
            summary = ""
            
            # Get common parameters
            project_name = f"Project {session_id[:8]}"
            complexity_factor = injected_context.get("complexity_factor", 1.0)
            team_size = injected_context.get("team_size") or injected_context.get("team_pref_size") or 5
            
            if backend_method == "cocomo2":
                ksloc = (
                    injected_context.get("cocomo_ksloc") or 
                    injected_context.get("ksloc") or 
                    (injected_context.get("loc", 0) / 1000 if injected_context.get("loc") else 10)
                )
                
                # Get scale factors and cost drivers from context or use defaults
                scale_factors = injected_context.get("cocomo_scale_factors") or {
                    "prec": "nominal", "flex": "nominal", "resl": "nominal", 
                    "team": "nominal", "pmat": "nominal"
                }
                cost_drivers = injected_context.get("cocomo_cost_drivers") or {
                    "rely": "nominal", "data": "nominal", "cplx": "nominal"
                }
                
                # Adjust cost drivers based on complexity
                if complexity_factor > 1.1:
                    cost_drivers["cplx"] = "high"
                elif complexity_factor > 1.3:
                    cost_drivers["cplx"] = "very_high"
                
                estimate = generate_cocomo_ii_estimation(
                    project_name=project_name,
                    ksloc=float(ksloc),
                    scale_factor_ratings=scale_factors,
                    cost_driver_ratings=cost_drivers,
                    hourly_rate=100.0
                )
                summary = f"COCOMO II estimation based on {ksloc:.1f} KSLOC"
                
            elif backend_method == "fpa":
                ufp = (
                    injected_context.get("fpa_ufp") or 
                    injected_context.get("function_points") or 
                    100  # Default
                )
                
                estimate = generate_fpa_estimation(
                    project_name=project_name,
                    unadjusted_fp=int(ufp),
                    vaf=1.0 + (complexity_factor - 1.0) * 0.35,  # Map complexity to VAF
                    hourly_rate=100.0
                )
                summary = f"FPA estimation based on {ufp} unadjusted function points"
                
            elif backend_method == "story_points":
                total_sp = (
                    injected_context.get("sp_total") or 
                    injected_context.get("story_points") or 
                    100  # Default
                )
                velocity = (
                    injected_context.get("sp_velocity") or 
                    injected_context.get("velocity") or 
                    25  # Default
                )
                sprint_weeks = injected_context.get("sp_sprint_weeks") or 2
                
                estimate = generate_storypoints_estimation(
                    project_name=project_name,
                    total_story_points=int(total_sp),
                    velocity=int(velocity),
                    sprint_length_weeks=int(sprint_weeks),
                    hourly_rate=100.0
                )
                summary = f"Story Points estimation: {total_sp} SP at velocity {velocity}/sprint"
                
            elif backend_method == "analogous":
                # Use complexity and project type to generate reference projects
                base_cost = 100000 * complexity_factor
                base_duration = 6 * complexity_factor
                
                estimate = generate_analogous_estimation(
                    project_name=project_name,
                    reference_projects=[
                        {"name": "Similar Project A", "cost": base_cost * 0.9, "duration_months": base_duration * 0.9, "similarity": 0.85},
                        {"name": "Similar Project B", "cost": base_cost * 1.1, "duration_months": base_duration * 1.1, "similarity": 0.75},
                    ],
                    target_complexity=complexity_factor,
                    hourly_rate=100.0
                )
                summary = f"Analogous estimation based on similar projects"
                
            elif backend_method == "parametric":
                # Use available size metric
                size = (
                    injected_context.get("ksloc") or 
                    injected_context.get("function_points", 0) / 10 or  # Rough FP to KSLOC
                    injected_context.get("story_points", 0) / 5 or  # Rough SP to KSLOC
                    10
                )
                
                estimate = generate_parametric_estimation(
                    project_name=project_name,
                    size_metric=float(size),
                    size_type="ksloc",
                    complexity_factor=complexity_factor,
                    team_size=int(team_size),
                    hourly_rate=100.0
                )
                summary = f"Parametric estimation based on size metric"
                
            elif backend_method == "bottomup":
                # Generate work packages from features or defaults
                features = injected_context.get("features_list") or ["Core Functionality"]
                work_packages = []
                
                base_hours = 160 * complexity_factor  # Base hours per feature
                for i, feature in enumerate(features[:10]):  # Max 10 features
                    work_packages.append({
                        "name": feature if isinstance(feature, str) else f"Feature {i+1}",
                        "effort_hours": base_hours * (1 + i * 0.1),  # Slight variation
                        "hourly_rate": 100.0
                    })
                
                # Add standard phases if few features
                if len(work_packages) < 3:
                    work_packages = [
                        {"name": "Requirements & Design", "effort_hours": 200 * complexity_factor, "hourly_rate": 100.0},
                        {"name": "Development", "effort_hours": 600 * complexity_factor, "hourly_rate": 100.0},
                        {"name": "Testing & QA", "effort_hours": 200 * complexity_factor, "hourly_rate": 100.0},
                        {"name": "Deployment & Documentation", "effort_hours": 100 * complexity_factor, "hourly_rate": 100.0},
                    ]
                
                estimate = generate_bottom_up_estimation(
                    project_name=project_name,
                    work_packages=work_packages
                )
                summary = f"Bottom-up estimation with {len(work_packages)} work packages"
            
            if estimate:
                # Convert to dict if it's a Pydantic model
                if hasattr(estimate, "model_dump"):
                    estimate_dict = estimate.model_dump()
                elif hasattr(estimate, "dict"):
                    estimate_dict = estimate.dict()
                else:
                    estimate_dict = estimate
                
                return {
                    "status": "success",
                    "estimate": estimate_dict,
                    "summary": summary
                }
            else:
                return {
                    "status": "error",
                    "error": f"No estimation generated for method {backend_method}"
                }
                
        except Exception as e:
            print(f"[EstimationService.run_estimation] Error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "status": "error",
                "error": str(e)
            }
    
    def run_estimation_for_method(
        self,
        backend_method: str,
        context,
        requirements: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Execute a specific estimator deterministically for the chosen method.
        Currently supports COCOMO II; other methods can be added over time.
        
        Args:
            backend_method: Backend method identifier
            context: ProjectContext instance
            requirements: Requirements dictionary with known inputs
            
        Returns:
            Estimation result dictionary
        """
        from fastapi import HTTPException
        
        if backend_method == "cocomo2":
            from tools.cocomo_tools import generate_cocomo_ii_estimation

            known = requirements.get("known") or {}
            size_value = known.get("size_value")
            if size_value is None:
                raise HTTPException(status_code=400, detail="Missing size_value (KSLOC) for COCOMO II estimation.")

            inferred_fields = getattr(context, "inferred_fields", {}) or {}
            cost_drivers = inferred_fields.get("cost_drivers") or {}

            output = generate_cocomo_ii_estimation(
                project_name=context.baseline.project_type or "Software project",
                ksloc=float(size_value),
                cost_driver_ratings=cost_drivers,
            )
            est = output.model_dump()
            # Provide flattened helpers for downstream report aggregation
            est.setdefault("cost", output.cost_range.likely)
            est.setdefault("duration", output.duration_range.likely)
            return est

        # For now, other methods are not yet wired into automatic back-end execution.
        raise HTTPException(
            status_code=400,
            detail=f"Automatic estimation for method '{backend_method}' is not yet supported on the backend.",
        )


__all__ = ["EstimationService"]

