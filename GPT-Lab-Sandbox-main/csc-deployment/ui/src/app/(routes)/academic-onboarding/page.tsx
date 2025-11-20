'use client';

import React, { useState, Suspense } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  GraduationCap,
  Users,
  BookOpen,
  Microscope,
  Building2,
  Target,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  School,
  Trophy,
  Globe,
  Shield,
  Database,
  Cpu,
  Cloud
} from 'lucide-react';

interface AcademicSignupFormData {
  // Basic Info
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  
  // Academic Info
  academic_role: 'student' | 'phd_candidate' | 'postdoc' | 'professor' | 'researcher' | 'industry_researcher' | 'admin' | 'director';
  institution: string;
  institution_type: 'university' | 'research_institute' | 'company' | 'government' | 'ngo' | 'other';
  department: string;
  academic_level: 'undergraduate' | 'masters' | 'phd' | 'postdoc' | 'faculty' | 'industry';
  
  // Research Info
  research_area: string;
  research_focus: string[];
  current_projects: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Collaboration Info
  collaboration_interests: string[];
  industry_partnership_interest: boolean;
  open_to_mentoring: boolean;
  looking_for_mentor: boolean;
  
  // Platform Usage
  intended_use: string[];
  expected_duration: 'short_term' | 'semester' | 'year' | 'long_term';
  resource_needs: string[];
  
  // University/Institute Specific Fields
  institution_name?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_title?: string;
  academic_programs?: string;
  research_capabilities?: string;
  service_requirements?: string[];
  institute_research_focus?: string;
  institute_capabilities?: string[];
  institute_collaboration_interests?: string[];
  service_integration_needs?: string[];
  budget_approval?: string;
  compliance_requirements?: string[];
  expected_users?: string;
  implementation_timeline?: string;
  
  // Additional
  supervisor_email?: string;
  orcid_id?: string;
  website?: string;
  linkedin?: string;
}

const researchFocusOptions = [
  'Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision',
  'Robotics', 'Data Science', 'Artificial Intelligence', 'Human-Computer Interaction',
  'Cybersecurity', 'IoT', 'Blockchain', 'Quantum Computing', 'Bioinformatics',
  'Healthcare AI', 'Fintech', 'EdTech', 'Climate Tech', 'Social Computing'
];

const collaborationOptions = [
  'Academic Research', 'Industry Projects', 'Open Source Contributions',
  'Cross-disciplinary Research', 'International Collaboration', 'Student Mentoring',
  'Conference Presentations', 'Paper Co-authoring', 'Grant Applications'
];

const intendedUseOptions = [
  'Course Projects', 'Thesis Research', 'Academic Papers', 'Industry Collaboration',
  'Proof of Concept', 'Data Analysis', 'Model Training', 'Prototype Development',
  'Teaching Materials', 'Student Projects'
];

const resourceNeedsOptions = [
  'GPU Computing', 'Large Datasets', 'AI Models', 'Development Tools',
  'Collaboration Space', 'Mentorship', 'Code Review', 'Documentation',
  'Training Materials', 'Community Support'
];

// Real Finnish Universities and Research Institutes
const finnishUniversities = [
  'University of Helsinki',
  'Aalto University', 
  'University of Turku',
  'Tampere University',
  'University of Oulu',
  'Lappeenranta-Lahti University of Technology (LUT)',
  'University of Jyväskylä',
  'University of Eastern Finland',
  'Åbo Akademi University',
  'University of Vaasa'
];

const finnishResearchInstitutes = [
  'VTT Technical Research Centre of Finland',
  'Finnish Institute for Health and Welfare (THL)',
  'Natural Resources Institute Finland (Luke)',
  'Finnish Meteorological Institute',
  'Geological Survey of Finland (GTK)',
  'Finnish Environment Institute (SYKE)',
  'National Institute for Health and Welfare',
  'Finnish Institute of Occupational Health'
];

