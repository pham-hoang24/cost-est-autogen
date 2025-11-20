'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TrendingUp, Upload, CheckCircle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface TimeSeriesAnalysisServiceProps {
  service: any;
}

export default function TimeSeriesAnalysisService({ service }: TimeSeriesAnalysisServiceProps) {
  const [uploadedData, setUploadedData] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState('forecasting');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analysisTypes = [
    { id: 'forecasting', name: 'Forecasting', icon: '📈' },
    { id: 'anomaly', name: 'Anomaly Detection', icon: '🚨' },
    { id: 'trend', name: 'Trend Analysis', icon: '📊' }
  ];

  const handleDataUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedData(file);
    }
  };

  const analyzeData = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setResults({
        type: analysisType,
        accuracy: 0.86,
        predictions: [
          { date: '2024-01-01', value: 1250 },
          { date: '2024-02-01', value: 1340 },
          { date: '2024-03-01', value: 1420 }
        ],
        anomalies: 3,
        trend: 'Increasing (+12.5%)'
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-teal-500/10 border-blue-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-blue-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Advanced time series analysis with forecasting and anomaly detection.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Time Series Analysis</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Analysis Type</label>
            <div className="grid grid-cols-3 gap-2">
              {analysisTypes.map((type) => (
                <Button
                  key={type.id}
                  onClick={() => setAnalysisType(type.id)}
                  variant={analysisType === type.id ? 'primary' : 'outline'}
                  className="text-sm"
                >
                  {type.icon} {type.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Upload Data</label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleDataUpload}
                className="hidden"
                id="timeseries-upload"
              />
              <label htmlFor="timeseries-upload">
                <Button variant="outline" className="cursor-pointer">
                  Upload Time Series
                </Button>
              </label>
            </div>

            {uploadedData && (
              <Card className="p-3 bg-slate-700 mt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">{uploadedData.name}</span>
                </div>
              </Card>
            )}
          </div>

          <Button 
            onClick={analyzeData}
            disabled={!uploadedData || isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <TrendingUp className="w-4 h-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Analyze Data
              </>
            )}
          </Button>
        </div>
      </Card>

      {results && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Analysis Results</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-slate-700 text-center">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{(results.accuracy * 100).toFixed(1)}%</div>
              <div className="text-sm text-slate-400">Accuracy</div>
            </Card>
            <Card className="p-4 bg-slate-700 text-center">
              <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{results.predictions?.length || 0}</div>
              <div className="text-sm text-slate-400">Predictions</div>
            </Card>
            <Card className="p-4 bg-slate-700 text-center">
              <span className="text-xl">🚨</span>
              <div className="text-xl font-bold text-white">{results.anomalies}</div>
              <div className="text-sm text-slate-400">Anomalies</div>
            </Card>
            <Card className="p-4 bg-slate-700 text-center">
              <span className="text-xl">📊</span>
              <div className="text-lg font-bold text-white">{results.trend}</div>
              <div className="text-sm text-slate-400">Trend</div>
            </Card>
          </div>

          {analysisType === 'forecasting' && (
            <Card className="p-4 bg-slate-700">
              <h4 className="text-white font-medium mb-3">Forecast Results</h4>
              <div className="space-y-2">
                {results.predictions?.map((pred: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-slate-300">{pred.date}</span>
                    <span className="text-blue-400 font-medium">{pred.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-4">
            <Button className="bg-blue-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              View Chart
            </Button>
            <Button variant="outline" onClick={() => setResults(null)}>
              New Analysis
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
