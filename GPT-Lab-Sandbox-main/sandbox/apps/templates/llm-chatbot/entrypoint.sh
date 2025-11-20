#!/bin/bash

# LLM Chatbot Template Entrypoint
# This script sets up and runs the lightweight LLM chatbot

echo "🚀 Starting Lightweight LLM Chatbot..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python $python_version is too old. Please install Python $required_version+ and try again."
    exit 1
fi

echo "✅ Python $python_version detected"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create models directory
mkdir -p models

# Check if models are available
echo "🤖 Checking available models..."
if [ ! -f "models/.models_ready" ]; then
    echo "📥 Models not downloaded yet. The system will use fallback responses initially."
    echo "💡 To download models, use the web interface or run:"
    echo "   curl -X POST http://localhost:8000/api/models/tiny-llama-1b/load"
    touch models/.models_ready
else
    echo "✅ Models directory ready"
fi

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export MODEL_CACHE_DIR="$(pwd)/models"

# Start the application
echo "🌟 Starting LLM Chatbot on http://localhost:8000"
echo "📱 Access the chatbot at: http://localhost:8000"
echo "🎯 Access the demo page at: http://localhost:8000/demo"
echo "🔍 Health check at: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the application
python3 app.py
