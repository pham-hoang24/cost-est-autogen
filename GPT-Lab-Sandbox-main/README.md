# 🚀 GPT-Lab's Sandbox Platform

A comprehensive platform for academic research, industry collaboration, and AI service integration. Built with Next.js, Express, and Docker for easy deployment to CSC Rahti or any container platform.

## **📖 Overview**

GPT-Lab's Sandbox provides a unified platform for:
- **Academic Research**: Data management, collaboration tools, and research project management
- **Industry Partnerships**: Company onboarding and academia-industry collaboration
- **AI Services**: Integrated AI/ML tools including LLM playground, data preprocessing, and model benchmarking
- **Role-Based Access**: Customized experiences for researchers, students, administrators, and industry partners

## **🎯 Key Features**

### **🗄️ Data Management Hub**
A comprehensive platform for managing, processing, and analyzing research data with built-in compliance and security features.

#### **Data Sources Integration**
- **Avoindata.fi**: Finland's open data portal with government datasets
  - Direct API integration for automated data fetching
  - Real-time updates and synchronization
  - Metadata extraction and cataloging

- **Statistics Finland (Tilastokeskus)**: Official statistical data
  - Demographic, economic, and social statistics
  - Time-series data with historical records
  - Export in multiple formats (CSV, JSON, XML)

- **THL Sotkanet**: Healthcare and welfare indicators
  - Public health statistics and regional data
  - Disease surveillance and health behavior data
  - Visualization and trend analysis tools

- **Findata**: Health and social data permit authority
  - Secure data access workflows
  - Compliance tracking for sensitive data
  - Audit trails and access logging

- **FSD (Finnish Social Science Data Archive)**: Research data repository
  - Survey data and research datasets
  - Codebooks and documentation
  - Citation and reference management

- **EU Open Data Portal**: European Union datasets
  - Cross-border research data
  - Multi-language support
  - Standardized metadata schemas

- **ELIXIR Finland**: Life sciences data infrastructure
  - Bioinformatics and genomics data
  - Computational biology tools integration
  - Federated data access

#### **Interactive Data Processing**
- **Visual Workflow Builder**: Drag-and-drop interface for data pipelines
  - Pre-built processing nodes (filter, transform, aggregate, merge)
  - Custom Python/R script nodes
  - Conditional branching and parallel processing
  - Save and share workflow templates

- **Real-Time Monitoring**: Track data processing jobs
  - Live progress indicators
  - Resource usage metrics (CPU, memory, storage)
  - Error detection and alerting
  - Processing logs and debugging tools

- **Data Transformation Tools**:
  - Schema mapping and data type conversion
  - Missing value handling and imputation
  - Outlier detection and cleaning
  - Data normalization and standardization
  - Feature engineering and extraction

#### **Compliance & Security**
- **GDPR Compliance Tools**:
  - Data inventory and classification
  - Personal data detection and masking
  - Consent management tracking
  - Data retention policy enforcement
  - Right to erasure workflows

- **EU AI Act Compliance**:
  - AI system risk assessment
  - Documentation requirements checker
  - Transparency and explainability tools
  - Human oversight mechanisms
  - Quality management system tracking

- **Quality Metrics Dashboard**:
  - Data completeness scores
  - Accuracy and consistency metrics
  - Timeliness indicators
  - Validity checks and rules
  - Automated quality reports

#### **Analytics & Insights**
- **Usage Analytics**: Track data access patterns and user behavior
- **Performance Metrics**: Monitor processing efficiency and bottlenecks
- **Data Lineage**: Visualize data flow from source to output
- **Export & Reporting**: Generate compliance and quality reports

---

### **🧠 AI Services Catalog**
An integrated suite of AI/ML tools and services for research, development, and production use.

#### **LLM Playground**
A comprehensive environment for experimenting with large language models.

- **Multi-Model Support**:
  - OpenAI GPT models (GPT-3.5, GPT-4, GPT-4-Turbo)
  - Anthropic Claude models (Claude 3 Opus, Sonnet, Haiku)
  - Open-source models (Llama 2, Mistral, Falcon)
  - Custom fine-tuned models

- **Interactive Testing**:
  - Real-time chat interface with conversation history
  - Prompt engineering tools and templates
  - Parameter tuning (temperature, top-p, max tokens, frequency penalty)
  - System message customization
  - Multi-turn conversation support

