/**
 * L-Diversity Algorithm Implementation
 * 
 * Academic Reference: Machanavajjhala, A., Kifer, D., Gehrke, J., & Venkitasubramaniam, M. (2007).
 * l-diversity: Privacy beyond k-anonymity. ACM Transactions on Knowledge Discovery from Data, 1(1), 3-es.
 * 
 * Implementation follows TUNi specification - Sprint 3 Tasks
 * Priority: Must-Have
 * 
 * L-Diversity ensures that each equivalence class has at least L distinct values
 * for sensitive attributes, preventing attribute disclosure attacks.
 */

import { AnonymizationConfig } from '../types.js';
import { KAnonymityEngine, KAnonymityConfig, GeneralizationLevel } from './k-anonymity.js';

export interface LDiversityConfig extends KAnonymityConfig {
  l: number; // Minimum diversity requirement
  diversityType: 'distinct' | 'entropy' | 'recursive'; // Type of l-diversity
  entropyThreshold?: number; // For entropy l-diversity (default: log(l))
  cValue?: number; // For recursive (c,l)-diversity
}

export interface LDiversityResult {
  data: any[];
  algorithm: string;
  parameters: LDiversityConfig;
  k: number;
  l: number;
  diversityType: string;
  generalizationLevels: GeneralizationLevel[];
  suppressedRecords: number;
  informationLoss: number;
  privacyMetrics: any[];
  sensitiveAttributeAnalysis: SensitiveAttributeAnalysis[];
  qualityMetrics: {
    dataUtility: number;
    privacyLevel: number;
    processingTime: number;
  };
}

export interface SensitiveAttributeAnalysis {
  attribute: string;
  equivalenceClasses: number;
  minDiversity: number;
  maxDiversity: number;
  avgDiversity: number;
  diversityDistribution: Record<string, number>;
}

export interface EquivalenceClass {
  quasiIdentifierValues: Record<string, any>;
  records: any[];
  sensitiveValues: Record<string, any[]>;
  diversity: Record<string, number>;
}

/**
 * L-Diversity Engine
 * Implements distinct, entropy, and recursive l-diversity
 */
export class LDiversityEngine extends KAnonymityEngine {
  private lConfig: LDiversityConfig;

  constructor(config: LDiversityConfig) {
    super(config);
    this.lConfig = {
      ...config,
      diversityType: config.diversityType || 'distinct',
      entropyThreshold: config.entropyThreshold || Math.log(config.l),
      cValue: config.cValue || 2
    };
  }

  /**
   * Main L-Diversity anonymization method
   */
  async anonymize(data: any[]): Promise<LDiversityResult> {
    console.log(`🔧 Starting L-Diversity anonymization with k=${this.lConfig.k}, l=${this.lConfig.l}`);
    
    // Step 1: Validate L-Diversity specific requirements
    this.validateLDiversityInput(data);
    
    // Step 2: Start with K-Anonymity
    let anonymizedData = [...data];
    let generalizationLevels: GeneralizationLevel[] = [];
    let iteration = 0;
    const maxIterations = 15; // More iterations needed for L-Diversity
    
    // Step 3: Apply generalization until both K-Anonymity and L-Diversity are satisfied
    while (!this.satisfiesLDiversity(anonymizedData) && iteration < maxIterations) {
      iteration++;
      console.log(`📊 L-Diversity iteration ${iteration}`);
      
      // Find violations (both k-anonymity and l-diversity)
      const violations = this.findLDiversityViolations(anonymizedData);
      
      if (violations.length === 0) break;
      
      // Select best generalization strategy
      const generalization = this.selectLDiversityGeneralization(violations, data);
      anonymizedData = this.applyGeneralization(anonymizedData, generalization);
      generalizationLevels.push(generalization);
      
      console.log(`✅ Applied L-Diversity generalization: ${generalization.column} level ${generalization.level}`);
    }
    
    // Step 4: Apply suppression for remaining violations
    const { finalData, suppressedCount } = this.applyLDiversitySuppression(anonymizedData);
    
    // Step 5: Calculate L-Diversity specific metrics
    const metrics = this.calculateLDiversityMetrics(data, finalData);
    const sensitiveAnalysis = this.analyzeSensitiveAttributes(finalData);
    const informationLoss = this.calculateInformationLoss(data, finalData, generalizationLevels);
    
    console.log(`🎯 L-Diversity complete: k=${this.lConfig.k}, l=${this.lConfig.l}, suppressed=${suppressedCount}`);
    
    return {
      data: finalData,
      algorithm: 'l-diversity',
      parameters: this.lConfig,
      k: this.lConfig.k,
      l: this.lConfig.l,
      diversityType: this.lConfig.diversityType,
      generalizationLevels,
      suppressedRecords: suppressedCount,
      informationLoss,
      privacyMetrics: metrics,
      sensitiveAttributeAnalysis: sensitiveAnalysis,
      qualityMetrics: {
        dataUtility: 100 - informationLoss,
        privacyLevel: this.calculateLDiversityPrivacyLevel(finalData),
        processingTime: Date.now()
      }
    };
  }

