'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  FileText, 
  Upload, 
  Download, 
  Settings, 
  Target,
  Clock,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Activity,
  Database,
  Cpu,
  DollarSign,
  Award,
  ArrowLeft,
  Star,
  Shield,
  Brain,
  Layers,
  BarChart,
  PieChart,
  LineChart,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Save,
  Share2,
  Copy,
  ExternalLink,
  File,
  Image,
  Video,
  Archive,
  Code,
  BookOpen,
  Users,
  Building,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

interface ProfessionalDocumentTemplateServiceProps {
  service: any;
}

export default function ProfessionalDocumentTemplateService({ service }: ProfessionalDocumentTemplateServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [processingConfig, setProcessingConfig] = useState({
    outputFormat: 'structured',
    language: 'english',
    quality: 'high',
    includeMetadata: true,
    extractEntities: true,
    generateSummary: true,
    complianceCheck: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<any>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentProcess, setCurrentProcess] = useState('');

  // Professional Document Templates
  const documentTemplates = [
    {
      id: 'legal-contract',
      name: 'Legal Contract Analysis',
      description: 'Extract key terms, clauses, and obligations from legal documents',
      category: 'Legal',
      icon: <Shield className="w-6 h-6" />,
      features: ['Contract Terms Extraction', 'Obligation Analysis', 'Risk Assessment', 'Compliance Check'],
      supportedFormats: ['PDF', 'DOCX', 'TXT'],
      processingTime: '2-5 minutes',
      accuracy: '95%',
      cost: '$0.15/page',
      useCases: ['Contract Review', 'Due Diligence', 'Legal Research', 'Compliance Monitoring']
    },
    {
      id: 'technical-spec',
      name: 'Technical Specification',
      description: 'Parse technical documents and extract structured specifications',
      category: 'Technical',
      icon: <Code className="w-6 h-6" />,
      features: ['Specification Extraction', 'Technical Requirements', 'API Documentation', 'Code Analysis'],
      supportedFormats: ['PDF', 'MD', 'TXT', 'DOCX'],
      processingTime: '3-7 minutes',
      accuracy: '92%',
      cost: '$0.12/page',
      useCases: ['API Documentation', 'Technical Writing', 'Software Development', 'System Design']
    },
    {
      id: 'financial-report',
      name: 'Financial Report Analysis',
      description: 'Extract financial data, metrics, and insights from reports',
      category: 'Financial',
      icon: <DollarSign className="w-6 h-6" />,
      features: ['Financial Data Extraction', 'Metrics Analysis', 'Trend Identification', 'Risk Assessment'],
      supportedFormats: ['PDF', 'XLSX', 'CSV', 'DOCX'],
      processingTime: '4-8 minutes',
      accuracy: '98%',
      cost: '$0.20/page',
      useCases: ['Financial Analysis', 'Investment Research', 'Audit Preparation', 'Compliance Reporting']
    },
    {
      id: 'research-paper',
      name: 'Research Paper Processing',
      description: 'Analyze academic papers and extract structured research data',
      category: 'Academic',
      icon: <BookOpen className="w-6 h-6" />,
      features: ['Citation Extraction', 'Methodology Analysis', 'Results Processing', 'Abstract Generation'],
      supportedFormats: ['PDF', 'DOCX', 'TXT'],
      processingTime: '5-10 minutes',
      accuracy: '94%',
      cost: '$0.18/page',
      useCases: ['Literature Review', 'Research Analysis', 'Academic Writing', 'Knowledge Extraction']
    },
    {
      id: 'business-proposal',
      name: 'Business Proposal Analysis',
      description: 'Extract key information from business proposals and presentations',
      category: 'Business',
      icon: <Building className="w-6 h-6" />,
      features: ['Proposal Analysis', 'Budget Extraction', 'Timeline Processing', 'Stakeholder Identification'],
      supportedFormats: ['PDF', 'PPTX', 'DOCX', 'TXT'],
      processingTime: '3-6 minutes',
      accuracy: '90%',
      cost: '$0.14/page',
      useCases: ['Proposal Review', 'Business Analysis', 'Project Planning', 'Decision Support']
    },
    {
      id: 'compliance-doc',
      name: 'Compliance Documentation',
      description: 'Process compliance documents and ensure regulatory adherence',
      category: 'Compliance',
      icon: <Shield className="w-6 h-6" />,
      features: ['Compliance Check', 'Regulation Mapping', 'Risk Assessment', 'Audit Trail'],
      supportedFormats: ['PDF', 'DOCX', 'TXT', 'HTML'],
      processingTime: '4-9 minutes',
      accuracy: '96%',
      cost: '$0.16/page',
      useCases: ['Regulatory Compliance', 'Audit Preparation', 'Risk Management', 'Policy Analysis']
    }
  ];

  // Document Processing Workflows
  const processingWorkflows = [
    {
      id: 'batch-processing',
      name: 'Batch Document Processing',
      description: 'Process multiple documents simultaneously with advanced queuing',
      features: ['Parallel Processing', 'Queue Management', 'Progress Tracking', 'Error Handling'],
      maxFiles: 100,
      processingTime: '5-15 minutes',
      cost: '$0.10/page'
    },
    {
      id: 'real-time-processing',
      name: 'Real-time Document Analysis',
      description: 'Instant document processing with live feedback and validation',
      features: ['Live Processing', 'Real-time Validation', 'Interactive Results', 'Instant Feedback'],
      maxFiles: 10,
      processingTime: '30-60 seconds',
      cost: '$0.25/page'
    },
    {
      id: 'ai-enhanced',
      name: 'AI-Enhanced Processing',
      description: 'Advanced AI-powered document analysis with machine learning insights',
      features: ['ML Insights', 'Pattern Recognition', 'Predictive Analysis', 'Smart Recommendations'],
      maxFiles: 50,
      processingTime: '3-8 minutes',
      cost: '$0.30/page'
    }
  ];

  // Output Formats
  const outputFormats = [
    {
      id: 'structured-json',
      name: 'Structured JSON',
      description: 'Machine-readable structured data format',
      icon: <Code className="w-5 h-5" />,
      useCase: 'API Integration, Database Storage'
    },
    {
      id: 'excel-spreadsheet',
      name: 'Excel Spreadsheet',
      description: 'Tabular format for data analysis and reporting',
      icon: <BarChart className="w-5 h-5" />,
      useCase: 'Data Analysis, Business Intelligence'
    },
    {
      id: 'pdf-report',
      name: 'PDF Report',
      description: 'Professional formatted report with visualizations',
      icon: <FileText className="w-5 h-5" />,
      useCase: 'Executive Reports, Client Presentations'
    },
    {
      id: 'xml-structured',
      name: 'XML Structured',
      description: 'Hierarchical structured data format',
      icon: <Layers className="w-5 h-5" />,
      useCase: 'Enterprise Systems, Data Exchange'
    }
  ];

  const startProcessing = () => {
    if (selectedTemplates.length === 0) {
      alert('Please select at least one template');
      return;
    }

    // For demo version, create mock files if none uploaded
    if (uploadedFiles.length === 0) {
      const mockFiles = [
        {
          id: Date.now() + 1,
          name: 'sample-contract.pdf',
          size: 1024000,
          type: 'application/pdf',
          uploadTime: new Date().toISOString()
        },
        {
          id: Date.now() + 2,
          name: 'technical-spec.docx',
          size: 512000,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          uploadTime: new Date().toISOString()
        },
        {
          id: Date.now() + 3,
          name: 'financial-report.pdf',
          size: 768000,
          type: 'application/pdf',
          uploadTime: new Date().toISOString()
        }
      ];
      setUploadedFiles(mockFiles);
    }

    setIsProcessing(true);
    setCurrentStep(3);
    setProcessingProgress(0);
    setCurrentProcess('Initializing document processing...');

    const processingSteps = [
      'Uploading files to secure processing environment...',
      'Analyzing document structure and content...',
      'Applying selected templates and extraction rules...',
      'Running AI-powered content analysis...',
      'Generating structured outputs...',
      'Performing quality validation...',
      'Finalizing results and reports...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + Math.random() * 12;
        if (newProgress >= 100) {
          clearInterval(interval);
          generateResults();
          return 100;
        }
        return newProgress;
      });

      if (stepIndex < processingSteps.length) {
        setCurrentProcess(processingSteps[stepIndex]);
        stepIndex++;
      }
    }, 1500);
  };

  const generateResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      duration: '3m 45s',
      templates: selectedTemplates,
      filesProcessed: uploadedFiles.length,
      config: processingConfig,
      results: uploadedFiles.map((file, index) => {
        const template = documentTemplates.find(t => selectedTemplates.includes(t.id));
        return {
          fileName: file.name,
          fileSize: file.size,
          template: template?.name,
          processingTime: `${Math.random() * 3 + 1}m ${Math.floor(Math.random() * 60)}s`,
          extractedData: {
            entities: Math.floor(Math.random() * 50) + 20,
            keyPhrases: Math.floor(Math.random() * 100) + 50,
            sentences: Math.floor(Math.random() * 200) + 100,
            confidence: Math.random() * 10 + 85
          },
          quality: {
            accuracy: Math.random() * 10 + 85,
            completeness: Math.random() * 10 + 80,
            consistency: Math.random() * 10 + 88
          },
          insights: [
            'High confidence in entity extraction',
            'Strong semantic structure detected',
            'Compliance requirements identified',
            'Key stakeholders identified'
          ],
          cost: template?.cost || '$0.15/page'
        };
      }),
      summary: {
        totalFiles: uploadedFiles.length,
        totalProcessingTime: '3m 45s',
        averageAccuracy: 92.5,
        totalCost: '$12.50',
        templatesUsed: selectedTemplates.length,
        dataExtracted: {
          entities: Math.floor(Math.random() * 200) + 100,
          keyPhrases: Math.floor(Math.random() * 500) + 300,
          sentences: Math.floor(Math.random() * 1000) + 500
        }
      },
      analytics: {
        processingTime: [
          { file: 'contract1.pdf', time: 2.3 },
          { file: 'spec2.docx', time: 3.1 },
          { file: 'report3.pdf', time: 4.2 },
          { file: 'proposal4.docx', time: 2.8 }
        ],
        accuracyByTemplate: [
          { template: 'Legal Contract', accuracy: 95 },
          { template: 'Technical Spec', accuracy: 92 },
          { template: 'Financial Report', accuracy: 98 },
          { template: 'Research Paper', accuracy: 94 }
        ],
        costAnalysis: [
          { template: 'Legal Contract', cost: 4.50, pages: 30 },
          { template: 'Technical Spec', cost: 3.60, pages: 30 },
          { template: 'Financial Report', cost: 6.00, pages: 30 },
          { template: 'Research Paper', cost: 5.40, pages: 30 }
        ]
      }
    };

    setProcessingResults(results);
    setIsProcessing(false);
    setCurrentStep(4);
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTime: new Date().toISOString()
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Template Selection';
      case 2: return 'Document Upload & Configuration';
      case 3: return 'Processing Documents';
      case 4: return 'Results & Analysis';
      default: return 'Document Template Processing';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Choose from our professional document processing templates';
      case 2: return 'Upload your documents and configure processing options';
      case 3: return 'AI-powered document analysis in progress';
      case 4: return 'Review extracted data and download structured outputs';
      default: return 'Professional document processing and analysis system';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{getStepTitle(currentStep)}</h2>
        <p className="text-slate-400">{getStepDescription(currentStep)}</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-8 h-0.5 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Template Selection */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Professional Document Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => toggleTemplate(template.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTemplates.includes(template.id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {template.icon}
                    <h4 className="font-semibold text-white">{template.name}</h4>
                  </div>
                  <Badge variant="accent">{template.category}</Badge>
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Accuracy:</span>
                    <span className="text-green-400 font-medium">{template.accuracy}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Processing Time:</span>
                    <span className="text-white">{template.processingTime}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-white">{template.cost}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 2).map((feature) => (
                      <Badge key={feature} variant="gray" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {template.features.length > 2 && (
                      <Badge variant="gray" className="text-xs">
                        +{template.features.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <div>Formats: {template.supportedFormats.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-4">
              Selected: {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''}
            </p>
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={selectedTemplates.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upload Documents
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Document Upload & Configuration */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* File Upload */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Document Upload</h3>
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">Upload Documents</h4>
              <p className="text-gray-400 mb-4">Drag and drop files here or click to browse</p>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.doc,.xlsx,.csv,.pptx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </label>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Demo Mode:</strong> File upload is optional. You can proceed without uploading files to see the demo workflow.
                </p>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-lg font-medium text-white">Uploaded Files</h4>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">{file.name}</div>
                        <div className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeFile(file.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Processing Configuration */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Processing Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Output Format</label>
                <select
                  value={processingConfig.outputFormat}
                  onChange={(e) => setProcessingConfig(prev => ({ ...prev, outputFormat: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="structured">Structured JSON</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="pdf">PDF Report</option>
                  <option value="xml">XML Structured</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Language</label>
                <select
                  value={processingConfig.language}
                  onChange={(e) => setProcessingConfig(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="english">English</option>
                  <option value="finnish">Finnish</option>
                  <option value="swedish">Swedish</option>
                  <option value="german">German</option>
                  <option value="french">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Quality Level</label>
                <select
                  value={processingConfig.quality}
                  onChange={(e) => setProcessingConfig(prev => ({ ...prev, quality: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="standard">Standard</option>
                  <option value="high">High</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Processing Workflow</label>
                <select className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  <option value="batch">Batch Processing</option>
                  <option value="realtime">Real-time Processing</option>
                  <option value="ai-enhanced">AI-Enhanced Processing</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-medium text-white mb-3">Processing Options</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={processingConfig.includeMetadata}
                    onChange={(e) => setProcessingConfig(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-white text-sm">Include Metadata</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={processingConfig.extractEntities}
                    onChange={(e) => setProcessingConfig(prev => ({ ...prev, extractEntities: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-white text-sm">Extract Entities</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={processingConfig.generateSummary}
                    onChange={(e) => setProcessingConfig(prev => ({ ...prev, generateSummary: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-white text-sm">Generate Summary</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={processingConfig.complianceCheck}
                    onChange={(e) => setProcessingConfig(prev => ({ ...prev, complianceCheck: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-white text-sm">Compliance Check</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex justify-between items-center">
            <Button 
              onClick={() => setCurrentStep(1)}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            <Button 
              onClick={startProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              {uploadedFiles.length === 0 ? 'Start Demo Processing' : 'Start Processing'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Processing Documents */}
      {currentStep === 3 && (
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Processing Documents</h3>
            <p className="text-gray-400 mb-6">AI-powered document analysis in progress</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mb-6">{Math.round(processingProgress)}% Complete</p>
            
            {/* Current Process */}
            {currentProcess && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-white">{currentProcess}</p>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400">Files</div>
                <div className="text-white font-semibold">{uploadedFiles.length}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400">Templates</div>
                <div className="text-white font-semibold">{selectedTemplates.length}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400">Format</div>
                <div className="text-white font-semibold">{processingConfig.outputFormat}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Results & Analysis */}
      {currentStep === 4 && processingResults && (
        <div className="space-y-6">
          {/* Results Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Processing Results</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
                <Button onClick={() => setCurrentStep(1)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Processing
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Files Processed</div>
                <div className="text-white font-semibold">{processingResults.summary.totalFiles}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Processing Time</div>
                <div className="text-white font-semibold">{processingResults.summary.totalProcessingTime}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Average Accuracy</div>
                <div className="text-green-400 font-semibold">{processingResults.summary.averageAccuracy}%</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Total Cost</div>
                <div className="text-white font-semibold">{processingResults.summary.totalCost}</div>
              </div>
            </div>
          </Card>

          {/* Processing Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Processing Time by File</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={processingResults.analytics.processingTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="file" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Bar dataKey="time" fill="#3B82F6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Accuracy by Template</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={processingResults.analytics.accuracyByTemplate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="template" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Bar dataKey="accuracy" fill="#10B981" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Detailed Results */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">File Processing Details</h4>
            <div className="space-y-4">
              {processingResults.results.map((result: any, index: number) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">{result.fileName}</div>
                        <div className="text-gray-400 text-sm">{result.template} • {result.processingTime}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Entities</div>
                      <div className="text-white font-medium">{result.extractedData.entities}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Key Phrases</div>
                      <div className="text-white font-medium">{result.extractedData.keyPhrases}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Accuracy</div>
                      <div className="text-green-400 font-medium">{result.quality.accuracy.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Cost</div>
                      <div className="text-white font-medium">{result.cost}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Data Extraction Summary */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Data Extraction Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{processingResults.summary.dataExtracted.entities}</div>
                <div className="text-gray-400">Entities Extracted</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{processingResults.summary.dataExtracted.keyPhrases}</div>
                <div className="text-gray-400">Key Phrases</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{processingResults.summary.dataExtracted.sentences}</div>
                <div className="text-gray-400">Sentences Processed</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Demo Notice */}
      <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-yellow-400 font-medium">Demo Version</span>
        </div>
        <p className="text-yellow-300 text-sm mt-1">
          This is a demonstration of our professional document processing system. In production, this would connect to real AI services for document analysis.
        </p>
      </Card>
    </div>
  );
}