const universityServiceOptions = [
  'AI Research Platform Access', 'Data Analytics Suite', 'High-Performance Computing',
  'Secure Data Storage', 'Collaboration Tools', 'Educational Licenses',
  'Research Grant Support', 'Technical Training', 'Student Project Management',
  'Research Data Management', 'Publication Support', 'International Collaboration Tools',
  'Compliance Management', 'Research Ethics Review', 'Intellectual Property Support'
];

const instituteCapabilityOptions = [
  'Advanced AI/ML Infrastructure', 'Specialized Data Processing', 'High-Security Environments',
  'Interdisciplinary Research Labs', 'Industry Collaboration Frameworks',
  'Custom Software Development', 'Large-Scale Data Collection', 'Ethical AI Review',
  'Research Ethics Committees', 'Technology Transfer Offices', 'International Partnerships'
];

const instituteCollaborationOptions = [
  'Joint Research Projects', 'Co-authored Publications', 'Technology Transfer',
  'Talent Exchange Programs', 'Shared Infrastructure Development', 'Standardization Initiatives',
  'Industry Partnerships', 'International Research Networks', 'Innovation Hubs'
];

const instituteServiceIntegrationOptions = [
  'API Integration', 'Custom Data Connectors', 'On-premise Deployment',
  'Cloud Migration Support', 'Security Audits', 'Dedicated Support',
  'Custom Development', 'Integration Testing', 'Performance Optimization'
];

const complianceOptions = [
  'GDPR Compliance', 'EU AI Act Compliance', 'Finnish Data Protection Act',
  'Research Ethics Approval', 'Institutional Review Board', 'Data Sharing Agreements',
  'Intellectual Property Rights', 'Export Control Regulations', 'International Collaboration Protocols'
];

