'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { 
  UserPlus,
  Mail,
  Lock,
  User,
  Building,
  FileText,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  organization: string;
  signup_reason: string;
  research_area: string;
}

function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    organization: '',
    signup_reason: '',
    research_area: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Check password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 6) strength++;
      if (value.match(/[a-z]/)) strength++;
      if (value.match(/[A-Z]/)) strength++;
      if (value.match(/[0-9]/)) strength++;
      if (value.match(/[^a-zA-Z0-9]/)) strength++;
      setPasswordStrength(strength);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      return 'Please fill in all required fields';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          organization: formData.organization,
          signup_reason: formData.signup_reason,
          research_area: formData.research_area
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setError(null);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-400';
    if (passwordStrength <= 2) return 'bg-orange-400';
    if (passwordStrength <= 3) return 'bg-secondary';
    return 'bg-primary';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 text-center bg-gradient-to-br from-surface to-surface/50 border-primary/20">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-text-primary mb-4">Registration Submitted!</h1>
          
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-2">What happens next?</h3>
            <div className="text-left space-y-3 text-text-secondary">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>Your registration has been submitted for admin approval</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>An administrator will review your application within 24-48 hours</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>You'll receive an email notification when your account is approved</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>Once approved, you can log in and start using SW4E services</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-text-secondary">
              Already have an account? <Link href="/login" className="text-primary hover:text-secondary font-medium">Sign in here</Link>
            </p>
            <Link href="/">
              <Button className="btn-outline">
                <ArrowRight className="w-4 h-4 mr-2" />
                Return to Homepage
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Information */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">
              <span className="text-primary">Join SW4E</span>
              <br />
              <span className="text-text-primary">Research Community</span>
            </h1>
            <p className="text-xl text-text-secondary mt-4">
              Get access to enterprise-grade AI research tools and collaborate with researchers worldwide.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Advanced AI Tools</h3>
                <p className="text-text-secondary">Access cutting-edge machine learning frameworks, model training environments, and data processing tools.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Research Collaboration</h3>
                <p className="text-text-secondary">Connect with researchers from leading institutions and collaborate on groundbreaking projects.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Governance & Compliance</h3>
                <p className="text-text-secondary">Built-in compliance with GDPR, EU AI Act, and industry best practices for responsible AI development.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Signup Form */}
        <Card className="p-8 bg-gradient-to-br from-surface to-surface/50 border-primary/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Create Your Account</h2>
            <p className="text-text-secondary mt-2">Join the future of AI research</p>
            
            {/* Example Credentials */}
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">💡 Example Signup:</p>
              <p className="text-xs text-text-secondary">
                Name: <span className="text-text-primary">Muhammad Waseem</span> | 
                Email: <span className="text-text-primary">teacher@tclone.com</span> | 
                Password: <span className="text-text-primary">teacher123</span>
              </p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-medium">Registration Error</h4>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
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
                    placeholder="John"
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
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="john.doe@university.edu"
                  required
                />
              </div>
            </div>
            
            {/* Password */}
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
                  placeholder="Enter a strong password"
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
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-surface rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-text-muted">{getPasswordStrengthText()}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirm Password */}
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
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
            
            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Organization
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="University, Company, or Research Institution"
                />
              </div>
            </div>
            
            {/* Research Area */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Research Area
              </label>
              <div className="relative">
                <Lightbulb className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                <textarea
                  name="research_area"
                  value={formData.research_area}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none"
                  placeholder="e.g., Machine Learning, Natural Language Processing, Computer Vision..."
                />
              </div>
            </div>
            
            {/* Signup Reason */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Why do you want to join SW4E?
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                <textarea
                  name="signup_reason"
                  value={formData.signup_reason}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none"
                  placeholder="Tell us about your research goals and how you plan to use SW4E..."
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg py-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </div>
              )}
            </Button>
            
            <div className="text-center pt-4">
              <p className="text-text-secondary">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-secondary font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default SignupPage;
