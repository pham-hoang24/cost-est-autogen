/**
 * T-Closeness Algorithm Implementation
 * 
 * Academic Reference: Li, N., Li, T., & Venkatasubramanian, S. (2007).
 * t-closeness: Privacy beyond k-anonymity and l-diversity. 
 * In IEEE 23rd International Conference on Data Engineering (pp. 106-115).
 * 
 * Implementation follows TUNi specification - Sprint 3 Tasks
 * Priority: Must-Have
 * 
 * T-Closeness ensures that the distribution of sensitive attributes in each
 * equivalence class is close to the distribution in the overall table.
 */

import { AnonymizationConfig } from '../types.js';
import { LDiversityEngine, LDiversityConfig, EquivalenceClass } from './l-diversity.js';

export interface TClosenessConfig extends LDiversityConfig {
  t: number; // Maximum distance threshold (0 < t <= 1)
  distanceMetric: 'earth-movers' | 'equal-distance' | 'hierarchical'; // Distance calculation method
  hierarchyWeights?: Record<string, Record<string, number>>; // For hierarchical distance
  significanceLevel?: number; // Statistical significance (default: 0.05)
}

export interface TClosenessResult {
  data: any[];
  algorithm: string;
  parameters: TClosenessConfig;
  k: number;
  l: number;
  t: number;
  diversityType: string;
  distanceMetric: string;
  generalizationLevels: any[];
  suppressedRecords: number;
  informationLoss: number;
  privacyMetrics: any[];
  sensitiveAttributeAnalysis: SensitiveAttributeAnalysis[];
  distributionAnalysis: DistributionAnalysis[];
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
  maxDistanceFromOverall: number;
  avgDistanceFromOverall: number;
}

export interface DistributionAnalysis {
  attribute: string;
  overallDistribution: Record<string, number>;
  equivalenceClassDistances: EquivalenceClassDistance[];
  maxDistance: number;
  avgDistance: number;
  violatingClasses: number;
}

export interface EquivalenceClassDistance {
  equivalenceClassId: string;
  distribution: Record<string, number>;
  distanceFromOverall: number;
  satisfiesTCloseness: boolean;
}

/**
 * T-Closeness Engine
 * Implements Earth Mover's Distance and other distribution distance metrics
 */
export class TClosenessEngine extends LDiversityEngine {
  private tConfig: TClosenessConfig;

  constructor(config: TClosenessConfig) {
    super(config);
    this.tConfig = {
      ...config,
      distanceMetric: config.distanceMetric || 'earth-movers',
      significanceLevel: config.significanceLevel || 0.05
    };
  }

  /**
   * Main T-Closeness anonymization method
   */
  async anonymize(data: any[]): Promise<TClosenessResult> {
    console.log(`🔧 Starting T-Closeness anonymization with k=${this.tConfig.k}, l=${this.tConfig.l}, t=${this.tConfig.t}`);
    
    // Step 1: Validate T-Closeness specific requirements
    this.validateTClosenessInput(data);
    
    // Step 2: Calculate overall distributions for sensitive attributes
    const overallDistributions = this.calculateOverallDistributions(data);
    
    // Step 3: Start with L-Diversity anonymization
    let anonymizedData = [...data];
    let generalizationLevels: any[] = [];
    let iteration = 0;
    const maxIterations = 20; // More iterations needed for T-Closeness
    
    // Step 4: Apply generalization until K-Anonymity, L-Diversity, and T-Closeness are satisfied
    while (!this.satisfiesTCloseness(anonymizedData, overallDistributions) && iteration < maxIterations) {
      iteration++;
      console.log(`📊 T-Closeness iteration ${iteration}`);
      
      // Find violations (k-anonymity, l-diversity, and t-closeness)
      const violations = this.findTClosenessViolations(anonymizedData, overallDistributions);
      
      if (violations.length === 0) break;
      
      // Select best generalization strategy for T-Closeness
      const generalization = this.selectTClosenessGeneralization(violations, data, overallDistributions);
      anonymizedData = this.applyGeneralization(anonymizedData, generalization);
      generalizationLevels.push(generalization);
      
      console.log(`✅ Applied T-Closeness generalization: ${generalization.column} level ${generalization.level}`);
    }
    
    // Step 5: Apply suppression for remaining violations
    const { finalData, suppressedCount } = this.applyTClosenessSuppression(anonymizedData, overallDistributions);
    
    // Step 6: Calculate T-Closeness specific metrics
    const metrics = this.calculateTClosenessMetrics(data, finalData, overallDistributions);
    const sensitiveAnalysis = this.analyzeSensitiveAttributesWithDistance(finalData, overallDistributions);
    const distributionAnalysis = this.analyzeDistributions(finalData, overallDistributions);
    const informationLoss = this.calculateInformationLoss(data, finalData, generalizationLevels);
    
    console.log(`🎯 T-Closeness complete: k=${this.tConfig.k}, l=${this.tConfig.l}, t=${this.tConfig.t}, suppressed=${suppressedCount}`);
    
    return {
      data: finalData,
      algorithm: 't-closeness',
      parameters: this.tConfig,
      k: this.tConfig.k,
      l: this.tConfig.l,
      t: this.tConfig.t,
      diversityType: this.tConfig.diversityType || 'distinct',
      distanceMetric: this.tConfig.distanceMetric,
      generalizationLevels,
      suppressedRecords: suppressedCount,
      informationLoss,
      privacyMetrics: metrics,
      sensitiveAttributeAnalysis: sensitiveAnalysis,
      distributionAnalysis,
      qualityMetrics: {
        dataUtility: 100 - informationLoss,
        privacyLevel: this.calculateTClosenessPrivacyLevel(finalData, overallDistributions),
        processingTime: Date.now()
      }
    };
  }

