#!/bin/bash
# Activate venv and set API key
source .venv/bin/activate

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# If OPENROUTER_API_KEY is set but OPENAI_API_KEY is not, use OpenRouter key
if [ -z "$OPENAI_API_KEY" ] && [ -n "$OPENROUTER_API_KEY" ]; then
    export OPENAI_API_KEY="$OPENROUTER_API_KEY"
fi

echo "Environment setup complete!"
echo "OPENAI_API_KEY is ${OPENAI_API_KEY:0:10}..."
