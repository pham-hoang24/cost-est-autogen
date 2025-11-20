// Realistic Service Configuration for SW4E Sandbox
// Maps subscription tiers to actual service capabilities

export interface ServiceCapability {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'ai' | 'data' | 'collaboration' | 'compliance' | 'infrastructure';
  requiredTier: 'basic' | 'professional' | 'enterprise';
  features: string[];
  limitations?: string[];
}

export const serviceCapabilities: ServiceCapability[] = [
  // CORE RESEARCH SERVICES (Basic Tier)
  {
    id: 'project_management',
    name: 'Research Project Management',
    description: 'Organize and manage research projects with team collaboration',
    category: 'core',
    requiredTier: 'basic',
    features: [
      'Project creation and organization',
      'Team member invitation system',
      'Task and milestone tracking',
      'Document version control',
      'Basic reporting and analytics'
    ]
  },
  {
    id: 'secure_collaboration',
    name: 'Secure Team Collaboration',
    description: 'GDPR-compliant collaboration tools for research teams',
    category: 'collaboration',
    requiredTier: 'basic',
    features: [
      'Encrypted team messaging',
      'File sharing with access controls',
      'Real-time collaborative editing',
      'Meeting scheduling and notes',
      'Activity tracking and notifications'
    ]
  },
  {
    id: 'basic_data_storage',
    name: 'Secure Data Storage',
    description: 'GDPR-compliant data storage with EU data residency',
    category: 'data',
    requiredTier: 'basic',
    features: [
      'Encrypted data storage',
      'EU data residency guarantee',
      'Basic data organization',
      'Access logging and audit trails',
      'Data retention policy management'
    ],
    limitations: [
      'EU-only data processing',
      'Standard encryption (AES-256)',
      'Basic access controls'
    ]
  },

  // PROFESSIONAL SERVICES (Professional Tier)
  {
    id: 'ai_model_platform',
    name: 'AI Model Development Platform',
    description: 'EU AI Act compliant platform for developing and deploying AI models',
    category: 'ai',
    requiredTier: 'professional',
    features: [
      'Pre-trained foundation models',
      'Custom model training infrastructure',
      'Automated AI risk assessment',
      'EU AI Act compliance monitoring',
      'Model versioning and deployment',
      'Human oversight controls',
      'Explainable AI features'
    ]
  },
  {
    id: 'advanced_data_catalog',
    name: 'Advanced Data Catalog',
    description: 'Comprehensive data discovery and governance platform',
    category: 'data',
    requiredTier: 'professional',
    features: [
      'Automated data discovery',
      'Data lineage tracking',
      'Metadata management',
      'Data quality monitoring',
      'Search and discovery tools',
      'Data classification and tagging',
      'Integration with external sources'
    ]
  },
  {
    id: 'cross_border_processing',
    name: 'Cross-Border Data Processing',
    description: 'Secure international collaboration with adequate safeguards',
    category: 'compliance',
    requiredTier: 'professional',
    features: [
      'Standard Contractual Clauses (SCCs)',
      'Adequacy decision compliance',
      'Transfer impact assessments',
      'International collaboration tools',
      'Multi-jurisdiction compliance',
      'Cross-border audit trails'
    ]
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics Suite',
    description: 'Comprehensive analytics and reporting platform',
    category: 'ai',
    requiredTier: 'professional',
    features: [
      'Statistical analysis tools',
      'Machine learning pipelines',
      'Custom dashboard creation',
      'Automated report generation',
      'Data visualization tools',
      'Predictive analytics',
      'A/B testing framework'
    ]
  },

  // ENTERPRISE SERVICES (Enterprise Tier)
  {
    id: 'custom_ai_infrastructure',
    name: 'Custom AI Infrastructure',
    description: 'Dedicated AI infrastructure with custom model deployment',
    category: 'infrastructure',
    requiredTier: 'enterprise',
    features: [
      'Dedicated GPU clusters',
      'Custom model architectures',
      'Private model registries',
      'Edge deployment capabilities',
      'Real-time inference APIs',
      'Scalable training pipelines',
      'Custom hardware configurations'
    ]
  },
  {
    id: 'compliance_framework',
    name: 'Custom Compliance Framework',
    description: 'Tailored compliance solutions for specific regulatory requirements',
    category: 'compliance',
    requiredTier: 'enterprise',
    features: [
      'Custom legal agreement templates',
      'Regulatory reporting automation',
      'Compliance dashboard customization',
      'Multi-jurisdiction support',
      'Custom audit workflows',
      'Regulatory change monitoring',
      'Legal consultation services'
    ]
  },
  {
    id: 'enterprise_integration',
    name: 'Enterprise Integration Suite',
    description: 'Seamless integration with existing enterprise systems',
    category: 'infrastructure',
    requiredTier: 'enterprise',
    features: [
      'Single Sign-On (SSO) integration',
      'Active Directory connectivity',
      'Custom API development',
      'Legacy system integration',
      'White-label deployment options',
      'On-premises deployment',
      'Hybrid cloud configurations'
    ]
  },
  {
    id: 'dedicated_support',
    name: 'Dedicated Account Management',
    description: 'Personalized support and account management services',
    category: 'infrastructure',
    requiredTier: 'enterprise',
    features: [
      'Dedicated account manager',
      'Priority technical support',
      'Custom training programs',
      'Regular strategy consultations',
      'Proactive monitoring and optimization',
      'Custom SLA agreements',
      '24/7 emergency support'
    ]
  }
];

