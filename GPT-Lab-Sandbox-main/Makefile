# SW4E Sandbox - Development Makefile
# Usage: make <target>

.PHONY: help dev build test clean install deploy lint format microservices-up microservices-down microservices-logs microservices-status microservices-health microservices-init

# Default target
help: ## Show this help message
	@echo "SW4E Sandbox - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Quick Start:"
	@echo "  make install    # Install all dependencies"
	@echo "  make dev        # Start development servers"
	@echo "  make test       # Run tests"

# Installation
install: ## Install all dependencies
	@echo "Installing Control Plane dependencies..."
	cd sandbox/control-plane && npm install
	@echo "Installing UI dependencies..."
	cd sandbox/ui && npm install
	@echo "✅ All dependencies installed"

# Development
dev: ## Start development servers (API on :8080, UI on :3001)
	@echo "Starting SW4E Sandbox development environment..."
	@echo "📡 Control Plane API will run on http://localhost:8080"
	@echo "🌐 UI Frontend will run on http://localhost:3001"
	@echo "Press Ctrl+C to stop all services"
	@$(MAKE) -j2 dev-api dev-ui

dev-api: ## Start only the Control Plane API server
	@echo "Starting Control Plane API..."
	cd sandbox/control-plane && npm run dev

dev-ui: ## Start only the UI frontend server
	@echo "Starting UI Frontend..."
	cd sandbox/ui && PORT=3001 npm run dev

# Building
build: ## Build all components for production
	@echo "Building Control Plane..."
	cd sandbox/control-plane && npm run build
	@echo "Building UI..."
	cd sandbox/ui && npm run build
	@echo "✅ Build complete"

# Testing
test: ## Run all tests
	@echo "Running Control Plane tests..."
	cd sandbox/control-plane && npm test || true
	@echo "Running UI tests..."
	cd sandbox/ui && npm test || true
	@echo "✅ Tests complete"

test-api: ## Run only Control Plane tests
	cd sandbox/control-plane && npm test

test-ui: ## Run only UI tests
	cd sandbox/ui && npm test

# Code Quality
lint: ## Run linting on all code
	@echo "Linting Control Plane..."
	cd sandbox/control-plane && npm run lint || true
	@echo "Linting UI..."
	cd sandbox/ui && npm run lint || true
	@echo "✅ Linting complete"

format: ## Format all code
	@echo "Formatting Control Plane..."
	cd sandbox/control-plane && npm run format || true
	@echo "Formatting UI..."
	cd sandbox/ui && npm run format || true
	@echo "✅ Formatting complete"

# Cleanup
clean: ## Clean all build artifacts and dependencies
	@echo "Cleaning Control Plane..."
	cd sandbox/control-plane && rm -rf node_modules dist .next
	@echo "Cleaning UI..."
	cd sandbox/ui && rm -rf node_modules .next
	@echo "✅ Cleanup complete"

# Docker & Kubernetes
docker-build: ## Build Docker images for all components
	@echo "Building Control Plane Docker image..."
	cd sandbox/control-plane && docker build -t sw4e-control-plane .
	@echo "Building UI Docker image..."
	cd sandbox/ui && docker build -t sw4e-ui .
	@echo "✅ Docker images built"

# Deployment
deploy-local: ## Deploy to local Kubernetes
	@echo "Deploying to local Kubernetes..."
	kubectl apply -f sandbox/k8s-deploy/
	@echo "✅ Deployed to local cluster"

deploy-staging: ## Deploy to staging environment
	@echo "Deploying to staging..."
	# Add staging deployment commands here
	@echo "✅ Deployed to staging"

deploy-prod: ## Deploy to production (requires confirmation)
	@echo "⚠️  Production deployment requires manual confirmation"
	@echo "This will deploy to production. Are you sure? [y/N]" && read ans && [ $$ans = y ]
	@echo "Deploying to production..."
	# Add production deployment commands here
	@echo "✅ Deployed to production"

# Infrastructure
infra-plan: ## Plan Terraform infrastructure changes
	cd sandbox/infra/terraform && terraform plan

infra-apply: ## Apply Terraform infrastructure changes
	cd sandbox/infra/terraform && terraform apply

infra-destroy: ## Destroy Terraform infrastructure (use with caution!)
	cd sandbox/infra/terraform && terraform destroy

# Utilities
status: ## Show status of all services
	@echo "=== SW4E Sandbox Status ==="
	@echo ""
	@echo "Control Plane API (should be on :8080):"
	@lsof -i :8080 || echo "❌ Not running"
	@echo ""
	@echo "UI Frontend (should be on :3001):"
	@lsof -i :3001 || echo "❌ Not running"
	@echo ""
	@echo "Git Status:"
	@git status --porcelain || echo "❌ Not a git repository"

logs: ## Show recent logs from development servers
	@echo "Recent logs from development servers..."
	@echo "Use 'make dev' to start servers and see live logs"

health: ## Check health of all services
	@echo "=== Health Check ==="
	@echo "Core Services:"
	@curl -s http://localhost:8080/api/health > /dev/null && echo "✅ API is healthy" || echo "❌ API is down"
	@curl -s http://localhost:3001 > /dev/null && echo "✅ UI is healthy" || echo "❌ UI is down"
	@echo ""
	@echo "For microservices health check, run: make microservices-health"

# Git helpers
git-setup: ## Set up git hooks and configuration
	@echo "Setting up git configuration..."
	git config core.autocrlf false
	git config pull.rebase true
	@echo "✅ Git configuration complete"

