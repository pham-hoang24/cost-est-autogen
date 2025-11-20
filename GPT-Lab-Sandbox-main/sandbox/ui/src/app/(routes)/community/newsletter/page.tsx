'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Mail,
  CheckCircle,
  Users,
  Calendar,
  TrendingUp,
  Star,
  Globe,
  Bell,
  ArrowRight,
  Send,
  BookOpen,
  MessageCircle,
  Target,
  Zap
} from 'lucide-react';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('weekly');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const topics = [
    {
      id: 'research',
      name: 'Research Updates',
      description: 'Latest research findings and breakthroughs',
      icon: BookOpen,
      subscribers: 1247
    },
    {
      id: 'technology',
      name: 'Technology News',
      description: 'AI, ML, and tech innovations',
      icon: Zap,
      subscribers: 892
    },
    {
      id: 'collaboration',
      name: 'Collaboration Opportunities',
      description: 'Partnership and collaboration announcements',
      icon: Users,
      subscribers: 634
    },
    {
      id: 'platform',
      name: 'Platform Updates',
      description: 'New features and platform improvements',
      icon: Target,
      subscribers: 1456
    },
    {
      id: 'events',
      name: 'Events & Webinars',
      description: 'Upcoming events and educational content',
      icon: Calendar,
      subscribers: 756
    },
    {
      id: 'community',
      name: 'Community Highlights',
      description: 'Success stories and member spotlights',
      icon: MessageCircle,
      subscribers: 423
    }
  ];

  const recentNewsletters = [
    {
      id: 1,
      title: 'January 2024: AI Research Breakthroughs in Finland',
      date: '2024-01-15',
      topics: ['research', 'technology'],
      readTime: '5 min read',
      subscribers: 1247,
      openRate: '68%',
      clickRate: '23%'
    },
    {
      id: 2,
      title: 'Weekly Platform Update: New Collaboration Features',
      date: '2024-01-12',
      topics: ['platform', 'collaboration'],
      readTime: '3 min read',
      subscribers: 1456,
      openRate: '72%',
      clickRate: '31%'
    },
    {
      id: 3,
      title: 'Research Spotlight: Climate AI Applications',
      date: '2024-01-08',
      topics: ['research', 'events'],
      readTime: '7 min read',
      subscribers: 892,
      openRate: '65%',
      clickRate: '28%'
    }
  ];

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubscribe = () => {
    if (email && selectedTopics.length > 0) {
      setIsSubscribed(true);
    }
  };

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Welcome to SW4E Newsletter!
          </h1>
          <p className="text-lg text-text-secondary mb-6">
            You've successfully subscribed to our newsletter. You'll receive updates on:
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {selectedTopics.map(topicId => {
              const topic = topics.find(t => t.id === topicId);
              return topic ? (
                <Badge key={topicId} variant="accent">
                  {topic.name}
                </Badge>
              ) : null;
            })}
          </div>
          <p className="text-text-secondary mb-6">
            Frequency: {frequency === 'weekly' ? 'Weekly' : frequency === 'monthly' ? 'Monthly' : 'Daily'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setIsSubscribed(false)}
            >
              Change Preferences
            </Button>
            <Button className="btn-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Articles
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      {/* Header */}
      <div className="bg-surface/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              SW4E Newsletter
            </h1>
            <p className="text-text-secondary">
              Stay updated with the latest research, technology, and collaboration opportunities
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Subscription Form */}
        <Card className="p-8 mb-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-text-secondary">
              Get curated content delivered to your inbox
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            {/* Frequency Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Frequency *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'daily', label: 'Daily', description: 'Every day' },
                  { id: 'weekly', label: 'Weekly', description: 'Every Monday' },
                  { id: 'monthly', label: 'Monthly', description: 'First of month' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFrequency(option.id)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      frequency === option.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-text-muted">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-4">
                Topics of Interest * (Select at least one)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map((topic) => {
                  const Icon = topic.icon;
                  const isSelected = selectedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicToggle(topic.id)}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5" />
                        <div className="font-medium">{topic.name}</div>
                        <Badge variant="muted" className="ml-auto">
                          {topic.subscribers} subscribers
                        </Badge>
                      </div>
                      <div className="text-sm text-text-muted">{topic.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subscribe Button */}
            <div className="text-center">
              <Button 
                className="btn-primary btn-lg"
                onClick={handleSubscribe}
                disabled={!email || selectedTopics.length === 0}
              >
                <Send className="w-5 h-5 mr-2" />
                Subscribe to Newsletter
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Newsletters */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Recent Newsletters
          </h2>
          <div className="space-y-4">
            {recentNewsletters.map((newsletter) => (
              <Card key={newsletter.id} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {newsletter.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-text-muted mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {newsletter.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {newsletter.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {newsletter.subscribers} subscribers
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        {newsletter.openRate} open rate
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <Target className="w-4 h-4" />
                        {newsletter.clickRate} click rate
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Read Issue
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">2,847</div>
            <div className="text-sm text-text-secondary">Active Subscribers</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">71%</div>
            <div className="text-sm text-text-secondary">Average Open Rate</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">4.8/5</div>
            <div className="text-sm text-text-secondary">Reader Satisfaction</div>
          </Card>
        </div>

        {/* Benefits */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Why Subscribe to SW4E Newsletter?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">Research Insights</h3>
                  <p className="text-sm text-text-secondary">Latest findings from Finnish research institutions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">Technology Updates</h3>
                  <p className="text-sm text-text-secondary">Cutting-edge AI and ML developments</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">Collaboration Opportunities</h3>
                  <p className="text-sm text-text-secondary">Connect with researchers and companies</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">Platform Updates</h3>
                  <p className="text-sm text-text-secondary">New features and improvements</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
