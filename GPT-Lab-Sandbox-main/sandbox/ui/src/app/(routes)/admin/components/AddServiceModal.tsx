'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  X, 
  Plus, 
  Server, 
  Database, 
  Brain, 
  Globe,
  Lock,
  Settings,
  Save
} from 'lucide-react';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded?: () => void;
}

interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ai' | 'data' | 'compute' | 'storage';
  icon: React.ReactNode;
  defaultConfig: {
    enabled: boolean;
    maxConnections: number;
    timeout: number;
    accessLevel: 'public' | 'restricted' | 'admin-only';
  };
}

const serviceTemplates: ServiceTemplate[] = [
  {
    id: 'llm-api',
    name: 'LLM API Service',
    description: 'Large Language Model API endpoint for text generation and analysis',
    category: 'ai',
    icon: <Brain className="w-6 h-6 text-purple-400" />,
    defaultConfig: {
      enabled: true,
      maxConnections: 50,
      timeout: 60000,
      accessLevel: 'restricted'
    }
  },
  {
    id: 'vector-db',
    name: 'Vector Database',
    description: 'Vector storage and similarity search for embeddings',
    category: 'data',
    icon: <Database className="w-6 h-6 text-blue-400" />,
    defaultConfig: {
      enabled: true,
      maxConnections: 100,
      timeout: 30000,
      accessLevel: 'restricted'
    }
  },
  {
    id: 'compute-cluster',
    name: 'Compute Cluster',
    description: 'Distributed computing resources for ML training and inference',
    category: 'compute',
    icon: <Server className="w-6 h-6 text-green-400" />,
    defaultConfig: {
      enabled: true,
      maxConnections: 200,
      timeout: 300000,
      accessLevel: 'admin-only'
    }
  },
  {
    id: 'web-api',
    name: 'Web API Gateway',
    description: 'HTTP API gateway for external integrations',
    category: 'ai',
    icon: <Globe className="w-6 h-6 text-orange-400" />,
    defaultConfig: {
      enabled: true,
      maxConnections: 500,
      timeout: 15000,
      accessLevel: 'public'
    }
  }
];

export default function AddServiceModal({ isOpen, onClose, onServiceAdded }: AddServiceModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [customConfig, setCustomConfig] = useState({
    name: '',
    description: '',
    endpoint: '',
    accessLevel: 'restricted' as 'public' | 'restricted' | 'admin-only'
  });
  const [saving, setSaving] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai': return 'secondary';
      case 'data': return 'secondary';
      case 'compute': return 'green';
      case 'storage': return 'yellow';
      default: return 'gray';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'green';
      case 'restricted': return 'yellow';
      case 'admin-only': return 'red';
      default: return 'gray';
    }
  };

  const handleTemplateSelect = (template: ServiceTemplate) => {
    setSelectedTemplate(template);
    setCustomConfig({
      name: template.name,
      description: template.description,
      endpoint: '',
      accessLevel: template.defaultConfig.accessLevel
    });
  };

  const handleSave = async () => {
    if (!selectedTemplate && !customConfig.name) {
      alert('Please select a template or provide a service name');
      return;
    }

    setSaving(true);
    try {
      const serviceData = selectedTemplate ? {
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        type: selectedTemplate.category === 'ai' ? 'ai-services' : 
              selectedTemplate.category === 'data' ? 'data-catalog' :
              selectedTemplate.category === 'compute' ? 'compute' : 'storage',
        config: selectedTemplate.defaultConfig
      } : {
        name: customConfig.name,
        description: customConfig.description,
        type: 'compute', // Default type for custom services
        endpoint: customConfig.endpoint,
        config: {
          enabled: true,
          maxConnections: 100,
          timeout: 30000,
          retryAttempts: 3,
          cacheEnabled: true,
          cacheExpiry: 3600,
          rateLimit: 1000,
          accessLevel: customConfig.accessLevel,
          autoScaling: false,
          monitoringEnabled: true,
          backupEnabled: true
        }
      };

      // Call the actual API
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(serviceData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Service added successfully:', result);
        alert('Service added successfully!');
        onClose();
        resetForm();
        // Call the callback to refresh the services list
        if (onServiceAdded) {
          onServiceAdded();
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add service');
      }
    } catch (error) {
      console.error('Failed to add service:', error);
      alert(`Failed to add service: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setCustomConfig({
      name: '',
      description: '',
      endpoint: '',
      accessLevel: 'restricted'
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Add New Service</h2>
              <p className="text-sm text-text-secondary">Choose a template or create a custom service</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Service Templates */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Service Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-surface/50'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-surface/50 rounded-lg flex items-center justify-center">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary mb-1">{template.name}</h4>
                        <p className="text-sm text-text-secondary mb-2">{template.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="muted" className="text-xs">
                            {template.category.toUpperCase()}
                          </Badge>
                          <Badge variant={getAccessLevelColor(template.defaultConfig.accessLevel)} className="text-xs">
                            {template.defaultConfig.accessLevel.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Service */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Custom Service</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={customConfig.name}
                      onChange={(e) => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter service name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Access Level
                    </label>
                    <select
                      value={customConfig.accessLevel}
                      onChange={(e) => setCustomConfig(prev => ({ 
                        ...prev, 
                        accessLevel: e.target.value as 'public' | 'restricted' | 'admin-only' 
                      }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="public">Public - Available to all users</option>
                      <option value="restricted">Restricted - Requires approval</option>
                      <option value="admin-only">Admin Only - Super admin access</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={customConfig.description}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                    placeholder="Describe the service functionality"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={customConfig.endpoint}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://api.example.com/service"
                  />
                </div>
              </div>
            </div>

            {/* Selected Template Preview */}
            {selectedTemplate && (
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Selected Template</h3>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-surface/50 rounded-lg flex items-center justify-center">
                      {selectedTemplate.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary mb-1">{selectedTemplate.name}</h4>
                      <p className="text-sm text-text-secondary mb-3">{selectedTemplate.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-text-secondary">Max Connections:</span>
                          <span className="text-text-primary ml-2">{selectedTemplate.defaultConfig.maxConnections}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Timeout:</span>
                          <span className="text-text-primary ml-2">{selectedTemplate.defaultConfig.timeout}ms</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Access Level:</span>
                          <Badge variant={getAccessLevelColor(selectedTemplate.defaultConfig.accessLevel)} className="ml-2 text-xs">
                            {selectedTemplate.defaultConfig.accessLevel.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-text-secondary">Status:</span>
                          <Badge variant={selectedTemplate.defaultConfig.enabled ? 'green' : 'gray'} className="ml-2 text-xs">
                            {selectedTemplate.defaultConfig.enabled ? 'ENABLED' : 'DISABLED'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (!selectedTemplate && !customConfig.name)}
            className="btn-primary"
          >
            {saving ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Adding Service...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Add Service
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
