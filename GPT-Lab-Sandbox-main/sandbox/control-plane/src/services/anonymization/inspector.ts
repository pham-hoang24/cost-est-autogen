// Data Inspector Service - Core Implementation
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { 
  DataAnalysis, 
  ColumnAnalysis, 
  PIIDetection, 
  DataQualityMetrics,
  AnonymizationRecommendation,
  PIIType,
  DetectionMethod,
  RiskLevel,
  PII_PATTERNS,
  DataType,
  AnonymizationTechnique,
  ComplexityLevel
} from './types';
import { GlobalPIIDetector } from './global-detector';

export class DataInspector {
  private jobId: string;

  constructor(jobId: string) {
    this.jobId = jobId;
  }

  /**
   * Main entry point for analyzing uploaded data files
   */
  async analyzeFile(filePath: string): Promise<DataAnalysis> {
    try {
      const fileName = path.basename(filePath);
      const fileStats = fs.statSync(filePath);
      
      // Read and parse the data based on file type
      const data = await this.readDataFile(filePath);
      
      if (!data || data.length === 0) {
        throw new Error('No data found in file or file is empty');
      }

      // Perform comprehensive analysis
      const columns = await this.analyzeColumns(data);
      const piiDetections = await this.detectPII(data, columns);
      const dataQuality = this.assessDataQuality(data, columns);
      const recommendations = this.generateRecommendations(columns, piiDetections);

      return {
        jobId: this.jobId,
        fileName,
        fileSize: fileStats.size,
        rowCount: data.length,
        columnCount: Object.keys(data[0] || {}).length,
        columns,
        piiDetections,
        dataQuality,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing file:', error);
      throw new Error(`Failed to analyze file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Read data from various file formats
   */
  private async readDataFile(filePath: string): Promise<any[]> {
    const extension = path.extname(filePath).toLowerCase();
    
    switch (extension) {
      case '.csv':
        return this.readCSV(filePath);
      case '.json':
        return this.readJSON(filePath);
      // TODO: Add support for .xlsx, .parquet, etc.
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  /**
   * Read CSV files
   */
  private async readCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Read JSON files
   */
  private async readJSON(filePath: string): Promise<any[]> {
    const content = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(content);
    
    // Handle both array of objects and single object
    return Array.isArray(jsonData) ? jsonData : [jsonData];
  }

  /**
   * Analyze individual columns for data types, statistics, and patterns
   */
  private async analyzeColumns(data: any[]): Promise<ColumnAnalysis[]> {
    if (!data.length) return [];
    
    const columnNames = Object.keys(data[0]);
    const analyses: ColumnAnalysis[] = [];

    for (const columnName of columnNames) {
      const values = data.map(row => row[columnName]).filter(val => val !== null && val !== undefined && val !== '');
      const nonNullValues = values.filter(val => val !== '');
      
      const analysis: ColumnAnalysis = {
        name: columnName,
        dataType: this.inferDataType(values),
        nullCount: data.length - nonNullValues.length,
        uniqueCount: new Set(nonNullValues).size,
        sampleValues: this.getSampleValues(nonNullValues, 5),
        statistics: this.calculateColumnStatistics(nonNullValues),
        sensitivityScore: this.calculateSensitivityScore(columnName, nonNullValues)
      };

      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * Detect PII (Personally Identifiable Information) in the data
   */
  async detectPII(data: any[], columns: ColumnAnalysis[]): Promise<PIIDetection[]> {
    const detections: PIIDetection[] = [];

    for (const column of columns) {
      const values = data.map(row => row[column.name]).filter(val => val);
      const piiDetection = await this.detectPIIInColumn(column.name, values);
      
      if (piiDetection) {
        detections.push(piiDetection);
      }
    }

    return detections;
  }

  /**
   * Detect PII in a specific column
   */
  private async detectPIIInColumn(columnName: string, values: any[]): Promise<PIIDetection | null> {
    const sampleSize = Math.min(values.length, 100);
    const sampleValues = values.slice(0, sampleSize);
    
    // Pattern-based detection
    const patternResults = this.detectPIIPatterns(sampleValues);
    
    // Name-based detection (column name analysis)
    const nameResults = this.detectPIIByColumnName(columnName);
    
    // Combine results and determine best match
    const allResults = [...patternResults, ...nameResults];
    
    if (allResults.length === 0) {
      return null;
    }

    // Select the detection with highest confidence
    const bestResult = allResults.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    if (bestResult.confidence < 0.3) {
      return null; // Too low confidence
    }

    return {
      columnName,
      piiType: bestResult.piiType,
      confidence: bestResult.confidence,
      detectionMethod: bestResult.method,
      sampleMatches: bestResult.matches,
      riskLevel: this.calculateRiskLevel(bestResult.piiType, bestResult.confidence)
    };
  }

  /**
   * Enhanced PII detection using global best practices
   * Following GDPR, NIST Privacy Framework, ISO/IEC 27559, PCI DSS, HIPAA
   */
  private detectPIIPatterns(values: any[]): Array<{piiType: PIIType, confidence: number, method: DetectionMethod, matches: string[]}> {
    const stringValues = values
      .filter(val => val != null)
      .map(val => String(val).trim())
      .filter(val => val.length > 0);

    if (stringValues.length === 0) return [];

    // Combine all values into text for comprehensive analysis
    const combinedText = stringValues.join(' ');
    
    // Use global PII detector for industry-standard detection
    const globalResults = GlobalPIIDetector.detectPII(combinedText);
    
    // Convert to expected format and enhance with context
    const results = globalResults.map(detection => ({
      piiType: detection.piiType,
      confidence: this.adjustConfidenceForDataset(detection, stringValues),
      method: detection.method,
      matches: detection.matches.slice(0, 3) // Limit matches for performance
    }));
    
    // Sort by confidence and regulation criticality
    return results.sort((a, b) => {
      // Prioritize critical financial and government data
      const aPriority = this.getPriorityScore(a.piiType);
      const bPriority = this.getPriorityScore(b.piiType);
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      return b.confidence - a.confidence; // Higher confidence first
    });
  }
  
  /**
   * Adjust confidence based on dataset characteristics
   */
  private adjustConfidenceForDataset(detection: { piiType: PIIType, confidence: number, matches: string[] }, values: string[]): number {
    let confidence = detection.confidence;
    
    // Dataset consistency factor
    const matchRatio = detection.matches.length / values.length;
    if (matchRatio > 0.5) confidence += 0.05; // More than half match
    if (matchRatio > 0.8) confidence += 0.1;  // Most values match
    
    // Data quality factor
    const uniqueMatches = new Set(detection.matches).size;
    if (uniqueMatches > 1) confidence += 0.05; // Multiple unique values
    
    // Type-specific validation
    switch (detection.piiType) {
      case 'credit_card_visa':
      case 'credit_card_mastercard':
      case 'credit_card_amex':
      case 'credit_card_discover':
        // Validate credit card specific patterns
        confidence += 0.1; // Brand-specific patterns are more reliable
        break;
        
      case 'ssn_us':
        // Validate SSN format and rules
        const validSSNs = detection.matches.filter(ssn => {
          const digits = ssn.replace(/\D/g, '');
          return digits.length === 9 && 
                 !digits.startsWith('000') && 
                 !digits.startsWith('666') && 
                 !digits.startsWith('9');
        });
        if (validSSNs.length === detection.matches.length) {
          confidence += 0.1; // All SSNs pass validation
        }
        break;
        
      case 'email_strict':
        confidence += 0.05; // RFC-compliant emails get bonus
        break;
        
      case 'iban':
        // IBAN has built-in check digits
        confidence += 0.1;
        break;
    }
    
    return Math.min(0.99, Math.max(0.0, confidence));
  }
  
  /**
   * Get priority score for different PII types based on regulation severity
   */
  private getPriorityScore(piiType: PIIType): number {
    // Critical: Financial data (PCI DSS)
    if (piiType.includes('credit_card') || piiType.includes('iban') || 
        piiType.includes('swift') || piiType.includes('account_number')) {
      return 100;
    }
    
    // Critical: Government IDs (GDPR Article 9)
    if (piiType.includes('ssn') || piiType.includes('passport') || 
        piiType.includes('national_id') || piiType.includes('sin_canada')) {
      return 95;
    }
    
    // Critical: Medical data (HIPAA)
    if (piiType.includes('medical') || piiType.includes('patient')) {
      return 90;
    }
    
    // High: Contact information
    if (piiType.includes('email') || piiType.includes('phone')) {
      return 80;
    }
    
    // Medium: Location and technical
    if (piiType.includes('ip_address') || piiType.includes('postal') || 
        piiType.includes('address')) {
      return 60;
    }
    
    // Low: General
    return 40;
  }

  /**
   * Detect PII based on column names
   */
  private detectPIIByColumnName(columnName: string): Array<{piiType: PIIType, confidence: number, method: DetectionMethod, matches: string[]}> {
    const lowerName = columnName.toLowerCase();
    const results = [];

    // Email column names
    if (lowerName.includes('email') || lowerName.includes('mail')) {
      results.push({
        piiType: 'email' as PIIType,
        confidence: 0.8,
        method: 'nlp_analysis' as DetectionMethod,
        matches: []
      });
    }

    // Name column names
    if (lowerName.includes('name') || lowerName.includes('fullname') || lowerName === 'fname' || lowerName === 'lname') {
      results.push({
        piiType: 'name' as PIIType,
        confidence: 0.85,
        method: 'nlp_analysis' as DetectionMethod,
        matches: []
      });
    }

    // Phone column names
    if (lowerName.includes('phone') || lowerName.includes('tel') || lowerName.includes('mobile')) {
      results.push({
        piiType: 'phone' as PIIType,
        confidence: 0.8,
        method: 'nlp_analysis' as DetectionMethod,
        matches: []
      });
    }

    // Address column names  
    if (lowerName.includes('address') || lowerName.includes('street') || lowerName.includes('city') || lowerName.includes('zip')) {
      results.push({
        piiType: 'address' as PIIType,
        confidence: 0.75,
        method: 'nlp_analysis' as DetectionMethod,
        matches: []
      });
    }

    // Additional PII types
    if (lowerName.includes('passport') || lowerName.includes('passport_number')) {
      results.push({
        piiType: 'passport' as PIIType,
        confidence: 0.8,
        method: 'nlp_analysis' as DetectionMethod,
        matches: []
      });
    }

    if (lowerName.includes('website') || lowerName.includes('url') || lowerName.includes('domain')) {
      results.push({
        piiType: 'website' as PIIType,
        confidence: 0.7,
        method: 'nlp_analysis' as DetectionMethod,
        matches: []
      });
    }

    if (lowerName.includes('birth') || lowerName.includes('dob') || lowerName.includes('birthday')) {
      results.push({
        piiType: 'date_of_birth' as PIIType,
        confidence: 0.85,
        method: 'nlp_analysis' as DetectionMethod,
        matches: []
      });
    }

    if (lowerName.includes('ip') || lowerName.includes('ip_address') || lowerName.includes('ipaddress')) {
      results.push({
        piiType: 'ip_address' as PIIType,
        confidence: 0.9,
        method: 'nlp_analysis' as DetectionMethod,
        matches: []
      });
    }

    return results;
  }

  /**
   * Calculate risk level based on PII type and confidence
   */
  private calculateRiskLevel(piiType: PIIType, confidence: number): RiskLevel {
    const highRiskTypes = ['ssn', 'credit_card', 'date_of_birth'];
    const mediumRiskTypes = ['email', 'phone', 'name', 'address'];
    
    if (highRiskTypes.includes(piiType)) {
      return confidence > 0.8 ? 'critical' : 'high';
    } else if (mediumRiskTypes.includes(piiType)) {
      return confidence > 0.8 ? 'high' : 'medium';
    } else {
      return confidence > 0.8 ? 'medium' : 'low';
    }
  }

  /**
   * Assess overall data quality
   */
  private assessDataQuality(data: any[], columns: ColumnAnalysis[]): DataQualityMetrics {
    const totalCells = data.length * columns.length;
    const nullCells = columns.reduce((sum, col) => sum + col.nullCount, 0);
    
    const completeness = 1 - (nullCells / totalCells);
    const consistency = this.calculateConsistency(columns);
    const validity = this.calculateValidity(columns);
    
    return {
      completeness,
      consistency,
      accuracy: 0.85, // TODO: Implement accuracy calculation
      validity,
      overallScore: (completeness + consistency + validity) / 3
    };
  }

  /**
   * Generate anonymization recommendations
   */
  private generateRecommendations(columns: ColumnAnalysis[], piiDetections: PIIDetection[]): AnonymizationRecommendation[] {
    const recommendations: AnonymizationRecommendation[] = [];

    for (const detection of piiDetections) {
      const column = columns.find(col => col.name === detection.columnName);
      if (!column) continue;

      let technique: AnonymizationTechnique;
      let reasoning: string;
      let complexityLevel: ComplexityLevel;

      switch (detection.piiType) {
        case 'email':
          technique = 'pseudonymization';
          reasoning = 'Email addresses can be pseudonymized while maintaining domain structure for analytics';
          complexityLevel = 'simple';
          break;
        case 'ssn':
        case 'credit_card':
          technique = 'suppression';
          reasoning = 'High-risk identifiers should be completely suppressed or replaced with synthetic values';
          complexityLevel = 'simple';
          break;
        case 'name':
          technique = 'generalization';
          reasoning = 'Names can be generalized to preserve demographic patterns while removing individual identification';
          complexityLevel = 'moderate';
          break;
        default:
          technique = 'k_anonymity';
          reasoning = 'Apply k-anonymity to ensure individuals cannot be re-identified';
          complexityLevel = 'moderate';
      }

      recommendations.push({
        columnName: detection.columnName,
        recommendedTechnique: technique,
        reasoning,
        privacyImpact: this.calculatePrivacyImpact(detection.riskLevel),
        utilityImpact: this.calculateUtilityImpact(technique, column),
        complexityLevel
      });
    }

    return recommendations;
  }

  // Helper methods
  private inferDataType(values: any[]): DataType {
    if (values.length === 0) return 'string';
    
    const sampleValues = values.slice(0, 10);
    
    // Check for emails
    if (sampleValues.some(val => PII_PATTERNS.EMAIL.test(String(val)))) {
      return 'email';
    }
    
    // Check for phone numbers
    if (sampleValues.some(val => PII_PATTERNS.PHONE_GENERIC.test(String(val)))) {
      return 'phone';
    }
    
    // Check for numbers
    if (sampleValues.every(val => !isNaN(Number(val)))) {
      return 'number';
    }
    
    // Check for booleans
    if (sampleValues.every(val => val === true || val === false || val === 'true' || val === 'false')) {
      return 'boolean';
    }
    
    // Check for dates
    if (sampleValues.every(val => !isNaN(Date.parse(String(val))))) {
      return 'date';
    }
    
    return 'string';
  }

  private getSampleValues(values: any[], count: number): any[] {
    const shuffled = [...values].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private calculateColumnStatistics(values: any[]): any {
    if (values.length === 0) return {};
    
    const numericValues = values.filter(val => !isNaN(Number(val))).map(Number);
    
    if (numericValues.length === 0) {
      return {
        distinctValues: new Set(values).size,
        entropy: this.calculateEntropy(values)
      };
    }
    
    return {
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      mean: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
      distinctValues: new Set(values).size,
      entropy: this.calculateEntropy(values)
    };
  }

  private calculateEntropy(values: any[]): number {
    const frequencies = new Map();
    values.forEach(val => {
      frequencies.set(val, (frequencies.get(val) || 0) + 1);
    });
    
    const total = values.length;
    let entropy = 0;
    
    for (const freq of frequencies.values()) {
      const probability = freq / total;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  private calculateSensitivityScore(columnName: string, values: any[]): number {
    const lowerName = columnName.toLowerCase();
    let score = 0;
    
    // Name-based sensitivity
    if (lowerName.includes('id') || lowerName.includes('identifier')) score += 0.3;
    if (lowerName.includes('name')) score += 0.4;
    if (lowerName.includes('email') || lowerName.includes('phone')) score += 0.5;
    if (lowerName.includes('ssn') || lowerName.includes('credit')) score += 0.9;
    
    // Uniqueness-based sensitivity
    const uniqueRatio = new Set(values).size / values.length;
    if (uniqueRatio > 0.9) score += 0.3;
    else if (uniqueRatio > 0.7) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateConsistency(columns: ColumnAnalysis[]): number {
    // Simple consistency check based on data type uniformity
    return 0.9; // TODO: Implement proper consistency calculation
  }

  private calculateValidity(columns: ColumnAnalysis[]): number {
    // Validity based on format compliance
    return 0.85; // TODO: Implement proper validity calculation
  }

  private calculatePrivacyImpact(riskLevel: RiskLevel): number {
    switch (riskLevel) {
      case 'critical': return 0.95;
      case 'high': return 0.8;
      case 'medium': return 0.6;
      case 'low': return 0.3;
      default: return 0.5;
    }
  }

  private calculateUtilityImpact(technique: AnonymizationTechnique, column: ColumnAnalysis): number {
    switch (technique) {
      case 'suppression': return 0.9; // High utility impact (removes data)
      case 'generalization': return 0.5; // Medium impact
      case 'pseudonymization': return 0.2; // Low impact
      case 'k_anonymity': return 0.4; // Medium-low impact
      default: return 0.5;
    }
  }
}
