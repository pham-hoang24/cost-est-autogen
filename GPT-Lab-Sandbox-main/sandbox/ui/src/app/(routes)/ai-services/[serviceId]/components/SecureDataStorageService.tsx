'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Shield, 
  Database, 
  Lock, 
  Upload, 
  Download,
  Eye,
  Settings,
  Globe,
  CheckCircle,
  AlertTriangle,
  FileText,
  Key,
  Server,
  Zap
} from 'lucide-react';

interface SecureDataStorageServiceProps {
  service: any;
}

export default function SecureDataStorageService({ service }: SecureDataStorageServiceProps) {
  const [currentView, setCurrentView] = useState('overview');
  const [storageConfig, setStorageConfig] = useState({
    encryption: 'AES-256',
    region: 'EU-West-1',
    backup: true,
    retention: 365,
    accessLevel: 'private'
  });

  const [storedFiles, setStoredFiles] = useState([
    {
      id: 'file-1',
      name: 'customer_data_2025.csv',
      size: '45.2 MB',
      uploadDate: '2025-09-20T14:30:00Z',
      encryption: 'AES-256',
      region: 'EU-West-1',
      status: 'encrypted',
      accessCount: 12,
      lastAccessed: '2025-09-21T09:15:00Z'
    },
    {
      id: 'file-2',
      name: 'model_training_data.parquet',
      size: '128.7 MB',
      uploadDate: '2025-09-19T10:22:00Z',
      encryption: 'AES-256',
      region: 'EU-Central-1',
      status: 'encrypted',
      accessCount: 34,
      lastAccessed: '2025-09-21T11:45:00Z'
    },
    {
      id: 'file-3',
      name: 'sensitive_documents.zip',
      size: '23.1 MB',
      uploadDate: '2025-09-18T16:45:00Z',
      encryption: 'AES-256',
      region: 'EU-West-1',
      status: 'encrypted',
      accessCount: 5,
      lastAccessed: '2025-09-20T13:22:00Z'
    }
  ]);

  const regions = [
    { id: 'EU-West-1', name: 'EU West (Ireland)', compliance: ['GDPR', 'EU AI Act'] },
    { id: 'EU-Central-1', name: 'EU Central (Frankfurt)', compliance: ['GDPR', 'EU AI Act'] },
    { id: 'EU-North-1', name: 'EU North (Stockholm)', compliance: ['GDPR', 'EU AI Act'] }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString(),
        encryption: storageConfig.encryption,
        region: storageConfig.region,
        status: 'encrypting',
        accessCount: 0,
        lastAccessed: new Date().toISOString()
      };

      setStoredFiles(prev => [newFile, ...prev]);
      
      // Simulate encryption process
      setTimeout(() => {
        setStoredFiles(prev => 
          prev.map(f => f.id === newFile.id ? {...f, status: 'encrypted'} : f)
        );
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Secure Data Storage</h2>
            <p className="text-green-200">Encrypted data storage with EU data residency compliance</p>
          </div>
        </div>
        <p className="text-slate-300">
          Enterprise-grade encrypted storage with automatic compliance monitoring, 
          data residency controls, and comprehensive audit trails.
        </p>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        <Button 
          onClick={() => setCurrentView('overview')}
          variant={currentView === 'overview' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          Storage Overview
        </Button>
        <Button 
          onClick={() => setCurrentView('upload')}
          variant={currentView === 'upload' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Data
        </Button>
        <Button 
          onClick={() => setCurrentView('compliance')}
          variant={currentView === 'compliance' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Compliance
        </Button>
      </div>

      {/* Storage Overview */}
      {currentView === 'overview' && (
        <div className="space-y-6">
          {/* Storage Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">197.0 MB</div>
              <div className="text-sm text-blue-300">Total Storage Used</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">3</div>
              <div className="text-sm text-green-300">Encrypted Files</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">51</div>
              <div className="text-sm text-purple-300">Total Access Events</div>
            </div>
            <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">100%</div>
              <div className="text-sm text-orange-300">Compliance Rate</div>
            </div>
          </div>

          {/* Stored Files */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Stored Files</h3>
            <div className="space-y-3">
              {storedFiles.map((file) => (
                <Card key={file.id} className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        {file.status === 'encrypting' ? (
                          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Lock className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{file.name}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={file.status === 'encrypted' ? 'green' : 'yellow'}>
                            {file.status}
                          </Badge>
                          <span className="text-slate-400">{file.size}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">{file.region}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Uploaded:</span>
                      <span className="text-white ml-1">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Encryption:</span>
                      <span className="text-white ml-1">{file.encryption}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Access Count:</span>
                      <span className="text-white ml-1">{file.accessCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Accessed:</span>
                      <span className="text-white ml-1">
                        {new Date(file.lastAccessed).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Regional Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Regional Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {regions.map((region) => {
                const filesInRegion = storedFiles.filter(f => f.region === region.id).length;
                return (
                  <div key={region.id} className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{region.name}</span>
                      <Badge variant="green">{filesInRegion} files</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {region.compliance.map((comp) => (
                        <Badge key={comp} variant="secondary" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Upload Data */}
      {currentView === 'upload' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Upload Secure Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Area */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">Upload Files</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Files will be automatically encrypted with {storageConfig.encryption}
                  </p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="secure-file-upload"
                    multiple
                  />
                  <label htmlFor="secure-file-upload">
                    <Button className="btn-primary cursor-pointer">
                      Choose Files
                    </Button>
                  </label>
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">Storage Configuration</h4>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Encryption Standard</label>
                  <select 
                    value={storageConfig.encryption}
                    onChange={(e) => setStorageConfig({...storageConfig, encryption: e.target.value})}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value="AES-256">AES-256 (Recommended)</option>
                    <option value="AES-128">AES-128</option>
                    <option value="ChaCha20">ChaCha20-Poly1305</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Storage Region</label>
                  <select 
                    value={storageConfig.region}
                    onChange={(e) => setStorageConfig({...storageConfig, region: e.target.value})}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Data Retention (Days)</label>
                  <select 
                    value={storageConfig.retention}
                    onChange={(e) => setStorageConfig({...storageConfig, retention: parseInt(e.target.value)})}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year (Recommended)</option>
                    <option value={2555}>7 years (Legal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Access Level</label>
                  <select 
                    value={storageConfig.accessLevel}
                    onChange={(e) => setStorageConfig({...storageConfig, accessLevel: e.target.value})}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value="private">Private (Owner only)</option>
                    <option value="team">Team Access</option>
                    <option value="organization">Organization Access</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                  <span className="text-white text-sm">Enable Automatic Backup</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storageConfig.backup}
                      onChange={(e) => setStorageConfig({...storageConfig, backup: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Features */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Security Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Key className="w-5 h-5 text-green-400" />
                  <div>
                    <h4 className="text-green-400 font-medium">End-to-End Encryption</h4>
                    <p className="text-green-300 text-sm">Data encrypted before transmission</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="text-blue-400 font-medium">EU Data Residency</h4>
                    <p className="text-blue-300 text-sm">Data never leaves EU jurisdiction</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-purple-400 font-medium">Audit Logging</h4>
                    <p className="text-purple-300 text-sm">Complete access history tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <Server className="w-5 h-5 text-orange-400" />
                  <div>
                    <h4 className="text-orange-400 font-medium">Redundant Storage</h4>
                    <p className="text-orange-300 text-sm">99.999% durability guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Compliance */}
      {currentView === 'compliance' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Compliance Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* GDPR Compliance */}
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-green-400 font-medium">GDPR Compliance</h4>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Encryption:</span>
                    <span className="text-green-400">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">EU Residency:</span>
                    <span className="text-green-400">✓ Compliant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Right to Erasure:</span>
                    <span className="text-green-400">✓ Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Audit Trails:</span>
                    <span className="text-green-400">✓ Active</span>
                  </div>
                </div>
              </div>

              {/* EU AI Act */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-blue-400 font-medium">EU AI Act</h4>
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Governance:</span>
                    <span className="text-blue-400">✓ Compliant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Assessment:</span>
                    <span className="text-blue-400">✓ Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Documentation:</span>
                    <span className="text-blue-400">✓ Current</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quality Management:</span>
                    <span className="text-blue-400">✓ Active</span>
                  </div>
                </div>
              </div>

              {/* ISO 27001 */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-purple-400 font-medium">ISO 27001</h4>
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Access Control:</span>
                    <span className="text-purple-400">✓ Enforced</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Incident Response:</span>
                    <span className="text-purple-400">✓ Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Management:</span>
                    <span className="text-purple-400">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Continuous Monitoring:</span>
                    <span className="text-purple-400">✓ Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Compliance Events */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Compliance Events</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <span className="text-white">Automated GDPR compliance check completed</span>
                  <div className="text-slate-400 text-sm">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <span className="text-white">Data retention policy applied to expired files</span>
                  <div className="text-slate-400 text-sm">1 day ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <span className="text-white">Security audit scheduled for next week</span>
                  <div className="text-slate-400 text-sm">3 days ago</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
