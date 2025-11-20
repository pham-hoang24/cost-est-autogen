'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DollarSign, Calculator, CheckCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface CostEstimationServiceProps {
  service: any;
}

export default function CostEstimationService({ service }: CostEstimationServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectType, setProjectType] = useState('');
  const [estimation, setEstimation] = useState<any>(null);

  const projectTypes = [
    { id: 'web-app', name: 'Web Application', cost: '€25,000 - €75,000', icon: '🌐' },
    { id: 'mobile-app', name: 'Mobile App', cost: '€30,000 - €100,000', icon: '📱' },
    { id: 'ai-ml', name: 'AI/ML Project', cost: '€50,000 - €200,000', icon: '🧠' },
    { id: 'enterprise', name: 'Enterprise System', cost: '€100,000 - €500,000', icon: '🏢' }
  ];

  const generateEstimation = () => {
    const selectedType = projectTypes.find(t => t.id === projectType);
    setTimeout(() => {
      setEstimation({
        totalCost: 75000,
        timeline: '6 months',
        team: '5 developers',
        confidence: 87,
        breakdown: [
          { category: 'Development', cost: 48750, percentage: 65 },
          { category: 'Design', cost: 11250, percentage: 15 },
          { category: 'Testing', cost: 9000, percentage: 12 },
          { category: 'Management', cost: 6000, percentage: 8 }
        ]
      });
      setCurrentStep(3);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-green-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Get accurate project cost estimations powered by AI analysis.
        </p>
      </Card>

      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-white mb-4">Select Project Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {projectTypes.map((type) => (
              <Card
                key={type.id}
                className={`p-4 cursor-pointer ${projectType === type.id ? 'border-green-500 bg-green-500/10' : 'border-slate-600'}`}
                onClick={() => setProjectType(type.id)}
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <h4 className="text-white font-medium">{type.name}</h4>
                <p className="text-green-400 text-sm">{type.cost}</p>
              </Card>
            ))}
          </div>
          
          {projectType && (
            <div className="text-center">
              <Button onClick={generateEstimation} className="bg-green-600">
                <Calculator className="w-4 h-4 mr-2" />
                Generate Cost Estimation
              </Button>
            </div>
          )}
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-6 text-center">
          <Calculator className="w-16 h-16 animate-pulse text-green-500 mx-auto mb-4" />
          <h3 className="text-xl text-white">Calculating Costs...</h3>
          <p className="text-slate-400">AI is analyzing your project requirements</p>
        </Card>
      )}

      {currentStep === 3 && estimation && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <div>
                <h3 className="text-2xl font-semibold text-white">Cost Estimation Complete</h3>
                <p className="text-green-200">Confidence: {estimation.confidence}%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-slate-700 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">€{estimation.totalCost.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Total Cost</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{estimation.timeline}</div>
                <div className="text-sm text-slate-400">Timeline</div>
              </Card>
              <Card className="p-4 bg-slate-700 text-center">
                <Calculator className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{estimation.team}</div>
                <div className="text-sm text-slate-400">Team Size</div>
              </Card>
            </div>

            <Card className="p-4 bg-slate-700">
              <h4 className="text-lg font-semibold text-white mb-3">Cost Breakdown</h4>
              <div className="space-y-2">
                {estimation.breakdown.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-300">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.percentage}%</Badge>
                      <span className="text-white font-medium">€{item.cost.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="text-center">
              <Button onClick={() => setCurrentStep(1)} className="bg-green-600">
                New Estimation
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