  /**
   * Validate L-Diversity specific requirements
   */
  private validateLDiversityInput(data: any[]): void {
    // First validate K-Anonymity requirements
    super['validateInput'](data);
    
    if (this.lConfig.l < 2) {
      throw new Error('L value must be at least 2');
    }
    
    if (this.lConfig.sensitiveAttributes.length === 0) {
      throw new Error('L-Diversity requires at least one sensitive attribute');
    }
    
    // Check if sensitive attributes exist
    const columns = Object.keys(data[0]);
    for (const sensitiveAttr of this.lConfig.sensitiveAttributes) {
      if (!columns.includes(sensitiveAttr)) {
        throw new Error(`Sensitive attribute '${sensitiveAttr}' not found in data`);
      }
    }
    
    // Check if there are enough distinct values in sensitive attributes
    for (const sensitiveAttr of this.lConfig.sensitiveAttributes) {
      const distinctValues = new Set(data.map(row => row[sensitiveAttr])).size;
      if (distinctValues < this.lConfig.l) {
        console.warn(`⚠️ Sensitive attribute '${sensitiveAttr}' has only ${distinctValues} distinct values, but l=${this.lConfig.l}`);
      }
    }
  }

  /**
   * Check if dataset satisfies L-Diversity
   */
  private satisfiesLDiversity(data: any[]): boolean {
    // First check K-Anonymity
    if (!super['isKAnonymous'](data)) {
      return false;
    }
    
    // Then check L-Diversity
    const equivalenceClasses = this.getEquivalenceClasses(data);
    
    return equivalenceClasses.every(eqClass => 
      this.lConfig.sensitiveAttributes.every(sensitiveAttr => 
        this.checkLDiversityForAttribute(eqClass, sensitiveAttr)
      )
    );
  }

  /**
   * Find equivalence classes that violate L-Diversity
   */
  private findLDiversityViolations(data: any[]): EquivalenceClass[] {
    const equivalenceClasses = this.getEquivalenceClasses(data);
    
    return equivalenceClasses.filter(eqClass => {
      // Check K-Anonymity violation
      if (eqClass.records.length < this.lConfig.k) {
        return true;
      }
      
      // Check L-Diversity violation
      return this.lConfig.sensitiveAttributes.some(sensitiveAttr => 
        !this.checkLDiversityForAttribute(eqClass, sensitiveAttr)
      );
    });
  }

  /**
   * Get equivalence classes with sensitive attribute analysis
   */
  private getEquivalenceClasses(data: any[]): EquivalenceClass[] {
    const groups = super['groupByQuasiIdentifiers'](data);
    
    return Object.entries(groups).map(([key, records]) => {
      const quasiIdentifierValues: Record<string, any> = {};
      const sensitiveValues: Record<string, any[]> = {};
      const diversity: Record<string, number> = {};
      
      // Extract quasi-identifier values
      if (records.length > 0) {
        for (const qi of this.lConfig.quasiIdentifiers) {
          quasiIdentifierValues[qi] = records[0][qi];
        }
      }
      
      // Extract sensitive attribute values and calculate diversity
      for (const sensitiveAttr of this.lConfig.sensitiveAttributes) {
        const values = records.map(record => record[sensitiveAttr]);
        sensitiveValues[sensitiveAttr] = values;
        diversity[sensitiveAttr] = this.calculateDiversity(values, this.lConfig.diversityType);
      }
      
      return {
        quasiIdentifierValues,
        records,
        sensitiveValues,
        diversity
      };
    });
  }

  /**
   * Check L-Diversity for a specific attribute in an equivalence class
   */
  private checkLDiversityForAttribute(eqClass: EquivalenceClass, sensitiveAttr: string): boolean {
    const diversity = eqClass.diversity[sensitiveAttr];
    
    switch (this.lConfig.diversityType) {
      case 'distinct':
        return diversity >= this.lConfig.l;
      
      case 'entropy':
        return diversity >= (this.lConfig.entropyThreshold || Math.log(this.lConfig.l));
      
      case 'recursive':
        return this.checkRecursiveLDiversity(eqClass.sensitiveValues[sensitiveAttr]);
      
      default:
        return diversity >= this.lConfig.l;
    }
  }

