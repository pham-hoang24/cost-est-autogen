// PII Anonymization Helper - Handles Direct Identifiers
import { PIIDetection } from './types';

export interface AnonymizationResult {
  originalValue: any;
  anonymizedValue: any;
  method: string;
}

/**
 * Comprehensive PII anonymization helper that properly handles all PII types
 */
export class PIIAnonymizer {
  
  /**
   * Anonymize a complete dataset by handling all PII fields properly
   */
  static anonymizeDataset(data: any[], piiDetections: PIIDetection[]): any[] {
    if (!data || data.length === 0) return data;

    return data.map(row => {
      const anonymizedRow = { ...row };
      
      // Apply anonymization to each detected PII column
      for (const detection of piiDetections) {
        const originalValue = row[detection.columnName];
        if (originalValue !== null && originalValue !== undefined && originalValue !== '') {
          anonymizedRow[detection.columnName] = this.anonymizeValue(
            originalValue, 
            detection.piiType, 
            detection.riskLevel
          );
        }
      }
      
      return anonymizedRow;
    });
  }

  /**
   * Anonymize a single value based on its PII type
   */
  private static anonymizeValue(value: any, piiType: string, riskLevel: string): any {
    const stringValue = String(value);
    
    switch (piiType) {
      case 'name':
        return this.anonymizeName(stringValue, riskLevel);
      
      case 'email':
        return this.anonymizeEmail(stringValue, riskLevel);
      
      case 'phone':
        return this.anonymizePhone(stringValue, riskLevel);
      
      // Government IDs (GDPR Article 9 - Critical)
      case 'ssn':
      case 'ssn_us':
      case 'ssn_digits_only':
      case 'ssn_alternative':
      case 'sin_canada':
        return this.anonymizeSSN(stringValue, riskLevel);
      
      case 'passport':
      case 'passport_us':
      case 'passport_uk':
      case 'passport_generic':
        return this.anonymizeGovernmentID(stringValue, 'PASSPORT', riskLevel);
      
      case 'driver_license':
        return this.anonymizeGovernmentID(stringValue, 'DL', riskLevel);
      
      case 'national_id':
      case 'national_id_eu':
      case 'national_id_nordic':
        return this.anonymizeGovernmentID(stringValue, 'ID', riskLevel);

      // Financial data (PCI DSS - Critical)
      case 'credit_card':
      case 'credit_card_visa':
      case 'credit_card_mastercard':
      case 'credit_card_amex':
      case 'credit_card_discover':
      case 'credit_card_generic':
      case 'credit_card_spaces':
        return this.anonymizeCreditCard(stringValue, riskLevel);
      
      case 'iban':
        return this.anonymizeIBAN(stringValue, riskLevel);
      
      case 'swift_bic':
        return this.anonymizeFinancialCode(stringValue, 'SWIFT', riskLevel);
      
      case 'routing_number':
        return this.anonymizeFinancialCode(stringValue, 'ROUTING', riskLevel);
      
      case 'account_number':
        return this.anonymizeAccountNumber(stringValue, riskLevel);
      
      case 'sort_code_uk':
        return this.anonymizeFinancialCode(stringValue, 'SORT', riskLevel);
      
      case 'tax_id':
        return this.anonymizeFinancialCode(stringValue, 'TAX', riskLevel);
      
      case 'vat_number_eu':
        return this.anonymizeFinancialCode(stringValue, 'VAT', riskLevel);

      // Contact information (GDPR - High)
      case 'email_strict':
        return this.anonymizeEmail(stringValue, riskLevel);
      
      case 'phone':
      case 'phone_us':
      case 'phone_international':
      case 'phone_uk':
      case 'phone_eu':
      case 'phone_generic':
        return this.anonymizePhone(stringValue, riskLevel);
      
      case 'person_name':
        return this.anonymizeName(stringValue, riskLevel);

      // Medical data (HIPAA - Critical)
      case 'medical_record_number':
      case 'patient_id':
        return this.anonymizeMedicalID(stringValue, riskLevel);

      // Technical identifiers (GDPR - Medium)
      case 'ip_address':
      case 'ip_address_v4':
        return this.anonymizeIPv4(stringValue, riskLevel);
      
      case 'ip_address_v6':
        return this.anonymizeIPv6(stringValue, riskLevel);
      
      case 'username':
        return this.anonymizeUsername(stringValue, riskLevel);
      
      case 'bitcoin_address':
      case 'ethereum_address':
        return this.anonymizeCryptoAddress(stringValue, riskLevel);

      // Location data (GDPR - Medium)
      case 'postal_code':
      case 'postal_code_us':
      case 'postal_code_uk':
      case 'postal_code_canada':
      case 'postal_code_germany':
        return this.anonymizePostalCode(stringValue, riskLevel);
      
      case 'license_plate':
      case 'license_plate_us':
      case 'license_plate_eu':
        return this.anonymizeLicensePlate(stringValue, riskLevel);

      // Dates
      case 'date_iso':
      case 'date_eu':
        return this.anonymizeDate(stringValue, riskLevel);
      
      case 'address':
        return this.anonymizeAddress(stringValue, riskLevel);
      
      case 'ip_address':
        return this.anonymizeIPAddress(stringValue, riskLevel);
      
      case 'date_of_birth':
        return this.anonymizeDateOfBirth(stringValue, riskLevel);
      
      case 'passport':
        return this.anonymizePassport(stringValue, riskLevel);
      
      case 'website':
        return this.anonymizeWebsite(stringValue, riskLevel);
      
      case 'national_id':
        return this.anonymizeNationalId(stringValue, riskLevel);
      
      case 'mac_address':
        return this.anonymizeMacAddress(stringValue, riskLevel);
      
      case 'iban':
        return this.anonymizeIban(stringValue, riskLevel);
      
      default:
        // For unknown PII types, apply generic anonymization
        return this.genericAnonymization(stringValue, riskLevel);
    }
  }

