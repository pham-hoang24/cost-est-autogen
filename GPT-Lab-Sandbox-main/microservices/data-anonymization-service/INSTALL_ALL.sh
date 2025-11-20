#!/bin/bash

echo "🚀 GDPR Anonymization Service - Complete Installation Script"
echo "============================================================"
echo "This script will install ALL dependencies and set up the entire application"
echo ""

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

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    print_error "Please run this script from the root directory of the project"
    exit 1
fi

print_status "Starting complete installation process..."

# Check system requirements
print_status "Checking system requirements..."

# Check Python version
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    print_success "Python 3 found: $(python3 --version)"
    if [[ $(echo "$PYTHON_VERSION < 3.10" | bc -l) -eq 1 ]]; then
        print_warning "Python version $PYTHON_VERSION detected. Python 3.10+ is recommended."
    fi
else
    print_error "Python 3 is not installed. Please install Python 3.10+ first."
    exit 1
fi

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    print_success "Node.js found: $(node --version)"
    if [[ $NODE_VERSION -lt 18 ]]; then
        print_warning "Node.js version $NODE_VERSION detected. Node.js 18+ is recommended."
    fi
else
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    print_success "npm found: $(npm --version)"
else
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

echo ""
print_status "System requirements check completed!"
echo ""

# =============================================================================
# BACKEND INSTALLATION
# =============================================================================

print_status "🔧 Setting up Backend..."
echo "================================"

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip, setuptools, and wheel
print_status "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

# Install requirements
print_status "Installing Python dependencies from requirements.txt..."
if pip install -r requirements.txt; then
    print_success "Python dependencies installed successfully"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

# Install spacy language models
print_status "Installing spacy language models..."
if python -m spacy download en_core_web_sm; then
    print_success "Spacy small model installed"
else
    print_warning "Failed to install spacy small model"
fi

if python -m spacy download en_core_web_lg; then
    print_success "Spacy large model installed"
else
    print_warning "Failed to install spacy large model"
fi

# Verify backend installation
print_status "Verifying backend installation..."
if python -c "import fastapi, uvicorn, presidio_analyzer, presidio_anonymizer, spacy, pandas, numpy, PyPDF2, docx, openpyxl, faker; print('All backend packages imported successfully!')" 2>/dev/null; then
    print_success "Backend installation verified successfully"
else
    print_warning "Some backend packages may not be properly installed"
fi

cd ..
echo ""

# =============================================================================
# FRONTEND INSTALLATION
# =============================================================================

print_status "🎨 Setting up Frontend..."
echo "================================"

cd frontend

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
if npm install; then
    print_success "Node.js dependencies installed successfully"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# Verify frontend installation
print_status "Verifying frontend installation..."
if npm list react react-dom typescript @types/react @types/react-dom @mui/material @emotion/react @emotion/styled 2>/dev/null; then
    print_success "Frontend installation verified successfully"
else
    print_warning "Some frontend packages may not be properly installed"
fi

cd ..
echo ""

# =============================================================================
# ENVIRONMENT CONFIGURATION
# =============================================================================

print_status "⚙️ Setting up Environment Configuration..."
echo "================================================"

# Create environment files if they don't exist
if [ ! -f "frontend/.env.local" ]; then
    print_status "Creating local environment configuration..."
    cat > frontend/.env.local << EOF
# Local Development Environment
REACT_APP_API_BASE_URL=http://localhost:4002
REACT_APP_FRONTEND_PORT=4001
REACT_APP_BACKEND_PORT=4002
EOF
    print_success "Local environment file created"
fi

if [ ! -f "frontend/.env.sandbox" ]; then
    print_status "Creating sandbox environment configuration..."
    cat > frontend/.env.sandbox << EOF
# Sandbox Environment
REACT_APP_API_BASE_URL=http://86.50.169.115:4002
REACT_APP_FRONTEND_PORT=4001
REACT_APP_BACKEND_PORT=4002
EOF
    print_success "Sandbox environment file created"
fi

if [ ! -f "frontend/.env.production" ]; then
    print_status "Creating production environment configuration..."
    cat > frontend/.env.production << EOF
# Production Environment
REACT_APP_API_BASE_URL=http://86.50.169.115:4002
REACT_APP_FRONTEND_PORT=4001
REACT_APP_BACKEND_PORT=4002
EOF
    print_success "Production environment file created"
fi

echo ""

# =============================================================================
# INSTALLATION SUMMARY
# =============================================================================

print_status "📋 Installation Summary"
echo "=========================="

echo ""
print_success "✅ Backend Setup Complete:"
echo "   - Python virtual environment created and activated"
echo "   - All Python dependencies installed"
echo "   - Spacy language models installed"
echo "   - FastAPI, Presidio, and all required packages ready"

echo ""
print_success "✅ Frontend Setup Complete:"
echo "   - Node.js dependencies installed"
echo "   - React, TypeScript, Material-UI ready"
echo "   - Environment configuration files created"

echo ""
print_success "✅ Environment Configuration:"
echo "   - .env.local (localhost development)"
echo "   - .env.sandbox (sandbox integration)"
echo "   - .env.production (production deployment)"

echo ""
print_status "🚀 Ready to Run!"
echo "=================="
echo ""
echo "To start the application:"
echo ""
echo "1. For Local Development:"
echo "   ./deploy.sh"
echo ""
echo "2. For Sandbox Deployment:"
echo "   ./deploy_sandbox_integration.sh"
echo ""
echo "3. Manual Start:"
echo "   # Terminal 1 (Backend):"
echo "   cd backend && source venv/bin/activate && python run.py"
echo ""
echo "   # Terminal 2 (Frontend):"
echo "   cd frontend && PORT=4001 REACT_APP_API_BASE_URL=http://localhost:4002 npm start"
echo ""
echo "Access URLs:"
echo "   Frontend: http://localhost:4001"
echo "   Backend:  http://localhost:4002"
echo "   API Docs: http://localhost:4002/docs"
echo ""

print_success "🎉 Complete installation finished successfully!"
print_status "Your GDPR Anonymization Service is ready to use!"