  /**
   * Validate T-Closeness specific requirements
   */
  private validateTClosenessInput(data: any[]): void {
    // First validate L-Diversity requirements
    super['validateLDiversityInput'](data);
    
    if (this.tConfig.t <= 0 || this.tConfig.t > 1) {
      throw new Error('T value must be between 0 and 1 (exclusive of 0, inclusive of 1)');
    }
    
    // Validate that sensitive attributes have sufficient distribution
    for (const sensitiveAttr of this.tConfig.sensitiveAttributes) {
      const values = data.map(row => row[sensitiveAttr]);
      const distribution = this.calculateDistribution(values);
      const distinctValues = Object.keys(distribution).length;
      
      if (distinctValues < 2) {
        throw new Error(`Sensitive attribute '${sensitiveAttr}' must have at least 2 distinct values for T-Closeness`);
      }
    }
  }

  /**
   * Calculate overall distributions for all sensitive attributes
   */
  private calculateOverallDistributions(data: any[]): Record<string, Record<string, number>> {
    const distributions: Record<string, Record<string, number>> = {};
    
    for (const sensitiveAttr of this.tConfig.sensitiveAttributes) {
      const values = data.map(row => row[sensitiveAttr]);
      distributions[sensitiveAttr] = this.calculateDistribution(values);
    }
    
    return distributions;
  }

  /**
   * Calculate probability distribution for a set of values
   */
  private calculateDistribution(values: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    const total = values.length;
    
    for (const value of values) {
      const key = String(value);
      counts[key] = (counts[key] || 0) + 1;
    }
    
    // Convert counts to probabilities
    const distribution: Record<string, number> = {};
    for (const [key, count] of Object.entries(counts)) {
      distribution[key] = count / total;
    }
    
    return distribution;
  }

  /**
   * Check if dataset satisfies T-Closeness
   */
  private satisfiesTCloseness(
    data: any[],
    overallDistributions: Record<string, Record<string, number>>
  ): boolean {
    // First check L-Diversity
    if (!super['satisfiesLDiversity'](data)) {
      return false;
    }
    
    // Then check T-Closeness
    const equivalenceClasses = super['getEquivalenceClasses'](data);
    
    return equivalenceClasses.every(eqClass =>
      this.tConfig.sensitiveAttributes.every(sensitiveAttr =>
        this.checkTClosenessForAttribute(eqClass, sensitiveAttr, overallDistributions[sensitiveAttr])
      )
    );
  }

  /**
   * Find equivalence classes that violate T-Closeness
   */
  private findTClosenessViolations(
    data: any[],
    overallDistributions: Record<string, Record<string, number>>
  ): EquivalenceClass[] {
    const equivalenceClasses = super['getEquivalenceClasses'](data);
    
    return equivalenceClasses.filter(eqClass => {
      // Check L-Diversity violations first
      if (eqClass.records.length < this.tConfig.k) {
        return true;
      }
      
      const lDiversityViolation = this.tConfig.sensitiveAttributes.some(sensitiveAttr =>
        !super['checkLDiversityForAttribute'](eqClass, sensitiveAttr)
      );
      
      if (lDiversityViolation) {
        return true;
      }
      
      // Check T-Closeness violations
      return this.tConfig.sensitiveAttributes.some(sensitiveAttr =>
        !this.checkTClosenessForAttribute(eqClass, sensitiveAttr, overallDistributions[sensitiveAttr])
      );
    });
  }

