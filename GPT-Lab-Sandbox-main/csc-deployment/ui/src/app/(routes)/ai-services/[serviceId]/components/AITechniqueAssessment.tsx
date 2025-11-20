'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { Brain, Target, CheckCircle, Loader2, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface AITechniqueAssessmentProps {
  service: any;
}

export default function AITechniqueAssessment({ service }: AITechniqueAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [problemDomain, setProblemDomain] = useState<string>('');
  const [problemDescription, setProblemDescription] = useState('');
  const [dataType, setDataType] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const domains = [
    { id: 'nlp', name: 'Natural Language Processing', icon: '💬' },
    { id: 'cv', name: 'Computer Vision', icon: '👁️' },
    { id: 'prediction', name: 'Predictive Analytics', icon: '📈' },
    { id: 'recommendation', name: 'Recommendation Systems', icon: '🎯' }
  ];

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setCurrentStep(3);
    
    setTimeout(() => {
      setResults({
        recommended: 'Deep Learning with Transfer Learning',
        confidence: 92,
        techniques: [
          { name: 'Deep Learning', score: 92, pros: ['High accuracy', 'Handles complex patterns'] },
          { name: 'Random Forest', score: 78, pros: ['Interpretable', 'Fast training'] },
          { name: 'SVM', score: 65, pros: ['Good for small datasets', 'Robust'] }
        ]
      });
      setIsAnalyzing(false);
      setCurrentStep(4);
    }, 3000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Step 1: Problem Domain</h3>
            <div className="grid grid-cols-2 gap-4">
              {domains.map((domain) => (
                <Card
                  key={domain.id}
                  className={`p-4 cursor-pointer ${problemDomain === domain.id ? 'border-blue-500' : 'border-slate-600'}`}
                  onClick={() => setProblemDomain(domain.id)}
                >
                  <span className="text-2xl">{domain.icon}</span>
                  <h4 className="text-white">{domain.name}</h4>
                </Card>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setCurrentStep(2)} disabled={!problemDomain}>
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Step 2: Requirements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Problem Description</label>
                <Textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe your AI problem..."
                />
              </div>
              <div>
                <label className="block text-white mb-2">Data Type</label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Data</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="structured">Structured Data</SelectItem>
                    <SelectItem value="time-series">Time Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={startAnalysis} disabled={!problemDescription || !dataType}>
                Analyze <Brain className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl text-white">Analyzing Requirements...</h3>
            <p className="text-slate-400">AI is evaluating the best techniques for your problem</p>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">AI Technique Recommendations</h3>
              <div className="mb-4">
                <div className="text-2xl font-bold text-green-400">{results?.recommended}</div>
                <div className="text-slate-400">Recommended Solution ({results?.confidence}% confidence)</div>
              </div>
              
              <div className="space-y-3">
                {results?.techniques?.map((tech: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-medium">{tech.name}</h4>
                        <div className="flex gap-1 mt-1">
                          {tech.pros.map((pro: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{pro}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">{tech.score}%</div>
                        <div className="text-xs text-slate-400">Suitability</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
            
            <div className="flex justify-center">
              <Button onClick={() => setCurrentStep(1)} className="bg-purple-600">
                New Assessment
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-purple-200 text-lg">{service.description}</p>
          </div>
        </div>
      </Card>

      {renderStep()}
    </div>
  );
}
