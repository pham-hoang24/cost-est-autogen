"""
workflow/inference_config.py
=============================

Configurable parameters for all estimation metric inference algorithms.
All constants are based on industry benchmarks and can be tuned based on
empirical data from real projects.
"""

from pydantic import BaseModel, Field
from typing import Dict


class FPInferenceConfig(BaseModel):
    """Function Point inference parameters for a specific project type."""
    inputs_per_feature: float = Field(description="Average External Inputs per feature")
    outputs_per_feature: float = Field(description="Average External Outputs per feature")
    inquiries_per_feature: float = Field(description="Average External Inquiries per feature")
    files_per_feature: float = Field(description="Average Internal Logical Files per feature")
    interfaces_per_feature: float = Field(description="Average External Interface Files per feature")


# ============================================================================
# KSLOC INFERENCE PARAMETERS
# ============================================================================

# Base KLOC per feature by complexity
# These represent thousands of lines of code per feature
BASE_KSLOC_PER_FEATURE = {
    "low": 0.3,        # 300 LOC per feature (simple CRUD, basic UI)
    "medium": 0.7,     # 700 LOC per feature (moderate business logic)
    "high": 1.5,       # 1.5K LOC per feature (complex algorithms, integrations)
    "very high": 3.0   # 3K LOC per feature (AI/ML, complex data processing)
}

# Tech stack multipliers
# Reflects how certain technologies increase/decrease code volume
TECH_STACK_MULTIPLIERS = {
    "ai": 1.3,         # AI/ML requires more infrastructure code
    "ml": 1.3,
    "ai/ml": 1.3,
    "enterprise": 1.2,  # Enterprise patterns add boilerplate
    "cloud": 1.1,      # Cloud deployments add config/infrastructure
    "web": 1.0,        # Baseline
    "mobile": 0.9,     # Mobile apps tend to be more focused
    "embedded": 0.8    # Embedded systems are typically smaller
}

# Domain complexity multipliers
# Different problem domains have different code density
DOMAIN_MULTIPLIERS = {
    "data_platform": 1.4,      # Data pipelines, transformations, quality
    "ai_ml_product": 1.3,      # ML models, training, serving infrastructure
    "enterprise_integration": 1.2,  # Multiple systems, adapters, protocols
    "fintech": 1.2,            # Security, compliance, transaction handling
    "healthcare": 1.2,         # HIPAA compliance, complex workflows
    "ecommerce": 1.1,          # Catalog, cart, payment, inventory
    "crud_app": 0.8,           # Basic create/read/update/delete
    "content_site": 0.6,       # Mostly static content, simple CMS
    "default": 1.0
}


# ============================================================================
# FUNCTION POINT INFERENCE PARAMETERS
# ============================================================================

# FP component counts per feature vary significantly by project type
FP_CONFIGS: Dict[str, FPInferenceConfig] = {
    "web_crm": FPInferenceConfig(
        inputs_per_feature=3.5,      # Forms, data entry
        outputs_per_feature=3.0,     # Reports, exports
        inquiries_per_feature=2.5,   # Search, lookups
        files_per_feature=0.7,       # Database tables
        interfaces_per_feature=0.4   # External APIs
    ),
    "mobile_app": FPInferenceConfig(
        inputs_per_feature=2.5,      # Touch inputs, gestures
        outputs_per_feature=2.0,     # Screen outputs
        inquiries_per_feature=3.0,   # More user interactions
        files_per_feature=0.4,       # Smaller local storage
        interfaces_per_feature=0.5   # API integrations
    ),
    "ai_ml": FPInferenceConfig(
        inputs_per_feature=1.5,      # Fewer traditional inputs
        outputs_per_feature=1.5,     # Model outputs, predictions
        inquiries_per_feature=1.0,   # Query interfaces
        files_per_feature=1.2,       # Datasets, models, features
        interfaces_per_feature=0.8   # External data sources
    ),
    "ecommerce": FPInferenceConfig(
        inputs_per_feature=3.0,      # Product data, orders
        outputs_per_feature=2.5,     # Invoices, confirmations
        inquiries_per_feature=3.5,   # Product search, filtering
        files_per_feature=0.8,       # Products, orders, customers
        interfaces_per_feature=0.6   # Payment, shipping APIs
    ),
    "enterprise": FPInferenceConfig(
        inputs_per_feature=3.2,      # Complex forms
        outputs_per_feature=2.8,     # Reports, dashboards
        inquiries_per_feature=2.0,   # Business queries
        files_per_feature=1.0,       # Multiple entities
        interfaces_per_feature=0.7   # System integrations
    ),
    "default": FPInferenceConfig(
        inputs_per_feature=3.0,
        outputs_per_feature=2.5,
        inquiries_per_feature=2.0,
        files_per_feature=0.5,
        interfaces_per_feature=0.3
    )
}


