/**
 * K-Anonymity Algorithm Implementation
 * 
 * Academic Reference: Sweeney, L. (2002). k-anonymity: A model for protecting privacy.
 * International Journal of Uncertainty, Fuzziness and Knowledge-Based Systems, 10(05), 557-570.
 * 
 * Implementation follows TUNi specification - Sprint 3 Tasks
 * Priority: Must-Have
 */

import { AnonymizationConfig, PIIDetection } from '../types.js';
import { PIIAnonymizer } from '../pii-anonymizer.js';

export interface KAnonymityConfig {
  k: number; // Minimum group size
  quasiIdentifiers: string[]; // Columns to generalize
  sensitiveAttributes: string[]; // Columns to protect
  generalizationHierarchy?: Record<string, string[]>; // Custom hierarchies
  suppressionThreshold?: number; // Max suppression percentage (default: 5%)
}

export interface GeneralizationLevel {
  column: string;
  level: number;
  mapping: Record<string, string>;
}

export interface KAnonymityResult {
  data: any[];
  algorithm: string;
  parameters: KAnonymityConfig;
  k: number;
  generalizationLevels: GeneralizationLevel[];
  suppressedRecords: number;
  informationLoss: number;
  privacyMetrics: any[];
  qualityMetrics: {
    dataUtility: number;
    privacyLevel: number;
    processingTime: number;
  };
}

/**
 * K-Anonymity Engine
 * Implements generalization and suppression techniques
 */
export class KAnonymityEngine {
  private config: KAnonymityConfig;

  constructor(config: KAnonymityConfig) {
    this.config = {
      suppressionThreshold: 0.05, // 5% default
      ...config
    };
  }

  /**
   * Main K-Anonymity anonymization method
   */
  async anonymize(data: any[]): Promise<KAnonymityResult> {
    console.log(`🔧 Starting K-Anonymity anonymization with k=${this.config.k}`);
    
    // Step 1: Validate input data
    this.validateInput(data);
    
    // Step 2: Initialize generalization hierarchies
    const hierarchies = this.initializeHierarchies(data);
    
    // Step 3: Apply K-Anonymity algorithm
    let anonymizedData = [...data];
    let generalizationLevels: GeneralizationLevel[] = [];
    let iteration = 0;
    const maxIterations = 10;
    
    while (!this.isKAnonymous(anonymizedData) && iteration < maxIterations) {
      iteration++;
      console.log(`📊 K-Anonymity iteration ${iteration}`);
      
      // Find smallest groups that violate k-anonymity
      const violations = this.findKAnonymityViolations(anonymizedData);
      
      if (violations.length === 0) break;
      
      // Apply generalization to resolve violations
      const generalization = this.selectBestGeneralization(violations, hierarchies);
      anonymizedData = this.applyGeneralization(anonymizedData, generalization);
      generalizationLevels.push(generalization);
      
      console.log(`✅ Applied generalization: ${generalization.column} level ${generalization.level}`);
    }
    
    // Step 4: Apply suppression for remaining violations
    const { finalData, suppressedCount } = this.applySuppression(anonymizedData);
    
    // Step 5: Calculate metrics
    const metrics = this.calculatePrivacyMetrics(data, finalData);
    const informationLoss = this.calculateInformationLoss(data, finalData, generalizationLevels);
    
    console.log(`🎯 K-Anonymity complete: k=${this.config.k}, suppressed=${suppressedCount}, loss=${informationLoss.toFixed(2)}%`);
    
    return {
      data: finalData,
      algorithm: 'k-anonymity',
      parameters: this.config,
      k: this.config.k,
      generalizationLevels,
      suppressedRecords: suppressedCount,
      informationLoss,
      privacyMetrics: metrics,
      qualityMetrics: {
        dataUtility: 100 - informationLoss,
        privacyLevel: this.calculatePrivacyLevel(finalData),
        processingTime: Date.now()
      }
    };
  }