function AcademicOnboardingPage() {
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'individual';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AcademicSignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    academic_role: 'student',
    institution: '',
    institution_type: 'university',
    department: '',
    academic_level: 'undergraduate',
    research_area: '',
    research_focus: [],
    current_projects: '',
    experience_level: 'beginner',
    collaboration_interests: [],
    industry_partnership_interest: false,
    open_to_mentoring: false,
    looking_for_mentor: false,
    intended_use: [],
    expected_duration: 'semester',
    resource_needs: [],
    supervisor_email: '',
    orcid_id: '',
    website: '',
    linkedin: '',
    // University/Institute specific fields
    institution_name: '',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_title: '',
    academic_programs: '',
    research_capabilities: '',
    service_requirements: [],
    institute_research_focus: '',
    institute_capabilities: [],
    institute_collaboration_interests: [],
    service_integration_needs: [],
    budget_approval: '',
    compliance_requirements: [],
    expected_users: '',
    implementation_timeline: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Different step configurations based on user type
  const getSteps = () => {
    switch (userType) {
      case 'university':
        return [
          { title: 'Institution Info', icon: Building2, description: 'University details' },
          { title: 'Contact Person', icon: User, description: 'Primary contact information' },
          { title: 'Academic Programs', icon: GraduationCap, description: 'Programs and departments' },
          { title: 'Research Capabilities', icon: Microscope, description: 'Research areas and expertise' },
          { title: 'Service Requirements', icon: Target, description: 'Platform services needed' },
          { title: 'Review & Submit', icon: CheckCircle, description: 'Confirm application' }
        ];
      case 'institute':
        return [
          { title: 'Institute Info', icon: Microscope, description: 'Institute details' },
          { title: 'Research Focus', icon: Target, description: 'Research areas and expertise' },
          { title: 'Capabilities', icon: Database, description: 'Resources and facilities' },
          { title: 'Collaboration', icon: Users, description: 'Partnership interests' },
          { title: 'Service Integration', icon: Cloud, description: 'Platform integration needs' },
          { title: 'Review & Submit', icon: CheckCircle, description: 'Confirm application' }
        ];
      default: // individual
        return [
          { title: 'Personal Info', icon: User, description: 'Basic information' },
          { title: 'Academic Profile', icon: GraduationCap, description: 'Institution & role' },
          { title: 'Research Focus', icon: Microscope, description: 'Areas of interest' },
          { title: 'Collaboration', icon: Users, description: 'Partnership preferences' },
          { title: 'Platform Usage', icon: Target, description: 'How you\'ll use SW4E' },
          { title: 'Review & Submit', icon: CheckCircle, description: 'Confirm details' }
        ];
    }
  };

  const steps = getSteps();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[name as keyof AcademicSignupFormData] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [name]: newArray };
    });
  };

  const validateStep = (step: number): string | null => {
    // Demo version - no validation errors
    return null;
  };

  const nextStep = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Demo version - simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      console.error('Academic signup error:', err);
      setError('Demo submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-3xl w-full p-8 text-center bg-gradient-to-br from-surface to-surface/50 border-primary/20">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-text-primary mb-4">Welcome to SW4E Academic Community!</h1>
          
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Your Academic Journey Starts Here</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-3 text-text-secondary">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p>Academic profile under review (24-48 hours)</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p>Access to academic project templates</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p>Collaboration matching with peers</p>
                </div>
              </div>
              <div className="space-y-3 text-text-secondary">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p>Academic resource allocation</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p>Mentorship program enrollment</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p>Industry partnership opportunities</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link href="/academic-resources">
              <Button className="btn-primary mr-4">
                <BookOpen className="w-4 h-4 mr-2" />
                Explore Academic Resources
              </Button>
            </Link>
            <Link href="/login">
              <Button className="btn-outline">
                <ArrowRight className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            {userType === 'university' ? 'University Onboarding' : 
             userType === 'institute' ? 'Research Institute Onboarding' : 
             'Individual Researcher Onboarding'}
          </h1>
          <p className="text-xl text-text-secondary">
            {userType === 'university' ? 'Join SW4E as a University Partner' : 
             userType === 'institute' ? 'Join SW4E as a Research Institute' : 
             'Join the SW4E Research Community'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? 'bg-primary text-background' :
                    isActive ? 'bg-primary/20 text-primary border-2 border-primary' :
                    'bg-surface text-text-muted border-2 border-surface'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs text-center max-w-20 ${
                    isActive ? 'text-primary font-medium' : 'text-text-muted'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 sticky top-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {steps[currentStep].title}
              </h3>
              <p className="text-text-secondary mb-6">
                {steps[currentStep].description}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <School className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-text-primary">Academic Focus</h4>
                    <p className="text-sm text-text-secondary">Tailored for researchers and students</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-text-primary">Community Driven</h4>
                    <p className="text-sm text-text-secondary">Connect with peers worldwide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-text-primary">Excellence Support</h4>
                    <p className="text-sm text-text-secondary">Resources for breakthrough research</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Form Steps */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gradient-to-br from-surface to-surface/50 border-primary/20">
              {error && (
                <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-red-400 font-medium">Validation Error</h4>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Step 0: Institution/Personal Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  {userType === 'university' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          University Name *
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                          <select
                            name="institution_name"
                            value={formData.institution_name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                            required
                          >
                            <option value="">Select your university</option>
                            {finnishUniversities.map((uni) => (
                              <option key={uni} value={uni}>{uni}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-xs text-text-muted mt-1">Choose from major Finnish universities</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Institution Type *
                          </label>
                          <select
                            name="institution_type"
                            value={formData.institution_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                            required
                          >
                            <option value="university">University</option>
                            <option value="research_institute">Research Institute</option>
                            <option value="government">Government Agency</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Website *
                          </label>
                          <div className="relative">
                            <Globe className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              placeholder="https://www.university.fi"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : userType === 'institute' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Research Institute Name *
                        </label>
                        <div className="relative">
                          <Microscope className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                          <select
                            name="institution_name"
                            value={formData.institution_name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                            required
                          >
                            <option value="">Select your research institute</option>
                            {finnishResearchInstitutes.map((institute) => (
                              <option key={institute} value={institute}>{institute}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-xs text-text-muted mt-1">Choose from major Finnish research institutes</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Institute Type *
                          </label>
                          <select
                            name="institution_type"
                            value={formData.institution_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                            required
                          >
                            <option value="research_institute">Research Institute</option>
                            <option value="government">Government Agency</option>
                            <option value="company">Private Research</option>
                            <option value="ngo">Non-Profit Research</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Website *
                          </label>
                          <div className="relative">
                            <Globe className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              placeholder="https://www.institute.fi"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            First Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                            <input
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              placeholder="Anna"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Last Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                            <input
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              placeholder="Virtanen"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Academic Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                            placeholder="anna.virtanen@helsinki.fi"
                            required
                          />
                        </div>
                        <p className="text-xs text-text-muted mt-1">Use your institutional email for faster verification</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-12 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              placeholder="Enter password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              placeholder="Confirm password"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 1 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      {userType === 'university' ? 'Contact Person Name *' : 
                       userType === 'institute' ? 'Research Focus *' : 'Institution *'}
                    </label>
                    <input
                      type="text"
                      name={userType === 'university' ? 'contact_person_name' : 
                            userType === 'institute' ? 'institute_research_focus' : 'institution'}
                      value={userType === 'university' ? formData.contact_person_name : 
                             userType === 'institute' ? formData.institute_research_focus : formData.institution}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      placeholder={userType === 'university' ? 'Dr. Anna Virtanen' : 
                                 userType === 'institute' ? 'Describe your research focus...' : 'Select your institution'}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      {userType === 'university' ? 'Academic Programs *' : 
                       userType === 'institute' ? 'Research Capabilities *' : 'Research Area *'}
                    </label>
                    <textarea
                      name={userType === 'university' ? 'academic_programs' : 
                            userType === 'institute' ? 'research_capabilities' : 'research_area'}
                      value={userType === 'university' ? formData.academic_programs : 
                             userType === 'institute' ? formData.research_capabilities : formData.research_area}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      placeholder="Describe your details..."
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      {userType === 'university' ? 'Research Capabilities *' : 
                       userType === 'institute' ? 'Collaboration Interests *' : 'Collaboration Interests *'}
                    </label>
                    <textarea
                      name={userType === 'university' ? 'research_capabilities' : 
                            userType === 'institute' ? 'institute_collaboration_interests' : 'collaboration_interests'}
                      value={userType === 'university' ? formData.research_capabilities : 
                             userType === 'institute' ? formData.institute_collaboration_interests : formData.collaboration_interests}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      placeholder="Describe your interests..."
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      {userType === 'university' ? 'Service Requirements *' : 
                       userType === 'institute' ? 'Service Integration *' : 'Platform Usage *'}
                    </label>
                    <textarea
                      name={userType === 'university' ? 'service_requirements' : 
                            userType === 'institute' ? 'service_integration_needs' : 'intended_use'}
                      value={userType === 'university' ? formData.service_requirements : 
                             userType === 'institute' ? formData.service_integration_needs : formData.intended_use}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      placeholder="Describe your requirements..."
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Review Your Application</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-text-primary">Application Summary</h4>
                        <p className="text-sm text-text-secondary">
                          {userType === 'university' && `University: ${formData.institution_name}`}
                          {userType === 'institute' && `Institute: ${formData.institution_name}`}
                          {userType === 'individual' && `Name: ${formData.first_name} ${formData.last_name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-800 font-medium">Demo Version Notice</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          This is a demonstration version. All data is for demo purposes only.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-primary/20">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="btn-outline"
                >
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Previous
                </Button>
                
                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
        
        {/* Demo Version Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Demo Version</span>
          </div>
          <p className="text-center text-yellow-700 text-sm mt-2">
            This is a demonstration version of the SW4E Academic Onboarding system. 
            All data and interactions are for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
function AcademicOnboardingPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AcademicOnboardingPage />
    </Suspense>
  );
}

export default AcademicOnboardingPageWrapper;