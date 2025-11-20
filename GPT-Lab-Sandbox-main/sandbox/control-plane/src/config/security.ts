/**
 * Security Configuration for SW4E Sandbox
 * Implements EU AI Act and GDPR compliance requirements
 */

export interface SecurityConfig {
  // Authentication & Authorization
  jwtSecret: string;
  jwtExpiresIn: string;
  adminDefaultPassword: string;
  
  // Rate Limiting
  authRateLimit: {
    windowMs: number;
    maxAttempts: number;
  };
  generalRateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  
  // CORS
  allowedOrigins: string[];
  
  // Data Protection
  dataRetentionDays: number;
  auditLogRetentionDays: number;
  anonymizationEnabled: boolean;
  
  // EU AI Act Compliance
  aiActCompliance: {
    mode: 'strict' | 'moderate' | 'relaxed';
    riskAssessmentRequired: boolean;
    transparencyReportsEnabled: boolean;
    algorithmicImpactAssessmentRequired: boolean;
  };
  
  // Data Residency
  dataResidency: 'EU-only' | 'EEA' | 'global';
  
  // Monitoring
  auditLoggingEnabled: boolean;
  performanceMonitoringEnabled: boolean;
}

const getSecurityConfig = (): SecurityConfig => {
  // Validate required environment variables in production
  if (process.env.NODE_ENV === 'production') {
    const requiredVars = ['JWT_SECRET', 'ADMIN_DEFAULT_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables in production: ${missingVars.join(', ')}`);
    }
  }
  
  return {
    jwtSecret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
      }
      console.warn('🚨 SECURITY WARNING: Using default JWT secret in development');
      return 'sw4e-governance-secret-key-change-in-production';
    })(),
    
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    
    adminDefaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ADMIN_DEFAULT_PASSWORD must be set in production');
      }
      console.warn('🚨 SECURITY WARNING: Using weak default admin password in development');
      return 'admin123';
    })(),
    
    authRateLimit: {
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      maxAttempts: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS || '5')
    },
    
    generalRateLimit: {
      windowMs: parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.GENERAL_RATE_LIMIT_MAX_REQUESTS || '100')
    },
    
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://frontend:3000'],
    
    dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '365'),
    auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '2555'), // 7 years
    anonymizationEnabled: process.env.ANONYMIZATION_ENABLED === 'true',
    
    aiActCompliance: {
      mode: (process.env.AI_ACT_COMPLIANCE_MODE as 'strict' | 'moderate' | 'relaxed') || 'strict',
      riskAssessmentRequired: process.env.RISK_ASSESSMENT_REQUIRED !== 'false',
      transparencyReportsEnabled: process.env.TRANSPARENCY_REPORTS_ENABLED !== 'false',
      algorithmicImpactAssessmentRequired: process.env.ALGORITHMIC_IMPACT_ASSESSMENT_REQUIRED !== 'false'
    },
    
    dataResidency: (process.env.DATA_RESIDENCY_ENFORCEMENT as 'EU-only' | 'EEA' | 'global') || 'EU-only',
    
    auditLoggingEnabled: process.env.AUDIT_LOGGING_ENABLED !== 'false',
    performanceMonitoringEnabled: process.env.PERFORMANCE_MONITORING_ENABLED !== 'false'
  };
};

export const securityConfig = getSecurityConfig();

// Security validation functions
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateDataResidency = (location: string): boolean => {
  const euCountries = [
    'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
  ];
  
  const eeaCountries = [...euCountries, 'IS', 'LI', 'NO'];
  
  switch (securityConfig.dataResidency) {
    case 'EU-only':
      return euCountries.includes(location);
    case 'EEA':
      return eeaCountries.includes(location);
    case 'global':
      return true;
    default:
      return false;
  }
};

export const isHighRiskAISystem = (systemType: string, intendedPurpose: string): boolean => {
  const highRiskCategories = [
    'biometric_identification',
    'critical_infrastructure',
    'education_training',
    'employment',
    'essential_services',
    'law_enforcement',
    'migration_asylum',
    'administration_justice'
  ];
  
  return highRiskCategories.some(category => 
    intendedPurpose.toLowerCase().includes(category) || 
    systemType.toLowerCase().includes(category)
  );
};
