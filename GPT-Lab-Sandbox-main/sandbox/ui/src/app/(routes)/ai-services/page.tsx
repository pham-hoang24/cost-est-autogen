'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Brain, Search, Filter, Plus, ExternalLink, Lock, Unlock, 
  Clock, CheckCircle, XCircle, AlertCircle, Star, Users, 
  Shield, BookOpen, Zap, Database, Eye, EyeOff, LogIn
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

interface AIService {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  requirements: string;
  access_level: string;
  requires_approval: boolean;
  max_users: number;
  current_users: number;
  status: string;
  documentation: string;
  api_endpoint?: string;
  cost_per_request?: number;
  gdpr_compliant: boolean;
  created_at: string;
  service_type?: string;
  phase?: string;
  compliance_level?: string;
  usage_hours?: number;
  last_used?: string;
}

interface UserAccess {
  service_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  approved_at?: string;
  admin_notes?: string;
  usage_count: number;
  last_used?: string;
}

export default function AIServicesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [services, setServices] = useState<AIService[]>([]);
  const [userAccess, setUserAccess] = useState<UserAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<AIService | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [expectedUsage, setExpectedUsage] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    console.log('useEffect triggered, isDemoMode:', isDemoMode);
    fetchServices();
    if (user) {
      fetchUserAccess();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      // Demo mode - use comprehensive mock data
      if (isDemoMode) {
        // Use a comprehensive set of mock services based on the backend data
        const mockServices: AIService[] = [
          // Templates & Ready-to-Use Services
          {
            id: 'template-1',
            name: 'Model Benchmarking Template',
            description: 'Ready-to-use benchmarking templates for company-trained models with immediate results',
            category: 'templates',
            subcategory: 'benchmarking',
            requirements: 'Python 3.8+, TensorFlow/PyTorch, GPU recommended',
            access_level: 'professional',
            requires_approval: true,
            max_users: 50,
            current_users: 12,
            status: 'active',
            documentation: 'https://docs.sw4e.org/model-benchmarking',
            api_endpoint: 'https://api.sw4e.org/benchmarking',
            cost_per_request: 0.05,
            gdpr_compliant: true,
            created_at: '2024-01-15T10:30:00Z',
            service_type: 'template',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 15.2,
            last_used: new Date().toISOString()
          },
          {
            id: 'template-2',
            name: 'Requirement Document Templates',
            description: 'Upload documents and get structured outputs with automated processing',
            category: 'templates',
            subcategory: 'document_processing',
            requirements: 'Web browser, basic understanding of requirements engineering',
            access_level: 'basic',
            requires_approval: false,
            max_users: 100,
            current_users: 45,
            status: 'active',
            documentation: 'https://docs.sw4e.org/requirement-templates',
            api_endpoint: 'https://api.sw4e.org/templates',
            cost_per_request: 0.02,
            gdpr_compliant: true,
            created_at: '2024-01-20T14:15:00Z',
            service_type: 'template',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 8.7,
            last_used: new Date().toISOString()
          },
          {
            id: 'template-3',
            name: 'Cost Estimation Templates',
            description: 'Basic project effort and cost calculation with AI-powered analysis',
            category: 'templates',
            subcategory: 'cost_estimation',
            requirements: 'Excel/Google Sheets, project management knowledge',
            access_level: 'basic',
            requires_approval: false,
            max_users: 100,
            current_users: 28,
            status: 'active',
            documentation: 'https://docs.sw4e.org/cost-estimation',
            api_endpoint: 'https://api.sw4e.org/estimation',
            cost_per_request: 0.01,
            gdpr_compliant: true,
            created_at: '2024-01-25T09:45:00Z',
            service_type: 'template',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 12.3,
            last_used: new Date().toISOString()
          },
          {
            id: 'template-4',
            name: 'AI Technique Assessment',
            description: 'Automated requirement assessment that suggests suitable AI techniques',
            category: 'templates',
            subcategory: 'technique_suggestion',
            requirements: 'Python 3.8+, ML libraries, domain expertise',
            access_level: 'professional',
            requires_approval: true,
            max_users: 50,
            current_users: 6,
            status: 'active',
            documentation: 'https://docs.sw4e.org/technique-assessment',
            api_endpoint: 'https://api.sw4e.org/assessment',
            cost_per_request: 0.08,
            gdpr_compliant: true,
            created_at: '2024-02-01T11:20:00Z',
            service_type: 'assessment',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 22.1,
            last_used: new Date().toISOString()
          },
          // Experiments
          {
            id: 'data-preprocessing-pipeline',
            name: 'Data Preprocessing Pipeline',
            description: 'Professional-grade data cleaning, transformation, and analysis with comprehensive reporting',
            category: 'experiments',
            subcategory: 'data_processing',
            requirements: 'Python 3.8+, pandas, numpy, data analysis skills',
            access_level: 'professional',
            requires_approval: true,
            max_users: 25,
            current_users: 8,
            status: 'active',
            documentation: 'https://docs.sw4e.org/data-preprocessing',
            api_endpoint: 'http://localhost:8086/api',
            cost_per_request: 0.15,
            gdpr_compliant: true,
            created_at: '2024-02-05T16:30:00Z',
            service_type: 'preprocessing',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 45.8,
            last_used: new Date().toISOString()
          },
          {
            id: 'experiment-2',
            name: 'Controlled Experiment Execution',
            description: 'Reproducible experiment runs with GPU allocation and monitoring',
            category: 'experiments',
            subcategory: 'experiment_execution',
            requirements: 'Python 3.8+, scikit-learn, statistical knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 10,
            current_users: 3,
            status: 'active',
            documentation: 'https://docs.sw4e.org/experiment-execution',
            api_endpoint: 'https://api.sw4e.org/experiments',
            cost_per_request: 0.25,
            gdpr_compliant: true,
            created_at: '2024-02-10T13:45:00Z',
            service_type: 'execution',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 67.2,
            last_used: new Date().toISOString()
          },
          {
            id: 'experiment-3',
            name: 'Results Dashboard & Reports',
            description: 'Interactive dashboards with metrics and exportable reports',
            category: 'experiments',
            subcategory: 'results_analysis',
            requirements: 'Web browser, basic data analysis understanding',
            access_level: 'basic',
            requires_approval: false,
            max_users: 100,
            current_users: 35,
            status: 'active',
            documentation: 'https://docs.sw4e.org/results-dashboard',
            api_endpoint: 'https://api.sw4e.org/dashboard',
            cost_per_request: 0.03,
            gdpr_compliant: true,
            created_at: '2024-02-15T08:15:00Z',
            service_type: 'visualization',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 28.9,
            last_used: new Date().toISOString()
          },
          // AI Services
          {
            id: 'ai-1',
            name: 'Text Analysis AI',
            description: 'Natural language processing and sentiment analysis with EU compliance',
            category: 'ai_services',
            subcategory: 'text_processing',
            requirements: 'Web browser, text data, basic NLP understanding',
            access_level: 'basic',
            requires_approval: false,
            max_users: 1000,
            current_users: 150,
            status: 'active',
            documentation: 'https://docs.sw4e.org/text-analysis',
            api_endpoint: 'https://api.sw4e.org/text-analysis',
            cost_per_request: 0.02,
            gdpr_compliant: true,
            created_at: '2024-02-20T12:00:00Z',
            service_type: 'nlp',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 25.5,
            last_used: new Date().toISOString()
          },
          {
            id: 'ai-2',
            name: 'Computer Vision Model',
            description: 'Image classification and object detection with privacy protection',
            category: 'ai_services',
            subcategory: 'image_processing',
            requirements: 'Python 3.8+, OpenCV, GPU recommended',
            access_level: 'professional',
            requires_approval: true,
            max_users: 500,
            current_users: 45,
            status: 'active',
            documentation: 'https://docs.sw4e.org/computer-vision',
            api_endpoint: 'https://api.sw4e.org/computer-vision',
            cost_per_request: 0.05,
            gdpr_compliant: true,
            created_at: '2024-02-25T14:30:00Z',
            service_type: 'computer_vision',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 12.3,
            last_used: new Date().toISOString()
          },
          {
            id: 'ai-3',
            name: 'RAG Workflow Templates',
            description: 'Ready-to-use Retrieval-Augmented Generation templates for knowledge bases',
            category: 'ai_services',
            subcategory: 'knowledge_retrieval',
            requirements: 'Python 3.8+, document processing knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 100,
            current_users: 22,
            status: 'active',
            documentation: 'https://docs.sw4e.org/rag-workflows',
            api_endpoint: 'https://api.sw4e.org/rag',
            cost_per_request: 0.12,
            gdpr_compliant: true,
            created_at: '2024-03-01T09:15:00Z',
            service_type: 'rag',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 34.7,
            last_used: new Date().toISOString()
          },
          {
            id: 'ai-4',
            name: 'Fine-Tuning Workflows',
            description: 'Model fine-tuning pipelines with automated hyperparameter optimization',
            category: 'ai_services',
            subcategory: 'model_training',
            requirements: 'Python 3.8+, ML expertise, GPU access',
            access_level: 'enterprise',
            requires_approval: true,
            max_users: 5,
            current_users: 2,
            status: 'active',
            documentation: 'https://docs.sw4e.org/fine-tuning',
            api_endpoint: 'https://api.sw4e.org/fine-tuning',
            cost_per_request: 0.50,
            gdpr_compliant: true,
            created_at: '2024-03-05T11:45:00Z',
            service_type: 'fine_tuning',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 89.2,
            last_used: new Date().toISOString()
          },
          {
            id: 'ai-5',
            name: 'Speech Processing Suite',
            description: 'Speech-to-text, text-to-speech, and voice analysis capabilities',
            category: 'ai_services',
            subcategory: 'audio_processing',
            requirements: 'Web browser, audio data, basic audio processing knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 200,
            current_users: 35,
            status: 'active',
            documentation: 'https://docs.sw4e.org/speech-processing',
            api_endpoint: 'https://api.sw4e.org/speech',
            cost_per_request: 0.08,
            gdpr_compliant: true,
            created_at: '2024-03-10T16:20:00Z',
            service_type: 'speech',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 18.6,
            last_used: new Date().toISOString()
          },
          {
            id: 'ai-6',
            name: 'Recommendation Engine',
            description: 'Personalized recommendation systems with privacy-preserving algorithms',
            category: 'ai_services',
            subcategory: 'personalization',
            requirements: 'Python 3.8+, recommendation system knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 300,
            current_users: 67,
            status: 'active',
            documentation: 'https://docs.sw4e.org/recommendation-engine',
            api_endpoint: 'https://api.sw4e.org/recommendations',
            cost_per_request: 0.06,
            gdpr_compliant: true,
            created_at: '2024-03-15T13:10:00Z',
            service_type: 'recommendation',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 41.3,
            last_used: new Date().toISOString()
          },
          {
            id: 'ai-7',
            name: 'Time Series Analysis',
            description: 'Advanced time series forecasting and anomaly detection',
            category: 'ai_services',
            subcategory: 'forecasting',
            requirements: 'Python 3.8+, time series data, statistical knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 150,
            current_users: 28,
            status: 'active',
            documentation: 'https://docs.sw4e.org/time-series',
            api_endpoint: 'https://api.sw4e.org/time-series',
            cost_per_request: 0.10,
            gdpr_compliant: true,
            created_at: '2024-03-20T10:30:00Z',
            service_type: 'time_series',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 29.8,
            last_used: new Date().toISOString()
          },
          {
            id: 'ai-8',
            name: 'Anomaly Detection System',
            description: 'Real-time anomaly detection for data streams and patterns',
            category: 'ai_services',
            subcategory: 'monitoring',
            requirements: 'Python 3.8+, streaming data, monitoring knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 250,
            current_users: 42,
            status: 'active',
            documentation: 'https://docs.sw4e.org/anomaly-detection',
            api_endpoint: 'https://api.sw4e.org/anomaly',
            cost_per_request: 0.07,
            gdpr_compliant: true,
            created_at: '2024-03-25T15:45:00Z',
            service_type: 'anomaly_detection',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 36.1,
            last_used: new Date().toISOString()
          },
          {
            id: 'ai-9',
            name: 'LLM Playground',
            description: 'Multi-modal LLM testing platform for text, code, image, and analysis generation',
            category: 'ai_services',
            subcategory: 'llm_testing',
            requirements: 'Web browser, basic AI/ML understanding',
            access_level: 'basic',
            requires_approval: false,
            max_users: 1000,
            current_users: 0,
            status: 'active',
            documentation: 'https://docs.sw4e.org/llm-playground',
            api_endpoint: 'https://api.sw4e.org/llm-playground',
            cost_per_request: 0.01,
            gdpr_compliant: true,
            created_at: '2024-01-25T09:30:00Z',
            service_type: 'ai_service',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 0,
            last_used: new Date().toISOString()
          },
          // Infrastructure Services
          {
            id: 'infra-1',
            name: 'GPU Resource Allocation',
            description: 'On-demand GPU clusters for AI training and inference',
            category: 'infrastructure',
            subcategory: 'gpu_compute',
            requirements: 'GPU access, ML workload knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 10,
            current_users: 3,
            status: 'active',
            documentation: 'https://docs.sw4e.org/gpu-allocation',
            api_endpoint: 'https://api.sw4e.org/gpu',
            cost_per_request: 1.00,
            gdpr_compliant: true,
            created_at: '2024-03-30T12:00:00Z',
            service_type: 'compute',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 124.5,
            last_used: new Date().toISOString()
          },
          {
            id: 'infra-2',
            name: 'Secure Data Storage',
            description: 'Encrypted data storage with EU data residency compliance',
            category: 'infrastructure',
            subcategory: 'data_storage',
            requirements: 'Data upload, basic storage knowledge',
            access_level: 'basic',
            requires_approval: false,
            max_users: 10000,
            current_users: 1250,
            status: 'active',
            documentation: 'https://docs.sw4e.org/data-storage',
            api_endpoint: 'https://api.sw4e.org/storage',
            cost_per_request: 0.001,
            gdpr_compliant: true,
            created_at: '2024-04-01T08:00:00Z',
            service_type: 'storage',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 2.1,
            last_used: new Date().toISOString()
          },
          {
            id: 'infra-3',
            name: 'Experiment Tracking',
            description: 'Comprehensive experiment versioning and reproducibility tracking',
            category: 'infrastructure',
            subcategory: 'experiment_management',
            requirements: 'Experiment data, version control knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 500,
            current_users: 89,
            status: 'active',
            documentation: 'https://docs.sw4e.org/experiment-tracking',
            api_endpoint: 'https://api.sw4e.org/tracking',
            cost_per_request: 0.02,
            gdpr_compliant: true,
            created_at: '2024-04-05T14:30:00Z',
            service_type: 'tracking',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 67.8,
            last_used: new Date().toISOString()
          },
          // Security & Compliance
          {
            id: 'security-1',
            name: 'AI Model Vulnerability Scanner',
            description: 'Automated security scanning for AI models and training data',
            category: 'security',
            subcategory: 'vulnerability_scanning',
            requirements: 'AI model files, security knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 20,
            current_users: 5,
            status: 'active',
            documentation: 'https://docs.sw4e.org/vulnerability-scanner',
            api_endpoint: 'https://api.sw4e.org/security',
            cost_per_request: 0.25,
            gdpr_compliant: true,
            created_at: '2024-04-10T11:15:00Z',
            service_type: 'security',
            phase: 'Phase 2 - Advanced',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 15.8,
            last_used: new Date().toISOString()
          },
          {
            id: 'security-2',
            name: 'Legal Assistant LLM',
            description: 'Specialized LLM for GDPR and EU AI Act compliance guidance',
            category: 'security',
            subcategory: 'compliance_assistance',
            requirements: 'Legal questions, compliance knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 50,
            current_users: 12,
            status: 'active',
            documentation: 'https://docs.sw4e.org/legal-assistant',
            api_endpoint: 'https://api.sw4e.org/legal',
            cost_per_request: 0.18,
            gdpr_compliant: true,
            created_at: '2024-04-15T16:45:00Z',
            service_type: 'legal_ai',
            phase: 'Phase 2 - Advanced',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 28.4,
            last_used: new Date().toISOString()
          },
          {
            id: 'security-3',
            name: 'Data Residency Controller',
            description: 'Choose and manage data storage locations for compliance',
            category: 'security',
            subcategory: 'data_residency',
            requirements: 'Data governance knowledge, compliance requirements',
            access_level: 'enterprise',
            requires_approval: true,
            max_users: 100,
            current_users: 8,
            status: 'active',
            documentation: 'https://docs.sw4e.org/data-residency',
            api_endpoint: 'https://api.sw4e.org/residency',
            cost_per_request: 0.05,
            gdpr_compliant: true,
            created_at: '2024-04-20T09:30:00Z',
            service_type: 'data_governance',
            phase: 'Phase 2 - Advanced',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 7.2,
            last_used: new Date().toISOString()
          },
          // Data Anonymization Service
          {
            id: 'data-anonymization',
            name: 'Data Anonymization Service',
            description: 'GDPR-compliant data anonymization using advanced privacy-preserving algorithms (K-Anonymity, L-Diversity, T-Closeness)',
            category: 'Security & Compliance',
            subcategory: 'Privacy Protection',
            requirements: 'CSV, Excel, JSON, or Text files with PII data',
            access_level: 'professional',
            requires_approval: false,
            max_users: 100,
            current_users: 23,
            status: 'active',
            documentation: 'https://docs.sw4e.org/data-anonymization',
            api_endpoint: 'http://localhost:8082/api',
            cost_per_request: 0.02,
            gdpr_compliant: true,
            created_at: '2024-01-20T14:15:00Z',
            service_type: 'microservice',
            phase: 'Phase 1 - MVP',
            compliance_level: 'gdpr_compliant',
            usage_hours: 45.8,
            last_used: new Date().toISOString()
          },
          // AI-Native Anomaly Detection System
          {
            id: 'ai-anomaly-detection',
            name: 'AI-Native Anomaly Detection System',
            description: 'Advanced anomaly detection using AI/ML models and LLM integration for real-time monitoring across multiple data types',
            category: 'ai_services',
            subcategory: 'anomaly_detection',
            requirements: 'Python 3.8+, streaming data, monitoring knowledge',
            access_level: 'professional',
            requires_approval: true,
            max_users: 250,
            current_users: 42,
            status: 'active',
            documentation: 'https://docs.sw4e.org/ai-anomaly-detection',
            api_endpoint: 'http://localhost:8083/api',
            cost_per_request: 0.07,
            gdpr_compliant: true,
            created_at: '2024-03-25T15:45:00Z',
            service_type: 'anomaly_detection',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 36.1,
            last_used: new Date().toISOString()
          },
          // Compliance Auditor Service
          {
            id: 'compliance-auditor',
            name: 'Compliance Auditor',
            description: 'Comprehensive EU AI Act and GDPR compliance auditing system with automated risk assessment and evidence management',
            category: 'ai_services',
            subcategory: 'compliance',
            requirements: 'System documentation, compliance knowledge, audit experience',
            access_level: 'professional',
            requires_approval: true,
            max_users: 100,
            current_users: 18,
            status: 'active',
            documentation: 'https://docs.sw4e.org/compliance-auditor',
            api_endpoint: 'http://localhost:8084/api',
            cost_per_request: 0.12,
            gdpr_compliant: true,
            created_at: '2024-03-30T10:15:00Z',
            service_type: 'compliance_audit',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 28.5,
            last_used: new Date().toISOString()
          },
          // AI-Powered Security Scanner & Auto-Remediation
          {
            id: 'security-scanner',
            name: 'AI-Powered Security Scanner',
            description: 'Comprehensive security vulnerability detection and automated remediation across code, infrastructure, dependencies, and runtime',
            category: 'ai_services',
            subcategory: 'security',
            requirements: 'System access, security knowledge, development environment',
            access_level: 'professional',
            requires_approval: true,
            max_users: 150,
            current_users: 25,
            status: 'active',
            documentation: 'https://docs.sw4e.org/security-scanner',
            api_endpoint: 'http://localhost:8085/api',
            cost_per_request: 0.15,
            gdpr_compliant: true,
            created_at: '2024-04-01T09:00:00Z',
            service_type: 'security_scanner',
            phase: 'Phase 1 - MVP',
            compliance_level: 'eu_ai_act_compliant',
            usage_hours: 18.7,
            last_used: new Date().toISOString()
          }
        ];
        
        console.log('Setting mock services:', mockServices.length, 'services');
        setServices(mockServices);
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(mockServices.map(s => s.category))];
        console.log('Categories found:', uniqueCategories);
        setCategories(uniqueCategories);
        setLoading(false);
        return;
      }

      // Production mode - fetch from backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/ai-services/catalog', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
      const data = await response.json();
      setServices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAccess = async () => {
    try {
      // Demo mode - use mock data
      if (isDemoMode) {
        const mockUserAccess: UserAccess[] = [
          {
            service_id: 'ai_svc_175874640148_dupzg3m7f',
            status: 'approved',
            requested_at: '2024-01-16T09:00:00Z',
            approved_at: '2024-01-16T14:30:00Z',
            admin_notes: 'Approved for research project',
            usage_count: 15,
            last_used: '2024-01-25T10:15:00Z'
          },
          {
            service_id: 'ai_svc_175874640150_xyz789ghi',
            status: 'pending',
            requested_at: '2024-01-20T11:30:00Z',
            usage_count: 0
          }
        ];
        setUserAccess(mockUserAccess);
        return;
      }

      // Production mode - fetch from backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/ai-services/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserAccess(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching user access:', error);
    }
  };

  const handleRequestAccess = async () => {
    if (!selectedService || !requestReason.trim()) return;

    try {
      // Demo mode - simulate request
      if (isDemoMode) {
        const newRequest: UserAccess = {
          service_id: selectedService.id,
          status: 'pending',
          requested_at: new Date().toISOString(),
          usage_count: 0
        };
        setUserAccess(prev => [...prev, newRequest]);
        setShowRequestModal(false);
        setSelectedService(null);
        setRequestReason('');
        setExpectedUsage('');
        alert('Access request submitted successfully! (Demo Mode)');
        return;
      }

      // Production mode - send to backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/ai-services/request-access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          reason: requestReason,
          expectedUsage
        })
      });

      if (response.ok) {
        setShowRequestModal(false);
        setSelectedService(null);
        setRequestReason('');
        setExpectedUsage('');
        fetchUserAccess(); // Refresh user access
        alert('Access request submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error requesting access:', error);
      alert('Failed to submit request');
    }
  };

  const getUserAccessStatus = (serviceId: string) => {
    return userAccess.find(access => access.service_id === serviceId);
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, AIService[]>);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory && service.status === 'active';
  });

  // Get filtered grouped services
  const filteredGroupedServices = Object.keys(groupedServices).reduce((acc, category) => {
    const categoryServices = groupedServices[category].filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch && service.status === 'active';
    });
    if (categoryServices.length > 0) {
      acc[category] = categoryServices;
    }
    return acc;
  }, {} as Record<string, AIService[]>);

  console.log('Grouped services:', Object.keys(groupedServices));
  console.log('Filtered grouped services:', Object.keys(filteredGroupedServices));

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'public': return <Unlock className="w-4 h-4 text-green-500" />;
      case 'restricted': return <Lock className="w-4 h-4 text-yellow-500" />;
      default: return <Shield className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'restricted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Demo mode - allow access without authentication
  const isDemoMode = true;

  if (!isDemoMode && !user) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Brain className="w-8 h-8" /> {t('services.title')}
            </h1>
            {isDemoMode && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-1">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Eye className="w-4 h-4" />
                  Demo Mode
                </div>
          </div>
            )}
          </div>
          <p className="text-text-muted mt-2">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder={t('services.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
          <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
          </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Services by Category */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-4 text-text-secondary">Loading services... (Loading: {loading.toString()})</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredGroupedServices).map(([category, categoryServices]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px bg-border flex-1"></div>
                  <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <Brain className="w-6 h-6 text-primary" />
                    {category}
                    <Badge variant="outline" className="ml-2">
                      {categoryServices.length} services
                    </Badge>
                  </h2>
                  <div className="h-px bg-border flex-1"></div>
                </div>
                
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryServices.map((service) => {
                    const userAccessStatus = getUserAccessStatus(service.id);
                    const hasAccess = userAccessStatus?.status === 'approved';
                    const isPending = userAccessStatus?.status === 'pending';
                    const isRejected = userAccessStatus?.status === 'rejected';

              return (
                      <Card key={service.id} className="p-6 border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Brain className="w-6 h-6 text-primary" />
                            <h3 className="text-xl font-semibold text-text-primary">{service.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAccessLevelIcon(service.access_level)}
                            <Badge className={getAccessLevelColor(service.access_level)}>
                              {service.access_level}
                            </Badge>
                    </div>
                  </div>

                        <p className="text-text-secondary text-sm mb-4">{service.description}</p>

                  <div className="space-y-2 mb-4">
                          {service.subcategory && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-text-muted">Type:</span>
                              <Badge variant="outline" className="text-xs">{service.subcategory}</Badge>
                    </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-text-muted" />
                            <span className="text-text-muted">
                              {service.current_users}/{service.max_users} users
                        </span>
                          </div>
                          {service.phase && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-text-muted">Phase:</span>
                              <Badge variant="outline" className="text-xs">{service.phase}</Badge>
                        </div>
                      )}
                          {service.gdpr_compliant && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <Shield className="w-4 h-4" />
                              <span>GDPR Compliant</span>
                    </div>
                  )}
                          {service.cost_per_request && service.cost_per_request > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-text-muted">Cost:</span>
                              <span className="text-primary font-medium">€{service.cost_per_request}/request</span>
                            </div>
                          )}
                    </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                        <Button 
                            variant="primary" 
                            className="flex-1"
                            onClick={() => {
                              if (service.id === 'data-anonymization') {
                                router.push('/ai-services/data-anonymization');
                              } else if (service.id === 'ai-anomaly-detection') {
                                router.push('/ai-services/ai-anomaly-detection');
                              } else if (service.id === 'compliance-auditor') {
                                router.push('/ai-services/compliance-auditor');
                              } else if (service.id === 'security-scanner') {
                                router.push('/ai-services/security-scanner');
                              } else if (service.id === 'data-preprocessing-pipeline') {
                                router.push('/ai-services/data-preprocessing-pipeline');
                              } else if (service.id === 'ai-9') {
                                router.push('/ai-services/ai-9');
                              } else {
                                router.push(`/ai-services/${service.id}`);
                              }
                            }}
                          >
                            <Zap className="w-4 h-4 mr-2" /> Use Service
                          </Button>
                          
                          {service.documentation && (
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                  </div>
                </Card>
              );
            })}
                </div>
              </div>
            ))}
          </div>
        )}

        {Object.keys(filteredGroupedServices).length === 0 && !loading && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No services found</h3>
            <p className="text-text-secondary">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Request Access Modal */}
        {showRequestModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 w-full max-w-md mx-4 border border-border">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Request Access to {selectedService.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Reason for Access *
                  </label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Please explain why you need access to this service..."
                    className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Expected Usage
                  </label>
                  <input
                    type="text"
                    value={expectedUsage}
                    onChange={(e) => setExpectedUsage(e.target.value)}
                    placeholder="e.g., Research project, Course work, etc."
                    className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={handleRequestAccess}
                  disabled={!requestReason.trim()}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}