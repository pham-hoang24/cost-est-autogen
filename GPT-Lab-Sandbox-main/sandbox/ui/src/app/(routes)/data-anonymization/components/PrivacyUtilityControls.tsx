'use client';

/**
 * Privacy-Utility Trade-off Controls Component
 * 
 * Implements interactive controls for anonymization parameters
 * following TUNi specification - Sprint 3 Tasks
 * Priority: Must-Have
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  BarChart3, 
  Settings, 
  Info, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Database
} from 'lucide-react';

export interface AnonymizationParams {
  algorithm: 'k-anonymity' | 'l-diversity' | 't-closeness';
  k: number;
  l?: number;
  t?: number;
  quasiIdentifiers: string[];
  sensitiveAttributes: string[];
  distanceMetric?: 'earth-movers' | 'equal-distance' | 'hierarchical';
  diversityType?: 'distinct' | 'entropy' | 'recursive';
  suppressionThreshold: number;
}

export interface PrivacyMetrics {
  privacyLevel: number;
  dataUtility: number;
  informationLoss: number;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedProcessingTime: number;
}

interface PrivacyUtilityControlsProps {
  dataColumns: string[];
  onParametersChange: (params: AnonymizationParams) => void;
  onPreviewAnonymization: (params: AnonymizationParams) => void;
  currentMetrics?: PrivacyMetrics;
  isProcessing?: boolean;
}

export default function PrivacyUtilityControls({
  dataColumns,
  onParametersChange,
  onPreviewAnonymization,
  currentMetrics,
  isProcessing = false
}: PrivacyUtilityControlsProps) {
  const [params, setParams] = useState<AnonymizationParams>({
    algorithm: 'k-anonymity',
    k: 3,
    l: 2,
    t: 0.2,
    quasiIdentifiers: [],
    sensitiveAttributes: [],
    distanceMetric: 'earth-movers',
    diversityType: 'distinct',
    suppressionThreshold: 0.05
  });

  const [estimatedMetrics, setEstimatedMetrics] = useState<PrivacyMetrics>({
    privacyLevel: 70,
    dataUtility: 85,
    informationLoss: 15,
    riskLevel: 'medium',
    estimatedProcessingTime: 30
  });

  // Update estimated metrics when parameters change
  useEffect(() => {
    const newMetrics = calculateEstimatedMetrics(params);
    setEstimatedMetrics(newMetrics);
    onParametersChange(params);
  }, [params, onParametersChange]);

  const calculateEstimatedMetrics = useCallback((parameters: AnonymizationParams): PrivacyMetrics => {
    // Simplified estimation logic based on parameters
    let privacyLevel = 0;
    let dataUtility = 100;
    let informationLoss = 0;
    let processingTime = 10;

    // K-Anonymity impact
    privacyLevel += Math.min(50, parameters.k * 8);
    informationLoss += Math.max(0, (parameters.k - 2) * 5);
    processingTime += parameters.k * 2;

    // L-Diversity impact
    if (parameters.algorithm !== 'k-anonymity' && parameters.l) {
      privacyLevel += Math.min(25, parameters.l * 10);
      informationLoss += Math.max(0, (parameters.l - 1) * 8);
      processingTime += parameters.l * 5;
    }

    // T-Closeness impact
    if (parameters.algorithm === 't-closeness' && parameters.t) {
      privacyLevel += Math.min(25, (1 - parameters.t) * 25);
      informationLoss += Math.max(0, (1 - parameters.t) * 20);
      processingTime += (1 - parameters.t) * 20;
    }

    // Quasi-identifier impact
    const qiRatio = parameters.quasiIdentifiers.length / Math.max(1, dataColumns.length);
    informationLoss += qiRatio * 20;
    processingTime += parameters.quasiIdentifiers.length * 3;

    // Suppression threshold impact
    informationLoss += parameters.suppressionThreshold * 100;

    dataUtility = Math.max(0, 100 - informationLoss);
    privacyLevel = Math.min(100, privacyLevel);

    const riskLevel: 'low' | 'medium' | 'high' = 
      privacyLevel >= 80 ? 'low' : privacyLevel >= 60 ? 'medium' : 'high';

    return {
      privacyLevel: Math.round(privacyLevel),
      dataUtility: Math.round(dataUtility),
      informationLoss: Math.round(informationLoss),
      riskLevel,
      estimatedProcessingTime: Math.round(processingTime)
    };
  }, [dataColumns.length]);

  const updateParams = (updates: Partial<AnonymizationParams>) => {
    setParams(prev => ({ ...prev, ...updates }));
  };

  const handleColumnSelection = (column: string, type: 'quasi' | 'sensitive') => {
    if (type === 'quasi') {
      const newQuasiIdentifiers = params.quasiIdentifiers.includes(column)
        ? params.quasiIdentifiers.filter(c => c !== column)
        : [...params.quasiIdentifiers, column];
      updateParams({ quasiIdentifiers: newQuasiIdentifiers });
    } else {
      const newSensitiveAttributes = params.sensitiveAttributes.includes(column)
        ? params.sensitiveAttributes.filter(c => c !== column)
        : [...params.sensitiveAttributes, column];
      updateParams({ sensitiveAttributes: newSensitiveAttributes });
    }
  };

  const getPrivacyLevelColor = (level: number) => {
    if (level >= 80) return 'text-green-600 bg-green-50';
    if (level >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getUtilityLevelColor = (level: number) => {
    if (level >= 80) return 'text-blue-600 bg-blue-50';
    if (level >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const metrics = currentMetrics || estimatedMetrics;

  return (
    <div className="space-y-6">
      {/* Algorithm Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Anonymization Algorithm
          </CardTitle>
          <CardDescription>
            Choose the privacy protection algorithm and configure parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => updateParams({ algorithm: 'k-anonymity' })}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                params.algorithm === 'k-anonymity' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="font-bold text-gray-900">K-Anonymity</div>
              <div className="text-sm text-gray-800 font-semibold">Basic protection</div>
            </button>
            <button
              onClick={() => updateParams({ algorithm: 'l-diversity' })}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                params.algorithm === 'l-diversity' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="font-bold text-gray-900">L-Diversity</div>
              <div className="text-sm text-gray-800 font-semibold">Attribute diversity</div>
            </button>
            <button
              onClick={() => updateParams({ algorithm: 't-closeness' })}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                params.algorithm === 't-closeness' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="font-bold text-gray-900">T-Closeness</div>
              <div className="text-sm text-gray-800 font-semibold">Distribution preservation</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Parameters
          </CardTitle>
          <CardDescription>
            Adjust privacy protection levels and anonymization strength
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* K Parameter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-900">K-Anonymity Level</label>
              <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-800 font-bold">{params.k}</Badge>
            </div>
            <Slider
              value={[params.k]}
              onValueChange={([value]) => updateParams({ k: value })}
              min={2}
              max={20}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-800 font-bold">
              Minimum group size for each combination of quasi-identifiers
            </p>
          </div>

          {/* L Parameter (for L-Diversity and T-Closeness) */}
          {params.algorithm !== 'k-anonymity' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900">L-Diversity Level</label>
                <Badge variant="outline" className="bg-green-50 border-green-300 text-green-800 font-bold">{params.l}</Badge>
              </div>
              <Slider
                value={[params.l || 2]}
                onValueChange={([value]) => updateParams({ l: value })}
                min={2}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-800 font-bold">
                Minimum diversity in sensitive attributes within each group
              </p>
            </div>
          )}

          {/* T Parameter (for T-Closeness) */}
          {params.algorithm === 't-closeness' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900">T-Closeness Threshold</label>
                <Badge variant="outline" className="bg-purple-50 border-purple-300 text-purple-800 font-bold">{params.t?.toFixed(2)}</Badge>
              </div>
              <Slider
                value={[params.t || 0.2]}
                onValueChange={([value]) => updateParams({ t: value })}
                min={0.1}
                max={1.0}
                step={0.05}
                className="w-full"
              />
              <p className="text-xs text-gray-800 font-bold">
                Maximum allowed distance between distributions (lower = more privacy)
              </p>
            </div>
          )}

          {/* Suppression Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-900">Suppression Threshold</label>
              <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-800 font-bold">{(params.suppressionThreshold * 100).toFixed(1)}%</Badge>
            </div>
            <Slider
              value={[params.suppressionThreshold * 100]}
              onValueChange={([value]) => updateParams({ suppressionThreshold: value / 100 })}
              min={0}
              max={20}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-gray-800 font-bold">
              Maximum percentage of records that can be suppressed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Column Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Column Classification
          </CardTitle>
          <CardDescription>
            Select quasi-identifiers and sensitive attributes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Quasi-Identifiers</h4>
              <p className="text-xs text-gray-800 font-bold mb-3">
                Columns that may indirectly identify individuals (age, zip code, job title, etc.)
              </p>
              <div className="flex flex-wrap gap-2">
                {dataColumns.map(column => (
                  <button
                    key={`quasi-${column}`}
                    onClick={() => handleColumnSelection(column, 'quasi')}
                    className={`px-3 py-1 text-sm rounded-full border-2 transition-all duration-200 font-bold ${
                      params.quasiIdentifiers.includes(column)
                        ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-sm'
                        : 'bg-white border-gray-400 text-gray-800 hover:bg-blue-50 hover:border-blue-400 shadow-sm'
                    }`}
                  >
                    {column}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Sensitive Attributes</h4>
              <p className="text-xs text-gray-800 font-bold mb-3">
                Columns containing sensitive information (salary, medical conditions, etc.)
              </p>
              <div className="flex flex-wrap gap-2">
                {dataColumns.map(column => (
                  <button
                    key={`sensitive-${column}`}
                    onClick={() => handleColumnSelection(column, 'sensitive')}
                    className={`px-3 py-1 text-sm rounded-full border-2 transition-all duration-200 font-bold ${
                      params.sensitiveAttributes.includes(column)
                        ? 'bg-red-100 border-red-500 text-red-800 shadow-sm'
                        : 'bg-white border-gray-400 text-gray-800 hover:bg-red-50 hover:border-red-400 shadow-sm'
                    }`}
                  >
                    {column}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy-Utility Trade-off Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Privacy vs Utility Trade-off
          </CardTitle>
          <CardDescription>
            Real-time analysis of privacy protection and data utility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Privacy Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Privacy Level</span>
                <Badge className={getPrivacyLevelColor(metrics.privacyLevel)}>
                  {metrics.privacyLevel}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.privacyLevel}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                <Shield className="w-3 h-3" />
                Higher is more protected
              </div>
            </div>

            {/* Data Utility */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Utility</span>
                <Badge className={getUtilityLevelColor(metrics.dataUtility)}>
                  {metrics.dataUtility}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.dataUtility}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                <BarChart3 className="w-3 h-3" />
                Higher preserves more data value
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {metrics.informationLoss}%
              </div>
              <div className="text-xs text-gray-700 font-medium">Information Loss</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {metrics.estimatedProcessingTime}s
              </div>
              <div className="text-xs text-gray-700 font-medium">Est. Processing</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                metrics.riskLevel === 'low' ? 'text-green-600' :
                metrics.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.riskLevel.toUpperCase()}
              </div>
              <div className="text-xs text-gray-700 font-medium">Risk Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => onPreviewAnonymization(params)}
          variant="outline"
          disabled={isProcessing || params.quasiIdentifiers.length === 0}
          className="flex items-center gap-2"
        >
          <Info className="w-4 h-4" />
          Preview Anonymization
        </Button>
        <Button
          onClick={() => onParametersChange(params)}
          disabled={isProcessing || params.quasiIdentifiers.length === 0}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {isProcessing ? 'Processing...' : 'Apply Anonymization'}
        </Button>
      </div>

      {/* Validation Alerts */}
      {params.quasiIdentifiers.length === 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            Please select at least one quasi-identifier column to enable anonymization.
          </AlertDescription>
        </Alert>
      )}

      {params.algorithm !== 'k-anonymity' && params.sensitiveAttributes.length === 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            {params.algorithm === 'l-diversity' ? 'L-Diversity' : 'T-Closeness'} requires at least one sensitive attribute.
          </AlertDescription>
        </Alert>
      )}

      {metrics.riskLevel === 'high' && (
        <Alert variant="default">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            High privacy risk detected. Consider increasing K, L, or decreasing T values for better protection.
          </AlertDescription>
        </Alert>
      )}

      {metrics.dataUtility < 50 && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Low data utility warning. Consider reducing anonymization parameters to preserve more data value.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
