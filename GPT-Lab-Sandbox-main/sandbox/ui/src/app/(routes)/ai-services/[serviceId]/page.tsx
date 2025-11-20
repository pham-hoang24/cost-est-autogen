'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  ArrowLeft, 
  Play, 
  Settings, 
  Download, 
  Share2, 
  Star, 
  Clock, 
  Cpu, 
  Database,
  Shield,
  CheckCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  Zap,
  Upload,
  Eye,
  TrendingUp,
  User,
  Activity,
  GraduationCap,
  LogIn
} from 'lucide-react';

// Import core working service components
import DocumentTemplateService from './components/DocumentTemplateService';
import CostEstimationService from './components/CostEstimationService';
import AITechniqueAssessment from './components/AITechniqueAssessment';
import DataPreprocessingPipeline from './components/DataPreprocessingPipeline';
import ControlledExperimentService from './components/ControlledExperimentService';
import TextAnalysisService from './components/TextAnalysisService';
import ComputerVisionService from './components/ComputerVisionService';
import RAGWorkflowService from './components/RAGWorkflowService';
import FineTuningService from './components/FineTuningService';
import SpeechProcessingService from './components/SpeechProcessingService';
import RecommendationEngineService from './components/RecommendationEngineService';
import TimeSeriesAnalysisService from './components/TimeSeriesAnalysisService';

// Import new service components
import ResultsDashboardService from './components/ResultsDashboardService';
import LLMPlaygroundService from './components/LLMPlaygroundService';
import PreloadedDatasetsService from './components/PreloadedDatasetsService';
import ModelBenchmarkingService from './components/ModelBenchmarkingService';
import ProfessionalModelBenchmarkingService from './components/ProfessionalModelBenchmarkingService';
import ProfessionalDocumentTemplateService from './components/ProfessionalDocumentTemplateService';
import ProfessionalCostEstimationService from './components/ProfessionalCostEstimationService';
import ProfessionalAITechniqueAssessmentService from './components/ProfessionalAITechniqueAssessmentService';
import ProfessionalDataPreprocessingPipelineService from './components/ProfessionalDataPreprocessingPipelineService';
import ProfessionalControlledExperimentExecutionService from './components/ProfessionalControlledExperimentExecutionService';
import ProfessionalTextAnalysisService from './components/ProfessionalTextAnalysisService';

