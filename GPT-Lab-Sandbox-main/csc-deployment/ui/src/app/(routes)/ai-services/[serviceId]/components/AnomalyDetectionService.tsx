'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  AlertTriangle, 
  Upload, 
  Play, 
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  Download,
  Eye,
  Zap,
  Database,
  Activity,
  Target
} from 'lucide-react';

interface AnomalyDetectionServiceProps {
  service: any;
}

export default function AnomalyDetectionService({ service }: AnomalyDetectionServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedData, setUploadedData] = useState<File | null>(null);
  const [detectionConfig, setDetectionConfig] = useState({
    algorithm: 'isolation_forest',
    sensitivity: 0.1,
    windowSize: 100,
    realTimeMode: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  // Simulate real-time data stream
  useEffect(() => {
    if (detectionConfig.realTimeMode && detectionResults) {
      const interval = setInterval(() => {
        const newDataPoint = {
          timestamp: new Date().toLocaleTimeString(),
          value: Math.random() * 100,
          isAnomaly: Math.random() > 0.85,
          confidence: Math.random() * 0.4 + 0.6
        };
        setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [detectionConfig.realTimeMode, detectionResults]);

  const handleDataUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedData(file);
    }
  };

  const startDetection = () => {
    if (!uploadedData && !detectionConfig.realTimeMode) {
      alert('Please upload data or enable real-time mode');
      return;
    }
    
    setIsProcessing(true);
    setCurrentStep(3);

    setTimeout(() => {
      const mockResults = {
        totalDataPoints: detectionConfig.realTimeMode ? 1000 : 5000,
        anomaliesDetected: detectionConfig.realTimeMode ? 45 : 127,
        anomalyRate: detectionConfig.realTimeMode ? 4.5 : 2.54,
        confidence: 0.89,
        topAnomalies: [
          { id: 1, timestamp: '2025-09-21T10:15:32Z', value: 156.7, confidence: 0.94, type: 'Statistical Outlier' },
          { id: 2, timestamp: '2025-09-21T10:22:18Z', value: -23.1, confidence: 0.91, type: 'Negative Spike' },
          { id: 3, timestamp: '2025-09-21T10:35:45Z', value: 203.4, confidence: 0.87, type: 'Trend Deviation' },
          { id: 4, timestamp: '2025-09-21T10:47:12Z', value: 89.2, confidence: 0.83, type: 'Pattern Break' }
        ],
        patterns: [
          { name: 'Seasonal Pattern', detected: true, confidence: 0.92 },
          { name: 'Trend Pattern', detected: true, confidence: 0.78 },
          { name: 'Cyclical Pattern', detected: false, confidence: 0.45 }
        ],
        recommendations: [
          'Consider reducing sensitivity threshold to 0.08 for fewer false positives',
          'Enable real-time alerting for anomalies with confidence > 0.85',
          'Review data preprocessing steps to handle seasonal variations'
        ]
      };
      
      setDetectionResults(mockResults);
      setIsProcessing(false);
      setCurrentStep(4);
    }, 3000);
  };

  const resetDetection = () => {
    setCurrentStep(1);
    setUploadedData(null);
    setDetectionResults(null);
    setRealTimeData([]);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Anomaly Detection System</h2>
            <p className="text-red-200">Real-time anomaly detection for data streams and patterns</p>
          </div>
        </div>
        <p className="text-slate-300">
          Advanced machine learning algorithms to identify unusual patterns, outliers, and anomalies 
          in your data streams with high accuracy and low false positive rates.
        </p>
      </Card>

      {/* Step 1: Data Input */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Step 1: Data Input Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">Historical Data Upload</h4>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h5 className="text-white font-medium mb-2">Upload Dataset</h5>
                  <p className="text-slate-400 text-sm mb-4">CSV, JSON, or Parquet files (max 100MB)</p>
                  <input
                    type="file"
                    accept=".csv,.json,.parquet"
                    onChange={handleDataUpload}
                    className="hidden"
                    id="anomaly-data-upload"
                  />
                  <label htmlFor="anomaly-data-upload">
                    <Button className="btn-primary cursor-pointer">
                      Choose File
                    </Button>
                  </label>
                </div>
                {uploadedData && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{uploadedData.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Mode */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">Real-time Stream Mode</h4>
                <div className="bg-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-medium">Enable Real-time Detection</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detectionConfig.realTimeMode}
                        onChange={(e) => setDetectionConfig({...detectionConfig, realTimeMode: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Monitor live data streams and detect anomalies in real-time
                  </p>
                  {detectionConfig.realTimeMode && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">Real-time mode enabled - simulated data stream</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!uploadedData && !detectionConfig.realTimeMode}
                className="btn-primary"
              >
                Next: Configure Detection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Configuration */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 2: Detection Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Detection Algorithm</label>
                <select 
                  value={detectionConfig.algorithm}
                  onChange={(e) => setDetectionConfig({...detectionConfig, algorithm: e.target.value})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="isolation_forest">Isolation Forest (Recommended)</option>
                  <option value="local_outlier">Local Outlier Factor</option>
                  <option value="one_class_svm">One-Class SVM</option>
                  <option value="statistical">Statistical Methods</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Sensitivity Threshold: {detectionConfig.sensitivity}
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={detectionConfig.sensitivity}
                  onChange={(e) => setDetectionConfig({...detectionConfig, sensitivity: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>High Sensitivity</span>
                  <span>Low Sensitivity</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Window Size</label>
                <select 
                  value={detectionConfig.windowSize}
                  onChange={(e) => setDetectionConfig({...detectionConfig, windowSize: parseInt(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={50}>50 points (Fast)</option>
                  <option value={100}>100 points (Balanced)</option>
                  <option value={200}>200 points (Thorough)</option>
                  <option value={500}>500 points (Very Thorough)</option>
                </select>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Detection Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Algorithm:</span>
                    <span className="text-white capitalize">{detectionConfig.algorithm.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expected Anomaly Rate:</span>
                    <span className="text-white">{(detectionConfig.sensitivity * 20).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Mode:</span>
                    <span className="text-white">{detectionConfig.realTimeMode ? 'Real-time' : 'Batch'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(1)} variant="outline">
              Back
            </Button>
            <Button onClick={startDetection} className="btn-primary">
              Start Anomaly Detection
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Processing */}
      {currentStep === 3 && (
        <Card className="p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Analyzing Data for Anomalies...</h3>
          <p className="text-slate-400 mb-6">
            Running {detectionConfig.algorithm.replace('_', ' ')} algorithm on your data
          </p>
          <Loader2 className="w-16 h-16 animate-spin text-red-500 mx-auto mb-6" />
          <div className="text-slate-300">
            This may take a few moments depending on your data size...
          </div>
        </Card>
      )}

      {/* Step 4: Results */}
      {currentStep === 4 && detectionResults && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{detectionResults.totalDataPoints.toLocaleString()}</div>
              <div className="text-sm text-blue-300">Data Points</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{detectionResults.anomaliesDetected}</div>
              <div className="text-sm text-red-300">Anomalies Found</div>
            </div>
            <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{detectionResults.anomalyRate}%</div>
              <div className="text-sm text-orange-300">Anomaly Rate</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{(detectionResults.confidence * 100).toFixed(0)}%</div>
              <div className="text-sm text-green-300">Confidence</div>
            </div>
          </div>

          {/* Real-time Stream */}
          {detectionConfig.realTimeMode && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Real-time Anomaly Stream</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {realTimeData.map((point, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded ${
                      point.isAnomaly ? 'bg-red-500/20 border border-red-500/30' : 'bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {point.isAnomaly ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-white text-sm">{point.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">Value: {point.value.toFixed(2)}</span>
                      {point.isAnomaly && (
                        <Badge variant="red" className="text-xs">
                          Anomaly ({(point.confidence * 100).toFixed(0)}%)
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top Anomalies */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Top Anomalies Detected</h3>
            <div className="space-y-3">
              {detectionResults.topAnomalies.map((anomaly: any) => (
                <div key={anomaly.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-white font-medium">Value: {anomaly.value}</div>
                      <div className="text-slate-400 text-sm">{new Date(anomaly.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="red" className="mb-1">
                      {anomaly.type}
                    </Badge>
                    <div className="text-slate-400 text-sm">
                      Confidence: {(anomaly.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pattern Analysis */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Pattern Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {detectionResults.patterns.map((pattern: any, index: number) => (
                <div key={index} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{pattern.name}</span>
                    {pattern.detected ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Confidence: {(pattern.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">AI Recommendations</h3>
            <div className="space-y-3">
              {detectionResults.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                  <Target className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button onClick={resetDetection} className="btn-primary">
              Run New Detection
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Results
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configure Alerts
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
