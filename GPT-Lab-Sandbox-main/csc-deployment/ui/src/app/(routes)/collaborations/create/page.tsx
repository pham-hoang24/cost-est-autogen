'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/Select';
import { Textarea } from '@/components/Textarea';
import { Badge } from '@/components/Badge';
import { 
  Plus, 
  Building2, 
  Users, 
  GraduationCap,
  Handshake,
  Target,
  Briefcase,
  MapPin,
  Clock,
  Euro,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface CollaborationForm {
  title: string;
  description: string;
  type: string;
  category: string;
  organization: string;
  location: string;
  duration: string;
  budget: string;
  skills: string[];
  requirements: {
    experience: string;
    teamSize: string;
    budget: string;
    timeline: string;
  };
  benefits: string[];
}

const collaborationTypes = [
  { value: 'company-company', label: 'Company ↔ Company', icon: Building2 },
  { value: 'company-academic', label: 'Company ↔ Academic', icon: Handshake },
  { value: 'academic-academic', label: 'Academic ↔ Academic', icon: GraduationCap },
  { value: 'individual-individual', label: 'Individual ↔ Individual', icon: Users },
  { value: 'multi-party', label: 'Multi-Party Consortium', icon: Target }
];

const categories = [
  'Healthcare & AI',
  'Manufacturing & IoT',
  'Blockchain & Supply Chain',
  'Cybersecurity & AI',
  'Quantum Computing',
  'Financial Technology',
  'Energy & Sustainability',
  'Automotive & Transportation',
  'Retail & E-commerce',
  'Government & Public Sector'
];

const durations = [
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '1-2 years',
  '2+ years'
];

const budgetRanges = [
  'Under €50K',
  '€50K - €100K',
  '€100K - €250K',
  '€250K - €500K',
  '€500K+',
  'TBD'
];

const experienceLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

const teamSizes = [
  '1-2 people',
  '3-5 people',
  '6-10 people',
  '10+ people'
];

const commonSkills = [
  'Machine Learning',
  'Data Science',
  'Python',
  'JavaScript',
  'React',
  'Node.js',
  'TensorFlow',
  'PyTorch',
  'AWS',
  'Docker',
  'Kubernetes',
  'Blockchain',
  'IoT',
  'Cybersecurity',
  'Cloud Computing',
  'AI/ML',
  'Research',
  'Statistics',
  'Mathematics',
  'Engineering'
];

const commonBenefits = [
  'Access to real data',
  'Industry expertise',
  'Publication opportunities',
  'Commercialization potential',
  'Market access',
  'Technology transfer',
  'Joint IP development',
  'Cost sharing',
  'Networking opportunities',
  'Career development',
  'Mentorship',
  'Funding opportunities'
];

export default function CreateCollaborationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<CollaborationForm>({
    title: '',
    description: '',
    type: '',
    category: '',
    organization: '',
    location: '',
    duration: '',
    budget: '',
    skills: [],
    requirements: {
      experience: '',
      teamSize: '',
      budget: '',
      timeline: ''
    },
    benefits: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Basic Information', icon: Target },
    { id: 2, title: 'Details & Requirements', icon: Briefcase },
    { id: 3, title: 'Skills & Benefits', icon: CheckCircle }
  ];

  const updateForm = (field: keyof CollaborationForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateRequirements = (field: keyof CollaborationForm['requirements'], value: string) => {
    setForm(prev => ({
      ...prev,
      requirements: { ...prev.requirements, [field]: value }
    }));
  };

  const addSkill = (skill: string) => {
    if (!form.skills.includes(skill)) {
      updateForm('skills', [...form.skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    updateForm('skills', form.skills.filter(s => s !== skill));
  };

  const addBenefit = (benefit: string) => {
    if (!form.benefits.includes(benefit)) {
      updateForm('benefits', [...form.benefits, benefit]);
    }
  };

  const removeBenefit = (benefit: string) => {
    updateForm('benefits', form.benefits.filter(b => b !== benefit));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8080/api/collaborations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/collaborations/discovery?created=true');
      } else {
        setError(data.message || 'Failed to create collaboration opportunity');
      }
    } catch (err) {
      setError('Error creating collaboration opportunity');
      console.error('Error creating collaboration:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Basic Information</h2>
              <p className="text-text-secondary">Tell us about your collaboration opportunity</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Collaboration Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., AI-Powered Healthcare Analytics Platform"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="text-text-primary placeholder:text-text-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description *
                </label>
                <Textarea
                  placeholder="Describe the collaboration opportunity, goals, and expected outcomes..."
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={4}
                  className="text-text-primary placeholder:text-text-secondary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Collaboration Type *
                  </label>
                  <Select
                    value={form.type}
                    onValueChange={(value) => updateForm('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category *
                  </label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => updateForm('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Organization
                  </label>
                  <Input
                    type="text"
                    placeholder="Your organization name"
                    value={form.organization}
                    onChange={(e) => updateForm('organization', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Helsinki, Finland"
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Details & Requirements</h2>
              <p className="text-text-secondary">Specify the project details and requirements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Duration
                </label>
                <Select
                  value={form.duration}
                  onValueChange={(value) => updateForm('duration', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Budget Range
                </label>
                <Select
                  value={form.budget}
                  onValueChange={(value) => updateForm('budget', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((budget) => (
                      <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Experience Level
                  </label>
                  <Select
                    value={form.requirements.experience}
                    onValueChange={(value) => updateRequirements('experience', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Team Size
                  </label>
                  <Select
                    value={form.requirements.teamSize}
                    onValueChange={(value) => updateRequirements('teamSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamSizes.map((size) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Skills & Benefits</h2>
              <p className="text-text-secondary">Define required skills and collaboration benefits</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Required Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {form.skills.map((skill) => (
                  <Badge key={skill} variant="green" className="flex items-center gap-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {commonSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addSkill(skill)}
                    disabled={form.skills.includes(skill)}
                    className="px-3 py-2 text-sm text-text-primary border border-surface/50 rounded-lg hover:bg-surface/30 disabled:opacity-50 disabled:cursor-not-allowed bg-surface/20"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Collaboration Benefits
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {form.benefits.map((benefit) => (
                  <Badge key={benefit} variant="secondary" className="flex items-center gap-1">
                    {benefit}
                    <button
                      onClick={() => removeBenefit(benefit)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {commonBenefits.map((benefit) => (
                  <button
                    key={benefit}
                    onClick={() => addBenefit(benefit)}
                    disabled={form.benefits.includes(benefit)}
                    className="px-3 py-2 text-sm text-text-primary border border-surface/50 rounded-lg hover:bg-surface/30 disabled:opacity-50 disabled:cursor-not-allowed bg-surface/20"
                  >
                    {benefit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create Collaboration Opportunity</h1>
          <p className="text-text-secondary">Share your collaboration opportunity with the community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-primary text-white' 
                        : 'bg-surface/30 text-text-secondary'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-text-secondary'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-8 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {/* Step Content */}
        <Card className="p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 text-text-primary border-surface/50 hover:bg-surface/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Opportunity
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
