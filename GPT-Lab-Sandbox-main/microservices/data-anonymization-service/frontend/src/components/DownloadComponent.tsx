import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';

import {
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
  FileDownload as FileIcon
} from '@mui/icons-material';

interface AnonymizationResult {
  status: string;
  anonymized_file_id: string;
  original_file_id: string;
  techniques_applied: string[];
  anonymization_method: string;
}

interface DownloadComponentProps {
  anonymizationResult: AnonymizationResult;
  onError: (error: string) => void;
}

const DownloadComponent: React.FC<DownloadComponentProps> = ({
  anonymizationResult,
  onError
}) => {
  console.log('DownloadComponent received anonymizationResult:', anonymizationResult);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
      const response = await fetch(`${apiUrl}/api/v1/download/${anonymizationResult.anonymized_file_id}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const contentType = response.headers.get('Content-Type');
      let filename = 'anonymized_file.txt';
      
      // Try to get filename from Content-Disposition header
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Fallback: determine filename based on Content-Type
      if (filename === 'anonymized_file.txt') {
        if (contentType && contentType.includes('text/csv')) {
          filename = 'anonymized_file.csv';
        } else if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
          filename = 'anonymized_file.xlsx';
        } else if (contentType && contentType.includes('application/pdf')) {
          filename = 'anonymized_file.pdf';
        } else if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
          filename = 'anonymized_file.docx';
        } else if (contentType && contentType.includes('application/json')) {
          filename = 'anonymized_file.json';
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadComplete(true);
      
    } catch (error) {
      onError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Download Status */}
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
          <CheckIcon color="success" sx={{ fontSize: 32 }} />
          <Typography variant="h6" color="success.main">
            Ready for Download!
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your data has been successfully anonymized and is ready for secure download.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleDownload}
          disabled={isDownloading}
          startIcon={isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />}
          sx={{ px: 4, py: 1.5 }}
        >
          {isDownloading ? 'Downloading...' : 'Download Anonymized File'}
        </Button>

        {downloadComplete && (
          <Alert severity="success" sx={{ mt: 2 }}>
            File downloaded successfully! Your data is now secure and ready for use.
          </Alert>
        )}
      </Paper>

      {/* Anonymization Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Anonymization Summary
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Method Used
                </Typography>
                <Typography variant="body1">
                  {anonymizationResult.anonymization_method === 'traditional' 
                    ? 'Traditional (Rule-based)' 
                    : 'AI-Powered'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1">
                  {anonymizationResult.techniques_applied.length} technique(s)
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Techniques Details */}
        <Typography variant="subtitle1" gutterBottom>
          🔧 Techniques Applied:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {anonymizationResult.techniques_applied.map((technique, index) => (
            <Chip
              key={index}
              label={technique.replace('_', ' ')}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>

      {/* Security Features */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.50' }}>
        <Typography variant="h6" color="success.main" gutterBottom>
          🛡️ Security Features
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SecurityIcon color="success" />
              <Typography variant="subtitle2" color="success.main">
                Data Protection
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              All sensitive information has been anonymized using industry-standard techniques
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FileIcon color="success" />
              <Typography variant="subtitle2" color="success.main">
                Format Preservation
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Original file structure and format maintained for seamless integration
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckIcon color="success" />
              <Typography variant="subtitle2" color="success.main">
                Compliance Ready
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Meets GDPR, HIPAA, and other privacy regulation requirements
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Next Steps */}
      <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
        <Typography variant="subtitle2" color="info.main" gutterBottom>
          📋 What You Can Do Now:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          • Download your anonymized file for secure use
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          • Share the file without privacy concerns
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          • Use for testing, development, or analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Process in compliance with privacy regulations
        </Typography>
      </Paper>
    </Box>
  );
};

export default DownloadComponent;
