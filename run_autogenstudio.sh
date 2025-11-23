#!/bin/bash
# Helper script to run autogenstudio with proper environment setup

cd "$(dirname "$0")"

# Activate virtual environment
source .venv/bin/activate

# Load environment variables from .env if it exists
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# If OPENROUTER_API_KEY is set but OPENAI_API_KEY is not, use OpenRouter key
# This is needed because AutoGen Studio's OpenAIChatCompletionClient expects OPENAI_API_KEY
# even when using OpenRouter (which is OpenAI-compatible)
if [ -z "$OPENAI_API_KEY" ] && [ -n "$OPENROUTER_API_KEY" ]; then
    export OPENAI_API_KEY="$OPENROUTER_API_KEY"
    echo "✓ Mapped OPENROUTER_API_KEY to OPENAI_API_KEY for AutoGen Studio compatibility"
fi

# Check if OPENAI_API_KEY is set (either directly or via OPENROUTER_API_KEY)
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: Neither OPENAI_API_KEY nor OPENROUTER_API_KEY is set!"
    echo "Please set OPENROUTER_API_KEY in your .env file:"
    echo "  OPENROUTER_API_KEY=your-openrouter-api-key"
    echo ""
    echo "Or set OPENAI_API_KEY directly:"
    echo "  OPENAI_API_KEY=your-api-key"
    exit 1
fi

echo "✓ Virtual environment activated"
echo "✓ API key configured (${OPENAI_API_KEY:0:10}...)"
echo ""
echo "Starting autogenstudio..."

# Run autogenstudio with any passed arguments
autogenstudio ui --port 8080 --appdir ./app "$@"