// Helper function to get services available for a subscription tier
export const getServicesForTier = (tier: 'basic' | 'professional' | 'enterprise'): ServiceCapability[] => {
  const tierHierarchy = { 'basic': 1, 'professional': 2, 'enterprise': 3 };
  const userTierLevel = tierHierarchy[tier];
  
  return serviceCapabilities.filter(service => {
    const serviceTierLevel = tierHierarchy[service.requiredTier];
    return serviceTierLevel <= userTierLevel;
  });
};

// Helper function to check if user can access a specific service
export const canAccessService = (serviceId: string, userTier: 'basic' | 'professional' | 'enterprise'): boolean => {
  const service = serviceCapabilities.find(s => s.id === serviceId);
  if (!service) return false;
  
  const tierHierarchy = { 'basic': 1, 'professional': 2, 'enterprise': 3 };
  const userTierLevel = tierHierarchy[userTier];
  const serviceTierLevel = tierHierarchy[service.requiredTier];
  
  return serviceTierLevel <= userTierLevel;
};

// Service categories for organization
export const serviceCategories = {
  'core': { name: 'Core Research Tools', icon: 'FlaskConical', color: 'blue' },
  'ai': { name: 'AI & Machine Learning', icon: 'Brain', color: 'purple' },
  'data': { name: 'Data Management', icon: 'Database', color: 'green' },
  'collaboration': { name: 'Team Collaboration', icon: 'Users', color: 'orange' },
  'compliance': { name: 'Compliance & Legal', icon: 'Shield', color: 'red' },
  'infrastructure': { name: 'Infrastructure & Support', icon: 'Crown', color: 'yellow' }
};

// Realistic usage limits per tier
export const tierLimits = {
  basic: {
    maxProjects: 3,
    maxCollaboratorsPerProject: 5,
    storageQuota: '10GB',
    apiCallsPerMonth: 5000,
    aiComputeHours: 20,
    crossBorderTransfers: false,
    customCompliance: false,
    prioritySupport: false
  },
  professional: {
    maxProjects: 10,
    maxCollaboratorsPerProject: 15,
    storageQuota: '100GB',
    apiCallsPerMonth: 25000,
    aiComputeHours: 100,
    crossBorderTransfers: true,
    customCompliance: false,
    prioritySupport: true
  },
  enterprise: {
    maxProjects: -1, // Unlimited
    maxCollaboratorsPerProject: 50,
    storageQuota: 'Unlimited',
    apiCallsPerMonth: 100000,
    aiComputeHours: 1000,
    crossBorderTransfers: true,
    customCompliance: true,
    prioritySupport: true
  }
};
