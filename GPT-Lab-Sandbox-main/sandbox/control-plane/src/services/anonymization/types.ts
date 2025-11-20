// Data Anonymization Service - Type Definitions

export interface DataAnalysis {
  jobId: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: ColumnAnalysis[];
  piiDetections: PIIDetection[];
  dataQuality: DataQualityMetrics;
  recommendations: AnonymizationRecommendation[];
}

export interface ColumnAnalysis {
  name: string;
  dataType: DataType;
  nullCount: number;
  uniqueCount: number;
  sampleValues: any[];
  statistics?: ColumnStatistics;
  sensitivityScore: number; // 0-1 scale
}

export interface PIIDetection {
  columnName: string;
  piiType: PIIType;
  confidence: number; // 0-1 scale
  detectionMethod: DetectionMethod;
  sampleMatches: string[];
  riskLevel: RiskLevel;
}

export interface DataQualityMetrics {
  completeness: number; // 0-1 scale
  consistency: number;
  accuracy: number;
  validity: number;
  overallScore: number;
}

export interface AnonymizationRecommendation {
  columnName: string;
  recommendedTechnique: AnonymizationTechnique;
  reasoning: string;
  privacyImpact: number; // 0-1 scale
  utilityImpact: number; // 0-1 scale
  complexityLevel: ComplexityLevel;
}

export interface AnonymizationConfig {
  technique: AnonymizationTechnique;
  parameters: {
    k?: number; // for k-anonymity
    l?: number; // for l-diversity
    t?: number; // for t-closeness
    epsilon?: number; // for differential privacy
    delta?: number; // for differential privacy
  };
  quasiIdentifiers: string[];
  sensitiveAttributes: string[];
  privacyBudget?: number;
  qualityThreshold?: number;
}

export interface AnonymizationResult {
  jobId: string;
  status: JobStatus;
  originalRowCount: number;
  anonymizedRowCount: number;
  privacyMetrics: PrivacyMetrics;
  utilityMetrics: UtilityMetrics;
  complianceStatus: ComplianceStatus;
  outputPath?: string;
  warnings: string[];
  errors: string[];
}

export interface PrivacyMetrics {
  kAnonymity?: number;
  lDiversity?: number;
  tCloseness?: number;
  differentialPrivacy?: {
    epsilon: number;
    delta: number;
  };
  riskScore: number; // 0-1 scale, lower is better
}

export interface UtilityMetrics {
  dataUtility: number; // 0-1 scale
  statisticalAccuracy: number;
  informationLoss: number; // 0-1 scale, lower is better
  queryAccuracy?: number;
}

export interface ComplianceStatus {
  gdprCompliant: boolean;
  euAiActCompliant: boolean;
  hipaaCompliant?: boolean;
  ccpaCompliant?: boolean;
  violations: ComplianceViolation[];
  auditTrail: AuditEntry[];
}

export interface ComplianceViolation {
  regulation: string;
  article: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  user: string;
  details: Record<string, any>;
  ipAddress?: string;
}

// Enums and Types
export type DataType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'email' 
  | 'phone' 
  | 'identifier';

export type PIIType = 
  // Basic PII
  | 'email'
  | 'email_strict'
  | 'phone'
  | 'phone_us'
  | 'phone_international'
  | 'phone_uk'
  | 'phone_eu'
  | 'phone_generic'
  | 'name'
  | 'person_name'
  | 'address'
  | 'date_of_birth'
  | 'date_iso'
  | 'date_eu'
  
  // Government IDs
  | 'ssn'
  | 'ssn_us'
  | 'ssn_digits_only'
  | 'ssn_alternative'
  | 'sin_canada'
  | 'passport'
  | 'passport_us'
  | 'passport_uk'
  | 'passport_generic'
  | 'driver_license'
  | 'national_id'
  | 'national_id_eu'
  | 'national_id_nordic'
  
  // Financial
  | 'credit_card'
  | 'credit_card_visa'
  | 'credit_card_mastercard'
  | 'credit_card_amex'
  | 'credit_card_discover'
  | 'credit_card_generic'
  | 'credit_card_spaces'
  | 'iban'
  | 'swift_bic'
  | 'routing_number'
  | 'account_number'
  | 'sort_code_uk'
  | 'tax_id'
  | 'vat_number_eu'
  
  // Technical
  | 'ip_address'
  | 'ip_address_v4'
  | 'ip_address_v6'
  | 'mac_address'
  | 'bitcoin_address'
  | 'ethereum_address'
  | 'website'
  | 'username'
  
  // Location
  | 'postal_code'
  | 'postal_code_us'
  | 'postal_code_uk'
  | 'postal_code_canada'
  | 'postal_code_germany'
  | 'license_plate'
  | 'license_plate_us'
  | 'license_plate_eu'
  
  // Medical (HIPAA)
  | 'medical_record_number'
  | 'patient_id'
  
  // Legacy support
  | 'location'
  | 'sensitive_attribute'
  | 'identifier';

export type DetectionMethod = 
  | 'regex_pattern'
  | 'nlp_analysis'
  | 'statistical_analysis'
  | 'entropy_analysis'
  | 'machine_learning';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AnonymizationTechnique = 
  | 'k_anonymity'
  | 'l_diversity'
  | 't_closeness'
  | 'differential_privacy'
  | 'synthetic_data'
  | 'generalization'
  | 'suppression'
  | 'masking'
  | 'pseudonymization';

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'advanced';

