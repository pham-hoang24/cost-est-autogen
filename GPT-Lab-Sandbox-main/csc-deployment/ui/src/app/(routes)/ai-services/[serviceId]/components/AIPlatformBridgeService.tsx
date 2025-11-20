'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Brain, 
  Zap, 
  BarChart3, 
  MessageSquare,
  Search,
  Download,
  Play,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Code,
  FileText,
  Image
} from 'lucide-react';

interface AIPlatformBridgeServiceProps {
  service: any;
}

interface AIModel {
  id: string;
  name: string;
  platform: 'huggingface' | 'openai';
  task: string;
  description: string;
  capabilities: string[];
  pricing?: any;
  downloads?: number;
  likes?: number;
}

export default function AIPlatformBridgeService({ service }: AIPlatformBridgeServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<'huggingface' | 'openai' | 'both'>('both');
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Load models from both platforms
  useEffect(() => {
    loadAllModels();
  }, [selectedPlatform]);

  const loadAllModels = async () => {
    setLoadingModels(true);
    try {
      const models: AIModel[] = [];

      if (selectedPlatform === 'huggingface' || selectedPlatform === 'both') {
        const hfResponse = await fetch('http://localhost:8080/api/huggingface/models');
        const hfData = await hfResponse.json();
        if (hfData.success) {
          models.push(...hfData.data.map((model: any) => ({
            ...model,
            platform: 'huggingface' as const
          })));
        }
      }

      if (selectedPlatform === 'openai' || selectedPlatform === 'both') {
        const openaiResponse = await fetch('http://localhost:8080/api/openai/models');
        const openaiData = await openaiResponse.json();
        if (openaiData.success) {
          models.push(...openaiData.data.map((model: any) => ({
            ...model,
            platform: 'openai' as const
          })));
        }
      }

      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const runAITask = async () => {
    if (!selectedModel || !userInput.trim()) {
      alert('Please select a model and provide input');
      return;
    }

    setIsProcessing(true);
    try {
      const selectedModelData = availableModels.find(m => m.id === selectedModel);
      let response;

      if (selectedModelData?.platform === 'huggingface') {
        response = await fetch(`http://localhost:8080/api/huggingface/inference/${selectedModel}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: userInput })
        });
      } else if (selectedModelData?.platform === 'openai') {
        response = await fetch('http://localhost:8080/api/openai/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages: [{ role: 'user', content: userInput }],
            max_tokens: 200
          })
        });
      }

      const data = await response?.json();
      if (data?.success) {
        setResults({
          model: selectedModel,
          platform: selectedModelData?.platform,
          input: userInput,
          output: data.data,
          timestamp: new Date().toISOString(),
          demo: data.demo || false
        });
        setCurrentStep(4);
      } else {
        throw new Error(data?.message || 'AI task failed');
      }
    } catch (error) {
      console.error('AI task error:', error);
      alert('AI task failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setSelectedModel('');
    setUserInput('');
    setResults(null);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'huggingface': return '🤗';
      case 'openai': return '🤖';
      default: return '🔗';
    }
  };

  const getTaskIcon = (task: string) => {
    switch (task) {
      case 'text-classification': return <FileText className="w-4 h-4" />;
      case 'text-generation': return <MessageSquare className="w-4 h-4" />;
      case 'summarization': return <FileText className="w-4 h-4" />;
      case 'conversational': return <MessageSquare className="w-4 h-4" />;
      case 'embeddings': return <Search className="w-4 h-4" />;
      case 'image-generation': return <Image className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Platform Bridge</h2>
            <p className="text-blue-200">Connect with Hugging Face & OpenAI seamlessly</p>
          </div>
        </div>
        <p className="text-slate-300">
          Experience the power of both Hugging Face and OpenAI platforms through a unified interface. 
          Perfect for SMEs to access enterprise-grade AI capabilities without complexity.
        </p>
      </Card>

      {/* Step 1: Platform Selection */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 1: Choose AI Platform</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`p-4 cursor-pointer transition-all ${
                selectedPlatform === 'huggingface' 
                  ? 'border-2 border-orange-500 bg-orange-500/10' 
                  : 'border-2 border-border hover:border-slate-600'
              }`}
              onClick={() => setSelectedPlatform('huggingface')}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🤗</div>
                <h4 className="font-semibold text-white mb-2">Hugging Face</h4>
                <p className="text-slate-400 text-sm">Open-source models, NLP focus</p>
              </div>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-all ${
                selectedPlatform === 'openai' 
                  ? 'border-2 border-green-500 bg-green-500/10' 
                  : 'border-2 border-border hover:border-slate-600'
              }`}
              onClick={() => setSelectedPlatform('openai')}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🤖</div>
                <h4 className="font-semibold text-white mb-2">OpenAI</h4>
                <p className="text-slate-400 text-sm">GPT models, advanced reasoning</p>
              </div>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-all ${
                selectedPlatform === 'both' 
                  ? 'border-2 border-purple-500 bg-purple-500/10' 
                  : 'border-2 border-border hover:border-slate-600'
              }`}
              onClick={() => setSelectedPlatform('both')}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🔗</div>
                <h4 className="font-semibold text-white mb-2">Both Platforms</h4>
                <p className="text-slate-400 text-sm">Compare & choose best model</p>
              </div>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => setCurrentStep(2)}
              className="btn-primary flex items-center gap-2"
            >
              Next: Select Model <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Model Selection */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 2: Select AI Model</h3>
          <p className="text-slate-400 mb-6">
            Choose from {availableModels.length} available models across platforms
          </p>

          {loadingModels ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-slate-400">Loading models from AI platforms...</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {availableModels.map((model) => (
                <Card 
                  key={model.id} 
                  className={`p-4 cursor-pointer transition-all ${
                    selectedModel === model.id 
                      ? 'border-2 border-primary bg-primary/10' 
                      : 'border-2 border-border hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getPlatformIcon(model.platform)}</span>
                        <h4 className="font-semibold text-white">{model.name}</h4>
                        <Badge variant={model.platform === 'huggingface' ? 'yellow' : 'green'}>
                          {model.platform}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{model.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        {getTaskIcon(model.task)}
                        <Badge variant="secondary">{model.task}</Badge>
                        {model.downloads && (
                          <span className="text-xs text-slate-500">
                            {(model.downloads / 1000000).toFixed(0)}M downloads
                          </span>
                        )}
                        {model.likes && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {model.likes}
                          </span>
                        )}
                      </div>
                      {model.capabilities && (
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.slice(0, 3).map((cap: string) => (
                            <span key={cap} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedModel === model.id && (
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(1)} variant="outline">
              Back
            </Button>
            <Button 
              onClick={() => setCurrentStep(3)}
              disabled={!selectedModel}
              className="btn-primary flex items-center gap-2"
            >
              Next: Configure Task <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Task Configuration */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 3: Configure AI Task</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Selected Model: {availableModels.find(m => m.id === selectedModel)?.name}
              </label>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">
                  {getPlatformIcon(availableModels.find(m => m.id === selectedModel)?.platform || '')}
                </span>
                <Badge variant={availableModels.find(m => m.id === selectedModel)?.platform === 'huggingface' ? 'yellow' : 'green'}>
                  {availableModels.find(m => m.id === selectedModel)?.platform}
                </Badge>
                <Badge variant="secondary">
                  {availableModels.find(m => m.id === selectedModel)?.task}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Input Text
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your text for AI processing..."
                className="w-full h-32 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Example inputs based on model type */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2">Example Inputs:</h4>
              <div className="space-y-2 text-sm text-slate-300">
                {availableModels.find(m => m.id === selectedModel)?.task === 'text-classification' && (
                  <p>• "This movie was absolutely fantastic! Great acting and storyline."</p>
                )}
                {availableModels.find(m => m.id === selectedModel)?.task === 'text-generation' && (
                  <p>• "The future of artificial intelligence will"</p>
                )}
                {availableModels.find(m => m.id === selectedModel)?.task === 'summarization' && (
                  <p>• "Artificial intelligence (AI) is intelligence demonstrated by machines..."</p>
                )}
                {availableModels.find(m => m.id === selectedModel)?.capabilities?.includes('code-generation') && (
                  <p>• "Write a Python function to calculate fibonacci numbers"</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(2)} variant="outline">
              Back
            </Button>
            <Button 
              onClick={runAITask}
              disabled={!userInput.trim() || isProcessing}
              className="btn-primary flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run AI Task
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Results */}
      {currentStep === 4 && results && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold text-white">AI Task Complete!</h3>
              {results.demo && (
                <Badge variant="yellow">Demo Mode</Badge>
              )}
            </div>

            {/* Task Summary */}
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getPlatformIcon(results.platform)}</span>
                <h4 className="text-lg font-medium text-white">
                  {availableModels.find(m => m.id === results.model)?.name}
                </h4>
                <Badge variant={results.platform === 'huggingface' ? 'yellow' : 'green'}>
                  {results.platform}
                </Badge>
              </div>
              <div className="text-sm text-slate-300">
                Completed: {new Date(results.timestamp).toLocaleString()}
              </div>
            </div>

            {/* Input */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">Input:</h4>
              <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-slate-300">{results.input}</p>
              </div>
            </div>

            {/* Output */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">AI Response:</h4>
              <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-green-500">
                {results.platform === 'openai' && results.output.choices ? (
                  <div className="space-y-2">
                    <p className="text-slate-300">{results.output.choices[0].message.content}</p>
                    <div className="text-xs text-slate-500 mt-2">
                      Tokens: {results.output.usage?.total_tokens} | 
                      Model: {results.output.model}
                    </div>
                  </div>
                ) : Array.isArray(results.output) ? (
                  <div className="space-y-2">
                    {results.output.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-slate-700 rounded">
                        <span className="text-slate-300">
                          {item.label || item.generated_text || item.summary_text || JSON.stringify(item)}
                        </span>
                        {item.score && (
                          <Badge variant="secondary">{(item.score * 100).toFixed(1)}%</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-300">{JSON.stringify(results.output, null, 2)}</p>
                )}
              </div>
            </div>

            {/* Platform Comparison Insight */}
            <Card className="p-4 bg-slate-700 border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">🎯 Platform Insights</h4>
              <div className="space-y-2 text-sm text-slate-300">
                {results.platform === 'huggingface' && (
                  <>
                    <p>• ✅ Open-source model with transparent architecture</p>
                    <p>• 💰 Cost-effective for high-volume processing</p>
                    <p>• 🔧 Customizable and fine-tunable</p>
                  </>
                )}
                {results.platform === 'openai' && (
                  <>
                    <p>• 🧠 State-of-the-art reasoning capabilities</p>
                    <p>• ⚡ Optimized for quality and coherence</p>
                    <p>• 🎯 Excellent for complex, creative tasks</p>
                  </>
                )}
              </div>
            </Card>

            <div className="flex justify-between items-center">
              <Button onClick={resetWorkflow} variant="outline" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Try Another Model
              </Button>
              <div className="flex gap-2">
                <Button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Results
                </Button>
                <Button className="btn-primary flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Compare Platforms
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
