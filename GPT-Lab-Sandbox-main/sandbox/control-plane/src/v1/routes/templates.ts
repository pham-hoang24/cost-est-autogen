import { Router } from 'express';
import { DeploymentService, DeploymentRequest } from '../../services/deployment.js';

const router = Router();
const deploymentService = new DeploymentService();

// Get all available templates
router.get('/', async (req, res) => {
  try {
    const templates = [
      {
        id: 'llm-chatbot',
        name: 'Lightweight LLM Chatbot',
        description: 'Practical chatbot using small open-source LLMs for different tasks',
        icon: '🤖',
        category: 'AI',
        resources: {
          cpu: '4',
          memory: '8Gi',
          gpu: '1',
          storage: '50GB'
        },
        tags: ['LLM', 'Chatbot', 'AI', 'Python', 'FastAPI', 'Lightweight'],
        features: ['Interactive Web UI', 'Multi-task Support', 'Real Deployment', 'GPU Optimization', 'Demo Mode'],
        estimatedStartup: '5-7 minutes'
      },
      {
        id: 'llm-rag-starter',
        name: 'LLM RAG Starter',
        description: 'LangChain + FAISS/Chroma; Q/A eval; token/latency logs',
        icon: '🤖',
        category: 'AI',
        resources: {
          cpu: '2',
          memory: '4Gi',
          gpu: '1',
          storage: '10GB'
        },
        tags: ['LLM', 'RAG', 'NLP', 'Vector Search'],
        features: ['Jupyter Notebook', 'VS Code', 'MLflow', 'Prefect'],
        estimatedStartup: '2-3 minutes'
      },
      {
        id: 'mlops-lab',
        name: 'MLOps Lab',
        description: 'scikit-learn; Prefect pipeline; MLflow model registry',
        icon: '🔬',
        category: 'ML',
        resources: {
          cpu: '2',
          memory: '4Gi',
          gpu: '0',
          storage: '8GB'
        },
        tags: ['MLOps', 'scikit-learn', 'Prefect', 'MLflow'],
        features: ['Jupyter Notebook', 'VS Code', 'MLflow', 'Prefect'],
        estimatedStartup: '1-2 minutes'
      },
      {
        id: 'se-productivity-bench',
        name: 'SE Productivity Bench',
        description: 'small repo; tests + static analysis; compare AI-assist vs baseline',
        icon: '⚡',
        category: 'Productivity',
        resources: {
          cpu: '1',
          memory: '2Gi',
          gpu: '0',
          storage: '5GB'
        },
        tags: ['Software Engineering', 'Testing', 'Analysis', 'Productivity'],
        features: ['VS Code', 'Git', 'Testing Tools', 'Analysis Tools'],
        estimatedStartup: '1 minute'
      },
      {
        id: 'healthcare-safe',
        name: 'Healthcare Safe Sandbox',
        description: 'synthetic notes; PII detection/de-ID with quality report',
        icon: '🏥',
        category: 'Healthcare',
        resources: {
          cpu: '2',
          memory: '4Gi',
          gpu: '0',
          storage: '15GB'
        },
        tags: ['Healthcare', 'PII', 'NLP', 'Privacy'],
        features: ['Jupyter Notebook', 'VS Code', 'Privacy Tools', 'Quality Reports'],
        estimatedStartup: '2-3 minutes'
      },
      {
        id: 'iot-timeseries',
        name: 'Industrial IoT Forecast',
        description: 'synthetic multivariate timeseries; MAPE + anomaly metrics',
        icon: '🏭',
        category: 'IoT',
        resources: {
          cpu: '2',
          memory: '4Gi',
          gpu: '0',
          storage: '12GB'
        },
        tags: ['IoT', 'Time Series', 'Forecasting', 'Anomaly Detection'],
        features: ['Jupyter Notebook', 'VS Code', 'Time Series Tools', 'Visualization'],
        estimatedStartup: '2 minutes'
      },
      {
        id: 'teaching-101',
        name: 'Teaching 101',
        description: 'locked packages; nbgrader/autograder; reset on exit',
        icon: '📚',
        category: 'Education',
        resources: {
          cpu: '1',
          memory: '2Gi',
          gpu: '0',
          storage: '8GB'
        },
        tags: ['Education', 'Teaching', 'Grading', 'Automation'],
        features: ['Jupyter Notebook', 'nbgrader', 'Auto-grader', 'Reset Tools'],
        estimatedStartup: '1 minute'
      }
    ];

    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

// Launch a template (create real sandbox)
router.post('/launch', async (req, res) => {
  try {
    const {
      templateId,
      projectName,
      resources,
      environment = {}
    } = req.body;

    // Validate required fields
    if (!templateId || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'templateId and projectName are required'
      });
    }

    // Get user info from headers (in production, this would come from JWT)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const userGroups = (req.headers['x-groups'] as string || '').split(',').map(g => g.trim());

    // Check if user has permission to launch templates
    const allowedGroups = ['admin', 'project-admin', 'contributor'];
    if (!userGroups.some(g => allowedGroups.includes(g))) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to launch templates'
      });
    }

    // Default resources if not specified
    const defaultResources = {
      cpu: '1',
      memory: '2Gi',
      storage: '5GB'
    };

    // For now, return a mock deployment since the deployment service is focused on LLMs
    // In the future, this could be extended to support template deployments
    const mockDeployment = {
      deploymentId: `template-${Date.now()}`,
      status: 'running',
      namespace: `sandbox-${userId}-${Date.now()}`,
      services: {
        jupyter: `jupyter-${Date.now()}`,
        vscode: `vscode-${Date.now()}`
      },
      resources: { ...defaultResources, ...resources },
      createdAt: new Date().toISOString(),
      accessUrls: {
        jupyter: `https://template-${Date.now()}.sandbox.local/jupyter`,
        vscode: `https://template-${Date.now()}.sandbox.local/vscode`
      },
      estimatedReadyTime: '2-3 minutes'
    };

          res.json({
        success: true,
        data: {
          deploymentId: mockDeployment.deploymentId,
          status: mockDeployment.status,
          namespace: mockDeployment.namespace,
          services: mockDeployment.services,
          resources: mockDeployment.resources,
          createdAt: mockDeployment.createdAt,
          accessUrls: {
            jupyter: `https://${mockDeployment.deploymentId}.sandbox.local/jupyter`,
            vscode: `https://${mockDeployment.deploymentId}.sandbox.local/vscode`
          },
          estimatedReadyTime: '2-3 minutes'
        },
        message: 'Template deployment started successfully'
      });

      } catch (error) {
      console.error('Error launching template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({
        success: false,
        error: `Failed to launch template: ${errorMessage}`
      });
    }
});

