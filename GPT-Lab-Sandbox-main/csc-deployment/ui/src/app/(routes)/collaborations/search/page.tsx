'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/Select';
import Link from 'next/link';
import { 
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Building2,
  Microscope,
  Star,
  ArrowRight,
  Calendar,
  Tag,
  Eye,
  Heart,
  Share2,
  SlidersHorizontal
} from 'lucide-react';

interface CollaborationOpportunity {
  id: number;
  title: string;
  organization: string;
  location: string;
  type: string;
  duration: string;
  budget: string;
  description: string;
  requirements: string[];
  tags: string[];
  posted: string;
  applicants: number;
  isBookmarked: boolean;
  isLiked: boolean;
}

const mockOpportunities: CollaborationOpportunity[] = [
  {
    id: 1,
    title: 'AI-Powered Healthcare Analytics Platform',
    organization: 'Tampere University',
    location: 'Tampere, Finland',
    type: 'Research Partnership',
    duration: '12 months',
    budget: '€150K - €300K',
    description: 'We are seeking partners to develop an AI-powered platform for healthcare analytics that can process large-scale medical data and provide actionable insights for clinical decision-making.',
    requirements: ['PhD in Computer Science', '5+ years ML experience', 'Healthcare domain knowledge'],
    tags: ['AI/ML', 'Healthcare', 'Data Science', 'Python', 'TensorFlow'],
    posted: '2 days ago',
    applicants: 12,
    isBookmarked: false,
    isLiked: false
  },
  {
    id: 2,
    title: 'Quantum Computing Research Initiative',
    organization: 'Aalto University',
    location: 'Espoo, Finland',
    type: 'Joint Venture',
    duration: '24 months',
    budget: '€500K+',
    description: 'Collaborative research project focusing on quantum algorithms for optimization problems. Looking for partners with expertise in quantum computing and optimization theory.',
    requirements: ['PhD in Physics/CS', 'Quantum computing experience', 'Optimization algorithms'],
    tags: ['Quantum Computing', 'Physics', 'Advanced Research', 'C++', 'Qiskit'],
    posted: '1 week ago',
    applicants: 8,
    isBookmarked: true,
    isLiked: true
  },
  {
    id: 3,
    title: 'Sustainable Energy Solutions',
    organization: 'VTT Technical Research Centre',
    location: 'Helsinki, Finland',
    type: 'Technology Transfer',
    duration: '18 months',
    budget: '€100K - €200K',
    description: 'Development of sustainable energy storage solutions using novel materials. Seeking industry partners for commercialization and scale-up.',
    requirements: ['Engineering background', 'Materials science experience', 'Industry connections'],
    tags: ['Clean Energy', 'Sustainability', 'Engineering', 'Materials Science'],
    posted: '3 days ago',
    applicants: 15,
    isBookmarked: false,
    isLiked: false
  },
  {
    id: 4,
    title: 'Blockchain for Supply Chain Transparency',
    organization: 'University of Helsinki',
    location: 'Helsinki, Finland',
    type: 'Research Partnership',
    duration: '15 months',
    budget: '€200K - €400K',
    description: 'Research project to develop blockchain-based solutions for supply chain transparency and traceability in manufacturing industries.',
    requirements: ['Blockchain expertise', 'Supply chain knowledge', 'Smart contracts'],
    tags: ['Blockchain', 'Supply Chain', 'Smart Contracts', 'Solidity', 'Web3'],
    posted: '5 days ago',
    applicants: 6,
    isBookmarked: false,
    isLiked: true
  },
  {
    id: 5,
    title: 'IoT Security Framework',
    organization: 'Tampere University of Technology',
    location: 'Tampere, Finland',
    type: 'Joint Venture',
    duration: '20 months',
    budget: '€300K - €500K',
    description: 'Development of comprehensive security framework for IoT devices and networks. Focus on edge computing and real-time threat detection.',
    requirements: ['Cybersecurity expertise', 'IoT experience', 'Edge computing knowledge'],
    tags: ['Cybersecurity', 'IoT', 'Edge Computing', 'C', 'Embedded Systems'],
    posted: '1 week ago',
    applicants: 9,
    isBookmarked: true,
    isLiked: false
  }
];

