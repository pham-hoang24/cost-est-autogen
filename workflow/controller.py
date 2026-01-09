from __future__ import annotations

from typing import Any, Dict, List, Optional
from uuid import uuid4
from datetime import datetime

from .inference_service import InferenceService, InferenceResult
from .expansion import ExpansionService
from .parser import ParserService
from .selection import MethodSelector
from .explainer import ExplainerService
from .events import EventLogger
from .repository import ProjectContextRepository
from .report_generator import ReportGeneratorService
from .tracing import trace_agent_call, trace_workflow_step
from .schemas import (
    EventEntry,
    ExpansionV1,
    ProjectContext,
    SelectionPayload,
    CostEstimationReport,
)


class WorkflowOrchestrator:
    """
    Central coordinator for the multi-agent workflow. Handles project context
    lifecycle, state transitions, and service orchestration.
    """

    def __init__(
        self,
        repository: Optional[ProjectContextRepository] = None,
        expansion_service: Optional[ExpansionService] = None,
        parser_service: Optional[ParserService] = None,
        selector: Optional[MethodSelector] = None,
        explainer: Optional[ExplainerService] = None,
        event_logger: Optional[EventLogger] = None,
    ) -> None:
        self.repository = repository or ProjectContextRepository()
        self.expansion_service = expansion_service or ExpansionService(use_llm=False)
        self.parser_service = parser_service or ParserService()
        self.selector = selector or MethodSelector()
        self.explainer = explainer or ExplainerService()
        self.event_logger = event_logger or EventLogger(self.repository)

    # ------------------------------------------------------------------
    # Context lifecycle helpers
    # ------------------------------------------------------------------
    def start_new_project(self, project_id: Optional[str] = None) -> ProjectContext:
        project_id = project_id or str(uuid4())
        context = ProjectContext(project_id=project_id, status="NEW")
        context = self.repository.save(context)
        context = self.event_logger.log(project_id, "PROJECT_STARTED", {"status": context.status})
        return context

    def load_context(self, project_id: str, create_if_missing: bool = False) -> ProjectContext:
        context = self.repository.load(project_id)
        if context is None:
            if not create_if_missing:
                raise ValueError(f"Project context '{project_id}' not found.")
            context = ProjectContext(project_id=project_id)
            context = self.repository.save(context)
        return context

    def record_baseline_field(self, project_id: str, field: str, value: str) -> ProjectContext:
        context = self.load_context(project_id, create_if_missing=True)
        if field == "team_pref":
            try:
                coerced = int(float(value))
            except ValueError as exc:
                raise ValueError("team_pref must be numeric.") from exc
            setattr(context.baseline, field, coerced)
        else:
            setattr(context.baseline, field, value)
        if not self._missing_baseline(context):
            context.status = "BASELINE_COLLECTED"
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "BASELINE_UPDATED",
            {"field": field, "value": value, "status": context.status},
        )
        return context

    def update_baseline_bulk(self, project_id: str, updates: Dict[str, str]) -> ProjectContext:
        """
        Update multiple baseline fields at once.
        
        Args:
            project_id: Project identifier
            updates: Dictionary of field->value pairs
            
        Returns:
            Updated ProjectContext
        """
        context = self.load_context(project_id, create_if_missing=True)
        
        for field, value in updates.items():
            if field == "team_pref":
                try:
                    coerced = int(float(value))
                except ValueError as exc:
                    raise ValueError("team_pref must be numeric.") from exc
                setattr(context.baseline, field, coerced)
            else:
                setattr(context.baseline, field, value)
        
        # Check if all baseline fields are now collected
        if not self._missing_baseline(context):
            context.status = "BASELINE_COLLECTED"
        
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "BASELINE_BULK_UPDATED",
            {"fields": list(updates.keys()), "status": context.status},
        )
        return context

    def submit_description(self, project_id: str, description: str) -> ProjectContext:
        context = self.load_context(project_id, create_if_missing=True)
        context.user_description = description.strip()
        if context.status == "NEW" and not self._missing_baseline(context):
            context.status = "BASELINE_COLLECTED"
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "DESCRIPTION_CAPTURED",
            {"status": context.status},
        )
        return context

    # ------------------------------------------------------------------
    # Expansion workflow
    # ------------------------------------------------------------------
    @trace_agent_call("WorkflowOrchestrator")
    def generate_expansion(self, project_id: str) -> ProjectContext:
        context = self.load_context(project_id)
        if not context.user_description:
            raise ValueError("Cannot generate expansion without a user description.")
        prior = context.baseline.model_dump(exclude_none=True)
        draft = self.expansion_service.generate_draft(context.user_description, prior)
        context.expansion_draft = draft
        context.status = "AWAITING_EXPANSION"
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "EXPANSION_DRAFTED",
            {"summary": draft.summary, "missing_signals": draft.missing_signals},
        )
        return context

    def confirm_expansion(self, project_id: str, approval_text: str = "approve") -> ProjectContext:
        context = self.load_context(project_id)
        if context.expansion_draft is None:
            raise ValueError("No expansion draft available to confirm.")
        context.expansion_confirmed = self._apply_user_edits(context.expansion_draft, approval_text)
        context.status = "EXPANSION_CONFIRMED"
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "EXPANSION_CONFIRMED",
            {"approval_text": approval_text},
        )
        # Auto-trigger normalization and inference
        return self.normalize_and_infer(project_id)

    # ------------------------------------------------------------------
    # Normalization & Inference
    # ------------------------------------------------------------------
    def normalize_and_infer(self, project_id: str) -> ProjectContext:
        context = self.load_context(project_id)
        
        # 1. Normalize Baseline
        baseline = context.baseline.model_dump(exclude_none=True)
        normalized = {}
        coefficients = {}
        
        # Project Type Mapping
        pt_map = {
            "web application": 1.0, "mobile application": 1.1, 
            "system integration": 1.2, "ai/ml project": 1.3,
            "cloud migration": 1.1, "software development": 1.0
        }
        pt = baseline.get("project_type", "").lower()
        normalized["project_type_factor"] = pt_map.get(pt, 1.0)
        
        # Complexity Mapping
        comp_map = {"low": 0.8, "medium": 1.0, "high": 1.25, "very high": 1.5}
        comp = baseline.get("complexity", "").lower()
        normalized["complexity_factor"] = comp_map.get(comp, 1.0)
        
        # Tech Stack (Simple heuristic)
        stack = baseline.get("tech_stack", "").lower()
        if "ai" in stack or "ml" in stack:
            coefficients["tech_complexity"] = 1.2
        elif "enterprise" in stack:
            coefficients["tech_complexity"] = 1.1
        else:
            coefficients["tech_complexity"] = 1.0
            
        context.normalized_inputs = normalized
        context.derived_coefficients = coefficients
        
        # Infer COCOMO Cost Drivers from description
        cost_drivers = {}
        desc_lower = (context.user_description or "").lower()
        
        # Reliability (RELY)
        if "critical" in desc_lower or "medical" in desc_lower or "financial" in desc_lower:
            cost_drivers["rely"] = "very_high"
        elif "high reliability" in desc_lower or "stable" in desc_lower:
            cost_drivers["rely"] = "high"
            
        # Complexity (CPLX)
        if "algorithm" in desc_lower or "complex" in desc_lower or "ai" in desc_lower:
            cost_drivers["cplx"] = "very_high"
        elif "advanced" in desc_lower or "custom" in desc_lower:
            cost_drivers["cplx"] = "high"
            
        # Storage (STOR)
        if "big data" in desc_lower or "large dataset" in desc_lower:
            cost_drivers["stor"] = "very_high"
        elif "database" in desc_lower or "storage" in desc_lower:
            cost_drivers["stor"] = "high"
            
        # Database Size (DATA)
        if "data intensive" in desc_lower or "analytics" in desc_lower:
            cost_drivers["data"] = "high"
            
        # Reusability (RUSE)
        if "library" in desc_lower or "framework" in desc_lower or "reusable" in desc_lower:
            cost_drivers["ruse"] = "high"
            
        # Documentation (DOCU)
        if "documentation" in desc_lower or "compliance" in desc_lower:
            cost_drivers["docu"] = "high"
            
        # Store in context for agents to use
        if not context.inferred_fields:
            context.inferred_fields = {}
        context.inferred_fields["cost_drivers"] = cost_drivers
        
        inference_service = InferenceService()
        
        # Extract features from expansion
        features = []
        if context.expansion_confirmed:
            features = context.expansion_confirmed.features or []
        
        # Run comprehensive inference
        inferred_result: InferenceResult = inference_service.infer_all_parameters(
            baseline=baseline,
            features=[f.model_dump() if hasattr(f, 'model_dump') else f for f in features],
            description=context.user_description or "",
            user_provided={}  # TODO: Check for user overrides in context
        )
        
        # Convert InferenceResult to dict for storage
        context.inferred_fields = inferred_result.model_dump(exclude_none=True)
        
        # Calculate average confidence for logging
        confidences = []
        for field_name in ['ksloc', 'story_points', 'team_velocity', 'unadjusted_fp', 'reuse_profile']:
            field_data = context.inferred_fields.get(field_name)
            if field_data and isinstance(field_data, dict):
                confidences.append(field_data.get('confidence', 0.5))
        
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.5
        
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "INPUTS_NORMALIZED",
            {
                "normalized": normalized,
                "inferred_count": len([k for k in context.inferred_fields.keys() if k not in ['ksloc_range', 'story_points_range']]),
                "avg_confidence": round(avg_confidence, 2),
                "ksloc": context.inferred_fields.get('ksloc', {}).get('value') if context.inferred_fields.get('ksloc') else None
            }
        )
        return context

    # ------------------------------------------------------------------
    # Method selection
    # ------------------------------------------------------------------
    @trace_agent_call("WorkflowOrchestrator")
    def evaluate_methods(self, project_id: str) -> ProjectContext:
        context = self.load_context(project_id)
        # Use confirmed expansion if available, otherwise fall back to draft
        expansion = context.expansion_confirmed or context.expansion_draft
        if expansion is None:
            raise ValueError("Expansion draft must be generated before method selection.")

        prior = context.baseline.model_dump(exclude_none=True)
        parsed = self.parser_service.parse(
            context.user_description, 
            prior, 
            expansion,  # Use confirmed or draft expansion
            inferred_fields=context.inferred_fields
        )
        selection = self.selector.evaluate(parsed)

        context.parsed_context = parsed
        context.selection = selection

        if selection.required_inputs:
            context.status = "INPUTS_REQUESTED"
        else:
            context.status = "METHOD_SELECTED"

        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "METHOD_SELECTED",
            {
                "primary": selection.primary,
                "confidence": selection.confidence_level,
                "required_inputs": selection.required_inputs,
            },
        )
        return context

    def select_method(self, project_id: str, method_id: str) -> ProjectContext:
        """
        Handle user selection of an estimation method.
        """
        context = self.load_context(project_id)
        context.selected_method = method_id
        context.status = "METHOD_SELECTED"
        
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "USER_METHOD_SELECTED",
            {"method_id": method_id}
        )
        return context

    def attach_estimate(
        self,
        project_id: str,
        estimate: Dict[str, Any],
        *,
        mark_complete: bool = True,
    ) -> ProjectContext:
        context = self.load_context(project_id)
        context.estimates.append(estimate)
        if mark_complete:
            context.status = "ESTIMATION_COMPLETE"
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "ESTIMATE_ATTACHED",
            {"count": len(context.estimates)},
        )
        return context

    def report_missing_inputs(
        self,
        project_id: str,
        method: str,
        missing_inputs: List[Dict[str, str]],
    ) -> ProjectContext:
        context = self.load_context(project_id)
        if context.missing_inputs_by_method is None:
            context.missing_inputs_by_method = {}
        context.missing_inputs_by_method[method] = missing_inputs
        if missing_inputs:
            context.status = "INPUTS_REQUESTED"
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "MISSING_INPUTS_REPORTED",
            {"method": method, "missing_inputs_count": len(missing_inputs)},
        )
        return context

    # ------------------------------------------------------------------
    # Explanation
    # ------------------------------------------------------------------
    def generate_explanation(self, project_id: str) -> ProjectContext:
        context = self.load_context(project_id)
        if context.selection is None or context.parsed_context is None:
            raise ValueError("Method selection must be completed before generating explanation.")
        improvement_prompts = context.parsed_context.missing_signals
        summary = self.explainer.build_summary(
            project_id,
            context.parsed_context,
            context.selection,
            improvement_prompts,
            context.estimates,
        )
        context.explanation = summary
        context.status = "EXPLANATION_READY"
        context = self.repository.save(context)
        context = self.event_logger.log(
            project_id,
            "EXPLANATION_READY",
            {"improvement_prompts": improvement_prompts},
        )
        return context

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------
    def log_event(self, project_id: str, event_type: str, data: Optional[Dict] = None) -> ProjectContext:
        return self.event_logger.log(project_id, event_type, data)

    def _missing_baseline(self, context: ProjectContext) -> Dict[str, str]:
        required = ["project_type", "complexity", "tech_stack", "team_pref", "region"]
        missing = {}
        baseline = context.baseline.model_dump()
        for field in required:
            value = baseline.get(field)
            if value in (None, "", 0):
                missing[field] = field
        return missing

    def _apply_user_edits(self, draft: ExpansionV1, approval_text: str) -> ExpansionV1:
        if approval_text.strip().lower() in {"approve", "approved"}:
            return draft
        updated = draft.model_copy(deep=True)
        assumptions = list(updated.assumptions)
        assumptions.append(f"User clarification: {approval_text.strip()}")
        updated.assumptions = assumptions
        return updated

    # ------------------------------------------------------------------
    # Full Report Generation
    # ------------------------------------------------------------------
    @trace_agent_call("WorkflowOrchestrator")
    def generate_full_report(
        self, project_id: str, estimation_config: Dict[str, Any], selected_method: Optional[str] = None
    ) -> CostEstimationReport:
        """
        Generate complete cost estimation report matching frontend schema.
        
        Args:
            project_id: Project identifier
            estimation_config: Configuration dict with currency, accuracy, etc.
            selected_method: Optional method name selected by user to override default
            
        Returns:
            CostEstimationReport with all fields populated
        """
        context = self.load_context(project_id)
        if context is None:
            raise ValueError(f"No project context found for id={project_id!r}")

        # Prefer confirmed expansion, fall back to draft if needed
        expansion = getattr(context, "expansion_confirmed", None) or getattr(
            context, "expansion_draft", None
        )
        if expansion is None:
            raise ValueError(
                "No expansion context available. Make sure the expanded "
                "project summary has been generated (and ideally confirmed) "
                "before generating a full report."
            )

        generator = ReportGeneratorService()

        # Determine methods used
        methods_used: list[str] = []
        
        # If user explicitly selected a method, prioritize it
        if selected_method:
            # Map frontend names to backend names if needed
            method_map = {
                "cocomo": "cocomo2",
                "function-points": "fpa",
                "story-points": "agile_sp",
                "parametric": "parametric",
                "bottom-up": "bottomup",
                "analogous": "analogous",
                "hybrid": "blend",
            }
            backend_method = method_map.get(selected_method, selected_method)
            methods_used.append(backend_method)
            
            # Add backups from context if they are different
            if context.selection and context.selection.backups:
                for backup in context.selection.backups[:2]:
                    if backup != backend_method:
                        methods_used.append(backup)
        # Otherwise use auto-selected methods
        elif context.selection and context.selection.primary:
            methods_used.append(context.selection.primary)
            if context.selection.backups:
                methods_used.extend(context.selection.backups[:2])  # Max 3 methods

        # Generate the full report
        report = generator.generate_report(
            project_id=project_id,
            baseline=context.baseline,
            user_description=context.user_description,
            estimation_config=estimation_config,
            estimates=context.estimates,
            methods_used=methods_used,
            expansion=expansion,  # ✅ use confirmed/draft expansion instead of context.expansion
        )

        # Store in context
        context.full_report = report
        self.repository.save(context)

        # Log event
        self.event_logger.log(
            project_id, "FULL_REPORT_GENERATED", {"methods_count": len(methods_used)}
        )

        return report


    # ------------------------------------------------------------------
    # Step 1 Validation & Method Requirements Tracking
    # ------------------------------------------------------------------
    
    def validate_step1_baseline(
        self,
        project_id: str,
        baseline_data: Dict[str, Any]
    ) -> tuple[bool, List[str], ProjectContext]:
        """
        Validate Step 1 baseline WITHOUT business rules.
        Returns: (is_valid, errors, context)
        """
        from .method_coefficients import MethodCoefficients
        
        context = self.load_context(project_id, create_if_missing=True)
        errors = []
        
        # Required fields check
        required = ["project_type", "complexity", "tech_stack", "team_pref", "region"]
        for field in required:
            if field not in baseline_data or not baseline_data[field]:
                errors.append(f"{field} is required")
        
        if errors:
            return (False, errors, context)
        
        # Store baseline (immutable), handle type conversions
        for field, value in baseline_data.items():
            if field in required or field == "project_duration":
                # Convert tech_stack list to string
                if field == "tech_stack" and isinstance(value, list):
                    value = ", ".join(value)
                # Convert team_pref to int if it's not already
                if field == "team_pref" and isinstance(value, str):
                    # Map common string values to integers
                    team_map = {"vendor": 5, "in_house": 3, "mixed": 4, "small": 2, "large": 10}
                    value = team_map.get(value.lower(), 5)
                self.record_baseline_field(project_id, field, value)
        
        if "description" in baseline_data and baseline_data["description"]:
            self.submit_description(project_id, baseline_data["description"])
        
        context = self.load_context(project_id)
        context.step1_validated = True
        context.validation_timestamp = datetime.utcnow()
        
        if context.method_coeffs is None:
            context.method_coeffs = MethodCoefficients()
        
        context = self.compute_missing_by_method(project_id)
        self.repository.save(context)
        
        return (True, [], context)
    
    def compute_missing_by_method(self, project_id: str) -> ProjectContext:
        """Compute what's missing for each estimation method"""
        from .method_coefficients import MethodCoefficients
        
        context = self.load_context(project_id)
        missing_by_method = {}
        
        if context.method_coeffs is None:
            context.method_coeffs = MethodCoefficients()
        
        # Handle case where method_coeffs is a dict instead of MethodCoefficients
        if isinstance(context.method_coeffs, dict):
            context.method_coeffs = MethodCoefficients(**context.method_coeffs) if context.method_coeffs else MethodCoefficients()
        
        coeffs = context.method_coeffs
        
        # COCOMO II
        cocomo_missing = []
        if not coeffs.cocomo2 or not coeffs.cocomo2.mode:
            cocomo_missing.append("mode")
        if not coeffs.cocomo2 or not coeffs.cocomo2.size_value:
            cocomo_missing.append("size_value")
        if cocomo_missing:
            missing_by_method["cocomo2"] = cocomo_missing
        
        # Analogous
        if not coeffs.analogous or not coeffs.analogous.tshirt_size:
            missing_by_method["analogous"] = ["tshirt_size"]
        
        # FPA
        fpa_missing = []
        if not coeffs.fpa or not coeffs.fpa.ufp:
            fpa_missing.append("ufp")
        if not coeffs.fpa or not coeffs.fpa.vaf:
            fpa_missing.append("vaf")
        if fpa_missing:
            missing_by_method["fpa"] = fpa_missing
        
        # Story Points
        sp_missing = []
        if not coeffs.story_points or not coeffs.story_points.team_velocity:
            sp_missing.append("team_velocity")
        if sp_missing:
            missing_by_method["story_points"] = sp_missing
        
        context.missing_by_method = missing_by_method
        self.repository.save(context)
        return context
    
    def get_method_requirements(
        self, 
        project_id: str, 
        method_name: str
    ) -> Dict[str, Any]:
        """Get known and missing requirements for a method"""
        context = self.load_context(project_id)
        
        # Handle case where method_coeffs is None or dict
        if not context.method_coeffs or isinstance(context.method_coeffs, dict):
            return {
                "known": {},
                "missing": context.missing_by_method.get(method_name, []),
                "baseline": context.baseline.model_dump() if context.baseline else {}
            }
        
        method_map = {
            "cocomo2": context.method_coeffs.cocomo2,
            "analogous": context.method_coeffs.analogous,
            "fpa": context.method_coeffs.fpa,
            "story_points": context.method_coeffs.story_points,
        }
        
        coeffs = method_map.get(method_name)
        
        return {
            "known": coeffs.dict() if coeffs and hasattr(coeffs, 'dict') else {},
            "missing": context.missing_by_method.get(method_name, []),
            "baseline": context.baseline.model_dump() if context.baseline else {}
        }



    def update_fsm_state(self, project_id: str, fsm_state: str, asked_fields: Optional[Dict[str, List[str]]] = None) -> ProjectContext:
        """
        Update the FSM state and optionally the asked_fields memory.
        """
        context = self.load_context(project_id)
        context.fsm_state = fsm_state
        if asked_fields is not None:
            context.asked_fields = asked_fields
        
        context = self.repository.save(context)
        # Log event if needed, but FSM transitions are frequent so maybe keep it quiet or debug level
        return context
