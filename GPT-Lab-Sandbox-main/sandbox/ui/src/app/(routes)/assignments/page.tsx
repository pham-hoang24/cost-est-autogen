'use client';

import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  BookOpen,
  Download,
  Upload,
  MessageSquare,
  Star,
  Target
} from 'lucide-react';

export default function AssignmentsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Demo assignment data
  const assignments = [
    {
      id: 1,
      title: "Machine Learning Fundamentals - Assignment 1",
      course: "CS 229 - Machine Learning",
      instructor: "Dr. Sarah Johnson",
      dueDate: "2024-02-15",
      status: "submitted",
      grade: "A-",
      points: 95,
      maxPoints: 100,
      description: "Implement linear regression from scratch using gradient descent",
      attachments: ["assignment1.pdf", "dataset.csv"],
      feedback: "Excellent work! Your implementation shows strong understanding of the mathematical concepts.",
      submittedAt: "2024-02-14T10:30:00Z"
    },
    {
      id: 2,
      title: "Data Visualization Project",
      course: "CS 147 - Data Visualization",
      instructor: "Prof. Michael Chen",
      dueDate: "2024-02-20",
      status: "in_progress",
      grade: null,
      points: null,
      maxPoints: 100,
      description: "Create interactive visualizations using D3.js for climate change data",
      attachments: ["project_guidelines.pdf", "sample_data.json"],
      feedback: null,
      submittedAt: null
    },
    {
      id: 3,
      title: "Database Design Assignment",
      course: "CS 145 - Database Systems",
      instructor: "Dr. Emily Rodriguez",
      dueDate: "2024-02-18",
      status: "pending",
      grade: null,
      points: null,
      maxPoints: 80,
      description: "Design a normalized database schema for a library management system",
      attachments: ["assignment3.pdf"],
      feedback: null,
      submittedAt: null
    },
    {
      id: 4,
      title: "AI Ethics Essay",
      course: "CS 181 - AI Ethics",
      instructor: "Dr. James Wilson",
      dueDate: "2024-02-12",
      status: "late",
      grade: "B+",
      points: 85,
      maxPoints: 100,
      description: "Write a 2000-word essay on bias in machine learning algorithms",
      attachments: ["essay_guidelines.pdf"],
      feedback: "Good analysis, but could benefit from more recent examples. Submitted 2 days late.",
      submittedAt: "2024-02-14T15:45:00Z"
    },
    {
      id: 5,
      title: "Software Engineering Group Project",
      course: "CS 161 - Software Engineering",
      instructor: "Prof. Lisa Anderson",
      dueDate: "2024-03-01",
      status: "pending",
      grade: null,
      points: null,
      maxPoints: 150,
      description: "Develop a web application using React and Node.js with team of 4",
      attachments: ["project_spec.pdf", "team_contract.docx"],
      feedback: null,
      submittedAt: null
    }
  ];

  const filteredAssignments = assignments.filter(assignment => {
    if (selectedFilter === 'all') return true;
    return assignment.status === selectedFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-gray-400" />;
      case 'late':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'late':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-gray-500';
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">📚 Assignments</h1>
          <p className="text-text-muted">Track your coursework, submissions, and grades</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Submitted</p>
                <p className="text-2xl font-bold text-text-primary">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">In Progress</p>
                <p className="text-2xl font-bold text-text-primary">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Circle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Pending</p>
                <p className="text-2xl font-bold text-text-primary">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Average Grade</p>
                <p className="text-2xl font-bold text-text-primary">B+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Assignments', count: assignments.length },
              { key: 'submitted', label: 'Submitted', count: assignments.filter(a => a.status === 'submitted').length },
              { key: 'in_progress', label: 'In Progress', count: assignments.filter(a => a.status === 'in_progress').length },
              { key: 'pending', label: 'Pending', count: assignments.filter(a => a.status === 'pending').length },
              { key: 'late', label: 'Late', count: assignments.filter(a => a.status === 'late').length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter.key
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-muted hover:bg-border border border-border'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-6">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-surface rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(assignment.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                      {assignment.title}
                    </h3>
                    <p className="text-text-muted text-sm">
                      {assignment.course} • {assignment.instructor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                    {assignment.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {assignment.grade && (
                    <span className={`text-lg font-bold ${getGradeColor(assignment.grade)}`}>
                      {assignment.grade}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-text-muted mb-4">{assignment.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-text-muted">
                  <Calendar className="w-4 h-4 mr-2" />
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <Target className="w-4 h-4 mr-2" />
                  {assignment.points ? `${assignment.points}/${assignment.maxPoints} points` : `${assignment.maxPoints} points`}
                </div>
                {assignment.submittedAt && (
                  <div className="flex items-center text-sm text-text-muted">
                    <Clock className="w-4 h-4 mr-2" />
                    Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-text-primary mb-2">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {assignment.attachments.map((file, index) => (
                      <div key={index} className="flex items-center bg-background rounded-lg px-3 py-2 border border-border">
                        <FileText className="w-4 h-4 text-primary mr-2" />
                        <span className="text-sm text-text-primary">{file}</span>
                        <Download className="w-4 h-4 text-text-muted ml-2 cursor-pointer hover:text-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {assignment.feedback && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Instructor Feedback:</p>
                  <p className="text-sm text-blue-800">{assignment.feedback}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex space-x-3">
                  {assignment.status === 'pending' && (
                    <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Assignment
                    </button>
                  )}
                  {assignment.status === 'in_progress' && (
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Continue Work
                    </button>
                  )}
                  <button className="flex items-center px-4 py-2 bg-surface text-text-primary rounded-lg text-sm font-medium hover:bg-border border border-border transition-colors">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ask Question
                  </button>
                </div>
                <div className="text-sm text-text-muted">
                  {assignment.status === 'submitted' && 'Submitted'}
                  {assignment.status === 'in_progress' && 'In Progress'}
                  {assignment.status === 'pending' && 'Not Started'}
                  {assignment.status === 'late' && 'Submitted Late'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a demonstration of the assignments interface. 
              All data shown is sample data for preview purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