# ============================================================================
# STORY POINTS INFERENCE PARAMETERS
# ============================================================================

# Story points per feature by complexity
# Based on typical team velocity and feature sizing
STORY_POINTS_PER_FEATURE = {
    "low": 5,          # Simple features (basic CRUD)
    "medium": 8,       # Moderate features (business logic)
    "high": 13,        # Complex features (integrations, algorithms)
    "very high": 21    # Very complex (AI/ML, security-critical)
}

# Feature size adjustments based on description keywords
FEATURE_SIZE_ADJUSTMENTS = {
    "simple": 0.7,
    "basic": 0.8,
    "standard": 1.0,
    "complex": 1.3,
    "advanced": 1.5,
    "critical": 1.4
}


# ============================================================================
# TEAM VELOCITY INFERENCE PARAMETERS
# ============================================================================

# Base velocity per developer per sprint (story points)
# Assumes experienced team, 2-week sprints
BASE_VELOCITY_PER_DEV = 8

# Team maturity factors
TEAM_MATURITY_FACTORS = {
    "new": 0.6,         # New team, learning curve
    "average": 0.8,     # Typical team
    "experienced": 1.0, # High-performing team
    "expert": 1.2       # Exceptional team with strong practices
}

# Sprint length multipliers (relative to 2-week baseline)
SPRINT_LENGTH_MULTIPLIERS = {
    1: 0.6,   # 1-week sprints have overhead
    2: 1.0,   # Baseline
    3: 1.3,   # 3-week sprints slightly more efficient
    4: 1.5    # 4-week sprints (less overhead)
}


def get_team_efficiency(team_size: int) -> float:
    """
    Calculate team efficiency based on coordination overhead.
    
    Larger teams have more communication overhead and coordination costs.
    Based on Brooks' Law and empirical studies of team productivity.
    
    Args:
        team_size: Number of team members
        
    Returns:
        Efficiency multiplier (0.0-1.0)
    """
    if team_size <= 3:
        return 1.0    # Small teams: minimal overhead
    if team_size <= 7:
        return 0.9    # Medium teams: 10% overhead
    if team_size <= 14:
        return 0.75   # Large teams: 25% overhead
    return 0.6        # Very large teams: 40% overhead


# ============================================================================
# REUSE PROFILE INFERENCE PARAMETERS
# ============================================================================

# Base reuse percentages by project type
# Represents how much existing code/design can be reused
BASE_REUSE_PROFILES: Dict[str, Dict[str, float]] = {
    "web application": {
        "design": 0.15,       # UI patterns, components
        "code": 0.10,         # Libraries, frameworks
        "integration": 0.05,  # API patterns
        "testing": 0.10       # Test frameworks, patterns
    },
    "mobile application": {
        "design": 0.10,       # Platform-specific
        "code": 0.05,         # Less mature reuse
        "integration": 0.10,  # Standard APIs
        "testing": 0.05       # Platform testing
    },
    "ai/ml project": {
        "design": 0.05,       # Novel architectures
        "code": 0.02,         # Custom algorithms
        "integration": 0.05,  # Data connectors
        "testing": 0.05       # Model validation
    },
    "system integration": {
        "design": 0.30,       # Known patterns
        "code": 0.20,         # Adapters, middlewares
        "integration": 0.15,  # Standard protocols
        "testing": 0.15       # Integration tests
    },
    "ecommerce": {
        "design": 0.20,       # Common UX patterns
        "code": 0.15,         # Payment, cart libraries
        "integration": 0.10,  # Standard APIs
        "testing": 0.12       # E2E test patterns
    },
    "default": {
        "design": 0.10,
        "code": 0.08,
        "integration": 0.05,
        "testing": 0.08
    }
}

# Organization maturity adjustments
ORG_MATURITY_ADJUSTMENTS = {
    "startup": 0.8,      # Less established patterns
    "growing": 1.0,      # Building libraries
    "mature": 1.3,       # Strong reuse culture
    "enterprise": 1.5    # Extensive reuse libraries
}


# ============================================================================
# CONFIDENCE CALCULATION PARAMETERS
# ============================================================================

# Weights for confidence calculation
CONFIDENCE_WEIGHTS = {
    "feature_count": 0.3,      # More features → better sample size
    "description_quality": 0.4, # Detailed description → better inference
    "baseline_completeness": 0.3  # Complete baseline → better context
}

