'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Calendar,
  FileText,
  Users,
  Brain,
  Database,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Activity
} from 'lucide-react';

export default function ResearchAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  // Demo analytics data
  const researchMetrics = {
    totalPublications: 12,
    totalCitations: 156,
    hIndex: 8,
    i10Index: 6,
    avgCitationsPerPaper: 13,
    recentPublications: 4,
    collaborationCount: 7,
    fundingReceived: 125000,
    activeProjects: 4,
    completedProjects: 8
  };

  const publicationTrends = [
    { year: '2020', publications: 2, citations: 15 },
    { year: '2021', publications: 3, citations: 28 },
    { year: '2022', publications: 4, citations: 45 },
    { year: '2023', publications: 3, citations: 52 },
    { year: '2024', publications: 4, citations: 16 }
  ];

  const collaborationData = [
    { name: 'MIT Computer Science', papers: 3, citations: 45 },
    { name: 'Google DeepMind', papers: 2, citations: 32 },
    { name: 'Stanford Medicine', papers: 2, citations: 28 },
    { name: 'IBM Research', papers: 1, citations: 18 },
    { name: 'Oxford University', papers: 1, citations: 15 }
  ];

  const topPapers = [
    {
      title: "Deep Learning Approaches to Protein Folding Prediction",
      journal: "Nature Machine Intelligence",
      year: 2024,
      citations: 23,
      impact: "High"
    },
    {
      title: "Quantum Error Correction in Noisy Intermediate-Scale Quantum Devices",
      journal: "Physical Review Letters",
      year: 2024,
      citations: 15,
      impact: "High"
    },
    {
      title: "Sustainable Battery Materials: A Computational Approach",
      journal: "Advanced Materials",
      year: 2023,
      citations: 42,
      impact: "Very High"
    },
    {
      title: "Medical Image Analysis Using Convolutional Neural Networks",
      journal: "IEEE Transactions on Medical Imaging",
      year: 2023,
      citations: 38,
      impact: "High"
    }
  ];

  const fundingData = [
    { source: 'NSF Grant', amount: 50000, year: 2024, status: 'Active' },
    { source: 'NIH Research Grant', amount: 35000, year: 2024, status: 'Active' },
    { source: 'Industry Partnership', amount: 40000, year: 2023, status: 'Completed' }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Very High':
        return 'text-purple-600 bg-purple-100';
      case 'High':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">📊 Research Analytics</h1>
          <p className="text-text-muted">Comprehensive analysis of your research performance and impact</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { key: '3months', label: '3 Months' },
              { key: '6months', label: '6 Months' },
              { key: '1year', label: '1 Year' },
              { key: '2years', label: '2 Years' },
              { key: 'all', label: 'All Time' }
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Total Publications</p>
                <p className="text-2xl font-bold text-text-primary">{researchMetrics.totalPublications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Total Citations</p>
                <p className="text-2xl font-bold text-text-primary">{researchMetrics.totalCitations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">H-Index</p>
                <p className="text-2xl font-bold text-text-primary">{researchMetrics.hIndex}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">i10-Index</p>
                <p className="text-2xl font-bold text-text-primary">{researchMetrics.i10Index}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Avg Citations/Paper</p>
                <p className="text-2xl font-bold text-text-primary">{researchMetrics.avgCitationsPerPaper}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Collaborations</p>
                <p className="text-2xl font-bold text-text-primary">{researchMetrics.collaborationCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Active Projects</p>
                <p className="text-2xl font-bold text-text-primary">{researchMetrics.activeProjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Completed Projects</p>
                <p className="text-2xl font-bold text-text-primary">{researchMetrics.completedProjects}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Publication Trends Chart */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">📈 Publication Trends</h3>
          <div className="space-y-4">
            {publicationTrends.map((trend, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 text-sm font-medium text-text-muted">{trend.year}</div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(trend.publications / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-text-muted w-12">{trend.publications} papers</span>
                  </div>
                </div>
                <div className="w-20 text-sm text-text-muted text-right">
                  {trend.citations} citations
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Papers */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">🏆 Top Performing Papers</h3>
          <div className="space-y-4">
            {topPapers.map((paper, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary mb-1">{paper.title}</h4>
                  <p className="text-sm text-text-muted">{paper.journal} • {paper.year}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-text-muted">Citations</p>
                    <p className="text-lg font-bold text-text-primary">{paper.citations}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getImpactColor(paper.impact)}`}>
                    {paper.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collaboration Network */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">🤝 Collaboration Network</h3>
          <div className="space-y-4">
            {collaborationData.map((collab, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{collab.name}</h4>
                    <p className="text-sm text-text-muted">{collab.papers} joint papers</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-text-muted">Citations</p>
                  <p className="text-lg font-bold text-text-primary">{collab.citations}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funding Overview */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">💰 Funding Overview</h3>
          <div className="space-y-4">
            {fundingData.map((funding, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{funding.source}</h4>
                    <p className="text-sm text-text-muted">{funding.year}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-text-muted">Amount</p>
                    <p className="text-lg font-bold text-text-primary">${funding.amount.toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    funding.status === 'Active' ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100'
                  }`}>
                    {funding.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a demonstration of the research analytics interface. 
              All data shown is sample data for preview purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
