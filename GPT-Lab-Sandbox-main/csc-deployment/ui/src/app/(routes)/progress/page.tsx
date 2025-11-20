'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Star,
  BarChart3,
  Calendar,
  Trophy,
  Zap,
  Users,
  Brain,
  Code,
  Database
} from 'lucide-react';

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('semester');

  // Demo progress data
  const overallStats = {
    gpa: 3.7,
    creditsCompleted: 45,
    creditsTotal: 120,
    coursesCompleted: 15,
    averageGrade: 'B+',
    studyHours: 156,
    assignmentsSubmitted: 23,
    assignmentsTotal: 25
  };

  const courses = [
    {
      id: 1,
      name: "Machine Learning",
      code: "CS 229",
      instructor: "Dr. Sarah Johnson",
      credits: 3,
      currentGrade: "A-",
      progress: 85,
      assignmentsCompleted: 8,
      assignmentsTotal: 10,
      lastActivity: "2 days ago",
      nextDue: "Feb 20, 2024",
      status: "in_progress"
    },
    {
      id: 2,
      name: "Data Visualization",
      code: "CS 147",
      instructor: "Prof. Michael Chen",
      credits: 3,
      currentGrade: "B+",
      progress: 70,
      assignmentsCompleted: 5,
      assignmentsTotal: 8,
      lastActivity: "1 day ago",
      nextDue: "Feb 18, 2024",
      status: "in_progress"
    },
    {
      id: 3,
      name: "Database Systems",
      code: "CS 145",
      instructor: "Dr. Emily Rodriguez",
      credits: 3,
      currentGrade: "A",
      progress: 95,
      assignmentsCompleted: 9,
      assignmentsTotal: 9,
      lastActivity: "3 days ago",
      nextDue: "Completed",
      status: "completed"
    },
    {
      id: 4,
      name: "AI Ethics",
      code: "CS 181",
      instructor: "Dr. James Wilson",
      credits: 2,
      currentGrade: "B+",
      progress: 100,
      assignmentsCompleted: 6,
      assignmentsTotal: 6,
      lastActivity: "1 week ago",
      nextDue: "Completed",
      status: "completed"
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "First Assignment",
      description: "Submitted your first assignment",
      icon: <CheckCircle className="w-6 h-6" />,
      earned: true,
      date: "Jan 15, 2024"
    },
    {
      id: 2,
      title: "Perfect Score",
      description: "Got 100% on an assignment",
      icon: <Star className="w-6 h-6" />,
      earned: true,
      date: "Jan 28, 2024"
    },
    {
      id: 3,
      title: "Consistent Learner",
      description: "Submitted 10 assignments on time",
      icon: <Clock className="w-6 h-6" />,
      earned: true,
      date: "Feb 10, 2024"
    },
    {
      id: 4,
      title: "Course Master",
      description: "Complete 5 courses",
      icon: <Trophy className="w-6 h-6" />,
      earned: false,
      date: null
    },
    {
      id: 5,
      title: "High Achiever",
      description: "Maintain 3.5+ GPA for a semester",
      icon: <Award className="w-6 h-6" />,
      earned: false,
      date: null
    }
  ];

  const studyStreak = {
    current: 12,
    longest: 18,
    totalDays: 45
  };

  const weeklyActivity = [
    { day: 'Mon', hours: 4.5, assignments: 2 },
    { day: 'Tue', hours: 3.2, assignments: 1 },
    { day: 'Wed', hours: 5.1, assignments: 3 },
    { day: 'Thu', hours: 2.8, assignments: 1 },
    { day: 'Fri', hours: 3.9, assignments: 2 },
    { day: 'Sat', hours: 6.2, assignments: 4 },
    { day: 'Sun', hours: 4.3, assignments: 2 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getGradeColor = (grade: string) => {
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">📊 My Progress</h1>
          <p className="text-text-muted">Track your academic performance and learning journey</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
              { key: 'semester', label: 'This Semester' },
              { key: 'year', label: 'This Year' }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-muted hover:bg-border border border-border'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Current GPA</p>
                <p className="text-2xl font-bold text-text-primary">{overallStats.gpa}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Credits Completed</p>
                <p className="text-2xl font-bold text-text-primary">
                  {overallStats.creditsCompleted}/{overallStats.creditsTotal}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Study Hours</p>
                <p className="text-2xl font-bold text-text-primary">{overallStats.studyHours}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Assignments</p>
                <p className="text-2xl font-bold text-text-primary">
                  {overallStats.assignmentsSubmitted}/{overallStats.assignmentsTotal}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">🔥 Study Streak</h3>
              <p className="text-3xl font-bold">{studyStreak.current} days</p>
              <p className="text-blue-100 text-sm">Longest: {studyStreak.longest} days</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Total Study Days</p>
              <p className="text-2xl font-bold">{studyStreak.totalDays}</p>
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">📈 Weekly Activity</h3>
          <div className="space-y-4">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex items-center">
                <div className="w-12 text-sm font-medium text-text-muted">{day.day}</div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(day.hours / 8) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-text-muted w-12">{day.hours}h</span>
                  </div>
                </div>
                <div className="w-16 text-sm text-text-muted text-right">
                  {day.assignments} assignments
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">📚 Course Progress</h3>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{course.name}</h4>
                    <p className="text-sm text-text-muted">{course.code} • {course.instructor}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-text-muted">Progress</p>
                    <p className="font-semibold text-text-primary">{course.progress}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-text-muted">Grade</p>
                    <p className={`font-semibold ${getGradeColor(course.currentGrade)}`}>
                      {course.currentGrade}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-text-muted">Assignments</p>
                    <p className="font-semibold text-text-primary">
                      {course.assignmentsCompleted}/{course.assignmentsTotal}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                    {course.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">🏆 Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border ${
                  achievement.earned 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.earned ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      achievement.earned ? 'text-green-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${
                      achievement.earned ? 'text-green-700' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.earned && (
                      <p className="text-xs text-green-600 mt-1">
                        Earned on {achievement.date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Goals */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">🎯 Learning Goals</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-text-primary">Maintain 3.5+ GPA</h4>
                  <p className="text-sm text-text-muted">Current: 3.7 GPA</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <Code className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium text-text-primary">Complete 5 Programming Projects</h4>
                  <p className="text-sm text-text-muted">Current: 3 projects completed</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-sm text-text-muted">60%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-text-primary">Join 2 Study Groups</h4>
                  <p className="text-sm text-text-muted">Current: 1 study group joined</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <span className="text-sm text-text-muted">50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a demonstration of the progress tracking interface. 
              All data shown is sample data for preview purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