  /**
   * Check T-Closeness for a specific attribute in an equivalence class
   */
  private checkTClosenessForAttribute(
    eqClass: EquivalenceClass,
    sensitiveAttr: string,
    overallDistribution: Record<string, number>
  ): boolean {
    const classValues = eqClass.sensitiveValues[sensitiveAttr];
    const classDistribution = this.calculateDistribution(classValues);
    
    const distance = this.calculateDistributionDistance(
      classDistribution,
      overallDistribution,
      this.tConfig.distanceMetric
    );
    
    return distance <= this.tConfig.t;
  }

  /**
   * Calculate distance between two distributions
   */
  private calculateDistributionDistance(
    distribution1: Record<string, number>,
    distribution2: Record<string, number>,
    metric: string
  ): number {
    switch (metric) {
      case 'earth-movers':
        return this.calculateEarthMoversDistance(distribution1, distribution2);
      
      case 'equal-distance':
        return this.calculateEqualDistance(distribution1, distribution2);
      
      case 'hierarchical':
        return this.calculateHierarchicalDistance(distribution1, distribution2);
      
      default:
        return this.calculateEarthMoversDistance(distribution1, distribution2);
    }
  }

  /**
   * Calculate Earth Mover's Distance (Wasserstein distance)
   */
  private calculateEarthMoversDistance(
    distribution1: Record<string, number>,
    distribution2: Record<string, number>
  ): number {
    // Get all unique values
    const allValues = new Set([
      ...Object.keys(distribution1),
      ...Object.keys(distribution2)
    ]);
    
    const sortedValues = Array.from(allValues).sort();
    
    // For categorical data, we use the simplified EMD calculation
    // In practice, you would need ordering information for true EMD
    let totalDistance = 0;
    let cumulativeDifference = 0;
    
    for (const value of sortedValues) {
      const prob1 = distribution1[value] || 0;
      const prob2 = distribution2[value] || 0;
      
      cumulativeDifference += (prob1 - prob2);
      totalDistance += Math.abs(cumulativeDifference);
    }
    
    return totalDistance;
  }

  /**
   * Calculate Equal Distance metric
   */
  private calculateEqualDistance(
    distribution1: Record<string, number>,
    distribution2: Record<string, number>
  ): number {
    const allValues = new Set([
      ...Object.keys(distribution1),
      ...Object.keys(distribution2)
    ]);
    
    let maxDifference = 0;
    
    for (const value of allValues) {
      const prob1 = distribution1[value] || 0;
      const prob2 = distribution2[value] || 0;
      const difference = Math.abs(prob1 - prob2);
      
      if (difference > maxDifference) {
        maxDifference = difference;
      }
    }
    
    return maxDifference;
  }

  /**
   * Calculate Hierarchical Distance using domain hierarchy
   */
  private calculateHierarchicalDistance(
    distribution1: Record<string, number>,
    distribution2: Record<string, number>
  ): number {
    // Simplified hierarchical distance - in practice, this would use domain-specific hierarchies
    const allValues = new Set([
      ...Object.keys(distribution1),
      ...Object.keys(distribution2)
    ]);
    
    let weightedDistance = 0;
    
    for (const value of allValues) {
      const prob1 = distribution1[value] || 0;
      const prob2 = distribution2[value] || 0;
      const weight = this.getHierarchicalWeight(value);
      
      weightedDistance += weight * Math.abs(prob1 - prob2);
    }
    
    return weightedDistance;
  }

  /**
   * Get hierarchical weight for a value
   */
  private getHierarchicalWeight(value: string): number {
    // Simplified weighting - in practice, this would use domain knowledge
    // More sensitive values get higher weights
    const sensitiveKeywords = ['cancer', 'hiv', 'mental', 'psychiatric', 'alcohol', 'drug'];
    const lowerValue = value.toLowerCase();
    
    for (const keyword of sensitiveKeywords) {
      if (lowerValue.includes(keyword)) {
        return 2.0; // Higher weight for sensitive values
      }
    }
    
    return 1.0; // Default weight
  }

