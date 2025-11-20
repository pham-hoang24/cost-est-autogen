'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FileText, Upload, CheckCircle, Download, Brain } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface DocumentTemplateServiceProps {
  service: any;
}

export default function DocumentTemplateService({ service }: DocumentTemplateServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [results, setResults] = useState<any>(null);

  const templates = [
    { id: 'requirements', name: 'Software Requirements', icon: '📋' },
    { id: 'contract', name: 'Contract Analysis', icon: '📜' },
    { id: 'proposal', name: 'Project Proposal', icon: '💼' },
    { id: 'technical', name: 'Technical Specification', icon: '⚙️' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Simulate processing
      setTimeout(() => {
        setResults({
          extractedFields: {
            'Project Name': 'AI Customer Service Platform',
            'Requirements': ['Real-time chat', 'AI suggestions', 'Multi-language support'],
            'Timeline': '6 months',
            'Budget': '€50,000'
          },
          confidence: 89
        });
        setCurrentStep(3);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-purple-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Transform unstructured documents into organized, actionable data using advanced AI.
        </p>
      </Card>

      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-white mb-4">Step 1: Choose Template</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`p-4 cursor-pointer ${selectedTemplate === template.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600'}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <span className="text-2xl mb-2 block">{template.icon}</span>
                <h4 className="text-white font-medium">{template.name}</h4>
              </Card>
            ))}
          </div>
          
          {selectedTemplate && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Upload Document</h4>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="doc-upload"
                />
                <label htmlFor="doc-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Choose Document
                  </Button>
                </label>
              </div>
            </div>
          )}
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-6 text-center">
          <Brain className="w-16 h-16 animate-pulse text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl text-white">Processing Document...</h3>
          <p className="text-slate-400">AI is extracting structured data from your document</p>
        </Card>
      )}

      {currentStep === 3 && results && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <div>
                <h3 className="text-2xl font-semibold text-white">Processing Complete!</h3>
                <p className="text-green-200">Confidence: {results.confidence}%</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(results.extractedFields).map(([field, value]) => (
                <Card key={field} className="p-4 bg-slate-700">
                  <h4 className="text-white font-medium mb-2">{field}</h4>
                  <div className="text-slate-300">
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside">
                        {(value as string[]).map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    ) : (
                      <p>{value as string}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Export Results</h3>
            <div className="grid grid-cols-4 gap-4">
              {['JSON', 'CSV', 'PDF', 'Word'].map((format) => (
                <Button key={format} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {format}
                </Button>
              ))}
            </div>
          </Card>

          <div className="text-center">
            <Button onClick={() => setCurrentStep(1)} className="bg-purple-600">
              Process Another Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
