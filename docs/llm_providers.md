# LLM Provider Configuration Guide

The cost estimation application supports multiple LLM providers and can be easily configured via environment variables.

## Supported Providers

- **OpenAI** (default) - GPT-4, GPT-3.5, GPT-4o-mini, etc.
- **Anthropic** - Claude 3.5 Sonnet, Claude 3 Opus, etc.
- **Azure OpenAI** - Azure-hosted OpenAI models
- **Google** - Gemini Pro and other Google models
- **Custom** - Any OpenAI-compatible or custom API endpoint

## Quick Start

### 1. Set Provider

Set the `LLM_PROVIDER` environment variable:

```bash
export LLM_PROVIDER=openai        # Default
export LLM_PROVIDER=anthropic
export LLM_PROVIDER=azure
export LLM_PROVIDER=google
export LLM_PROVIDER=custom
```

### 2. Configure Provider-Specific Settings

#### OpenAI (Default)

```bash
export LLM_PROVIDER=openai
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4o-mini
export LLM_TEMPERATURE=0          # Optional, defaults to 0
```

#### Anthropic (Claude)

```bash
export LLM_PROVIDER=anthropic
export ANTHROPIC_API_KEY=sk-ant-your-key-here
export ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # Optional
export LLM_TEMPERATURE=0
```

#### Azure OpenAI

```bash
export LLM_PROVIDER=azure
export AZURE_OPENAI_API_KEY=your-azure-key
export AZURE_OPENAI_API_BASE=https://your-resource.openai.azure.com
export AZURE_OPENAI_MODEL=gpt-4  # Optional
export AZURE_OPENAI_API_VERSION=2024-02-15-preview  # Optional
export LLM_TEMPERATURE=0
```

#### Google (Gemini)

```bash
export LLM_PROVIDER=google
export GOOGLE_API_KEY=your-google-key
export GOOGLE_MODEL=gemini-pro  # Optional
export LLM_TEMPERATURE=0
```

#### Custom Provider

```bash
export LLM_PROVIDER=custom
export CUSTOM_API_KEY=your-api-key
export CUSTOM_MODEL=your-model-name
export CUSTOM_API_BASE=https://your-api-endpoint.com
export CUSTOM_API_TYPE=openai  # API type: openai, anthropic, etc.
export LLM_TEMPERATURE=0
```

## Using .env File

Create a `.env` file in the project root (copy from `env.example`):

```bash
cp env.example .env
```

Then edit `.env` with your preferred provider settings.

## Programmatic Usage

You can also configure the LLM provider programmatically:

```python
from config.llm_config import get_llm_config
from app import build_workflow_team

# Use OpenAI
llm_config = get_llm_config(
    provider="openai",
    model="gpt-4",
    temperature=0,
    api_key="sk-your-key"
)

# Use Anthropic
llm_config = get_llm_config(
    provider="anthropic",
    model="claude-3-5-sonnet-20241022",
    temperature=0,
    api_key="sk-ant-your-key"
)

# Build team with custom config
manager, user_agent = build_workflow_team(llm_config)
```

## Disabling LLM (Offline Mode)

To run without LLMs (uses dummy model for testing):

```bash
export USE_WORKFLOW_LLM=0
```

Or in code:

```python
from app import build_workflow_team

# This will raise an error as LLM is required for team
# Use WorkflowOrchestrator directly for offline mode
```

## Environment Variables Reference

### Global Settings

- `LLM_PROVIDER` - Provider name: `openai`, `anthropic`, `azure`, `google`, `custom`
- `USE_WORKFLOW_LLM` - Set to `0` to disable LLM (default: `1`)
- `LLM_TEMPERATURE` - Temperature setting 0.0-2.0 (default: `0`)

### OpenAI

- `OPENAI_API_KEY` - Required
- `OPENAI_MODEL` - Model name (default: `gpt-4o-mini`)
- `OPENAI_BASE_URL` - Optional custom endpoint

### Anthropic

- `ANTHROPIC_API_KEY` - Required
- `ANTHROPIC_MODEL` - Model name (default: `claude-3-5-sonnet-20241022`)

### Azure OpenAI

- `AZURE_OPENAI_API_KEY` - Required
- `AZURE_OPENAI_API_BASE` - Required (Azure endpoint URL)
- `AZURE_OPENAI_MODEL` - Model name (default: `gpt-4`)
- `AZURE_OPENAI_API_VERSION` - API version (default: `2024-02-15-preview`)

### Google

- `GOOGLE_API_KEY` - Required
- `GOOGLE_MODEL` - Model name (default: `gemini-pro`)

### Custom

- `CUSTOM_API_KEY` - Required
- `CUSTOM_MODEL` - Required
- `CUSTOM_API_BASE` - Optional custom endpoint
- `CUSTOM_API_TYPE` - API type (default: `openai`)

## Error Handling

If configuration is invalid, the application will raise `LLMConfigError` with a helpful message:

```python
from config.llm_config import get_llm_config, LLMConfigError

try:
    config = get_llm_config(provider="openai")
except LLMConfigError as e:
    print(f"Configuration error: {e}")
```

## Examples

### Switch from OpenAI to Anthropic

```bash
# Before
export OPENAI_API_KEY=sk-...
export LLM_PROVIDER=openai

# After
export ANTHROPIC_API_KEY=sk-ant-...
export LLM_PROVIDER=anthropic
```

### Use Different Model

```bash
# Use GPT-4 instead of GPT-4o-mini
export LLM_PROVIDER=openai
export OPENAI_MODEL=gpt-4
export OPENAI_API_KEY=sk-...
```

### Test with Custom Endpoint

```bash
export LLM_PROVIDER=custom
export CUSTOM_API_KEY=your-key
export CUSTOM_MODEL=your-model
export CUSTOM_API_BASE=https://your-endpoint.com/v1
export CUSTOM_API_TYPE=openai
```