  /**
   * Calculate diversity based on the specified type
   */
  private calculateDiversity(values: any[], diversityType: string): number {
    const valueCounts = this.getValueCounts(values);
    const distinctValues = Object.keys(valueCounts).length;
    
    switch (diversityType) {
      case 'distinct':
        return distinctValues;
      
      case 'entropy':
        return this.calculateEntropy(valueCounts, values.length);
      
      case 'recursive':
        return this.calculateRecursiveDiversity(valueCounts, values.length);
      
      default:
        return distinctValues;
    }
  }

  /**
   * Calculate entropy for entropy l-diversity
   */
  private calculateEntropy(valueCounts: Record<string, number>, totalCount: number): number {
    let entropy = 0;
    
    for (const count of Object.values(valueCounts)) {
      const probability = count / totalCount;
      if (probability > 0) {
        entropy -= probability * Math.log(probability);
      }
    }
    
    return entropy;
  }

  /**
   * Calculate recursive diversity for recursive (c,l)-diversity
   */
  private calculateRecursiveDiversity(valueCounts: Record<string, number>, totalCount: number): number {
    const sortedCounts = Object.values(valueCounts).sort((a, b) => b - a);
    const c = this.lConfig.cValue || 2;
    
    // Recursive (c,l)-diversity: r1 < c * (rl + rl+1 + ... + rm)
    const mostFrequent = sortedCounts[0];
    const sumOfRest = sortedCounts.slice(1).reduce((sum, count) => sum + count, 0);
    
    if (sumOfRest === 0) {
      return mostFrequent === totalCount ? 1 : 0;
    }
    
    return mostFrequent < c * sumOfRest ? sortedCounts.length : 1;
  }

  /**
   * Check recursive (c,l)-diversity condition
   */
  private checkRecursiveLDiversity(values: any[]): boolean {
    const valueCounts = this.getValueCounts(values);
    const distinctValues = Object.keys(valueCounts).length;
    
    if (distinctValues < this.lConfig.l) {
      return false;
    }
    
    const sortedCounts = Object.values(valueCounts).sort((a, b) => b - a);
    const c = this.lConfig.cValue || 2;
    const mostFrequent = sortedCounts[0];
    const sumOfRest = sortedCounts.slice(1).reduce((sum, count) => sum + count, 0);
    
    return sumOfRest > 0 && mostFrequent < c * sumOfRest;
  }

  /**
   * Get value counts for an array
   */
  private getValueCounts(values: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const value of values) {
      const key = String(value);
      counts[key] = (counts[key] || 0) + 1;
    }
    
