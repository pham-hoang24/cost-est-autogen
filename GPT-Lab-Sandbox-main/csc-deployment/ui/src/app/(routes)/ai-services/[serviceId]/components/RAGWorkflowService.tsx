'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Search, Upload, MessageSquare, CheckCircle, Brain, FileText } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface RAGWorkflowServiceProps {
  service: any;
}

export default function RAGWorkflowService({ service }: RAGWorkflowServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexed, setIndexed] = useState(false);
  const [query, setQuery] = useState('');
  const [ragResponse, setRagResponse] = useState<any>(null);

  const handleDocUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedDocs(files);
  };

  const startIndexing = () => {
    setIsIndexing(true);
    
    setTimeout(() => {
      setIndexed(true);
      setIsIndexing(false);
      setCurrentStep(2);
    }, 3000);
  };

  const askQuestion = () => {
    if (!query.trim()) return;
    
    setTimeout(() => {
      setRagResponse({
        answer: "Based on the uploaded documents, the main requirements for the AI system include real-time processing capabilities, GDPR compliance, and integration with existing CRM systems. The technical specifications mention using cloud infrastructure with auto-scaling capabilities.",
        confidence: 0.87,
        sources: [
          { document: 'Technical_Requirements.pdf', page: 3, relevance: 0.92 },
          { document: 'System_Design.docx', page: 7, relevance: 0.84 },
          { document: 'Compliance_Guide.pdf', page: 12, relevance: 0.78 }
        ],
        relatedQuestions: [
          'What are the specific GDPR compliance requirements?',
          'How should the auto-scaling be implemented?',
          'What CRM systems need integration?'
        ]
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-purple-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Retrieval-Augmented Generation for intelligent document Q&A and knowledge extraction.
        </p>
      </Card>

      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 1: Upload Knowledge Base</h3>
          
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center mb-6">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">Upload Documents</h4>
            <p className="text-slate-400 mb-4">PDF, DOCX, TXT files (multiple files supported)</p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              multiple
              onChange={handleDocUpload}
              className="hidden"
              id="docs-upload"
            />
            <label htmlFor="docs-upload">
              <Button variant="outline" className="cursor-pointer">
                Choose Documents
              </Button>
            </label>
          </div>

          {uploadedDocs.length > 0 && (
            <Card className="p-4 bg-slate-700 mb-6">
              <h4 className="text-white font-medium mb-3">Uploaded Documents ({uploadedDocs.length})</h4>
              <div className="space-y-2">
                {uploadedDocs.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-slate-600 rounded">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">{doc.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button 
            onClick={startIndexing}
            disabled={uploadedDocs.length === 0 || isIndexing}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            {isIndexing ? (
              <>
                <Brain className="w-4 h-4 animate-pulse" />
                Creating Knowledge Base...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Create Knowledge Base
              </>
            )}
          </Button>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-xl font-semibold text-white">Knowledge Base Ready!</h3>
              <p className="text-green-200">{uploadedDocs.length} documents indexed and searchable</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Ask a Question</label>
              <div className="flex gap-2">
                <Input
                  placeholder="What would you like to know about your documents?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={askQuestion} className="bg-purple-600">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['What are the main requirements?', 'What is the budget?', 'What are the risks?'].map((q) => (
                <Button
                  key={q}
                  onClick={() => setQuery(q)}
                  variant="outline"
                  className="text-sm"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

          {ragResponse && (
            <Card className="p-4 bg-slate-700 mt-6">
              <div className="flex items-start gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-purple-400 mt-1" />
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-2">AI Response</h4>
                  <p className="text-slate-300">{ragResponse.answer}</p>
                  <Badge variant="secondary" className="mt-2">
                    Confidence: {(ragResponse.confidence * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="border-t border-slate-600 pt-4">
                <h5 className="text-white font-medium mb-2">Sources:</h5>
                <div className="space-y-1">
                  {ragResponse.sources?.map((source: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">{source.document} (Page {source.page})</span>
                      <Badge variant="outline" className="text-xs">
                        {(source.relevance * 100).toFixed(0)}% relevant
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-600 pt-4 mt-4">
                <h5 className="text-white font-medium mb-2">Related Questions:</h5>
                <div className="space-y-1">
                  {ragResponse.relatedQuestions?.map((q: string, index: number) => (
                    <Button
                      key={index}
                      onClick={() => setQuery(q)}
                      variant="outline"
                      size="sm"
                      className="text-xs mr-2"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </Card>
      )}
    </div>
  );
}
