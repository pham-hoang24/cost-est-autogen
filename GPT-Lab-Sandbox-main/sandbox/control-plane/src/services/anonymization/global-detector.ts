/**
 * Global Best Practices PII Detection Engine
 * Following GDPR, NIST Privacy Framework, ISO/IEC 27559, PCI DSS, HIPAA
 */

import { PIIType, DetectionMethod, PII_PATTERNS } from './types';

export interface PIIDetectionResult {
  piiType: PIIType;
  confidence: number;
  method: DetectionMethod;
  matches: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  regulation: string; // Which regulation this violates
}

export class GlobalPIIDetector {
  
  /**
   * Comprehensive PII detection using global best practices
   */
  static detectPII(text: string): PIIDetectionResult[] {
    const results: PIIDetectionResult[] = [];
    
    // Financial PII (PCI DSS - Critical)
    this.detectFinancialPII(text, results);
    
    // Government IDs (GDPR Article 9 - Critical)
    this.detectGovernmentIDs(text, results);
    
    // Health Data (HIPAA - Critical)
    this.detectHealthData(text, results);
    
    // Contact Information (GDPR Article 6 - High)
    this.detectContactInfo(text, results);
    
    // Technical Identifiers (GDPR - Medium)
    this.detectTechnicalIdentifiers(text, results);
    
    // Location Data (GDPR - Medium)
    this.detectLocationData(text, results);
    
    // Digital Assets (Various - Medium)
    this.detectDigitalAssets(text, results);
    
    return results;
  }
  
  /**
   * Financial PII Detection (PCI DSS Compliance)
   */
  private static detectFinancialPII(text: string, results: PIIDetectionResult[]) {
    const patterns = [
      { pattern: PII_PATTERNS.CREDIT_CARD_VISA, type: 'credit_card_visa' as PIIType, regulation: 'PCI DSS' },
      { pattern: PII_PATTERNS.CREDIT_CARD_MASTERCARD, type: 'credit_card_mastercard' as PIIType, regulation: 'PCI DSS' },
      { pattern: PII_PATTERNS.CREDIT_CARD_AMEX, type: 'credit_card_amex' as PIIType, regulation: 'PCI DSS' },
      { pattern: PII_PATTERNS.CREDIT_CARD_DISCOVER, type: 'credit_card_discover' as PIIType, regulation: 'PCI DSS' },
      { pattern: PII_PATTERNS.CREDIT_CARD_GENERIC, type: 'credit_card_generic' as PIIType, regulation: 'PCI DSS' },
      { pattern: PII_PATTERNS.CREDIT_CARD_SPACES, type: 'credit_card_spaces' as PIIType, regulation: 'PCI DSS' },
      { pattern: PII_PATTERNS.IBAN, type: 'iban' as PIIType, regulation: 'GDPR + PCI DSS' },
      { pattern: PII_PATTERNS.SWIFT_BIC, type: 'swift_bic' as PIIType, regulation: 'GDPR + PCI DSS' },
      { pattern: PII_PATTERNS.ROUTING_NUMBER, type: 'routing_number' as PIIType, regulation: 'PCI DSS' },
      { pattern: PII_PATTERNS.ACCOUNT_NUMBER, type: 'account_number' as PIIType, regulation: 'PCI DSS' },
      { pattern: PII_PATTERNS.SORT_CODE_UK, type: 'sort_code_uk' as PIIType, regulation: 'UK GDPR' },
      { pattern: PII_PATTERNS.TAX_ID, type: 'tax_id' as PIIType, regulation: 'GDPR + IRS' },
      { pattern: PII_PATTERNS.VAT_NUMBER_EU, type: 'vat_number_eu' as PIIType, regulation: 'EU GDPR' },
    ];
    
    patterns.forEach(({ pattern, type, regulation }) => {
      const matches = this.extractMatches(text, pattern);
      if (matches.length > 0) {
        results.push({
          piiType: type,
          confidence: this.calculateFinancialConfidence(matches),
          method: 'regex_pattern',
          matches: matches.slice(0, 3),
          riskLevel: 'critical',
          regulation
        });
      }
    });
  }
  
