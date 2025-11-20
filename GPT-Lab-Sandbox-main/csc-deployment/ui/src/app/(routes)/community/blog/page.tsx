'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  BookOpen,
  Calendar,
  User,
  Eye,
  ThumbsUp,
  MessageCircle,
  Search,
  Filter,
  ArrowRight,
  Tag,
  Clock,
  TrendingUp,
  Star,
  Globe
} from 'lucide-react';

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Articles', count: 48 },
    { id: 'research', label: 'Research', count: 18 },
    { id: 'technology', label: 'Technology', count: 12 },
    { id: 'collaboration', label: 'Collaboration', count: 8 },
    { id: 'tutorials', label: 'Tutorials', count: 10 }
  ];

  const blogArticles = [
    {
      id: 1,
      title: 'The Future of AI Research in Finland: A Comprehensive Overview',
      excerpt: 'Exploring how Finnish institutions are leading the way in responsible AI development and research collaboration.',
      author: 'Dr. Anna Virtanen',
      authorRole: 'Senior Research Fellow',
      authorAvatar: 'AV',
      publishDate: '2024-01-15',
      readTime: '8 min read',
      category: 'research',
      featured: true,
      tags: ['AI', 'Research', 'Finland', 'Innovation'],
      image: '/api/placeholder/600/300',
      views: 1247,
      likes: 89,
      comments: 23
    },
    {
      id: 2,
      title: 'Building Ethical AI Systems: A Practical Guide for Researchers',
      excerpt: 'Learn how to implement ethical considerations in your AI research projects with real-world examples and best practices.',
      author: 'Mika Koskinen',
      authorRole: 'PhD Candidate',
      authorAvatar: 'MK',
      publishDate: '2024-01-12',
      readTime: '12 min read',
      category: 'tutorials',
      featured: true,
      tags: ['Ethics', 'AI', 'Tutorial', 'Best Practices'],
      image: '/api/placeholder/600/300',
      views: 892,
      likes: 67,
      comments: 15
    },
    {
      id: 3,
      title: 'Collaborative Research: Success Stories from Finnish Universities',
      excerpt: 'Discover how Finnish universities are fostering innovation through strategic partnerships and collaborative research initiatives.',
      author: 'Platform Team',
      authorRole: 'SW4E Team',
      authorAvatar: 'SW',
      publishDate: '2024-01-10',
      readTime: '6 min read',
      category: 'collaboration',
      featured: false,
      tags: ['Collaboration', 'Universities', 'Success Stories', 'Innovation'],
      image: '/api/placeholder/600/300',
      views: 634,
      likes: 45,
      comments: 8
    },
    {
      id: 4,
      title: 'Advanced Machine Learning Techniques for Climate Research',
      excerpt: 'Exploring cutting-edge ML applications in climate science and environmental research with practical implementation examples.',
      author: 'Dr. Liisa Korpela',
      authorRole: 'Climate Research Director',
      authorAvatar: 'LK',
      publishDate: '2024-01-08',
      readTime: '15 min read',
      category: 'technology',
      featured: false,
      tags: ['Machine Learning', 'Climate', 'Research', 'Environment'],
      image: '/api/placeholder/600/300',
      views: 756,
      likes: 52,
      comments: 12
    },
    {
      id: 5,
      title: 'Getting Started with SW4E Platform: A Complete Tutorial',
      excerpt: 'Step-by-step guide to using the SW4E platform for your research projects, from setup to advanced features.',
      author: 'Platform Team',
      authorRole: 'SW4E Team',
      authorAvatar: 'SW',
      publishDate: '2024-01-05',
      readTime: '10 min read',
      category: 'tutorials',
      featured: false,
      tags: ['Tutorial', 'Platform', 'Getting Started', 'Guide'],
      image: '/api/placeholder/600/300',
      views: 1456,
      likes: 123,
      comments: 34
    },
    {
      id: 6,
      title: 'Data Privacy in Research: GDPR Compliance for AI Projects',
      excerpt: 'Understanding data protection requirements and implementing privacy-preserving techniques in your AI research.',
      author: 'Legal Team',
      authorRole: 'Compliance Officer',
      authorAvatar: 'LT',
      publishDate: '2024-01-03',
      readTime: '7 min read',
      category: 'research',
      featured: false,
      tags: ['Privacy', 'GDPR', 'Compliance', 'Data Protection'],
      image: '/api/placeholder/600/300',
      views: 423,
      likes: 28,
      comments: 6
    }
  ];

  const filteredArticles = blogArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      research: 'bg-blue-500/20 text-blue-600',
      technology: 'bg-green-500/20 text-green-600',
      collaboration: 'bg-purple-500/20 text-purple-600',
      tutorials: 'bg-orange-500/20 text-orange-600'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      {/* Header */}
      <div className="bg-surface/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                SW4E Research Blog
              </h1>
              <p className="text-text-secondary">
                Insights, tutorials, and stories from the Finnish research community
              </p>
            </div>
            <Button className="btn-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search articles, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.label}
                  <Badge variant="muted" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Articles */}
        {selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {blogArticles.filter(article => article.featured).map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/50" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="accent" className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                      <Badge variant="muted">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2 hover:text-primary cursor-pointer">
                      {article.title}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">{article.authorAvatar}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{article.author}</div>
                          <div className="text-xs text-text-muted">{article.authorRole}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            {selectedCategory === 'all' ? 'All Articles' : `${categories.find(c => c.id === selectedCategory)?.label}`}
          </h2>
          
          {filteredArticles.map((article) => (
            <Card key={article.id} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex gap-6">
                <div className="w-32 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-primary/50" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="muted" className={getCategoryColor(article.category)}>
                      {article.category}
                    </Badge>
                    {article.featured && (
                      <Badge variant="accent">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-text-primary mb-2 hover:text-primary cursor-pointer">
                    {article.title}
                  </h3>
                  
                  <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="accent" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {article.publishDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {article.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {article.comments}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No articles found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-12">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Stay Updated with SW4E Research
              </h2>
              <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                Get the latest articles, research insights, and platform updates delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button className="btn-primary">
                  Subscribe
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
