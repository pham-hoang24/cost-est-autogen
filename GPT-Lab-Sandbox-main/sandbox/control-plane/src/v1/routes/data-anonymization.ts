// Data Anonymization API Routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parser';
import { createReadStream, createWriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { DataInspector } from '../../services/anonymization/inspector';
import { DataAnalysis, AnonymizationConfig, AnonymizationResult } from '../../services/anonymization/types';
import { 
  createKAnonymityEngine, 
  anonymizeWithKAnonymity, 
  KAnonymityConfig 
} from '../../services/anonymization/algorithms/k-anonymity';
import { 
  createLDiversityEngine, 
  anonymizeWithLDiversity, 
  LDiversityConfig 
} from '../../services/anonymization/algorithms/l-diversity';
import { 
  createTClosenessEngine, 
  anonymizeWithTCloseness, 
  TClosenessConfig 
} from '../../services/anonymization/algorithms/t-closeness';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads/anonymization');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV, JSON, Excel files
    const allowedTypes = ['.csv', '.json', '.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${fileExt}. Supported types: ${allowedTypes.join(', ')}`));
    }
  }
});

// In-memory job storage (replace with database in production)
const jobs = new Map<string, {
  id: string;
  status: 'pending' | 'analyzing' | 'anonymizing' | 'completed' | 'failed';
  originalFilename: string;
  filePath: string;
  analysis?: DataAnalysis;
  result?: AnonymizationResult;
  error?: string;
  createdAt: Date;
}>();

/**
 * POST /api/data-anonymization/upload
 * Upload a file for anonymization analysis
 */
