'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Play, 
  Upload, 
  Download,
  Settings,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Database,
  Shield,
  FileText,
  Zap
} from 'lucide-react';

interface UniversalServiceInterfaceProps {
  service: any;
}

export default function UniversalServiceInterface({ service }: UniversalServiceInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const getServiceIcon = () => {
    switch (service?.service_type) {
      case 'anomaly_detection': return <AlertTriangle className="w-8 h-8 text-red-400" />;
      case 'compute': return <Cpu className="w-8 h-8 text-blue-400" />;
      case 'storage': return <Database className="w-8 h-8 text-green-400" />;
      case 'code_analysis': return <FileText className="w-8 h-8 text-purple-400" />;
      case 'legal_ai': return <Shield className="w-8 h-8 text-blue-400" />;
      default: return <Zap className="w-8 h-8 text-gray-400" />;
    }
  };

  const startDemo = () => {
    setIsProcessing(true);
    setCurrentStep(2);
    
    setTimeout(() => {
      setResults({
        success: true,
        message: `${service?.name} demo completed successfully!`,
        metrics: {
          processingTime: '2.3 seconds',
          accuracy: '94.7%',
          cost: '$0.15'
        }
      });
      setIsProcessing(false);
      setCurrentStep(3);
    }, 3000);
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setResults(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Service Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            {getServiceIcon()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{service?.name || 'AI Service'}</h2>
            <p className="text-blue-200">{service?.description || 'Advanced AI service'}</p>
          </div>
        </div>
        <Badge variant="green">Active Service</Badge>
      </Card>

      {/* Step 1: Introduction */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Service Overview</h3>
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">What this service does:</h4>
              <p className="text-slate-300">{service?.description}</p>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Key Features:</h4>
              <ul className="text-slate-300 space-y-1">
                <li>• Professional-grade AI implementation</li>
                <li>• EU AI Act and GDPR compliant</li>
                <li>• Real-time processing capabilities</li>
                <li>• Enterprise security standards</li>
              </ul>
            </div>

            <div className="text-center">
              <Button onClick={startDemo} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 mx-auto">
                <Play className="w-4 h-4" />
                Start Interactive Demo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Processing */}
      {currentStep === 2 && (
        <Card className="p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Running Service Demo...</h3>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-400">Processing your request with {service?.name}...</p>
        </Card>
      )}

      {/* Step 3: Results */}
      {currentStep === 3 && results && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Demo Complete!
          </h3>
          
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 font-medium">{results.message}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-white">{results.metrics.processingTime}</div>
                <div className="text-sm text-slate-400">Processing Time</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-green-400">{results.metrics.accuracy}</div>
                <div className="text-sm text-slate-400">Accuracy</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-blue-400">{results.metrics.cost}</div>
                <div className="text-sm text-slate-400">Cost</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={resetDemo} className="bg-blue-600 hover:bg-blue-700 text-white">
                Run Another Demo
              </Button>
              <Button className="bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Results
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