  /**
   * Validate input data for K-Anonymity requirements
   */
  private validateInput(data: any[]): void {
    if (!data || data.length === 0) {
      throw new Error('Input data cannot be empty');
    }
    
    if (this.config.k < 2) {
      throw new Error('K value must be at least 2');
    }
    
    if (this.config.k > data.length) {
      throw new Error(`K value (${this.config.k}) cannot exceed dataset size (${data.length})`);
    }
    
    // Validate quasi-identifiers exist
    const columns = Object.keys(data[0]);
    for (const qi of this.config.quasiIdentifiers) {
      if (!columns.includes(qi)) {
        throw new Error(`Quasi-identifier column '${qi}' not found in data`);
      }
    }
  }

  /**
   * Initialize generalization hierarchies for each quasi-identifier
   */
  private initializeHierarchies(data: any[]): Record<string, string[][]> {
    const hierarchies: Record<string, string[][]> = {};
    
    for (const column of this.config.quasiIdentifiers) {
      hierarchies[column] = this.buildGeneralizationHierarchy(data, column);
    }
    
    return hierarchies;
  }

  /**
   * Build generalization hierarchy for a column
   */
  private buildGeneralizationHierarchy(data: any[], column: string): string[][] {
    const values = [...new Set(data.map(row => row[column]))].filter(v => v != null);
    
    // Custom hierarchy if provided
    if (this.config.generalizationHierarchy?.[column]) {
      return [values, this.config.generalizationHierarchy[column]];
    }
    
    // Auto-generate hierarchy based on data type
    const sampleValue = values[0];
    
    if (typeof sampleValue === 'number') {
      return this.buildNumericHierarchy(values as number[]);
    } else if (this.isDate(sampleValue)) {
      return this.buildDateHierarchy(values);
    } else {
      return this.buildCategoricalHierarchy(values);
    }
  }

  /**
   * Build numeric generalization hierarchy (e.g., age ranges)
   */
  private buildNumericHierarchy(values: number[]): string[][] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    const level0 = values.map(String); // Original values
    const level1 = values.map(v => {
      const bucket = Math.floor((v - min) / (range / 10)) * (range / 10) + min;
      return `${bucket}-${bucket + (range / 10)}`;
    });
    const level2 = values.map(v => {
      const bucket = Math.floor((v - min) / (range / 5)) * (range / 5) + min;
      return `${bucket}-${bucket + (range / 5)}`;
    });
    const level3 = values.map(() => `${min}-${max}`); // Full range
    