const filterOptions = {
  types: ['All', 'Research Partnership', 'Joint Venture', 'Technology Transfer', 'Consulting', 'Funding'],
  durations: ['All', '1-3 months', '3-6 months', '6-12 months', '1-2 years', '2+ years'],
  budgets: ['All', 'Less than €10K', '€10K - €50K', '€50K - €100K', '€100K - €500K', '€500K+'],
  locations: ['All', 'Finland', 'Europe', 'North America', 'Asia', 'Other']
};

export default function CollaborationSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [opportunities, setOpportunities] = useState<CollaborationOpportunity[]>(mockOpportunities);

  const toggleBookmark = (id: number) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === id ? { ...opp, isBookmarked: !opp.isBookmarked } : opp
      )
    );
  };

  const toggleLike = (id: number) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === id ? { ...opp, isLiked: !opp.isLiked } : opp
      )
    );
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || opp.type === selectedType;
    const matchesDuration = selectedDuration === 'All' || opp.duration === selectedDuration;
    const matchesBudget = selectedBudget === 'All' || opp.budget === selectedBudget;
    const matchesLocation = selectedLocation === 'All' || opp.location.includes(selectedLocation);

    return matchesSearch && matchesType && matchesDuration && matchesBudget && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Find Collaboration Opportunities</h1>
          <p className="text-text-secondary">Discover research partnerships, funding opportunities, and collaboration projects</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-surface/50 border-primary/20 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <Input
                type="text"
                placeholder="Search opportunities, organizations, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-text-primary placeholder:text-text-secondary"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-text-primary border-surface/50 hover:bg-surface/30"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
              <div className="text-text-secondary text-sm">
                {filteredOpportunities.length} opportunities found
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.types.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Duration</label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.durations.map((duration) => (
                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Budget</label>
                  <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.budgets.map((budget) => (
                        <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.locations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Opportunities List */}
        <div className="space-y-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="p-6 bg-surface/50 border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{opportunity.title}</h3>
                  <div className="flex items-center text-text-secondary text-sm mb-2">
                    <Building2 className="w-4 h-4 mr-2" />
                    {opportunity.organization}
                  </div>
                  <div className="flex items-center text-text-secondary text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    {opportunity.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(opportunity.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      opportunity.isBookmarked 
                        ? 'text-yellow-500 bg-yellow-500/20' 
                        : 'text-text-secondary hover:text-yellow-500 hover:bg-yellow-500/20'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleLike(opportunity.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      opportunity.isLiked 
                        ? 'text-red-500 bg-red-500/20' 
                        : 'text-text-secondary hover:text-red-500 hover:bg-red-500/20'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/20 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-text-secondary mb-4 line-clamp-2">{opportunity.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center text-text-secondary text-sm">
                  <Tag className="w-4 h-4 mr-2" />
                  {opportunity.type}
                </div>
                <div className="flex items-center text-text-secondary text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {opportunity.duration}
                </div>
                <div className="flex items-center text-text-secondary text-sm">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {opportunity.budget}
                </div>
                <div className="flex items-center text-text-secondary text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  {opportunity.applicants} applicants
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {opportunity.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-text-secondary text-sm">
                  Posted {opportunity.posted}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-text-primary border-surface/50 hover:bg-surface/30">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-background">
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredOpportunities.length === 0 && (
          <Card className="p-8 bg-surface/50 border-primary/20 text-center">
            <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No opportunities found</h3>
            <p className="text-text-secondary mb-6">
              Try adjusting your search criteria or filters to find more opportunities.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setSelectedDuration('All');
                setSelectedBudget('All');
                setSelectedLocation('All');
              }}
              className="btn-primary"
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
