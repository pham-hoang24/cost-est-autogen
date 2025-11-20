'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { 
  GraduationCap,
  BookOpen,
  Microscope,
  Brain,
  BarChart3,
  Database,
  Code,
  FileText,
  Users,
  Download,
  Star,
  Clock,
  User,
  Tag,
  Search,
  Filter,
  ChevronDown,
  Play,
  ArrowRight,
  Lightbulb,
  Target,
  CheckCircle,
  Globe
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'research' | 'coursework' | 'thesis' | 'collaboration' | 'analysis' | 'development';
  type: 'jupyter' | 'project' | 'paper' | 'presentation' | 'dataset' | 'workflow';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  author: string;
  institution: string;
  rating: number;
  downloads: number;
  tags: string[];
  featured?: boolean;
  requirements: string[];
  includes: string[];
  learning_outcomes: string[];
}

const academicTemplates: Template[] = [
  // Research Templates
  {
    id: 'ml-research-template',
    title: 'Machine Learning Research Project Template',
    description: 'Comprehensive template for ML research projects including literature review, methodology, experiments, and paper writing.',
    category: 'research',
    type: 'project',
    difficulty: 'advanced',
    duration: '3-6 months',
    author: 'Dr. Sarah Chen',
    institution: 'MIT AI Lab',
    rating: 0,
    downloads: 0,
    tags: ['machine-learning', 'research', 'methodology', 'reproducibility'],
    featured: true,
    requirements: ['Python 3.8+', 'Jupyter', 'Git', 'LaTeX'],
    includes: ['Project structure', 'Literature review template', 'Experiment notebooks', 'Paper template', 'Presentation slides'],
    learning_outcomes: ['Research methodology', 'Experiment design', 'Academic writing', 'Reproducible research']
  },
  {
    id: 'nlp-analysis-template',
    title: 'Natural Language Processing Analysis Template',
    description: 'Template for NLP research including data preprocessing, model training, evaluation, and visualization.',
    category: 'research',
    type: 'jupyter',
    difficulty: 'intermediate',
    duration: '2-4 weeks',
    author: 'Prof. Michael Rodriguez',
    institution: 'Stanford NLP Group',
    rating: 0,
    downloads: 0,
    tags: ['nlp', 'text-analysis', 'deep-learning', 'transformers'],
    requirements: ['Python', 'transformers', 'pandas', 'matplotlib'],
    includes: ['Data preprocessing notebooks', 'Model training scripts', 'Evaluation metrics', 'Visualization tools'],
    learning_outcomes: ['NLP techniques', 'Model evaluation', 'Data visualization', 'Statistical analysis']
  },

  // Coursework Templates
  {
    id: 'data-science-course-project',
    title: 'Data Science Course Project Template',
    description: 'Template for data science course projects with structured approach to problem-solving and presentation.',
    category: 'coursework',
    type: 'jupyter',
    difficulty: 'beginner',
    duration: '2-3 weeks',
    author: 'Dr. Emily Johnson',
    institution: 'UC Berkeley',
    rating: 0,
    downloads: 0,
    tags: ['data-science', 'coursework', 'statistics', 'visualization'],
    featured: true,
    requirements: ['Python', 'pandas', 'scikit-learn', 'seaborn'],
    includes: ['Problem definition', 'Data exploration', 'Analysis notebooks', 'Report template'],
    learning_outcomes: ['Data analysis', 'Statistical thinking', 'Visualization', 'Report writing']
  },
  {
    id: 'computer-vision-assignment',
    title: 'Computer Vision Assignment Template',
    description: 'Template for computer vision assignments covering image processing, feature extraction, and classification.',
    category: 'coursework',
    type: 'jupyter',
    difficulty: 'intermediate',
    duration: '1-2 weeks',
    author: 'Prof. David Kim',
    institution: 'CMU Vision Lab',
    rating: 0,
    downloads: 0,
    tags: ['computer-vision', 'image-processing', 'opencv', 'deep-learning'],
    requirements: ['Python', 'OpenCV', 'PyTorch', 'matplotlib'],
    includes: ['Image preprocessing', 'Feature extraction', 'Classification models', 'Evaluation scripts'],
    learning_outcomes: ['Image processing', 'Feature engineering', 'Model training', 'Performance evaluation']
  },

  // Thesis Templates
  {
    id: 'phd-thesis-template',
    title: 'PhD Thesis Research Template',
    description: 'Comprehensive template for PhD thesis research including planning, execution, and documentation.',
    category: 'thesis',
    type: 'project',
    difficulty: 'advanced',
    duration: '2-4 years',
    author: 'Dr. Lisa Zhang',
    institution: 'Oxford University',
    rating: 0,
    downloads: 0,
    tags: ['phd', 'thesis', 'research-planning', 'documentation'],
    featured: true,
    requirements: ['LaTeX', 'Reference manager', 'Version control', 'Research tools'],
    includes: ['Research proposal template', 'Literature review structure', 'Methodology framework', 'Thesis template'],
    learning_outcomes: ['Research planning', 'Academic writing', 'Project management', 'Critical thinking']
  },
  {
    id: 'masters-thesis-template',
    title: 'Master\'s Thesis Template',
    description: 'Template for master\'s thesis projects with structured approach to research and writing.',
    category: 'thesis',
    type: 'project',
    difficulty: 'intermediate',
    duration: '6-12 months',
    author: 'Prof. Anna Martinez',
    institution: 'ETH Zurich',
    rating: 0,
    downloads: 0,
    tags: ['masters', 'thesis', 'research', 'writing'],
    requirements: ['LaTeX', 'Research methodology', 'Data analysis tools'],
    includes: ['Thesis outline', 'Chapter templates', 'Bibliography style', 'Presentation template'],
    learning_outcomes: ['Research skills', 'Academic writing', 'Data analysis', 'Presentation skills']
  },

  // Collaboration Templates
  {
    id: 'collaborative-research-template',
    title: 'Collaborative Research Project Template',
    description: 'Template for multi-institutional research collaboration with clear roles and communication protocols.',
    category: 'collaboration',
    type: 'project',
    difficulty: 'intermediate',
    duration: '3-12 months',
    author: 'International Research Consortium',
    institution: 'Multiple Universities',
    rating: 0,
    downloads: 0,
    tags: ['collaboration', 'multi-institutional', 'project-management', 'communication'],
    requirements: ['Project management tools', 'Version control', 'Communication platforms'],
    includes: ['Collaboration agreement', 'Role definitions', 'Communication protocols', 'Milestone tracking'],
    learning_outcomes: ['Collaboration skills', 'Project management', 'Cross-cultural communication', 'Team leadership']
  },
  {
    id: 'industry-academic-partnership',
    title: 'Industry-Academic Partnership Template',
    description: 'Template for establishing and managing partnerships between academic institutions and industry.',
    category: 'collaboration',
    type: 'project',
    difficulty: 'advanced',
    duration: '6-24 months',
    author: 'Partnership Office',
    institution: 'Various',
    rating: 0,
    downloads: 0,
    tags: ['industry-partnership', 'knowledge-transfer', 'commercialization', 'ip-management'],
    requirements: ['Legal framework', 'IP management', 'Project coordination'],
    includes: ['Partnership agreement', 'IP guidelines', 'Milestone framework', 'Reporting templates'],
    learning_outcomes: ['Industry collaboration', 'IP management', 'Technology transfer', 'Business understanding']
  },

  // Analysis Templates
  {
    id: 'statistical-analysis-template',
    title: 'Statistical Analysis Template for Research',
    description: 'Comprehensive template for statistical analysis in research including hypothesis testing and reporting.',
    category: 'analysis',
    type: 'jupyter',
    difficulty: 'intermediate',
    duration: '1-2 weeks',
    author: 'Dr. Robert Taylor',
    institution: 'Harvard Statistics',
    rating: 0,
    downloads: 0,
    tags: ['statistics', 'hypothesis-testing', 'research-methods', 'reporting'],
    requirements: ['R or Python', 'Statistical packages', 'Visualization tools'],
    includes: ['Statistical test templates', 'Visualization scripts', 'Report generation', 'Interpretation guides'],
    learning_outcomes: ['Statistical analysis', 'Hypothesis testing', 'Data interpretation', 'Scientific reporting']
  },
  {
    id: 'survey-research-template',
    title: 'Survey Research Analysis Template',
    description: 'Template for designing, conducting, and analyzing survey research with proper statistical methods.',
    category: 'analysis',
    type: 'project',
    difficulty: 'beginner',
    duration: '2-4 weeks',
    author: 'Dr. Jennifer Lee',
    institution: 'Social Research Institute',
    rating: 0,
    downloads: 0,
    tags: ['survey-research', 'questionnaire-design', 'data-collection', 'analysis'],
    requirements: ['Survey tools', 'Statistical software', 'Data visualization'],
    includes: ['Survey design guide', 'Data collection protocols', 'Analysis templates', 'Report framework'],
    learning_outcomes: ['Survey design', 'Data collection', 'Response analysis', 'Research ethics']
  }
];