    return counts;
  }

  /**
   * Select best generalization for L-Diversity
   */
  private selectLDiversityGeneralization(
    violations: EquivalenceClass[],
    originalData: any[]
  ): GeneralizationLevel {
    // Prioritize generalizations that improve both k-anonymity and l-diversity
    let bestColumn = this.lConfig.quasiIdentifiers[0];
    let bestScore = -Infinity;
    
    for (const column of this.lConfig.quasiIdentifiers) {
      const score = this.evaluateGeneralizationScore(column, violations, originalData);
      
      if (score > bestScore) {
        bestScore = score;
        bestColumn = column;
      }
    }
    
    // Create generalization mapping
    const hierarchies = super['initializeHierarchies'](originalData);
    const hierarchy = hierarchies[bestColumn];
    
    return {
      column: bestColumn,
      level: 1, // Simplified level increment
      mapping: super['createGeneralizationMapping'](bestColumn, hierarchy, 1)
    };
  }

  /**
   * Evaluate generalization score for L-Diversity
   */
  private evaluateGeneralizationScore(
    column: string,
    violations: EquivalenceClass[],
    originalData: any[]
  ): number {
    // Score based on:
    // 1. How many violations this generalization might resolve
    // 2. Information loss impact
    // 3. Effect on sensitive attribute diversity
    
    let violationImpact = 0;
    let diversityImpact = 0;
    
    for (const violation of violations) {
      // Count records that would be affected
      violationImpact += violation.records.length;
      
      // Estimate diversity improvement
      for (const sensitiveAttr of this.lConfig.sensitiveAttributes) {
        const currentDiversity = violation.diversity[sensitiveAttr];
        if (currentDiversity < this.lConfig.l) {
          diversityImpact += (this.lConfig.l - currentDiversity);
        }
      }
    }
    
    // Estimate information loss (simplified)
    const informationLoss = this.estimateColumnInformationLoss(originalData, column);
    
    // Combined score (higher is better)
    return (violationImpact + diversityImpact) / (1 + informationLoss);
  }

  /**
   * Estimate information loss for a column
   */
  private estimateColumnInformationLoss(data: any[], column: string): number {
    const distinctValues = new Set(data.map(row => row[column])).size;
    // Simplified: assume 50% reduction in distinct values per generalization level
    return distinctValues * 0.5;
  }

  /**
   * Apply L-Diversity specific suppression
   */
  private applyLDiversitySuppression(data: any[]): { finalData: any[], suppressedCount: number } {
    const violations = this.findLDiversityViolations(data);
    let suppressedCount = 0;
    const maxSuppressions = Math.floor(data.length * (this.lConfig.suppressionThreshold || 0.05));
    
    // Suppress records from violating equivalence classes
    const recordsToSuppress = new Set<any>();
    
    for (const violation of violations) {
      if (suppressedCount >= maxSuppressions) break;
      
      // Suppress entire equivalence class if it violates L-Diversity
      for (const record of violation.records) {
        if (suppressedCount < maxSuppressions) {
          recordsToSuppress.add(record);
          suppressedCount++;
        }
      }
    }
    
    const finalData = data.filter(record => !recordsToSuppress.has(record));
    
    return { finalData, suppressedCount };
  }

  /**
   * Calculate L-Diversity specific privacy metrics
   */
  private calculateLDiversityMetrics(original: any[], anonymized: any[]): any[] {
    const baseMetrics = super['calculatePrivacyMetrics'](original, anonymized);
    const equivalenceClasses = this.getEquivalenceClasses(anonymized);
    
    // Calculate average diversity for each sensitive attribute
    const diversityMetrics = this.lConfig.sensitiveAttributes.map(sensitiveAttr => {
      const diversities = equivalenceClasses.map(eqClass => eqClass.diversity[sensitiveAttr]);
      const avgDiversity = diversities.reduce((sum, div) => sum + div, 0) / diversities.length;
      const minDiversity = Math.min(...diversities);
      
      return {
        name: `${sensitiveAttr}-diversity`,
        value: avgDiversity,
        description: `Average diversity for ${sensitiveAttr} (min: ${minDiversity}, target: ${this.lConfig.l})`,
        risk: minDiversity >= this.lConfig.l ? 'low' : 'high'
      };
    });
    
    return [
      ...baseMetrics,
      {
        name: 'l-diversity',
        value: this.lConfig.l,
        description: `Required diversity level: ${this.lConfig.l} (${this.lConfig.diversityType})`,
        risk: 'low'
      },
      ...diversityMetrics
    ];
  }

  /**
   * Analyze sensitive attributes in the anonymized data
   */
  private analyzeSensitiveAttributes(data: any[]): SensitiveAttributeAnalysis[] {
    const equivalenceClasses = this.getEquivalenceClasses(data);
    
    return this.lConfig.sensitiveAttributes.map(attribute => {
      const diversities = equivalenceClasses.map(eqClass => eqClass.diversity[attribute]);
      const diversityDistribution: Record<string, number> = {};
      
      // Count diversity levels
      for (const diversity of diversities) {
        const key = Math.floor(diversity).toString();
        diversityDistribution[key] = (diversityDistribution[key] || 0) + 1;
      }
      
      return {
        attribute,
        equivalenceClasses: equivalenceClasses.length,
        minDiversity: Math.min(...diversities),
        maxDiversity: Math.max(...diversities),
        avgDiversity: diversities.reduce((sum, div) => sum + div, 0) / diversities.length,
        diversityDistribution
      };
    });
  }

  /**
   * Calculate L-Diversity specific privacy level
   */
  private calculateLDiversityPrivacyLevel(data: any[]): number {
    const equivalenceClasses = this.getEquivalenceClasses(data);
    
    // Privacy level based on both k-anonymity and l-diversity satisfaction
    const kAnonymitySatisfied = equivalenceClasses.every(eqClass => 
      eqClass.records.length >= this.lConfig.k
    );
    
    const lDiversitySatisfied = equivalenceClasses.every(eqClass =>
      this.lConfig.sensitiveAttributes.every(sensitiveAttr =>
        this.checkLDiversityForAttribute(eqClass, sensitiveAttr)
      )
    );
    
    let privacyLevel = 0;
    
    if (kAnonymitySatisfied) privacyLevel += 50;
    if (lDiversitySatisfied) privacyLevel += 50;
    
    return privacyLevel;
  }
}

/**
 * Factory function for creating L-Diversity engine
 */
export function createLDiversityEngine(config: LDiversityConfig): LDiversityEngine {
  return new LDiversityEngine(config);
}

/**
 * Utility function for quick L-Diversity anonymization
 */
export async function anonymizeWithLDiversity(
  data: any[],
  k: number,
  l: number,
  quasiIdentifiers: string[],
  sensitiveAttributes: string[],
  diversityType: 'distinct' | 'entropy' | 'recursive' = 'distinct'
): Promise<LDiversityResult> {
  const engine = createLDiversityEngine({
    k,
    l,
    quasiIdentifiers,
    sensitiveAttributes,
    diversityType
  });
  
  return engine.anonymize(data);
}