- **Advanced Features**:
  - Function calling and tool integration
  - JSON mode for structured outputs
  - Streaming responses for real-time feedback
  - Token counting and cost estimation
  - Response caching for optimization

- **Evaluation Tools**:
  - Side-by-side model comparison
  - Batch testing with test suites
  - Quality metrics (coherence, relevance, accuracy)
  - Export conversations for analysis

#### **Model Benchmarking**
Comprehensive tools for evaluating and comparing ML models.

- **Performance Metrics**:
  - Classification: Accuracy, Precision, Recall, F1-Score, AUC-ROC
  - Regression: MSE, RMSE, MAE, R², MAPE
  - Clustering: Silhouette Score, Davies-Bouldin Index
  - Custom metric definitions

- **Benchmarking Suite**:
  - Standard datasets for consistent comparison
  - Cross-validation and holdout testing
  - Statistical significance testing
  - Performance vs. resource trade-offs

- **Visualization**:
  - Confusion matrices and ROC curves
  - Learning curves and convergence plots
  - Feature importance analysis
  - Model comparison charts

- **Resource Profiling**:
  - Training time and inference latency
  - Memory usage and GPU utilization
  - Scalability testing
  - Cost-performance analysis

#### **Data Preprocessing Pipeline**
Automated tools for preparing data for machine learning.

- **Data Cleaning**:
  - Duplicate detection and removal
  - Missing value imputation (mean, median, mode, KNN, MICE)
  - Outlier detection (IQR, Z-score, Isolation Forest)
  - Invalid data correction

- **Feature Engineering**:
  - Categorical encoding (one-hot, label, target, ordinal)
  - Numerical scaling (standardization, normalization, robust scaling)
  - Feature creation (polynomial, interaction terms)
  - Time-series features (lag, rolling, seasonality)
  - Text features (TF-IDF, embeddings, n-grams)

- **Data Transformation**:
  - Log, square root, Box-Cox transformations
  - Dimensionality reduction (PCA, t-SNE, UMAP)
  - Feature selection (mutual information, recursive elimination)
  - Balancing techniques (SMOTE, undersampling, class weights)

- **Pipeline Management**:
  - Save and reuse preprocessing pipelines
  - Version control for transformations
  - Apply pipelines to new data
  - Export as Python/R code

#### **Security Scanner**
Automated security analysis and vulnerability detection.

- **Code Security Analysis**:
  - Static code analysis for vulnerabilities
  - Dependency vulnerability scanning
  - Secret detection (API keys, passwords, tokens)
  - Code pattern analysis for security anti-patterns

- **Infrastructure Security**:
  - Container image scanning
  - Configuration security checks
  - Network security analysis
  - Access control auditing

- **Compliance Checks**:
  - OWASP Top 10 vulnerability detection
  - CWE (Common Weakness Enumeration) mapping
  - Security best practices validation
  - Automated remediation suggestions

- **Reporting**:
  - Severity-based vulnerability prioritization
  - Detailed remediation guides
  - Trend analysis and security metrics
  - Integration with issue tracking systems

#### **Compliance Auditor**
End-to-end compliance verification and audit management.

- **Audit Framework**:
  - Customizable audit checklists
  - Automated compliance testing
  - Evidence collection and documentation
  - Gap analysis and recommendations

- **Regulatory Coverage**:
  - GDPR (General Data Protection Regulation)
  - EU AI Act requirements
  - ISO 27001 information security
  - SOC 2 compliance checks

- **Audit Trail**:
  - Complete activity logging
  - Change tracking and versioning
  - User action history
  - Timestamped evidence records

- **Reporting & Certification**:
  - Compliance status dashboards
  - Automated report generation
  - Executive summaries
  - Audit-ready documentation

---

### **🤝 Collaboration Features**
Tools and platforms to facilitate academic-industry collaboration and research partnerships.

#### **Academic Hub**
Centralized platform for academic researchers and institutions.

- **Research Project Management**:
  - Project creation with detailed metadata
  - Team member management and role assignment
  - Milestone tracking and deadlines
  - Budget tracking and resource allocation
  - Document repository with version control

- **Publication Management**:
  - Track publications linked to projects
  - Citation tracking and metrics
  - Open access compliance
  - Preprint and peer review status
  - Co-author collaboration tools