  /**
   * Government ID Detection (GDPR Article 9 - Special Categories)
   */
  private static detectGovernmentIDs(text: string, results: PIIDetectionResult[]) {
    const patterns = [
      { pattern: PII_PATTERNS.SSN_US, type: 'ssn_us' as PIIType, regulation: 'GDPR + SSA' },
      { pattern: PII_PATTERNS.SSN_DIGITS_ONLY, type: 'ssn_digits_only' as PIIType, regulation: 'GDPR + SSA' },
      { pattern: PII_PATTERNS.SIN_CANADA, type: 'sin_canada' as PIIType, regulation: 'PIPEDA' },
      { pattern: PII_PATTERNS.PASSPORT_US, type: 'passport_us' as PIIType, regulation: 'GDPR + Passport Act' },
      { pattern: PII_PATTERNS.PASSPORT_UK, type: 'passport_uk' as PIIType, regulation: 'UK GDPR' },
      { pattern: PII_PATTERNS.PASSPORT_GENERIC, type: 'passport_generic' as PIIType, regulation: 'GDPR' },
      { pattern: PII_PATTERNS.DRIVER_LICENSE, type: 'driver_license' as PIIType, regulation: 'GDPR + DMV' },
      { pattern: PII_PATTERNS.NATIONAL_ID_EU, type: 'national_id_eu' as PIIType, regulation: 'EU GDPR' },
      { pattern: PII_PATTERNS.NATIONAL_ID_NORDIC, type: 'national_id_nordic' as PIIType, regulation: 'Nordic GDPR' },
    ];
    
    patterns.forEach(({ pattern, type, regulation }) => {
      const matches = this.extractMatches(text, pattern);
      if (matches.length > 0) {
        results.push({
          piiType: type,
          confidence: this.calculateGovernmentIDConfidence(matches, type),
          method: 'regex_pattern',
          matches: matches.slice(0, 3),
          riskLevel: 'critical',
          regulation
        });
      }
    });
  }
  
  /**
   * Health Data Detection (HIPAA Compliance)
   */
  private static detectHealthData(text: string, results: PIIDetectionResult[]) {
    const patterns = [
      { pattern: PII_PATTERNS.MEDICAL_RECORD_NUMBER, type: 'medical_record_number' as PIIType, regulation: 'HIPAA' },
      { pattern: PII_PATTERNS.PATIENT_ID, type: 'patient_id' as PIIType, regulation: 'HIPAA' },
    ];
    
    patterns.forEach(({ pattern, type, regulation }) => {
      const matches = this.extractMatches(text, pattern);
      if (matches.length > 0) {
        results.push({
          piiType: type,
          confidence: 0.95,
          method: 'regex_pattern',
          matches: matches.slice(0, 3),
          riskLevel: 'critical',
          regulation
        });
      }
    });
  }
  
  /**
   * Contact Information Detection
   */
  private static detectContactInfo(text: string, results: PIIDetectionResult[]) {
    const patterns = [
      { pattern: PII_PATTERNS.EMAIL, type: 'email' as PIIType, regulation: 'GDPR', risk: 'high' as const },
      { pattern: PII_PATTERNS.EMAIL_STRICT, type: 'email_strict' as PIIType, regulation: 'GDPR', risk: 'high' as const },
      { pattern: PII_PATTERNS.PHONE_US, type: 'phone_us' as PIIType, regulation: 'GDPR + TCPA', risk: 'high' as const },
      { pattern: PII_PATTERNS.PHONE_INTERNATIONAL, type: 'phone_international' as PIIType, regulation: 'GDPR', risk: 'high' as const },
      { pattern: PII_PATTERNS.PHONE_UK, type: 'phone_uk' as PIIType, regulation: 'UK GDPR', risk: 'high' as const },
      { pattern: PII_PATTERNS.PHONE_EU, type: 'phone_eu' as PIIType, regulation: 'EU GDPR', risk: 'high' as const },
      { pattern: PII_PATTERNS.PHONE_GENERIC, type: 'phone_generic' as PIIType, regulation: 'GDPR', risk: 'high' as const },
      { pattern: PII_PATTERNS.PERSON_NAME, type: 'person_name' as PIIType, regulation: 'GDPR', risk: 'medium' as const },
    ];
    
    patterns.forEach(({ pattern, type, regulation, risk }) => {
      const matches = this.extractMatches(text, pattern);
      if (matches.length > 0) {
        results.push({
          piiType: type,
          confidence: this.calculateContactConfidence(matches, type),
          method: 'regex_pattern',
          matches: matches.slice(0, 3),
          riskLevel: risk,
          regulation
        });
      }
    });
  }
  
  /**
   * Technical Identifiers Detection
   */
  private static detectTechnicalIdentifiers(text: string, results: PIIDetectionResult[]) {
    const patterns = [
      { pattern: PII_PATTERNS.IP_ADDRESS_V4, type: 'ip_address_v4' as PIIType, regulation: 'GDPR' },
      { pattern: PII_PATTERNS.IP_ADDRESS_V6, type: 'ip_address_v6' as PIIType, regulation: 'GDPR' },
      { pattern: PII_PATTERNS.MAC_ADDRESS, type: 'mac_address' as PIIType, regulation: 'GDPR' },
      { pattern: PII_PATTERNS.USERNAME, type: 'username' as PIIType, regulation: 'GDPR' },
    ];
    
    patterns.forEach(({ pattern, type, regulation }) => {
      const matches = this.extractMatches(text, pattern);
      if (matches.length > 0) {
        results.push({
          piiType: type,
          confidence: 0.8,
          method: 'regex_pattern',
          matches: matches.slice(0, 3),
          riskLevel: 'medium',
          regulation
        });
      }
    });
  }
  