# Confidence bounds
MIN_CONFIDENCE = 0.3  # Never go below this
MAX_CONFIDENCE = 0.9  # Never claim perfect inference

# Feature count thresholds for confidence
FEATURE_COUNT_THRESHOLDS = {
    "very_low": (0, 3),      # Confidence penalty
    "low": (3, 8),           # Moderate confidence
    "medium": (8, 20),       # Good confidence
    "high": (20, 100)        # High confidence
}

# Description quality scoring
DESCRIPTION_LENGTH_THRESHOLDS = {
    "very_short": (0, 50),      # < 50 chars: very vague
    "short": (50, 200),         # Brief description
    "moderate": (200, 500),     # Decent description
    "detailed": (500, 10000)    # Rich description
}


# ============================================================================
# PROJECT TYPE MAPPING
# ============================================================================

def map_project_type_to_configs(project_type: str) -> tuple[str, str]:
    """
    Map baseline project_type to domain and FP config keys.
    
    This centralizes the vocabulary mapping between:
    - User-facing project types (e.g., "web application")
    - Internal domain categories (e.g., "crud_app")
    - FP configuration keys (e.g., "web_crm")
    
    Args:
        project_type: Project type from baseline data
        
    Returns:
        Tuple of (domain_key, fp_config_key)
    """
    project_type_lower = project_type.lower().strip()
    
    # Web applications
    if "web" in project_type_lower:
        if "crm" in project_type_lower or "customer" in project_type_lower:
            return "crud_app", "web_crm"
        elif "ecommerce" in project_type_lower or "e-commerce" in project_type_lower:
            return "ecommerce", "ecommerce"
        elif "enterprise" in project_type_lower:
            return "enterprise_integration", "enterprise"
        return "crud_app", "default"
    
    # Mobile applications
    if "mobile" in project_type_lower:
        if "ecommerce" in project_type_lower:
            return "ecommerce", "mobile_app"
        return "crud_app", "mobile_app"
    
    # AI/ML projects
    if any(term in project_type_lower for term in ["ai", "ml", "machine learning", "artificial intelligence"]):
        return "ai_ml_product", "ai_ml"
    
    # System integration
    if "integration" in project_type_lower or "enterprise" in project_type_lower:
        return "enterprise_integration", "enterprise"
    
    # Data platforms
    if "data" in project_type_lower and ("platform" in project_type_lower or "analytics" in project_type_lower):
        return "data_platform", "default"
    
    # Default fallback
    return "default", "default"


def infer_domain_from_description(description: str) -> str:
    """
    Infer domain category from project description if project_type doesn't match.
    
    Args:
        description: Project description text
        
    Returns:
        Domain category key
    """
    desc_lower = description.lower()
    
    # Check for AI/ML indicators
    # Use spaces to avoid partial matches (e.g. "email" containing "ai")
    if any(f" {term} " in f" {desc_lower} " for term in ["machine learning", "ai", "neural network", "model training", "prediction"]):
        return "ai_ml_product"
    
    # Check for data platform indicators
    if any(term in desc_lower for term in ["data pipeline", "etl", "data warehouse", "analytics platform"]):
        return "data_platform"
    
    # Check for ecommerce indicators
    if any(term in desc_lower for term in ["shopping", "cart", "checkout", "product catalog", "payment"]):
        return "ecommerce"
    
    # Check for simple CRUD indicators
    if any(term in desc_lower for term in ["simple crud", "basic database", "admin panel"]):
        return "crud_app"
    
    # Check for content site indicators
    if any(term in desc_lower for term in ["blog", "cms", "content management", "wordpress"]):
        return "content_site"
    
    return "default"


__all__ = [
    "FPInferenceConfig",
    "BASE_KSLOC_PER_FEATURE",
    "TECH_STACK_MULTIPLIERS",
    "DOMAIN_MULTIPLIERS",
    "FP_CONFIGS",
    "STORY_POINTS_PER_FEATURE",
    "FEATURE_SIZE_ADJUSTMENTS",
    "BASE_VELOCITY_PER_DEV",
    "TEAM_MATURITY_FACTORS",
    "SPRINT_LENGTH_MULTIPLIERS",
    "get_team_efficiency",
    "BASE_REUSE_PROFILES",
    "ORG_MATURITY_ADJUSTMENTS",
    "CONFIDENCE_WEIGHTS",
    "MIN_CONFIDENCE",
    "MAX_CONFIDENCE",
    "FEATURE_COUNT_THRESHOLDS",
    "DESCRIPTION_LENGTH_THRESHOLDS",
    "map_project_type_to_configs",
    "infer_domain_from_description",
]