  /**
   * Anonymize names while preserving demographic patterns
   */
  private static anonymizeName(name: string, riskLevel: string): string {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      // Full suppression for high-risk scenarios
      return '[NAME_REDACTED]';
    }
    
    // For medium/low risk, preserve first letter and length pattern
    const parts = name.trim().split(' ');
    return parts.map(part => {
      if (part.length <= 1) return part;
      return part.charAt(0) + '*'.repeat(part.length - 1);
    }).join(' ');
  }

  /**
   * Anonymize email addresses while preserving domain structure
   */
  private static anonymizeEmail(email: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[EMAIL_REDACTED]';
    }
    
    const [localPart, domain] = email.split('@');
    if (!domain) return '[INVALID_EMAIL]';
    
    if (riskLevel === 'high') {
      // Suppress local part, keep domain for analytics
      return `[USER]@${domain}`;
    }
    
    // For medium/low risk, preserve first letter and domain
    const anonymizedLocal = localPart.length > 1 
      ? localPart.charAt(0) + '*'.repeat(localPart.length - 1)
      : localPart;
    
    return `${anonymizedLocal}@${domain}`;
  }

  /**
   * Anonymize phone numbers while preserving format structure
   */
  private static anonymizePhone(phone: string, riskLevel: string): string {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return '[PHONE_REDACTED]';
    }
    
    // For medium/low risk, preserve area code and format
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      const areaCode = digits.substring(0, 3);
      return `${areaCode}-XXX-XXXX`;
    }
    
    return '[PHONE_MASKED]';
  }

  /**
   * Anonymize SSN (always high security)
   */
  private static anonymizeSSN(ssn: string, riskLevel: string): string {
    // SSNs are always suppressed or heavily masked
    if (riskLevel === 'critical') {
      return '[SSN_REDACTED]';
    }
    
    // For compliance purposes, only show last 4 digits
    const digits = ssn.replace(/\D/g, '');
    if (digits.length === 9) {
      return `XXX-XX-${digits.substring(5)}`;
    }
    
    return '[SSN_MASKED]';
  }

  /**
   * Anonymize credit card numbers
   */
  private static anonymizeCreditCard(cc: string, riskLevel: string): string {
    // Credit cards are always heavily masked
    if (riskLevel === 'critical') {
      return '[CARD_REDACTED]';
    }
    
    const digits = cc.replace(/\D/g, '');
    if (digits.length >= 13) {
      // Show first 4 and last 4 digits only
      const first4 = digits.substring(0, 4);
      const last4 = digits.substring(digits.length - 4);
      return `${first4}-XXXX-XXXX-${last4}`;
    }
    
    return '[CARD_MASKED]';
  }

  /**
   * Anonymize addresses while preserving geographic patterns
   */
  private static anonymizeAddress(address: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[ADDRESS_REDACTED]';
    }
    
    // Extract city/state if possible for geographic analysis
    const parts = address.split(',');
    if (parts.length >= 2 && riskLevel !== 'high') {
      // Keep city/state for demographic analysis
      const lastPart = parts[parts.length - 1].trim();
      return `[STREET_REDACTED], ${lastPart}`;
    }
    
    return '[ADDRESS_MASKED]';
  }

  /**
   * Anonymize IP addresses while preserving network structure
   */
  private static anonymizeIPAddress(ip: string, riskLevel: string): string {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return '[IP_REDACTED]';
    }
    
    const parts = ip.split('.');
    if (parts.length === 4) {
      // Keep first two octets for network analysis
      return `${parts[0]}.${parts[1]}.XXX.XXX`;
    }
    
    return '[IP_MASKED]';
  }

  /**
   * Anonymize dates of birth while preserving age demographics
   */
  private static anonymizeDateOfBirth(dob: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[DOB_REDACTED]';
    }
    
    // Convert to age ranges for demographic analysis
    const date = new Date(dob);
    if (!isNaN(date.getTime())) {
      const age = new Date().getFullYear() - date.getFullYear();
      
      // Convert to age ranges
      if (age < 18) return '[MINOR]';
      if (age < 25) return '[18-24]';
      if (age < 35) return '[25-34]';
      if (age < 45) return '[35-44]';
      if (age < 55) return '[45-54]';
      if (age < 65) return '[55-64]';
      return '[65+]';
    }
    
    return '[DOB_MASKED]';
  }

  /**
   * Anonymize passport numbers
   */
  private static anonymizePassport(passport: string, riskLevel: string): string {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return '[PASSPORT_REDACTED]';
    }
    
    // For medium/low risk, show first 2 characters
    if (passport.length > 2) {
      return passport.substring(0, 2) + '*'.repeat(passport.length - 2);
    }
    
    return '[PASSPORT_MASKED]';
  }

  /**
   * Anonymize website URLs while preserving domain structure for analytics
   */
  private static anonymizeWebsite(website: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[WEBSITE_REDACTED]';
    }
    
    try {
      const url = new URL(website);
      if (riskLevel === 'high') {
        return `[USER_SITE].${url.hostname.split('.').slice(-2).join('.')}`;
      }
      
      // For medium/low risk, preserve domain structure
      return `https://[REDACTED].${url.hostname.split('.').slice(-2).join('.')}`;
    } catch {
      return '[INVALID_URL]';
    }
  }

  /**
   * Anonymize national ID numbers
   */
  private static anonymizeNationalId(nationalId: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[NATIONAL_ID_REDACTED]';
    }
    
    const digits = nationalId.replace(/\D/g, '');
    if (digits.length >= 6 && riskLevel !== 'high') {
      // Show first 2 and last 2 digits
      return `${digits.substring(0, 2)}****${digits.substring(digits.length - 2)}`;
    }
    
    return '[NATIONAL_ID_MASKED]';
  }

  /**
   * Anonymize MAC addresses while preserving vendor info
   */
  private static anonymizeMacAddress(mac: string, riskLevel: string): string {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return '[MAC_REDACTED]';
    }
    
    // For medium/low risk, preserve vendor prefix (first 3 octets)
    const parts = mac.split(/[:-]/);
    if (parts.length === 6) {
      return `${parts.slice(0, 3).join(':')}:XX:XX:XX`;
    }
    
    return '[MAC_MASKED]';
  }

  /**
   * Anonymize IBAN numbers
   */
  private static anonymizeIban(iban: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[IBAN_REDACTED]';
    }
    
    if (iban.length >= 4 && riskLevel !== 'high') {
      // Keep country code and check digits, mask account identifier
      const countryCode = iban.substring(0, 2);
      const checkDigits = iban.substring(2, 4);
      return `${countryCode}${checkDigits}${'X'.repeat(iban.length - 4)}`;
    }
    
    return '[IBAN_MASKED]';
  }

  /**
   * Generic anonymization for unknown PII types
   */
  private static genericAnonymization(value: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[REDACTED]';
    }
    
    if (riskLevel === 'high') {
      return '[MASKED]';
    }
    
    // For medium/low risk, partially mask
    if (value.length <= 2) return value;
    
    const firstChar = value.charAt(0);
    const lastChar = value.charAt(value.length - 1);
    const middleMask = '*'.repeat(Math.max(0, value.length - 2));
    
    return `${firstChar}${middleMask}${lastChar}`;
  }

  /**
   * Generate anonymization report
   */
  static generateAnonymizationReport(
    originalData: any[], 
    anonymizedData: any[], 
    piiDetections: PIIDetection[]
  ) {
    const totalFields = originalData.length * (originalData[0] ? Object.keys(originalData[0]).length : 0);
    const piiFields = piiDetections.length * originalData.length;
    
    return {
      totalRecords: originalData.length,
      totalFields,
      piiFieldsAnonymized: piiFields,
      anonymizationRate: totalFields > 0 ? (piiFields / totalFields) * 100 : 0,
      piiTypesFound: [...new Set(piiDetections.map(d => d.piiType))],
      highRiskFieldsAnonymized: piiDetections.filter(d => 
        d.riskLevel === 'critical' || d.riskLevel === 'high'
      ).length * originalData.length,
      privacyLevel: this.calculatePrivacyLevel(piiDetections),
      complianceStatus: this.assessCompliance(piiDetections)
    };
  }

  /**
   * Calculate overall privacy level achieved
   */
  private static calculatePrivacyLevel(piiDetections: PIIDetection[]): string {
    const riskLevels = piiDetections.map(d => d.riskLevel);
    
    if (riskLevels.includes('critical')) return 'high-privacy';
    if (riskLevels.includes('high')) return 'medium-privacy';
    if (riskLevels.includes('medium')) return 'standard-privacy';
    return 'basic-privacy';
  }

  // ============ ENHANCED GLOBAL ANONYMIZATION METHODS ============
  
  /**
   * Anonymize government IDs (passports, licenses, etc.)
   */
  private static anonymizeGovernmentID(id: string, type: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return `[${type}_REDACTED]`;
    }
    
    // Show format but mask sensitive parts
    const digits = id.replace(/\D/g, '');
    const letters = id.replace(/\d/g, '').replace(/[^A-Za-z]/g, '');
    
    if (digits.length >= 6) {
      const lastTwo = digits.slice(-2);
      return `[${type}_${letters}XXXX${lastTwo}]`;
    }
    
    return `[${type}_MASKED]`;
  }
  
  /**
   * Anonymize IBAN (International Bank Account Number)
   */
  private static anonymizeIBAN(iban: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[IBAN_REDACTED]';
    }
    
    // Keep country code, mask the rest
    if (iban.length >= 4) {
      const countryCode = iban.substring(0, 2);
      const checkDigits = iban.substring(2, 4);
      return `${countryCode}${checkDigits}XXXXXXXXXXXXXXXXXXXX`;
    }
    
    return '[IBAN_MASKED]';
  }
  
  /**
   * Anonymize financial codes (SWIFT, routing, sort codes, etc.)
   */
  private static anonymizeFinancialCode(code: string, type: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return `[${type}_REDACTED]`;
    }
    
    // Keep first and last characters for format recognition
    if (code.length >= 4) {
      const first = code.substring(0, 1);
      const last = code.substring(code.length - 1);
      const middle = 'X'.repeat(Math.max(2, code.length - 2));
      return `${first}${middle}${last}`;
    }
    
    return `[${type}_MASKED]`;
  }
  
  /**
   * Anonymize account numbers
   */
  private static anonymizeAccountNumber(account: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[ACCOUNT_REDACTED]';
    }
    
    // Show last 4 digits only (banking standard)
    const digits = account.replace(/\D/g, '');
    if (digits.length >= 4) {
      const lastFour = digits.slice(-4);
      return `XXXXXXXX${lastFour}`;
    }
    
    return '[ACCOUNT_MASKED]';
  }
  
  /**
   * Anonymize medical identifiers (HIPAA compliance)
   */
  private static anonymizeMedicalID(id: string, riskLevel: string): string {
    // Medical data is always critical under HIPAA
    return '[MEDICAL_ID_REDACTED]';
  }
  
  /**
   * Anonymize IPv4 addresses
   */
  private static anonymizeIPv4(ip: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[IP_REDACTED]';
    }
    
    // Keep network portion, mask host portion
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.XXX.XXX`;
    }
    
    return '[IP_MASKED]';
  }
  
  /**
   * Anonymize IPv6 addresses
   */
  private static anonymizeIPv6(ip: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[IPV6_REDACTED]';
    }
    
    // Keep prefix, mask interface identifier
    const parts = ip.split(':');
    if (parts.length >= 4) {
      const prefix = parts.slice(0, 4).join(':');
      return `${prefix}::XXXX:XXXX:XXXX:XXXX`;
    }
    
    return '[IPV6_MASKED]';
  }
  
  /**
   * Anonymize usernames
   */
  private static anonymizeUsername(username: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[USER_REDACTED]';
    }
    
    // Keep first and last character
    if (username.length >= 3) {
      const first = username.charAt(0);
      const last = username.charAt(username.length - 1);
      const middle = 'X'.repeat(Math.max(1, username.length - 2));
      return `${first}${middle}${last}`;
    }
    
    return '[USER_MASKED]';
  }
  
  /**
   * Anonymize cryptocurrency addresses
   */
  private static anonymizeCryptoAddress(address: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[CRYPTO_REDACTED]';
    }
    
    // Show first 6 and last 4 characters
    if (address.length >= 10) {
      const first = address.substring(0, 6);
      const last = address.substring(address.length - 4);
      return `${first}...${last}`;
    }
    
    return '[CRYPTO_MASKED]';
  }
  
  /**
   * Anonymize postal codes
   */
  private static anonymizePostalCode(code: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[POSTAL_REDACTED]';
    }
    
    // For US ZIP codes, keep first 3 digits (broader geographic area)
    if (/^\d{5}(-\d{4})?$/.test(code)) {
      const first3 = code.substring(0, 3);
      return `${first3}XX`;
    }
    
    // For other formats, generalize
    return '[POSTAL_AREA]';
  }
  
  /**
   * Anonymize license plates
   */
  private static anonymizeLicensePlate(plate: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[PLATE_REDACTED]';
    }
    
    // Keep format but mask characters
    return plate.replace(/[A-Z0-9]/g, 'X');
  }
  
  /**
   * Anonymize dates (preserving year for analysis)
   */
  private static anonymizeDate(date: string, riskLevel: string): string {
    if (riskLevel === 'critical') {
      return '[DATE_REDACTED]';
    }
    
    // Try to extract and preserve year only
    const yearMatch = date.match(/\d{4}/);
    if (yearMatch) {
      return `[DATE_${yearMatch[0]}]`;
    }
    
    return '[DATE_MASKED]';
  }

  /**
   * Assess compliance with privacy regulations
   */
  private static assessCompliance(piiDetections: PIIDetection[]) {
    const criticalPII = piiDetections.filter(d => d.riskLevel === 'critical');
    const highRiskPII = piiDetections.filter(d => d.riskLevel === 'high');
    
    return {
      gdprCompliant: criticalPII.length === 0, // No critical PII left unmasked
      hipaaCompliant: !piiDetections.some(d => 
        d.piiType === 'ssn' || d.piiType === 'date_of_birth'
      ),
      euAiActCompliant: highRiskPII.length <= 2, // Limited high-risk PII
      riskScore: (criticalPII.length * 0.4 + highRiskPII.length * 0.2) / piiDetections.length
    };
  }
}
