'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDefaultRouteForRole } from '@/lib/auth';
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'basic');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    organization: '',
    role: 'researcher',
    subscription_tier: selectedPlan,
    signup_reason: '',
    research_area: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const defaultRoute = getDefaultRouteForRole(user.role);
      router.push(defaultRoute);
    }
  }, [user, authLoading, router]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Update subscription tier when plan changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, subscription_tier: selectedPlan }));
  }, [selectedPlan]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Registration successful! Your account is pending approval.');
        setFormData({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          organization: '',
          role: 'researcher',
          subscription_tier: '',
          signup_reason: '',
          research_area: ''
        });
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-background font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">{t('register.title')}</h2>
          <p className="mt-2 text-text-secondary">
            {t('register.subtitle')}
          </p>
        </div>

        <div className="card p-8">

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                <CheckCircle size={16} />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-text-primary mb-2">
                  {t('register.firstName')}
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-text-primary mb-2">
                  {t('register.lastName')}
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                {t('register.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="john.doe@university.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                {t('register.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={16} className="text-text-muted" />
                  ) : (
                    <Eye size={16} className="text-text-muted" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters
              </p>
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-text-primary mb-2">
                {t('register.organization')}
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="University of Technology"
              />
            </div>

            {/* Role Selection - Simplified */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-2">
                {t('register.role')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <optgroup label="Research & Academic">
                  <option value="researcher">Researcher</option>
                  <option value="university_faculty">University Faculty</option>
                  <option value="university_researcher">University Research Staff</option>
                  <option value="university_student">Graduate/PhD Student</option>
                  <option value="postdoc">Postdoctoral Researcher</option>
                  <option value="independent_researcher">Independent Researcher</option>
                  <option value="consultant">Research Consultant</option>
                  <option value="visiting_scholar">Visiting Scholar</option>
                </optgroup>
                <optgroup label="Corporate & Industry">
                  <option value="corporate_researcher">Corporate Research Scientist</option>
                  <option value="corporate_analyst">Data/Business Analyst</option>
                  <option value="corporate_manager">R&D Manager/Director</option>
                  <option value="corporate_intern">Research Intern/Trainee</option>
                </optgroup>
                <optgroup label="Technical Specialists">
                  <option value="data_scientist">Data Scientist</option>
                  <option value="ml_engineer">Machine Learning Engineer</option>
                  <option value="ai_researcher">AI Research Specialist</option>
                  <option value="security_analyst">Security & Compliance Specialist</option>
                </optgroup>
                <optgroup label="Administration & Support">
                  <option value="university_admin">University Administrator</option>
                  <option value="university_coordinator">Research Coordinator</option>
                  <option value="corporate_admin">Corporate Administrator</option>
                  <option value="platform_support">Technical Support Specialist</option>
                </optgroup>
                <optgroup label="External Stakeholders">
                  <option value="government_official">Government Representative</option>
                  <option value="regulatory_officer">Regulatory Compliance Officer</option>
                  <option value="funding_agency">Funding Agency Representative</option>
                  <option value="industry_partner">Industry Collaboration Partner</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="viewer">Viewer (Read-only access)</option>
                </optgroup>
              </select>
            </div>

            {/* Research Information */}
            <div>
              <label htmlFor="signup_reason" className="block text-sm font-medium text-text-primary mb-2">
                Why do you want to join GPT-Lab's?
              </label>
              <textarea
                id="signup_reason"
                name="signup_reason"
                value={formData.signup_reason}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell us about your research goals and how GPT-Lab's can help..."
              />
            </div>

            <div>
              <label htmlFor="research_area" className="block text-sm font-medium text-text-primary mb-2">
                Research Area
              </label>
              <input
                type="text"
                id="research_area"
                name="research_area"
                value={formData.research_area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Machine Learning, Data Science, AI Ethics, etc."
              />
            </div>

            {/* Subscription Plan Selection - Simplified */}
            <div>
              <label htmlFor="subscription" className="block text-sm font-medium text-text-primary mb-2">
                Research Plan
              </label>
              <select
                id="subscription"
                name="subscription_tier"
                value={formData.subscription_tier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="basic">Starter Plan - 3 projects, 5 members, Secure storage</option>
                <option value="professional">Professional Plan - 10 projects, 15 members, AI services</option>
                <option value="enterprise">Enterprise Plan - Unlimited, Custom compliance, Dedicated support</option>
              </select>
              <p className="mt-2 text-sm text-text-muted">
                All plans include 14-day free trial, GDPR compliance, and EU AI Act support
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-background bg-primary hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus size={20} />
              )}
              {loading ? t('common.loading') : t('register.createAccount')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-muted text-sm">
              {t('register.alreadyHaveAccount')}{' '}
              <a href="/login" className="text-primary hover:text-primary-500 font-medium">
                {t('register.signIn')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterPage />
    </Suspense>
  );
}

export default RegisterPageWrapper;
