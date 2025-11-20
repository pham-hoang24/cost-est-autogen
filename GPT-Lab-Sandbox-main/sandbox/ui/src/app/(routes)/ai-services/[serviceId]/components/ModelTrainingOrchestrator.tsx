'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Upload, 
  Cpu, 
  BarChart3, 
  Download, 
  Play, 
  CheckCircle, 
  Settings,
  Monitor,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Pause,
  Square,
  RotateCcw
} from 'lucide-react';

interface ModelTrainingOrchestratorProps {
  service: any;
}

export default function ModelTrainingOrchestrator({ service }: ModelTrainingOrchestratorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [trainingConfig, setTrainingConfig] = useState({
    modelType: 'transformer',
    architecture: 'bert-base',
    dataset: '',
    batchSize: 32,
    learningRate: 0.0001,
    epochs: 10,
    gpuType: 'A100',
    gpuCount: 2
  });
  const [uploadedDataset, setUploadedDataset] = useState<File | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [trainingMetrics, setTrainingMetrics] = useState<any>(null);
  const [trainingResults, setTrainingResults] = useState<any>(null);

  const handleDatasetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDataset(file);
    }
  };

  const startTraining = async () => {
    setIsTraining(true);
    setCurrentStep(4);
    setTrainingProgress(0);
    setCurrentEpoch(0);

    // Simulate realistic training progress
    const trainingInterval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + Math.random() * 3;
        const newEpoch = Math.floor(newProgress / 10);
        setCurrentEpoch(newEpoch);
        
        // Update training metrics
        setTrainingMetrics({
          epoch: newEpoch,
          trainingLoss: (2.5 - (newProgress / 100) * 2 + Math.random() * 0.1).toFixed(4),
          validationLoss: (2.3 - (newProgress / 100) * 1.8 + Math.random() * 0.15).toFixed(4),
          accuracy: ((newProgress / 100) * 0.9 + 0.1 + Math.random() * 0.05).toFixed(3),
          learningRate: (trainingConfig.learningRate * Math.pow(0.95, newEpoch)).toExponential(2),
          gpuUtilization: (85 + Math.random() * 10).toFixed(1),
          memoryUsage: (12.4 + Math.random() * 2).toFixed(1),
          estimatedTimeRemaining: Math.max(0, Math.floor((100 - newProgress) * 2))
        });

        if (newProgress >= 100) {
          clearInterval(trainingInterval);
          setIsTraining(false);
          setTrainingResults({
            finalAccuracy: 0.934,
            finalLoss: 0.127,
            trainingTime: '2h 34m',
            totalCost: '$23.45',
            modelSize: '440MB',
            checkpoints: 10,
            bestEpoch: 8,
            convergenceAchieved: true
          });
          setCurrentStep(5);
          return 100;
        }
        return newProgress;
      });
    }, 800);
  };

  const pauseTraining = () => {
    setIsTraining(false);
    // In real implementation, this would pause the training job
  };

  const stopTraining = () => {
    setIsTraining(false);
    setCurrentStep(5);
    setTrainingResults({
      finalAccuracy: trainingMetrics?.accuracy || 0.856,
      finalLoss: trainingMetrics?.trainingLoss || 0.234,
      trainingTime: '1h 12m (stopped early)',
      totalCost: '$12.30',
      modelSize: '440MB',
      checkpoints: currentEpoch,
      bestEpoch: Math.max(1, currentEpoch - 1),
      convergenceAchieved: false,
      earlyStopped: true
    });
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setUploadedDataset(null);
    setIsTraining(false);
    setTrainingProgress(0);
    setCurrentEpoch(0);
    setTrainingMetrics(null);
    setTrainingResults(null);
  };

  const calculateEstimatedCost = () => {
    const gpuCostPerHour = trainingConfig.gpuType === 'A100' ? 3.20 : 
                          trainingConfig.gpuType === 'V100' ? 2.40 : 1.80;
    const estimatedHours = trainingConfig.epochs * 0.25; // Rough estimate
    return (gpuCostPerHour * trainingConfig.gpuCount * estimatedHours).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Model Training Orchestrator</h2>
            <p className="text-purple-200">Distributed training with GPU cluster management</p>
          </div>
        </div>
        <p className="text-slate-300">
          Professional-grade model training with automatic resource allocation, 
          real-time monitoring, and cost optimization.
        </p>
      </Card>

      {/* Step 1: Dataset Upload */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 1: Upload Training Dataset</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">
                Upload your training dataset
              </h4>
              <p className="text-slate-400 mb-4">
                Supported: CSV, JSON, Parquet, HDF5 (max 10GB)
              </p>
              <input
                type="file"
                accept=".csv,.json,.parquet,.h5,.hdf5"
                onChange={handleDatasetUpload}
                className="hidden"
                id="dataset-upload"
              />
              <label htmlFor="dataset-upload">
                <Button className="btn-primary cursor-pointer">
                  Choose Dataset
                </Button>
              </label>
            </div>
            
            {uploadedDataset && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Dataset uploaded successfully!</span>
                </div>
                <div className="text-green-300 text-sm mt-1">
                  File: {uploadedDataset.name} ({(uploadedDataset.size / 1024 / 1024).toFixed(2)} MB)
                </div>
                <div className="mt-3 p-3 bg-slate-700 rounded text-sm text-slate-300">
                  <strong>Auto-detected:</strong> 45,000 samples, 128 features, Classification task
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!uploadedDataset}
                className="btn-primary"
              >
                Next: Configure Model
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Model Configuration */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 2: Configure Model Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Model Type</label>
                <select 
                  value={trainingConfig.modelType}
                  onChange={(e) => setTrainingConfig({...trainingConfig, modelType: e.target.value})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="transformer">Transformer (BERT/GPT)</option>
                  <option value="cnn">Convolutional Neural Network</option>
                  <option value="lstm">LSTM/RNN</option>
                  <option value="custom">Custom Architecture</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Base Architecture</label>
                <select 
                  value={trainingConfig.architecture}
                  onChange={(e) => setTrainingConfig({...trainingConfig, architecture: e.target.value})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="bert-base">BERT Base (110M params)</option>
                  <option value="bert-large">BERT Large (340M params)</option>
                  <option value="roberta-base">RoBERTa Base (125M params)</option>
                  <option value="distilbert">DistilBERT (66M params)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Batch Size</label>
                <select 
                  value={trainingConfig.batchSize}
                  onChange={(e) => setTrainingConfig({...trainingConfig, batchSize: parseInt(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={16}>16 (Memory efficient)</option>
                  <option value={32}>32 (Balanced)</option>
                  <option value={64}>64 (Fast training)</option>
                  <option value={128}>128 (Large GPU only)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Learning Rate</label>
                <select 
                  value={trainingConfig.learningRate}
                  onChange={(e) => setTrainingConfig({...trainingConfig, learningRate: parseFloat(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={0.00001}>1e-5 (Conservative)</option>
                  <option value={0.0001}>1e-4 (Recommended)</option>
                  <option value={0.001}>1e-3 (Aggressive)</option>
                  <option value={0.01}>1e-2 (Very aggressive)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Training Epochs</label>
                <select 
                  value={trainingConfig.epochs}
                  onChange={(e) => setTrainingConfig({...trainingConfig, epochs: parseInt(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={5}>5 epochs (Quick test)</option>
                  <option value={10}>10 epochs (Standard)</option>
                  <option value={20}>20 epochs (Thorough)</option>
                  <option value={50}>50 epochs (Research)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">GPU Type</label>
                <select 
                  value={trainingConfig.gpuType}
                  onChange={(e) => setTrainingConfig({...trainingConfig, gpuType: e.target.value})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="A100">NVIDIA A100 (80GB) - $3.20/hr</option>
                  <option value="V100">NVIDIA V100 (32GB) - $2.40/hr</option>
                  <option value="T4">NVIDIA T4 (16GB) - $1.80/hr</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">GPU Count</label>
                <select 
                  value={trainingConfig.gpuCount}
                  onChange={(e) => setTrainingConfig({...trainingConfig, gpuCount: parseInt(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={1}>1 GPU (Single node)</option>
                  <option value={2}>2 GPUs (Data parallel)</option>
                  <option value={4}>4 GPUs (Multi-node)</option>
                  <option value={8}>8 GPUs (Large scale)</option>
                </select>
              </div>

              {/* Cost Estimation */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Estimated Cost</span>
                </div>
                <div className="text-2xl font-bold text-white">${calculateEstimatedCost()}</div>
                <div className="text-sm text-blue-300">
                  {trainingConfig.gpuCount}x {trainingConfig.gpuType} × ~{(trainingConfig.epochs * 0.25).toFixed(1)}h
                </div>
              </div>
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
              Next: Review Configuration
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Review & Start */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 3: Review Training Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-4 bg-slate-700 border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">Model Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Architecture:</span>
                  <span className="text-white">{trainingConfig.architecture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Batch Size:</span>
                  <span className="text-white">{trainingConfig.batchSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Learning Rate:</span>
                  <span className="text-white">{trainingConfig.learningRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Epochs:</span>
                  <span className="text-white">{trainingConfig.epochs}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-700 border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">Resource Allocation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">GPU Type:</span>
                  <span className="text-white">{trainingConfig.gpuType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">GPU Count:</span>
                  <span className="text-white">{trainingConfig.gpuCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Estimated Cost:</span>
                  <span className="text-green-400 font-medium">${calculateEstimatedCost()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Est. Duration:</span>
                  <span className="text-white">{(trainingConfig.epochs * 0.25).toFixed(1)}h</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Training Pipeline</span>
            </div>
            <div className="text-sm text-yellow-300 space-y-1">
              <p>1. Dataset validation and preprocessing</p>
              <p>2. Model initialization and GPU allocation</p>
              <p>3. Distributed training with checkpointing</p>
              <p>4. Real-time monitoring and optimization</p>
              <p>5. Model evaluation and artifact generation</p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setCurrentStep(2)} variant="outline">
              Back
            </Button>
            <Button 
              onClick={startTraining}
              className="btn-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Training
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Training in Progress */}
      {currentStep === 4 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Training in Progress</h3>
            <div className="flex gap-2">
              <Button 
                onClick={pauseTraining}
                variant="outline"
                className="flex items-center gap-2"
                disabled={!isTraining}
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
              <Button 
                onClick={stopTraining}
                variant="outline"
                className="flex items-center gap-2 text-red-400 border-red-400 hover:bg-red-500/10"
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{currentEpoch}/{trainingConfig.epochs}</div>
              <div className="text-sm text-purple-300">Epochs</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{trainingProgress.toFixed(1)}%</div>
              <div className="text-sm text-blue-300">Progress</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{trainingMetrics?.accuracy || '0.000'}</div>
              <div className="text-sm text-green-300">Accuracy</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{trainingMetrics?.estimatedTimeRemaining || '--'}m</div>
              <div className="text-sm text-yellow-300">ETA</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Training Progress</span>
              <span className="text-white">{trainingProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>

          {/* Live Metrics */}
          {trainingMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4 bg-slate-700 border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3">Training Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Training Loss:</span>
                    <span className="text-white">{trainingMetrics.trainingLoss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Validation Loss:</span>
                    <span className="text-white">{trainingMetrics.validationLoss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Current LR:</span>
                    <span className="text-white">{trainingMetrics.learningRate}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-700 border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3">Resource Usage</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">GPU Utilization:</span>
                    <span className="text-green-400">{trainingMetrics.gpuUtilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Memory Usage:</span>
                    <span className="text-blue-400">{trainingMetrics.memoryUsage} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Current Cost:</span>
                    <span className="text-yellow-400">${((trainingProgress / 100) * parseFloat(calculateEstimatedCost())).toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Training Log */}
          <Card className="p-4 bg-slate-700 border-slate-600">
            <h4 className="text-lg font-semibold text-white mb-3">Training Log</h4>
            <div className="bg-black rounded p-3 font-mono text-xs text-green-400 h-32 overflow-y-auto">
              <div>🚀 Training job started on GPU cluster</div>
              <div>📊 Dataset loaded: 45,000 samples</div>
              <div>🔧 Model initialized: {trainingConfig.architecture}</div>
              <div>⚡ GPU allocation: {trainingConfig.gpuCount}x {trainingConfig.gpuType}</div>
              {trainingMetrics && (
                <>
                  <div>📈 Epoch {trainingMetrics.epoch}: Loss={trainingMetrics.trainingLoss}, Acc={trainingMetrics.accuracy}</div>
                  <div>💾 Checkpoint saved at epoch {trainingMetrics.epoch}</div>
                  <div>🔄 Learning rate: {trainingMetrics.learningRate}</div>
                </>
              )}
            </div>
          </Card>
        </Card>
      )}

      {/* Step 5: Training Complete */}
      {currentStep === 5 && trainingResults && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold text-white">
                Training {trainingResults.earlyStopped ? 'Stopped' : 'Complete'}!
              </h3>
              {trainingResults.convergenceAchieved && (
                <Badge variant="green">Converged</Badge>
              )}
            </div>

            {/* Final Results */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{trainingResults.finalAccuracy}</div>
                <div className="text-sm text-green-300">Final Accuracy</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{trainingResults.finalLoss}</div>
                <div className="text-sm text-blue-300">Final Loss</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{trainingResults.trainingTime}</div>
                <div className="text-sm text-purple-300">Training Time</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{trainingResults.totalCost}</div>
                <div className="text-sm text-yellow-300">Total Cost</div>
              </div>
            </div>

            {/* Model Details */}
            <Card className="p-4 bg-slate-700 border-slate-600 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">Model Artifacts</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Model Size:</span>
                    <span className="text-white">{trainingResults.modelSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Checkpoints:</span>
                    <span className="text-white">{trainingResults.checkpoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Best Epoch:</span>
                    <span className="text-white">{trainingResults.bestEpoch}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Format:</span>
                    <span className="text-white">PyTorch (.pt)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Precision:</span>
                    <span className="text-white">FP16</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Quantized:</span>
                    <span className="text-white">Available</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="p-4 bg-slate-700 border-slate-600 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">Recommended Next Steps</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Deploy model to production API endpoint</span>
                </li>
                <li className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Run comprehensive benchmarking suite</span>
                </li>
                <li className="flex items-start gap-2">
                  <Monitor className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Set up monitoring and alerting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Settings className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Configure auto-scaling policies</span>
                </li>
              </ul>
            </Card>

            <div className="flex justify-between items-center">
              <Button onClick={resetWorkflow} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Train New Model
              </Button>
              <div className="flex gap-2">
                <Button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Model
                </Button>
                <Button className="btn-primary flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Deploy Model
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
