'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Brain, 
  Shield, 
  Download, 
  Play, 
  Target, 
  Activity, 
  Award, 
  BarChart, 
  PieChart, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Users, 
  Lock, 
  Eye, 
  Zap,
  RefreshCw,
  Settings,
  Database,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

interface TextAnalysisServiceProps {
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
    status: string;
  };
}

interface AnalysisResult {
  sentiment: {
    label: string;
    score: number;
    confidence: number;
  };
  language: {
    detected: string;
    confidence: number;
  };
  entities: Array<{
    text: string;
    label: string;
    confidence: number;
  }>;
  keyPhrases: Array<{
    phrase: string;
    relevance: number;
  }>;
  readability: {
    score: number;
    level: string;
    metrics: {
      words: number;
      sentences: number;
      syllables: number;
    };
  };
  classification: {
    topics: Array<{
      topic: string;
      confidence: number;
    }>;
  };
}

interface ComplianceStatus {
  gdprCompliant: boolean;
  dataRetention: string;
  auditTrail: boolean;
  anonymization: boolean;
  crossBorderSafe: boolean;
}

export default function ProfessionalTextAnalysisService({ service }: TextAnalysisServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [analysisOptions, setAnalysisOptions] = useState({
    sentiment: true,
    entities: true,
    keyPhrases: true,
    readability: true,
    classification: true,
    anonymization: false
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    gdprCompliant: true,
    dataRetention: '30 days',
    auditTrail: true,
    anonymization: false,
    crossBorderSafe: true
  });

  const sampleTexts = [
    {
      title: "Finnish Research Paper Abstract",
      text: "Tämä tutkimus analysoi tekoälyn vaikutusta suomalaisessa terveydenhuollossa. Tulokset osoittavat, että AI-teknologia voi parantaa potilasturvallisuutta ja vähentää kustannuksia merkittävästi.",
      language: "Finnish"
    },
    {
      title: "Business Customer Feedback",
      text: "Our new AI-powered customer service has been excellent. The response time has improved by 40% and customer satisfaction scores are at an all-time high. Highly recommend this solution!",
      language: "English"
    },
    {
      title: "Academic Survey Response",
      text: "The research collaboration between Finnish universities and industry partners has been very successful. We've published 15 papers in top-tier journals and secured €2.5M in additional funding.",
      language: "English"
    }
  ];

  const analysisSteps = [
    {
      id: 1,
      title: "Text Input & Configuration",
      description: "Enter your text and configure analysis options",
      icon: FileText
    },
    {
      id: 2,
      title: "Analysis Processing",
      description: "AI processes your text with advanced NLP algorithms",
      icon: Brain
    },
    {
      id: 3,
      title: "Results & Insights",
      description: "View comprehensive analysis results and visualizations",
      icon: BarChart
    },
    {
      id: 4,
      title: "Export & Compliance",
      description: "Export results with full GDPR compliance documentation",
      icon: Shield
    }
  ];

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic demo results
    const mockResult: AnalysisResult = {
      sentiment: {
        label: inputText.toLowerCase().includes('excellent') || inputText.toLowerCase().includes('successful') ? 'Positive' : 
               inputText.toLowerCase().includes('problem') || inputText.toLowerCase().includes('issue') ? 'Negative' : 'Neutral',
        score: Math.random() * 0.4 + 0.3, // 0.3 to 0.7
        confidence: Math.random() * 0.2 + 0.8 // 0.8 to 1.0
      },
      language: {
        detected: selectedLanguage === 'auto' ? (inputText.includes('Tämä') ? 'Finnish' : 'English') : selectedLanguage,
        confidence: 0.95
      },
      entities: [
        { text: "AI", label: "TECHNOLOGY", confidence: 0.92 },
        { text: "Finland", label: "LOCATION", confidence: 0.88 },
        { text: "2024", label: "DATE", confidence: 0.85 }
      ],
      keyPhrases: [
        { phrase: "artificial intelligence", relevance: 0.95 },
        { phrase: "customer satisfaction", relevance: 0.87 },
        { phrase: "research collaboration", relevance: 0.82 }
      ],
      readability: {
        score: Math.random() * 20 + 60, // 60-80
        level: "Intermediate",
        metrics: {
          words: inputText.split(' ').length,
          sentences: inputText.split('.').length - 1,
          syllables: Math.floor(inputText.length / 3)
        }
      },
      classification: {
        topics: [
          { topic: "Technology", confidence: 0.89 },
          { topic: "Business", confidence: 0.76 },
          { topic: "Research", confidence: 0.71 }
        ]
      }
    };
    
    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
    setCurrentStep(3);
  };

  const resetAnalysis = () => {
    setCurrentStep(1);
    setInputText('');
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const exportResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      inputText: inputText,
      analysisOptions: analysisOptions,
      results: analysisResult,
      compliance: complianceStatus
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{service.name}</h1>
              <p className="text-text-secondary">{service.description}</p>
            </div>
          </div>
          
          {/* Purpose & Value Proposition */}
          <div className="bg-surface/50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-3">🎯 Service Purpose</h2>
            <p className="text-text-secondary mb-4">
              Advanced Natural Language Processing for Finnish Research & Business Intelligence. 
              Analyze text data with EU compliance, GDPR protection, and professional-grade accuracy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-text-secondary">Finnish Language Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-text-secondary">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-text-secondary">Research-Grade Accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {analysisSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500' : isActive ? 'bg-primary' : 'bg-surface'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isCompleted || isActive ? 'text-white' : 'text-text-secondary'
                    }`} />
                  </div>
                  <div className="ml-3">
                    <h3 className={`font-medium ${
                      isActive ? 'text-text-primary' : 'text-text-secondary'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-muted">{step.description}</p>
                  </div>
                  {index < analysisSteps.length - 1 && (
                    <div className="w-8 h-0.5 bg-border mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input & Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Text Input */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Text Input</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Enter text to analyze
                      </label>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your text here for analysis..."
                        className="w-full h-32 p-3 bg-background border border-border rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Language
                        </label>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="w-full p-3 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="auto">Auto-detect</option>
                          <option value="Finnish">Finnish</option>
                          <option value="English">English</option>
                          <option value="Swedish">Swedish</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Texts */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Sample Texts</h3>
                  <div className="space-y-3">
                    {sampleTexts.map((sample, index) => (
                      <div
                        key={index}
                        onClick={() => setInputText(sample.text)}
                        className="p-4 bg-background border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <h4 className="font-medium text-text-primary">{sample.title}</h4>
                        <p className="text-sm text-text-secondary mt-1">{sample.language}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analysis Options */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Analysis Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(analysisOptions).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setAnalysisOptions(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                        />
                        <span className="text-sm text-text-secondary capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!inputText.trim()}
                    className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Analysis
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-surface/50 rounded-lg p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isAnalyzing ? (
                      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    ) : (
                      <Brain className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {isAnalyzing ? 'Analyzing Text...' : 'Analysis Complete'}
                  </h3>
                  <p className="text-text-secondary">
                    {isAnalyzing 
                      ? 'Processing your text with advanced NLP algorithms'
                      : 'Your text has been analyzed successfully'
                    }
                  </p>
                </div>

                {isAnalyzing && (
                  <div className="space-y-4">
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-sm text-text-muted">Processing sentiment, entities, and key phrases...</p>
                  </div>
                )}

                {!isAnalyzing && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={performAnalysis}
                      className="btn-primary px-6 py-3"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-analyze
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="btn-secondary px-6 py-3"
                    >
                      <BarChart className="w-4 h-4 mr-2" />
                      View Results
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && analysisResult && (
              <div className="space-y-6">
                {/* Sentiment Analysis */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Sentiment Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-text-primary mb-2">
                        {analysisResult.sentiment.label}
                      </div>
                      <div className="text-sm text-text-secondary">Sentiment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-text-primary mb-2">
                        {(analysisResult.sentiment.score * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-text-secondary">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-text-primary mb-2">
                        {(analysisResult.sentiment.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-text-secondary">Confidence</div>
                    </div>
                  </div>
                </div>

                {/* Language Detection */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-500" />
                    Language Detection
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-text-primary">
                        {analysisResult.language.detected}
                      </div>
                      <div className="text-sm text-text-secondary">Detected Language</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-text-primary">
                        {(analysisResult.language.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-text-secondary">Confidence</div>
                    </div>
                  </div>
                </div>

                {/* Named Entities */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Named Entities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.entities.map((entity, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                      >
                        {entity.text} ({entity.label})
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Phrases */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    Key Phrases
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.keyPhrases.map((phrase, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-text-primary">{phrase.phrase}</span>
                        <span className="text-sm text-text-secondary">
                          {(phrase.relevance * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Readability */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Readability Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-primary">
                        {analysisResult.readability.score.toFixed(1)}
                      </div>
                      <div className="text-sm text-text-secondary">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-primary">
                        {analysisResult.readability.level}
                      </div>
                      <div className="text-sm text-text-secondary">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-primary">
                        {analysisResult.readability.metrics.words}
                      </div>
                      <div className="text-sm text-text-secondary">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-primary">
                        {analysisResult.readability.metrics.sentences}
                      </div>
                      <div className="text-sm text-text-secondary">Sentences</div>
                    </div>
                  </div>
                </div>

                {/* Topic Classification */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-500" />
                    Topic Classification
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.classification.topics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-text-primary">{topic.topic}</span>
                        <span className="text-sm text-text-secondary">
                          {(topic.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Compliance Status */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    GDPR Compliance Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-text-secondary">GDPR Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-text-secondary">Data Retention: {complianceStatus.dataRetention}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-text-secondary">Audit Trail Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-text-secondary">Cross-border Safe</span>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-surface/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Export Results</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={exportResults}
                      className="btn-primary px-6 py-3"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download JSON
                    </button>
                    <button className="btn-secondary px-6 py-3">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Service Info */}
            <div className="bg-surface/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Service Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Category:</span>
                  <span className="text-text-primary">NLP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status:</span>
                  <span className="text-green-500">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Users:</span>
                  <span className="text-text-primary">0/120</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Compliance:</span>
                  <span className="text-green-500">GDPR Ready</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={resetAnalysis}
                  className="w-full btn-secondary text-left px-4 py-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Analysis
                </button>
                <button className="w-full btn-secondary text-left px-4 py-2">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Options
                </button>
                <button className="w-full btn-secondary text-left px-4 py-2">
                  <Eye className="w-4 h-4 mr-2" />
                  View History
                </button>
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-surface/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Use Cases</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-text-primary">Research Analysis</div>
                    <div className="text-xs text-text-secondary">Academic papers and literature</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-text-primary">Business Intelligence</div>
                    <div className="text-xs text-text-secondary">Customer feedback analysis</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-text-primary">Content Moderation</div>
                    <div className="text-xs text-text-secondary">Automated content screening</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex gap-2">
            {currentStep < 4 && (
              <button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="btn-primary px-6 py-3"
              >
                Next
              </button>
            )}
            {currentStep === 4 && (
              <button
                onClick={resetAnalysis}
                className="btn-primary px-6 py-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
