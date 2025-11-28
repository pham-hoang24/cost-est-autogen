"""
workflow/inference_service.py
==============================

Service for inferring estimation method parameters from baseline project data.

This service automatically estimates technical metrics (KSLOC, Function Points,
Story Points, Team Velocity, Reuse Profiles) that most stakeholders don't have
during initial project planning. All inferred values include confidence scores.

Design Principles:
- Feature-driven: Metrics scale with feature count, not time/team size
- Domain-specific: Different formulas for different project types  
- User inputs win: Explicit values always override inferred ones
- Confidence-aware: Quality of inputs determines confidence (0.3-0.9)
- Transparent: Inferred values are clearly marked and overridable
"""

from __future__ import annotations
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import re

from workflow.inference_config import (
    FPInferenceConfig,
    BASE_KSLOC_PER_FEATURE,
    TECH_STACK_MULTIPLIERS,
    DOMAIN_MULTIPLIERS,
    FP_CONFIGS,
    STORY_POINTS_PER_FEATURE,
    FEATURE_SIZE_ADJUSTMENTS,
    BASE_VELOCITY_PER_DEV,
    TEAM_MATURITY_FACTORS,
    SPRINT_LENGTH_MULTIPLIERS,
    get_team_efficiency,
    BASE_REUSE_PROFILES,
    ORG_MATURITY_ADJUSTMENTS,
    CONFIDENCE_WEIGHTS,
    MIN_CONFIDENCE,
    MAX_CONFIDENCE,
    FEATURE_COUNT_THRESHOLDS,
    DESCRIPTION_LENGTH_THRESHOLDS,
    map_project_type_to_configs,
    infer_domain_from_description,
)


# ============================================================================
# DATA MODELS
# ============================================================================

class InferredField(BaseModel):
    """Single inferred parameter with confidence tracking."""
    value: float | Dict[str, float]
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score 0-1")
    source: str = Field(description="What drove this inference")
    overridden_by_user: bool = Field(default=False, description="True if user provided this value")
    
    class Config:
        frozen = False  # Allow modifications


class InferenceResult(BaseModel):
    """All inferred parameters for a project."""
    ksloc: Optional[InferredField] = None
    story_points: Optional[InferredField] = None
    team_velocity: Optional[InferredField] = None
    unadjusted_fp: Optional[InferredField] = None
    reuse_profile: Optional[InferredField] = None  # value is Dict
    
    # Optional: ranges for uncertainty quantification
    ksloc_range: Optional[tuple[float, float]] = None
    story_points_range: Optional[tuple[float, float]] = None
    
    class Config:
        frozen = False


# ============================================================================
# INFERENCE SERVICE
# ============================================================================