  /**
   * Select best generalization for T-Closeness
   */
  private selectTClosenessGeneralization(
    violations: EquivalenceClass[],
    originalData: any[],
    overallDistributions: Record<string, Record<string, number>>
  ): any {
    let bestColumn = this.tConfig.quasiIdentifiers[0];
    let bestScore = -Infinity;
    
    for (const column of this.tConfig.quasiIdentifiers) {
      const score = this.evaluateTClosenessGeneralizationScore(
        column,
        violations,
        originalData,
        overallDistributions
      );
      
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
      level: 1,
      mapping: super['createGeneralizationMapping'](bestColumn, hierarchy, 1)
    };
  }

  /**
   * Evaluate generalization score for T-Closeness
   */
  private evaluateTClosenessGeneralizationScore(
    column: string,
    violations: EquivalenceClass[],
    originalData: any[],
    overallDistributions: Record<string, Record<string, number>>
  ): number {
    let violationImpact = 0;
    let diversityImpact = 0;
    let distributionImpact = 0;
    
    for (const violation of violations) {
      violationImpact += violation.records.length;
      
      // L-Diversity impact
      for (const sensitiveAttr of this.tConfig.sensitiveAttributes) {
        const currentDiversity = violation.diversity[sensitiveAttr];
        if (currentDiversity < this.tConfig.l) {
          diversityImpact += (this.tConfig.l - currentDiversity);
        }
      }
      
      // T-Closeness impact
      for (const sensitiveAttr of this.tConfig.sensitiveAttributes) {
        const classValues = violation.sensitiveValues[sensitiveAttr];
        const classDistribution = this.calculateDistribution(classValues);
        const distance = this.calculateDistributionDistance(
          classDistribution,
          overallDistributions[sensitiveAttr],
          this.tConfig.distanceMetric
        );
        
        if (distance > this.tConfig.t) {
          distributionImpact += (distance - this.tConfig.t);
        }
      }
    }
    
    const informationLoss = super['estimateColumnInformationLoss'](originalData, column);
    
    return (violationImpact + diversityImpact + distributionImpact * 10) / (1 + informationLoss);
  }

