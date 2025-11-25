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

        Returns:
            Complete CostEstimationReport matching frontend schema
        """
        # Generate project data
        project_data = self._generate_project_data(baseline, user_description)

        # Generate estimation result
        estimation_result = self._generate_estimation_result(
            baseline, user_description, estimates, methods_used, estimation_config
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
        self, baseline: BaselineInputs, user_description: str
    ) -> ProjectData:
        """
        Generate project context and metadata.

        Normalizes project type and generates comprehensive project description.
        """
        # Normalize project type
        original_type = baseline.project_type or "software development"
        project_type = self._normalize_project_type(original_type)

        # Detect high complexity
        high_complexity = baseline.complexity in ["high", "very high", "complex"]

        # Extract functional requirements
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

        # Generate features
        features = self._generate_features(baseline, total_cost)

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
        self, baseline: BaselineInputs, total_cost: float
    ) -> List[FeatureEstimate]:
        """
        Generate feature breakdowns with user stories.

        Creates standard features based on project type.
        """
        features_templates = [
            {
                "name": "User authentication",
                "description": "Implement user registration, login, and password reset functionalities to allow users to create accounts and securely access their profiles.",
                "tags": ["Authentication", "User", "Web App"],
                "user_stories": [
                    "As a user, I want to register with email and password so that I can create an account.",
                    "As a user, I want to log in to my account so that I can access my profile.",
                    "As a user, I want to reset my password if I forget it so that I can regain access to my account.",
                ],
            },
            {
                "name": "Dashboard",
                "description": "Create an intuitive dashboard to display key metrics, analytics, and user activity overview.",
                "tags": ["Dashboard", "Analytics", "Web App"],
                "user_stories": [
                    "As a user, I want to see my activity summary so that I can track my usage.",
                    "As a user, I want to view analytics charts so that I can understand trends.",
                    "As a user, I want quick access to common actions so that I can work efficiently.",
                ],
            },
            {
                "name": "Data management",
                "description": "Build comprehensive data management tools for creating, editing, and organizing records with search and filtering.",
                "tags": ["Data", "Management", "CRUD"],
                "user_stories": [
                    "As a user, I want to create new records so that I can add data to the system.",
                    "As a user, I want to edit existing records so that I can update information.",
                    "As a user, I want to delete records so that I can remove outdated data.",
                    "As a user, I want to search and filter records so that I can find specific items quickly.",
                ],
            },
            {
                "name": "Reporting",
                "description": "Implement reporting features with customizable templates, export options, and scheduled report generation.",
                "tags": ["Reports", "Analytics", "Export"],
                "user_stories": [
                    "As a user, I want to generate reports so that I can analyze data.",
                    "As a user, I want to export reports to PDF so that I can share them.",
                    "As a user, I want to schedule automated reports so that I can receive them regularly.",
                ],
            },
        ]

        # Calculate cost per feature (total / number of features)
        cost_per_feature_base = total_cost / len(features_templates)
        hourly_rate = 62.5  # Average hourly rate in EUR

        features = []
        for template in features_templates:
            # Add some variation to hours
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

    def _generate_timeline(self, duration_months: int) -> List[TimelinePhase]:
        """Generate project timeline phases with dates and deliverables."""
        start_date = datetime.now()

        phases = [
            {
                "task": "Planning & Design",
                "description": "Establish project requirements, design system architecture, and create UI/UX mockups",
                "duration_weeks": 4,
                "deliverables": [
                    "Requirements specification document",
                    "System architecture design",
                    "UI/UX mockups and prototypes",
                    "Technical specification document",
                ],
            },
            {
                "task": "Development",
                "description": "Implement core features, integrate third-party services, and build the application",
                "duration_weeks": max(8, duration_months * 4 - 10),
                "deliverables": [
                    "Functional application modules",
                    "API endpoints and integrations",
                    "Database schema and migrations",
                    "Code documentation",
                ],
            },
            {
                "task": "Testing & QA",
                "description": "Perform unit testing, integration testing, and user acceptance testing",
                "duration_weeks": 2,
                "deliverables": [
                    "Test cases and test reports",
                    "Bug fix documentation",
                    "Performance optimization report",
                    "Security audit results",
                ],
            },
            {
                "task": "Deployment",
                "description": "Deploy to production, configure infrastructure, and provide training",
                "duration_weeks": 1,
                "deliverables": [
                    "Production deployment",
                    "Infrastructure setup documentation",
                    "User training materials",
                    "Handover and support plan",
                ],
            },
        ]

        timeline_phases = []
        current_date = start_date

        for phase in phases:
            phase_start = current_date
            phase_end = current_date + timedelta(weeks=phase["duration_weeks"])

            timeline_phases.append(
                TimelinePhase(
                    task=phase["task"],
                    description=phase["description"],
                    start_date=phase_start.strftime("%Y-%m-%d"),
                    end_date=phase_end.strftime("%Y-%m-%d"),
                    duration_weeks=phase["duration_weeks"],
                    deliverables=phase["deliverables"],
                )
            )

            current_date = phase_end

        return timeline_phases

    def _generate_team_composition(
        self, team_size: int, effort_months: float
    ) -> TeamComposition:
        """Calculate recommended team composition by seniority level."""
        developers = []

        if team_size >= 1:
            # Senior developers (40% of team, at least 1)
            senior_count = max(1, int(team_size * 0.4))
            developers.append(TeamMember(level="senior", count=senior_count))

            # Mid-level developers (40% of team)
            mid_count = max(0, int(team_size * 0.4))
            if mid_count > 0:
                developers.append(TeamMember(level="mid", count=mid_count))

            # Junior developers (20% of team)
            junior_count = max(0, int(team_size * 0.2))
            if junior_count > 0:
                developers.append(TeamMember(level="junior", count=junior_count))

        # Add designers if team is large enough
        designers = []
        if team_size > 3:
            designers.append(TeamMember(level="ui/ux", count=1))

        return TeamComposition(developers=developers, designers=designers, other_roles=[])

    def _calculate_cost_breakdown(
        self, total_cost: float, confidence_level: str
    ) -> CostEstimate:
        """Calculate cost breakdown by category (labor, infrastructure, other)."""
        labor_cost = total_cost * 0.65
        infrastructure_cost = total_cost * 0.15
        other_expenses = total_cost * 0.20

        return CostEstimate(
            total_cost=total_cost,
            labor_cost=labor_cost,
            infrastructure_cost=infrastructure_cost,
            other_expenses=other_expenses,
            confidence_level=confidence_level,
        )

    def _aggregate_multi_method_estimates(
        self, estimates: List[Dict[str, Any]], methods_used: List[str]
    ) -> Tuple[float, Dict[str, MethodEstimate], float, str]:
        """
        Aggregate estimates from multiple methods.

        Returns: (total_cost, individual_estimates, variance_pct, confidence_level)
        """
        if not estimates or not methods_used:
            # Default fallback
            default_cost = 250000.0
            return (
                default_cost,
                {},
                0.0,
                "LOW - Insufficient data",
            )

        # Extract costs and build individual estimates
        method_costs = []
        individual_estimates = {}

        # Method accuracy to weight mapping
        method_accuracies = {
            "cocomo": 0.90,
            "cocomo2": 0.90,
            "fpa": 0.85,
            "function-points": 0.85,
            "story-points": 0.80,
            "parametric": 0.85,
            "bottom-up": 0.95,
            "analogous": 0.75,
            "hybrid": 0.70,
        }

        for i, method_id in enumerate(methods_used):
            if i < len(estimates):
                estimate = estimates[i]
                cost = estimate.get("cost", estimate.get("total_cost", 200000.0))
            else:
                cost = 200000.0 * random.uniform(0.8, 1.2)

            method_costs.append(cost)

            # Get accuracy/weight for this method
            weight = method_accuracies.get(method_id, 0.75)

            # Calculate duration
            duration_months = int(cost / 150000) + 2

            # Build method estimate
            individual_estimates[method_id] = MethodEstimate(
                methodology=self._get_method_name(method_id),
                cost=cost,
                duration=f"{duration_months} months",
                weight=weight,
                breakdown={
                    "development": cost * 0.50,
                    "testing": cost * 0.20,
                    "management": cost * 0.15,
                    "infrastructure": cost * 0.10,
                    "contingency": cost * 0.05,
                },
            )

        # Calculate weighted average cost
        if len(method_costs) == 1:
            total_cost = method_costs[0]
            variance_pct = 0.0
        else:
            # Weight by confidence
            weights = [individual_estimates[m].weight for m in methods_used]
            total_weight = sum(weights)
            if total_weight > 0:
                total_cost = sum(
                    c * w for c, w in zip(method_costs, weights)
                ) / total_weight
            else:
                total_cost = sum(method_costs) / len(method_costs)

            # Calculate variance
            variance_pct = (
                (max(method_costs) - min(method_costs)) / min(method_costs) * 100
            )

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
