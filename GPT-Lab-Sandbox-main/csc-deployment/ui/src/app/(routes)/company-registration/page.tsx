'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/Select';
import Link from 'next/link';
import { 
  Building2,
  Users,
  Handshake,
  DollarSign,
  Shield,
  Target,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Mail,
  Lock,
  User,
  FileText,
  Lightbulb,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  Briefcase,
  Globe,
  Star
} from 'lucide-react';

interface CompanyRegistrationFormData {
  // Basic Info
  email: string;
  password: string;
  confirmPassword: string;
  company_name: string;
  website: string;
  founded_year: string;
  
  // Company Details
  industry_sector: string;
  company_size: string;
  headquarters_location: string;
  description: string;
  
  // Key Personnel
  ceo_name: string;
  ceo_email: string;
  cto_name: string;
  cto_email: string;
  
  // Collaboration Interests
  research_areas: string[];
  collaboration_types: string[];
  preferred_duration: string;
  budget_range: string;
  
  // Resource Contribution
  cloud_credits: string;
  engineering_hours: string;
  data_access: string;
  equipment_access: string;
  funding_amount: string;
  mentorship_opportunities: string;
  
  // Compliance
  eu_ai_act_compliance: boolean;
  gdpr_compliance: boolean;
  ip_ownership_preference: string;
  confidentiality_agreement: boolean;
}

const industrySectors = [
  'Technology & Software',
  'Manufacturing & Industry 4.0',
  'Healthcare & Life Sciences',
  'Financial Services',
  'Energy & Utilities',
  'Automotive & Transportation',
  'Aerospace & Defense',
  'Telecommunications',
  'Retail & E-commerce',
  'Education & Training',
  'Government & Public Sector',
  'Consulting & Services',
  'Other'
];

const companySizes = [
  'Startup (1-50 employees)',
  'SME (51-250 employees)',
  'Mid-size (251-1000 employees)',
  'Large Enterprise (1000+ employees)',
  'Multinational Corporation'
];

const researchAreas = [
  'Artificial Intelligence & Machine Learning',
  'Cybersecurity',
  'Blockchain & Web3',
  'Digital Transformation',
  'Data Science & Analytics',
  'Cloud Computing',
  'Quantum Computing',
  'Software Engineering',
  'IoT & Edge Computing',
  'Robotics & Automation',
  'Biotechnology',
  'Clean Energy',
  'Advanced Materials',
  'Space Technology',
  'Other'
];

const collaborationTypes = [
  'Research Partnership',
  'Talent Pipeline',
  'Consulting Services',
  'Technology Transfer',
  'Resource Sharing',
  'Joint Ventures',
  'Licensing Agreements',
  'Student Internships'
];

const durations = [
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '1-2 years',
  '2+ years'
];

const budgetRanges = [
  'Less than €10K',
  '€10K - €50K',
  '€50K - €100K',
  '€100K - €500K',
  '€500K+'
];

const resourceLevels = [
  'None',
  'Limited access',
  'Moderate access',
  'Full access'
];

const ipPreferences = [
  'Company owns all IP',
  'Shared ownership',
  'Academic partner owns IP',
  'Decide case by case'
];

const steps = [
  { id: 1, title: 'Company Type', icon: Building2 },
  { id: 2, title: 'Company Profile', icon: FileText },
  { id: 3, title: 'Collaboration Interests', icon: Handshake },
  { id: 4, title: 'Resource Contribution', icon: Users },
  { id: 5, title: 'Compliance & Legal', icon: Shield },
  { id: 6, title: 'Review & Submit', icon: CheckCircle }
];

