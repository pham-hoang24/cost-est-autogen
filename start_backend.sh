#!/bin/bash
set -e

echo "🚀 Starting Cost Estimation Backend..."
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✓ Virtual environment activated"
fi

# Install any missing dependencies
echo "📦 Checking dependencies..."
pip install -q -r requirements.txt --pre 2>/dev/null || true
pip install -q fastapi uvicorn 2>/dev/null || true

# Start the server
echo "✓ Starting FastAPI server on http://localhost:8000"
echo "   Press Ctrl+C to stop"
echo ""
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
