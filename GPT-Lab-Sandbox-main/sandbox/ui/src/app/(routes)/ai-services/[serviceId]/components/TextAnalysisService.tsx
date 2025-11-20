'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { MessageSquare, Brain, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface TextAnalysisServiceProps {
  service: any;
}

export default function TextAnalysisService({ service }: TextAnalysisServiceProps) {
  const [inputText, setInputText] = useState('');
  const [analysisType, setAnalysisType] = useState('sentiment');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analysisTypes = [
    { id: 'sentiment', name: 'Sentiment Analysis', description: 'Positive, negative, neutral detection' },
    { id: 'emotion', name: 'Emotion Detection', description: 'Joy, anger, fear, sadness, surprise' },
    { id: 'topics', name: 'Topic Modeling', description: 'Extract main themes and topics' },
    { id: 'entities', name: 'Named Entity Recognition', description: 'People, places, organizations' }
  ];

  const analyzeText = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const mockResults = {
        sentiment: {
          overall: 'Positive',
          confidence: 0.89,
          scores: { positive: 0.89, negative: 0.08, neutral: 0.03 },
          breakdown: [
            { sentence: 'This product is amazing!', sentiment: 'Positive', score: 0.95 },
            { sentence: 'I love the features.', sentiment: 'Positive', score: 0.92 },
            { sentence: 'The price could be better.', sentiment: 'Negative', score: 0.72 }
          ]
        },
        emotion: {
          primary: 'Joy',
          confidence: 0.84,
          scores: { joy: 0.84, trust: 0.12, anticipation: 0.04 }
        },
        topics: {
          topics: ['Product Quality', 'User Experience', 'Pricing'],
          keywords: ['amazing', 'features', 'love', 'price', 'better']
        },
        entities: {
          entities: [
            { text: 'Apple', type: 'ORG', confidence: 0.95 },
            { text: 'iPhone', type: 'PRODUCT', confidence: 0.92 }
          ]
        }
      };
      
      setResults(mockResults[analysisType as keyof typeof mockResults]);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-green-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Advanced NLP processing with sentiment analysis, emotion detection, and entity recognition.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Text Analysis</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Analysis Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {analysisTypes.map((type) => (
                <Button
                  key={type.id}
                  onClick={() => setAnalysisType(type.id)}
                  variant={analysisType === type.id ? 'primary' : 'outline'}
                  className="text-sm"
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Input Text</label>
            <Textarea
              placeholder="Enter text to analyze..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={analyzeText}
            disabled={!inputText.trim() || isAnalyzing}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-4 h-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Analyze Text
              </>
            )}
          </Button>
        </div>
      </Card>

      {results && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Analysis Results</h3>
          
          {analysisType === 'sentiment' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-green-400">{results.overall}</div>
                <Badge variant="secondary">Confidence: {(results.confidence * 100).toFixed(1)}%</Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-3 bg-slate-700 text-center">
                  <div className="text-green-400 font-bold">{(results.scores.positive * 100).toFixed(1)}%</div>
                  <div className="text-sm text-slate-400">Positive</div>
                </Card>
                <Card className="p-3 bg-slate-700 text-center">
                  <div className="text-red-400 font-bold">{(results.scores.negative * 100).toFixed(1)}%</div>
                  <div className="text-sm text-slate-400">Negative</div>
                </Card>
                <Card className="p-3 bg-slate-700 text-center">
                  <div className="text-slate-400 font-bold">{(results.scores.neutral * 100).toFixed(1)}%</div>
                  <div className="text-sm text-slate-400">Neutral</div>
                </Card>
              </div>

              {results.breakdown && (
                <div className="space-y-2">
                  <h4 className="text-white font-medium">Sentence-by-Sentence Analysis:</h4>
                  {results.breakdown.map((item: any, index: number) => (
                    <Card key={index} className="p-3 bg-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">"{item.sentence}"</span>
                        <Badge variant={item.sentiment === 'Positive' ? 'green' : item.sentiment === 'Negative' ? 'red' : 'gray'}>
                          {item.sentiment} ({(item.score * 100).toFixed(0)}%)
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {analysisType === 'emotion' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-yellow-400">{results.primary}</div>
                <Badge variant="secondary">Confidence: {(results.confidence * 100).toFixed(1)}%</Badge>
              </div>
              
              <div className="space-y-2">
                {Object.entries(results.scores).map(([emotion, score]) => (
                  <div key={emotion} className="flex justify-between items-center">
                    <span className="text-white capitalize">{emotion}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${(score as number) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-300 text-sm">{((score as number) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button className="bg-green-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Detailed Report
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