export type JobStatus = 
  | 'pending'
  | 'analyzing'
  | 'anonymizing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ColumnStatistics {
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: any;
  standardDeviation?: number;
  distinctValues?: number;
  entropy?: number;
}

// Constants for PII Detection Patterns
// Global best practices patterns following GDPR, NIST, ISO 27559, PCI DSS, HIPAA
export const PII_PATTERNS = {
  // Email patterns (RFC 5322 compliant + international domains)
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  EMAIL_STRICT: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g,
  
  // Phone patterns (International + US formats)
  PHONE_US: /(\+?1[-.\s]?)?(\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  PHONE_INTERNATIONAL: /\+?[1-9]\d{1,14}/g,
  PHONE_UK: /(\+44|0)[1-9]\d{8,9}/g,
  PHONE_EU: /(\+33|0)[1-9]\d{8}/g, // France format
  PHONE_GENERIC: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  
  // SSN patterns (US + variants)
  SSN_US: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  SSN_DIGITS_ONLY: /\b\d{9}\b/g,
  SIN_CANADA: /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/g, // Canadian Social Insurance Number
  
  // Credit Card patterns (All major types + Luhn validation ready)
  CREDIT_CARD_VISA: /\b4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  CREDIT_CARD_MASTERCARD: /\b5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  CREDIT_CARD_AMEX: /\b3[47]\d{2}[-\s]?\d{6}[-\s]?\d{5}\b/g,
  CREDIT_CARD_DISCOVER: /\b6(?:011|5\d{2})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  CREDIT_CARD_GENERIC: /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{13,19}\b/g,
  CREDIT_CARD_SPACES: /\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/g,
  
  // International ID patterns
  PASSPORT_US: /\b[A-Z]{1,2}\d{6,9}\b/g,
  PASSPORT_UK: /\b\d{9}[A-Z]\b/g,
  PASSPORT_GENERIC: /\b[A-Z0-9]{6,12}\b/g,
  DRIVER_LICENSE: /\b[A-Z]\d{7,8}\b|\b\d{7,8}\b/g,
  NATIONAL_ID_EU: /\b\d{8,12}\b/g,
  NATIONAL_ID_NORDIC: /\b\d{6}[-\s]?\d{4}\b/g, // Swedish personnummer format
  
  // Financial patterns (Global)
  IBAN: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g,
  SWIFT_BIC: /\b[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?\b/g,
  ROUTING_NUMBER: /\b\d{9}\b/g, // US routing numbers
  ACCOUNT_NUMBER: /\b\d{8,17}\b/g,
  SORT_CODE_UK: /\b\d{2}[-\s]?\d{2}[-\s]?\d{2}\b/g,
  
  // Address and location
  IP_ADDRESS_V4: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  IP_ADDRESS_V6: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
  MAC_ADDRESS: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
  
  // Postal codes (International)
  POSTAL_CODE_US: /\b\d{5}(-\d{4})?\b/g,
  POSTAL_CODE_UK: /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/g,
  POSTAL_CODE_CANADA: /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/g,
  POSTAL_CODE_GERMANY: /\b\d{5}\b/g,
  
  // Date patterns (Multiple formats)
  DATE_OF_BIRTH: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/g,
  DATE_ISO: /\b\d{4}-\d{2}-\d{2}\b/g,
  DATE_EU: /\b\d{2}\/\d{2}\/\d{4}\b/g,
  
  // Medical identifiers (HIPAA)
  MEDICAL_RECORD_NUMBER: /\b(MRN|MR)[-\s]?\d{6,10}\b/gi,
  PATIENT_ID: /\b(PID|PATIENT)[-\s]?\d{6,12}\b/gi,
  
  // Business identifiers
  TAX_ID: /\b\d{2}-\d{7}\b/g, // US EIN format
  VAT_NUMBER_EU: /\b[A-Z]{2}\d{8,12}\b/g,
  
  // License plates (Multiple regions)
  LICENSE_PLATE_US: /\b[A-Z]{1,3}[-\s]?\d{1,4}[-\s]?[A-Z]{0,3}\b/g,
  LICENSE_PLATE_EU: /\b[A-Z]{1,3}[-\s]?\d{1,4}[-\s]?[A-Z]{1,3}\b/g,
  
  // Digital identifiers
  BITCOIN_ADDRESS: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
  ETHEREUM_ADDRESS: /\b0x[a-fA-F0-9]{40}\b/g,
  
  // Generic sensitive patterns
  WEBSITE: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
  USERNAME: /\b(user|username|login)[-_\s]*:?\s*[a-zA-Z0-9_.-]{3,20}\b/gi,
  
  // Names (Enhanced pattern for better detection)
  PERSON_NAME: /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
} as const;

// Privacy Thresholds
export const PRIVACY_THRESHOLDS = {
  MIN_K_ANONYMITY: 3,
  MIN_L_DIVERSITY: 2,
  MAX_EPSILON: 1.0,
  MIN_UTILITY_SCORE: 0.7,
  MAX_RISK_SCORE: 0.3,
} as const;