export default function ServiceDetailPageMinimal() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.serviceId) {
      fetchServiceDetails(params.serviceId as string);
    }
  }, [params.serviceId]);

  const fetchServiceDetails = async (serviceId: string) => {
    try {
      setLoading(true);
      
      // Demo mode - use mock services directly
      console.log('Demo mode: Using mock services for service ID:', serviceId);
      
      // Fallback to mock services for demo purposes
      const mockServices: Record<string, any> = {
        // AI Services Catalog IDs
        'ai_svc_175874640148_dupzg3m7f': {
          id: 'ai_svc_175874640148_dupzg3m7f',
          name: 'Model Benchmarking Template',
          description: 'Comprehensive model evaluation and benchmarking framework with standardized metrics and comparison tools.',
          service_type: 'template',
          status: 'active'
        },
        'ai_svc_175874640149_abc123def': {
          id: 'ai_svc_175874640149_abc123def',
          name: 'Requirement Document Templates',
          description: 'AI-powered templates for creating comprehensive requirement documents with industry standards compliance.',
          service_type: 'template',
          status: 'active'
        },
        'ai_svc_175874640150_xyz789ghi': {
          id: 'ai_svc_175874640150_xyz789ghi',
          name: 'Cost Estimation Templates',
          description: 'Advanced cost estimation tools with multiple methodologies and industry-standard frameworks.',
          service_type: 'template',
          status: 'active'
        },
        'ai_svc_175874640151_def456jkl': {
          id: 'ai_svc_175874640151_def456jkl',
          name: 'AI Technique Assessment',
          description: 'Comprehensive assessment framework for evaluating AI techniques and methodologies.',
          service_type: 'template',
          status: 'active'
        },
        'ai_svc_175874640152_mno345pqr': {
          id: 'ai_svc_175874640152_mno345pqr',
          name: 'Data Preprocessing Pipeline',
          description: 'Automated data preprocessing and cleaning pipeline with quality assessment tools.',
          service_type: 'experiment',
          status: 'active'
        },
        'ai_svc_175874640153_stu678vwx': {
          id: 'ai_svc_175874640153_stu678vwx',
          name: 'Controlled Experiment Execution',
          description: 'Framework for designing and executing controlled experiments with statistical analysis.',
          service_type: 'experiment',
          status: 'active'
        },
        'ai_svc_175874640154_yza901bcd': {
          id: 'ai_svc_175874640154_yza901bcd',
          name: 'Text Analysis AI',
          description: 'Advanced natural language processing and text analysis capabilities with multiple language support.',
          service_type: 'ai',
          status: 'active'
        },
        'ai_svc_175874640155_efg234hij': {
          id: 'ai_svc_175874640155_efg234hij',
          name: 'Computer Vision Model',
          description: 'State-of-the-art computer vision models for image classification, object detection, and segmentation.',
          service_type: 'ai',
          status: 'active'
        },
        // Core Template Services (legacy IDs)
        'template-1': {
          id: 'template-1',
          name: 'Model Benchmarking Template',
          description: 'Ready-to-use benchmarking templates for company-trained models with immediate results',
          service_type: 'template',
          status: 'active'
        },
        'template-2': {
          id: 'template-2',
          name: 'Document Template Service',
          description: 'Upload documents and get structured outputs with automated processing',
          service_type: 'template',
          status: 'active'
        },
        'template-3': {
          id: 'template-3',
          name: 'Cost Estimation Templates',
          description: 'AI-powered project cost estimation with detailed analysis and risk assessment',
          service_type: 'template',
          status: 'active'
        },
        'template-4': {
          id: 'template-4',
          name: 'AI Technique Assessment',
          description: 'Automated requirement assessment that suggests suitable AI techniques',
          service_type: 'template',
          status: 'active'
        },
        // Experiment Services
        'experiment-1': {
          id: 'experiment-1',
          name: 'Data Preprocessing Pipeline',
          description: 'Complete data profiling, cleaning, and transformation workflows',
          service_type: 'experiment',
          status: 'active'
        },
        'experiment-2': {
          id: 'experiment-2',
          name: 'Controlled Experiment Execution',
          description: 'Reproducible experiment runs with GPU allocation and monitoring',
          service_type: 'experiment',
          status: 'active'
        },
        'experiment-3': {
          id: 'experiment-3',
          name: 'Results Dashboard & Reports',
          description: 'Interactive dashboards with metrics and exportable reports',
          service_type: 'experiment',
          status: 'active'
        },
        // AI Services
        'ai-1': {
          id: 'ai-1',
          name: 'Text Analysis AI',
          description: 'Natural language processing and sentiment analysis with EU compliance',
          service_type: 'ai_service',
          status: 'active'
        },
        'ai-2': {
          id: 'ai-2',
          name: 'Computer Vision Model',
          description: 'Image classification and object detection with privacy protection',
          service_type: 'ai_service',
          status: 'active'
        },
        'ai-3': {
          id: 'ai-3',
          name: 'RAG Workflow Templates',
          description: 'Ready-to-use Retrieval-Augmented Generation templates',
          service_type: 'ai_service',
          status: 'active'
        },
        'ai-4': {
          id: 'ai-4',
          name: 'Fine-Tuning Workflows',
          description: 'Model fine-tuning pipelines with automated optimization',
          service_type: 'ai_service',
          status: 'active'
        },
        'ai-5': {
          id: 'ai-5',
          name: 'Speech Processing Suite',
          description: 'Speech-to-text, text-to-speech, and voice analysis capabilities',
          service_type: 'ai_service',
          status: 'active'
        },
        'ai-6': {
          id: 'ai-6',
          name: 'Recommendation Engine',
          description: 'Personalized recommendation systems with privacy-preserving algorithms',
          service_type: 'ai_service',
          status: 'active'
        },
        'ai-7': {
          id: 'ai-7',
          name: 'Time Series Analysis',
          description: 'Advanced time series forecasting and anomaly detection',
          service_type: 'ai_service',
          status: 'active'
        },
        'ai-8': {
          id: 'ai-8',
          name: 'Anomaly Detection System',
          description: 'Real-time anomaly detection for data streams and patterns',
          service_type: 'anomaly_detection',
          status: 'active'
        },
        'ai-9': {
          id: 'ai-9',
          name: 'LLM Playground',
          description: 'Multi-modal LLM testing platform for text, code, image, and analysis generation',
          service_type: 'ai_service',
          status: 'active'
        },
        // Infrastructure Services
        'infra-1': {
          id: 'infra-1',
          name: 'GPU Resource Allocation',
          description: 'On-demand GPU clusters for AI training and inference',
          service_type: 'compute',
          status: 'active'
        },
        'infra-2': {
          id: 'infra-2',
          name: 'Secure Data Storage',
          description: 'Encrypted data storage with EU data residency compliance',
          service_type: 'storage',
          status: 'active'
        },
        // Previously Missing Services
        'user-onboarding-1': {
          id: 'user-onboarding-1',
          name: 'User Onboarding & Training',
          description: 'Guided learning paths with role-based onboarding for AI platform mastery',
          service_type: 'onboarding',
          status: 'active'
        },
        'personal-dashboard-1': {
          id: 'personal-dashboard-1',
          name: 'Personal User Dashboard',
          description: 'Personalized AI experiment tracking, project management, and achievement system',
          service_type: 'dashboard',
          status: 'active'
        },
        'experiment-tracking-1': {
          id: 'experiment-tracking-1',
          name: 'Experiment Tracking System',
          description: 'Real-time monitoring of active experiments with historical analysis and job management',
          service_type: 'tracking',
          status: 'active'
        },
        'results-dashboard-1': {
          id: 'results-dashboard-1',
          name: 'Results Dashboard & Analytics',
          description: 'Comprehensive experiment tracking with exportable reports and real-time metrics visualization',
          service_type: 'analytics',
          status: 'active'
        },
        'preloaded-datasets-1': {
          id: 'preloaded-datasets-1',
          name: 'Preloaded Datasets & Demo Workflows',
          description: 'Ready-to-use datasets with guided AI workflow examples for immediate experimentation',
          service_type: 'datasets',
          status: 'active'
        },
        'ai-bridge-1': {
          id: 'ai-bridge-1',
          name: 'AI Platform Bridge',
          description: 'Unified access to Hugging Face and OpenAI models through a single interface',
          service_type: 'platform',
          status: 'active'
        },
        'ai-service-1': {
          id: 'ai-service-1',
          name: 'RAG System Templates',
          description: 'Ready-to-use RAG templates with document upload and query interface',
          service_type: 'rag',
          status: 'active'
        },
        'ai-service-2': {
          id: 'ai-service-2',
          name: 'Model Fine-tuning Service',
          description: 'Fine-tune Hugging Face and OpenAI models on custom datasets with professional monitoring',
          service_type: 'fine_tuning',
          status: 'active'
        },
        'infrastructure-1': {
          id: 'infrastructure-1',
          name: 'GPU Resource Manager',
          description: 'Enterprise GPU cluster management with intelligent allocation and cost optimization',
          service_type: 'infrastructure',
          status: 'active'
        },
        'infrastructure-4': {
          id: 'infrastructure-4',
          name: 'Security Compliance Dashboard',
          description: 'EU AI Act, GDPR, and ISO 27001 compliance monitoring with automated checks and reporting',
          service_type: 'security',
          status: 'active'
        },
        'advanced-1': {
          id: 'advanced-1',
          name: 'AI-Powered Test Generation',
          description: 'Generate test cases from company codebase using advanced AI',
          service_type: 'code_analysis',
          status: 'beta'
        },
        'advanced-2': {
          id: 'advanced-2',
          name: 'Company-Specific Estimation Models',
          description: 'Learn from past pricing patterns to improve cost predictions',
          service_type: 'estimation',
          status: 'active'
        },
        'advanced-3': {
          id: 'advanced-3',
          name: 'Industry-Specific Workflows',
          description: 'Specialized AI workflows for healthcare, manufacturing, and finance',
          service_type: 'industry',
          status: 'active'
        },
        'security-1': {
          id: 'security-1',
          name: 'AI Model Vulnerability Scanner',
          description: 'Automated security scanning for AI models and training data',
          service_type: 'security_scan',
          status: 'active'
        },
        'security-2': {
          id: 'security-2',
          name: 'Legal Assistant LLM',
          description: 'Specialized LLM for GDPR and EU AI Act compliance guidance',
          service_type: 'legal_ai',
          status: 'active'
        },
        'security-3': {
          id: 'security-3',
          name: 'Data Residency Controller',
          description: 'Choose and manage data storage locations for compliance',
          service_type: 'data_residency',
          status: 'active'
        }
      };

      const foundService = mockServices[serviceId];
      
      if (foundService) {
        setService(foundService);
        setError(null);
      } else {
        setError('Service not found');
      }
    } catch (err) {
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'anomaly_detection': return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'compute': return <Cpu className="w-8 h-8 text-blue-500" />;
      case 'storage': return <Database className="w-8 h-8 text-green-500" />;
      case 'code_analysis': return <FileText className="w-8 h-8 text-purple-500" />;
      case 'legal_ai': return <Shield className="w-8 h-8 text-blue-500" />;
      default: return <Zap className="w-8 h-8 text-gray-400" />;
    }
  };

  const renderServiceInterface = () => {
    if (!service) return null;

    console.log('🔍 Service ID:', service.id);
    console.log('🔍 Service Name:', service.name);
    console.log('🔍 Service Type:', service.service_type);

    // Route to specific service components based on service ID
    switch (service.id) {
      // Core Template Services
      case 'template-1':
      case 'ai_svc_175874640148_dupzg3m7f': // Database-generated ID for Model Benchmarking
        return <ProfessionalModelBenchmarkingService service={service} />;
      case 'template-2':
        return <ProfessionalDocumentTemplateService service={service} />;
      case 'template-3':
        return <ProfessionalCostEstimationService service={service} />;
      case 'template-4':
        return <AITechniqueAssessment service={service} />;
      
      // Experiment Services
      case 'experiment-1':
        return <DataPreprocessingPipeline service={service} />;
      case 'experiment-2':
        return <ControlledExperimentService service={service} />;
      case 'experiment-3':
        return <ResultsDashboardService service={service} />;
      
      // AI Services
      case 'ai-1':
        return <ProfessionalTextAnalysisService service={service} />;
      case 'ai-2':
        return <ComputerVisionService service={service} />;
      case 'ai-3':
        return <RAGWorkflowService service={service} />;
      case 'ai-4':
        return <FineTuningService service={service} />;
      case 'ai-5':
        return <SpeechProcessingService service={service} />;
      case 'ai-6':
        return <RecommendationEngineService service={service} />;
      case 'ai-7':
        return <TimeSeriesAnalysisService service={service} />;
      case 'ai-8':
        return <LLMPlaygroundService />;
      case 'ai-9':
        return <LLMPlaygroundService />;
      
      // Default demo for other services
      default:
        // Check if this is a Model Benchmarking service by name
        if (service.name && service.name.toLowerCase().includes('model benchmarking')) {
          return <ProfessionalModelBenchmarkingService service={service} />;
        }
        
        // Check if this is a Document Template service by name
        if (service.name && (service.name.toLowerCase().includes('document template') || service.name.toLowerCase().includes('requirement document'))) {
          return <ProfessionalDocumentTemplateService service={service} />;
        }
        
        // Check if this is a Cost Estimation service by name
        if (service.name && (service.name.toLowerCase().includes('cost estimation') || service.name.toLowerCase().includes('cost template'))) {
          return <ProfessionalCostEstimationService service={service} />;
        }
        
        // Check if this is an AI Technique Assessment service by name
        if (service.name && (service.name.toLowerCase().includes('ai technique') || service.name.toLowerCase().includes('technique assessment'))) {
          return <ProfessionalAITechniqueAssessmentService service={service} />;
        }
        
        // Check if this is a Data Preprocessing Pipeline service by name
        if (service.name && (service.name.toLowerCase().includes('data preprocessing') || service.name.toLowerCase().includes('preprocessing pipeline'))) {
          return <ProfessionalDataPreprocessingPipelineService service={service} />;
        }
        
        // Check if this is a Controlled Experiment Execution service by name
        if (service.name && (service.name.toLowerCase().includes('controlled experiment') || service.name.toLowerCase().includes('experiment execution'))) {
          return <ProfessionalControlledExperimentExecutionService service={service} />;
        }
        
        // Check if this is a Text Analysis AI service by name
        if (service.name && (service.name.toLowerCase().includes('text analysis') || service.name.toLowerCase().includes('nlp') || service.name.toLowerCase().includes('sentiment'))) {
          return <ProfessionalTextAnalysisService service={service} />;
        }
        
        // Check if this is a Computer Vision service by name
        if (service.name && (service.name.toLowerCase().includes('computer vision') || service.name.toLowerCase().includes('image') || service.name.toLowerCase().includes('object detection'))) {
          return <ComputerVisionService service={service} />;
        }
        
        // Check if this is an LLM Playground service by name
        if (service.name && (service.name.toLowerCase().includes('llm playground') || service.name.toLowerCase().includes('llm testing'))) {
          return <LLMPlaygroundService />;
        }
        
        // Final fallback - if it's LLM Playground, show it
        if (service.id === 'ai-9' || service.name?.toLowerCase().includes('llm playground')) {
          return <LLMPlaygroundService />;
        }

        return (
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                {getServiceIcon(service.service_type)}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{service.name}</h2>
              <p className="text-slate-400 mb-6">{service.description}</p>
              
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Service Status</h3>
                  <Badge variant={service.status === 'active' ? 'green' : 'yellow'}>
                    {service.status}
                  </Badge>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Quick Demo</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    This service provides {service.description.toLowerCase()}
                  </p>
                  <Button className="btn-primary">
                    <Play className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Features</h3>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Professional-grade AI implementation</li>
                    <li>• EU AI Act and GDPR compliant</li>
                    <li>• Real-time processing capabilities</li>
                    <li>• Enterprise security standards</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-400">Loading service details...</p>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Service Not Found</h2>
              <p className="text-slate-400 mb-6">{error}</p>
              <Button onClick={() => router.push('/ai-services')} className="btn-primary">
                Back to AI Services
              </Button>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Demo mode - allow access without authentication
  const isDemoMode = true;

  if (!isDemoMode && !user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
              <p className="text-text-secondary mb-6">You need to be logged in to view AI services.</p>
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/login')}
                  className="btn-primary"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Access
                </Button>
                <div className="text-sm text-text-muted">
                  <p>Demo credentials:</p>
                  <p>admin@sw4e.org / admin123</p>
                  <p>researcher@university.edu / researcher123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.push('/ai-services')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AI Services
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Service Details</h1>
            <p className="text-slate-400">Explore and test AI service capabilities</p>
          </div>
          {isDemoMode && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <Eye className="w-4 h-4" />
                Demo Mode
              </div>
            </div>
          )}
        </div>

        {/* Service Interface */}
        {renderServiceInterface()}
      </div>
    </div>
  );
}