- **Research Tools Integration**:
  - Reference management (Zotero, Mendeley integration)
  - Data analysis notebooks (Jupyter, R Markdown)
  - Version control (Git integration)
  - Computational resources access

- **Academic Network**:
  - Researcher profiles and expertise directories
  - Collaboration discovery based on interests
  - Internal messaging and discussion forums
  - Event calendar and seminar announcements

#### **Company Hub**
Streamlined onboarding and management for industry partners.

- **Company Onboarding**:
  - Guided registration process
  - Company profile creation
  - Business sector and interest areas
  - Technology needs assessment
  - Partnership preference settings

- **Partnership Management**:
  - Active collaboration dashboard
  - Project proposals and contracts
  - Intellectual property agreements
  - NDA and confidentiality management
  - Joint funding applications

- **Resource Sharing**:
  - Access to academic datasets (with permissions)
  - Shared computational resources
  - Knowledge transfer programs
  - Training and workshop opportunities

- **Industry Insights**:
  - Market research and trends
  - Technology readiness assessments
  - Innovation opportunities
  - Success stories and case studies

#### **Collaboration Discovery Platform**
Intelligent matching system for researchers and industry partners.

- **Smart Matching**:
  - AI-powered recommendation engine
  - Expertise and need matching
  - Technology alignment scoring
  - Geographic and sector filtering
  - Collaboration history analysis

- **Search & Browse**:
  - Advanced search with filters
  - Keyword and semantic search
  - Browse by research area, industry, location
  - Save searches and get alerts

- **Connection Tools**:
  - Direct messaging and inquiries
  - Video conferencing integration
  - Virtual meeting scheduler
  - Collaboration proposal templates
  - Letter of intent workflows

- **Success Tracking**:
  - Connection analytics
  - Partnership conversion rates
  - Collaboration outcomes tracking
  - Impact measurement tools

#### **Resource Sharing**
Centralized management of shared resources and hardware.

- **Hardware Request System**:
  - GPU/TPU cluster access requests
  - High-performance computing (HPC) allocation
  - Cloud credits and budget management
  - Priority and queue management
  - Usage monitoring and reporting

- **Software Licenses**:
  - Shared software license pool
  - License checkout system
  - Usage tracking and compliance
  - Cost allocation by project

- **Data Storage**:
  - Project-based storage allocation
  - Tiered storage (hot, warm, cold)
  - Backup and disaster recovery
  - Data lifecycle management

- **Knowledge Repository**:
  - Shared documentation and guides
  - Best practices and tutorials
  - Code repositories and libraries
  - Reusable workflows and templates

---

### **📊 User Dashboard**
Personalized workspace tailored to each user's role and needs.

#### **Role-Based Access Control**
Different interfaces and permissions for various user types:

- **System Administrator**:
  - Full platform access and configuration
  - User management (create, modify, deactivate)
  - Role and permission assignment
  - System health monitoring
  - Audit logs and security reports
  - Resource allocation and quotas
  - Billing and usage analytics

- **Organization Administrator**:
  - Manage organization members
  - Project approval workflows
  - Resource allocation within organization
  - Organization-level analytics
  - Budget management
  - Compliance reporting

- **Project Administrator**:
  - Create and manage projects
  - Add/remove team members
  - Set project permissions
  - Monitor project resources
  - Track milestones and deliverables
  - Generate project reports

- **Researcher**:
  - Access to data sources and AI services
  - Create and run experiments
  - Manage research projects
  - Collaborate with team members
  - Request computational resources
  - Publish and share results

- **Student/Trainee**:
  - Learning resources access
  - Tutorial and sandbox environments
  - Limited computational resources
  - Course project workspaces
  - Mentorship connections

- **Industry Partner**:
  - Company dashboard
  - Collaboration proposals
  - Access to relevant datasets
  - Partnership tracking
  - IP and contract management

#### **Project Management Tools**

- **Project Creation & Setup**:
  - Project templates for common scenarios
  - Metadata and documentation
  - Team assembly and invitations
  - Resource requirements specification
  - Timeline and milestone planning

- **Task Management**:
  - Kanban boards and task lists
  - Task assignment and tracking
  - Dependencies and blockers
  - Progress indicators
  - Deadline reminders

- **Collaboration**:
  - Team chat and discussions
  - File sharing and version control
  - Meeting notes and decisions
  - Shared workspaces
  - Activity feeds and notifications

