'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Shield, 
  Upload, 
  Download, 
  FileText, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Database,
  Lock,
  Unlock,
  BarChart3,
  Settings,
  Play,
  RefreshCw,
  ArrowLeft,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';

interface AnonymizationJob {
  id: string;
  filename: string;
  status: 'analyzed' | 'anonymizing' | 'completed' | 'failed';
  uploaded_at: string;
  record_count: number;
  pii_detections: PIIDetection[];
  algorithm?: string;
  result?: {
    algorithm: string;
    original_records: number;
    anonymized_records: number;
    output_file: string;
    parameters: any;
  };
  error?: string;
}

interface PIIDetection {
  type: string;
  count: number;
  sample?: string;
}

interface Algorithm {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export default function DataAnonymizationServicePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<AnonymizationJob[]>([]);
  // Load algorithms immediately - no async operations
  const algorithms: Algorithm[] = [
    {
      id: 'k-anonymity',
      name: 'K-Anonymity',
      description: 'Ensures each record is indistinguishable from at least k-1 other records',
      parameters: {
        k: { type: 'integer', min: 2, max: 100, default: 3 }
      }
    },
    {
      id: 'l-diversity',
      name: 'L-Diversity',
      description: 'Extends K-Anonymity to ensure diversity in sensitive attributes',
      parameters: {
        l: { type: 'integer', min: 2, max: 10, default: 2 }
      }
    },
    {
      id: 't-closeness',
      name: 'T-Closeness',
      description: 'Ensures distribution of sensitive attributes is close to global distribution',
      parameters: {
        t: { type: 'float', min: 0.0, max: 1.0, default: 0.1 }
      }
    }
  ];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('k-anonymity');
  const [algorithmParams, setAlgorithmParams] = useState<Record<string, any>>({
    k: 3,
    l: 2,
    t: 0.1
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const API_BASE = 'http://localhost:8082/api';

  useEffect(() => {
    console.log('Data Anonymization Page: useEffect triggered');
    fetchJobs();
  }, []);


  const fetchJobs = async () => {
    try {
      // For now, load demo jobs since we don't have a jobs endpoint
      loadDemoJobs();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      loadDemoJobs();
    }
  };

  const loadDemoJobs = () => {
    // Demo data for demonstration
    const demoJobs: AnonymizationJob[] = [
      {
        id: 'demo-1',
        filename: 'employee_data.csv',
        status: 'completed',
        uploaded_at: new Date(Date.now() - 3600000).toISOString(),
        record_count: 150,
        pii_detections: [
          { type: 'EMAIL', count: 150, sample: 'john.doe@company.com' },
          { type: 'PHONE', count: 120, sample: '+1-555-123-4567' },
          { type: 'SSN', count: 150, sample: '123-45-6789' }
        ],
        algorithm: 'k-anonymity',
        result: {
          algorithm: 'k-anonymity',
          original_records: 150,
          anonymized_records: 150,
          output_file: '/results/demo-1_anonymized_k-anonymity.csv',
          parameters: { k: 3 }
        }
      },
      {
        id: 'demo-2',
        filename: 'customer_survey.xlsx',
        status: 'analyzed',
        uploaded_at: new Date(Date.now() - 7200000).toISOString(),
        record_count: 89,
        pii_detections: [
          { type: 'EMAIL', count: 89, sample: 'customer@email.com' },
          { type: 'CREDIT_CARD', count: 45, sample: '4532-1234-5678-9012' }
        ]
      },
      {
        id: 'demo-3',
        filename: 'research_data.json',
        status: 'anonymizing',
        uploaded_at: new Date(Date.now() - 1800000).toISOString(),
        record_count: 200,
        pii_detections: [
          { type: 'EMAIL', count: 200, sample: 'researcher@university.edu' },
          { type: 'PHONE', count: 180, sample: '+358-40-123-4567' }
        ],
        algorithm: 'l-diversity'
      }
    ];
    setJobs(demoJobs);
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const allowedExtensions = ['.csv', '.xls', '.xlsx', '.json', '.txt', '.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error(`Unsupported file type. Please upload: ${allowedExtensions.join(', ')}`);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Please upload files smaller than 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileSelect(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Uploading file:', selectedFile.name, 'to', `${API_BASE}/upload`);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);
      
      const newJob: AnonymizationJob = {
        id: result.job_id || `job_${Date.now()}`,
        filename: result.filename || selectedFile.name,
        status: result.status || 'analyzed',
        uploaded_at: new Date().toISOString(),
        record_count: result.record_count || 0,
        pii_detections: result.pii_detections || []
      };

      setJobs(prev => [newJob, ...prev]);
      toast.success(`File "${selectedFile.name}" uploaded and analyzed successfully!`);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleAnonymize = async (jobId: string) => {
    try {
      console.log('Anonymizing job:', jobId, 'with algorithm:', selectedAlgorithm);
      
      const response = await fetch(`${API_BASE}/anonymize/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          algorithm: selectedAlgorithm,
          parameters: algorithmParams
        }),
      });

      console.log('Anonymize response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anonymize error response:', errorText);
        throw new Error(`Anonymization failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Anonymize result:', result);
      
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: result.status || 'completed', 
              algorithm: selectedAlgorithm,
              result: result.result || {
                algorithm: selectedAlgorithm,
                original_records: job.record_count,
                anonymized_records: job.record_count,
                output_file: `/results/${job.filename.replace('.', '_anonymized.')}`,
                parameters: algorithmParams
              }
            }
          : job
      ));

      toast.success('Data anonymization completed successfully!');
    } catch (error) {
      console.error('Anonymization error:', error);
      toast.error(`Failed to anonymize data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownload = async (jobId: string) => {
    try {
      console.log('Downloading job:', jobId);
      
      const response = await fetch(`${API_BASE}/download/${jobId}`);
      console.log('Download response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error response:', errorText);
        throw new Error(`Download failed: ${errorText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anonymized_${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'analyzed':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'anonymizing':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'analyzed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'anonymizing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/ai-services')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to AI Services
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <Shield className="w-8 h-8" />
                Data Anonymization Service
              </h1>
              <p className="text-text-muted mt-2">
                GDPR-compliant data anonymization using advanced privacy-preserving algorithms
              </p>
            </div>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </Button>
          </div>
        </header>

        {/* Service Info */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Service Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Category:</span>
                  <Badge variant="outline">Security & Compliance</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Access Level:</span>
                  <Badge className="bg-blue-100 text-blue-800">Professional</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">GDPR Compliant:</span>
                  <Badge className="bg-green-100 text-green-800">Yes</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Cost per Request:</span>
                  <span className="text-primary font-medium">€0.02</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">API Endpoint:</span>
                  <code className="text-xs bg-surface px-2 py-1 rounded">localhost:8082/api</code>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Supported File Types</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">CSV</Badge>
                <Badge variant="outline">Excel</Badge>
                <Badge variant="outline">JSON</Badge>
                <Badge variant="outline">Text</Badge>
              </div>
              <h3 className="text-lg font-semibold mb-3 mt-4">PII Detection</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Email</Badge>
                <Badge variant="outline">Phone</Badge>
                <Badge variant="outline">SSN</Badge>
                <Badge variant="outline">Credit Card</Badge>
                <Badge variant="outline">Address</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Service Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold">Total Jobs</h3>
                <p className="text-2xl font-bold text-primary">{jobs.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Completed</h3>
                <p className="text-2xl font-bold text-primary">
                  {jobs.filter(job => job.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="text-lg font-semibold">Total Records</h3>
                <p className="text-2xl font-bold text-primary">
                  {jobs.reduce((sum, job) => sum + job.record_count, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Available Algorithms */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Available Anonymization Algorithms
          </h2>
          <div className="mb-4 text-sm text-text-muted">
            Debug: {algorithms.length} algorithms loaded
            <br />
            Algorithms: {JSON.stringify(algorithms.map(a => a.name))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {algorithms.length === 0 ? (
              <div className="col-span-full text-center py-8 text-text-muted">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Loading algorithms...</p>
              </div>
            ) : (
              algorithms.map((algorithm) => (
                <div 
                  key={algorithm.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAlgorithm === algorithm.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedAlgorithm(algorithm.id)}
                >
                  <h3 className="font-semibold">{algorithm.name}</h3>
                  <p className="text-sm text-text-muted mt-1">{algorithm.description}</p>
                  <div className="mt-2">
                    {Object.keys(algorithm.parameters).map(param => (
                      <div key={param} className="text-xs text-text-muted">
                        {param}: {algorithm.parameters[param].type}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Jobs List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Anonymization Jobs
          </h2>
          
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No files uploaded yet. Upload a file to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-border rounded-lg p-4 hover:bg-surface/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-semibold">{job.filename}</h3>
                        <p className="text-sm text-text-muted">
                          {job.record_count} records • {new Date(job.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      {job.algorithm && (
                        <Badge variant="outline">
                          {job.algorithm}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* PII Detections */}
                  {job.pii_detections.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-text-muted mb-2">Detected PII:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.pii_detections.map((detection, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {detection.type}: {detection.count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {job.status === 'analyzed' && (
                      <Button 
                        onClick={() => handleAnonymize(job.id)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Anonymize
                      </Button>
                    )}
                    
                    {job.status === 'completed' && job.result && (
                      <Button 
                        onClick={() => handleDownload(job.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    )}
                    
                    {job.status === 'failed' && (
                      <p className="text-sm text-red-500">
                        Error: {job.error || 'Unknown error occurred'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Upload File for Anonymization</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select File</label>
                  <div 
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      isDragOver 
                        ? 'border-primary bg-primary/5' 
                        : 'border-primary/30 hover:border-primary/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.json,.txt,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                      id="file-upload"
                    />
                    <div className="text-center">
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-primary' : 'text-primary/50'}`} />
                      <p className="text-sm text-text-muted mb-1">
                        {selectedFile ? selectedFile.name : 'Click to select or drag & drop file'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {isDragOver ? 'Drop file here' : 'Drag and drop supported'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="bg-surface p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{selectedFile.name}</span>
                    </div>
                    <div className="text-xs text-text-muted">
                      Size: {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                )}

                <div className="text-xs text-text-muted bg-surface p-3 rounded-lg">
                  <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls), JSON, Text, PDF, Word (.doc, .docx)
                  <br />
                  <strong>Max size:</strong> 10MB
                </div>
                
                {isUploading && (
                  <div className="flex items-center gap-2 text-primary">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Uploading and analyzing file...</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowUploadModal(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  {selectedFile && (
                    <Button 
                      onClick={processFile}
                      className="flex-1"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload & Analyze
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Demo Version Message */}
        <footer className="mt-8 text-center text-text-muted text-sm">
          <p>🛡️ Data Anonymization Service - GDPR Compliance</p>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              🎭 Demo Version - This is a demonstration of the data anonymization system
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
              All data is processed in memory and not persisted for security
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
