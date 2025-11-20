'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Brain, 
  Target, 
  Zap, 
  Settings, 
  Play, 
  Plus, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Cpu,
  HardDrive,
  Globe,
  Lock,
  Shield,
  Database,
  Code,
  FileText,
  MessageSquare,
  Bot,
  Sparkles,
  BarChart3,
  Activity
} from 'lucide-react';

interface RAGTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  components: Array<{
    name: string;
    type: string;
    configuration: Record<string, any>;
  }>;
  prebuilt: boolean;
  performance: {
    latency: number;
    accuracy: number;
    throughput: number;
  };
  compliance: {
    euAIAct: boolean;
    dataGovernance: boolean;
    auditTrail: boolean;
  };
}

interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'training';
  compliance: {
    euAIAct: boolean;
    dataGovernance: boolean;
    auditTrail: boolean;
  };
}

function AICapabilitiesPage() {
  const [activeTab, setActiveTab] = useState('rag');
  const [ragTemplates, setRagTemplates] = useState<RAGTemplate[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRAG, setShowCreateRAG] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [newRAG, setNewRAG] = useState({
    name: '',
    description: '',
    category: 'documentation'
  });
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    type: 'assistant',
    capabilities: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch RAG templates
      const ragResponse = await fetch('/api/ai/rag-templates');
      if (ragResponse.ok) {
        const ragData = await ragResponse.json();
        setRagTemplates(ragData.data || []);
      } else {
        // Fallback mock data
        setRagTemplates([
          {
            id: 'rag-001',
            name: 'Documentation Assistant',
            description: 'RAG-based system for technical documentation search and assistance',
            category: 'documentation',
            components: [
              { name: 'Vector Store', type: 'pinecone', configuration: {} },
              { name: 'Embedding Model', type: 'openai', configuration: {} }
            ],
            prebuilt: true,
            performance: { latency: 150, accuracy: 92, throughput: 100 },
            compliance: { euAIAct: true, dataGovernance: true, auditTrail: true }
          }
        ]);
      }

      // Mock agents data
      setAgents([
        {
          id: 'agent-001',
          name: 'Code Review Assistant',
          description: 'AI agent for automated code review and quality assessment',
          type: 'assistant',
          capabilities: ['code analysis', 'quality metrics', 'security scanning'],
          status: 'active',
          compliance: { euAIAct: true, dataGovernance: true, auditTrail: true }
        },
        {
          id: 'agent-002',
          name: 'Data Quality Monitor',
          description: 'Agent for monitoring and improving data quality across datasets',
          type: 'monitor',
          capabilities: ['data validation', 'anomaly detection', 'quality reporting'],
          status: 'active',
          compliance: { euAIAct: true, dataGovernance: true, auditTrail: true }
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch AI capabilities data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'training': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'training': return <Activity className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const handleCreateRAG = () => {
    if (newRAG.name && newRAG.description) {
      const template: RAGTemplate = {
        id: `rag-${Date.now()}`,
        ...newRAG,
        components: [],
        prebuilt: false,
        performance: { latency: 0, accuracy: 0, throughput: 0 },
        compliance: { euAIAct: false, dataGovernance: false, auditTrail: false }
      };
      setRagTemplates([template, ...ragTemplates]);
      setNewRAG({ name: '', description: '', category: 'documentation' });
      setShowCreateRAG(false);
    }
  };

  const handleCreateAgent = () => {
    if (newAgent.name && newAgent.description) {
      const agent: Agent = {
        id: `agent-${Date.now()}`,
        ...newAgent,
        capabilities: [],
        status: 'inactive',
        compliance: { euAIAct: false, dataGovernance: false, auditTrail: false }
      };
      setAgents([agent, ...agents]);
      setNewAgent({ name: '', description: '', type: 'assistant', capabilities: [] });
      setShowCreateAgent(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading AI capabilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">AI Capabilities</h1>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          Deploy and manage RAG templates and AI agents for your research projects
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('rag')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'rag'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            RAG Templates
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'agents'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            AI Agents
          </button>
        </div>
      </div>

      {/* RAG Templates Tab */}
      {activeTab === 'rag' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-text-primary">RAG Templates</h2>
            <Button 
              onClick={() => setShowCreateRAG(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Create RAG Form */}
          {showCreateRAG && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Create New RAG Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Template Name</label>
                  <input
                    type="text"
                    value={newRAG.name}
                    onChange={(e) => setNewRAG({ ...newRAG, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                  <textarea
                    value={newRAG.description}
                    onChange={(e) => setNewRAG({ ...newRAG, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe the RAG template"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                  <select
                    value={newRAG.category}
                    onChange={(e) => setNewRAG({ ...newRAG, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="documentation">Documentation</option>
                    <option value="research">Research</option>
                    <option value="analysis">Analysis</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCreateRAG} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Create Template
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateRAG(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* RAG Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ragTemplates.map((template) => (
              <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{template.name}</h3>
                      <p className="text-sm text-text-secondary">{template.description}</p>
                    </div>
                  </div>
                  {template.prebuilt && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Prebuilt
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Category:</span>
                    <span className="text-text-primary font-medium capitalize">{template.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Latency:</span>
                    <span className="text-text-primary font-medium">{template.performance.latency}ms</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Accuracy:</span>
                    <span className="text-text-primary font-medium">{template.performance.accuracy}%</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-text-primary">Compliance</h4>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      {getComplianceIcon(template.compliance.euAIAct)}
                      <span className="text-xs text-text-secondary">EU AI Act</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getComplianceIcon(template.compliance.dataGovernance)}
                      <span className="text-xs text-text-secondary">Data Governance</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getComplianceIcon(template.compliance.auditTrail)}
                      <span className="text-xs text-text-secondary">Audit Trail</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1">
                    <Play className="w-3 h-3 mr-1" />
                    Deploy
                  </Button>
                  <Button variant="outline" className="text-sm px-3 py-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" className="text-sm px-3 py-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {ragTemplates.length === 0 && (
            <Card className="p-12 text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No RAG Templates</h3>
              <p className="text-text-secondary mb-4">Create your first RAG template to get started</p>
              <Button 
                onClick={() => setShowCreateRAG(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* AI Agents Tab */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-text-primary">AI Agents</h2>
            <Button 
              onClick={() => setShowCreateAgent(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </div>

          {/* Create Agent Form */}
          {showCreateAgent && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Create New AI Agent</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter agent name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                  <textarea
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe the AI agent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
                  <select
                    value={newAgent.type}
                    onChange={(e) => setNewAgent({ ...newAgent, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="assistant">Assistant</option>
                    <option value="monitor">Monitor</option>
                    <option value="analyzer">Analyzer</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCreateAgent} className="bg-green-600 hover:bg-green-700 text-white">
                    Create Agent
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateAgent(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Agents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{agent.name}</h3>
                      <p className="text-sm text-text-secondary">{agent.description}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(agent.status)}`}>
                    {getStatusIcon(agent.status)}
                    {agent.status}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Type:</span>
                    <span className="text-text-primary font-medium capitalize">{agent.type}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-text-secondary">Capabilities:</span>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((capability, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-text-primary">Compliance</h4>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      {getComplianceIcon(agent.compliance.euAIAct)}
                      <span className="text-xs text-text-secondary">EU AI Act</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getComplianceIcon(agent.compliance.dataGovernance)}
                      <span className="text-xs text-text-secondary">Data Governance</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getComplianceIcon(agent.compliance.auditTrail)}
                      <span className="text-xs text-text-secondary">Audit Trail</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1">
                    <Play className="w-3 h-3 mr-1" />
                    Activate
                  </Button>
                  <Button variant="outline" className="text-sm px-3 py-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" className="text-sm px-3 py-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {agents.length === 0 && (
            <Card className="p-12 text-center">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No AI Agents</h3>
              <p className="text-text-secondary mb-4">Create your first AI agent to get started</p>
              <Button 
                onClick={() => setShowCreateAgent(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default AICapabilitiesPage;
