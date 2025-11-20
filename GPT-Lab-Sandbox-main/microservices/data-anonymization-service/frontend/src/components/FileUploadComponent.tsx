import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Upload as BatchUploadIcon
} from '@mui/icons-material';

interface FileUploadComponentProps {
  onFileUploaded: (data: any) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

interface BatchUploadResult {
  filename: string;
  file_id?: string;
  status: 'success' | 'error';
  error?: string;
  file_type?: string;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onFileUploaded,
  onError,
  isProcessing,
  setIsProcessing
}) => {
  // Component mounted
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<BatchUploadResult[]>([]);
  const [showBatchResults, setShowBatchResults] = useState(false);

  // Supported file types
  const supportedTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/json'
  ];

  const supportedExtensions = ['.csv', '.xlsx', '.xls', '.pdf', '.docx', '.txt', '.json'];

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (batchMode) {
        handleBatchFileSelect(e.dataTransfer.files);
      } else {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    }
  }, [batchMode]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!supportedTypes.includes(file.type) && !supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      onError(`Unsupported file type: ${file.type}. Supported types: ${supportedExtensions.join(', ')}`);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    console.log('Starting upload for file:', selectedFile.name);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      console.log('Calling upload API...');
      console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
      console.log('Using API URL:', apiUrl);
      const response = await fetch(`${apiUrl}/api/v1/upload`, {
        method: 'POST',
        body: formData,
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);
      
      // Wait a bit to show completion, then advance to next step
      setTimeout(() => {
        console.log('Calling onFileUploaded with:', result);
        onFileUploaded(result);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      onError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Handle batch file selection
  const handleBatchFileSelect = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!supportedTypes.includes(file.type) && !supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        return false;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        return false;
      }
      return true;
    });
    
    setBatchFiles(validFiles);
  };

  // Handle batch upload
  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      batchFiles.forEach(file => {
        formData.append('files', file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
      const response = await fetch(`${apiUrl}/api/v1/batch/upload`, {
        method: 'POST',
        body: formData,
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Batch upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setBatchResults(result.results);
      setShowBatchResults(true);

      // Process successful uploads
      const successfulUploads = result.results.filter((r: BatchUploadResult) => r.status === 'success');
      if (successfulUploads.length > 0) {
        onFileUploaded({
          file_id: successfulUploads[0].file_id,
          filename: successfulUploads[0].filename,
          file_type: successfulUploads[0].file_type,
          batch_mode: true,
          batch_results: result.results
        });
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      onError(`Batch upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Mode Toggle */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant={!batchMode ? 'contained' : 'outlined'}
          onClick={() => setBatchMode(false)}
          startIcon={<UploadIcon />}
        >
          Single File
        </Button>
        <Button
          variant={batchMode ? 'contained' : 'outlined'}
          onClick={() => setBatchMode(true)}
          startIcon={<BatchUploadIcon />}
        >
          Batch Upload
        </Button>
      </Box>

      {/* Batch Results */}
      {showBatchResults && batchResults.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Batch Upload Results
          </Typography>
          <List>
            {batchResults.map((result, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {result.status === 'success' ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={result.filename}
                  secondary={result.status === 'success' ? `Successfully uploaded` : result.error}
                />
              </ListItem>
            ))}
          </List>
          <Button
            variant="outlined"
            onClick={() => setShowBatchResults(false)}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Paper>
      )}

      {/* File Upload Area */}
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          backgroundColor: dragActive ? 'primary.50' : 'background.paper',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.50',
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom color="primary">
          {dragActive 
            ? `Drop your ${batchMode ? 'files' : 'file'} here` 
            : `Drag & Drop your ${batchMode ? 'files' : 'file'} here`
          }
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to browse {batchMode ? 'files' : 'file'}
        </Typography>
        {batchMode && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Maximum 10 files, 100MB each
          </Typography>
        )}
        
        {/* Supported file types */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Supported file types:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mt: 1 }}>
            {supportedExtensions.map((ext) => (
              <Chip
                key={ext}
                label={ext}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>

        {/* Hidden file input */}
        <input
          id="file-input"
          type="file"
          accept={supportedTypes.join(',')}
          multiple={batchMode}
          onChange={batchMode ? (e) => e.target.files && handleBatchFileSelect(e.target.files) : handleFileInputChange}
          style={{ display: 'none' }}
        />
      </Paper>

      {/* Selected File Display */}
      {!batchMode && selectedFile && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckIcon color="success" />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" color="success.main">
                File Selected: {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB | 
                Type: {selectedFile.type || 'Unknown'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={isProcessing}
              startIcon={<UploadIcon />}
            >
              {isProcessing ? 'Uploading...' : 'Upload File'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Batch Files Display */}
      {batchMode && batchFiles.length > 0 && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.50' }}>
          <Typography variant="h6" gutterBottom>
            Selected Files ({batchFiles.length})
          </Typography>
          <List>
            {batchFiles.map((file, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <FileIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB | ${file.type || 'Unknown'}`}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleBatchUpload}
              disabled={isProcessing}
              startIcon={<BatchUploadIcon />}
            >
              {isProcessing ? 'Uploading...' : `Upload ${batchFiles.length} Files`}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setBatchFiles([])}
            >
              Clear
            </Button>
          </Box>
        </Paper>
      )}

      {/* Upload Progress */}
      {isProcessing && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Uploading file...
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {uploadProgress}% complete
          </Typography>
        </Box>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.50' }}>
        <Typography variant="subtitle2" color="info.main" gutterBottom>
          📋 Instructions:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileIcon fontSize="small" color="info" />
            <Box>
              <Typography variant="body2" color="info.main">
                Supported formats: CSV, Excel, PDF, Word, Text, JSON
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum file size: 10MB
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon fontSize="small" color="info" />
            <Box>
              <Typography variant="body2" color="info.main">
                Your file will be securely processed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                No data is stored permanently on our servers
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default FileUploadComponent;