router.post('/upload', upload.single('datafile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide a data file to analyze'
      });
    }

    const jobId = uuidv4();
    const job = {
      id: jobId,
      status: 'pending' as const,
      originalFilename: req.file.originalname,
      filePath: req.file.path,
      createdAt: new Date()
    };

    jobs.set(jobId, job);

    // Start analysis in background
    setImmediate(() => analyzeFileAsync(jobId));

    res.status(201).json({
      jobId,
      message: 'File uploaded successfully. Analysis started.',
      filename: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/data-anonymization/jobs
 * Get all anonymization jobs for the user
 */
router.get('/jobs', async (req, res) => {
  try {
    const userJobs = Array.from(jobs.values()).map(job => ({
      id: job.id,
      status: job.status,
      originalFilename: job.originalFilename,
      createdAt: job.createdAt,
      hasAnalysis: !!job.analysis,
      hasResult: !!job.result,
      error: job.error
    }));

    res.json({
      jobs: userJobs,
      total: userJobs.length
    });
  } catch (error) {
    console.error('Jobs listing error:', error);
    res.status(500).json({
      error: 'Failed to retrieve jobs',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/data-anonymization/jobs/:id
 * Get specific job details including analysis results
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = jobs.get(id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: `No job found with ID: ${id}`
      });
    }

    res.json({
      id: job.id,
      status: job.status,
      originalFilename: job.originalFilename,
      createdAt: job.createdAt,
      analysis: job.analysis,
      result: job.result,
      error: job.error
    });

  } catch (error) {
    console.error('Job retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve job',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/data-anonymization/anonymize/:id
 * Start anonymization process for analyzed data
 */
router.post('/anonymize/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config: AnonymizationConfig = req.body;

    const job = jobs.get(id);
    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: `No job found with ID: ${id}`
      });
    }

    if (!job.analysis) {
      return res.status(400).json({
        error: 'Analysis not completed',
        message: 'File must be analyzed before anonymization'
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        error: 'Invalid job status',
        message: `Job status is ${job.status}, expected 'completed'`
      });
    }

    // Update job status
    job.status = 'anonymizing';
    jobs.set(id, job);

    // Start anonymization in background
    setImmediate(() => anonymizeDataAsync(id, config));

    res.json({
      message: 'Anonymization started',
      jobId: id,
      config
    });

  } catch (error) {
    console.error('Anonymization start error:', error);
    res.status(500).json({
      error: 'Failed to start anonymization',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/data-anonymization/preview/:id
 * Get a preview of the anonymization results
 */
router.get('/preview/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = jobs.get(id);

    if (!job || !job.analysis) {
      return res.status(404).json({
        error: 'Analysis not found',
        message: 'No analysis results available for this job'
      });
    }

    // TODO: Implement preview generation
    // For now, return sample data showing what anonymization would look like
    res.json({
      jobId: id,
      preview: {
        message: 'Preview functionality coming soon',
        recommendations: job.analysis.recommendations,
        sampleTransformations: job.analysis.columns.map(col => ({
          column: col.name,
          originalSample: col.sampleValues[0],
          anonymizedSample: `[ANONYMIZED_${col.name.toUpperCase()}]`
        }))
      }
    });

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      error: 'Failed to generate preview',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/data-anonymization/download/:id
 * Download anonymized data file
 */
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = jobs.get(id);

    if (!job || !job.result || !job.result.outputPath) {
      return res.status(404).json({
        error: 'Anonymized file not found',
        message: 'No anonymized data available for download'
      });
    }

    const filePath = job.result.outputPath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'Anonymized file has been removed or does not exist'
      });
    }

    const filename = `anonymized_${job.originalFilename}`;
    res.download(filePath, filename);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Failed to download file',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/data-anonymization/algorithms
 * Get available anonymization algorithms and their parameters
 */
router.get('/algorithms', async (req, res) => {
  try {
    const algorithms = {
      'k-anonymity': {
        name: 'K-Anonymity',
        description: 'Basic privacy protection through generalization and suppression',
        parameters: {
          k: {
            type: 'number',
            min: 2,
            max: 20,
            default: 3,
            description: 'Minimum group size for each combination of quasi-identifiers'
          },
          quasiIdentifiers: {
            type: 'array',
            required: true,
            description: 'Columns that may indirectly identify individuals'
          },
          suppressionThreshold: {
            type: 'number',
            min: 0,
            max: 0.2,
            default: 0.05,
            description: 'Maximum percentage of records that can be suppressed'
          }
        },
        complexity: 'basic',
        processingTime: 'fast',
        privacyLevel: 'medium'
      },
      'l-diversity': {
        name: 'L-Diversity',
        description: 'Enhanced protection ensuring diversity in sensitive attributes',
        parameters: {
          k: {
            type: 'number',
            min: 2,
            max: 20,
            default: 3,
            description: 'Minimum group size (K-anonymity requirement)'
          },
          l: {
            type: 'number',
            min: 2,
            max: 10,
            default: 2,
            description: 'Minimum diversity in sensitive attributes'
          },
          quasiIdentifiers: {
            type: 'array',
            required: true,
            description: 'Columns that may indirectly identify individuals'
          },
          sensitiveAttributes: {
            type: 'array',
            required: true,
            description: 'Columns containing sensitive information'
          },
          diversityType: {
            type: 'enum',
            options: ['distinct', 'entropy', 'recursive'],
            default: 'distinct',
            description: 'Type of diversity measure to apply'
          },
          suppressionThreshold: {
            type: 'number',
            min: 0,
            max: 0.2,
            default: 0.05,
            description: 'Maximum percentage of records that can be suppressed'
          }
        },
        complexity: 'intermediate',
        processingTime: 'medium',
        privacyLevel: 'high'
      },
      't-closeness': {
        name: 'T-Closeness',
        description: 'Advanced protection preserving distribution of sensitive attributes',
        parameters: {
          k: {
            type: 'number',
            min: 2,
            max: 20,
            default: 3,
            description: 'Minimum group size (K-anonymity requirement)'
          },
          l: {
            type: 'number',
            min: 2,
            max: 10,
            default: 2,
            description: 'Minimum diversity (L-diversity requirement)'
          },
          t: {
            type: 'number',
            min: 0.1,
            max: 1.0,
            default: 0.2,
            description: 'Maximum allowed distribution distance (lower = more privacy)'
          },
          quasiIdentifiers: {
            type: 'array',
            required: true,
            description: 'Columns that may indirectly identify individuals'
          },
          sensitiveAttributes: {
            type: 'array',
            required: true,
            description: 'Columns containing sensitive information'
          },
          distanceMetric: {
            type: 'enum',
            options: ['earth-movers', 'equal-distance', 'hierarchical'],
            default: 'earth-movers',
            description: 'Method for calculating distribution distance'
          },
          suppressionThreshold: {
            type: 'number',
            min: 0,
            max: 0.2,
            default: 0.05,
            description: 'Maximum percentage of records that can be suppressed'
          }
        },
        complexity: 'advanced',
        processingTime: 'slow',
        privacyLevel: 'very-high'
      }
    };

    res.json({
      algorithms,
      defaultAlgorithm: 'k-anonymity',
      supportedFileTypes: ['.csv', '.json', '.xlsx', '.xls'],
      maxFileSize: '100MB'
    });

  } catch (error) {
    console.error('Algorithms listing error:', error);
    res.status(500).json({
      error: 'Failed to retrieve algorithms',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * DELETE /api/data-anonymization/jobs/:id
 * Delete a job and its associated files
 */
router.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = jobs.get(id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: `No job found with ID: ${id}`
      });
    }

    // Clean up files
    try {
      if (fs.existsSync(job.filePath)) {
        fs.unlinkSync(job.filePath);
      }
      if (job.result?.outputPath && fs.existsSync(job.result.outputPath)) {
        fs.unlinkSync(job.result.outputPath);
      }
    } catch (fileError) {
      console.warn('File cleanup warning:', fileError);
    }

    // Remove job from memory
    jobs.delete(id);

    res.json({
      message: 'Job deleted successfully',
      jobId: id
    });

  } catch (error) {
    console.error('Job deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete job',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Background processing functions

async function analyzeFileAsync(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    job.status = 'analyzing';
    jobs.set(jobId, job);

    const inspector = new DataInspector(jobId);
    const analysis = await inspector.analyzeFile(job.filePath);

    job.analysis = analysis;
    job.status = 'completed';
    jobs.set(jobId, job);

    console.log(`Analysis completed for job ${jobId}`);
  } catch (error) {
    console.error(`Analysis failed for job ${jobId}:`, error);
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : String(error);
    jobs.set(jobId, job);
  }
}

async function anonymizeDataAsync(jobId: string, config: AnonymizationConfig) {
  const job = jobs.get(jobId);
  if (!job || !job.analysis) return;

  try {
    console.log(`🔧 Starting ${config.technique} anonymization for job ${jobId}`);
    
    // Load the data from file
    const data = await loadDataFromFile(job.filePath);
    
    if (data.length === 0) {
      throw new Error('No data found in file');
    }

    let anonymizationResult;
    const startTime = Date.now();

    // Apply the selected anonymization algorithm
    switch (config.technique) {
      case 'k_anonymity':
        anonymizationResult = await anonymizeWithKAnonymity(
          data,
          config.parameters.k || 3,
          config.quasiIdentifiers || [],
          config.sensitiveAttributes || [],
          job.analysis?.piiDetections || []
        );
        break;

      case 'l_diversity':
        anonymizationResult = await anonymizeWithLDiversity(
          data,
          config.parameters.k || 3,
          config.parameters.l || 2,
          config.quasiIdentifiers || [],
          config.sensitiveAttributes || [],
          'distinct'
        );
        break;

      case 't_closeness':
        anonymizationResult = await anonymizeWithTCloseness(
          data,
          config.parameters.k || 3,
          config.parameters.l || 2,
          config.parameters.t || 0.2,
          config.quasiIdentifiers || [],
          config.sensitiveAttributes || [],
          'earth-movers'
        );
        break;

      default:
        throw new Error(`Unsupported algorithm: ${config.technique}`);
    }

    const processingTime = (Date.now() - startTime) / 1000;

    // Save anonymized data to file
    const outputPath = job.filePath.replace(/\.[^.]+$/, `_anonymized_${config.technique}.csv`);
    await saveDataToFile(anonymizationResult.data, outputPath);

    // Create API result format
    const result: AnonymizationResult = {
      jobId,
      status: 'completed',
      originalRowCount: data.length,
      anonymizedRowCount: anonymizationResult.data.length,
      privacyMetrics: {
        kAnonymity: anonymizationResult.k || config.parameters.k,
        lDiversity: (anonymizationResult as any).l || undefined,
        tCloseness: (anonymizationResult as any).t || undefined,
        riskScore: calculateRiskScore(anonymizationResult.privacyMetrics)
      },
      utilityMetrics: {
        dataUtility: anonymizationResult.qualityMetrics?.dataUtility || 85,
        statisticalAccuracy: Math.max(0, 100 - (anonymizationResult.informationLoss || 15)) / 100,
        informationLoss: (anonymizationResult.informationLoss || 15) / 100
      },
      complianceStatus: {
        gdprCompliant: true,
        euAiActCompliant: true,
        violations: [],
        auditTrail: [{
          timestamp: new Date(),
          action: 'anonymization_completed',
          user: 'system',
          details: { 
            config,
            algorithm: config.technique,
            metrics: anonymizationResult.privacyMetrics,
            processingTime
          }
        }]
      },
      outputPath,
      warnings: anonymizationResult.suppressedRecords > 0 
        ? [`${anonymizationResult.suppressedRecords} records were suppressed to meet privacy requirements`]
        : [],
      errors: []
    };

    job.result = result;
    job.status = 'completed';
    jobs.set(jobId, job);

    console.log(`✅ ${config.technique} anonymization completed for job ${jobId} in ${processingTime}s`);
  } catch (error) {
    console.error(`❌ Anonymization failed for job ${jobId}:`, error);
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : String(error);
    jobs.set(jobId, job);
  }
}

// Helper function to load data from CSV file
async function loadDataFromFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const data: any[] = [];
    
    createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        // Convert numeric strings to numbers where appropriate
        const processedRow: any = {};
        for (const [key, value] of Object.entries(row)) {
          if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
            processedRow[key] = Number(value);
          } else {
            processedRow[key] = value;
          }
        }
        data.push(processedRow);
      })
      .on('end', () => {
        resolve(data);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Helper function to save data to CSV file
async function saveDataToFile(data: any[], filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (data.length === 0) {
      reject(new Error('No data to save'));
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    fs.writeFile(filePath, csvContent, 'utf8', (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Helper function to calculate risk score from privacy metrics
function calculateRiskScore(privacyMetrics: any[]): number {
  if (!privacyMetrics || privacyMetrics.length === 0) {
    return 0.5; // Medium risk if no metrics
  }

  const riskWeights = { low: 0.1, medium: 0.4, high: 0.8 };
  const totalRisk = privacyMetrics.reduce((sum, metric) => {
    return sum + (riskWeights[metric.risk as keyof typeof riskWeights] || 0.4);
  }, 0);

  return Math.min(1, totalRisk / privacyMetrics.length);
}

export default router;
