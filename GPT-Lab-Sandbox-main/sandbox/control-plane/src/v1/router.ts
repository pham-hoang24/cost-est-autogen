import { Router } from 'express';
import { datasetsRouter } from './routes/datasets.js';
import { experimentsRouter } from './routes/experiments.js';
import { projectsRouter } from './routes/projects.js';
import { templatesRouter } from './routes/templates.js';
import { servicesRouter } from './routes/services.js';
import { governanceRouter } from './routes/governance.js';
import { authRouter } from './routes/auth.js';
import { dataCatalogRouter } from './routes/data-catalog.js';
import { aiServicesRouter } from './routes/ai-services.js';
import { accessControlRouter } from './routes/accessControl.js';
import organizationsRouter from './routes/organizations.js';
import simpleGovernanceRouter from './routes/simple-governance.js';
import { meRouter } from './routes/me.js';
import { privacyRouter } from './routes/privacy.js';
import { aiCapabilitiesRouter } from './routes/ai-capabilities.js';
import { llmRouter } from './routes/llm.js';
import llmChatbotRouter from './routes/llm-chatbot.js';
import dataAnonymizationRouter from './routes/data-anonymization.js';
import microservicesRouter from './routes/microservices.js';
import { aiComplianceRouter } from './routes/ai-compliance.js';
import { securityRouter } from './routes/security.js';
import { collaborationRouter } from './routes/collaboration.js';

const router = Router();

// Authentication endpoints (no auth required)
router.use('/auth', authRouter);

// Organization management endpoints
router.use('/organizations', organizationsRouter);

// Simple governance endpoints (no auth required for testing)
router.use('/simple-governance', simpleGovernanceRouter);

// Enhanced API endpoints
router.use('/datasets', datasetsRouter);
router.use('/experiments', experimentsRouter);
router.use('/projects', projectsRouter);
router.use('/templates', templatesRouter);
router.use('/services', servicesRouter);
router.use('/governance', governanceRouter);
router.use('/me', meRouter);
router.use('/privacy', privacyRouter);

// New AI capabilities endpoints
router.use('/ai', aiCapabilitiesRouter);

// New governance and compliance endpoints
router.use('/governance', governanceRouter);

// LLM management and experiments
router.use('/llm', llmRouter);

// LLM Chatbot integration
router.use('/llm-chatbot', llmChatbotRouter);

// Data Anonymization & Privacy Compliance
router.use('/data-anonymization', dataAnonymizationRouter);

// Microservices Management
router.use('/microservices', microservicesRouter);

// Data Catalog Management
router.use('/data-catalog', dataCatalogRouter);

// AI Services Management
router.use('/ai-services', aiServicesRouter);

// Access Control Management
router.use('/access-control', accessControlRouter);

// EU AI Act Compliance
router.use('/ai-compliance', aiComplianceRouter);

// Security Monitoring
router.use('/security', securityRouter);

// Collaboration Features
router.use('/collaboration', collaborationRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
          features: [
        'enhanced-data-management',
        'ai-capabilities',
        'governance-compliance',
        'collaboration',
        'eu-ai-act-compliance',
        'data-anonymization',
        'privacy-compliance',
        'microservices-management'
      ]
  });
});

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'SW4E Sandbox API',
    version: '2.0.0',
    description: 'Enhanced AI Research Sandbox with EU AI Act Compliance',
    endpoints: {
      datasets: {
        description: 'Data management with governance and compliance',
        methods: ['GET', 'POST'],
        features: ['upload', 'compliance', 'lineage']
      },
      experiments: {
        description: 'AI experiment management and execution',
        methods: ['GET', 'POST'],
        features: ['assessment', 'preprocessing', 'execution', 'results']
      },
      projects: {
        description: 'Project management with collaboration',
        methods: ['GET', 'POST', 'PATCH'],
        features: ['creation', 'collaboration', 'governance', 'compliance']
      },
      templates: {
        description: 'Research environment templates',
        methods: ['GET', 'POST'],
        features: ['launch', 'management', 'monitoring']
      },
  services: {
    description: 'Integrated microservices and research services',
    methods: ['GET', 'POST'],
    features: ['launch', 'status', 'management', 'integration']
  },
  auth: {
    description: 'User authentication and authorization',
    methods: ['GET', 'POST'],
    features: ['signup', 'login', 'logout', 'user-approval', 'session-management']
  },
  governance: {
    description: 'Enterprise governance and compliance management',
    methods: ['GET', 'POST', 'PUT'],
    features: ['user-management', 'approval-workflows', 'resource-quotas', 'audit-trail', 'compliance-monitoring']
  },
      llm: {
        description: 'LLM model management and experiments',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        features: ['model-deployment', 'inference', 'experiments', 'providers', 'ollama', 'csc', 'huggingface']
      },
      'llm-chatbot': {
        description: 'Interactive LLM chatbot for demos and testing',
        methods: ['GET'],
        features: ['interactive-chat', 'demo-mode', 'task-processing', 'presentation-ready']
      },
      'data-anonymization': {
        description: 'Data anonymization and privacy compliance engine',
        methods: ['GET', 'POST', 'DELETE'],
        features: ['pii-detection', 'k-anonymity', 'l-diversity', 'differential-privacy', 'gdpr-compliance', 'eu-ai-act-compliance', 'audit-trail', 'synthetic-data']
      }
    },
    compliance: {
      euAIAct: true,
      gdpr: true,
      dataGovernance: true,
      auditTrail: true
    }
  });
});

export { router };


