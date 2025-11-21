"""
LLM Configuration Module
=======================

Provides flexible LLM provider configuration supporting multiple providers:
- OpenAI (default)
- Anthropic (Claude)
- Azure OpenAI
- Google (Gemini)
- OpenRouter
- Custom providers via AutoGen

Configuration is done via environment variables.
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional, Union


class LLMConfigError(Exception):
    """Raised when LLM configuration is invalid or missing."""

    pass


def get_llm_config(
    provider: Optional[str] = None,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    api_key: Optional[str] = None,
) -> Union[Dict[str, Any], bool]:
    """
    Build LLM configuration dictionary for AutoGen.

    Parameters
    ----------
    provider : str, optional
        LLM provider name: 'openai', 'anthropic', 'azure', 'google', 'openrouter', or 'custom'.
        If None, reads from LLM_PROVIDER env var (defaults to 'openai').
    model : str, optional
        Model name. If None, uses provider-specific defaults or env vars.
    temperature : float, optional
        Temperature setting. If None, uses LLM_TEMPERATURE env var (defaults to 0).
    api_key : str, optional
        API key. If None, reads from provider-specific env vars.

    Returns
    -------
    dict or bool
        LLM configuration dict for AutoGen, or False if LLM is disabled.

    Examples
    --------
    >>> # Use OpenAI (default)
    >>> config = get_llm_config()
    >>> # Use Anthropic
    >>> config = get_llm_config(provider='anthropic')
    >>> # Use Azure OpenAI
    >>> config = get_llm_config(provider='azure', model='gpt-4')
    """
    # Check if LLM is disabled
    use_llm = os.getenv("USE_WORKFLOW_LLM", "1") != "0"
    if not use_llm:
        return False

    # Determine provider
    provider = provider or os.getenv("LLM_PROVIDER", "openai").lower()

    # Get temperature (default to 0)
    temp = temperature
    if temp is None:
        temp_str = os.getenv("LLM_TEMPERATURE", "0")
        try:
            temp = float(temp_str)
        except ValueError:
            temp = 0.0

    # Build config based on provider
    if provider == "openai":
        return _get_openai_config(model, temp, api_key)
    elif provider == "anthropic":
        return _get_anthropic_config(model, temp, api_key)
    elif provider == "azure":
        return _get_azure_config(model, temp, api_key)
    elif provider == "google":
        return _get_google_config(model, temp, api_key)
    elif provider == "openrouter":
        return _get_openrouter_config(model, temp, api_key)
    elif provider == "custom":
        return _get_custom_config(model, temp, api_key)
    else:
        raise LLMConfigError(
            f"Unknown provider: {provider}. "
            f"Supported providers: openai, anthropic, azure, google, openrouter, custom"
        )


def _get_openai_config(
    model: Optional[str], temperature: float, api_key: Optional[str]
) -> Dict[str, Any]:
    """Build OpenAI configuration."""
    api_key = api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise LLMConfigError(
            "OpenAI API key not found. Set OPENAI_API_KEY environment variable."
        )

    model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    return {
        "model": model,
        "temperature": temperature,
        "api_key": api_key,
        "base_url": os.getenv("OPENAI_BASE_URL"),  # For custom endpoints
    }


def _get_anthropic_config(
    model: Optional[str], temperature: float, api_key: Optional[str]
) -> Dict[str, Any]:
    """Build Anthropic (Claude) configuration."""
    api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise LLMConfigError(
            "Anthropic API key not found. Set ANTHROPIC_API_KEY environment variable."
        )

    model = model or os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

    return {
        "model": model,
        "temperature": temperature,
        "api_key": api_key,
        "api_type": "anthropic",
    }


def _get_azure_config(
    model: Optional[str], temperature: float, api_key: Optional[str]
) -> Dict[str, Any]:
    """Build Azure OpenAI configuration."""
    api_key = api_key or os.getenv("AZURE_OPENAI_API_KEY")
    if not api_key:
        raise LLMConfigError(
            "Azure OpenAI API key not found. Set AZURE_OPENAI_API_KEY environment variable."
        )

    model = model or os.getenv("AZURE_OPENAI_MODEL", "gpt-4")
    api_base = os.getenv("AZURE_OPENAI_API_BASE")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

    if not api_base:
        raise LLMConfigError(
            "Azure OpenAI API base URL not found. Set AZURE_OPENAI_API_BASE environment variable."
        )

    return {
        "model": model,
        "temperature": temperature,
        "api_key": api_key,
        "api_base": api_base,
        "api_version": api_version,
        "api_type": "azure",
    }


def _get_google_config(
    model: Optional[str], temperature: float, api_key: Optional[str]
) -> Dict[str, Any]:
    """Build Google (Gemini) configuration."""
    api_key = api_key or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise LLMConfigError(
            "Google API key not found. Set GOOGLE_API_KEY environment variable."
        )

    model = model or os.getenv("GOOGLE_MODEL", "gemini-pro")

    return {
        "model": model,
        "temperature": temperature,
        "api_key": api_key,
        "api_type": "google",
    }


def _get_openrouter_config(
    model: Optional[str], temperature: float, api_key: Optional[str]
) -> Dict[str, Any]:
    """Build OpenRouter configuration."""
    api_key = api_key or os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise LLMConfigError(
            "OpenRouter API key not found. Set OPENROUTER_API_KEY environment variable."
        )

    model = model or os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

    return {
        "model": model,
        "temperature": temperature,
        "api_key": api_key,
        "base_url": "https://openrouter.ai/api/v1",
    }


def _get_custom_config(
    model: Optional[str], temperature: float, api_key: Optional[str]
) -> Dict[str, Any]:
    """Build custom provider configuration."""
    api_key = api_key or os.getenv("CUSTOM_API_KEY")
    if not api_key:
        raise LLMConfigError(
            "Custom API key not found. Set CUSTOM_API_KEY environment variable."
        )

    model = model or os.getenv("CUSTOM_MODEL")
    if not model:
        raise LLMConfigError(
            "Custom model not specified. Set CUSTOM_MODEL environment variable."
        )

    api_base = os.getenv("CUSTOM_API_BASE")
    api_type = os.getenv("CUSTOM_API_TYPE", "openai")  # Default to OpenAI-compatible

    config = {
        "model": model,
        "temperature": temperature,
        "api_key": api_key,
        "api_type": api_type,
    }

    if api_base:
        config["api_base"] = api_base

    return config


def get_default_llm_config() -> Union[Dict[str, Any], bool]:
    """
    Get default LLM configuration from environment variables.

    This is the main entry point for getting LLM config in the application.
    Returns False if LLM is disabled, otherwise returns config dict or raises LLMConfigError.
    """
    # Check if LLM is disabled first
    use_llm = os.getenv("USE_WORKFLOW_LLM", "1") != "0"
    if not use_llm:
        return False
    
    # Try to get config - will raise LLMConfigError if invalid
    return get_llm_config()


__all__ = [
    "get_llm_config",
    "get_default_llm_config",
    "LLMConfigError",
]

