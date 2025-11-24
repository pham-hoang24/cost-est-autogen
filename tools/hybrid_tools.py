from typing import Dict, Any, List
from .cocomo_tools import generate_cocomo_ii_estimation
from .orchestrator_tools import _ORCHESTRATOR

def generate_hybrid_estimate(project_id: str) -> Dict[str, Any]:
    """
    Generates a hybrid estimate by:
    1. Normalizing and inferring inputs.
    2. Running available methods with inferred inputs.
    3. Aggregating results.
    """
    # 1. Ensure inputs are normalized and inferred
    context = _ORCHESTRATOR.normalize_and_infer(project_id)
    normalized = context.normalized_inputs
    inferred = context.inferred_fields
    
    estimates = []
    
    # 2. Run COCOMO II (Example of one method)
    # Extract inputs for COCOMO
    ksloc = inferred.get("ksloc", {}).get("value")
    if ksloc:
        try:
            # Map normalized factors to COCOMO ratings
            # This is a simplified mapping for the hybrid mode
            scale_factors = {
                "prec": "nominal", "flex": "nominal", "resl": "nominal", 
                "team": "nominal", "pmat": "nominal"
            }
            # Adjust based on complexity if needed
            if normalized.get("complexity_factor", 1.0) > 1.2:
                scale_factors["cplx"] = "high" # This is a cost driver, but just illustrating logic
            
            cocomo_res = generate_cocomo_ii_estimation(
                project_name=project_id,
                ksloc=ksloc,
                scale_factor_ratings=scale_factors
            )
            estimates.append({
                "method": "cocomo2",
                "cost": cocomo_res.results["cost_breakdown"][0]["cost"], # Labor cost
                "confidence": cocomo_res.confidence * inferred.get("ksloc", {}).get("confidence", 0.5)
            })
        except Exception as e:
            print(f"COCOMO failed in hybrid mode: {e}")
            
    # TODO: Add other methods (FPA, StoryPoints) similarly
    
    # 3. Aggregate
    if not estimates:
        return {"error": "No methods could be executed."}
        
    total_weighted_cost = 0.0
    total_weight = 0.0
    
    for est in estimates:
        weight = est["confidence"]
        total_weighted_cost += est["cost"] * weight
        total_weight += weight
        
    if total_weight == 0:
        composite_cost = 0.0
    else:
        composite_cost = total_weighted_cost / total_weight
        
    return {
        "composite_estimate": {
            "total_cost": round(composite_cost, 2),
            "currency": "USD",
            "confidence": round(total_weight / len(estimates), 2) # Rough approx
        },
        "breakdown": estimates,
        "disclaimer": "This is a rough order of magnitude estimate based on inferred inputs."
    }
