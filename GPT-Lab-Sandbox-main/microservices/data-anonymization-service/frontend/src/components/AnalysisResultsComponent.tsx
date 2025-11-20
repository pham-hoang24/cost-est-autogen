import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';

import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

interface FileData {
  file_id: string;
  filename: string;
  file_type: string;
  size: number;
}

interface AnalysisResult {
  file_id: string;
  status: string;
  file_type: string;
  sensitive_fields: Array<{
    field_type: string;
    count: number;
    examples: string[];
    risk_level: string;
  }>;
  total_count: number;
  risk_level: string;
}

interface AnalysisResultsComponentProps {
  fileData: FileData;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const AnalysisResultsComponent: React.FC<AnalysisResultsComponentProps> = ({
  fileData,
  onAnalysisComplete,
  onError,
  isProcessing,
  setIsProcessing
}) => {
  console.log('AnalysisResultsComponent mounted with fileData:', fileData);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Start analysis when component mounts
  useEffect(() => {
    console.log('AnalysisResultsComponent mounted. fileData:', fileData, 'analysisComplete:', analysisComplete);
    if (fileData && !analysisComplete) {
      console.log('Starting analysis for file:', fileData.file_id);
      startAnalysis();
    } else {
      console.log('Not starting analysis. fileData exists:', !!fileData, 'analysisComplete:', analysisComplete);
    }
  }, [fileData, analysisComplete]);

  const startAnalysis = async () => {
    setIsProcessing(true);
    setAnalysisProgress(0);

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 200);

      // Call the analysis API
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
      const response = await fetch(`${apiUrl}/api/v1/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileData.file_id
        }),
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Analysis response:', result);
      
      // Set the result and mark as complete
      console.log('Setting analysis result and calling onAnalysisComplete');
      setAnalysisResult(result);
      setAnalysisComplete(true);
      
      // Wait a bit to show completion, then advance to next step
      setTimeout(() => {
        console.log('Calling onAnalysisComplete with:', result);
        onAnalysisComplete(result);
      }, 1000);

    } catch (error) {
      onError(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType.toLowerCase()) {
      case 'email':
        return '📧';
      case 'phone':
        return '📱';
      case 'ssn':
        return '🆔';
      case 'credit_card':
        return '💳';
      case 'name':
        return '👤';
      case 'address':
        return '📍';
      case 'postal_code':
        return '📮';
      case 'ip_address':
        return '🌐';
      case 'bank_account':
        return '🏦';
      default:
        return '📄';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Analysis Progress */}
      {isProcessing && (
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ color: 'primary.main', mb: 2 }}>📊</Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            Analyzing your data for sensitive information...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Scanning for emails, phone numbers, SSNs, names, addresses, and other sensitive patterns
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={analysisProgress} 
            sx={{ height: 10, borderRadius: 5, mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {analysisProgress}% complete
          </Typography>
        </Paper>
      )}

      {/* File Information */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.50' }}>
        <Typography variant="h6" color="info.main" gutterBottom>
          📁 File Information
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2">
              <strong>Filename:</strong> {fileData.filename}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2">
              <strong>Type:</strong> {fileData.file_type.toUpperCase()}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2">
              <strong>Size:</strong> {(fileData.size / 1024).toFixed(2)} KB
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2">
              <strong>Status:</strong> 
              <Chip 
                label={analysisComplete ? 'Analyzed' : 'Pending Analysis'} 
                size="small" 
                color={analysisComplete ? 'success' : 'warning'} 
                sx={{ ml: 1 }}
              />
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Analysis Results */}
      {analysisComplete && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CheckIcon color="success" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" color="success.main">
                Analysis Complete!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sensitive data patterns have been detected in your file
              </Typography>
            </Box>
          </Box>

          {/* Risk Level Summary */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon color="warning" />
              <Box>
                <Typography variant="subtitle1" color="warning.main">
                  Overall Risk Level: 
                  <Chip 
                    label={analysisResult?.risk_level || 'Unknown'} 
                    size="small" 
                    color={getRiskColor(analysisResult?.risk_level || '')} 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total sensitive fields detected: {analysisResult?.total_count || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Sensitive Fields Details */}
          <Typography variant="h6" gutterBottom>
            🔍 Detected Sensitive Fields
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {analysisResult?.sensitive_fields.map((field, index) => (
              <Box key={index} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h4">
                        {getFieldIcon(field.field_type)}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                          {field.field_type.replace('_', ' ')}
                        </Typography>
                        <Chip 
                          label={field.risk_level} 
                          size="small" 
                          color={getRiskColor(field.risk_level)} 
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" color="primary" gutterBottom>
                      {field.count} instances found
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Examples:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {field.examples.slice(0, 3).map((example, idx) => (
                        <Chip
                          key={idx}
                          label={example.length > 20 ? example.substring(0, 20) + '...' : example}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                      {field.examples.length > 3 && (
                        <Chip
                          label={`+${field.examples.length - 3} more`}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
        <Typography variant="subtitle2" color="success.main" gutterBottom>
          ✅ Next Steps:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your file has been analyzed for sensitive information. Review the results above and proceed to the anonymization step to secure your data.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AnalysisResultsComponent;
