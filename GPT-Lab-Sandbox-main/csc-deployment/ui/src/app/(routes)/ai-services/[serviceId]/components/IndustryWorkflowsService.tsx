'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { 
  Building, 
  Heart, 
  Factory, 
  Banknote, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Download,
  Settings,
  Target,
  Zap,
  Play,
  Upload
} from 'lucide-react';
import { Badge } from '@/components/Badge';

interface IndustryWorkflowsServiceProps {
  service: any;
}

export default function IndustryWorkflowsService({ service }: IndustryWorkflowsServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [workflowConfig, setWorkflowConfig] = useState({
    complianceLevel: 'strict',
    dataHandling: 'encrypted',
    auditTrail: true
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [results, setResults] = useState<any>(null);

  const industries = [
    {
      id: 'healthcare',
      name: 'Healthcare & Life Sciences',
      icon: Heart,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      description: 'HIPAA compliant AI workflows for medical data and patient care',
      compliance: ['HIPAA', 'FDA', 'GDPR', 'MDR'],
      workflows: [
        {
          id: 'medical-imaging',
          name: 'Medical Image Analysis',
          description: 'AI-powered analysis of X-rays, MRIs, and CT scans with diagnostic support',
          features: ['DICOM integration', 'Radiologist workflow', 'FDA-approved models', 'Audit trails']
        },
        {
          id: 'drug-discovery',
          name: 'Drug Discovery Pipeline',
          description: 'Accelerate pharmaceutical research with AI-driven compound analysis',
          features: ['Molecular modeling', 'Clinical trial optimization', 'Safety prediction', 'Regulatory compliance']
        },
        {
          id: 'patient-monitoring',
          name: 'Patient Monitoring System',
          description: 'Real-time patient data analysis with early warning systems',
          features: ['Vital signs analysis', 'Risk prediction', 'Alert systems', 'EMR integration']
        }
      ]
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & Industry 4.0',
      icon: Factory,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      description: 'Smart manufacturing workflows with predictive maintenance and quality control',
      compliance: ['ISO 9001', 'ISO 27001', 'IEC 62443', 'GDPR'],
      workflows: [
        {
          id: 'predictive-maintenance',
          name: 'Predictive Maintenance',
          description: 'AI-powered equipment monitoring to prevent failures and optimize maintenance',
          features: ['IoT sensor integration', 'Failure prediction', 'Maintenance scheduling', 'Cost optimization']
        },
        {
          id: 'quality-control',
          name: 'Automated Quality Control',
          description: 'Computer vision-based quality inspection and defect detection',
          features: ['Visual inspection', 'Defect classification', 'Real-time alerts', 'Statistical reporting']
        },
        {
          id: 'supply-chain',
          name: 'Supply Chain Optimization',
          description: 'AI-driven supply chain planning and demand forecasting',
          features: ['Demand prediction', 'Inventory optimization', 'Supplier analysis', 'Risk assessment']
        }
      ]
    },
    {
      id: 'finance',
      name: 'Financial Services',
      icon: Banknote,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      description: 'Regulatory compliant AI for banking, insurance, and financial analysis',
      compliance: ['PCI DSS', 'SOX', 'Basel III', 'MiFID II', 'GDPR'],
      workflows: [
        {
          id: 'fraud-detection',
          name: 'Fraud Detection System',
          description: 'Real-time transaction monitoring and fraud prevention with AI',
          features: ['Transaction analysis', 'Behavioral modeling', 'Risk scoring', 'Real-time alerts']
        },
        {
          id: 'credit-scoring',
          name: 'AI Credit Scoring',
          description: 'Advanced credit risk assessment using alternative data sources',
          features: ['Alternative data', 'Risk modeling', 'Regulatory reporting', 'Bias detection']
        },
        {
          id: 'algorithmic-trading',
          name: 'Algorithmic Trading',
          description: 'AI-powered trading strategies with risk management',
          features: ['Market analysis', 'Strategy optimization', 'Risk controls', 'Performance tracking']
        }
      ]
    }
  ];

  const startDeployment = () => {
    setIsDeploying(true);
    setCurrentStep(3);
    
    setTimeout(() => {
      setResults(generateWorkflowResults());
      setIsDeploying(false);
      setCurrentStep(4);
    }, 4000);
  };

  const generateWorkflowResults = () => {
    const industry = industries.find(i => i.id === selectedIndustry);
    const workflow = industry?.workflows.find(w => w.id === selectedWorkflow);
    
    return {
      deployment: {
        status: 'Success',
        environment: 'Production',
        compliance_checks: 'Passed',
        security_scan: 'Clean',
        performance: 'Optimal'
      },
      workflow_details: {
        name: workflow?.name,
        industry: industry?.name,
        components_deployed: 12,
        apis_configured: 8,
        compliance_frameworks: industry?.compliance.length || 0
      },
      performance_metrics: {
        processing_speed: '< 100ms',
        accuracy: '96.8%',
        uptime: '99.9%',
        throughput: '10K req/min',
        latency: '45ms'
      },
      compliance_status: industry?.compliance.map(comp => ({
        framework: comp,
        status: 'Compliant',
        last_audit: '2024-01-15',
        next_review: '2024-07-15'
      })) || [],
      integration_points: [
        { system: 'Enterprise Data Warehouse', status: 'Connected', data_flow: 'Bidirectional' },
        { system: 'Customer Management System', status: 'Connected', data_flow: 'Read-only' },
        { system: 'Compliance Monitoring', status: 'Connected', data_flow: 'Write-only' },
        { system: 'Audit Logging System', status: 'Connected', data_flow: 'Write-only' }
      ],
      security_features: [
        'End-to-end encryption',
        'Role-based access control',
        'Audit trail logging',
        'Data anonymization',
        'Secure API endpoints',
        'Regular security scans'
      ],
      business_impact: {
        efficiency_gain: '+35%',
        cost_reduction: '€125K/year',
        compliance_score: '98/100',
        user_satisfaction: '4.7/5'
      }
    };
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setSelectedIndustry('');
    setSelectedWorkflow('');
    setResults(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 1: Select Industry</h3>
            <p className="text-slate-400 mb-6">
              Choose your industry to access specialized AI workflows with built-in compliance and best practices.
            </p>
            
            <div className="space-y-4">
              {industries.map((industry) => {
                const IconComponent = industry.icon;
                return (
                  <Card
                    key={industry.id}
                    className={`p-6 cursor-pointer transition-all ${
                      selectedIndustry === industry.id
                        ? `border-2 ${industry.bgColor.replace('/10', '/20')} ${industry.bgColor}`
                        : 'border-2 border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedIndustry(industry.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${industry.bgColor}`}>
                        <IconComponent className={`w-6 h-6 ${industry.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-semibold text-white">{industry.name}</h4>
                          {selectedIndustry === industry.id && (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          )}
                        </div>
                        <p className="text-slate-400 mb-4">{industry.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {industry.compliance.map((comp) => (
                            <Badge key={comp} variant="outline" className="text-xs">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-sm text-slate-500">
                          {industry.workflows.length} specialized workflows available
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!selectedIndustry}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                Next: Select Workflow <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );

      case 2:
        const selectedIndustryData = industries.find(i => i.id === selectedIndustry);
        
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 2: Configure Workflow</h3>
            <p className="text-slate-400 mb-6">
              Select and configure your {selectedIndustryData?.name} AI workflow.
            </p>
            
            <div className="space-y-6">
              {/* Workflow Selection */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Available Workflows</h4>
                <div className="space-y-3">
                  {selectedIndustryData?.workflows.map((workflow) => (
                    <Card
                      key={workflow.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedWorkflow === workflow.id
                          ? 'border-2 border-blue-500 bg-blue-500/10'
                          : 'border-2 border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => setSelectedWorkflow(workflow.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Target className="w-6 h-6 text-blue-400" />
                        <div className="flex-1">
                          <h5 className="text-white font-medium">{workflow.name}</h5>
                          <p className="text-slate-400 text-sm">{workflow.description}</p>
                        </div>
                        {selectedWorkflow === workflow.id && (
                          <CheckCircle className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {workflow.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Configuration Options */}
              {selectedWorkflow && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Workflow Configuration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Compliance Level</label>
                      <Select value={workflowConfig.complianceLevel} onValueChange={(value) => 
                        setWorkflowConfig(prev => ({ ...prev, complianceLevel: value }))
                      }>
                        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="basic">Basic Compliance</SelectItem>
                          <SelectItem value="standard">Standard Compliance</SelectItem>
                          <SelectItem value="strict">Strict Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Data Handling</label>
                      <Select value={workflowConfig.dataHandling} onValueChange={(value) => 
                        setWorkflowConfig(prev => ({ ...prev, dataHandling: value }))
                      }>
                        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="standard">Standard Security</SelectItem>
                          <SelectItem value="encrypted">End-to-End Encrypted</SelectItem>
                          <SelectItem value="anonymized">Anonymized Processing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="audit-trail"
                        checked={workflowConfig.auditTrail}
                        onChange={(e) => setWorkflowConfig(prev => ({ ...prev, auditTrail: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="audit-trail" className="text-white text-sm">
                        Enable comprehensive audit trail
                      </label>
                    </div>
                  </div>

                  <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
                    <h5 className="text-yellow-300 font-medium mb-2">⚖️ Compliance Requirements</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedIndustryData?.compliance.map((comp) => (
                        <Badge key={comp} variant="outline" className="text-yellow-300 border-yellow-500">
                          {comp} Compliant
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={startDeployment}
                disabled={!selectedWorkflow}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Deploy Workflow
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 3: Deploying Industry Workflow...</h3>
            <p className="text-slate-400 mb-6">
              Setting up {selectedIndustryData?.name} workflow with compliance checks and security scanning
            </p>
            
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Components</div>
                <div className="text-white font-medium">12/12</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Compliance</div>
                <div className="text-green-400 font-medium">Passed</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Security</div>
                <div className="text-blue-400 font-medium">Scanning...</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Status</div>
                <div className="text-purple-400 font-medium">87%</div>
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Deployment Success */}
            <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
              <div className="flex items-center gap-4 mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
                <div>
                  <h3 className="text-2xl font-semibold text-white">Workflow Deployed Successfully!</h3>
                  <p className="text-green-200">
                    {results?.workflow_details.name} is now running in production with full compliance
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Building className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.workflow_details.components_deployed}</div>
                  <div className="text-sm text-slate-400">Components</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.performance_metrics.processing_speed}</div>
                  <div className="text-sm text-slate-400">Response Time</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.performance_metrics.accuracy}</div>
                  <div className="text-sm text-slate-400">Accuracy</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <CheckCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.workflow_details.compliance_frameworks}</div>
                  <div className="text-sm text-slate-400">Compliance</div>
                </Card>
              </div>
            </Card>

            {/* Compliance Status */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results?.compliance_status.map((comp: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-white font-medium">{comp.framework}</h5>
                      <Badge variant="green">Compliant</Badge>
                    </div>
                    <div className="text-xs text-slate-400">
                      Last audit: {comp.last_audit} | Next review: {comp.next_review}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Integration Points */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">System Integrations</h3>
              <div className="space-y-3">
                {results?.integration_points.map((integration: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-white font-medium">{integration.system}</h5>
                        <p className="text-slate-400 text-sm">Data flow: {integration.data_flow}</p>
                      </div>
                      <Badge variant="green">{integration.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Security Features */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Security Features Enabled</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results?.security_features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-slate-700 rounded">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Business Impact */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Expected Business Impact</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(results?.business_impact || {}).map(([metric, value]) => (
                  <Card key={metric} className="p-4 bg-slate-700 text-center">
                    <div className="text-xl font-bold text-green-400">{value as string}</div>
                    <div className="text-xs text-slate-400 capitalize">
                      {metric.replace('_', ' ')}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button onClick={resetWorkflow} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Deploy New Workflow
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Configuration
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manage Workflow
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Header */}
      <Card className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Building className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-indigo-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Access specialized AI workflows designed for healthcare, manufacturing, and financial services 
          with built-in compliance, security, and industry best practices.
        </p>
      </Card>

      {/* Progress Steps */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-indigo-500' : 'bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Industry</span>
          <span>Workflow</span>
          <span>Deploy</span>
          <span>Results</span>
        </div>
      </Card>

      {/* Main Content */}
      {renderStep()}
    </div>
  );
}
