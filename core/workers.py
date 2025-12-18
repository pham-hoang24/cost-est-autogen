from typing import List, Dict, Any, Tuple
from core.contract import CalibrationProfile, EstimationOutput, InferredParameters, MethodSelection

class EstimationEngine:
    """Deterministic estimation logic with calibration support."""
    
    def __init__(self, calibration_profile: CalibrationProfile = None):
        self.profile = calibration_profile or CalibrationProfile(profile_name="default")

    def calculate_cocomo_ii(self, ksloc: float, complexity_score: float) -> EstimationOutput:
        """
        Calculate COCOMO II estimate.
        Formula: Effort = A * (KSLOC) ^ E * (Product of Cost Drivers)
        Where E = B + 0.01 * (Sum of Scale Factors)
        """
        # Default constants if not in profile
        A = self.profile.cocomo_constants.get("A", 2.94)
        B = self.profile.cocomo_constants.get("B", 0.91)
        
        # Simplified scale factors based on complexity (0.0 - 1.0)
        # Higher complexity -> Higher E
        scale_factors_sum = 10.0 + (complexity_score * 15.0) # Range 10.0 to 25.0
        E = B + 0.01 * scale_factors_sum
        
        effort_months = A * (ksloc ** E)
        
        # Simple cost model: $10k per person-month (example)
        cost = effort_months * 10000.0
        
        return EstimationOutput(
            method="cocomo2",
            total_cost=cost,
            total_effort_months=effort_months,
            calibration_profile=self.profile,
            details={
                "ksloc": ksloc,
                "E": E,
                "A": A,
                "scale_factors_sum": scale_factors_sum
            }
        )

    def calculate_fpa(self, ufp: float, complexity_score: float) -> EstimationOutput:
        """
        Calculate Function Point Analysis estimate.
        """
        # Simplified VAF (Value Adjustment Factor) based on complexity
        # VAF range: 0.65 to 1.35
        vaf = 0.65 + (complexity_score * 0.7)
        afp = ufp * vaf
        
        # Productivity: Hours per Function Point (e.g., 10 hours/FP)
        hours_per_fp = self.profile.fpa_weights.get("hours_per_fp", 10.0)
        effort_hours = afp * hours_per_fp
        effort_months = effort_hours / 160.0 # 160 hours per month
        
        cost = effort_months * 10000.0
        
        return EstimationOutput(
            method="fpa",
            total_cost=cost,
            total_effort_months=effort_months,
            calibration_profile=self.profile,
            details={
                "ufp": ufp,
                "vaf": vaf,
                "afp": afp,
                "hours_per_fp": hours_per_fp
            }
        )

class MethodScoring:
    """Deterministic scoring of estimation methods."""
    
    def score_methods(self, params: InferredParameters) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Returns (ranked_methods, rationale_facts)
        """
        scores = []
        rationale = []
        
        # COCOMO II Logic
        cocomo_score = 0.0
        if "ksloc" in params.size_metrics:
            cocomo_score += 0.8
            rationale.append("COCOMO II is suitable because KSLOC size metric is available.")
        elif "ufp" in params.size_metrics:
             # Can convert UFP to KSLOC, but less accurate
            cocomo_score += 0.5
            rationale.append("COCOMO II is possible via UFP-to-KSLOC conversion, but less accurate.")
        
        scores.append({"method": "cocomo2", "score": cocomo_score})
        
        # FPA Logic
        fpa_score = 0.0
        if "ufp" in params.size_metrics:
            fpa_score += 0.9
            rationale.append("Function Point Analysis is highly suitable as UFP is available.")
        
        scores.append({"method": "fpa", "score": fpa_score})
        
        # Sort by score descending
        ranked = sorted(scores, key=lambda x: x["score"], reverse=True)
        
        return ranked, rationale