const categories = [
  { value: 'all', label: 'All Categories', icon: BookOpen },
  { value: 'research', label: 'Research', icon: Microscope },
  { value: 'coursework', label: 'Coursework', icon: GraduationCap },
  { value: 'thesis', label: 'Thesis', icon: FileText },
  { value: 'collaboration', label: 'Collaboration', icon: Users },
  { value: 'analysis', label: 'Analysis', icon: BarChart3 },
  { value: 'development', label: 'Development', icon: Code }
];

const types = [
  { value: 'all', label: 'All Types' },
  { value: 'jupyter', label: 'Jupyter Notebooks' },
  { value: 'project', label: 'Full Projects' },
  { value: 'paper', label: 'Paper Templates' },
  { value: 'presentation', label: 'Presentations' },
  { value: 'dataset', label: 'Datasets' },
  { value: 'workflow', label: 'Workflows' }
];

const difficulties = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export default function AcademicTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTemplates = academicTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
  });

  const featuredTemplates = academicTemplates.filter(template => template.featured);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-text-muted bg-surface';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(c => c.value === category);
    return categoryObj?.icon || BookOpen;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Academic Project Templates
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Ready-to-use templates for research projects, coursework, thesis work, and academic collaboration.
            Start your next project with proven structures and best practices.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-primary">{academicTemplates.length}</div>
            <div className="text-sm text-text-secondary">Templates</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <GraduationCap className="w-6 h-6 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">Universities</div>
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

        {/* Featured Templates */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Featured Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <Card key={template.id} className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 hover:border-primary/40 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <CategoryIcon className="w-6 h-6 text-primary" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {template.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.duration}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-text-secondary">{template.rating}</span>
                      <span className="text-xs text-text-muted ml-2">
                        {template.downloads} uses
                      </span>
                    </div>
                    <Button className="btn-sm btn-primary">
                      Use Template <ArrowRight className="w-3 h-3 ml-1" />
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
                placeholder="Search templates..."
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
                  <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
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

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-background'
                      : 'bg-surface text-text-secondary hover:bg-primary/20 hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* All Templates */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              Templates ({filteredTemplates.length})
            </h2>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span>Sort by:</span>
              <select className="bg-primary/5 border border-primary/20 rounded px-2 py-1 text-text-primary">
                <option>Most Popular</option>
                <option>Newest</option>
                <option>Highest Rated</option>
                <option>Most Used</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <Card key={template.id} className="p-6 bg-surface/50 border-primary/20 hover:border-primary/40 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                          {template.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {template.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {template.institution}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {template.duration}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-text-secondary">{template.rating}</span>
                          </div>
                          <span className="text-xs text-text-muted">
                            {template.downloads} uses
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button className="btn-xs btn-outline">
                            <Play className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button className="btn-xs btn-primary">
                            <Download className="w-3 h-3 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Can't Find What You Need?
            </h2>
            <p className="text-text-secondary mb-6">
              Request a custom template or contribute your own template to help the academic community grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/template-request">
                <Button className="btn-primary">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Request Template
                </Button>
              </Link>
              <Link href="/contribute-template">
                <Button className="btn-outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Contribute Template
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
