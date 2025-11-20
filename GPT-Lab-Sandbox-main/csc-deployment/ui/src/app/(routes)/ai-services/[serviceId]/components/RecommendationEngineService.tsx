'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Target, Upload, Star, TrendingUp, CheckCircle, BarChart3, Users } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface RecommendationEngineServiceProps {
  service: any;
}

export default function RecommendationEngineService({ service }: RecommendationEngineServiceProps) {
  const [selectedType, setSelectedType] = useState('');
  const [uploadedData, setUploadedData] = useState<File | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);

  const recommendationTypes = [
    { id: 'products', name: 'Product Recommendations', description: 'E-commerce product suggestions', icon: '🛍️' },
    { id: 'content', name: 'Content Recommendations', description: 'Articles, videos, media', icon: '📺' },
    { id: 'people', name: 'People Recommendations', description: 'Social connections, networking', icon: '👥' },
    { id: 'jobs', name: 'Job Recommendations', description: 'Career opportunities matching', icon: '💼' }
  ];

  const handleDataUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedData(file);
    }
  };

  const trainModel = () => {
    setIsTraining(true);
    
    setTimeout(() => {
      const mockRecommendations = {
        products: {
          model: 'Collaborative Filtering',
          accuracy: 0.84,
          recommendations: [
            { item: 'iPhone 15 Pro', score: 0.92, reason: 'Similar users bought this' },
            { item: 'AirPods Pro', score: 0.87, reason: 'Frequently bought together' },
            { item: 'MacBook Air', score: 0.79, reason: 'Based on your browsing history' }
          ],
          metrics: {
            precision: 0.82,
            recall: 0.78,
            coverage: 0.91
          }
        },
        content: {
          model: 'Deep Learning',
          accuracy: 0.79,
          recommendations: [
            { item: 'AI in Healthcare Documentary', score: 0.94, reason: 'Matches your interests' },
            { item: 'Machine Learning Course', score: 0.88, reason: 'Popular in your field' },
            { item: 'Tech Startup Podcast', score: 0.82, reason: 'Similar content consumed' }
          ],
          metrics: {
            engagement: 0.76,
            clickThrough: 0.23,
            watchTime: '8.4 minutes'
          }
        },
        people: {
          model: 'Graph Neural Network',
          accuracy: 0.71,
          recommendations: [
            { item: 'Dr. Sarah Chen - AI Researcher', score: 0.89, reason: 'Shared research interests' },
            { item: 'Mark Johnson - Data Scientist', score: 0.84, reason: 'Similar career path' },
            { item: 'Lisa Wang - ML Engineer', score: 0.78, reason: 'Mutual connections' }
          ],
          metrics: {
            connectionRate: 0.34,
            messageResponse: 0.67,
            networkGrowth: '12% monthly'
          }
        }
      };
      
      setRecommendations(mockRecommendations[selectedType as keyof typeof mockRecommendations]);
      setIsTraining(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-orange-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Build personalized recommendation systems with collaborative filtering and deep learning.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Configure Recommendation System</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-white mb-2">Recommendation Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendationTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`p-4 cursor-pointer ${selectedType === type.id ? 'border-orange-500 bg-orange-500/10' : 'border-slate-600'}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <span className="text-2xl mb-2 block">{type.icon}</span>
                  <h4 className="text-white font-medium">{type.name}</h4>
                  <p className="text-slate-400 text-sm">{type.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {selectedType && (
            <div>
              <label className="block text-white mb-2">Upload Training Data</label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleDataUpload}
                  className="hidden"
                  id="data-upload"
                />
                <label htmlFor="data-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Upload Dataset
                  </Button>
                </label>
                <p className="text-slate-500 text-xs mt-2">CSV or JSON format with user-item interactions</p>
              </div>

              {uploadedData && (
                <Card className="p-3 bg-slate-700 mt-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">{uploadedData.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(uploadedData.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                </Card>
              )}
            </div>
          )}

          <Button 
            onClick={trainModel}
            disabled={!selectedType || !uploadedData || isTraining}
            className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
          >
            {isTraining ? (
              <>
                <Target className="w-4 h-4 animate-pulse" />
                Training Model...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Train Recommendation Model
              </>
            )}
          </Button>
        </div>
      </Card>

      {recommendations && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">Model Training Complete!</h3>
                <p className="text-green-200">Algorithm: {recommendations.model}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-slate-700 text-center">
                <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{(recommendations.accuracy * 100).toFixed(1)}%</div>
                <div className="text-sm text-slate-400">Model Accuracy</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{recommendations.recommendations?.length || 0}</div>
                <div className="text-sm text-slate-400">Recommendations</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">
                  {Object.keys(recommendations.metrics || {}).length}
                </div>
                <div className="text-sm text-slate-400">Performance Metrics</div>
              </Card>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Sample Recommendations</h3>
            <div className="space-y-3">
              {recommendations.recommendations?.map((rec: any, index: number) => (
                <Card key={index} className="p-4 bg-slate-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">{rec.item}</h4>
                      <p className="text-slate-400 text-sm">{rec.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 font-bold">{(rec.score * 100).toFixed(1)}%</div>
                      <div className="text-xs text-slate-400">Match Score</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(recommendations.metrics || {}).map(([metric, value]) => (
                <Card key={metric} className="p-3 bg-slate-700 text-center">
                  <div className="text-lg font-bold text-white">
                    {typeof value === 'number' ? (value < 1 ? (value * 100).toFixed(1) + '%' : value.toFixed(1)) : String(value)}
                  </div>
                  <div className="text-sm text-slate-400 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</div>
                </Card>
              ))}
            </div>
          </Card>

          <div className="flex gap-4">
            <Button className="bg-orange-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Deploy Model
            </Button>
            <Button variant="outline" onClick={() => setRecommendations(null)}>
              Train New Model
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
