'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  FileText, 
  Code, 
  Play, 
  CheckCircle,
  Download,
  Upload,
  Settings,
  Zap,
  Brain,
  Target,
  Loader2,
  ArrowRight
} from 'lucide-react';

interface TestGenerationServiceProps {
  service: any;
}

export default function TestGenerationService({ service }: TestGenerationServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [codebaseFile, setCodebaseFile] = useState<File | null>(null);
  const [testConfig, setTestConfig] = useState({
    framework: 'jest',
    coverage: 80,
    testTypes: ['unit', 'integration'],
    language: 'javascript'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTests, setGeneratedTests] = useState<any>(null);

  const handleCodebaseUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCodebaseFile(file);
    }
  };

  const generateTests = () => {
    if (!codebaseFile) {
      alert('Please upload your codebase first');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(3);

    setTimeout(() => {
      const mockTests = {
        totalFiles: 12,
        testsGenerated: 45,
        coverageAchieved: 87.3,
        framework: testConfig.framework,
        testFiles: [
          {
            name: 'userService.test.js',
            path: 'src/services/userService.test.js',
            testCount: 8,
            coverage: 92.5,
            testTypes: ['unit'],
            generatedAt: new Date().toISOString()
          },
          {
            name: 'authController.test.js',
            path: 'src/controllers/authController.test.js',
            testCount: 12,
            coverage: 88.7,
            testTypes: ['unit', 'integration'],
            generatedAt: new Date().toISOString()
          },
          {
            name: 'database.test.js',
            path: 'src/utils/database.test.js',
            testCount: 6,
            coverage: 95.2,
            testTypes: ['integration'],
            generatedAt: new Date().toISOString()
          },
          {
            name: 'api.integration.test.js',
            path: 'tests/integration/api.integration.test.js',
            testCount: 15,
            coverage: 78.9,
            testTypes: ['integration'],
            generatedAt: new Date().toISOString()
          },
          {
            name: 'utils.test.js',
            path: 'src/utils/utils.test.js',
            testCount: 4,
            coverage: 100,
            testTypes: ['unit'],
            generatedAt: new Date().toISOString()
          }
        ],
        sampleTests: {
          'userService.test.js': `const { UserService } = require('../services/userService');
const { mockUser, mockDatabase } = require('../mocks');

describe('UserService', () => {
  let userService;
  
  beforeEach(() => {
    userService = new UserService(mockDatabase);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const result = await userService.createUser(userData);
      
      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
    });

    it('should throw error for duplicate email', async () => {
      const userData = { name: 'Jane Doe', email: 'existing@example.com' };
      
      await expect(userService.createUser(userData))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('getUserById', () => {
    it('should return user for valid ID', async () => {
      const userId = 'user123';
      const result = await userService.getUserById(userId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
    });

    it('should return null for invalid ID', async () => {
      const result = await userService.getUserById('invalid');
      expect(result).toBeNull();
    });
  });
});`
        },
        recommendations: [
          'Consider adding edge case tests for error handling',
          'Add performance tests for database operations',
          'Include end-to-end tests for critical user flows',
          'Set up continuous integration with test coverage reporting'
        ]
      };

      setGeneratedTests(mockTests);
      setIsGenerating(false);
      setCurrentStep(4);
    }, 4000);
  };

  const resetGeneration = () => {
    setCurrentStep(1);
    setCodebaseFile(null);
    setGeneratedTests(null);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI-Powered Test Generation</h2>
            <p className="text-purple-200">Generate test cases from company codebase using advanced AI</p>
          </div>
        </div>
        <p className="text-slate-300">
          Automatically generate comprehensive test suites by analyzing your codebase structure, 
          identifying edge cases, and creating tests that follow best practices.
        </p>
      </Card>

      {/* Step 1: Codebase Upload */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Step 1: Upload Your Codebase</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">Upload Codebase</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    ZIP archive of your project (max 50MB)
                  </p>
                  <input
                    type="file"
                    accept=".zip,.tar.gz"
                    onChange={handleCodebaseUpload}
                    className="hidden"
                    id="codebase-upload"
                  />
                  <label htmlFor="codebase-upload">
                    <Button className="btn-primary cursor-pointer">
                      Choose File
                    </Button>
                  </label>
                </div>
                
                {codebaseFile && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Codebase uploaded: {codebaseFile.name}</span>
                    </div>
                    <div className="text-green-300 text-sm mt-1">
                      Size: {(codebaseFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">Supported Languages & Frameworks</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-700 rounded-lg text-center">
                    <Code className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <div className="text-white text-sm">JavaScript</div>
                    <div className="text-slate-400 text-xs">Jest, Mocha</div>
                  </div>
                  <div className="p-3 bg-slate-700 rounded-lg text-center">
                    <Code className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <div className="text-white text-sm">Python</div>
                    <div className="text-slate-400 text-xs">pytest, unittest</div>
                  </div>
                  <div className="p-3 bg-slate-700 rounded-lg text-center">
                    <Code className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                    <div className="text-white text-sm">Java</div>
                    <div className="text-slate-400 text-xs">JUnit, TestNG</div>
                  </div>
                  <div className="p-3 bg-slate-700 rounded-lg text-center">
                    <Code className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <div className="text-white text-sm">TypeScript</div>
                    <div className="text-slate-400 text-xs">Jest, Vitest</div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h5 className="text-blue-400 font-medium mb-2">What we analyze:</h5>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• Function signatures and parameters</li>
                    <li>• Code complexity and edge cases</li>
                    <li>• Dependencies and integrations</li>
                    <li>• Error handling patterns</li>
                    <li>• Business logic flows</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!codebaseFile}
                className="btn-primary flex items-center gap-2"
              >
                Next: Configure Tests <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Configuration */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Step 2: Configure Test Generation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Programming Language</label>
                <select 
                  value={testConfig.language}
                  onChange={(e) => setTestConfig({...testConfig, language: e.target.value})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Testing Framework</label>
                <select 
                  value={testConfig.framework}
                  onChange={(e) => setTestConfig({...testConfig, framework: e.target.value})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="jest">Jest (Recommended)</option>
                  <option value="mocha">Mocha + Chai</option>
                  <option value="vitest">Vitest</option>
                  <option value="pytest">Pytest (Python)</option>
                  <option value="junit">JUnit (Java)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Target Coverage: {testConfig.coverage}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={testConfig.coverage}
                  onChange={(e) => setTestConfig({...testConfig, coverage: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Test Types</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testConfig.testTypes.includes('unit')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTestConfig({...testConfig, testTypes: [...testConfig.testTypes, 'unit']});
                        } else {
                          setTestConfig({...testConfig, testTypes: testConfig.testTypes.filter(t => t !== 'unit')});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-white">Unit Tests</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testConfig.testTypes.includes('integration')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTestConfig({...testConfig, testTypes: [...testConfig.testTypes, 'integration']});
                        } else {
                          setTestConfig({...testConfig, testTypes: testConfig.testTypes.filter(t => t !== 'integration')});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-white">Integration Tests</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testConfig.testTypes.includes('e2e')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTestConfig({...testConfig, testTypes: [...testConfig.testTypes, 'e2e']});
                        } else {
                          setTestConfig({...testConfig, testTypes: testConfig.testTypes.filter(t => t !== 'e2e')});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-white">End-to-End Tests</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Generation Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Framework:</span>
                    <span className="text-white capitalize">{testConfig.framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Coverage:</span>
                    <span className="text-white">{testConfig.coverage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Test Types:</span>
                    <span className="text-white">{testConfig.testTypes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Tests:</span>
                    <span className="text-green-400">~45 tests</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(1)} variant="outline">
              Back
            </Button>
            <Button onClick={generateTests} className="btn-primary flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Generate Tests
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Processing */}
      {currentStep === 3 && (
        <Card className="p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Analyzing Codebase & Generating Tests...</h3>
          <p className="text-slate-400 mb-6">
            AI is analyzing your code structure and generating comprehensive test cases
          </p>
          <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-6" />
          <div className="text-slate-300">
            This process may take a few minutes depending on codebase size...
          </div>
        </Card>
      )}

      {/* Step 4: Results */}
      {currentStep === 4 && generatedTests && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{generatedTests.testsGenerated}</div>
              <div className="text-sm text-green-300">Tests Generated</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{generatedTests.totalFiles}</div>
              <div className="text-sm text-blue-300">Test Files</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{generatedTests.coverageAchieved}%</div>
              <div className="text-sm text-purple-300">Coverage Achieved</div>
            </div>
            <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{generatedTests.framework}</div>
              <div className="text-sm text-orange-300">Framework</div>
            </div>
          </div>

          {/* Generated Test Files */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Generated Test Files</h3>
            <div className="space-y-3">
              {generatedTests.testFiles.map((file: any, index: number) => (
                <Card key={index} className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{file.name}</h4>
                        <div className="text-slate-400 text-sm">{file.path}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-white font-medium">{file.testCount}</div>
                        <div className="text-slate-400">Tests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-medium">{file.coverage}%</div>
                        <div className="text-slate-400">Coverage</div>
                      </div>
                      <div className="flex gap-1">
                        {file.testTypes.map((type: string) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Sample Generated Test */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Sample Generated Test</h3>
            <div className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300">
                <code>{generatedTests.sampleTests['userService.test.js']}</code>
              </pre>
            </div>
          </Card>

          {/* AI Recommendations */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">AI Recommendations</h3>
            <div className="space-y-3">
              {generatedTests.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                  <Target className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button onClick={resetGeneration} className="btn-primary">
              Generate New Tests
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Tests
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Run Tests
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
