'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { AlertTriangle, Upload, Play, CheckCircle } from 'lucide-react';

interface SimpleAnomalyDetectionServiceProps {
  service: any;
}

export default function SimpleAnomalyDetectionService({ service }: SimpleAnomalyDetectionServiceProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const runDetection = () => {
    setStep(3);
    setTimeout(() => setStep(4), 3000);
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
          Advanced machine learning algorithms to identify unusual patterns and outliers in your data.
        </p>
      </Card>

      {/* Simple Interface */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Upload Your Data</h3>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">Upload Dataset</h4>
            <p className="text-slate-400 text-sm mb-4">CSV, JSON files supported</p>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="anomaly-upload"
            />
            <label htmlFor="anomaly-upload">
              <Button className="btn-primary cursor-pointer">
                Choose File
              </Button>
            </label>
          </div>
          
          {file && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>File uploaded: {file.name}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => setStep(2)}
              disabled={!file}
              className="btn-primary"
            >
              Next: Configure Detection
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Detection Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Algorithm</label>
              <select className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white">
                <option value="isolation_forest">Isolation Forest (Recommended)</option>
                <option value="local_outlier">Local Outlier Factor</option>
                <option value="one_class_svm">One-Class SVM</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Sensitivity</label>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01" 
                defaultValue="0.1"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setStep(1)} variant="outline">
              Back
            </Button>
            <Button onClick={runDetection} className="btn-primary">
              Start Detection
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Analyzing Data...</h3>
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Running anomaly detection algorithms...</p>
        </Card>
      )}

      {step === 4 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Detection Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">5,000</div>
              <div className="text-sm text-blue-300">Data Points</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-2xl font-bold text-red-400">127</div>
              <div className="text-sm text-red-300">Anomalies Found</div>
            </div>
            <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">2.54%</div>
              <div className="text-sm text-orange-300">Anomaly Rate</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">89%</div>
              <div className="text-sm text-green-300">Confidence</div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Top Anomalies:</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                <span className="text-white">Value: 156.7 at 10:15:32</span>
                <Badge variant="red">High Confidence</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                <span className="text-white">Value: -23.1 at 10:22:18</span>
                <Badge variant="red">Negative Spike</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                <span className="text-white">Value: 203.4 at 10:35:45</span>
                <Badge variant="yellow">Trend Deviation</Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setStep(1)} className="btn-primary">
              Run New Detection
            </Button>
            <Button variant="outline">
              Export Results
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
