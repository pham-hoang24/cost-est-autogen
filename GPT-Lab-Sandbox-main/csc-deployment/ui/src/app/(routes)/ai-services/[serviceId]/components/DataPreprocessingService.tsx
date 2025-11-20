'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Upload, 
  Database, 
  BarChart3, 
  Download, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Zap,
  Eye
} from 'lucide-react';

interface DataPreprocessingServiceProps {
  service: any;
}

export default function DataPreprocessingService({ service }: DataPreprocessingServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingConfig, setProcessingConfig] = useState({
    handleMissing: 'auto',
    removeOutliers: true,
    normalizeData: true,
    featureSelection: 'auto'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setCurrentStep(4);

    // Simulate data processing
    setTimeout(() => {
      setResults({
        originalRows: 10000,
        processedRows: 9847,
        columnsProcessed: 15,
        missingValuesHandled: 153,
        outliersRemoved: 47,
        featuresSelected: 12,
        dataQualityScore: 94.7,
        processingTime: '2m 34s',
        recommendations: [
          'Consider additional feature engineering for better model performance',
          'Dataset shows good quality with minimal cleaning needed',
          'Recommended train/validation/test split: 70/15/15'
        ]
      });
      setIsProcessing(false);
      setCurrentStep(5);
    }, 3000);
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Data Upload */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Upload Your Dataset</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Drag & drop your dataset or click to browse
              </h3>
              <p className="text-slate-400 mb-4">
                Supported formats: CSV, JSON, Parquet, Excel (max 100MB)
              </p>
              <input
                type="file"
                accept=".csv,.json,.parquet,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="data-upload"
              />
              <label htmlFor="data-upload">
                <Button className="btn-primary cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>
            
            {uploadedFile && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Dataset uploaded successfully!</span>
                </div>
                <div className="text-green-300 text-sm mt-1">
                  File: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!uploadedFile}
                className="btn-primary"
              >
                Next: Configure Processing
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Processing Configuration */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Configure Data Processing</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Missing Values Handling</label>
              <select 
                value={processingConfig.handleMissing}
                onChange={(e) => setProcessingConfig({...processingConfig, handleMissing: e.target.value})}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
              >
                <option value="auto">Auto-detect best method</option>
                <option value="remove">Remove rows with missing values</option>
                <option value="mean">Fill with mean/median</option>
                <option value="forward">Forward fill</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remove-outliers"
                checked={processingConfig.removeOutliers}
                onChange={(e) => setProcessingConfig({...processingConfig, removeOutliers: e.target.checked})}
                className="w-4 h-4 text-primary"
              />
              <label htmlFor="remove-outliers" className="text-white">
                Remove statistical outliers (IQR method)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="normalize-data"
                checked={processingConfig.normalizeData}
                onChange={(e) => setProcessingConfig({...processingConfig, normalizeData: e.target.checked})}
                className="w-4 h-4 text-primary"
              />
              <label htmlFor="normalize-data" className="text-white">
                Normalize numerical features (0-1 scaling)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Feature Selection</label>
              <select 
                value={processingConfig.featureSelection}
                onChange={(e) => setProcessingConfig({...processingConfig, featureSelection: e.target.value})}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
              >
                <option value="auto">Auto-select important features</option>
                <option value="correlation">Remove highly correlated features</option>
                <option value="variance">Remove low-variance features</option>
                <option value="manual">Manual selection</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(1)} variant="outline">
              Back
            </Button>
            <Button 
              onClick={() => setCurrentStep(3)}
              className="btn-primary"
            >
              Next: Review & Process
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Review Configuration */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Review Configuration</h2>
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Dataset:</span> {uploadedFile?.name}
              </div>
              <div className="flex items-center gap-2 text-white">
                <Database className="w-5 h-5" />
                <span className="font-medium">Size:</span> {uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : 0} MB
              </div>
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5" />
                <span className="font-medium">Missing Values:</span> {processingConfig.handleMissing}
              </div>
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Outliers:</span> {processingConfig.removeOutliers ? 'Remove' : 'Keep'}
              </div>
              <div className="flex items-center gap-2 text-white">
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Normalization:</span> {processingConfig.normalizeData ? 'Enabled' : 'Disabled'}
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Processing Pipeline:</h4>
              <div className="text-sm text-blue-300 space-y-1">
                <p>1. Data validation and profiling</p>
                <p>2. Missing value imputation</p>
                <p>3. Outlier detection and removal</p>
                <p>4. Feature normalization and scaling</p>
                <p>5. Feature selection and engineering</p>
                <p>6. Quality assessment and reporting</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(2)} variant="outline">
              Back
            </Button>
            <Button 
              onClick={startProcessing}
              className="btn-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Processing
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Processing */}
      {currentStep === 4 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Processing Dataset</h2>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Processing Your Data</h3>
              <p className="text-slate-400">
                Running preprocessing pipeline with AI-powered optimizations
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Processing Steps</span>
                <span className="text-white">Running...</span>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Data validation completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Missing values processed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Feature engineering in progress...</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 5: Results */}
      {currentStep === 5 && results && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-white">Processing Complete!</h2>
            </div>

            {/* Processing Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{results.processedRows}</div>
                <div className="text-sm text-green-300">Rows Processed</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{results.featuresSelected}</div>
                <div className="text-sm text-blue-300">Features Selected</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{results.dataQualityScore}%</div>
                <div className="text-sm text-purple-300">Quality Score</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{results.processingTime}</div>
                <div className="text-sm text-yellow-300">Processing Time</div>
              </div>
            </div>

            {/* Data Quality Report */}
            <Card className="p-4 bg-slate-700 border-slate-600 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">Data Quality Report</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Original Rows:</span>
                    <span className="text-white">{results.originalRows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Processed Rows:</span>
                    <span className="text-white">{results.processedRows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Missing Values Fixed:</span>
                    <span className="text-white">{results.missingValuesHandled}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Outliers Removed:</span>
                    <span className="text-white">{results.outliersRemoved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Features Selected:</span>
                    <span className="text-white">{results.featuresSelected}/{results.columnsProcessed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Quality Score:</span>
                    <span className="text-green-400 font-medium">{results.dataQualityScore}%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card className="p-4 bg-slate-700 border-slate-600 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">AI-Powered Recommendations</h4>
              <ul className="space-y-2">
                {results.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-slate-300">
                    <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex justify-between items-center">
              <Button onClick={resetWorkflow} variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Process New Dataset
              </Button>
              <div className="flex gap-2">
                <Button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Processed Data
                </Button>
                <Button className="btn-primary flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Data Profile
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
