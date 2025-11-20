# Complete Deployment Guide: Local to CSC Rahti

This guide provides step-by-step instructions for deploying any web application to CSC Rahti (OpenShift) platform, from local development to production hosting.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Containerization](#docker-containerization)
4. [CSC Rahti Setup](#csc-rahti-setup)
5. [Deployment Process](#deployment-process)
6. [Verification & Troubleshooting](#verification--troubleshooting)
7. [Best Practices](#best-practices)

---

## Prerequisites

### Required Software
- **Docker Desktop** - For containerization
- **OpenShift CLI (oc)** - For Rahti cluster management
- **Git** - For version control
- **Node.js** (if using Node.js projects)
- **Your preferred code editor**

### CSC Rahti Access
- Active CSC account with Rahti access
- Rahti project/namespace created
- OpenShift authentication token

---

## Local Development Setup

### 1. Project Structure
Ensure your project follows a standard structure:
```
your-project/
├── frontend/          # Frontend application
├── backend/           # Backend application (if applicable)
├── Dockerfile         # Container configuration
├── docker-compose.yml # Local development setup
├── .env.example       # Environment variables template
└── README.md          # Project documentation
```

### 2. Environment Configuration
Create environment files for different stages:
```bash
# .env.local (for local development)
NODE_ENV=development
PORT=3000
BACKEND_URL=http://localhost:3001

# .env.production (for production)
NODE_ENV=production
PORT=3000
BACKEND_URL=http://your-backend-service:3001
```

### 3. Local Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

---

## Docker Containerization

### 1. Create Dockerfile

#### Frontend Dockerfile (Next.js Example)
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set user and permissions
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start application
CMD ["node", "server.js"]
```

#### Backend Dockerfile (Node.js Example)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Set permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["node", "index.js"]
```

### 2. Docker Compose for Local Development
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
```

### 3. Build and Test Locally
```bash
# Build Docker images
docker build -t your-project-frontend ./frontend
docker build -t your-project-backend ./backend

# Test locally with Docker Compose
docker-compose up -d

# Verify applications are running
curl http://localhost:3000  # Frontend
curl http://localhost:3001/health  # Backend health check
```

---

## CSC Rahti Setup

### 1. Install OpenShift CLI
```bash
# macOS
brew install openshift-cli

# Linux
wget https://mirror.openshift.com/pub/openshift-v4/clients/oc/latest/linux/oc.tar.gz
tar -xzf oc.tar.gz
sudo mv oc /usr/local/bin/

# Verify installation
oc version
```

### 2. Login to Rahti Cluster
```bash
# Get login command from Rahti web console
oc login https://api.2.rahti.csc.fi:6443

# Or use token-based login
oc login https://api.2.rahti.csc.fi:6443 --token=YOUR_TOKEN
```

### 3. Create Project/Namespace
```bash
# Create new project
oc new-project your-project-name

# Or use existing project
oc project your-project-name
```

### 4. Get Registry Information
```bash
# Get internal registry URL
oc registry info --internal

# Get external registry URL
oc registry info

# Login to Docker registry
oc whoami -t | docker login docker-registry.2.rahtiapp.fi -u $(oc whoami) --password-stdin
```

---

## Deployment Process

### 1. Build Multi-Platform Images
```bash
# Create buildx builder for multi-platform builds
docker buildx create --name multiplatform --use

# Build for linux/amd64 (required for OpenShift)
docker buildx build \
  --platform linux/amd64 \
  --tag your-project-frontend:latest \
  --push \
  ./frontend

docker buildx build \
  --platform linux/amd64 \
  --tag your-project-backend:latest \
  --push \
  ./backend
```

### 2. Tag Images for Rahti Registry
```bash
# Tag for Rahti registry
docker tag your-project-frontend:latest \
  docker-registry.2.rahtiapp.fi/your-project/your-project-frontend:latest

docker tag your-project-backend:latest \
  docker-registry.2.rahtiapp.fi/your-project/your-project-backend:latest

# Push to Rahti registry
docker push docker-registry.2.rahtiapp.fi/your-project/your-project-frontend:latest
docker push docker-registry.2.rahtiapp.fi/your-project/your-project-backend:latest
```

### 3. Create OpenShift Resources

#### Backend Deployment
```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-project-backend
  labels:
    app: your-project-backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: your-project-backend
  template:
    metadata:
      labels:
        app: your-project-backend
    spec:
      containers:
      - name: backend
        image: docker-registry.2.rahtiapp.fi/your-project/your-project-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: your-project-backend
spec:
  selector:
    app: your-project-backend
  ports:
  - protocol: TCP
    port: 3001
    targetPort: 3001
```

#### Frontend Deployment
```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-project-frontend
  labels:
    app: your-project-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: your-project-frontend
  template:
    metadata:
      labels:
        app: your-project-frontend
    spec:
      containers:
      - name: frontend
        image: docker-registry.2.rahtiapp.fi/your-project/your-project-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: BACKEND_URL
          value: "http://your-project-backend:3001"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: your-project-frontend
spec:
  selector:
    app: your-project-frontend
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
---
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: your-project-frontend
spec:
  to:
    kind: Service
    name: your-project-frontend
  port:
    targetPort: 3000
  tls:
    termination: edge
```

### 4. Deploy to OpenShift
```bash
# Apply backend resources
oc apply -f backend-deployment.yaml

# Apply frontend resources
oc apply -f frontend-deployment.yaml

# Check deployment status
oc get deployments
oc get pods
oc get services
oc get routes
```

### 5. Alternative: Direct oc Commands
```bash
# Create deployment directly
oc new-app docker-registry.2.rahtiapp.fi/your-project/your-project-backend:latest \
  --name=your-project-backend \
  --env=NODE_ENV=production,PORT=3001

oc new-app docker-registry.2.rahtiapp.fi/your-project/your-project-frontend:latest \
  --name=your-project-frontend \
  --env=NODE_ENV=production,PORT=3000,BACKEND_URL=http://your-project-backend:3001

# Expose frontend publicly
oc expose service your-project-frontend
```

---

## Verification & Troubleshooting

### 1. Check Deployment Status
```bash
# Check all resources
oc get all

# Check pod status
oc get pods -l app=your-project-frontend
oc get pods -l app=your-project-backend

# Check logs
oc logs deployment/your-project-frontend
oc logs deployment/your-project-backend

# Check events
oc get events --sort-by='.lastTimestamp'
```

### 2. Test Application
```bash
# Get public URL
oc get route your-project-frontend -o jsonpath='{.spec.host}'

# Test endpoints
curl https://your-project-frontend-your-project.2.rahtiapp.fi
curl https://your-project-frontend-your-project.2.rahtiapp.fi/api/health
```

### 3. Common Issues & Solutions

#### ImagePullBackOff Error
```bash
# Check image exists in registry
oc get imagestream your-project-frontend

# Verify image tags
docker images | grep your-project

# Rebuild and push image
docker buildx build --platform linux/amd64 --tag your-project-frontend:latest --push ./
```

#### Pod CrashLoopBackOff
```bash
# Check pod logs
oc logs pod/your-project-frontend-xxxxx

# Check pod description
oc describe pod your-project-frontend-xxxxx

# Common fixes:
# - Check environment variables
# - Verify health check endpoints
# - Check resource limits
```

#### Service Connection Issues
```bash
# Check service endpoints
oc get endpoints your-project-backend

# Test internal connectivity
oc run debug --image=busybox --rm -it -- wget -qO- http://your-project-backend:3001/health
```

---

## Best Practices

### 1. Security
- Use non-root users in containers
- Keep base images updated
- Use specific image tags (not `latest`)
- Implement proper health checks
- Use secrets for sensitive data

### 2. Performance
- Optimize Docker image size
- Use multi-stage builds
- Implement proper caching strategies
- Set appropriate resource limits
- Use horizontal pod autoscaling

### 3. Monitoring
- Implement comprehensive logging
- Set up health check endpoints
- Monitor resource usage
- Use OpenShift monitoring tools
- Implement alerting

### 4. CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: Deploy to Rahti

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build and push Docker image
      run: |
        docker buildx build --platform linux/amd64 --tag your-project:latest --push ./
    
    - name: Deploy to OpenShift
      run: |
        oc set image deployment/your-project your-project=docker-registry.2.rahtiapp.fi/your-project/your-project:latest
```

### 5. Environment Management
- Use separate namespaces for dev/staging/prod
- Implement proper configuration management
- Use ConfigMaps and Secrets
- Version your deployments

---

## Quick Reference Commands

### Essential Docker Commands
```bash
# Build image
docker build -t your-app:latest .

# Run container
docker run -p 3000:3000 your-app:latest

# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t your-app:latest .
```

### Essential OpenShift Commands
```bash
# Login
oc login https://api.2.rahti.csc.fi:6443

# Create project
oc new-project your-project

# Deploy app
oc new-app your-image:latest

# Expose service
oc expose service your-service

# Get logs
oc logs deployment/your-deployment

# Scale deployment
oc scale deployment/your-deployment --replicas=3
```

---

## Summary

This guide provides a complete workflow for deploying any web application to CSC Rahti:

1. **Local Development** → Set up project with proper structure
2. **Docker Containerization** → Create optimized Docker images
3. **CSC Rahti Setup** → Configure OpenShift access and registry
4. **Deployment** → Deploy using OpenShift resources
5. **Verification** → Test and troubleshoot deployment

Following this guide ensures reliable, scalable deployments on the CSC Rahti platform while maintaining best practices for security, performance, and maintainability.

For project-specific adaptations, modify the Docker configurations and environment variables according to your application's requirements.
