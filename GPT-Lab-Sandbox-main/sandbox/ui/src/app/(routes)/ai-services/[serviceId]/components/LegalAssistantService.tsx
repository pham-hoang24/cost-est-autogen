'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { 
  Scale, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Download,
  Settings,
  Brain,
  Search,
  AlertTriangle,
  Shield,
  Book,
  Target
} from 'lucide-react';
import { Badge } from '@/components/Badge';

interface LegalAssistantServiceProps {
  service: any;
}

export default function LegalAssistantService({ service }: LegalAssistantServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [queryType, setQueryType] = useState('');
  const [legalQuery, setLegalQuery] = useState('');
  const [contextDocuments, setContextDocuments] = useState<File[]>([]);
  const [jurisdiction, setJurisdiction] = useState('EU');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const queryTypes = [
    {
      id: 'gdpr-compliance',
      name: 'GDPR Compliance Check',
      description: 'Analyze data processing activities for GDPR compliance',
      icon: '🔒',
      complexity: 'Medium',
      typical_queries: ['Data retention policies', 'Consent management', 'Right to be forgotten']
    },
    {
      id: 'ai-act-compliance',
      name: 'EU AI Act Compliance',
      description: 'Assess AI systems against EU AI Act requirements',
      icon: '🤖',
      complexity: 'High',
      typical_queries: ['Risk classification', 'Transparency obligations', 'Human oversight']
    },
    {
      id: 'contract-analysis',
      name: 'Contract Analysis',
      description: 'Review contracts for risks, obligations, and compliance',
      icon: '📋',
      complexity: 'High',
      typical_queries: ['Liability clauses', 'Data processing terms', 'SLA requirements']
    },
    {
      id: 'policy-drafting',
      name: 'Policy Drafting Assistance',
      description: 'Help draft privacy policies, terms of service, and compliance documents',
      icon: '✍️',
      complexity: 'Medium',
      typical_queries: ['Privacy policy templates', 'Cookie policies', 'Data processing agreements']
    },
    {
      id: 'risk-assessment',
      name: 'Legal Risk Assessment',
      description: 'Identify and assess legal risks in business processes',
      icon: '⚖️',
      complexity: 'High',
      typical_queries: ['Cross-border data transfers', 'Third-party integrations', 'Regulatory changes']
    }
  ];

  const jurisdictions = [
    { id: 'EU', name: 'European Union', frameworks: ['GDPR', 'EU AI Act', 'DGA', 'DSA'] },
    { id: 'US', name: 'United States', frameworks: ['CCPA', 'HIPAA', 'SOX', 'COPPA'] },
    { id: 'UK', name: 'United Kingdom', frameworks: ['UK GDPR', 'DPA 2018', 'UK AI White Paper'] },
    { id: 'GLOBAL', name: 'Global/Multi-jurisdiction', frameworks: ['ISO 27001', 'SOC 2', 'PCI DSS'] }
  ];

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setContextDocuments(files);
  };

  const processQuery = () => {
    setIsProcessing(true);
    setCurrentStep(3);
    
    setTimeout(() => {
      setResults(generateLegalAnalysis());
      setIsProcessing(false);
      setCurrentStep(4);
    }, 4000);
  };

  const generateLegalAnalysis = () => {
    const selectedQuery = queryTypes.find(q => q.id === queryType);
    const selectedJurisdiction = jurisdictions.find(j => j.id === jurisdiction);
    
    return {
      analysis_summary: {
        query_type: selectedQuery?.name,
        jurisdiction: selectedJurisdiction?.name,
        confidence: 0.91,
        processing_time: '2.3 seconds',
        sources_consulted: 47,
        regulations_checked: selectedJurisdiction?.frameworks.length || 4
      },
      legal_opinion: {
        main_finding: queryType === 'gdpr-compliance' 
          ? 'The described data processing activities appear to be GDPR compliant with minor recommendations for improvement.'
          : queryType === 'ai-act-compliance'
          ? 'The AI system falls under limited risk category according to EU AI Act classification with specific transparency requirements.'
          : 'Legal analysis complete with actionable recommendations for compliance and risk mitigation.',
        compliance_status: 'Mostly Compliant',
        risk_level: 'Low to Medium',
        confidence_score: 0.91
      },
      key_findings: [
        {
          category: 'Compliance Requirements',
          finding: 'Data processing lawful basis is clearly established under GDPR Article 6(1)(b)',
          impact: 'Positive',
          action_required: false
        },
        {
          category: 'Privacy Rights',
          finding: 'Data subject rights procedures need documentation updates',
          impact: 'Medium',
          action_required: true,
          recommendation: 'Update privacy policy section 4.2 to include detailed rights exercise procedures'
        },
        {
          category: 'Data Transfers',
          finding: 'International data transfers require additional safeguards',
          impact: 'High',
          action_required: true,
          recommendation: 'Implement Standard Contractual Clauses (SCCs) for third-country transfers'
        },
        {
          category: 'Technical Measures',
          finding: 'Encryption and access controls meet regulatory standards',
          impact: 'Positive',
          action_required: false
        }
      ],
      regulatory_framework: selectedJurisdiction?.frameworks.map(framework => ({
        name: framework,
        status: Math.random() > 0.3 ? 'Compliant' : 'Needs Review',
        last_updated: '2024-01-15',
        next_review: '2024-07-15',
        key_requirements: framework === 'GDPR' 
          ? ['Lawful basis', 'Data minimization', 'Subject rights', 'Data protection by design']
          : framework === 'EU AI Act'
          ? ['Risk assessment', 'Transparency', 'Human oversight', 'Accuracy requirements']
          : ['Standard requirements', 'Compliance monitoring', 'Regular audits']
      })) || [],
      recommendations: [
        {
          priority: 'High',
          action: 'Update Data Processing Agreement templates',
          timeline: '2 weeks',
          effort: 'Legal team + 1 week consultant',
          impact: 'Ensures all vendor contracts are GDPR compliant'
        },
        {
          priority: 'Medium',
          action: 'Implement automated consent management',
          timeline: '4-6 weeks',
          effort: 'Development team + legal review',
          impact: 'Streamlines consent collection and management'
        },
        {
          priority: 'Medium',
          action: 'Conduct privacy impact assessment',
          timeline: '3 weeks',
          effort: 'Legal + compliance team',
          impact: 'Identifies and mitigates privacy risks'
        },
        {
          priority: 'Low',
          action: 'Update employee privacy training',
          timeline: '1 week',
          effort: 'HR + legal team',
          impact: 'Ensures staff understand privacy obligations'
        }
      ],
      legal_documents: [
        {
          type: 'Privacy Policy Template',
          description: 'GDPR-compliant privacy policy template customized for your use case',
          format: 'DOCX',
          pages: 12
        },
        {
          type: 'Data Processing Agreement',
          description: 'Standard contractual clauses for vendor relationships',
          format: 'PDF',
          pages: 8
        },
        {
          type: 'Compliance Checklist',
          description: 'Step-by-step compliance verification checklist',
          format: 'PDF',
          pages: 6
        },
        {
          type: 'Risk Assessment Report',
          description: 'Detailed legal risk analysis and mitigation strategies',
          format: 'PDF',
          pages: 15
        }
      ]
    };
  };

  const resetAnalysis = () => {
    setCurrentStep(1);
    setQueryType('');
    setLegalQuery('');
    setContextDocuments([]);
    setResults(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 1: Legal Query Configuration</h3>
            
            <div className="space-y-6">
              {/* Query Type Selection */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Select Legal Analysis Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {queryTypes.map((query) => (
                    <Card
                      key={query.id}
                      className={`p-4 cursor-pointer transition-all ${
                        queryType === query.id
                          ? 'border-2 border-blue-500 bg-blue-500/10'
                          : 'border-2 border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => setQueryType(query.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{query.icon}</span>
                        <div>
                          <h5 className="text-white font-medium">{query.name}</h5>
                          <Badge variant="secondary" className="text-xs">{query.complexity}</Badge>
                        </div>
                        {queryType === query.id && (
                          <CheckCircle className="w-5 h-5 text-blue-400 ml-auto" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{query.description}</p>
                      <div className="text-xs text-slate-500">
                        Examples: {query.typical_queries.slice(0, 2).join(', ')}
                        {query.typical_queries.length > 2 && '...'}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Jurisdiction Selection */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Select Jurisdiction</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {jurisdictions.map((juris) => (
                    <Card
                      key={juris.id}
                      className={`p-3 cursor-pointer transition-all ${
                        jurisdiction === juris.id
                          ? 'border-2 border-green-500 bg-green-500/10'
                          : 'border-2 border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => setJurisdiction(juris.id)}
                    >
                      <div className="text-center">
                        <h5 className="text-white font-medium mb-1">{juris.name}</h5>
                        <div className="text-xs text-slate-400">
                          {juris.frameworks.length} frameworks
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Legal Query Input */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Describe Your Legal Question</h4>
                <Textarea
                  placeholder="Describe your legal question in detail... (e.g., 'We are implementing a new AI chatbot that processes customer data. What GDPR requirements apply?')"
                  value={legalQuery}
                  onChange={(e) => setLegalQuery(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Context Documents */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Upload Context Documents (Optional)</h4>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400 mb-3">
                    Upload relevant contracts, policies, or documents for context
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Choose Documents
                    </Button>
                  </label>
                </div>

                {contextDocuments.length > 0 && (
                  <Card className="p-3 bg-slate-700 mt-3">
                    <h5 className="text-white font-medium mb-2">Uploaded Documents ({contextDocuments.length})</h5>
                    <div className="space-y-1">
                      {contextDocuments.slice(0, 3).map((doc, index) => (
                        <div key={index} className="text-sm text-slate-300">
                          📄 {doc.name}
                        </div>
                      ))}
                      {contextDocuments.length > 3 && (
                        <div className="text-sm text-slate-400">
                          +{contextDocuments.length - 3} more documents
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!queryType || !legalQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                Next: Review & Submit <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 2: Review Legal Query</h3>
            
            <div className="space-y-4">
              <Card className="p-4 bg-slate-700 border-slate-600">
                <h4 className="text-white font-medium mb-3">Query Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Analysis Type:</span>
                    <span className="text-white ml-2">{queryTypes.find(q => q.id === queryType)?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Jurisdiction:</span>
                    <span className="text-white ml-2">{jurisdictions.find(j => j.id === jurisdiction)?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Context Documents:</span>
                    <span className="text-white ml-2">{contextDocuments.length} uploaded</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Query Length:</span>
                    <span className="text-white ml-2">{legalQuery.length} characters</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-700 border-slate-600">
                <h4 className="text-white font-medium mb-2">Your Legal Question</h4>
                <p className="text-slate-300 text-sm italic">"{legalQuery}"</p>
              </Card>

              <Card className="p-4 bg-blue-500/10 border-blue-500/20">
                <h4 className="text-blue-300 font-medium mb-2">🧠 AI Legal Analysis Preview</h4>
                <p className="text-blue-200 text-sm">
                  The Legal Assistant LLM will analyze your query against {jurisdictions.find(j => j.id === jurisdiction)?.frameworks.length} 
                  regulatory frameworks and provide detailed compliance guidance with citations and recommendations.
                </p>
              </Card>
            </div>

            <div className="flex justify-between mt-6">
              <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={processQuery}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Analyze Legal Query
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 3: Analyzing Legal Requirements...</h3>
            <p className="text-slate-400 mb-6">
              Legal Assistant LLM is analyzing your query against {jurisdictions.find(j => j.id === jurisdiction)?.frameworks.length} regulatory frameworks
            </p>
            
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Sources</div>
                <div className="text-white font-medium">47/52</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Frameworks</div>
                <div className="text-blue-400 font-medium">{jurisdictions.find(j => j.id === jurisdiction)?.frameworks.length}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Analysis</div>
                <div className="text-green-400 font-medium">89%</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Confidence</div>
                <div className="text-purple-400 font-medium">91%</div>
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-500/20">
              <div className="flex items-center gap-4 mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
                <div>
                  <h3 className="text-2xl font-semibold text-white">Legal Analysis Complete</h3>
                  <p className="text-blue-200">
                    {results?.analysis_summary.confidence * 100}% confidence | {results?.analysis_summary.sources_consulted} sources consulted
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Scale className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.legal_opinion.compliance_status}</div>
                  <div className="text-sm text-slate-400">Compliance Status</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.legal_opinion.risk_level}</div>
                  <div className="text-sm text-slate-400">Risk Level</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Book className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.analysis_summary.sources_consulted}</div>
                  <div className="text-sm text-slate-400">Sources</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{(results?.analysis_summary.confidence * 100).toFixed(0)}%</div>
                  <div className="text-sm text-slate-400">Confidence</div>
                </Card>
              </div>
            </Card>

            {/* Legal Opinion */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Legal Opinion</h3>
              <Card className="p-4 bg-slate-700 border-slate-600">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {results?.legal_opinion.main_finding}
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">
                    {results?.legal_opinion.compliance_status}
                  </Badge>
                  <Badge variant={results?.legal_opinion.risk_level.includes('Low') ? 'green' : 'yellow'}>
                    {results?.legal_opinion.risk_level} Risk
                  </Badge>
                </div>
              </Card>
            </Card>

            {/* Key Findings */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Key Findings</h3>
              <div className="space-y-3">
                {results?.key_findings.map((finding: any, index: number) => (
                  <Card key={index} className={`p-4 border-l-4 ${
                    finding.impact === 'Positive' ? 'border-l-green-500 bg-green-500/5' :
                    finding.impact === 'High' ? 'border-l-red-500 bg-red-500/5' :
                    'border-l-yellow-500 bg-yellow-500/5'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="text-white font-medium">{finding.category}</h5>
                        <p className="text-slate-400 text-sm">{finding.finding}</p>
                        {finding.recommendation && (
                          <p className="text-green-300 text-xs mt-1">
                            <strong>Recommendation:</strong> {finding.recommendation}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={
                          finding.impact === 'Positive' ? 'green' :
                          finding.impact === 'High' ? 'red' : 'yellow'
                        }>
                          {finding.impact}
                        </Badge>
                        {finding.action_required && (
                          <Badge variant="outline" className="text-xs">Action Required</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Regulatory Framework Status */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Regulatory Framework Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results?.regulatory_framework.map((framework: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-white font-medium">{framework.name}</h5>
                      <Badge variant={framework.status === 'Compliant' ? 'green' : 'yellow'}>
                        {framework.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      Last updated: {framework.last_updated} | Next review: {framework.next_review}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {framework.key_requirements.slice(0, 3).map((req: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{req}</Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Action Plan & Recommendations</h3>
              <div className="space-y-3">
                {results?.recommendations.map((rec: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-white font-medium">{rec.action}</h5>
                      <Badge variant={rec.priority === 'High' ? 'red' : rec.priority === 'Medium' ? 'yellow' : 'green'}>
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{rec.impact}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                      <div>
                        <strong>Timeline:</strong> {rec.timeline}
                      </div>
                      <div>
                        <strong>Effort:</strong> {rec.effort}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Generated Documents */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Generated Legal Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results?.legal_documents.map((doc: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-white font-medium">{doc.type}</h5>
                      <Badge variant="secondary" className="text-xs">{doc.format}</Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{doc.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">{doc.pages} pages</span>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button onClick={resetAnalysis} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                New Legal Query
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Analysis
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Schedule Legal Review
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
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-blue-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Specialized Legal Assistant LLM trained on GDPR, EU AI Act, and privacy regulations. 
          Get expert legal guidance, compliance analysis, and automated document generation.
        </p>
      </Card>

      {/* Progress Steps */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-blue-500' : 'bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Query Setup</span>
          <span>Review</span>
          <span>Analysis</span>
          <span>Results</span>
        </div>
      </Card>

      {/* Main Content */}
      {renderStep()}
    </div>
  );
}
