#!/bin/bash

echo "🚀 Deploying GDPR Anonymization Service for Sandbox Integration"
echo "=============================================================="

# Set sandbox environment variables
export REACT_APP_API_BASE_URL=http://86.50.169.115:4002
export REACT_APP_FRONTEND_PORT=4001
export REACT_APP_BACKEND_PORT=4002
export HOST=0.0.0.0
export PORT=4002
export CORS_ORIGINS=http://86.50.169.115:4001,http://localhost:4001,http://localhost:3000

echo "📋 Environment Configuration:"
echo "  Frontend URL: http://86.50.169.115:4001"
echo "  Backend URL: http://86.50.169.115:4002"
echo "  CORS Origins: $CORS_ORIGINS"
echo ""

# Backend Setup
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
# Install dependencies using the comprehensive installation script
echo "📦 Installing all dependencies..."
chmod +x ../install_dependencies.sh
../install_dependencies.sh

# Start backend
echo "🚀 Starting Backend on port 4002..."
python run.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 10

# Check if backend is running
if curl -s http://localhost:4002/api/v1/health > /dev/null; then
    echo "✅ Backend is running successfully"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Frontend Setup
echo ""
echo "🔧 Setting up Frontend..."
cd ../frontend

# Copy sandbox environment file
echo "Setting up sandbox environment configuration..."
cp .env.sandbox .env

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Start frontend
echo "🚀 Starting Frontend on port 4001..."
PORT=4001 REACT_APP_API_BASE_URL=http://86.50.169.115:4002 npm start &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 15

# Check if frontend is running
if lsof -i :4001 > /dev/null; then
    echo "✅ Frontend is running successfully"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "🎉 Sandbox Integration Deployment Complete!"
echo "=========================================="
echo "Frontend: http://86.50.169.115:4001"
echo "Backend:  http://86.50.169.115:4002"
echo "API Docs: http://86.50.169.115:4002/docs"
echo ""
echo "Process IDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "To stop services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "✅ Ready for team integration!"