class InferenceService:
    """Service for inferring estimation parameters from baseline data."""
    
    def __init__(self):
        """Initialize the inference service."""
        pass
    
    # ------------------------------------------------------------------------
    # KSLOC INFERENCE
    # ------------------------------------------------------------------------
    
    def infer_ksloc(
        self,
        complexity: str,
        feature_count: int,
        tech_stack: str,
        project_type: str,
        description: str = ""
    ) -> InferredField:
        """
        Infer KSLOC (thousands of lines of code) from features and complexity.
        
        Formula:
            ksloc = base_per_feature[complexity] 
                    × feature_count 
                    × tech_multiplier 
                    × domain_multiplier
        
        Args:
            complexity: Project complexity (low, medium, high, very high)
            feature_count: Number of features in the project
            tech_stack: Primary technology stack
            project_type: Type of project (web, mobile, ai/ml, etc.)
            description: Project description for domain inference
            
        Returns:
            InferredField with KSLOC estimate and confidence
        """
        complexity_lower = complexity.lower().strip()
        
        # Get base KSLOC per feature
        base_per_feature = BASE_KSLOC_PER_FEATURE.get(complexity_lower, 1.0)
        
        # Get tech stack multiplier
        tech_mult = self._get_tech_multiplier(tech_stack)
        
        # Get domain multiplier
        domain, _ = map_project_type_to_configs(project_type)
        if description:
            # Refine domain from description
            inferred_domain = infer_domain_from_description(description)
            if inferred_domain != "default":
                domain = inferred_domain
        
        domain_mult = DOMAIN_MULTIPLIERS.get(domain, 1.0)
        
        # Calculate KSLOC
        if feature_count == 0:
            # Fallback: use complexity-based estimate
            feature_count = 5 * (1 + BASE_KSLOC_PER_FEATURE.get(complexity_lower, 1.0))
        
        ksloc = base_per_feature * feature_count * tech_mult * domain_mult
        
        # Calculate confidence
        confidence = self._calculate_ksloc_confidence(
            feature_count=feature_count,
            description=description,
            complexity=complexity_lower
        )
        
        # Build source description
        sources = [f"complexity={complexity}"]
        if feature_count > 0:
            sources.append(f"features={feature_count}")
        if tech_mult != 1.0:
            sources.append(f"tech={tech_stack[:10]}")
        if domain_mult != 1.0:
            sources.append(f"domain={domain}")
        source = "+".join(sources)
        
        return InferredField(
            value=round(ksloc, 1),
            confidence=round(confidence, 2),
            source=source,
            overridden_by_user=False
        )
    
    def _get_tech_multiplier(self, tech_stack: str) -> float:
        """Extract tech multiplier from tech stack string."""
        tech_lower = tech_stack.lower()
        
        # Check for each tech keyword
        for tech_key, multiplier in TECH_STACK_MULTIPLIERS.items():
            if tech_key in tech_lower:
                return multiplier
        
        return 1.0
    
    def _calculate_ksloc_confidence(
        self,
        feature_count: int,
        description: str,
        complexity: str
    ) -> float:
        """Calculate confidence for KSLOC inference."""
        # Feature count factor
        if feature_count == 0:
            feature_factor = 0.3  # Low confidence with no features
        elif feature_count < 3:
            feature_factor = 0.5
        elif feature_count < 8:
            feature_factor = 0.7
        elif feature_count < 20:
            feature_factor = 0.8
        else:
            feature_factor = 0.9
        
        # Description quality factor
        desc_length = len(description)
        if desc_length < 50:
            desc_factor = 0.4
        elif desc_length < 200:
            desc_factor = 0.6
        elif desc_length < 500:
            desc_factor = 0.75
        else:
            desc_factor = 0.9
        
        # Complexity certainty (very high is less certain than medium)
        complexity_factor = 0.8 if complexity in ["low", "medium"] else 0.7
        
        # Weighted combination
        confidence = (
            0.4 * feature_factor +
            0.4 * desc_factor +
            0.2 * complexity_factor
        )
        
        return max(MIN_CONFIDENCE, min(confidence, MAX_CONFIDENCE))
    
    # ------------------------------------------------------------------------
    # FUNCTION POINTS INFERENCE
    # ------------------------------------------------------------------------
    
    def infer_function_points(
        self,
        project_type: str,
        feature_count: int,
        complexity: str,
        features_description: str = ""
    ) -> InferredField:
        """
        Infer unadjusted Function Points from feature analysis.
        
        Uses project-type specific FP component ratios to estimate:
        - External Inputs (EI)
        - External Outputs (EO)
        - External Inquiries (EQ)
        - Internal Logical Files (ILF)
        - External Interface Files (EIF)
        
        Args:
            project_type: Type of project (determines FP config)
            feature_count: Number of features
            complexity: Project complexity
            features_description: Description of features for refinement
            
        Returns:
            InferredField with unadjusted FP estimate
        """
        if feature_count == 0:
            # Can't estimate FP without features
            return InferredField(
                value=0.0,
                confidence=0.3,
                source="no_features",
                overridden_by_user=False
            )
        
        # Get FP config for project type
        _, fp_config_key = map_project_type_to_configs(project_type)
        fp_config = FP_CONFIGS.get(fp_config_key, FP_CONFIGS["default"])
        
        # Calculate component counts
        ei_count = feature_count * fp_config.inputs_per_feature
        eo_count = feature_count * fp_config.outputs_per_feature
        eq_count = feature_count * fp_config.inquiries_per_feature
        ilf_count = feature_count * fp_config.files_per_feature
        eif_count = feature_count * fp_config.interfaces_per_feature
        
        # Apply complexity weights (simplified - normally you'd use FP tables)
        complexity_weights = {
            "low": 1.0,
            "medium": 1.2,
            "high": 1.4,
            "very high": 1.6
        }
        complexity_weight = complexity_weights.get(complexity.lower(), 1.2)
        
        # Calculate unadjusted FP
        # Simple approach: weight each component equally at average complexity
        avg_weight = 4  # Typical FP weight
        unadjusted_fp = (
            (ei_count + eo_count + eq_count + ilf_count + eif_count) 
            * avg_weight 
            * complexity_weight
        )
        
        # Calculate confidence
        confidence = self._calculate_fp_confidence(
            feature_count=feature_count,
            features_description=features_description,
            has_specific_config=(fp_config_key != "default")
        )
        
        source = f"project_type={fp_config_key}+features={feature_count}+complexity={complexity}"
        
        return InferredField(
            value=round(unadjusted_fp, 1),
            confidence=round(confidence, 2),
            source=source,
            overridden_by_user=False
        )
    
    def _calculate_fp_confidence(
        self,
        feature_count: int,
        features_description: str,
        has_specific_config: bool
    ) -> float:
        """Calculate confidence for FP inference."""
        # More features = better estimate
        if feature_count < 3:
            count_factor = 0.4
        elif feature_count < 10:
            count_factor = 0.6
        else:
            count_factor = 0.8
        
        # Description quality
        desc_factor = 0.7 if len(features_description) > 100 else 0.5
        
        # Specific config vs default
        config_factor = 0.8 if has_specific_config else 0.6
        
        confidence = (
            0.4 * count_factor +
            0.3 * desc_factor +
            0.3 * config_factor
        )
        
        return max(MIN_CONFIDENCE, min(confidence, MAX_CONFIDENCE))
    
    # ------------------------------------------------------------------------
    # STORY POINTS INFERENCE
    # ------------------------------------------------------------------------
    
    def infer_story_points(
        self,
        feature_count: int,
        complexity: str,
        feature_descriptions: Optional[List[Dict]] = None
    ) -> InferredField:
        """
        Infer total story points from features.
        
        Can analyze individual feature descriptions to adjust estimates
        based on keywords like "simple", "complex", "critical".
        
        Args:
            feature_count: Number of features
            complexity: Overall project complexity
            feature_descriptions: Optional list of feature dicts with 'name' and optional 'description'
            
        Returns:
            InferredField with total story points estimate
        """
        if feature_count == 0:
            return InferredField(
                value=0.0,
                confidence=0.3,
                source="no_features",
                overridden_by_user=False
            )
        
        # Base points per feature
        base_points = STORY_POINTS_PER_FEATURE.get(complexity.lower(), 8)
        
        # Calculate per-feature if we have descriptions
        if feature_descriptions:
            total_points = 0.0
            for feature in feature_descriptions:
                feature_points = base_points
                
                # Check for size adjustments in feature name/description
                feature_text = (feature.get("name", "") + " " + feature.get("description", "")).lower()
                for size_key, adjustment in FEATURE_SIZE_ADJUSTMENTS.items():
                    if size_key in feature_text:
                        feature_points *= adjustment
                        break
                
                total_points += feature_points
        else:
            # Use simple multiplication
            total_points = feature_count * base_points
        
        # Calculate confidence
        has_descriptions = bool(feature_descriptions)
        confidence = self._calculate_sp_confidence(
            feature_count=feature_count,
            has_descriptions=has_descriptions,
            complexity=complexity.lower()
        )
        
        source_parts = [f"complexity={complexity}", f"features={feature_count}"]
        if has_descriptions:
            source_parts.append("with_descriptions")
        source = "+".join(source_parts)
        
        return InferredField(
            value=round(total_points, 0),
            confidence=round(confidence, 2),
            source=source,
            overridden_by_user=False
        )
    
    def _calculate_sp_confidence(
        self,
        feature_count: int,
        has_descriptions: bool,
        complexity: str
    ) -> float:
        """Calculate confidence for story points inference."""
        # More features = better
        if feature_count < 5:
            count_factor = 0.5
        elif feature_count < 15:
            count_factor = 0.7
        else:
            count_factor = 0.85
        
        # Descriptions add confidence
        desc_factor = 0.8 if has_descriptions else 0.6
        
        # Medium complexity is easier to estimate
        complexity_factor = 0.8 if complexity in ["low", "medium"] else 0.7
        
        confidence = (
            0.5 * count_factor +
            0.3 * desc_factor +
            0.2 * complexity_factor
        )
        
        return max(MIN_CONFIDENCE, min(confidence, MAX_CONFIDENCE))
    
    # ------------------------------------------------------------------------
    # TEAM VELOCITY INFERENCE
    # ------------------------------------------------------------------------
    
    def infer_team_velocity(
        self,
        team_size: int,
        team_maturity: str = "average",
        sprint_length_weeks: int = 2
    ) -> InferredField:
        """
        Infer team velocity (story points per sprint).
        
        Accounts for:
        - Team size with coordination overhead cap
        - Team maturity/experience level
        - Sprint length
        
        Note: Large teams (>9 people) are capped at effective size of 9
        due to coordination overhead (Brooks' Law).
        
        Args:
            team_size: Number of team members
            team_maturity: Team experience (new, average, experienced, expert)
            sprint_length_weeks: Sprint duration in weeks
            
        Returns:
            InferredField with velocity estimate
        """
        if team_size == 0:
            team_size = 5  # Default assumption
        
        # Cap effective team size for coordination overhead
        effective_team = min(team_size, 9)
        
        # Get efficiency multiplier
        efficiency = get_team_efficiency(effective_team)
        
        # Get maturity multiplier
        maturity_factor = TEAM_MATURITY_FACTORS.get(team_maturity.lower(), 0.8)
        
        # Get sprint length multiplier
        sprint_mult = SPRINT_LENGTH_MULTIPLIERS.get(sprint_length_weeks, 1.0)
        
        # Calculate velocity
        velocity = (
            effective_team 
            * BASE_VELOCITY_PER_DEV 
            * efficiency 
            * maturity_factor 
            * sprint_mult
        )
        
        # Calculate confidence
        # Lower confidence for huge teams or if team size was capped
        was_capped = team_size > 9
        confidence = self._calculate_velocity_confidence(
            team_size=team_size,
            was_capped=was_capped,
            has_maturity_info=(team_maturity != "average")
        )
        
        source_parts = [f"team_size={team_size}"]
        if was_capped:
            source_parts.append(f"capped_at={effective_team}")
        if team_maturity != "average":
            source_parts.append(f"maturity={team_maturity}")
        if sprint_length_weeks != 2:
            source_parts.append(f"sprint={sprint_length_weeks}w")
        source = "+".join(source_parts)
        
        return InferredField(
            value=round(velocity, 1),
            confidence=round(confidence, 2),
            source=source,
            overridden_by_user=False
        )
    
    def _calculate_velocity_confidence(
        self,
        team_size: int,
        was_capped: bool,
        has_maturity_info: bool
    ) -> float:
        """Calculate confidence for velocity inference."""
        # Base confidence for velocity is lower (we don't know team history)
        base = 0.5
        
        # Very small or very large teams are less predictable
        if team_size <= 2 or team_size > 20:
            size_factor = 0.9
        else:
            size_factor = 1.0
        
        # Capping reduces confidence
        cap_factor = 0.85 if was_capped else 1.0
        
        # Having maturity info helps
        maturity_factor = 1.1 if has_maturity_info else 1.0
        
        confidence = base * size_factor * cap_factor * maturity_factor
        
        return max(MIN_CONFIDENCE, min(confidence, MAX_CONFIDENCE))
    
    # ------------------------------------------------------------------------
    # REUSE PROFILE INFERENCE
    # ------------------------------------------------------------------------
    
    def infer_reuse_profile(
        self,
        project_type: str,
        tech_stack: str = "",
        organization_maturity: str = "average",
        description: str = ""
    ) -> InferredField:
        """
        Infer code/design reuse percentages.
        
        Considers:
        - Project type baseline
        - Organization maturity
        - Explicit reuse mentions in description
        - Tech stack (frameworks enable more reuse)
        
        Args:
            project_type: Type of project
            tech_stack: Technology stack
            organization_maturity: Org reuse culture (startup, growing, mature, enterprise)
            description: Project description to check for reuse mentions
            
        Returns:
            InferredField with reuse profile dict
        """
        # Get base profile
        project_type_lower = project_type.lower()
        base_profile = None
        
        # Find matching base profile
        for key, profile in BASE_REUSE_PROFILES.items():
            if key.lower() in project_type_lower:
                base_profile = profile.copy()
                break
        
        if not base_profile:
            base_profile = BASE_REUSE_PROFILES["default"].copy()
        
        # Apply organization maturity adjustment
        org_mult = ORG_MATURITY_ADJUSTMENTS.get(organization_maturity.lower(), 1.0)
        
        # Check for explicit reuse intent in description
        reuse_intent_mult = self._detect_reuse_intent(description)
        
        # Tech stack adjustment (frameworks = more reuse)
        tech_mult = 1.0
        if any(framework in tech_stack.lower() for framework in ["react", "angular", "vue", "django", "rails", "spring"]):
            tech_mult = 1.2
        
        # Apply multipliers
        final_profile = {}
        combined_mult = org_mult * reuse_intent_mult * tech_mult
        
        for phase, percent in base_profile.items():
            adjusted = percent * combined_mult
            # Cap at reasonable maximum (50% reuse)
            final_profile[phase] = min(adjusted, 0.5)
        
        # Calculate confidence
        has_reuse_intent = (reuse_intent_mult > 1.0)
        confidence = self._calculate_reuse_confidence(
            project_type=project_type,
            has_reuse_intent=has_reuse_intent,
            org_maturity=organization_maturity
        )
        
        source_parts = [f"project_type={project_type[:20]}"]
        if organization_maturity != "average":
            source_parts.append(f"org={organization_maturity}")
        if has_reuse_intent:
            source_parts.append("explicit_reuse")
        source = "+".join(source_parts)
        
        return InferredField(
            value=final_profile,
            confidence=round(confidence, 2),
            source=source,
            overridden_by_user=False
        )
    
    def _detect_reuse_intent(self, description: str) -> float:
        """Detect explicit reuse mentions in description."""
        if not description:
            return 1.0
        
        desc_lower = description.lower()
        
        # Check for reuse keywords
        reuse_keywords = [
            "reuse", "existing", "library", "framework", "template",
            "boilerplate", "component library", "design system", "shared code"
        ]
        
        if any(keyword in desc_lower for keyword in reuse_keywords):
            return 1.3  # 30% boost for explicit reuse intent
        
        return 1.0
    
    def _calculate_reuse_confidence(
        self,
        project_type: str,
        has_reuse_intent: bool,
        org_maturity: str
    ) -> float:
        """Calculate confidence for reuse profile inference."""
        # Well-known project types have better confidence
        is_common_type = any(t in project_type.lower() for t in ["web", "mobile", "integration"])
        type_factor = 0.8 if is_common_type else 0.6
        
        # Explicit intent adds confidence
        intent_factor = 1.1 if has_reuse_intent else 1.0
        
        # Mature orgs are more predictable
        maturity_boost = 1.1 if org_maturity in ["mature", "enterprise"] else 1.0
        
        confidence = 0.7 * type_factor * intent_factor * maturity_boost
        
        return max(MIN_CONFIDENCE, min(confidence, MAX_CONFIDENCE))
    
    # ------------------------------------------------------------------------
    # MAIN INFERENCE METHOD
    # ------------------------------------------------------------------------
    
    def infer_all_parameters(
        self,
        baseline: Dict[str, Any],
        features: List[Dict],
        description: str,
        user_provided: Optional[Dict[str, Any]] = None
    ) -> InferenceResult:
        """
        Infer all missing estimation parameters.
        
        User-provided values always take precedence over inferred ones.
        
        Args:
            baseline: Baseline project data (complexity, project_type, team_size, etc.)
            features: List of feature dicts
            description: Project description
            user_provided: Dict of user-provided metrics (if any)
            
        Returns:
            InferenceResult with all available parameters
        """
        if user_provided is None:
            user_provided = {}
        
        result = InferenceResult()
        
        # Extract baseline fields
        complexity = baseline.get("complexity", "medium")
        project_type = baseline.get("project_type", "web application")
        tech_stack = baseline.get("tech_stack", "")
        team_size = baseline.get("team_pref", 5)
        
        feature_count = len(features)
        
        # KSLOC
        if "ksloc" in user_provided:
            result.ksloc = InferredField(
                value=float(user_provided["ksloc"]),
                confidence=1.0,
                source="user_provided",
                overridden_by_user=True
            )
        else:
            result.ksloc = self.infer_ksloc(
                complexity=complexity,
                feature_count=feature_count,
                tech_stack=tech_stack,
                project_type=project_type,
                description=description
            )
        
        # Function Points
        if "unadjusted_fp" in user_provided:
            result.unadjusted_fp = InferredField(
                value=float(user_provided["unadjusted_fp"]),
                confidence=1.0,
                source="user_provided",
                overridden_by_user=True
            )
        else:
            result.unadjusted_fp = self.infer_function_points(
                project_type=project_type,
                feature_count=feature_count,
                complexity=complexity,
                features_description=description
            )
        
        # Story Points
        if "story_points" in user_provided:
            result.story_points = InferredField(
                value=float(user_provided["story_points"]),
                confidence=1.0,
                source="user_provided",
                overridden_by_user=True
            )
        else:
            result.story_points = self.infer_story_points(
                feature_count=feature_count,
                complexity=complexity,
                feature_descriptions=features if features else None
            )
        
        # Team Velocity
        if "team_velocity" in user_provided:
            result.team_velocity = InferredField(
                value=float(user_provided["team_velocity"]),
                confidence=1.0,
                source="user_provided",
                overridden_by_user=True
            )
        else:
            result.team_velocity = self.infer_team_velocity(
                team_size=team_size,
                team_maturity="average",  # Could be inferred from description
                sprint_length_weeks=2
            )
        
        # Reuse Profile
        if "reuse_profile" in user_provided:
            result.reuse_profile = InferredField(
                value=user_provided["reuse_profile"],
                confidence=1.0,
                source="user_provided",
                overridden_by_user=True
            )
        else:
            result.reuse_profile = self.infer_reuse_profile(
                project_type=project_type,
                tech_stack=tech_stack,
                organization_maturity="average",
                description=description
            )
        
        # Optional: Calculate ranges based on confidence
        if result.ksloc and not result.ksloc.overridden_by_user:
            uncertainty = 1.0 - result.ksloc.confidence
            ksloc_val = result.ksloc.value
            result.ksloc_range = (
                ksloc_val * (1 - uncertainty * 0.3),
                ksloc_val * (1 + uncertainty * 0.5)
            )
        
        if result.story_points and not result.story_points.overridden_by_user:
            uncertainty = 1.0 - result.story_points.confidence
            sp_val = result.story_points.value
            result.story_points_range = (
                sp_val * (1 - uncertainty * 0.25),
                sp_val * (1 + uncertainty * 0.4)
            )
        
        return result


__all__ = [
    "InferredField",
    "InferenceResult",
    "InferenceService",
]
