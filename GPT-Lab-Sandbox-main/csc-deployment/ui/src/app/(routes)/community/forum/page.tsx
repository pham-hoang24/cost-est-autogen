'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
  ThumbsUp,
  Reply,
  Search,
  Filter,
  Plus,
  Pin,
  Star,
  Eye,
  ArrowRight
} from 'lucide-react';

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', count: 156 },
    { id: 'general', label: 'General Discussion', count: 45 },
    { id: 'technical', label: 'Technical Support', count: 32 },
    { id: 'collaboration', label: 'Collaboration', count: 28 },
    { id: 'research', label: 'Research', count: 31 },
    { id: 'announcements', label: 'Announcements', count: 20 }
  ];

  const forumTopics = [
    {
      id: 1,
      title: 'Welcome to the SW4E Community!',
      author: 'Admin Team',
      category: 'announcements',
      replies: 24,
      views: 156,
      lastActivity: '2 hours ago',
      pinned: true,
      featured: true,
      tags: ['welcome', 'community', 'getting-started']
    },
    {
      id: 2,
      title: 'Best practices for AI model deployment in research',
      author: 'Dr. Anna Virtanen',
      category: 'technical',
      replies: 18,
      views: 89,
      lastActivity: '4 hours ago',
      pinned: false,
      featured: true,
      tags: ['ai', 'deployment', 'research', 'best-practices']
    },
    {
      id: 3,
      title: 'Looking for collaboration on climate change AI research',
      author: 'Mika Koskinen',
      category: 'collaboration',
      replies: 12,
      views: 67,
      lastActivity: '6 hours ago',
      pinned: false,
      featured: false,
      tags: ['climate', 'ai', 'collaboration', 'research']
    },
    {
      id: 4,
      title: 'How to optimize GPU usage for large-scale training?',
      author: 'TechCorp Finland',
      category: 'technical',
      replies: 8,
      views: 45,
      lastActivity: '8 hours ago',
      pinned: false,
      featured: false,
      tags: ['gpu', 'optimization', 'training', 'performance']
    },
    {
      id: 5,
      title: 'New AI services available on the platform',
      author: 'Platform Team',
      category: 'announcements',
      replies: 15,
      views: 123,
      lastActivity: '1 day ago',
      pinned: true,
      featured: false,
      tags: ['services', 'ai', 'platform', 'update']
    },
    {
      id: 6,
      title: 'Data privacy and GDPR compliance in research',
      author: 'Legal Team',
      category: 'general',
      replies: 22,
      views: 98,
      lastActivity: '1 day ago',
      pinned: false,
      featured: true,
      tags: ['privacy', 'gdpr', 'compliance', 'research']
    }
  ];

  const filteredTopics = forumTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      announcements: 'bg-blue-500/20 text-blue-600',
      technical: 'bg-green-500/20 text-green-600',
      collaboration: 'bg-purple-500/20 text-purple-600',
      research: 'bg-orange-500/20 text-orange-600',
      general: 'bg-gray-500/20 text-gray-600'
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
                SW4E Community Forum
              </h1>
              <p className="text-text-secondary">
                Connect, discuss, and collaborate with the Finnish research community
              </p>
            </div>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Topic
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
                  placeholder="Search topics, authors, or tags..."
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

        {/* Forum Topics */}
        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {topic.pinned && (
                      <Pin className="w-4 h-4 text-primary" />
                    )}
                    {topic.featured && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                    <h3 className="text-lg font-semibold text-text-primary hover:text-primary cursor-pointer">
                      {topic.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">{topic.author}</span>
                    </div>
                    <Badge variant="muted" className={getCategoryColor(topic.category)}>
                      {topic.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-muted">{topic.lastActivity}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {topic.tags.map((tag, index) => (
                      <Badge key={index} variant="accent" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                      <Reply className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">{topic.replies} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">{topic.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">12 likes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No topics found</h3>
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

        {/* Community Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">156</div>
            <div className="text-sm text-text-secondary">Total Topics</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">1,234</div>
            <div className="text-sm text-text-secondary">Active Members</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">89%</div>
            <div className="text-sm text-text-secondary">Questions Answered</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">2.4h</div>
            <div className="text-sm text-text-secondary">Avg Response Time</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
