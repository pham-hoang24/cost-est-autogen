'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { Mic, Upload, Play, Download, Volume2, CheckCircle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/Badge';

interface SpeechProcessingServiceProps {
  service: any;
}

export default function SpeechProcessingService({ service }: SpeechProcessingServiceProps) {
  const [selectedMode, setSelectedMode] = useState('');
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const processingModes = [
    { id: 'stt', name: 'Speech-to-Text', description: 'Convert audio to text', icon: '🎤➡️📝' },
    { id: 'tts', name: 'Text-to-Speech', description: 'Convert text to natural speech', icon: '📝➡️🔊' },
    { id: 'analysis', name: 'Voice Analysis', description: 'Analyze speaker emotions and characteristics', icon: '🎤🔍' },
    { id: 'translation', name: 'Speech Translation', description: 'Translate spoken language', icon: '🗣️🌍' }
  ];

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedAudio(file);
    }
  };

  const processAudio = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const mockResults = {
        stt: {
          transcription: "Hello, this is a test of the speech-to-text system. The quality of the audio is quite good and the transcription should be accurate.",
          confidence: 0.94,
          duration: "12.4 seconds",
          words: [
            { word: "Hello", confidence: 0.98, start: 0.5, end: 1.0 },
            { word: "this", confidence: 0.95, start: 1.1, end: 1.3 },
            { word: "is", confidence: 0.97, start: 1.4, end: 1.6 }
          ]
        },
        tts: {
          audioGenerated: true,
          duration: "8.7 seconds",
          voice: "Neural Voice - Emma",
          quality: "High (48kHz)",
          downloadUrl: "#"
        },
        analysis: {
          emotion: "Confident",
          confidence: 0.83,
          speaker: {
            gender: "Female",
            ageRange: "25-35",
            accent: "American English"
          },
          audioQuality: {
            clarity: 0.91,
            noiseLevel: "Low",
            volume: "Optimal"
          }
        },
        translation: {
          originalLanguage: "English",
          translatedText: "Hola, esta es una prueba del sistema de traducción de voz.",
          targetLanguage: "Spanish",
          confidence: 0.89
        }
      };
      
      setResults(mockResults[selectedMode as keyof typeof mockResults]);
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-indigo-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Comprehensive speech processing with transcription, synthesis, analysis, and translation.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Select Processing Mode</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {processingModes.map((mode) => (
            <Card
              key={mode.id}
              className={`p-4 cursor-pointer ${selectedMode === mode.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600'}`}
              onClick={() => setSelectedMode(mode.id)}
            >
              <div className="text-center">
                <span className="text-2xl mb-2 block">{mode.icon}</span>
                <h4 className="text-white font-medium">{mode.name}</h4>
                <p className="text-slate-400 text-sm">{mode.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {selectedMode && (
          <div className="space-y-4">
            {(selectedMode === 'stt' || selectedMode === 'analysis' || selectedMode === 'translation') && (
              <div>
                <label className="block text-white mb-2">Upload Audio File</label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <Mic className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Choose Audio File
                    </Button>
                  </label>
                  <p className="text-slate-500 text-xs mt-2">Supports MP3, WAV, M4A files</p>
                </div>

                {uploadedAudio && (
                  <Card className="p-3 bg-slate-700">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      <span className="text-white">{uploadedAudio.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(uploadedAudio.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {selectedMode === 'tts' && (
              <div>
                <label className="block text-white mb-2">Text to Convert</label>
                <Textarea
                  placeholder="Enter text to convert to speech..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            <Button 
              onClick={processAudio}
              disabled={
                isProcessing || 
                (selectedMode === 'tts' && !inputText.trim()) ||
                (selectedMode !== 'tts' && !uploadedAudio)
              }
              className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <BarChart3 className="w-4 h-4 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Process Audio
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {results && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Processing Results</h3>
          
          {selectedMode === 'stt' && (
            <div className="space-y-4">
              <Card className="p-4 bg-slate-700">
                <h4 className="text-white font-medium mb-2">Transcription</h4>
                <p className="text-slate-300">{results.transcription}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">Confidence: {(results.confidence * 100).toFixed(1)}%</Badge>
                  <Badge variant="secondary">Duration: {results.duration}</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-slate-700">
                <h4 className="text-white font-medium mb-2">Word-Level Timing</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {results.words?.slice(0, 10).map((word: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-slate-300">{word.word}</span>
                      <span className="text-slate-400">{word.start}s - {word.end}s ({(word.confidence * 100).toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {selectedMode === 'tts' && (
            <div className="space-y-4">
              <Card className="p-4 bg-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <Volume2 className="w-8 h-8 text-indigo-400" />
                  <div>
                    <h4 className="text-white font-medium">Audio Generated</h4>
                    <p className="text-slate-400 text-sm">Duration: {results.duration}</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary">{results.voice}</Badge>
                  <Badge variant="secondary">{results.quality}</Badge>
                </div>
                <Button className="bg-indigo-600 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Audio
                </Button>
              </Card>
            </div>
          )}

          {selectedMode === 'analysis' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-slate-700">
                  <h4 className="text-white font-medium mb-3">Speaker Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gender:</span>
                      <span className="text-white">{results.speaker?.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Age Range:</span>
                      <span className="text-white">{results.speaker?.ageRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accent:</span>
                      <span className="text-white">{results.speaker?.accent}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-slate-700">
                  <h4 className="text-white font-medium mb-3">Emotion & Quality</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emotion:</span>
                      <Badge variant="secondary">{results.emotion}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clarity:</span>
                      <span className="text-green-400">{(results.audioQuality?.clarity * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Noise Level:</span>
                      <span className="text-white">{results.audioQuality?.noiseLevel}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button className="bg-indigo-600 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Results
            </Button>
            <Button variant="outline" onClick={() => setResults(null)}>
              New Processing
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
