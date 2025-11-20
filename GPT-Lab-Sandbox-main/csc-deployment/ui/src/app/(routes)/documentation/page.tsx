'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  FileText, 
  Code, 
  Users, 
  Shield, 
  Book,
  Terminal,
  Database,
  Settings,
  CheckCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Search
} from 'lucide-react';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('api-reference');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <h1 className="text-5xl font-bold text-text-primary">
          SW4E Sandbox <span className="text-primary">Documentation</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          Complete Developer and User Guide
        </p>
      </div>

      {/* Navigation */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'api-reference', label: 'API Reference', icon: Code },
            { id: 'user-guides', label: 'User Guides', icon: Users },
            { id: 'admin-guides', label: 'Admin Guides', icon: Shield },
            { id: 'compliance', label: 'Compliance & Security', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeSection === id ? "primary" : "outline"}
              onClick={() => setActiveSection(id)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {/* API Reference Section */}
      {activeSection === 'api-reference' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-text-primary">🔌 API Reference</h2>
          
          {/* Authentication */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-4">Authentication</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Login</h4>
                <div className="bg-surface rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400">POST</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard('POST /api/auth/login')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-text-secondary">/api/auth/login</div>
                  <div className="mt-3 text-text-secondary">
{`{
  "email": "user@example.com",
  "password": "password"
}`}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">Get Current User</h4>
                <div className="bg-surface rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400">GET</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard('GET /api/auth/me')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-text-secondary">/api/auth/me</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Services Management */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-4">Services Management</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">List All Services</h4>
                <div className="bg-surface rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400">GET</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard('GET /api/services')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-text-secondary">/api/services</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">Create New Service</h4>
                <div className="bg-surface rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400">POST</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard('POST /api/services')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-text-secondary">/api/services</div>
                  <div className="mt-3 text-text-secondary">
{`{
  "name": "My AI Service",
  "description": "Custom AI model",
  "type": "ai-services"
}`}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">Test Service</h4>
                <div className="bg-surface rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400">POST</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard('POST /api/services/{id}/test')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-text-secondary">/api/services/{`{id}`}/test</div>
                </div>
              </div>
            </div>
          </Card>

          {/* User Management */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-4">User Management</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">List Users (Admin Only)</h4>
                <div className="bg-surface rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400">GET</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard('GET /api/governance/users')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-text-secondary">/api/governance/users</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">Approve User (Admin Only)</h4>
                <div className="bg-surface rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400">PUT</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard('PUT /api/governance/users/{id}/approve')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-text-secondary">/api/governance/users/{`{id}`}/approve</div>
                  <div className="mt-3 text-text-secondary">
{`{
  "approved_by": "admin_id",
  "notes": "Approval reason"
}`}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* User Guides Section */}
      {activeSection === 'user-guides' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-text-primary">📱 User Guides</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">For Researchers</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text-primary">Getting Started</p>
                    <p className="text-text-secondary text-sm">Your first AI experiment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text-primary">Data Upload</p>
                    <p className="text-text-secondary text-sm">Secure data handling best practices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text-primary">Model Training</p>
                    <p className="text-text-secondary text-sm">Using our ML infrastructure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text-primary">Results Analysis</p>
                    <p className="text-text-secondary text-sm">Interpreting and visualizing results</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">For Administrators</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text-primary">User Management</p>
                    <p className="text-text-secondary text-sm">Approving and managing users</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text-primary">Resource Monitoring</p>
                    <p className="text-text-secondary text-sm">Tracking usage and costs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text-primary">Security Settings</p>
                    <p className="text-text-secondary text-sm">Configuring access controls</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text-primary">Compliance Reports</p>
                    <p className="text-text-secondary text-sm">Generating audit reports</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Admin Guides Section */}
      {activeSection === 'admin-guides' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-text-primary">👑 Admin Guides</h2>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-4">Administrative Tasks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-text-primary">User Administration</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Approve new user registrations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Manage user roles and permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Monitor user activity and usage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Generate user reports
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-text-primary">System Management</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Configure system settings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Manage service configurations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Monitor system health
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Handle security incidents
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Compliance Section */}
      {activeSection === 'compliance' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-text-primary">🔒 Compliance & Security</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">GDPR Compliance</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-400 mt-1" />
                  <div>
                    <p className="text-text-primary font-medium">Data Processing Agreements</p>
                    <p className="text-text-secondary text-sm">Legal frameworks and templates</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-400 mt-1" />
                  <div>
                    <p className="text-text-primary font-medium">Privacy Impact Assessments</p>
                    <p className="text-text-secondary text-sm">Risk evaluation tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-purple-400 mt-1" />
                  <div>
                    <p className="text-text-primary font-medium">Data Subject Rights</p>
                    <p className="text-text-secondary text-sm">Handling user requests</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Security Measures</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-red-400 mt-1" />
                  <div>
                    <p className="text-text-primary font-medium">Encryption</p>
                    <p className="text-text-secondary text-sm">Data at rest and in transit</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                  <div>
                    <p className="text-text-primary font-medium">Access Controls</p>
                    <p className="text-text-secondary text-sm">Multi-factor authentication</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Settings className="w-4 h-4 text-blue-400 mt-1" />
                  <div>
                    <p className="text-text-primary font-medium">Network Security</p>
                    <p className="text-text-secondary text-sm">VPC isolation and firewalls</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Developer Resources */}
      <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">🛠️ Developer Resources</h2>
          <p className="text-text-secondary mb-6">
            Everything you need to integrate with SW4E Sandbox
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <p className="font-medium text-text-primary">SDKs</p>
              <p className="text-text-secondary text-sm">Python, R, JavaScript</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Terminal className="w-6 h-6 text-green-400" />
              </div>
              <p className="font-medium text-text-primary">CLI Tools</p>
              <p className="text-text-secondary text-sm">Command-line interface</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <p className="font-medium text-text-primary">Webhooks</p>
              <p className="text-text-secondary text-sm">Event-driven integrations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Settings className="w-6 h-6 text-orange-400" />
              </div>
              <p className="font-medium text-text-primary">Rate Limits</p>
              <p className="text-text-secondary text-sm">API usage guidelines</p>
            </div>
          </div>
          <Button className="btn-primary" onClick={() => window.location.href = '/getting-started'}>
            Get Started Now
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