  /**
   * Apply T-Closeness specific suppression
   */
  private applyTClosenessSuppression(
    data: any[],
    overallDistributions: Record<string, Record<string, number>>
  ): { finalData: any[], suppressedCount: number } {
    const violations = this.findTClosenessViolations(data, overallDistributions);
    let suppressedCount = 0;
    const maxSuppressions = Math.floor(data.length * (this.tConfig.suppressionThreshold || 0.05));
    
    const recordsToSuppress = new Set<any>();
    
    for (const violation of violations) {
      if (suppressedCount >= maxSuppressions) break;
      
      // Suppress entire equivalence class if it violates T-Closeness
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
   * Calculate T-Closeness specific privacy metrics
   */
  private calculateTClosenessMetrics(
    original: any[],
    anonymized: any[],
    overallDistributions: Record<string, Record<string, number>>
  ): any[] {
    const baseMetrics = super['calculateLDiversityMetrics'](original, anonymized);
    const equivalenceClasses = super['getEquivalenceClasses'](anonymized);
    
    // Calculate distribution distance metrics
    const distanceMetrics = this.tConfig.sensitiveAttributes.map(sensitiveAttr => {
      const distances = equivalenceClasses.map(eqClass => {
        const classValues = eqClass.sensitiveValues[sensitiveAttr];
        const classDistribution = this.calculateDistribution(classValues);
        return this.calculateDistributionDistance(
          classDistribution,
          overallDistributions[sensitiveAttr],
          this.tConfig.distanceMetric
        );
      });
      
      const maxDistance = Math.max(...distances);
      const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
      
      return {
        name: `${sensitiveAttr}-distribution-distance`,
        value: avgDistance,
        description: `Average distribution distance for ${sensitiveAttr} (max: ${maxDistance.toFixed(3)}, threshold: ${this.tConfig.t})`,
        risk: maxDistance <= this.tConfig.t ? 'low' : 'high'
      };
    });
    
    return [
      ...baseMetrics,
      {
        name: 't-closeness',
        value: this.tConfig.t,
        description: `Maximum allowed distribution distance: ${this.tConfig.t} (${this.tConfig.distanceMetric})`,
        risk: 'low'
      },
      ...distanceMetrics
    ];
  }

  /**
   * Analyze sensitive attributes with distribution distance
   */
  private analyzeSensitiveAttributesWithDistance(
    data: any[],
    overallDistributions: Record<string, Record<string, number>>
  ): SensitiveAttributeAnalysis[] {
    const baseAnalysis = super['analyzeSensitiveAttributes'](data);
    const equivalenceClasses = super['getEquivalenceClasses'](data);
    
    return baseAnalysis.map(analysis => {
      const distances = equivalenceClasses.map(eqClass => {
        const classValues = eqClass.sensitiveValues[analysis.attribute];
        const classDistribution = this.calculateDistribution(classValues);
        return this.calculateDistributionDistance(
          classDistribution,
          overallDistributions[analysis.attribute],
          this.tConfig.distanceMetric
        );
      });
      
      return {
        ...analysis,
        maxDistanceFromOverall: Math.max(...distances),
        avgDistanceFromOverall: distances.reduce((sum, dist) => sum + dist, 0) / distances.length
      };
    });
  }

  /**
   * Analyze distributions in detail
   */
  private analyzeDistributions(
    data: any[],
    overallDistributions: Record<string, Record<string, number>>
  ): DistributionAnalysis[] {
    const equivalenceClasses = super['getEquivalenceClasses'](data);
    
    return this.tConfig.sensitiveAttributes.map(attribute => {
      const equivalenceClassDistances: EquivalenceClassDistance[] = equivalenceClasses.map((eqClass, index) => {
        const classValues = eqClass.sensitiveValues[attribute];
        const distribution = this.calculateDistribution(classValues);
        const distance = this.calculateDistributionDistance(
          distribution,
          overallDistributions[attribute],
          this.tConfig.distanceMetric
        );
        
        return {
          equivalenceClassId: `eq_class_${index}`,
          distribution,
          distanceFromOverall: distance,
          satisfiesTCloseness: distance <= this.tConfig.t
        };
      });
      
      const distances = equivalenceClassDistances.map(ecd => ecd.distanceFromOverall);
      const violatingClasses = equivalenceClassDistances.filter(ecd => !ecd.satisfiesTCloseness).length;
      
      return {
        attribute,
        overallDistribution: overallDistributions[attribute],
        equivalenceClassDistances,
        maxDistance: Math.max(...distances),
        avgDistance: distances.reduce((sum, dist) => sum + dist, 0) / distances.length,
        violatingClasses
      };
    });
  }

  /**
   * Calculate T-Closeness specific privacy level
   */
  private calculateTClosenessPrivacyLevel(
    data: any[],
    overallDistributions: Record<string, Record<string, number>>
  ): number {
    const equivalenceClasses = super['getEquivalenceClasses'](data);
    
    // Privacy level based on k-anonymity, l-diversity, and t-closeness satisfaction
    const kAnonymitySatisfied = equivalenceClasses.every(eqClass =>
      eqClass.records.length >= this.tConfig.k
    );
    
    const lDiversitySatisfied = equivalenceClasses.every(eqClass =>
      this.tConfig.sensitiveAttributes.every(sensitiveAttr =>
        super['checkLDiversityForAttribute'](eqClass, sensitiveAttr)
      )
    );
    
    const tClosenessSatisfied = equivalenceClasses.every(eqClass =>
      this.tConfig.sensitiveAttributes.every(sensitiveAttr =>
        this.checkTClosenessForAttribute(eqClass, sensitiveAttr, overallDistributions[sensitiveAttr])
      )
    );
    
    let privacyLevel = 0;
    
    if (kAnonymitySatisfied) privacyLevel += 33;
    if (lDiversitySatisfied) privacyLevel += 33;
    if (tClosenessSatisfied) privacyLevel += 34;
    
    return privacyLevel;
  }
}

/**
 * Factory function for creating T-Closeness engine
 */
export function createTClosenessEngine(config: TClosenessConfig): TClosenessEngine {
  return new TClosenessEngine(config);
}

/**
 * Utility function for quick T-Closeness anonymization
 */
export async function anonymizeWithTCloseness(
  data: any[],
  k: number,
  l: number,
  t: number,
  quasiIdentifiers: string[],
  sensitiveAttributes: string[],
  distanceMetric: 'earth-movers' | 'equal-distance' | 'hierarchical' = 'earth-movers'
): Promise<TClosenessResult> {
  const engine = createTClosenessEngine({
    k,
    l,
    t,
    quasiIdentifiers,
    sensitiveAttributes,
    distanceMetric,
    diversityType: 'distinct'
  });
  
  return engine.anonymize(data);
}
