'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Eye, Upload, CheckCircle, Target, BarChart3, Download } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface ComputerVisionServiceProps {
  service: any;
}

export default function ComputerVisionService({ service }: ComputerVisionServiceProps) {
  const [selectedTask, setSelectedTask] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const visionTasks = [
    { id: 'classification', name: 'Image Classification', description: 'Identify objects in images' },
    { id: 'detection', name: 'Object Detection', description: 'Locate and identify multiple objects' },
    { id: 'segmentation', name: 'Image Segmentation', description: 'Pixel-level object identification' },
    { id: 'ocr', name: 'Text Recognition (OCR)', description: 'Extract text from images' }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processImage = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const mockResults = {
        classification: {
          predictions: [
            { label: 'Golden Retriever', confidence: 0.94 },
            { label: 'Dog', confidence: 0.89 },
            { label: 'Pet', confidence: 0.76 }
          ]
        },
        detection: {
          objects: [
            { label: 'Person', confidence: 0.92, bbox: [120, 50, 200, 300] },
            { label: 'Car', confidence: 0.87, bbox: [300, 150, 500, 280] },
            { label: 'Tree', confidence: 0.73, bbox: [50, 20, 150, 200] }
          ]
        },
        segmentation: {
          segments: [
            { label: 'Sky', pixels: 45230, percentage: 23.4 },
            { label: 'Building', pixels: 67890, percentage: 35.1 },
            { label: 'Road', pixels: 32145, percentage: 16.6 }
          ]
        },
        ocr: {
          text: 'STOP\nMain Street\nSpeed Limit 25',
          confidence: 0.91,
          words: [
            { text: 'STOP', confidence: 0.98, bbox: [45, 20, 95, 45] },
            { text: 'Main Street', confidence: 0.89, bbox: [30, 60, 110, 80] }
          ]
        }
      };
      
      setResults(mockResults[selectedTask as keyof typeof mockResults]);
      setIsProcessing(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-blue-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Advanced computer vision processing with object detection, classification, and OCR capabilities.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Computer Vision Analysis</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-white mb-2">Select Vision Task</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {visionTasks.map((task) => (
                <Button
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  variant={selectedTask === task.id ? 'primary' : 'outline'}
                  className="text-sm"
                >
                  {task.name}
                </Button>
              ))}
            </div>
            {selectedTask && (
              <p className="text-slate-400 text-sm mt-2">
                {visionTasks.find(t => t.id === selectedTask)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white mb-2">Upload Image</label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose Image
                </Button>
              </label>
            </div>

            {imagePreview && (
              <Card className="p-4 bg-slate-700 mt-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="text-white font-medium">Image Preview</h4>
                    <p className="text-slate-400 text-sm">{uploadedImage?.name}</p>
                    <p className="text-slate-400 text-sm">
                      {uploadedImage ? `${(uploadedImage.size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <Button 
            onClick={processImage}
            disabled={!selectedTask || !uploadedImage || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Eye className="w-4 h-4 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Analyze Image
              </>
            )}
          </Button>
        </div>
      </Card>

      {results && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Analysis Results</h3>
          
          {selectedTask === 'classification' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Top Predictions:</h4>
              {results.predictions?.map((pred: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-white">{pred.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ width: `${pred.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-blue-400 text-sm">{(pred.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTask === 'detection' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Detected Objects:</h4>
              {results.objects?.map((obj: any, index: number) => (
                <Card key={index} className="p-3 bg-slate-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-white font-medium">{obj.label}</span>
                      <p className="text-slate-400 text-sm">
                        Position: [{obj.bbox.join(', ')}]
                      </p>
                    </div>
                    <Badge variant="secondary">{(obj.confidence * 100).toFixed(1)}%</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {selectedTask === 'ocr' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Extracted Text:</h4>
                <Card className="p-4 bg-slate-700">
                  <pre className="text-white whitespace-pre-wrap">{results.text}</pre>
                  <Badge variant="secondary" className="mt-2">
                    Confidence: {(results.confidence * 100).toFixed(1)}%
                  </Badge>
                </Card>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button className="bg-blue-600 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Results
            </Button>
            <Button variant="outline" onClick={() => setResults(null)}>
              New Analysis
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
