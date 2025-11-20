import { Router } from 'express';
import { LLMService } from '../../services/llm.js';

const router = Router();
const llmService = new LLMService();

// LLM Provider Types
export type LLMProvider = 'ollama' | 'csc' | 'huggingface' | 'openai' | 'anthropic' | 'local' | 'custom';

// Model Deployment Status
export type DeploymentStatus = 'pending' | 'deploying' | 'running' | 'stopped' | 'error' | 'scaling';

// Model Interface
export interface LLMModel {
  id: string;
  name: string;
  version: string;
  provider: LLMProvider;
  source: {
    type: 'local' | 'remote' | 'csc' | 'huggingface' | 'custom';
    url?: string;
    repository?: string;
    modelId?: string;
    apiKey?: string;
  };
  deployment: {
    status: DeploymentStatus;
    replicas: number;
    resources: {
      cpu: string;
      memory: string;
      gpu?: string;
    };
    endpoint?: string;
    healthCheck?: string;
  };
  metadata: {
    size: number;
    parameters: number;
    contextLength: number;
    capabilities: string[];
    license: string;
    description: string;
    tags: string[];
  };
  performance: {
    latency: number;
    throughput: number;
    accuracy?: number;
    lastBenchmark?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Experiment Interface
export interface LLMExperiment {
  id: string;
  name: string;
  description: string;
  models: string[]; // Model IDs
  type: 'comparison' | 'benchmark' | 'fine-tuning' | 'evaluation' | 'custom';
  status: 'draft' | 'running' | 'completed' | 'failed';
  config: {
    prompts: string[];
    metrics: string[];
    iterations: number;
    temperature: number;
    maxTokens: number;
  };
  results: {
    modelPerformance: Record<string, any>;
    comparison: any;
    insights: string[];
    exportUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Get all available LLM models
router.get('/models', async (req, res) => {
  try {
    const models = await llmService.listModels();
    res.json({
      success: true,
      data: models,
      total: models.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific model details
router.get('/models/:id', async (req, res) => {
  try {
    const model = await llmService.getModel(req.params.id);
    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }
    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch model',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new model deployment
router.post('/models', async (req, res) => {
  try {
    const modelData: Partial<LLMModel> = req.body;
    
    // Validate required fields
    if (!modelData.name || !modelData.provider) {
      return res.status(400).json({
        success: false,
        error: 'Name and provider are required'
      });
    }

    const model = await llmService.createModel(modelData);
    res.status(201).json({
      success: true,
      data: model,
      message: 'Model created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create model',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Deploy model
router.post('/models/:id/deploy', async (req, res) => {
  try {
    const { id } = req.params;
    const { replicas = 1, resources } = req.body;
    
    const deployment = await llmService.deployModel(id, { replicas, resources });
    res.json({
      success: true,
      data: deployment,
      message: 'Model deployment started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deploy model',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stop model deployment
router.post('/models/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    await llmService.stopModel(id);
    res.json({
      success: true,
      message: 'Model stopped successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop model',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete model
router.delete('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await llmService.deleteModel(id);
    res.json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete model',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Model inference
router.post('/models/:id/inference', async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, temperature = 0.7, maxTokens = 1000, stream = false } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    if (stream) {
      // Set up streaming response
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      const stream = await llmService.streamInference(id, prompt, { temperature, maxTokens });
      stream.pipe(res);
    } else {
      const result = await llmService.generate(id, prompt, { temperature, maxTokens });
      res.json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Inference failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available providers
router.get('/providers', async (req, res) => {
  try {
    const providers = await llmService.getProviders();
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch providers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test provider connection
router.post('/providers/:provider/test', async (req, res) => {
  try {
    const { provider } = req.params;
    const config = req.body;
    
    const result = await llmService.testProvider(provider, config);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Provider test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// LLM Experiments
router.get('/experiments', async (req, res) => {
  try {
    const experiments = await llmService.listExperiments();
    res.json({
      success: true,
      data: experiments,
      total: experiments.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch experiments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create experiment
router.post('/experiments', async (req, res) => {
  try {
    const experimentData: Partial<LLMExperiment> = req.body;
    
    if (!experimentData.name || !experimentData.models || experimentData.models.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name and at least one model are required'
      });
    }

    const experiment = await llmService.createExperiment(experimentData);
    res.status(201).json({
      success: true,
      data: experiment,
      message: 'Experiment created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create experiment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Run experiment
router.post('/experiments/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const experiment = await llmService.runExperiment(id);
    res.json({
      success: true,
      data: experiment,
      message: 'Experiment started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to run experiment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get experiment results
router.get('/experiments/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const results = await llmService.getExperimentResults(id);
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch experiment results',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const health = await llmService.getHealth();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as llmRouter };