- **Progress Tracking**:
  - Milestone completion tracking
  - Deliverable submission
  - Time tracking and effort logging
  - Budget vs. actual spending
  - Risk and issue management

#### **Hardware & Resource Management**

- **Request Workflow**:
  - Hardware request form (GPUs, CPUs, memory, storage)
  - Justification and estimated usage
  - Priority level setting
  - Approval workflow routing
  - Notification on approval/rejection

- **Active Resources**:
  - Currently allocated resources
  - Usage metrics and quotas
  - Extend or release resources
  - Cost tracking
  - Efficiency recommendations

- **Resource History**:
  - Past resource allocations
  - Usage patterns analysis
  - Cost history
  - Optimization suggestions

- **Scheduling**:
  - Reserve resources in advance
  - Queue position tracking
  - Automatic allocation on availability
  - Calendar integration

#### **Analytics & Insights**

- **Personal Analytics**:
  - Activity summary (projects, tasks, collaborations)
  - Resource usage trends
  - Publication metrics
  - Collaboration network visualization

- **Project Analytics**:
  - Project health indicators
  - Team productivity metrics
  - Resource utilization efficiency
  - Timeline adherence
  - Budget burn rate

- **Organization Analytics** (for admins):
  - User engagement metrics
  - Popular services and features
  - Resource allocation patterns
  - Cost optimization opportunities
  - ROI on collaborations

- **Custom Reports**:
  - Report builder with drag-and-drop
  - Scheduled report delivery
  - Export in multiple formats (PDF, Excel, CSV)
  - Shareable dashboards

## **🚀 Quick Start**

### **Prerequisites**
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Ports 3000 and 3001 available
- Minimum 2GB RAM, 5GB disk space

### **Local Development**

**1. Start Backend (Port 3001):**
```bash
cd /Users/svm648/SW4E-Sandbox
PORT=3001 node simple-backend.js
```

**2. Start Frontend (Port 3000):**
```bash
cd sandbox/ui
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm ci
npm run build
npm run start -- -p 3000
```

**3. Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### **Docker Deployment**

**Build and run with Docker Compose:**
```bash
docker-compose up --build
```

**Or use the automated deployment script:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## **📁 Project Structure**

```
GPT-Lab-Sandbox/
├── sandbox/ui/                  # Main Next.js frontend
├── csc-deployment/ui/          # CSC Rahti deployment version
├── microservices/              # AI service microservices
├── simple-backend.js           # Express backend server
├── docker-compose.yml          # Docker orchestration
├── Dockerfile.backend          # Backend container config
├── deploy.sh                   # Deployment automation
├── DEPLOYMENT_GUIDE.md         # Comprehensive deployment guide
└── README.md                   # This file
```

## **🔧 Configuration**

### **Environment Variables**

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend:**
```bash
PORT=3001
NODE_ENV=production
```

### **Docker Environment**
Configure in `docker-compose.yml`:
- Backend port: 8080 (configurable)
- Frontend port: 3000 (configurable)
- Network: Bridge mode for inter-service communication

## **🌐 Deployment**

### **CSC Rahti (OpenShift)**

For detailed CSC Rahti deployment instructions, see **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**.

**Quick deployment steps:**
1. Build Docker image
2. Push to Rahti registry
3. Deploy to OpenShift
4. Configure routes and services

**Current Production URL:**
- https://gptlab-frontend-gptlab-sandbox.2.rahtiapp.fi

### **Other Cloud Platforms**

The platform can be deployed to:
- AWS ECS/EKS
- Google Cloud Run/GKE
- Azure Container Instances/AKS
- Any Kubernetes cluster
- Any Docker host

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for platform-specific instructions.

## **🛠️ Development**

### **Tech Stack**
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Authentication**: JWT-based (mock in development)
- **Containerization**: Docker, Docker Compose

### **Key Dependencies**
- `next`: React framework with SSR
- `express`: Backend server framework
- `lucide-react`: Icon library
- `recharts`: Data visualization
- `tailwindcss`: Utility-first CSS

### **Development Commands**
```bash
# Install dependencies
cd sandbox/ui && npm ci

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## **🔒 Security**

- Role-based access control (RBAC)
- JWT authentication ready
- HTTPS/TLS support
- Environment variable protection
- Input validation and sanitization
- Security headers configured

## **🧪 Testing**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testPathPattern=auth
```

