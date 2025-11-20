#!/bin/bash

# 🚀 Data Anonymization Service Deployment Script
# This script sets up and deploys the complete service

set -e

echo "🚀 Starting Data Anonymization Service Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    if ! docker --version > /dev/null 2>&1; then
        print_error "Docker is not installed or not running. Please install Docker first."
        exit 1
    fi
    
    if ! docker-compose --version > /dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop any existing services
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Services started successfully!"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for backend
    print_status "Waiting for backend service..."
    until curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Backend service is ready!"
    
    # Wait for frontend
    print_status "Waiting for frontend service..."
    until curl -f http://localhost:3000 > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Frontend service is ready!"
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_success "🎉 Deployment Complete!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 API Documentation:     http://localhost:8000/docs"
    echo ""
    echo "📋 Useful Commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Update services: docker-compose pull && docker-compose up -d"
}

# Main deployment flow
main() {
    echo "🛡️  Data Anonymization Service"
    echo "================================"
    echo ""
    
    check_docker
    deploy_services
    wait_for_services
    show_status
}

# Run main function
main "$@"
