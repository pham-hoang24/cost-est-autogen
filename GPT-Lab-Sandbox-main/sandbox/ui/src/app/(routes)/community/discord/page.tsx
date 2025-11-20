'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  MessageCircle,
  Users,
  Hash,
  Wifi,
  Clock,
  Star,
  TrendingUp,
  Bell,
  Settings,
  Mic,
  MicOff,
  Headphones,
  Volume2,
  VolumeX,
  ArrowRight,
  ExternalLink,
  Shield,
  Crown,
  Zap,
  Target,
  Globe
} from 'lucide-react';

export default function DiscordPage() {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const channels = [
    { id: 'general', name: 'general', type: 'text', unread: 0 },
    { id: 'announcements', name: 'announcements', type: 'text', unread: 3 },
    { id: 'research', name: 'research', type: 'text', unread: 12 },
    { id: 'collaboration', name: 'collaboration', type: 'text', unread: 5 },
    { id: 'technical', name: 'technical-support', type: 'text', unread: 8 },
    { id: 'ai-ml', name: 'ai-ml', type: 'text', unread: 15 },
    { id: 'climate-research', name: 'climate-research', type: 'text', unread: 2 },
    { id: 'voice-general', name: 'General Voice', type: 'voice', unread: 0 },
    { id: 'voice-research', name: 'Research Discussion', type: 'voice', unread: 0 },
    { id: 'voice-collaboration', name: 'Collaboration Hub', type: 'voice', unread: 0 }
  ];

  const onlineMembers = [
    { id: 1, name: 'Dr. Anna Virtanen', role: 'Senior Researcher', status: 'online', avatar: 'AV' },
    { id: 2, name: 'Mika Koskinen', role: 'PhD Student', status: 'online', avatar: 'MK' },
    { id: 3, name: 'TechCorp Finland', role: 'R&D Director', status: 'online', avatar: 'TC' },
    { id: 4, name: 'Liisa Korpela', role: 'Climate Researcher', status: 'away', avatar: 'LK' },
    { id: 5, name: 'Platform Team', role: 'SW4E Team', status: 'online', avatar: 'SW' },
    { id: 6, name: 'VTT Research', role: 'Research Institute', status: 'online', avatar: 'VTT' }
  ];

  const recentMessages = [
    {
      id: 1,
      author: 'Dr. Anna Virtanen',
      avatar: 'AV',
      role: 'Senior Researcher',
      timestamp: '2 minutes ago',
      content: 'Has anyone tried the new climate AI models on the platform? The results look promising!',
      reactions: [
        { emoji: '👍', count: 5 },
        { emoji: '🔥', count: 3 }
      ]
    },
    {
      id: 2,
      author: 'Mika Koskinen',
      avatar: 'MK',
      role: 'PhD Student',
      timestamp: '5 minutes ago',
      content: 'Yes! I\'ve been working with them for my thesis. The accuracy improvement is significant.',
      reactions: [
        { emoji: '👏', count: 2 }
      ]
    },
    {
      id: 3,
      author: 'TechCorp Finland',
      avatar: 'TC',
      role: 'R&D Director',
      timestamp: '8 minutes ago',
      content: 'We\'re looking for collaboration partners on industrial AI applications. Anyone interested?',
      reactions: [
        { emoji: '🤝', count: 4 },
        { emoji: '💼', count: 2 }
      ]
    }
  ];

  const communityStats = [
    { label: 'Total Members', value: '1,247', icon: Users, color: 'text-blue-500' },
    { label: 'Online Now', value: '156', icon: Wifi, color: 'text-green-500' },
    { label: 'Active Channels', value: '12', icon: Hash, color: 'text-purple-500' },
    { label: 'Messages Today', value: '2,847', icon: MessageCircle, color: 'text-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      {/* Header */}
      <div className="bg-surface/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                SW4E Discord Community
              </h1>
              <p className="text-text-secondary">
                Join the conversation with Finnish researchers and collaborators
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="accent" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                156 Online
              </Badge>
              <Button className="btn-primary">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Discord
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {communityStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6 text-center">
                <div className={`w-12 h-12 ${stat.color.replace('text-', 'bg-')}/20 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Channels Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Channels
              </h3>
              <div className="space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                      selectedChannel === channel.id
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-surface/50'
                    }`}
                  >
                    {channel.type === 'voice' ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <Hash className="w-4 h-4" />
                    )}
                    <span className="flex-1">{channel.name}</span>
                    {channel.unread > 0 && (
                      <Badge variant="accent" className="text-xs">
                        {channel.unread}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-96 flex flex-col">
              {/* Channel Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-text-muted" />
                    <span className="font-semibold text-text-primary">
                      {channels.find(c => c.id === selectedChannel)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">{message.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-text-primary">{message.author}</span>
                          <Badge variant="muted" className="text-xs">{message.role}</Badge>
                          <span className="text-xs text-text-muted">{message.timestamp}</span>
                        </div>
                        <p className="text-text-secondary text-sm mb-2">{message.content}</p>
                        {message.reactions.length > 0 && (
                          <div className="flex gap-2">
                            {message.reactions.map((reaction, index) => (
                              <button
                                key={index}
                                className="flex items-center gap-1 px-2 py-1 bg-surface rounded-full text-xs hover:bg-surface/80"
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Message #${channels.find(c => c.id === selectedChannel)?.name}`}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Button size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Members Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Online Members
              </h3>
              <div className="space-y-3">
                {onlineMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{member.avatar}</span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                        member.status === 'online' ? 'bg-green-500' : 
                        member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {member.name}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {member.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Controls
            </h3>
            <div className="flex items-center gap-4">
              <Button
                variant={isMuted ? 'outline' : 'primary'}
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center gap-2"
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              <Button
                variant={isDeafened ? 'outline' : 'primary'}
                onClick={() => setIsDeafened(!isDeafened)}
                className="flex items-center gap-2"
              >
                {isDeafened ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                {isDeafened ? 'Undeafen' : 'Deafen'}
              </Button>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-text-muted" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-24"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Community Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Community Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Real-time Chat</h3>
              <p className="text-sm text-text-secondary">
                Instant messaging with researchers and collaborators
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Voice Channels</h3>
              <p className="text-sm text-text-secondary">
                Join voice discussions and virtual meetings
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Topic Channels</h3>
              <p className="text-sm text-text-secondary">
                Organized discussions by research area and interest
              </p>
            </Card>
          </div>
        </div>

        {/* Join CTA */}
        <div className="mt-12">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Join the SW4E Discord Community
              </h2>
              <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                Connect with over 1,200 researchers, students, and industry professionals 
                in Finland's largest AI research community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-primary btn-lg">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Join Discord Server
                </Button>
                <Button variant="outline" className="btn-lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
