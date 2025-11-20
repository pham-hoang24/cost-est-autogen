'use client';

/**
 * Anonymization Preview Component
 * 
 * Shows before/after comparison of anonymized data
 * following TUNi specification - Sprint 3 Tasks
 * Priority: Must-Have
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Download, 
  RefreshCw,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Database,
  Lock,
  Unlock
} from 'lucide-react';

export interface DataSample {
  [key: string]: any;
}

export interface AnonymizationResult {
  original: DataSample[];
  anonymized: DataSample[];
  algorithm: string;
  parameters: any;
  metrics: {
    privacyLevel: number;
    dataUtility: number;
    informationLoss: number;
    processingTime: number;
    suppressedRecords: number;
    generalizationLevels: any[];
  };
  qualityAnalysis: {
    columnChanges: ColumnChange[];
    distributionChanges: DistributionChange[];
    privacyMetrics: PrivacyMetric[];
  };
}

export interface ColumnChange {
  column: string;
  type: 'quasi-identifier' | 'sensitive' | 'identifier' | 'unchanged';
  originalDistinctValues: number;
  anonymizedDistinctValues: number;
  informationLoss: number;
  generalizationLevel?: number;
  examples: {
    original: string[];
    anonymized: string[];
  };
}

export interface DistributionChange {
  column: string;
  originalDistribution: Record<string, number>;
  anonymizedDistribution: Record<string, number>;
  distributionDistance: number;
  preservationQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface PrivacyMetric {
  name: string;
  value: number;
  description: string;
  risk: 'low' | 'medium' | 'high';
  improvement?: number;
}

interface AnonymizationPreviewProps {
  result: AnonymizationResult | null;
  isLoading?: boolean;
  onDownload?: () => void;
  onApplyAnonymization?: () => void;
  onRefreshPreview?: () => void;
}

export default function AnonymizationPreview({
  result,
  isLoading = false,
  onDownload,
  onApplyAnonymization,
  onRefreshPreview
}: AnonymizationPreviewProps) {
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'preview' | 'metrics' | 'quality'>('preview');
  const [previewSize, setPreviewSize] = useState(10);

  const sampleData = useMemo(() => {
    if (!result) return { original: [], anonymized: [] };
    
    return {
      original: result.original.slice(0, previewSize),
      anonymized: result.anonymized.slice(0, previewSize)
    };
  }, [result, previewSize]);

  const maskSensitiveValue = (value: any, isSensitive: boolean): string => {
    if (!isSensitive || showSensitiveData) {
      return String(value);
    }
    return '***';
  };

  const getColumnType = (column: string): 'quasi-identifier' | 'sensitive' | 'identifier' | 'unchanged' => {
    if (!result) return 'unchanged';
    
    const change = result.qualityAnalysis.columnChanges.find(c => c.column === column);
    return change?.type || 'unchanged';
  };

  const getColumnTypeColor = (type: string) => {
    switch (type) {
      case 'quasi-identifier': return 'bg-blue-100 text-blue-700';
      case 'sensitive': return 'bg-red-100 text-red-700';
      case 'identifier': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-lg">Generating anonymization preview...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Preview Available</h3>
          <p className="text-gray-500">Configure anonymization parameters and click "Preview" to see the results.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Anonymization Preview</h2>
          <p className="text-gray-500">
            Algorithm: <Badge variant="outline">{result.algorithm}</Badge>
            {' • '}
            {result.anonymized.length} of {result.original.length} records
            {result.metrics.suppressedRecords > 0 && (
              <span className="text-red-600">
                {' • '}{result.metrics.suppressedRecords} suppressed
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center gap-2"
          >
            {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
          </Button>
          {onRefreshPreview && (
            <Button variant="outline" size="sm" onClick={onRefreshPreview}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setSelectedTab('preview')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            selectedTab === 'preview' 
              ? 'bg-white border-b-2 border-primary text-primary' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Data Preview
        </button>
        <button
          onClick={() => setSelectedTab('metrics')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            selectedTab === 'metrics' 
              ? 'bg-white border-b-2 border-primary text-primary' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Privacy Metrics
        </button>
        <button
          onClick={() => setSelectedTab('quality')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            selectedTab === 'quality' 
              ? 'bg-white border-b-2 border-primary text-primary' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Quality Analysis
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'preview' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {result.metrics.privacyLevel}%
                    </div>
                    <div className="text-sm text-gray-500">Privacy Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {result.metrics.dataUtility}%
                    </div>
                    <div className="text-sm text-gray-500">Data Utility</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {result.metrics.informationLoss}%
                    </div>
                    <div className="text-sm text-gray-500">Info Loss</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {result.metrics.processingTime}s
                    </div>
                    <div className="text-sm text-gray-500">Process Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Comparison Table */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-red-500" />
                  Original Data
                </CardTitle>
                <CardDescription>
                  Raw data before anonymization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {sampleData.original.length > 0 && Object.keys(sampleData.original[0]).map(column => (
                          <th key={column} className="text-left p-2">
                            <div className="space-y-1">
                              <div className="font-medium">{column}</div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getColumnTypeColor(getColumnType(column))}`}
                              >
                                {getColumnType(column)}
                              </Badge>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.original.map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.entries(row).map(([column, value]) => {
                            const isSensitive = getColumnType(column) === 'sensitive';
                            return (
                              <td key={column} className="p-2">
                                <span className={isSensitive && !showSensitiveData ? 'blur-sm' : ''}>
                                  {maskSensitiveValue(value, isSensitive)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Anonymized Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-500" />
                  Anonymized Data
                </CardTitle>
                <CardDescription>
                  Privacy-protected data after anonymization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {sampleData.anonymized.length > 0 && Object.keys(sampleData.anonymized[0]).map(column => (
                          <th key={column} className="text-left p-2">
                            <div className="space-y-1">
                              <div className="font-medium">{column}</div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getColumnTypeColor(getColumnType(column))}`}
                              >
                                {getColumnType(column)}
                              </Badge>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.anonymized.map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.entries(row).map(([column, value]) => {
                            const isSensitive = getColumnType(column) === 'sensitive';
                            const change = result.qualityAnalysis.columnChanges.find(c => c.column === column);
                            const hasChanged = change && change.informationLoss > 0;
                            
                            return (
                              <td key={column} className="p-2">
                                <span className={`${hasChanged ? 'bg-yellow-100 px-1 rounded' : ''} ${
                                  isSensitive && !showSensitiveData ? 'blur-sm' : ''
                                }`}>
                                  {maskSensitiveValue(value, isSensitive)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show first</span>
              <select
                value={previewSize}
                onChange={(e) => setPreviewSize(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-500">records</span>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {result.qualityAnalysis.privacyMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        metric.risk === 'low' ? 'bg-green-500' :
                        metric.risk === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-gray-500">{metric.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{metric.value}</div>
                      {metric.improvement && (
                        <div className={`text-sm ${metric.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.improvement > 0 ? '+' : ''}{metric.improvement}%
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'quality' && (
        <div className="space-y-4">
          {/* Column Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Column-wise Analysis</CardTitle>
              <CardDescription>
                Information loss and generalization for each column
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.qualityAnalysis.columnChanges.map((change, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{change.column}</span>
                        <Badge className={getColumnTypeColor(change.type)}>
                          {change.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {change.informationLoss.toFixed(1)}% loss
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Distinct Values</div>
                        <div>{change.originalDistinctValues} → {change.anonymizedDistinctValues}</div>
                      </div>
                      {change.generalizationLevel && (
                        <div>
                          <div className="text-gray-500">Generalization Level</div>
                          <div>{change.generalizationLevel}</div>
                        </div>
                      )}
                    </div>
                    
                    {change.examples.original.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-xs text-gray-500 mb-1">Examples</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="bg-red-50 px-2 py-1 rounded">
                            {change.examples.original.slice(0, 2).join(', ')}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="bg-green-50 px-2 py-1 rounded">
                            {change.examples.anonymized.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribution Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution Preservation</CardTitle>
              <CardDescription>
                How well the anonymized data preserves original distributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.qualityAnalysis.distributionChanges.map((change, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{change.column}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getQualityColor(change.preservationQuality)}>
                          {change.preservationQuality}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Distance: {change.distributionDistance.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-2">
          {result.metrics.privacyLevel >= 80 ? (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Excellent privacy protection achieved with good data utility.
              </AlertDescription>
            </Alert>
          ) : result.metrics.privacyLevel >= 60 ? (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Good privacy protection. Consider increasing parameters for better security.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="default">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Privacy protection may be insufficient. Consider stronger anonymization parameters.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex gap-2">
          {onDownload && (
            <Button variant="outline" onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download Preview
            </Button>
          )}
          {onApplyAnonymization && (
            <Button onClick={onApplyAnonymization}>
              Apply Anonymization
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