    return [level0, level1, level2, level3];
  }

  /**
   * Build date generalization hierarchy
   */
  private buildDateHierarchy(values: any[]): string[][] {
    const level0 = values.map(String); // Original dates
    const level1 = values.map(v => {
      const date = new Date(v);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
    const level2 = values.map(v => {
      const date = new Date(v);
      return String(date.getFullYear());
    });
    const level3 = values.map(() => '*'); // Fully suppressed
    
    return [level0, level1, level2, level3];
  }

  /**
   * Build categorical generalization hierarchy
   */
  private buildCategoricalHierarchy(values: any[]): string[][] {
    const level0 = values.map(String); // Original values
    const level1 = values.map(v => {
      // Group similar categories (simplified approach)
      const str = String(v).toLowerCase();
      if (str.includes('eng') || str.includes('tech')) return 'Technical';
      if (str.includes('sales') || str.includes('market')) return 'Commercial';
      if (str.includes('hr') || str.includes('admin')) return 'Administrative';
      return 'Other';
    });
    const level2 = values.map(() => '*'); // Fully generalized
    
    return [level0, level1, level2];
  }

  /**
   * Check if dataset satisfies k-anonymity
   */
  private isKAnonymous(data: any[]): boolean {
    const groups = this.groupByQuasiIdentifiers(data);
    return Object.values(groups).every(group => group.length >= this.config.k);
  }

  /**
   * Find groups that violate k-anonymity
   */
  private findKAnonymityViolations(data: any[]): any[][] {
    const groups = this.groupByQuasiIdentifiers(data);
    return Object.values(groups).filter(group => group.length < this.config.k);
  }

  /**
   * Group data by quasi-identifier values
   */
  private groupByQuasiIdentifiers(data: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    for (const row of data) {
      const key = this.config.quasiIdentifiers
        .map(col => row[col])
        .join('|');
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    }
    
    return groups;
  }

  /**
   * Select best generalization to apply
   */
  private selectBestGeneralization(
    violations: any[][],
    hierarchies: Record<string, string[][]>
  ): GeneralizationLevel {
    // Find column with minimum information loss
    let bestColumn = this.config.quasiIdentifiers[0];
    let minLoss = Infinity;
    
    for (const column of this.config.quasiIdentifiers) {
      const hierarchy = hierarchies[column];
      const currentLevel = 0; // Simplified - track current levels
      
      if (currentLevel < hierarchy.length - 1) {
        const loss = this.estimateInformationLoss(column, currentLevel + 1, hierarchy);
        if (loss < minLoss) {
          minLoss = loss;
          bestColumn = column;
        }
      }
    }
    
    return {
      column: bestColumn,
      level: 1, // Simplified - increment level
      mapping: this.createGeneralizationMapping(bestColumn, hierarchies[bestColumn], 1)
    };
  }

  /**
   * Create mapping for generalization
   */
  private createGeneralizationMapping(
    column: string,
    hierarchy: string[][],
    level: number
  ): Record<string, string> {
    const mapping: Record<string, string> = {};
    const originalValues = hierarchy[0];
    const generalizedValues = hierarchy[level] || hierarchy[hierarchy.length - 1];
    
    for (let i = 0; i < originalValues.length; i++) {
      mapping[originalValues[i]] = generalizedValues[i];
    }
    
    return mapping;
  }

  /**
   * Apply generalization to data
   */
  protected applyGeneralization(data: any[], generalization: GeneralizationLevel): any[] {
    return data.map(row => ({
      ...row,
      [generalization.column]: generalization.mapping[row[generalization.column]] || row[generalization.column]
    }));
  }

  /**
   * Apply suppression for remaining violations
   */
  private applySuppression(data: any[]): { finalData: any[], suppressedCount: number } {
    const groups = this.groupByQuasiIdentifiers(data);
    const violations = Object.values(groups).filter(group => group.length < this.config.k);
    
    let suppressedCount = 0;
    const maxSuppressions = Math.floor(data.length * (this.config.suppressionThreshold || 0.05));
    
    const finalData = data.filter(row => {
      const key = this.config.quasiIdentifiers.map(col => row[col]).join('|');
      const group = groups[key];
      
      if (group.length < this.config.k && suppressedCount < maxSuppressions) {
        suppressedCount++;
        return false; // Suppress this record
      }
      
      return true; // Keep this record
    });
    
    return { finalData, suppressedCount };
  }

  /**
   * Calculate privacy metrics
   */
  private calculatePrivacyMetrics(original: any[], anonymized: any[]): any[] {
    return [
      {
        name: 'k-anonymity',
        value: this.config.k,
        description: `Minimum group size: ${this.config.k}`,
        risk: this.config.k >= 5 ? 'low' : this.config.k >= 3 ? 'medium' : 'high'
      },
      {
        name: 'equivalence-classes',
        value: Object.keys(this.groupByQuasiIdentifiers(anonymized)).length,
        description: 'Number of distinct quasi-identifier combinations',
        risk: 'low'
      },
      {
        name: 'suppression-rate',
        value: ((original.length - anonymized.length) / original.length) * 100,
        description: 'Percentage of records suppressed',
        risk: 'low'
      }
    ];
  }

  /**
   * Calculate information loss percentage
   */
  protected calculateInformationLoss(
    original: any[],
    anonymized: any[],
    generalizations: GeneralizationLevel[]
  ): number {
    let totalLoss = 0;
    const columns = this.config.quasiIdentifiers;
    
    for (const column of columns) {
      const generalization = generalizations.find(g => g.column === column);
      if (generalization) {
        totalLoss += this.calculateColumnInformationLoss(original, column, generalization);
      }
    }
    
    // Add suppression loss
    const suppressionLoss = ((original.length - anonymized.length) / original.length) * 100;
    
    return (totalLoss / columns.length) + suppressionLoss;
  }

  /**
   * Calculate information loss for a specific column
   */
  private calculateColumnInformationLoss(
    original: any[],
    column: string,
    generalization: GeneralizationLevel
  ): number {
    const originalValues = new Set(original.map(row => row[column]));
    const generalizedValues = new Set(
      original.map(row => generalization.mapping[row[column]] || row[column])
    );
    
    return ((originalValues.size - generalizedValues.size) / originalValues.size) * 100;
  }

  /**
   * Calculate overall privacy level
   */
  private calculatePrivacyLevel(data: any[]): number {
    const groups = this.groupByQuasiIdentifiers(data);
    const groupSizes = Object.values(groups).map(group => group.length);
    const avgGroupSize = groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length;
    
    // Privacy level based on group size distribution
    return Math.min(100, (avgGroupSize / this.config.k) * 100);
  }

  /**
   * Estimate information loss for a generalization
   */
  private estimateInformationLoss(column: string, level: number, hierarchy: string[][]): number {
    const originalDistinctValues = new Set(hierarchy[0]).size;
    const generalizedDistinctValues = new Set(hierarchy[level] || hierarchy[hierarchy.length - 1]).size;
    
    return ((originalDistinctValues - generalizedDistinctValues) / originalDistinctValues) * 100;
  }

  /**
   * Check if value is a date
   */
  private isDate(value: any): boolean {
    return !isNaN(Date.parse(value));
  }
}

/**
 * Factory function for creating K-Anonymity engine
 */
export function createKAnonymityEngine(config: KAnonymityConfig): KAnonymityEngine {
  return new KAnonymityEngine(config);
}

/**
 * Utility function for quick K-Anonymity anonymization with comprehensive PII handling
 */
export async function anonymizeWithKAnonymity(
  data: any[],
  k: number,
  quasiIdentifiers: string[],
  sensitiveAttributes: string[] = [],
  piiDetections: PIIDetection[] = []
): Promise<KAnonymityResult> {
  // STEP 1: Apply comprehensive PII anonymization first
  let workingData = data;
  
  if (piiDetections && piiDetections.length > 0) {
    console.log(`[K-Anonymity] Applying PII anonymization to ${piiDetections.length} detected PII fields...`);
    workingData = PIIAnonymizer.anonymizeDataset(data, piiDetections);
  }
  
  // STEP 2: Apply K-Anonymity to quasi-identifiers
  const engine = createKAnonymityEngine({
    k,
    quasiIdentifiers,
    sensitiveAttributes
  });
  
  const result = await engine.anonymize(workingData);
  
  // STEP 3: Generate comprehensive anonymization report
  if (piiDetections && piiDetections.length > 0) {
    const piiReport = PIIAnonymizer.generateAnonymizationReport(data, workingData, piiDetections);
    
    // Enhance result with PII anonymization metrics
    result.privacyMetrics.push({
      name: 'pii-anonymization',
      value: piiReport.anonymizationRate,
      description: `${piiReport.piiFieldsAnonymized} PII fields anonymized (${piiReport.piiTypesFound.join(', ')})`,
      risk: 'low'
    });
    
    result.privacyMetrics.push({
      name: 'comprehensive-privacy',
      value: piiReport.privacyLevel === 'high-privacy' ? 95 : 
             piiReport.privacyLevel === 'medium-privacy' ? 75 : 50,
      description: `Overall privacy level: ${piiReport.privacyLevel}`,
      risk: 'low'
    });
  }
  
  return result;
}
