"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, FileText, BarChart3, Brain, Database, Users, Clock, Award, Target, Send, Building2, Lightbulb, Handshake, MessageSquare, Plus } from 'lucide-react';

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Demo mode - simplified state

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Demo mode - simplified functionality

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  const learningStats = {
    completedAssignments: 12,
    totalAssignments: 20,
    currentStreak: 7,
    totalHours: 45,
    aiToolsUsed: 8,
    datasetsExplored: 15
  };

  const recentAssignments = [
    { id: 1, title: 'Introduction to Machine Learning', dueDate: '2024-01-15', status: 'completed', grade: 'A' },
    { id: 2, title: 'Data Preprocessing Techniques', dueDate: '2024-01-20', status: 'in-progress', grade: null },
    { id: 3, title: 'Neural Networks Basics', dueDate: '2024-01-25', status: 'pending', grade: null },
    { id: 4, title: 'Model Evaluation Methods', dueDate: '2024-01-30', status: 'pending', grade: null }
  ];

  const availableAITools = [
    { name: 'Text Analysis', description: 'Analyze text data and sentiment', icon: Brain, status: 'available' },
    { name: 'Image Classification', description: 'Classify images using AI models', icon: Brain, status: 'available' },
    { name: 'Data Visualization', description: 'Create charts and graphs', icon: BarChart3, status: 'available' },
    { name: 'Basic Chatbot', description: 'Simple conversational AI', icon: Brain, status: 'available' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">My Learning Dashboard</h1>
              <p className="text-text-muted">Welcome back, {user.email}! Continue your AI learning journey.</p>
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Assignments</h3>
            </div>
            <p className="text-2xl font-bold text-text-primary">{learningStats.completedAssignments}/{learningStats.totalAssignments}</p>
            <p className="text-sm text-text-muted">Completed</p>
          </div>

          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Study Streak</h3>
            </div>
            <p className="text-2xl font-bold text-text-primary">{learningStats.currentStreak}</p>
            <p className="text-sm text-text-muted">Days in a row</p>
          </div>

          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Total Hours</h3>
            </div>
            <p className="text-2xl font-bold text-text-primary">{learningStats.totalHours}</p>
            <p className="text-sm text-text-muted">Hours studied</p>
          </div>

          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">AI Tools Used</h3>
            </div>
            <p className="text-2xl font-bold text-text-primary">{learningStats.aiToolsUsed}</p>
            <p className="text-sm text-text-muted">Different tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Assignments */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Recent Assignments</h2>
            </div>
            
            <div className="space-y-4">
              {recentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{assignment.title}</h3>
                    <p className="text-sm text-text-muted">Due: {assignment.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.status === 'completed' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Completed
                      </span>
                    )}
                    {assignment.status === 'in-progress' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        In Progress
                      </span>
                    )}
                    {assignment.status === 'pending' && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        Pending
                      </span>
                    )}
                    {assignment.grade && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Grade: {assignment.grade}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available AI Tools */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Available AI Tools</h2>
            </div>
            
            <div className="space-y-4">
              {availableAITools.map((tool, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <tool.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{tool.name}</h3>
                    <p className="text-sm text-text-muted">{tool.description}</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-background text-sm rounded-lg hover:bg-primary/90 transition-colors">
                    Try Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Student Features */}
        <div className="mt-8 bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">🎓 Student Hub - Demo Features</h2>
          <p className="text-text-muted mb-6">Quick access to essential student tools and resources</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-3 p-6 bg-background rounded-lg border border-border">
              <Database className="w-8 h-8 text-primary" />
              <span className="font-medium text-text-primary">Request Resources</span>
              <span className="text-sm text-text-muted text-center">Demo: Request datasets, tools, computing</span>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Try Demo</button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-background rounded-lg border border-border">
              <Handshake className="w-8 h-8 text-primary" />
              <span className="font-medium text-text-primary">Find Collaborators</span>
              <span className="text-sm text-text-muted text-center">Demo: Connect with peers & researchers</span>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Try Demo</button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-background rounded-lg border border-border">
              <Lightbulb className="w-8 h-8 text-primary" />
              <span className="font-medium text-text-primary">Share Ideas</span>
              <span className="text-sm text-text-muted text-center">Demo: Pitch research ideas</span>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Try Demo</button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-background rounded-lg border border-border">
              <Building2 className="w-8 h-8 text-primary" />
              <span className="font-medium text-text-primary">Find Companies</span>
              <span className="text-sm text-text-muted text-center">Demo: Industry connections</span>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Try Demo</button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-background rounded-lg border border-border">
              <BookOpen className="w-8 h-8 text-primary" />
              <span className="font-medium text-text-primary">Learning Paths</span>
              <span className="text-sm text-text-muted text-center">Demo: Structured courses</span>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Try Demo</button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-background rounded-lg border border-border">
              <BarChart3 className="w-8 h-8 text-primary" />
              <span className="font-medium text-text-primary">Progress Tracking</span>
              <span className="text-sm text-text-muted text-center">Demo: Learning analytics</span>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Try Demo</button>
            </div>
          </div>
        </div>

        {/* Demo Activity Feed */}
        <div className="mt-8 bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">📊 Demo Activity Feed</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-text-primary">✅ Completed: Introduction to Machine Learning</p>
                <p className="text-xs text-text-muted">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-text-primary">🔄 In Progress: Data Preprocessing Techniques</p>
                <p className="text-xs text-text-muted">Due in 3 days</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm text-text-primary">💡 New: Research collaboration opportunity</p>
                <p className="text-xs text-text-muted">Available now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm">🎓 Student Dashboard - Demo Mode</p>
      </div>
    </div>
  );
}
