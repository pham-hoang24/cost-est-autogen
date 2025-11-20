'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { 
  BookOpen,
  GraduationCap,
  Users,
  Microscope,
  FileText,
  Video,
  Download,
  ExternalLink,
  Search,
  Filter,
  Star,
  Clock,
  User,
  Tag,
  ArrowRight,
  Play,
  Code,
  Database,
  Brain,
  Lightbulb,
  Trophy,
  Globe,
  MessageCircle,
  ChevronDown
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'tutorial' | 'template' | 'dataset' | 'paper' | 'video' | 'tool' | 'course';
  category: 'getting-started' | 'machine-learning' | 'data-science' | 'research-methods' | 'collaboration' | 'best-practices';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  author: string;
  rating: number;
  downloads?: number;
  tags: string[];
  url?: string;
  featured?: boolean;
}

const academicResources: Resource[] = [
  // Getting Started
  {
    id: 'getting-started-guide',
    title: 'SW4E Platform Quick Start Guide',
    description: 'Complete guide to getting started with SW4E research platform, including account setup, first project, and basic workflows.',
    type: 'tutorial',
    category: 'getting-started',
    difficulty: 'beginner',
    duration: '30 min',
    author: 'SW4E Team',
    rating: 0,
    downloads: 0,
    tags: ['onboarding', 'basics', 'setup'],
    featured: true
  },
  {
    id: 'academic-workflow-video',
    title: 'Academic Research Workflow with SW4E',
    description: 'Video walkthrough of a complete research project lifecycle using SW4E tools and collaboration features.',
    type: 'video',
    category: 'getting-started',
    difficulty: 'beginner',
    duration: '45 min',
    author: 'Prof. Sarah Johnson',
    rating: 0,
    tags: ['workflow', 'research', 'video'],
    featured: true
  },

  // Machine Learning
  {
    id: 'ml-experiment-template',
    title: 'Machine Learning Experiment Template',
    description: 'Standardized template for ML experiments with proper documentation, version control, and reproducibility guidelines.',
    type: 'template',
    category: 'machine-learning',
    difficulty: 'intermediate',
    duration: '2 hours',
    author: 'Dr. Alex Chen',
    rating: 0,
    downloads: 0,
    tags: ['machine-learning', 'experiments', 'reproducibility']
  },
  {
    id: 'deep-learning-course',
    title: 'Deep Learning for Researchers',
    description: 'Comprehensive course covering deep learning fundamentals with hands-on projects using SW4E infrastructure.',
    type: 'course',
    category: 'machine-learning',
    difficulty: 'intermediate',
    duration: '8 weeks',
    author: 'Prof. Maria Rodriguez',
    rating: 0,
    tags: ['deep-learning', 'course', 'hands-on'],
    featured: true
  },
  {
    id: 'nlp-research-dataset',
    title: 'Multilingual NLP Research Dataset',
    description: 'Curated dataset for natural language processing research across 15 languages with annotation guidelines.',
    type: 'dataset',
    category: 'machine-learning',
    difficulty: 'advanced',
    duration: 'Variable',
    author: 'NLP Research Consortium',
    rating: 0,
    downloads: 0,
    tags: ['nlp', 'multilingual', 'dataset']
  },

  // Data Science
  {
    id: 'data-analysis-template',
    title: 'Academic Data Analysis Template',
    description: 'Jupyter notebook template for academic data analysis with statistical tests, visualizations, and reporting.',
    type: 'template',
    category: 'data-science',
    difficulty: 'beginner',
    duration: '1 hour',
    author: 'Dr. Lisa Wang',
    rating: 0,
    downloads: 0,
    tags: ['data-analysis', 'jupyter', 'statistics']
  },
  {
    id: 'reproducible-research-tool',
    title: 'Reproducible Research Toolkit',
    description: 'Complete toolkit for ensuring reproducibility in data science research including containerization and documentation.',
    type: 'tool',
    category: 'data-science',
    difficulty: 'advanced',
    duration: '3 hours',
    author: 'Reproducibility Working Group',
    rating: 0,
    downloads: 0,
    tags: ['reproducibility', 'containers', 'documentation']
  },

  // Research Methods
  {
    id: 'literature-review-guide',
    title: 'Systematic Literature Review Guide',
    description: 'Step-by-step guide for conducting systematic literature reviews in computer science and AI research.',
    type: 'tutorial',
    category: 'research-methods',
    difficulty: 'intermediate',
    duration: '2 hours',
    author: 'Dr. James Mitchell',
    rating: 0,
    tags: ['literature-review', 'methodology', 'research']
  },
  {
    id: 'hypothesis-testing-paper',
    title: 'Statistical Hypothesis Testing in AI Research',
    description: 'Comprehensive paper on proper statistical methods for AI research including multiple comparison corrections.',
    type: 'paper',
    category: 'research-methods',
    difficulty: 'advanced',
    duration: '1 hour',
    author: 'Statistics for AI Journal',
    rating: 0,
    tags: ['statistics', 'hypothesis-testing', 'methodology']
  },

  // Collaboration
  {
    id: 'collaboration-best-practices',
    title: 'Academic-Industry Collaboration Guide',
    description: 'Best practices for successful collaboration between academic researchers and industry partners.',
    type: 'tutorial',
    category: 'collaboration',
    difficulty: 'intermediate',
    duration: '45 min',
    author: 'Collaboration Excellence Team',
    rating: 0,
    downloads: 0,
    tags: ['collaboration', 'industry', 'partnerships'],
    featured: true
  },
  {
    id: 'peer-review-template',
    title: 'Peer Review Template for SW4E',
    description: 'Structured template for peer reviewing research projects and code on the SW4E platform.',
    type: 'template',
    category: 'collaboration',
    difficulty: 'intermediate',
    duration: '30 min',
    author: 'Quality Assurance Committee',
    rating: 0,
    downloads: 0,
    tags: ['peer-review', 'quality', 'feedback']
  },

  // Best Practices
  {
    id: 'ethics-ai-research',
    title: 'Ethics in AI Research: A Practical Guide',
    description: 'Comprehensive guide to ethical considerations in AI research including bias detection and mitigation strategies.',
    type: 'tutorial',
    category: 'best-practices',
    difficulty: 'intermediate',
    duration: '90 min',
    author: 'Ethics in AI Consortium',
    rating: 0,
    downloads: 0,
    tags: ['ethics', 'bias', 'responsible-ai'],
    featured: true
  },
  {
    id: 'open-science-toolkit',
    title: 'Open Science Toolkit',
    description: 'Tools and guidelines for making your research open, accessible, and reproducible following FAIR principles.',
    type: 'tool',
    category: 'best-practices',
    difficulty: 'intermediate',
    duration: '2 hours',
    author: 'Open Science Initiative',
    rating: 0,
    downloads: 0,
    tags: ['open-science', 'FAIR', 'accessibility']
  }
];

