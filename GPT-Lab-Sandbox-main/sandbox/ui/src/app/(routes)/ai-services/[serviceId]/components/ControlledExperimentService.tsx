'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { FlaskConical, Play, Cpu, CheckCircle, BarChart3, Download, Settings } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface ControlledExperimentServiceProps {
  service: any;
}

export default function ControlledExperimentService({ service }: ControlledExperimentServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [experiment, setExperiment] = useState({
    name: '',
    model: '',
    dataset: '',
    gpuType: ''
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const models = [
    { id: 'bert', name: 'BERT-base', type: 'NLP', gpuHours: 2.5 },
    { id: 'resnet', name: 'ResNet-50', type: 'Vision', gpuHours: 4.0 },
    { id: 'gpt', name: 'GPT-3.5-turbo', type: 'Language', gpuHours: 6.0 },
    { id: 'yolo', name: 'YOLO-v8', type: 'Detection', gpuHours: 3.5 }
  ];

  const datasets = [
    { id: 'sentiment', name: 'Movie Reviews (50K)', size: '120MB' },
    { id: 'images', name: 'ImageNet Subset (10K)', size: '2.1GB' },
    { id: 'financial', name: 'Stock Prices (5 years)', size: '45MB' },
    { id: 'medical', name: 'Medical Records (anonymized)', size: '890MB' }
  ];

  const gpuTypes = [
    { id: 'v100', name: 'NVIDIA V100', memory: '32GB', cost: '€2.50/hour' },
    { id: 'a100', name: 'NVIDIA A100', memory: '80GB', cost: '€4.20/hour' },
    { id: 't4', name: 'NVIDIA T4', memory: '16GB', cost: '€1.20/hour' }
  ];

  const startExperiment = () => {
    setIsRunning(true);
    setCurrentStep(2);
    
    setTimeout(() => {
      setResults({
        experimentId: 'exp-' + Date.now(),
        status: 'completed',
        duration: '2h 34m',
        accuracy: 0.924,
        loss: 0.076,
        gpuUtilization: 87,
        cost: 12.45,
        epochs: 50,
        metrics: [
          { epoch: 10, accuracy: 0.85, loss: 0.15 },
          { epoch: 20, accuracy: 0.89, loss: 0.11 },
          { epoch: 30, accuracy: 0.91, loss: 0.09 },
          { epoch: 40, accuracy: 0.92, loss: 0.08 },
          { epoch: 50, accuracy: 0.924, loss: 0.076 }
        ]
      });
      setIsRunning(false);
      setCurrentStep(3);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-blue-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Run reproducible AI experiments with GPU allocation, monitoring, and detailed results tracking.
        </p>
      </Card>

      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-white mb-4">Configure Experiment</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Experiment Name</label>
              <Input
                placeholder="Enter experiment name..."
                value={experiment.name}
                onChange={(e) => setExperiment({...experiment, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Select Model</label>
                <div className="space-y-2">
                  {models.map((model) => (
                    <Card
                      key={model.id}
                      className={`p-3 cursor-pointer ${experiment.model === model.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600'}`}
                      onClick={() => setExperiment({...experiment, model: model.id})}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">{model.name}</h4>
                          <Badge variant="secondary" className="text-xs">{model.type}</Badge>
                        </div>
                        <span className="text-blue-400 text-sm">{model.gpuHours}h GPU</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Select Dataset</label>
                <div className="space-y-2">
                  {datasets.map((dataset) => (
                    <Card
                      key={dataset.id}
                      className={`p-3 cursor-pointer ${experiment.dataset === dataset.id ? 'border-green-500 bg-green-500/10' : 'border-slate-600'}`}
                      onClick={() => setExperiment({...experiment, dataset: dataset.id})}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">{dataset.name}</h4>
                          <span className="text-slate-400 text-sm">{dataset.size}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">GPU Configuration</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gpuTypes.map((gpu) => (
                  <Card
                    key={gpu.id}
                    className={`p-4 cursor-pointer ${experiment.gpuType === gpu.id ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600'}`}
                    onClick={() => setExperiment({...experiment, gpuType: gpu.id})}
                  >
                    <Cpu className="w-8 h-8 text-purple-400 mb-2" />
                    <h4 className="text-white font-medium">{gpu.name}</h4>
                    <p className="text-slate-400 text-sm">{gpu.memory}</p>
                    <p className="text-purple-400 text-sm">{gpu.cost}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={startExperiment}
              disabled={!experiment.name || !experiment.model || !experiment.dataset || !experiment.gpuType}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Experiment
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-6 text-center">
          <FlaskConical className="w-16 h-16 animate-pulse text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl text-white">Experiment Running...</h3>
          <p className="text-slate-400">Training {experiment.model} on {experiment.dataset}</p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400">GPU Usage</div>
              <div className="text-purple-400 font-medium">87%</div>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400">Epoch</div>
              <div className="text-blue-400 font-medium">23/50</div>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400">Current Loss</div>
              <div className="text-green-400 font-medium">0.089</div>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 3 && results && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <div>
                <h3 className="text-2xl font-semibold text-white">Experiment Complete!</h3>
                <p className="text-green-200">ID: {results.experimentId}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-slate-700 text-center">
                <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{(results.accuracy * 100).toFixed(1)}%</div>
                <div className="text-sm text-slate-400">Final Accuracy</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <FlaskConical className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.duration}</div>
                <div className="text-sm text-slate-400">Duration</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <Cpu className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.gpuUtilization}%</div>
                <div className="text-sm text-slate-400">GPU Utilization</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <span className="text-xl">💰</span>
                <div className="text-xl font-bold text-white">€{results.cost}</div>
                <div className="text-sm text-slate-400">Total Cost</div>
              </Card>
            </div>

            <Card className="p-4 bg-slate-700 mt-4">
              <h4 className="text-lg font-semibold text-white mb-3">Training Progress</h4>
              <div className="space-y-2">
                {results.metrics.map((metric: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-400">Epoch {metric.epoch}</span>
                    <span className="text-white">Accuracy: {(metric.accuracy * 100).toFixed(1)}% | Loss: {metric.loss}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-4">
              <Button className="bg-blue-600 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Model
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                View Detailed Report
              </Button>
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                New Experiment
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
