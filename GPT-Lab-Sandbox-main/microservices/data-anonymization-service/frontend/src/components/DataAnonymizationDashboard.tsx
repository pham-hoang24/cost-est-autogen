import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import FileUploadComponent from './FileUploadComponent';
import AnalysisResultsComponent from './AnalysisResultsComponent';
import AnonymizationComponent from './AnonymizationComponent';
import DownloadComponent from './DownloadComponent';

// Define the steps for the workflow
const steps = [
  {
    label: 'Upload File',
    description: 'Upload your data file for processing',
    icon: <UploadIcon />,
  },
  {
    label: 'Analyze Data',
    description: 'Detect sensitive information patterns',
    icon: <AnalyticsIcon />,
  },
  {
    label: 'Anonymize',
    description: 'Apply anonymization techniques',
    icon: <SecurityIcon />,
  },
  {
    label: 'Download',
    description: 'Get your anonymized file',
    icon: <DownloadIcon />,
  },
];

// Types for our data
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

interface AnonymizationResult {
  status: string;
  anonymized_file_id: string;
  original_file_id: string;
  techniques_applied: string[];
  anonymization_method: string;
}

const DataAnonymizationDashboard: React.FC = () => {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [anonymizationResult, setAnonymizationResult] = useState<AnonymizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startAnalysis, setStartAnalysis] = useState(false);
  const [startAnonymization, setStartAnonymization] = useState(false);

  // Handle step completion
  const handleNext = () => {
    console.log('Moving to next step. Current step:', activeStep);
    setActiveStep((prevActiveStep) => {
      const nextStep = prevActiveStep + 1;
      console.log('Moving from step', prevActiveStep, 'to step', nextStep);
      return nextStep;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    console.log('Resetting workflow');
    setActiveStep(0);
    setFileData(null);
    setAnalysisResult(null);
    setAnonymizationResult(null);
    setError(null);
  };

  // Handle file upload completion
  const handleFileUploaded = (data: FileData) => {
    console.log('File uploaded:', data);
    setFileData(data);
    setError(null);
    // Don't auto-advance - let user click Continue
  };

  // Handle analysis completion
  const handleAnalysisComplete = (result: AnalysisResult) => {
    console.log('Analysis completed:', result);
    setAnalysisResult(result);
    setError(null);
    // Don't auto-advance - let user click Continue
  };

  // Handle anonymization completion
  const handleAnonymizationComplete = (result: AnonymizationResult) => {
    console.log('Anonymization completed:', result);
    setAnonymizationResult(result);
    setError(null);
    // Don't auto-advance - let user click Continue
  };

  // Handle step click to start processes
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex === 0 && !fileData) {
      // Step 0: Upload file - already handled by FileUploadComponent
      return;
    }
    
    if (stepIndex === 1 && fileData && !analysisResult) {
      // Step 1: Start analysis
      console.log('Starting analysis from step click');
      // The AnalysisResultsComponent will handle this
      return;
    }
    
    if (stepIndex === 2 && analysisResult && !anonymizationResult) {
      // Step 2: Start anonymization
      console.log('Starting anonymization from step click');
      // The AnonymizationComponent will handle this
      return;
    }
    
    if (stepIndex === 3 && anonymizationResult) {
      // Step 3: Download - already handled by DownloadComponent
      return;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Workflow Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom align="center" color="primary">
          Data Anonymization Workflow
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => step.icon}
                optional={
                  index === 0 && fileData ? (
                    <Chip 
                      label={`${fileData.filename} (${fileData.file_type})`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  ) : index === 1 && analysisResult ? (
                    <Chip 
                      label={`${analysisResult.total_count} sensitive fields`} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                  ) : index === 2 && anonymizationResult ? (
                    <Chip 
                      label="Completed" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  ) : undefined
                }
                onClick={() => handleStepClick(index)}
                sx={{ cursor: 'pointer' }}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                
                {/* Step-specific content */}
                {index === 0 && (
                  <>
                    <FileUploadComponent 
                      onFileUploaded={handleFileUploaded}
                      onError={setError}
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                    />
                  </>
                )}
                
                {index === 1 && fileData && (
                  <>
                    {!startAnalysis ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Ready to Analyze Data
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Click "Start Analysis" to begin detecting sensitive information in your file.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            console.log('Starting analysis from button click');
                            setStartAnalysis(true);
                          }}
                          disabled={isProcessing}
                          startIcon={<AnalyticsIcon />}
                        >
                          Start Analysis
                        </Button>
                      </Box>
                    ) : (
                      <AnalysisResultsComponent 
                        fileData={fileData}
                        onAnalysisComplete={handleAnalysisComplete}
                        onError={setError}
                        isProcessing={isProcessing}
                        setIsProcessing={setIsProcessing}
                      />
                    )}
                  </>
                )}
                
                {index === 2 && analysisResult && (
                  <>
                    {!startAnonymization ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Ready to Anonymize Data
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Click "Start Anonymization" to begin securing your sensitive data.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            console.log('Starting anonymization from button click');
                            setStartAnonymization(true);
                          }}
                          disabled={isProcessing}
                          startIcon={<SecurityIcon />}
                        >
                          Start Anonymization
                        </Button>
                      </Box>
                    ) : (
                      <AnonymizationComponent 
                        analysisResult={analysisResult}
                        onAnonymizationComplete={handleAnonymizationComplete}
                        onError={setError}
                        isProcessing={isProcessing}
                        setIsProcessing={setIsProcessing}
                      />
                    )}
                  </>
                )}
                
                {index === 3 && anonymizationResult && (
                  <>
                    <DownloadComponent 
                      anonymizationResult={anonymizationResult}
                      onError={setError}
                    />
                  </>
                )}

                {/* Step navigation - Only show for completed steps */}
                {((index === 0 && fileData) || 
                  (index === 1 && analysisResult) || 
                  (index === 2 && anonymizationResult)) && (
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={isProcessing}
                      >
                        {index === steps.length - 1 ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {/* Reset button */}
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              All steps completed - you&apos;re finished!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your data has been successfully anonymized. You can now download the secure file.
            </Typography>
            <Button onClick={handleReset} variant="outlined">
              Reset Workflow
            </Button>
          </Paper>
        )}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" color="primary">
            Processing your data...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we analyze and anonymize your file
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DataAnonymizationDashboard;