const resourceTypes = [
  { value: 'all', label: 'All Types', icon: BookOpen },
  { value: 'tutorial', label: 'Tutorials', icon: FileText },
  { value: 'template', label: 'Templates', icon: Code },
  { value: 'dataset', label: 'Datasets', icon: Database },
  { value: 'paper', label: 'Papers', icon: FileText },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'tool', label: 'Tools', icon: Lightbulb },
  { value: 'course', label: 'Courses', icon: GraduationCap }
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'research-methods', label: 'Research Methods' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'best-practices', label: 'Best Practices' }
];

const difficulties = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export default function AcademicResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredResources = academicResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesCategory && matchesDifficulty;
  });

  const featuredResources = academicResources.filter(resource => resource.featured);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'tutorial': return FileText;
      case 'template': return Code;
      case 'dataset': return Database;
      case 'paper': return FileText;
      case 'video': return Video;
      case 'tool': return Lightbulb;
      case 'course': return GraduationCap;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-text-muted bg-surface';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Academic Resources
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Comprehensive collection of tutorials, templates, datasets, and tools designed specifically for academic research and collaboration.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-primary">{academicResources.length}</div>
            <div className="text-sm text-text-secondary">Total Resources</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">Contributors</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <Download className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">Downloads</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <Star className="w-6 h-6 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">Avg Rating</div>
          </Card>
        </div>

        {/* Featured Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Featured Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => {
              const Icon = getResourceIcon(resource.type);
              return (
                <Card key={resource.id} className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 hover:border-primary/40 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {resource.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-text-secondary">{resource.rating}</span>
                      {resource.downloads && (
                        <span className="text-xs text-text-muted ml-2">
                          {resource.downloads} downloads
                        </span>
                      )}
                    </div>
                    <Button className="btn-sm btn-primary">
                      View <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline lg:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {showFilters && (
            <Card className="p-6 bg-surface/50 border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {resourceTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Resource Type Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {resourceTypes.map((type) => {
              const Icon = type.icon;
              const isActive = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-background'
                      : 'bg-surface text-text-secondary hover:bg-primary/20 hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* All Resources */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              All Resources ({filteredResources.length})
            </h2>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span>Sort by:</span>
              <select className="bg-primary/5 border border-primary/20 rounded px-2 py-1 text-text-primary">
                <option>Most Popular</option>
                <option>Newest</option>
                <option>Highest Rated</option>
                <option>Most Downloaded</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const Icon = getResourceIcon(resource.type);
              return (
                <Card key={resource.id} className="p-6 bg-surface/50 border-primary/20 hover:border-primary/40 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {resource.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-text-secondary">{resource.rating}</span>
                      </div>
                      {resource.downloads && (
                        <span className="text-xs text-text-muted">
                          {resource.downloads}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {resource.type === 'video' && (
                        <Button className="btn-xs btn-outline">
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                      )}
                      <Button className="btn-xs btn-primary">
                        {resource.type === 'template' || resource.type === 'dataset' || resource.type === 'tool' ? (
                          <>
                            <Download className="w-3 h-3 mr-1" />
                            Get
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Community Section */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Join the Academic Community
            </h2>
            <p className="text-text-secondary mb-6">
              Connect with researchers worldwide, share your knowledge, and contribute to the growing collection of academic resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community">
                <Button className="btn-primary">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              </Link>
              <Link href="/contribute">
                <Button className="btn-outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Contribute Resource
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