// Get deployment status
router.get('/:deploymentId/status', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const namespace = req.query.namespace as string;

    if (!namespace) {
      return res.status(400).json({
        success: false,
        error: 'namespace query parameter is required'
      });
    }

    // Mock deployment status for templates
    const status = {
      deploymentId,
      status: 'running',
      namespace,
      services: {
        jupyter: `jupyter-${deploymentId}`,
        vscode: `vscode-${deploymentId}`
      },
      resources: {
        cpu: '1',
        memory: '2Gi',
        storage: '5GB'
      },
      createdAt: new Date().toISOString(),
      accessUrls: {
        jupyter: `https://${deploymentId}.sandbox.local/jupyter`,
        vscode: `https://${deploymentId}.sandbox.local/vscode`
      },
      estimatedReadyTime: '2-3 minutes'
    };

    res.json({
      success: true,
      data: status
    });

      } catch (error) {
      console.error('Error getting deployment status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({
        success: false,
        error: `Failed to get deployment status: ${errorMessage}`
      });
    }
});

// Stop deployment
router.delete('/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const namespace = req.query.namespace as string;

    if (!namespace) {
      return res.status(400).json({
        success: false,
        error: 'namespace query parameter is required'
      });
    }

    // Mock stop deployment for templates
    console.log(`Stopping template deployment ${deploymentId} in namespace ${namespace}`);

    res.json({
      success: true,
      message: 'Deployment stopped successfully'
    });

      } catch (error) {
      console.error('Error stopping deployment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({
        success: false,
        error: `Failed to stop deployment: ${errorMessage}`
      });
    }
});

export { router as templatesRouter };


