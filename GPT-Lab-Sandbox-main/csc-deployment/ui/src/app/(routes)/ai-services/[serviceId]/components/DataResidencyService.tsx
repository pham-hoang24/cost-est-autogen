'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { 
  Globe, 
  MapPin, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Download,
  Settings,
  Database
} from 'lucide-react';
import { Badge } from '@/components/Badge';

interface DataResidencyServiceProps {
  service: any;
}

export default function DataResidencyService({ service }: DataResidencyServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [complianceReqs, setComplianceReqs] = useState<string[]>(['gdpr']);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [results, setResults] = useState<any>(null);

  const availableRegions = [
    {
      id: 'eu-west',
      name: 'EU West (Ireland)',
      compliance: ['GDPR', 'EU AI Act'],
      cost: '€0.08/GB/month'
    },
    {
      id: 'eu-central',
      name: 'EU Central (Frankfurt)',
      compliance: ['GDPR', 'BDSG'],
      cost: '€0.09/GB/month'
    },
    {
      id: 'us-east',
      name: 'US East (Virginia)',
      compliance: ['SOC 2', 'CCPA'],
      cost: '€0.06/GB/month'
    },
    {
      id: 'canada',
      name: 'Canada Central',
      compliance: ['PIPEDA', 'SOC 2'],
      cost: '€0.07/GB/month'
    }
  ];

  const toggleRegion = (regionId: string) => {
    setSelectedRegions(prev => 
      prev.includes(regionId)
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    );
  };

  const configureResidency = () => {
    setIsConfiguring(true);
    setCurrentStep(2);
    
    setTimeout(() => {
      setResults({
        regions_configured: selectedRegions.length,
        compliance_frameworks: complianceReqs.length,
        monthly_cost: selectedRegions.length * 150,
        setup_complete: true
      });
      setIsConfiguring(false);
      setCurrentStep(3);
    }, 3000);
  };

  const resetConfiguration = () => {
    setCurrentStep(1);
    setSelectedRegions([]);
    setResults(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 1: Select Data Storage Regions</h3>
            <p className="text-slate-400 mb-6">
              Choose regions for data storage based on compliance requirements and performance needs.
            </p>
            
            <div className="space-y-4">
              {availableRegions.map((region) => (
                <Card
                  key={region.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedRegions.includes(region.id)
                      ? 'border-2 border-green-500 bg-green-500/10'
                      : 'border-2 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => toggleRegion(region.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-green-400" />
                      <div>
                        <h5 className="text-white font-medium">{region.name}</h5>
                        <Badge variant="secondary" className="text-xs">{region.cost}</Badge>
                      </div>
                    </div>
                    {selectedRegions.includes(region.id) && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {region.compliance.map((comp, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{comp}</Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={configureResidency}
                disabled={selectedRegions.length === 0}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure Data Residency
              </Button>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 2: Configuring Data Residency...</h3>
            <p className="text-slate-400 mb-6">
              Setting up data storage across {selectedRegions.length} regions with compliance monitoring
            </p>
            
            <div className="w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Regions</div>
                <div className="text-white font-medium">{selectedRegions.length}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Compliance</div>
                <div className="text-green-400 font-medium">{complianceReqs.length}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Progress</div>
                <div className="text-purple-400 font-medium">78%</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Status</div>
                <div className="text-blue-400 font-medium">Configuring</div>
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
              <div className="flex items-center gap-4 mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
                <div>
                  <h3 className="text-2xl font-semibold text-white">Data Residency Configured!</h3>
                  <p className="text-green-200">
                    Multi-region setup complete with compliance monitoring
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Globe className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.regions_configured}</div>
                  <div className="text-sm text-slate-400">Regions</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.compliance_frameworks}</div>
                  <div className="text-sm text-slate-400">Compliance</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Database className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">Multi-Region</div>
                  <div className="text-sm text-slate-400">Setup</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <span className="text-xl">💰</span>
                  <div className="text-xl font-bold text-white">€{results?.monthly_cost}</div>
                  <div className="text-sm text-slate-400">Monthly Cost</div>
                </Card>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configuration Summary</h3>
              <div className="space-y-3">
                {selectedRegions.map((regionId, index) => {
                  const region = availableRegions.find(r => r.id === regionId);
                  return (
                    <Card key={index} className="p-4 bg-slate-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="text-white font-medium">{region?.name}</h5>
                          <div className="flex gap-1 mt-1">
                            {region?.compliance.map((comp, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{comp}</Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant="green">Active</Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>

            <div className="flex justify-center gap-4">
              <Button onClick={resetConfiguration} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                New Configuration
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Config
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manage Regions
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
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-green-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Intelligent data residency management with automated compliance monitoring. 
          Choose optimal storage locations while meeting regulatory requirements.
        </p>
      </Card>

      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-green-500' : 'bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Select Regions</span>
          <span>Configure</span>
          <span>Results</span>
        </div>
      </Card>

      {renderStep()}
    </div>
  );
}
