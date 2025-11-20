'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Database, Upload, CheckCircle, Download, Zap, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface DataPreprocessingPipelineProps {
  service: any;
}

export default function DataPreprocessingPipeline({ service }: DataPreprocessingPipelineProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setCurrentStep(2);
      
      // Simulate processing
      setTimeout(() => {
        setResults({
          originalRows: 15420,
          processedRows: 14890,
          qualityScore: 94,
          operations: [
            'Missing values handled',
            'Outliers detected and treated',
            'Features normalized',
            'Data validated'
          ]
        });
        setCurrentStep(3);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-cyan-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Automated data preprocessing pipeline with intelligent quality assessment and ML preparation.
        </p>
      </Card>

      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-white mb-4">Upload Dataset</h3>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center">
            <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h4 className="text-xl font-medium text-white mb-2">Drop your dataset here</h4>
            <p className="text-slate-400 mb-4">Supports CSV, Excel, JSON files up to 100MB</p>
            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="dataset-upload"
            />
            <label htmlFor="dataset-upload">
              <Button variant="outline" className="cursor-pointer">
                Choose Dataset
              </Button>
            </label>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-6 text-center">
          <Zap className="w-16 h-16 animate-pulse text-cyan-500 mx-auto mb-4" />
          <h3 className="text-xl text-white">Processing Data...</h3>
          <p className="text-slate-400">Analyzing and cleaning your dataset</p>
        </Card>
      )}

      {currentStep === 3 && results && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <div>
                <h3 className="text-2xl font-semibold text-white">Processing Complete!</h3>
                <p className="text-green-200">Quality Score: {results.qualityScore}%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-slate-700 text-center">
                <Database className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.processedRows.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Processed Rows</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.qualityScore}%</div>
                <div className="text-sm text-slate-400">Quality Score</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.operations.length}</div>
                <div className="text-sm text-slate-400">Operations Applied</div>
              </Card>
            </div>

            <Card className="p-4 bg-slate-700">
              <h4 className="text-lg font-semibold text-white mb-3">Operations Applied</h4>
              <div className="space-y-2">
                {results.operations.map((operation: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">{operation}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Download Processed Data</h3>
              <div className="grid grid-cols-4 gap-4">
                {['CSV', 'Parquet', 'JSON', 'Excel'].map((format) => (
                  <Button key={format} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {format}
                  </Button>
                ))}
              </div>
            </Card>

            <div className="text-center">
              <Button onClick={() => setCurrentStep(1)} className="bg-cyan-600">
                Process New Dataset
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
