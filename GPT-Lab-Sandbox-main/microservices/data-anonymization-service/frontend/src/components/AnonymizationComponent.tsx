import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';

import {
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon
} from '@mui/icons-material';

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

interface AnonymizationComponentProps {
  analysisResult: AnalysisResult;
  onAnonymizationComplete: (result: AnonymizationResult) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const AnonymizationComponent: React.FC<AnonymizationComponentProps> = ({
  analysisResult,
  onAnonymizationComplete,
  onError,
  isProcessing,
  setIsProcessing
}) => {
  console.log('AnonymizationComponent mounted with analysisResult:', analysisResult);
  const [anonymizationMethod, setAnonymizationMethod] = useState('traditional');
  const [anonymizationProgress, setAnonymizationProgress] = useState(0);
  const [anonymizationComplete, setAnonymizationComplete] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    apiKey: '',
    model: 'openai/gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 100
  });
  const [showAiConfig, setShowAiConfig] = useState(false);

  const configureAI = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
      const response = await fetch(`${apiUrl}/api/v1/ai-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: aiConfig.apiKey,
          model: aiConfig.model,
          temperature: aiConfig.temperature,
          max_tokens: aiConfig.maxTokens,
          enabled: true
        }),
      });

      if (!response.ok) {
        throw new Error(`AI configuration failed: ${response.statusText}`);
      }

      setShowAiConfig(false);
    } catch (error) {
      console.error('AI configuration error:', error);
      onError(`AI configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const startAnonymization = async () => {
    console.log('Starting anonymization for file:', analysisResult.file_id);
    setIsProcessing(true);
    setAnonymizationProgress(0);

    try {
      // Simulate anonymization progress
      const progressInterval = setInterval(() => {
        setAnonymizationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 20;
        });
      }, 300);

      console.log('Calling anonymization API...');
      // Call the anonymization API
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
      const response = await fetch(`${apiUrl}/api/v1/anonymize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: analysisResult.file_id,
          use_ai: anonymizationMethod === 'ai'
        }),
      });

      clearInterval(progressInterval);
      setAnonymizationProgress(100);

      if (!response.ok) {
        throw new Error(`Anonymization failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Anonymization API response:', result);
      
      // Set the result and mark as complete
      console.log('Setting anonymization result and calling onAnonymizationComplete');
      setAnonymizationComplete(true);
      
      // Wait a bit to show completion, then advance to next step
      setTimeout(() => {
        console.log('Calling onAnonymizationComplete with:', result);
        onAnonymizationComplete(result);
      }, 1000);

    } catch (error) {
      console.error('Anonymization error:', error);
      onError(`Anonymization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <Box sx={{ width: '100%' }}>
      {/* Anonymization Progress */}
      {isProcessing && (
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" color="primary" gutterBottom>
            Anonymizing your data...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Applying {anonymizationMethod} anonymization techniques to secure sensitive information
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={anonymizationProgress} 
            sx={{ height: 10, borderRadius: 5, mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {anonymizationProgress}% complete
          </Typography>
        </Paper>
      )}

      {/* Analysis Summary */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.50' }}>
        <Typography variant="h6" color="warning.main" gutterBottom>
          ⚠️ Data Security Alert
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2">
              <strong>Risk Level:</strong> 
              <Chip 
                label={analysisResult.risk_level} 
                size="small" 
                color={analysisResult.risk_level === 'HIGH' ? 'error' : analysisResult.risk_level === 'MEDIUM' ? 'warning' : 'success'} 
                sx={{ ml: 1 }}
              />
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Typography variant="body2">
              <strong>Sensitive Fields:</strong> {analysisResult.total_count}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 100%' }}>
            <Typography variant="body2" color="text.secondary">
              Your file contains sensitive information that should be anonymized before sharing or processing.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Anonymization Method Selection */}
      {!isProcessing && !anonymizationComplete && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            🔒 Choose Anonymization Method
          </Typography>
          
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={anonymizationMethod}
              onChange={(e) => setAnonymizationMethod(e.target.value)}
            >
              <FormControlLabel
                value="traditional"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1">
                      Traditional (Rule-based) Anonymization
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Industry-standard techniques: masking, pseudonymization, generalization
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="ai"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1">
                      AI-Powered Anonymization
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Context-aware replacement using advanced language models
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* AI Configuration Section */}
          {anonymizationMethod === 'ai' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                🤖 AI Configuration Required (OpenRouter)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure your OpenRouter API key and AI model settings for intelligent anonymization
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowAiConfig(!showAiConfig)}
                sx={{ mb: 2 }}
              >
                {showAiConfig ? 'Hide' : 'Configure AI Settings'}
              </Button>
              
              {showAiConfig && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    AI Model Configuration
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        API Key *
                      </Typography>
                      <input
                        type="password"
                        value={aiConfig.apiKey}
                        onChange={(e) => setAiConfig({...aiConfig, apiKey: e.target.value})}
                        placeholder="Enter your OpenRouter API key"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Model
                      </Typography>
                      <select
                        value={aiConfig.model}
                        onChange={(e) => setAiConfig({...aiConfig, model: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="openai/gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                        <option value="openai/gpt-4">OpenAI GPT-4</option>
                        <option value="openai/gpt-4-turbo">OpenAI GPT-4 Turbo</option>
                        <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                        <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
                        <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B</option>
                        <option value="google/gemini-pro">Google Gemini Pro</option>
                      </select>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" gutterBottom>
                          Temperature: {aiConfig.temperature}
                        </Typography>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={aiConfig.temperature}
                          onChange={(e) => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
                          style={{ width: '100%' }}
                        />
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" gutterBottom>
                          Max Tokens: {aiConfig.maxTokens}
                        </Typography>
                        <input
                          type="range"
                          min="50"
                          max="500"
                          step="10"
                          value={aiConfig.maxTokens}
                          onChange={(e) => setAiConfig({...aiConfig, maxTokens: parseInt(e.target.value)})}
                          style={{ width: '100%' }}
                        />
                      </Box>
                    </Box>
                    
                    <Button
                      variant="contained"
                      size="small"
                      onClick={configureAI}
                      disabled={!aiConfig.apiKey}
                    >
                      Save AI Configuration
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={startAnonymization}
              startIcon={<SecurityIcon />}
              disabled={anonymizationMethod === 'ai' && !aiConfig.apiKey}
              sx={{ px: 4, py: 1.5 }}
            >
              Start Anonymization
            </Button>
          </Box>
        </Paper>
      )}

      {/* Anonymization Results */}
      {anonymizationComplete && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CheckIcon color="success" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" color="success.main">
                Anonymization Complete!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your data has been successfully secured using {anonymizationMethod} techniques
              </Typography>
            </Box>
          </Box>

          {/* Techniques Applied */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'success.50' }}>
            <Typography variant="subtitle1" color="success.main" gutterBottom>
              ✅ Techniques Applied:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['traditional_anonymization'].map((technique, index) => (
                <Chip
                  key={index}
                  label={technique.replace('_', ' ')}
                  color="success"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>

          {/* Security Features */}
          <Typography variant="h6" gutterBottom>
            🛡️ Security Features Applied
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LockIcon color="primary" />
                    <Typography variant="subtitle1">
                      Data Masking
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Sensitive values are partially hidden or replaced with pseudonyms
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LockIcon color="primary" />
                    <Typography variant="subtitle1">
                      Structure Preservation
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Original file format and structure maintained
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckIcon color="primary" />
                    <Typography variant="subtitle1">
                      Compliance Ready
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Meets GDPR and industry privacy standards
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
        <Typography variant="subtitle2" color="info.main" gutterBottom>
          📋 What Happens Next:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your data has been anonymized and secured. Proceed to the download step to retrieve your anonymized file.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AnonymizationComponent;