  /**
   * Location Data Detection
   */
  private static detectLocationData(text: string, results: PIIDetectionResult[]) {
    const patterns = [
      { pattern: PII_PATTERNS.POSTAL_CODE_US, type: 'postal_code_us' as PIIType, regulation: 'GDPR' },
      { pattern: PII_PATTERNS.POSTAL_CODE_UK, type: 'postal_code_uk' as PIIType, regulation: 'UK GDPR' },
      { pattern: PII_PATTERNS.POSTAL_CODE_CANADA, type: 'postal_code_canada' as PIIType, regulation: 'PIPEDA' },
      { pattern: PII_PATTERNS.POSTAL_CODE_GERMANY, type: 'postal_code_germany' as PIIType, regulation: 'EU GDPR' },
      { pattern: PII_PATTERNS.LICENSE_PLATE_US, type: 'license_plate_us' as PIIType, regulation: 'GDPR' },
      { pattern: PII_PATTERNS.LICENSE_PLATE_EU, type: 'license_plate_eu' as PIIType, regulation: 'EU GDPR' },
    ];
    
    patterns.forEach(({ pattern, type, regulation }) => {
      const matches = this.extractMatches(text, pattern);
      if (matches.length > 0) {
        results.push({
          piiType: type,
          confidence: 0.75,
          method: 'regex_pattern',
          matches: matches.slice(0, 3),
          riskLevel: 'medium',
          regulation
        });
      }
    });
  }
  
  /**
   * Digital Assets Detection
   */
  private static detectDigitalAssets(text: string, results: PIIDetectionResult[]) {
    const patterns = [
      { pattern: PII_PATTERNS.BITCOIN_ADDRESS, type: 'bitcoin_address' as PIIType, regulation: 'GDPR + AML' },
      { pattern: PII_PATTERNS.ETHEREUM_ADDRESS, type: 'ethereum_address' as PIIType, regulation: 'GDPR + AML' },
      { pattern: PII_PATTERNS.WEBSITE, type: 'website' as PIIType, regulation: 'GDPR' },
    ];
    
    patterns.forEach(({ pattern, type, regulation }) => {
      const matches = this.extractMatches(text, pattern);
      if (matches.length > 0) {
        results.push({
          piiType: type,
          confidence: 0.7,
          method: 'regex_pattern',
          matches: matches.slice(0, 3),
          riskLevel: 'medium',
          regulation
        });
      }
    });
  }
  
  /**
   * Helper method to extract matches from text
   */
  private static extractMatches(text: string, pattern: RegExp): string[] {
    const matches: string[] = [];
    let match;
    while ((match = pattern.exec(text)) !== null && matches.length < 10) {
      matches.push(match[0]);
    }
    pattern.lastIndex = 0; // Reset regex state
    return matches;
  }
  
  /**
   * Calculate confidence for financial data
   */
  private static calculateFinancialConfidence(matches: string[]): number {
    // Higher confidence for multiple matches and proper formatting
    let confidence = 0.85;
    if (matches.length > 1) confidence += 0.1;
    
    // Check for Luhn algorithm validity for credit cards
    const hasValidLuhn = matches.some(match => this.isValidLuhn(match.replace(/\D/g, '')));
    if (hasValidLuhn) confidence += 0.05;
    
    return Math.min(0.99, confidence);
  }
  
  /**
   * Calculate confidence for government IDs
   */
  private static calculateGovernmentIDConfidence(matches: string[], type: PIIType): number {
    let confidence = 0.9;
    
    // SSN format validation
    if (type.includes('ssn')) {
      const hasValidSSNFormat = matches.some(match => {
        const digits = match.replace(/\D/g, '');
        return digits.length === 9 && !digits.startsWith('000') && !digits.startsWith('666');
      });
      if (hasValidSSNFormat) confidence += 0.05;
    }
    
    return Math.min(0.99, confidence);
  }
  
  /**
   * Calculate confidence for contact information
   */
  private static calculateContactConfidence(matches: string[], type: PIIType): number {
    let confidence = 0.8;
    
    if (type.includes('email')) {
      // Higher confidence for common domains
      const hasCommonDomain = matches.some(match => 
        /\.(com|org|net|edu|gov|mil)$/i.test(match)
      );
      if (hasCommonDomain) confidence += 0.1;
    }
    
    if (type.includes('phone')) {
      // Higher confidence for formatted phone numbers
      const hasFormatting = matches.some(match => /[\(\)\-\.\s]/.test(match));
      if (hasFormatting) confidence += 0.1;
    }
    
    return Math.min(0.95, confidence);
  }
  
  /**
   * Luhn algorithm validation for credit cards
   */
  private static isValidLuhn(digits: string): boolean {
    if (digits.length < 13 || digits.length > 19) return false;
    
    let sum = 0;
    let alternate = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) n = (n % 10) + 1;
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return (sum % 10) === 0;
  }
}