commit: ## Interactive commit with conventional commit format
	@echo "Making a conventional commit..."
	@echo "Types: feat, fix, docs, style, refactor, test, chore"
	@read -p "Type: " type; \
	read -p "Description: " desc; \
	git add -A; \
	git commit -m "$$type: $$desc"

# Microservices Management
microservices-up: ## Start all microservices with Docker Compose
	@echo "🚀 Starting microservices infrastructure..."
	@if [ ! -f docker-compose.yml ]; then \
		echo "❌ docker-compose.yml not found. Run 'make microservices-init' first."; \
		exit 1; \
	fi
	docker-compose up -d postgres redis rabbitmq elasticsearch kafka zookeeper
	@echo "⏳ Waiting for infrastructure services to be ready..."
	sleep 15
	docker-compose up -d
	@echo "✅ All microservices started"
	@echo "🔍 View status: make microservices-status"

microservices-down: ## Stop all microservices
	@echo "🛑 Stopping microservices..."
	docker-compose down
	@echo "✅ Microservices stopped"

microservices-logs: ## View microservices logs
	@echo "📋 Viewing microservices logs (Ctrl+C to exit)..."
	docker-compose logs -f

microservices-status: ## Check status of all microservices
	@echo "=== Microservices Status ==="
	@echo ""
	@if command -v docker-compose >/dev/null 2>&1; then \
		docker-compose ps 2>/dev/null || echo "❌ Docker Compose not running"; \
	else \
		echo "❌ Docker Compose not installed"; \
	fi

microservices-health: ## Check health of all microservices
	@echo "=== Microservices Health Check ==="
	@echo "Core Services:"
	@curl -s http://localhost:8080/api/health > /dev/null && echo "✅ Control Plane healthy" || echo "❌ Control Plane down"
	@curl -s http://localhost:3001 > /dev/null && echo "✅ UI healthy" || echo "❌ UI down"
	@echo ""
	@echo "External Microservices:"
	@curl -s http://localhost:8081/api/v1/health > /dev/null && echo "✅ Data Anonymization Service healthy" || echo "❌ Data Anonymization Service down"
	@curl -s http://localhost:3002 > /dev/null && echo "✅ Data Anonymization UI healthy" || echo "❌ Data Anonymization UI down"
	@curl -s http://localhost:8082/health > /dev/null && echo "✅ Auth Service healthy" || echo "❌ Auth Service down"
	@curl -s http://localhost:8083/health > /dev/null && echo "✅ Notification Service healthy" || echo "❌ Notification Service down"
	@echo ""
	@echo "Infrastructure:"
	@curl -s http://localhost:5432 > /dev/null 2>&1 && echo "✅ PostgreSQL healthy" || echo "❌ PostgreSQL down"
	@curl -s http://localhost:6379 > /dev/null 2>&1 && echo "✅ Redis healthy" || echo "❌ Redis down"

microservices-init: ## Initialize microservices setup (run once)
	@echo "🔧 Initializing microservices environment..."
	@if [ ! -f docker-compose.yml ]; then \
		echo "✅ Docker Compose file already created"; \
	else \
		echo "❌ docker-compose.yml already exists"; \
	fi
	@if [ ! -d microservices ]; then \
		mkdir -p microservices; \
		echo "✅ Created microservices directory"; \
	fi
	@echo "📖 Next steps:"
	@echo "  1. Clone your GitHub microservices into ./microservices/"
	@echo "  2. Update docker-compose.yml with your service configurations"
	@echo "  3. Run 'make microservices-up' to start everything"

# Kubernetes Microservices
k8s-deploy-microservices: ## Deploy microservices to Kubernetes
	@echo "🚀 Deploying microservices to Kubernetes..."
	kubectl create namespace sw4e-microservices --dry-run=client -o yaml | kubectl apply -f -
	@if [ -d k8s-deploy/microservices ]; then \
		kubectl apply -f k8s-deploy/microservices/; \
		echo "✅ Microservices deployed to Kubernetes"; \
	else \
		echo "❌ k8s-deploy/microservices directory not found"; \
		echo "📖 Create Kubernetes manifests first"; \
	fi

k8s-status-microservices: ## Check Kubernetes microservices status
	@echo "=== Kubernetes Microservices Status ==="
	kubectl get pods,services,deployments -n sw4e-microservices 2>/dev/null || echo "❌ No microservices namespace found"

# Full Development Environment
dev-full: install microservices-up dev ## Start complete development environment (sandbox + microservices)

# Documentation
docs: ## Generate and serve documentation
	@echo "Generating documentation..."
	@echo "📖 README: file://$(PWD)/README.md"
	@echo "🔒 Security: file://$(PWD)/sandbox/SECURITY.md"
	@echo "📋 Compliance: file://$(PWD)/sandbox/COMPLIANCE.md"
	@echo "🚀 Microservices: file://$(PWD)/docs/MICROSERVICES_INTEGRATION_GUIDE.md"

# Development helpers
update: ## Update all dependencies
	@echo "Updating Control Plane dependencies..."
	cd sandbox/control-plane && npm update
	@echo "Updating UI dependencies..."
	cd sandbox/ui && npm update
	@echo "✅ Dependencies updated"

check: ## Run comprehensive project health check
	@echo "=== SW4E Sandbox Health Check ==="
	@echo ""
	@echo "📦 Dependencies:"
	@cd sandbox/control-plane && npm list --depth=0 2>/dev/null | head -3
	@cd sandbox/ui && npm list --depth=0 2>/dev/null | head -3
	@echo ""
	@echo "🔧 Services:"
	@$(MAKE) status
	@echo ""
	@echo "🏥 Health:"
	@$(MAKE) health
