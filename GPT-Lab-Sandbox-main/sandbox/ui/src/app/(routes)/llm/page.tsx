'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

interface LLMModel {
  id: string;
  name: string;
  version: string;
  provider: string;
  deployment: {
    status: string;
    replicas: number;
    resources: {
      cpu: string;
      memory: string;
      gpu?: string;
    };
    endpoint?: string;
  };
  metadata: {
    size: number;
    parameters: number;
    contextLength: number;
    capabilities: string[];
    description: string;
  };
  performance: {
    latency: number;
    throughput: number;
    accuracy?: number;
  };
}

interface LLMExperiment {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  models: string[];
  config: {
    prompts: string[];
    metrics: string[];
    iterations: number;
  };
  results: {
    modelPerformance: Record<string, any>;
    insights: string[];
  };
}

interface LLMProvider {
  name: string;
  description: string;
  capabilities: string[];
  config: {
    baseUrl: string;
    models: string[];
  };
}

export default function LLMPage() {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [experiments, setExperiments] = useState<LLMExperiment[]>([]);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'models' | 'experiments' | 'providers' | 'deploy'>('models');
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showInferenceModal, setShowInferenceModal] = useState(false);
  const [inferencePrompt, setInferencePrompt] = useState('');
  const [inferenceResult, setInferenceResult] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modelsRes, experimentsRes, providersRes] = await Promise.all([
        fetch('/api/llm/models'),
        fetch('/api/llm/experiments'),
        fetch('/api/llm/providers')
      ]);

      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setModels(modelsData.data || []);
      }

      if (experimentsRes.ok) {
        const experimentsData = await experimentsRes.json();
        setExperiments(experimentsData.data || []);
      }

      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setProviders(providersData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch LLM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deployModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/llm/models/${modelId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replicas: 1 })
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to deploy model:', error);
    }
  };

  const stopModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/llm/models/${modelId}/stop`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to stop model:', error);
    }
  };

  const runInference = async (modelId: string, prompt: string) => {
    try {
      const response = await fetch(`/api/llm/models/${modelId}/inference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, temperature: 0.7, maxTokens: 1000 })
      });

      if (response.ok) {
        const result = await response.json();
        setInferenceResult(result.data.response);
      }
    } catch (error) {
      console.error('Failed to run inference:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'green';
      case 'deploying': return 'yellow';
      case 'stopped': return 'red';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'ollama': return '🤖';
      case 'csc': return '🇫🇮';
      case 'huggingface': return '🤗';
      case 'openai': return '🔵';
      case 'anthropic': return '🟠';
      case 'local': return '🏠';
      default: return '🔧';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading LLM Management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">LLM Management</h1>
          <p className="text-text-secondary mt-2">
            Deploy, manage, and experiment with local and cloud LLMs
          </p>
        </div>
        <Button onClick={() => setShowDeployModal(true)}>
          Deploy New Model
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-surface rounded-lg p-1">
        {[
          { id: 'models', label: 'Models', count: models.length },
          { id: 'experiments', label: 'Experiments', count: experiments.length },
          { id: 'providers', label: 'Providers', count: providers.length },
          { id: 'deploy', label: 'Deploy' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-background'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <Badge className="ml-2" variant="secondary">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <Card key={model.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getProviderIcon(model.provider)}</span>
                    <div>
                      <h3 className="font-semibold text-text-primary">{model.name}</h3>
                      <p className="text-sm text-text-secondary">v{model.version}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(model.deployment.status)}>
                    {model.deployment.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="text-text-secondary">Provider:</span>
                    <span className="ml-2 font-medium">{model.provider}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-text-secondary">Parameters:</span>
                    <span className="ml-2 font-medium">
                      {(model.metadata.parameters / 1e9).toFixed(1)}B
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-text-secondary">Context:</span>
                    <span className="ml-2 font-medium">{model.metadata.contextLength.toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-text-secondary">Latency:</span>
                    <span className="ml-2 font-medium">{model.performance.latency}ms</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {model.metadata.capabilities.slice(0, 3).map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  {model.deployment.status === 'running' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedModel(model);
                          setShowInferenceModal(true);
                        }}
                      >
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => stopModel(model.id)}
                      >
                        Stop
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => deployModel(model.id)}
                      disabled={model.deployment.status === 'deploying'}
                    >
                      {model.deployment.status === 'deploying' ? 'Deploying...' : 'Deploy'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Experiments Tab */}
      {activeTab === 'experiments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiments.map((experiment) => (
              <Card key={experiment.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-text-primary">{experiment.name}</h3>
                    <p className="text-sm text-text-secondary">{experiment.description}</p>
                  </div>
                  <Badge variant={getStatusColor(experiment.status)}>
                    {experiment.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="text-text-secondary">Type:</span>
                    <span className="ml-2 font-medium capitalize">{experiment.type}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-text-secondary">Models:</span>
                    <span className="ml-2 font-medium">{experiment.models.length}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-text-secondary">Prompts:</span>
                    <span className="ml-2 font-medium">{experiment.config.prompts.length}</span>
                  </div>
                </div>

                {experiment.status === 'completed' && experiment.results.insights && (
                  <div className="mb-4">
                    <h4 className="font-medium text-text-primary mb-2">Key Insights:</h4>
                    <ul className="text-sm text-text-secondary space-y-1">
                      {experiment.results.insights.slice(0, 2).map((insight, index) => (
                        <li key={index}>• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={experiment.status === 'running'}
                  >
                    {experiment.status === 'running' ? 'Running...' : 'Run'}
                  </Button>
                  <Button variant="outline" size="sm">
                    View Results
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Card key={provider.name} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{getProviderIcon(provider.name.toLowerCase())}</span>
                  <div>
                    <h3 className="font-semibold text-text-primary">{provider.name}</h3>
                    <p className="text-sm text-text-secondary">{provider.description}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="text-text-secondary">Base URL:</span>
                    <span className="ml-2 font-mono text-xs">{provider.config.baseUrl}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-text-secondary">Available Models:</span>
                    <span className="ml-2 font-medium">{provider.config.models.length}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.capabilities.map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Test Connection
                  </Button>
                  <Button size="sm">
                    Deploy Model
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Deploy Tab */}
      {activeTab === 'deploy' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-4">Deploy New Model</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Model Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary"
                placeholder="e.g., Llama 3.1 7B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Provider
              </label>
              <select className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary">
                <option value="">Select provider</option>
                {providers.map((provider) => (
                  <option key={provider.name} value={provider.name.toLowerCase()}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Model Source
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary"
                placeholder="e.g., ollama/llama3.1:7b or https://huggingface.co/meta-llama/Llama-3.1-7B"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  CPU Cores
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary"
                  placeholder="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Memory (GB)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary"
                  placeholder="8"
                />
              </div>
            </div>
            <Button className="w-full">
              Deploy Model
            </Button>
          </div>
        </Card>
      )}

      {/* Inference Modal */}
      {showInferenceModal && selectedModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text-primary">
                Test {selectedModel.name}
              </h3>
              <button
                onClick={() => setShowInferenceModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Prompt
                </label>
                <textarea
                  value={inferencePrompt}
                  onChange={(e) => setInferencePrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary h-32"
                  placeholder="Enter your prompt here..."
                />
              </div>
              {inferenceResult && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Response
                  </label>
                  <div className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary min-h-32">
                    {inferenceResult}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => runInference(selectedModel.id, inferencePrompt)}
                  disabled={!inferencePrompt.trim()}
                >
                  Generate
                </Button>
                <Button variant="outline" onClick={() => setShowInferenceModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
