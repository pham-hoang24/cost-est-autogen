'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Settings, Upload, Play, CheckCircle, BarChart3, Cpu, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface FineTuningServiceProps {
  service: any;
}

export default function FineTuningService({ service }: FineTuningServiceProps) {
  const [selectedModel, setSelectedModel] = useState('');
  const [uploadedDataset, setUploadedDataset] = useState<File | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [results, setResults] = useState<any>(null);

  const baseModels = [
    { id: 'bert', name: 'BERT-base', type: 'NLP', size: '110M params', cost: '€15/hour' },
    { id: 'gpt', name: 'GPT-3.5', type: 'Language', size: '175B params', cost: '€45/hour' },
    { id: 'resnet', name: 'ResNet-50', type: 'Vision', size: '25M params', cost: '€12/hour' },
    { id: 'whisper', name: 'Whisper-large', type: 'Speech', size: '1.5B params', cost: '€25/hour' }
  ];

  const handleDatasetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDataset(file);
    }
  };

  const startFineTuning = () => {
    setIsTraining(true);
    
    setTimeout(() => {
      setResults({
        modelId: 'ft-' + Date.now(),
        baseModel: baseModels.find(m => m.id === selectedModel)?.name,
        trainingTime: '3h 45m',
        finalAccuracy: 0.923,
        improvement: '+8.4%',
        cost: 168.75,
        epochs: 25,
        metrics: {
          trainingLoss: 0.045,
          validationLoss: 0.062,
          f1Score: 0.91,
          precision: 0.94,
          recall: 0.88
        }
      });
      setIsTraining(false);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-yellow-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Fine-tune pre-trained models on your custom datasets for improved performance.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Configure Fine-Tuning</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-white mb-2">Select Base Model</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {baseModels.map((model) => (
                <Card
                  key={model.id}
                  className={`p-4 cursor-pointer ${selectedModel === model.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-600'}`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">{model.name}</h4>
                    <Badge variant="secondary" className="text-xs">{model.type}</Badge>
                  </div>
                  <p className="text-slate-400 text-sm">{model.size}</p>
                  <p className="text-yellow-400 text-sm">{model.cost}</p>
                </Card>
              ))}
            </div>
          </div>

          {selectedModel && (
            <div>
              <label className="block text-white mb-2">Upload Training Dataset</label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".csv,.jsonl,.txt"
                  onChange={handleDatasetUpload}
                  className="hidden"
                  id="dataset-upload"
                />
                <label htmlFor="dataset-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Upload Dataset
                  </Button>
                </label>
                <p className="text-slate-500 text-xs mt-2">CSV, JSONL, or TXT format</p>
              </div>

              {uploadedDataset && (
                <Card className="p-3 bg-slate-700 mt-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">{uploadedDataset.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(uploadedDataset.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                </Card>
              )}
            </div>
          )}

          <Button 
            onClick={startFineTuning}
            disabled={!selectedModel || !uploadedDataset || isTraining}
            className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
          >
            {isTraining ? (
              <>
                <Settings className="w-4 h-4 animate-spin" />
                Fine-Tuning in Progress...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Fine-Tuning
              </>
            )}
          </Button>
        </div>
      </Card>

      {isTraining && (
        <Card className="p-6 text-center">
          <Settings className="w-16 h-16 animate-spin text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl text-white">Fine-Tuning in Progress...</h3>
          <p className="text-slate-400">Training {baseModels.find(m => m.id === selectedModel)?.name} on your dataset</p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400">Epoch</div>
              <div className="text-yellow-400 font-medium">15/25</div>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400">Loss</div>
              <div className="text-green-400 font-medium">0.078</div>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400">GPU Usage</div>
              <div className="text-blue-400 font-medium">94%</div>
            </div>
          </div>
        </Card>
      )}

      {results && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">Fine-Tuning Complete!</h3>
                <p className="text-green-200">Model ID: {results.modelId}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-slate-700 text-center">
                <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{(results.finalAccuracy * 100).toFixed(1)}%</div>
                <div className="text-sm text-slate-400">Final Accuracy</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.improvement}</div>
                <div className="text-sm text-slate-400">Improvement</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <Cpu className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.trainingTime}</div>
                <div className="text-sm text-slate-400">Training Time</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <span className="text-xl">💰</span>
                <div className="text-xl font-bold text-white">€{results.cost}</div>
                <div className="text-sm text-slate-400">Total Cost</div>
              </Card>
            </div>

            <Card className="p-4 bg-slate-700 mt-4">
              <h4 className="text-white font-medium mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                {Object.entries(results.metrics || {}).map(([metric, value]) => (
                  <div key={metric} className="text-center">
                    <div className="text-lg font-bold text-white">{(value as number).toFixed(3)}</div>
                    <div className="text-slate-400 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-4">
              <Button className="bg-yellow-600 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Deploy Model
              </Button>
              <Button variant="outline">
                Download Model
              </Button>
              <Button variant="outline" onClick={() => setResults(null)}>
                New Fine-Tuning
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