export default function CompanyRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CompanyRegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    company_name: '',
    website: '',
    founded_year: '',
    industry_sector: '',
    company_size: '',
    headquarters_location: '',
    description: '',
    ceo_name: '',
    ceo_email: '',
    cto_name: '',
    cto_email: '',
    research_areas: [],
    collaboration_types: [],
    preferred_duration: '',
    budget_range: '',
    cloud_credits: '',
    engineering_hours: '',
    data_access: '',
    equipment_access: '',
    funding_amount: '',
    mentorship_opportunities: '',
    eu_ai_act_compliance: false,
    gdpr_compliance: false,
    ip_ownership_preference: '',
    confidentiality_agreement: false
  });

  const updateForm = (field: keyof CompanyRegistrationFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addToArray = (field: keyof CompanyRegistrationFormData, value: string) => {
    const currentArray = form[field] as string[];
    if (!currentArray.includes(value)) {
      updateForm(field, [...currentArray, value]);
    }
  };

  const removeFromArray = (field: keyof CompanyRegistrationFormData, value: string) => {
    const currentArray = form[field] as string[];
    updateForm(field, currentArray.filter(item => item !== value));
  };

  const validateStep = (step: number): boolean => {
    // Demo version - no validation errors
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Demo version - simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message instead of redirecting
      alert('Demo: Company registration submitted successfully! This is a demonstration version.');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Company Type Selection</h2>
              <p className="text-text-secondary">Tell us about your company to help us provide the best collaboration opportunities</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Industry Sector *
                </label>
                <Select
                  value={form.industry_sector}
                  onValueChange={(value) => updateForm('industry_sector', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {industrySectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry_sector && (
                  <p className="text-red-500 text-sm mt-1">{errors.industry_sector}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Company Size *
                </label>
                <Select
                  value={form.company_size}
                  onValueChange={(value) => updateForm('company_size', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.company_size && (
                  <p className="text-red-500 text-sm mt-1">{errors.company_size}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Headquarters Location *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Helsinki, Finland"
                  value={form.headquarters_location}
                  onChange={(e) => updateForm('headquarters_location', e.target.value)}
                  className="text-text-primary placeholder:text-text-secondary"
                />
                {errors.headquarters_location && (
                  <p className="text-red-500 text-sm mt-1">{errors.headquarters_location}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Company Profile</h2>
              <p className="text-text-secondary">Provide detailed information about your company</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Your company name"
                    value={form.company_name}
                    onChange={(e) => updateForm('company_name', e.target.value)}
                    className="text-text-primary placeholder:text-text-secondary"
                  />
                  {errors.company_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={form.website}
                    onChange={(e) => updateForm('website', e.target.value)}
                    className="text-text-primary placeholder:text-text-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Founded Year
                  </label>
                  <Input
                    type="number"
                    placeholder="2020"
                    value={form.founded_year}
                    onChange={(e) => updateForm('founded_year', e.target.value)}
                    className="text-text-primary placeholder:text-text-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Employee Count
                  </label>
                  <Select
                    value={form.company_size}
                    onValueChange={(value) => updateForm('company_size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee count" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Company Description *
                </label>
                <Textarea
                  placeholder="Describe your company, its mission, and key products/services..."
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={4}
                  className="text-text-primary placeholder:text-text-secondary"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Key Personnel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      CEO Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={form.ceo_name}
                      onChange={(e) => updateForm('ceo_name', e.target.value)}
                      className="text-text-primary placeholder:text-text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      CEO Email
                    </label>
                    <Input
                      type="email"
                      placeholder="ceo@company.com"
                      value={form.ceo_email}
                      onChange={(e) => updateForm('ceo_email', e.target.value)}
                      className="text-text-primary placeholder:text-text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      CTO Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Jane Smith"
                      value={form.cto_name}
                      onChange={(e) => updateForm('cto_name', e.target.value)}
                      className="text-text-primary placeholder:text-text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      CTO Email
                    </label>
                    <Input
                      type="email"
                      placeholder="cto@company.com"
                      value={form.cto_email}
                      onChange={(e) => updateForm('cto_email', e.target.value)}
                      className="text-text-primary placeholder:text-text-secondary"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="contact@company.com"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className="text-text-primary placeholder:text-text-secondary"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={form.password}
                        onChange={(e) => updateForm('password', e.target.value)}
                        className="text-text-primary placeholder:text-text-secondary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={(e) => updateForm('confirmPassword', e.target.value)}
                        className="text-text-primary placeholder:text-text-secondary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Handshake className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Collaboration Interests</h2>
              <p className="text-text-secondary">What type of collaborations are you interested in?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Research Areas of Interest *
                </label>
                <div className="space-y-2">
                  {researchAreas.map((area) => (
                    <label key={area} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={form.research_areas.includes(area)}
                        onChange={() => 
                          form.research_areas.includes(area) 
                            ? removeFromArray('research_areas', area)
                            : addToArray('research_areas', area)
                        }
                        className="w-4 h-4 text-primary bg-surface border-surface/50 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-text-primary text-sm">{area}</span>
                    </label>
                  ))}
                </div>
                {errors.research_areas && (
                  <p className="text-red-500 text-sm mt-2">{errors.research_areas}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Collaboration Types *
                </label>
                <div className="space-y-2">
                  {collaborationTypes.map((type) => (
                    <label key={type} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={form.collaboration_types.includes(type)}
                        onChange={() => 
                          form.collaboration_types.includes(type) 
                            ? removeFromArray('collaboration_types', type)
                            : addToArray('collaboration_types', type)
                        }
                        className="w-4 h-4 text-primary bg-surface border-surface/50 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-text-primary text-sm">{type}</span>
                    </label>
                  ))}
                </div>
                {errors.collaboration_types && (
                  <p className="text-red-500 text-sm mt-2">{errors.collaboration_types}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Preferred Project Duration
                </label>
                <Select
                  value={form.preferred_duration}
                  onValueChange={(value) => updateForm('preferred_duration', value)}
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
                  value={form.budget_range}
                  onValueChange={(value) => updateForm('budget_range', value)}
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Resource Contribution</h2>
              <p className="text-text-secondary">What resources can your company contribute to collaborations?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Cloud Computing Credits
                </label>
                <Select
                  value={form.cloud_credits}
                  onValueChange={(value) => updateForm('cloud_credits', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="less-than-10k">Less than €10K</SelectItem>
                    <SelectItem value="10k-50k">€10K - €50K</SelectItem>
                    <SelectItem value="50k-100k">€50K - €100K</SelectItem>
                    <SelectItem value="100k-plus">€100K+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Engineering Hours (per month)
                </label>
                <Select
                  value={form.engineering_hours}
                  onValueChange={(value) => updateForm('engineering_hours', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="less-than-40">Less than 40 hours</SelectItem>
                    <SelectItem value="40-80">40-80 hours</SelectItem>
                    <SelectItem value="80-160">80-160 hours</SelectItem>
                    <SelectItem value="160-plus">160+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Data Access
                </label>
                <Select
                  value={form.data_access}
                  onValueChange={(value) => updateForm('data_access', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceLevels.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase().replace(' ', '-')}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Equipment Access
                </label>
                <Select
                  value={form.equipment_access}
                  onValueChange={(value) => updateForm('equipment_access', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceLevels.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase().replace(' ', '-')}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Funding Amount
                </label>
                <Select
                  value={form.funding_amount}
                  onValueChange={(value) => updateForm('funding_amount', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="less-than-25k">Less than €25K</SelectItem>
                    <SelectItem value="25k-100k">€25K - €100K</SelectItem>
                    <SelectItem value="100k-500k">€100K - €500K</SelectItem>
                    <SelectItem value="500k-plus">€500K+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Mentorship Opportunities
                </label>
                <Select
                  value={form.mentorship_opportunities}
                  onValueChange={(value) => updateForm('mentorship_opportunities', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="limited">Limited (1-2 mentees)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 mentees)</SelectItem>
                    <SelectItem value="extensive">Extensive (5+ mentees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Compliance & Legal</h2>
              <p className="text-text-secondary">Ensure your company meets all regulatory requirements</p>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-surface/50 border-primary/20">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={form.eu_ai_act_compliance}
                    onChange={(e) => updateForm('eu_ai_act_compliance', e.target.checked)}
                    className="w-4 h-4 text-primary bg-surface border-surface/50 rounded focus:ring-primary focus:ring-2 mt-1"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">EU AI Act Compliance</h3>
                    <p className="text-text-secondary text-sm">
                      Our company complies with EU AI Act requirements for AI systems.
                    </p>
                    {errors.eu_ai_act_compliance && (
                      <p className="text-red-500 text-sm mt-1">{errors.eu_ai_act_compliance}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-surface/50 border-primary/20">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={form.gdpr_compliance}
                    onChange={(e) => updateForm('gdpr_compliance', e.target.checked)}
                    className="w-4 h-4 text-primary bg-surface border-surface/50 rounded focus:ring-primary focus:ring-2 mt-1"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">GDPR Compliance</h3>
                    <p className="text-text-secondary text-sm">
                      Our company complies with GDPR data protection requirements.
                    </p>
                    {errors.gdpr_compliance && (
                      <p className="text-red-500 text-sm mt-1">{errors.gdpr_compliance}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-surface/50 border-primary/20">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Intellectual Property</h3>
                  <p className="text-text-secondary text-sm mb-4">IP Ownership Preference</p>
                  <Select
                    value={form.ip_ownership_preference}
                    onValueChange={(value) => updateForm('ip_ownership_preference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select IP ownership preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {ipPreferences.map((pref) => (
                        <SelectItem key={pref} value={pref.toLowerCase().replace(' ', '-')}>{pref}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              <Card className="p-6 bg-surface/50 border-primary/20">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={form.confidentiality_agreement}
                    onChange={(e) => updateForm('confidentiality_agreement', e.target.checked)}
                    className="w-4 h-4 text-primary bg-surface border-surface/50 rounded focus:ring-primary focus:ring-2 mt-1"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Confidentiality</h3>
                    <p className="text-text-secondary text-sm">
                      We agree to sign confidentiality agreements for all collaborations.
                    </p>
                    {errors.confidentiality_agreement && (
                      <p className="text-red-500 text-sm mt-1">{errors.confidentiality_agreement}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Review & Submit</h2>
              <p className="text-text-secondary">Please review your information before submitting</p>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-surface/50 border-primary/20">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Company Name:</span>
                    <span className="text-text-primary ml-2">{form.company_name || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Industry:</span>
                    <span className="text-text-primary ml-2">{form.industry_sector || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Size:</span>
                    <span className="text-text-primary ml-2">{form.company_size || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Location:</span>
                    <span className="text-text-primary ml-2">{form.headquarters_location || 'Not provided'}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-surface/50 border-primary/20">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Collaboration Interests</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-text-secondary">Research Areas:</span>
                    <div className="text-text-primary mt-1">
                      {form.research_areas.length > 0 ? form.research_areas.join(', ') : 'None selected'}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Collaboration Types:</span>
                    <div className="text-text-primary mt-1">
                      {form.collaboration_types.length > 0 ? form.collaboration_types.join(', ') : 'None selected'}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-surface/50 border-primary/20">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-text-primary">EU AI Act Compliance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-text-primary">GDPR Compliance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-text-primary">Confidentiality Agreement</span>
                  </div>
                </div>
              </Card>
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Join SW4E Company Hub</h1>
          <p className="text-text-secondary">Connect with Finnish researchers and collaborate on innovative projects for mutual development</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const StepIcon = step.icon;
              
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

        {/* Step Content */}
        <Card className="p-8 bg-surface/50 border-primary/20">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 text-text-primary border-surface/50 hover:bg-surface/30"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
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
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Demo Version Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Demo Version</span>
          </div>
          <p className="text-center text-yellow-700 text-sm mt-2">
            This is a demonstration version of the SW4E Company Registration. 
            All data and interactions are for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