## **📊 Monitoring & Health Checks**

**Backend Health Endpoint:**
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-12T10:30:00.000Z"
}
```

## **🐛 Troubleshooting**

### **Port Conflicts**
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :3001

# Kill process on port
kill -9 $(lsof -t -i:3000)
```

### **Docker Issues**
```bash
# Clean Docker system
docker-compose down
docker system prune -f

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f
```

### **Frontend Build Errors**
```bash
# Clear Next.js cache
rm -rf sandbox/ui/.next

# Reinstall dependencies
rm -rf sandbox/ui/node_modules
cd sandbox/ui && npm ci
```

### **Backend Connection Issues**
```bash
# Test backend directly
curl http://localhost:3001/health

# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env | grep PORT
```

## **🌍 Internationalization (i18n)**

GPT-Lab's Sandbox supports **15 languages** out of the box, making it accessible to researchers and organizations worldwide.

### **Supported Languages**

| Language | Native Name | Code | Direction |
|----------|-------------|------|-----------|
| English | English | `en` | LTR |
| Chinese | 中文 | `zh` | LTR |
| Arabic | العربية | `ar` | RTL |
| Spanish | Español | `es` | LTR |
| French | Français | `fr` | LTR |
| German | Deutsch | `de` | LTR |
| Russian | Русский | `ru` | LTR |
| Japanese | 日本語 | `ja` | LTR |
| Portuguese | Português | `pt` | LTR |
| Hindi | हिन्दी | `hi` | LTR |
| Finnish | Suomi | `fi` | LTR |
| Swedish | Svenska | `sv` | LTR |
| Korean | 한국어 | `ko` | LTR |
| Italian | Italiano | `it` | LTR |
| Turkish | Türkçe | `tr` | LTR |

### **Features**

- **🎯 Easy Language Selection**: Dropdown menu in the navigation bar
- **💾 Persistent Preferences**: Language choice saved in browser localStorage
- **🔄 Dynamic Switching**: Change language without page reload
- **↔️ RTL Support**: Automatic right-to-left layout for Arabic and other RTL languages
- **🌐 Browser Detection**: Automatically detects and sets user's browser language
- **📝 Comprehensive Coverage**: All key UI elements translated

### **Usage**

**For Users:**
1. Click the language selector in the top navigation bar
2. Choose your preferred language from the dropdown
3. The interface updates immediately
4. Your preference is saved for future visits

**For Developers:**

```typescript
// Use the translation hook in any component
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

### **Adding New Languages**

1. Add language configuration in `src/lib/i18n/config.ts`:
```typescript
{ code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', direction: 'ltr' }
```

2. Add translations in `src/lib/i18n/translations.ts`:
```typescript
nl: {
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  // ... more translations
}
```

### **Translation Keys**

Organized by category:
- `nav.*` - Navigation menu items
- `home.*` - Homepage content
- `features.*` - Feature descriptions
- `dashboard.*` - Dashboard elements
- `services.*` - AI service names
- `common.*` - Common UI elements (buttons, labels, etc.)

### **File Structure**

```
src/
├── lib/
│   └── i18n/
│       ├── config.ts         # Language configurations
│       └── translations.ts   # All translation strings
├── contexts/
│   └── LanguageContext.tsx   # Language state management
└── components/
    └── LanguageSelector.tsx  # Language dropdown UI
```

---

## **📚 Documentation**

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Comprehensive deployment instructions
- **[TASK4_MVP_FOCUSED.md](./TASK4_MVP_FOCUSED.md)** - MVP feature documentation
- **API Documentation**: Available at `/api/docs` when server is running

## **🤝 Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## **📝 Version History**

- **v0.4** - Help & Info page removal, UI cleanup
- **v0.3** - Complete SW4E rebranding to GPT-Lab's
- **v0.2** - Homepage simplification and application focus
- **v0.1** - Initial release with core features

## **📧 Support**

For questions, issues, or contributions:
- **Repository**: https://github.com/GPT-Laboratory/GPT-Lab-Sandbox
- **Issues**: https://github.com/GPT-Laboratory/GPT-Lab-Sandbox/issues

## **📄 License**

This project is part of GPT-Laboratory research initiative.

---

**Built with ❤️ for Academic Research and Innovation**
