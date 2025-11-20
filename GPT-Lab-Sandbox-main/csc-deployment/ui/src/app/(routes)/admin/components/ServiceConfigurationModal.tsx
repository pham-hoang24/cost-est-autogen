'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  X, 
  Settings, 
  Database, 
  Brain, 
  Server, 
  CheckCircle, 
  AlertCircle,
  Save,
  RefreshCw,
  TestTube
} from 'lucide-react';

interface ServiceConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'ai-services' | 'data-catalog';
  serviceName: string;
}

interface ServiceConfig {
  enabled: boolean;
  maxConnections: number;
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheExpiry: number;
  rateLimit: number;
  accessLevel: 'public' | 'restricted' | 'admin-only';
  autoScaling: boolean;
  monitoringEnabled: boolean;
  backupEnabled: boolean;
}

export default function ServiceConfigurationModal({
  isOpen,
  onClose,
  serviceType,
  serviceName
}: ServiceConfigurationModalProps) {
  const [config, setConfig] = useState<ServiceConfig>({
    enabled: true,
    maxConnections: 100,
    timeout: 30000,
    retryAttempts: 3,
    cacheEnabled: true,
    cacheExpiry: 3600,
    rateLimit: 1000,
    accessLevel: 'restricted',
    autoScaling: false,
    monitoringEnabled: true,
    backupEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Load configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      loadConfiguration();
    }
  }, [isOpen, serviceType]);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      // Simulate API call to load current configuration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, this would be:
      // const response = await fetch(`/api/services/${serviceType}/config`);
      // const data = await response.json();
      // setConfig(data);
      
      console.log(`Loading configuration for ${serviceType}`);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // Simulate API call to save configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, this would be:
      // const response = await fetch(`/api/services/${serviceType}/config`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      
      console.log(`Saving configuration for ${serviceType}:`, config);
      alert('Configuration saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Simulate API call to test service connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would be:
      // const response = await fetch(`/api/services/${serviceType}/test`);
      // const success = response.ok;
      
      const success = Math.random() > 0.3; // Simulate 70% success rate
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const updateConfig = (key: keyof ServiceConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'ai-services':
        return <Brain className="w-6 h-6 text-purple-400" />;
      case 'data-catalog':
        return <Database className="w-6 h-6 text-blue-400" />;
      default:
        return <Server className="w-6 h-6 text-gray-400" />;
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              {getServiceIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Configure {serviceName}</h2>
              <p className="text-sm text-text-secondary">Service settings and configuration</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-text-secondary">Loading configuration...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Service Status */}
              <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-text-secondary" />
                  <div>
                    <h3 className="font-medium text-text-primary">Service Status</h3>
                    <p className="text-sm text-text-secondary">Enable or disable this service</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateConfig('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Connection Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Connection Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Max Connections
                    </label>
                    <input
                      type="number"
                      value={config.maxConnections}
                      onChange={(e) => updateConfig('maxConnections', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Timeout (ms)
                    </label>
                    <input
                      type="number"
                      value={config.timeout}
                      onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min="1000"
                      max="300000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Retry Attempts
                    </label>
                    <input
                      type="number"
                      value={config.retryAttempts}
                      onChange={(e) => updateConfig('retryAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min="0"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Rate Limit (requests/hour)
                    </label>
                    <input
                      type="number"
                      value={config.rateLimit}
                      onChange={(e) => updateConfig('rateLimit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min="100"
                      max="10000"
                    />
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Access Control</h3>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Access Level
                  </label>
                  <select
                    value={config.accessLevel}
                    onChange={(e) => updateConfig('accessLevel', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="public">Public - Available to all users</option>
                    <option value="restricted">Restricted - Requires approval</option>
                    <option value="admin-only">Admin Only - Super admin access</option>
                  </select>
                  <div className="mt-2">
                    <Badge variant={getAccessLevelColor(config.accessLevel)}>
                      {config.accessLevel.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Cache Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Cache Settings</h3>
                
                <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-text-primary">Enable Caching</h4>
                    <p className="text-sm text-text-secondary">Improve performance with response caching</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.cacheEnabled}
                      onChange={(e) => updateConfig('cacheEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {config.cacheEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Cache Expiry (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.cacheExpiry}
                      onChange={(e) => updateConfig('cacheExpiry', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min="60"
                      max="86400"
                    />
                  </div>
                )}
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Advanced Settings</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                    <span className="text-text-primary">Auto Scaling</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoScaling}
                        onChange={(e) => updateConfig('autoScaling', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                    <span className="text-text-primary">Monitoring</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.monitoringEnabled}
                        onChange={(e) => updateConfig('monitoringEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                    <span className="text-text-primary">Backup</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.backupEnabled}
                        onChange={(e) => updateConfig('backupEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Test Connection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Test Connection</h3>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={testConnection}
                    disabled={testing}
                    className="btn-outline"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>

                  {testResult && (
                    <div className="flex items-center gap-2">
                      {testResult === 'success' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 text-sm">Connection successful</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-400 text-sm">Connection failed</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={loadConfiguration}
              disabled={loading || saving}
              className="btn-outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={saveConfiguration}
              disabled={saving || loading}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
