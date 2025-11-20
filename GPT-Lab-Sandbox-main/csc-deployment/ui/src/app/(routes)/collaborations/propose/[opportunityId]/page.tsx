'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select } from '@/components/Select';
import { Badge } from '@/components/Badge';
import { 
  ArrowLeft, 
  Send, 
  Users, 
  Euro, 
  Clock, 
  FileText,
  CheckCircle,
  AlertCircle,
  Building2,
  GraduationCap,
  Handshake,
  Target,
  Briefcase
} from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  organization: string;
  organizationType: string;
  location: string;
  duration: string;
  budget: string;
  skills: string[];
  requirements: any;
  benefits: string[];
}

interface ProposalForm {
  proposerName: string;
  proposerEmail: string;
  proposerType: string;
  proposal: string;
  budget: string;
  timeline: string;
  teamMembers: string[];
  resources: {
    technical: string;
    financial: string;
    human: string;
  };
  terms: {
    ipOwnership: string;
    confidentiality: boolean;
    publicationRights: boolean;
    commercialRights: boolean;
  };
}

export default function ProposeCollaborationPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.opportunityId as string;
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState<ProposalForm>({
    proposerName: '',
    proposerEmail: '',
    proposerType: '',
    proposal: '',
    budget: '',
    timeline: '',
    teamMembers: [],
    resources: {
      technical: '',
      financial: '',
      human: ''
    },
    terms: {
      ipOwnership: '',
      confidentiality: false,
      publicationRights: false,
      commercialRights: false
    }
  });

  // Fetch opportunity details
  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/collaborations/opportunities/${opportunityId}`);
        const data = await response.json();
        
        if (data.success) {
          setOpportunity(data.opportunity);
        } else {
          setError('Opportunity not found');
        }
      } catch (err) {
        setError('Error fetching opportunity');
        console.error('Error fetching opportunity:', err);
      } finally {
        setLoading(false);
      }
    };

    if (opportunityId) {
      fetchOpportunity();
    }
  }, [opportunityId]);

  const updateForm = (field: keyof ProposalForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateResources = (field: keyof ProposalForm['resources'], value: string) => {
    setForm(prev => ({
      ...prev,
      resources: { ...prev.resources, [field]: value }
    }));
  };

  const updateTerms = (field: keyof ProposalForm['terms'], value: any) => {
    setForm(prev => ({
      ...prev,
      terms: { ...prev.terms, [field]: value }
    }));
  };

  const addTeamMember = (member: string) => {
    if (member.trim() && !form.teamMembers.includes(member.trim())) {
      updateForm('teamMembers', [...form.teamMembers, member.trim()]);
    }
  };

  const removeTeamMember = (member: string) => {
    updateForm('teamMembers', form.teamMembers.filter(m => m !== member));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!opportunity) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch('http://localhost:8080/api/collaborations/propose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          proposerId: 'user-123', // This would come from auth context
          proposerName: form.proposerName,
          proposerEmail: form.proposerEmail,
          proposerType: form.proposerType,
          proposal: form.proposal,
          budget: form.budget,
          timeline: form.timeline,
          teamMembers: form.teamMembers,
          resources: form.resources,
          terms: form.terms
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/collaborations/discovery');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit proposal');
      }
    } catch (err) {
      setError('Error submitting proposal');
      console.error('Error submitting proposal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company-company':
        return Building2;
      case 'company-academic':
        return Handshake;
      case 'academic-academic':
        return GraduationCap;
      case 'individual-individual':
        return Users;
      default:
        return Target;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading opportunity details...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Error</h2>
          <p className="text-text-secondary mb-6">{error || 'Opportunity not found'}</p>
          <Button onClick={() => router.push('/collaborations/discovery')}>
            Back to Opportunities
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Proposal Submitted!</h2>
          <p className="text-text-secondary mb-6">
            Your collaboration proposal has been submitted successfully. You'll be notified when the organization responds.
          </p>
          <Button onClick={() => router.push('/collaborations/discovery')}>
            Back to Opportunities
          </Button>
        </Card>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(opportunity.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Submit Collaboration Proposal</h1>
          <p className="text-text-secondary">Submit your proposal for this collaboration opportunity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunity Details */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TypeIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{opportunity.title}</h3>
                  <p className="text-sm text-text-secondary">{opportunity.organization}</p>
                </div>
              </div>

              <p className="text-text-secondary text-sm mb-4">{opportunity.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-text-secondary">Duration: {opportunity.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="w-4 h-4 text-gray-500" />
                  <span className="text-text-secondary">Budget: {opportunity.budget}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-text-secondary">Category: {opportunity.category}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">Benefits</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  {opportunity.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Proposal Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Your Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={form.proposerName}
                        onChange={(e) => updateForm('proposerName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        value={form.proposerEmail}
                        onChange={(e) => updateForm('proposerEmail', e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Organization Type *
                      </label>
                      <Select
                        value={form.proposerType}
                        onValueChange={(value) => updateForm('proposerType', value)}
                      >
                        <option value="">Select type</option>
                        <option value="company">Company</option>
                        <option value="academic">Academic Institution</option>
                        <option value="individual">Individual Researcher</option>
                        <option value="government">Government Agency</option>
                        <option value="nonprofit">Non-profit Organization</option>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Proposal Details */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Proposal Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Your Proposal *
                      </label>
                      <Textarea
                        placeholder="Describe your approach, methodology, and how you plan to contribute to this collaboration..."
                        value={form.proposal}
                        onChange={(e) => updateForm('proposal', e.target.value)}
                        rows={6}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Proposed Budget
                        </label>
                        <Input
                          type="text"
                          placeholder="€50K - €100K"
                          value={form.budget}
                          onChange={(e) => updateForm('budget', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Proposed Timeline
                        </label>
                        <Input
                          type="text"
                          placeholder="6-12 months"
                          value={form.timeline}
                          onChange={(e) => updateForm('timeline', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Team Members</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Add team member name"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTeamMember((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add team member name"]') as HTMLInputElement;
                          if (input) {
                            addTeamMember(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.teamMembers.map((member) => (
                        <Badge key={member} variant="accent" className="flex items-center gap-1">
                          {member}
                          <button
                            type="button"
                            onClick={() => removeTeamMember(member)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Resources You Can Contribute</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Technical Resources
                      </label>
                      <Textarea
                        placeholder="Describe technical resources, equipment, or expertise you can provide..."
                        value={form.resources.technical}
                        onChange={(e) => updateResources('technical', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Financial Resources
                      </label>
                      <Textarea
                        placeholder="Describe financial contributions, funding, or budget allocation..."
                        value={form.resources.financial}
                        onChange={(e) => updateResources('financial', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Human Resources
                      </label>
                      <Textarea
                        placeholder="Describe human resources, team members, or expertise you can provide..."
                        value={form.resources.human}
                        onChange={(e) => updateResources('human', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Terms and Conditions</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Intellectual Property Ownership
                      </label>
                      <Select
                        value={form.terms.ipOwnership}
                        onValueChange={(value) => updateTerms('ipOwnership', value)}
                      >
                        <option value="">Select preference</option>
                        <option value="joint">Joint ownership</option>
                        <option value="proposer">Proposer retains ownership</option>
                        <option value="organization">Organization retains ownership</option>
                        <option value="negotiable">Negotiable</option>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.terms.confidentiality}
                          onChange={(e) => updateTerms('confidentiality', e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-text-secondary">
                          I agree to maintain confidentiality of sensitive information
                        </span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.terms.publicationRights}
                          onChange={(e) => updateTerms('publicationRights', e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-text-secondary">
                          I agree to publication rights and academic sharing
                        </span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.terms.commercialRights}
                          onChange={(e) => updateTerms('commercialRights', e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-text-secondary">
                          I agree to commercial rights and potential commercialization
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submitting || !form.proposerName || !form.proposerEmail || !form.proposerType || !form.proposal}
                    className="flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Proposal
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
