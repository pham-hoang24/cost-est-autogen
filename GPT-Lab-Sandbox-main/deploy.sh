#!/bin/bash

# SW4E Sandbox CSC Deployment Script
# Quick fix for deployment issues

echo "🚀 Starting SW4E Sandbox CSC Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install docker-compose."
    exit 1
fi

echo "✅ Docker environment ready"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.simple.yml down 2>/dev/null || true

# Clean up old images (optional)
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.simple.yml up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose -f docker-compose.simple.yml ps | grep -q "Up"; then
    echo "✅ Services are running!"
    
    # Test endpoints
    echo "🧪 Testing endpoints..."
    
    # Test backend health
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "✅ Backend is healthy"
    else
        echo "⚠️  Backend health check failed"
    fi
    
    # Test frontend
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend is accessible"
    else
        echo "⚠️  Frontend check failed"
    fi
    
    echo ""
    echo "🎉 Deployment successful!"
    echo "📊 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:3001"
    echo "💊 Health: http://localhost:3001/health"
    echo ""
    echo "📋 To view logs: docker-compose -f docker-compose.simple.yml logs"
    echo "🛑 To stop: docker-compose -f docker-compose.simple.yml down"
    
else
    echo "❌ Services failed to start"
    echo "📋 Check logs: docker-compose -f docker-compose.simple.yml logs"
    exit 1
fi
