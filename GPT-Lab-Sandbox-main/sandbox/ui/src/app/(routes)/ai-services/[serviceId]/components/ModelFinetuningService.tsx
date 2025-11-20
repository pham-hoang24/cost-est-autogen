'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Brain, 
  Upload, 
  Settings, 
  BarChart3, 
  Download, 
  Play, 
  CheckCircle, 
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  Star,
  FileText,
  Database,
  Cpu
} from 'lucide-react';

interface ModelFinetuningServiceProps {
  service: any;
}

export default function ModelFinetuningService({ service }: ModelFinetuningServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBaseModel, setSelectedBaseModel] = useState('');
  const [finetuningConfig, setFinetuningConfig] = useState({
    learningRate: 0.00005,
    epochs: 3,
    batchSize: 16,
    warmupSteps: 100,
    weightDecay: 0.01,
    saveStrategy: 'epoch'
  });
  const [uploadedDataset, setUploadedDataset] = useState<File | null>(null);
  const [isFineTuning, setIsFineTuning] = useState(false);
  const [finetuningProgress, setFinetuningProgress] = useState(0);
  const [finetuningResults, setFinetuningResults] = useState<any>(null);

  const baseModels = [
    {
      id: 'bert-base-uncased',
      name: 'BERT Base Uncased',
      platform: 'Hugging Face',
      parameters: '110M',
      description: 'General-purpose language understanding',
      bestFor: ['Text classification', 'Named entity recognition', 'Question answering'],
      estimatedCost: '$12.50'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      platform: 'OpenAI',
      parameters: '175B',
      description: 'Advanced text generation and reasoning',
      bestFor: ['Text generation', 'Conversational AI', 'Code generation'],
      estimatedCost: '$45.00'
    },
    {
      id: 'roberta-base',
      name: 'RoBERTa Base',
      platform: 'Hugging Face',
      parameters: '125M',
      description: 'Robustly optimized BERT approach',
      bestFor: ['Sentiment analysis', 'Text classification', 'Language modeling'],
      estimatedCost: '$15.20'
    },
    {
      id: 'distilbert-base',
      name: 'DistilBERT Base',
      platform: 'Hugging Face',
      parameters: '66M',
      description: 'Lightweight BERT with 97% performance',
      bestFor: ['Mobile deployment', 'Fast inference', 'Resource-constrained environments'],
      estimatedCost: '$8.30'
    }
  ];

  const handleDatasetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDataset(file);
    }
  };

  const startFineTuning = async () => {
    setIsFineTuning(true);
    setCurrentStep(4);
    setFinetuningProgress(0);

    // Simulate realistic fine-tuning progress
    const finetuningInterval = setInterval(() => {
      setFinetuningProgress(prev => {
        const newProgress = prev + Math.random() * 4;
        
        if (newProgress >= 100) {
          clearInterval(finetuningInterval);
          setIsFineTuning(false);
          setFinetuningResults({
            baseModel: selectedBaseModel,
            finalAccuracy: 0.947,
            improvementOverBase: '+12.3%',
            finetuningTime: '1h 23m',
            totalCost: baseModels.find(m => m.id === selectedBaseModel)?.estimatedCost || '$15.00',
            modelSize: '440MB',
            trainingSteps: 1250,
            bestCheckpoint: 'epoch-3-step-1000',
            validationMetrics: {
              precision: 0.923,
              recall: 0.956,
              f1Score: 0.939
            }
          });
          setCurrentStep(5);
          return 100;
        }
        return newProgress;
      });
    }, 600);
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setSelectedBaseModel('');
    setUploadedDataset(null);
    setIsFineTuning(false);
    setFinetuningProgress(0);
    setFinetuningResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Model Fine-tuning Service</h2>
            <p className="text-green-200">Customize pre-trained models for your specific use case</p>
          </div>
        </div>
        <p className="text-slate-300">
          Fine-tune state-of-the-art models from Hugging Face and OpenAI on your custom datasets. 
          Achieve superior performance for domain-specific tasks.
        </p>
      </Card>

      {/* Step 1: Base Model Selection */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 1: Select Base Model</h3>
          <p className="text-slate-400 mb-6">Choose a pre-trained model to fine-tune on your data</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {baseModels.map((model) => (
              <Card 
                key={model.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedBaseModel === model.id 
                    ? 'border-2 border-primary bg-primary/10' 
                    : 'border-2 border-border hover:border-slate-600'
                }`}
                onClick={() => setSelectedBaseModel(model.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{model.name}</h4>
                      <Badge variant={model.platform === 'Hugging Face' ? 'yellow' : 'green'}>
                        {model.platform}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{model.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span>{model.parameters} parameters</span>
                      <span>Est. cost: {model.estimatedCost}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Best for:</p>
                      {model.bestFor.slice(0, 2).map((use, index) => (
                        <Badge key={index} variant="secondary" className="text-xs mr-1">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedBaseModel === model.id && (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={!selectedBaseModel}
              className="btn-primary"
            >
              Next: Upload Dataset
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Dataset Upload */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 2: Upload Fine-tuning Dataset</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">
                Upload your training dataset
              </h4>
              <p className="text-slate-400 mb-4">
                Supported: JSONL, CSV, TSV (max 500MB)
              </p>
              <input
                type="file"
                accept=".jsonl,.csv,.tsv"
                onChange={handleDatasetUpload}
                className="hidden"
                id="finetuning-dataset-upload"
              />
              <label htmlFor="finetuning-dataset-upload">
                <Button className="btn-primary cursor-pointer">
                  Choose Dataset
                </Button>
              </label>
            </div>
            
            {uploadedDataset && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Dataset uploaded and validated!</span>
                </div>
                <div className="text-green-300 text-sm mb-3">
                  File: {uploadedDataset.name} ({(uploadedDataset.size / 1024 / 1024).toFixed(2)} MB)
                </div>
                <div className="bg-slate-700 rounded p-3 text-sm text-slate-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Detected Format:</strong> JSONL<br/>
                      <strong>Training Samples:</strong> 8,420<br/>
                      <strong>Validation Samples:</strong> 1,580
                    </div>
                    <div>
                      <strong>Task Type:</strong> Text Classification<br/>
                      <strong>Classes:</strong> 5 categories<br/>
                      <strong>Quality Score:</strong> <span className="text-green-400">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!uploadedDataset}
                className="btn-primary"
              >
                Next: Configure Fine-tuning
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Fine-tuning Configuration */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 3: Configure Fine-tuning Parameters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Learning Rate</label>
                <select 
                  value={finetuningConfig.learningRate}
                  onChange={(e) => setFinetuningConfig({...finetuningConfig, learningRate: parseFloat(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={0.00001}>1e-5 (Conservative)</option>
                  <option value={0.00005}>5e-5 (Recommended)</option>
                  <option value={0.0001}>1e-4 (Aggressive)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Training Epochs</label>
                <select 
                  value={finetuningConfig.epochs}
                  onChange={(e) => setFinetuningConfig({...finetuningConfig, epochs: parseInt(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={1}>1 epoch (Quick test)</option>
                  <option value={3}>3 epochs (Recommended)</option>
                  <option value={5}>5 epochs (Thorough)</option>
                  <option value={10}>10 epochs (Research)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Batch Size</label>
                <select 
                  value={finetuningConfig.batchSize}
                  onChange={(e) => setFinetuningConfig({...finetuningConfig, batchSize: parseInt(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={8}>8 (Memory efficient)</option>
                  <option value={16}>16 (Balanced)</option>
                  <option value={32}>32 (Fast training)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Warmup Steps</label>
                <select 
                  value={finetuningConfig.warmupSteps}
                  onChange={(e) => setFinetuningConfig({...finetuningConfig, warmupSteps: parseInt(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={0}>0 (No warmup)</option>
                  <option value={100}>100 steps</option>
                  <option value={500}>500 steps</option>
                  <option value={1000}>1000 steps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Weight Decay</label>
                <select 
                  value={finetuningConfig.weightDecay}
                  onChange={(e) => setFinetuningConfig({...finetuningConfig, weightDecay: parseFloat(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={0}>0.0 (No regularization)</option>
                  <option value={0.01}>0.01 (Light regularization)</option>
                  <option value={0.1}>0.1 (Strong regularization)</option>
                </select>
              </div>

              {/* Cost Estimation */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Estimated Cost</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {baseModels.find(m => m.id === selectedBaseModel)?.estimatedCost || '$15.00'}
                </div>
                <div className="text-sm text-blue-300">
                  {finetuningConfig.epochs} epochs × {finetuningConfig.batchSize} batch size
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4 mt-6">
            <h4 className="text-white font-medium mb-2">Selected Configuration:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
              <div>Base: {baseModels.find(m => m.id === selectedBaseModel)?.name}</div>
              <div>LR: {finetuningConfig.learningRate}</div>
              <div>Epochs: {finetuningConfig.epochs}</div>
              <div>Batch: {finetuningConfig.batchSize}</div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(2)} variant="outline">
              Back
            </Button>
            <Button 
              onClick={startFineTuning}
              className="btn-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Fine-tuning
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Fine-tuning in Progress */}
      {currentStep === 4 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Fine-tuning in Progress</h3>
            <Badge variant="secondary">
              {baseModels.find(m => m.id === selectedBaseModel)?.platform}
            </Badge>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{finetuningProgress.toFixed(1)}%</div>
              <div className="text-sm text-green-300">Progress</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{Math.floor(finetuningProgress / (100/finetuningConfig.epochs))}</div>
              <div className="text-sm text-blue-300">Current Epoch</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{Math.max(0, Math.floor((100 - finetuningProgress) * 1.2))}m</div>
              <div className="text-sm text-purple-300">ETA</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Fine-tuning Progress</span>
              <span className="text-white">{finetuningProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${finetuningProgress}%` }}
              />
            </div>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-slate-700 border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">Training Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Training Loss:</span>
                  <span className="text-white">{(2.1 - (finetuningProgress / 100) * 1.8).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Validation Loss:</span>
                  <span className="text-white">{(1.9 - (finetuningProgress / 100) * 1.5).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Accuracy:</span>
                  <span className="text-green-400">{((finetuningProgress / 100) * 0.85 + 0.15).toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">F1 Score:</span>
                  <span className="text-blue-400">{((finetuningProgress / 100) * 0.80 + 0.20).toFixed(3)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-700 border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">Resource Usage</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">GPU Utilization:</span>
                  <span className="text-green-400">{(88 + Math.random() * 8).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Memory Usage:</span>
                  <span className="text-blue-400">{(15.2 + Math.random() * 4).toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Current Cost:</span>
                  <span className="text-yellow-400">${((finetuningProgress / 100) * parseFloat(baseModels.find(m => m.id === selectedBaseModel)?.estimatedCost?.replace('$', '') || '15')).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Training Steps:</span>
                  <span className="text-white">{Math.floor((finetuningProgress / 100) * 1250)}/1250</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Training Log */}
          <Card className="p-4 bg-slate-700 border-slate-600">
            <h4 className="text-lg font-semibold text-white mb-3">Live Training Log</h4>
            <div className="bg-black rounded p-3 font-mono text-xs text-green-400 h-32 overflow-y-auto">
              <div>🚀 Fine-tuning job started on {baseModels.find(m => m.id === selectedBaseModel)?.platform}</div>
              <div>📊 Dataset loaded: 8,420 training samples</div>
              <div>🔧 Base model: {baseModels.find(m => m.id === selectedBaseModel)?.name}</div>
              <div>⚡ GPU allocation: A100 (80GB VRAM)</div>
              <div>📈 Epoch {Math.floor(finetuningProgress / (100/finetuningConfig.epochs))}: Loss={(2.1 - (finetuningProgress / 100) * 1.8).toFixed(4)}, Acc={(finetuningProgress / 100 * 0.85 + 0.15).toFixed(3)}</div>
              <div>💾 Checkpoint saved at step {Math.floor((finetuningProgress / 100) * 1250)}</div>
              <div>🔄 Learning rate: {finetuningConfig.learningRate}</div>
            </div>
          </Card>
        </Card>
      )}

      {/* Step 5: Fine-tuning Complete */}
      {currentStep === 5 && finetuningResults && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold text-white">Fine-tuning Complete!</h3>
              <Badge variant="green">Ready for Deployment</Badge>
            </div>

            {/* Performance Results */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{finetuningResults.finalAccuracy}</div>
                <div className="text-sm text-green-300">Final Accuracy</div>
                <div className="text-xs text-green-500 mt-1">{finetuningResults.improvementOverBase}</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{finetuningResults.validationMetrics.f1Score}</div>
                <div className="text-sm text-blue-300">F1 Score</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{finetuningResults.finetuningTime}</div>
                <div className="text-sm text-purple-300">Training Time</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{finetuningResults.totalCost}</div>
                <div className="text-sm text-yellow-300">Total Cost</div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <Card className="p-4 bg-slate-700 border-slate-600 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">Detailed Performance Metrics</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{finetuningResults.validationMetrics.precision}</div>
                  <div className="text-slate-300">Precision</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{finetuningResults.validationMetrics.recall}</div>
                  <div className="text-slate-300">Recall</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{finetuningResults.validationMetrics.f1Score}</div>
                  <div className="text-slate-300">F1 Score</div>
                </div>
              </div>
            </Card>

            {/* Model Artifacts */}
            <Card className="p-4 bg-slate-700 border-slate-600 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">Model Artifacts</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Model Size:</span>
                    <span className="text-white">{finetuningResults.modelSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Training Steps:</span>
                    <span className="text-white">{finetuningResults.trainingSteps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Best Checkpoint:</span>
                    <span className="text-white">{finetuningResults.bestCheckpoint}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Format:</span>
                    <span className="text-white">Hugging Face Hub</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Precision:</span>
                    <span className="text-white">FP16</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Quantized:</span>
                    <span className="text-green-400">Available</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-between items-center">
              <Button onClick={resetWorkflow} variant="outline" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Fine-tune Another Model
              </Button>
              <div className="flex gap-2">
                <Button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Model
                </Button>
                <Button className="btn-primary flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Deploy to API
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
