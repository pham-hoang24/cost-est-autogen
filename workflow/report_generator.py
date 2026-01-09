from __future__ import annotations

import random
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from .schemas import (
    BaselineInputs,
    CostEstimationReport,
    CostEstimate,
    EstimationResult,
    FeatureEstimate,
    MethodEstimate,
    ProjectData,
    ResourceAllocation,
    TeamComposition,
    TeamMember,
    TimelineEstimate,
    TimelinePhase,
)


class ReportGeneratorService:
    """
    Generates comprehensive cost estimation reports matching frontend expectations.
    """

    def generate_report(
        self,
        project_id: str,
        baseline: BaselineInputs,
        user_description: str,
        estimation_config: Dict[str, Any],
        estimates: List[Dict[str, Any]],
        methods_used: List[str],
        expansion: Optional[Any] = None,  # Added expansion context
    ) -> CostEstimationReport:
        """
        Main entry point: generates complete cost estimation report.

        Args:
            project_id: Unique project identifier
            baseline: Baseline project inputs
            user_description: User's project description
            estimation_config: Configuration for estimation
            estimates: List of estimation results from different methods
            methods_used: List of method IDs used
            expansion: Optional ExpansionV1 object with inferred features

        Returns:
            Complete CostEstimationReport matching frontend schema
        """
        # Generate project data
        project_data = self._generate_project_data(baseline, user_description, expansion)

        # Generate estimation result
        estimation_result = self._generate_estimation_result(
            baseline, user_description, estimates, methods_used, estimation_config, expansion
        )

        # Build complete report
        report = CostEstimationReport(
            report_title="Cost Estimation Report",
            generated_at=datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p"),
            project_details=baseline.dict() if baseline else {},
            estimation_config=estimation_config,
            timestamp=datetime.utcnow().isoformat() + "Z",
            project_data=project_data,
            estimation_result=estimation_result,
        )

        return report

    def _generate_project_data(
        self, baseline: BaselineInputs, user_description: str, expansion: Optional[Any] = None
    ) -> ProjectData:
        """
        Generate project context and metadata.
        """
        # Normalize project type
        original_type = baseline.project_type or "software development"
        project_type = self._normalize_project_type(original_type)

        # Detect high complexity
        high_complexity = baseline.complexity in ["high", "very high", "complex"]

        # Extract functional requirements from expansion if available
        if expansion and hasattr(expansion, "features"):
            functional_reqs = [f.name for f in expansion.features[:8]]  # Top 8 features
        else:
            functional_reqs = self._extract_functional_requirements(user_description)

        # Generate rich project context description
        context_description = self._generate_project_context_description(
            original_type, baseline.complexity or "medium", user_description
        )

        # Generate requirements summary
        requirements_summary = f"{original_type} project with {baseline.complexity or 'medium'} complexity"

        return ProjectData(
            original_project_type=original_type,
            project_type=project_type,
            technical_complexity={"high_complexity": high_complexity},
            project_context_description=context_description,
            project_requirements=requirements_summary,
            functional_requirements=functional_reqs,
        )

    def _generate_estimation_result(
        self,
        baseline: BaselineInputs,
        user_description: str,
        estimates: List[Dict[str, Any]],
        methods_used: List[str],
        estimation_config: Dict[str, Any],
        expansion: Optional[Any] = None,
    ) -> EstimationResult:
        """Generate complete estimation result with all components."""
        # Aggregate multi-method estimates
        (
            total_cost,
            individual_estimates,
            variance_pct,
            confidence_level,
        ) = self._aggregate_multi_method_estimates(estimates, methods_used)

        # Calculate effort and duration
        effort_months = self._calculate_effort(total_cost)
        duration_months = self._calculate_duration(effort_months)

        # Generate team composition
        team_size = self._estimate_team_size(effort_months, duration_months)
        team_composition = self._generate_team_composition(team_size, effort_months)

        # Generate cost breakdown
        cost_estimate = self._calculate_cost_breakdown(total_cost, confidence_level)

        # Generate features from expansion
        features = self._generate_features(baseline, total_cost, expansion)

        # Generate timeline
        timeline = self._generate_timeline(duration_months)

        # Generate charts data
        charts = self._generate_charts(total_cost, duration_months)

        # Generate executive summary
        executive_summary = self._generate_executive_summary(
            total_cost,
            duration_months,
            len(methods_used),
            confidence_level,
            estimation_config.get("currency", "EUR"),
        )

        # Generate explanation
        explanation = self._generate_explanation(
            len(methods_used), variance_pct, individual_estimates
        )

        # Determine estimation method name
        estimation_method = (
            "Intelligent Multi-Method" if len(methods_used) > 1 else "Single Method"
        )

        # Generate warning if needed
        warning = self._generate_warning(variance_pct)

        # Standard success criteria and deliverables
        success_criteria = [
            "The application should meet all specified functional requirements",
            "The application should be delivered within the estimated timeline",
            "The application should be delivered within the estimated budget",
            "Code quality should meet industry standards",
        ]

        deliverables = [
            "Fully functional application",
            "Source code and documentation",
            "User manual and technical documentation",
            "Deployment guide",
        ]

        return EstimationResult(
            executive_summary=executive_summary,
            team_composition=team_composition,
            cost_estimate=cost_estimate,
            timeline_estimate=TimelineEstimate(
                total_duration=f"{duration_months} month{'s' if duration_months > 1 else ''}"
            ),
            resource_allocation=ResourceAllocation(recommended_team_size=team_size),
            explanation=explanation,
            success_criteria=success_criteria,
            deliverables=deliverables,
            features=features,
            timeline=timeline,
            charts=charts,
            estimation_method=estimation_method,
            methods_used=methods_used,
            individual_estimates=individual_estimates,
            effort_person_months=effort_months,
            warning=warning,
        )

    def _generate_features(
        self, baseline: BaselineInputs, total_cost: float, expansion: Optional[Any] = None
    ) -> List[FeatureEstimate]:
        """
        Generate feature breakdowns using actual inferred features.
        """
        if not expansion or not hasattr(expansion, "features") or not expansion.features:
            # Fallback to templates if no expansion features
            return self._generate_template_features(baseline, total_cost)

        # Use actual features from expansion
        features = []
        num_features = len(expansion.features)
        cost_per_feature_base = total_cost / max(1, num_features)
        hourly_rate = 62.5  # EUR

        for item in expansion.features:
            # Add variation based on feature name length (heuristic for complexity)
            complexity_factor = 1.0 + (len(item.name) / 100.0)
            variation = random.uniform(0.8, 1.2) * complexity_factor
            
            hours = (cost_per_feature_base / hourly_rate) * variation
            cost = hours * hourly_rate
            
            # Generate generic user stories based on feature name
            user_stories = [
                f"As a user, I want to use {item.name} functionality.",
                f"As an admin, I want to manage {item.name} settings."
            ]

            features.append(
                FeatureEstimate(
                    name=item.name[:50] + "..." if len(item.name) > 50 else item.name,
                    description=f"Implementation of {item.name}",
                    tags=[baseline.project_type or "General", "Feature"],
                    hours=hours,
                    user_stories=user_stories,
                    cost=cost,
                )
            )
            
        return features

    def _generate_template_features(self, baseline: BaselineInputs, total_cost: float) -> List[FeatureEstimate]:
        """Fallback to template features."""
        features_templates = [
            {
                "name": "User authentication",
                "description": "Implement user registration, login, and password reset functionalities.",
                "tags": ["Authentication", "User"],
                "user_stories": ["User registration", "User login", "Password reset"],
            },
            {
                "name": "Core Functionality",
                "description": "Implementation of primary business logic.",
                "tags": ["Core", "Logic"],
                "user_stories": ["Main workflow", "Data processing"],
            },
            {
                "name": "Data Management",
                "description": "CRUD operations for core data entities.",
                "tags": ["Data", "CRUD"],
                "user_stories": ["Create records", "View records", "Update records"],
            },
            {
                "name": "Reporting & Analytics",
                "description": "Dashboards and reporting tools.",
                "tags": ["Reporting", "Analytics"],
                "user_stories": ["View dashboard", "Export reports"],
            },
        ]
        
        cost_per_feature_base = total_cost / len(features_templates)
        hourly_rate = 62.5
        features = []
        
        for template in features_templates:
            variation = random.uniform(0.8, 1.2)
            hours = (cost_per_feature_base / hourly_rate) * variation
            cost = hours * hourly_rate
            
            features.append(
                FeatureEstimate(
                    name=template["name"],
                    description=template["description"],
                    tags=template["tags"],
                    hours=hours,
                    user_stories=template["user_stories"],
                    cost=cost,
                )
            )
        return features

    def _aggregate_multi_method_estimates(
        self, estimates: List[Dict[str, Any]], methods_used: List[str]
    ) -> Tuple[float, Dict[str, MethodEstimate], float, str]:
        """
        Aggregate estimates from multiple methods using actual data.
        """
        if not estimates:
            return (250000.0, {}, 0.0, "LOW - Insufficient data")

        individual_estimates = {}
        weighted_cost_sum = 0.0
        total_weight = 0.0
        costs = []

        # Method accuracy/confidence weights
        method_weights = {
            "cocomo": 0.90, "cocomo2": 0.90,
            "fpa": 0.85, "function-points": 0.85,
            "story-points": 0.80, "agile_sp": 0.80,
            "parametric": 0.85,
            "bottom-up": 0.95, "bottomup": 0.95,
            "analogous": 0.75,
            "hybrid": 0.70,
        }

        # Process each estimate
        # Note: estimates list might not align 1:1 with methods_used if some failed
        # We assume estimates contains dicts with 'method' key or we try to map them
        
        for est in estimates:
            # Extract cost
            cost = est.get("cost", est.get("total_cost", 0.0))
            if cost <= 0:
                continue
                
            # Identify method
            method_id = est.get("method", "unknown")
            # If method_id is not in methods_used, try to infer or skip
            # For now, we'll just use it
            
            weight = method_weights.get(method_id, 0.75)
            
            # Calculate duration (simple heuristic if not provided)
            duration_val = est.get("duration", int(cost / 15000)) 
            if isinstance(duration_val, str):
                duration_str = duration_val
            else:
                duration_str = f"{max(1, int(duration_val))} months"

            individual_estimates[method_id] = MethodEstimate(
                methodology=self._get_method_name(method_id),
                cost=cost,
                duration=duration_str,
                weight=weight,
                breakdown={
                    "development": cost * 0.50,
                    "testing": cost * 0.20,
                    "management": cost * 0.15,
                    "infrastructure": cost * 0.10,
                    "contingency": cost * 0.05,
                },
            )
            
            weighted_cost_sum += cost * weight
            total_weight += weight
            costs.append(cost)

        if not costs:
             return (250000.0, {}, 0.0, "LOW - Estimation failed")

        # Calculate weighted average
        if total_weight > 0:
            total_cost = weighted_cost_sum / total_weight
        else:
            total_cost = sum(costs) / len(costs)

        # Calculate variance
        if len(costs) > 1:
            variance_pct = ((max(costs) - min(costs)) / min(costs)) * 100
        else:
            variance_pct = 0.0

        # Determine confidence level
        if variance_pct > 50:
            confidence_level = "LOW - Significant variance between methods"
        elif variance_pct > 25:
            confidence_level = "MEDIUM - Moderate variance"
        else:
            confidence_level = "HIGH - Low variance"

        return total_cost, individual_estimates, variance_pct, confidence_level

    # ======== Helper Methods ========

    def _normalize_project_type(self, project_type: str) -> str:
        """Normalize project type to COCOMO classification."""
        project_type_lower = project_type.lower()

        if any(
            kw in project_type_lower
            for kw in ["web", "mobile", "app", "simple", "prototype"]
        ):
            return "organic"
        elif any(
            kw in project_type_lower
            for kw in ["enterprise", "complex", "integration", "migration"]
        ):
            return "semi-detached"
        elif any(kw in project_type_lower for kw in ["embedded", "real-time", "critical"]):
            return "embedded"
        else:
            return "organic"

    def _extract_functional_requirements(self, description: str) -> List[str]:
        """Extract functional requirements from user description."""
        # Default functional requirements
        return [
            "User authentication",
            "Dashboard",
            "Data management",
            "Reporting",
        ]

    def _generate_project_context_description(
        self, project_type: str, complexity: str, user_description: str
    ) -> str:
        """Generate rich project context description."""
        para1 = f"This project aims to develop a {project_type} with {complexity} complexity, designed to meet the evolving needs of modern users. The platform will provide core functionality including user authentication, data management, and comprehensive reporting capabilities."

        para2 = "The application will be built with scalability and maintainability in mind, ensuring that it can grow with the business. By leveraging modern development practices and focusing on user experience, the system will deliver value to stakeholders while maintaining high standards of code quality and performance."

        return f"{para1}\n\n{para2}"

    def _calculate_effort(self, total_cost: float) -> float:
        """Calculate effort in person-months from total cost."""
        avg_monthly_rate = 10000.0  # Average cost per person-month
        return total_cost / avg_monthly_rate

    def _calculate_duration(self, effort_months: float) -> int:
        """Calculate project duration from effort."""
        # Typical efficiency factor (1.4 means 1.4 PM → 1 month duration)
        efficiency_factor = 1.4
        duration = max(1, int(effort_months / efficiency_factor))
        return min(duration, 12)  # Cap at 12 months for realistic projects

    def _estimate_team_size(self, effort_months: float, duration_months: int) -> int:
        """Estimate team size from effort and duration."""
        if duration_months == 0:
            return 1
        team_size = max(1, int(effort_months / duration_months))
        return min(team_size, 20)  # Cap at reasonable size
    
    def _generate_team_composition(
        self,
        team_size: int,
        effort_months: float,
    ) -> TeamComposition:
        """
        Build a simple team composition model from team size and effort.

        team_size: average team size (people)
        effort_months: total effort in person-months for the project
        """

        # Guard: if we somehow got zero or negative, fall back to 1
        if team_size <= 0:
            team_size = 1

        # Very simple role mix heuristic.
        # You should adjust this to match your actual business logic
        # and the fields of your TeamComposition schema.
        role_mix = [
            ("Tech Lead / Architect", 0.10),
            ("Senior Engineer", 0.25),
            ("Engineer", 0.35),
            ("QA / Test Engineer", 0.20),
            ("Project Manager / BA", 0.10),
        ]

        # Compute integer headcounts per role
        roles = []
        remaining = team_size
        for name, share in role_mix:
            count = int(round(team_size * share))
            if count <= 0:
                continue
            remaining -= count
            roles.append(
                {
                    "role": name,
                    "count": count,
                    # distribute effort proportionally to headcount
                    "effort_person_months": effort_months * (count / team_size),
                }
            )

        # If rounding left us short, put the remainder on the "Engineer" role
        # or the role with the highest count if Engineer not found
        if remaining > 0:
            if not roles:
                # Fallback if no roles were created (e.g. very small team_size)
                roles.append({
                    "role": "Engineer",
                    "count": remaining,
                    "effort_person_months": effort_months
                })
            else:
                # Try to find "Engineer"
                target_role = next((r for r in roles if r["role"] == "Engineer"), None)
                if not target_role:
                    # Fallback to the first role (usually Tech Lead) or largest
                    target_role = roles[0]
                
                target_role["count"] += remaining
                # Adjust effort for the added headcount
                # Note: This is a rough heuristic; strictly speaking effort is input, 
                # but we attribute it to roles.
                target_role["effort_person_months"] += (effort_months / team_size) * remaining

        total_members = sum(r["count"] for r in roles)
        total_effort_person_months = effort_months  # already person-months

        # ⚠️ IMPORTANT:
        # You MUST adapt this part to match your actual TeamComposition dataclass
        # in .schemas. Below is a common pattern:
        return TeamComposition(
            total_members=total_members,
            total_effort_person_months=total_effort_person_months,
            average_team_size=team_size,
            roles=[
                # if you have a TeamMemberRole / TeamRole dataclass, use it here.
                # Example (adjust to your schema):
                # TeamRole(
                #     name=r["role"],
                #     count=r["count"],
                #     effort_person_months=r["effort_person_months"],
                # )
                r  # or just pass dicts if TeamComposition.roles is a List[Dict]
                for r in roles
            ]
        )

    def _generate_charts(
        self, total_cost: float, duration_months: int
    ) -> Dict[str, Any]:
        """Generate chart data for timeline visualization."""
        monthly_costs = []
        cost_per_month_base = total_cost / duration_months

        for month_num in range(1, duration_months + 1):
            # Add slight variation
            variation = random.uniform(0.85, 1.15)
            monthly_cost = cost_per_month_base * variation

            monthly_costs.append({"month": f"Month {month_num}", "cost": monthly_cost})

        return {"timeline": monthly_costs}

    def _generate_executive_summary(
        self,
        total_cost: float,
        duration_months: int,
        num_methods: int,
        confidence_level: str,
        currency: str = "EUR",
    ) -> str:
        """Generate executive summary."""
        confidence_label = confidence_level.split(" - ")[0]

        summary = f"Intelligent multi-method estimate: €{int(total_cost):,} over {duration_months} month{'s' if duration_months > 1 else ''} using {num_methods} method{'s' if num_methods > 1 else ''} [{confidence_label}]"

        return summary

    def _generate_explanation(
        self,
        num_methods: int,
        variance_pct: float,
        individual_estimates: Dict[str, MethodEstimate],
    ) -> str:
        """Generate explanation text."""
        if num_methods > 1:
            return f"Combined estimate from {num_methods} methods with confidence weights. Cost variance: {int(variance_pct)}%"
        else:
            return "Single method estimation based on project inputs"

    def _generate_warning(self, variance_pct: float) -> Optional[str]:
        """Generate warning message if variance is high."""
        if variance_pct > 50:
            return f"⚠️ WARNING: High variance ({int(variance_pct)}%) between methods. Consider reviewing individual estimates before proceeding."
        elif variance_pct > 25:
            return f"⚠️ CAUTION: Moderate variance ({int(variance_pct)}%) between methods."
        return None

    def _get_method_name(self, method_id: str) -> str:
        """Get human-readable method name."""
        method_names = {
            "cocomo": "COCOMO II",
            "cocomo2": "COCOMO II",
            "fpa": "Function Point Analysis",
            "function-points": "Function Point Analysis",
            "story-points": "Story Points & Velocity",
            "parametric": "Parametric Estimation",
            "bottom-up": "Bottom-Up Estimation",
            "analogous": "Analogous Estimation",
            "hybrid": "Hybrid Method",
        }
        return method_names.get(method_id, method_id.title())
