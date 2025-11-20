'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  X, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Building2,
  Shield,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface UserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'super_admin' | 'research_admin' | 'researcher' | 'viewer';
  organization: string;
  department: string;
  position: string;
  phone: string;
  sendWelcomeEmail: boolean;
  requirePasswordChange: boolean;
}

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin', color: 'red' },
  { value: 'research_admin', label: 'Research Admin', color: 'blue' },
  { value: 'researcher', label: 'Researcher', color: 'green' },
  { value: 'viewer', label: 'Viewer', color: 'gray' }
];


export default function UserCreationModal({ isOpen, onClose, onUserCreated }: UserCreationModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'researcher',
    organization: '',
    department: '',
    position: '',
    phone: '',
    sendWelcomeEmail: true,
    requirePasswordChange: true
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Password confirmation is required';
    if (!formData.organization.trim()) newErrors.organization = 'Organization is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organization: formData.organization,
        department: formData.department || null,
        position: formData.position || null,
        phone: formData.phone || null,
        send_welcome_email: formData.sendWelcomeEmail,
        require_password_change: formData.requirePasswordChange
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User created successfully:', result);
        alert('User created successfully!');
        onClose();
        resetForm();
        // Call the callback to refresh the users list
        if (onUserCreated) {
          onUserCreated();
        }
      } else {
        const error = await response.json();
        throw new Error(error instanceof Error ? error.message : String(error) || 'Failed to create user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert(`Failed to create user: ${error instanceof Error ? error.message : String(error) || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'researcher',
      organization: '',
      department: '',
      position: '',
      phone: '',
      sendWelcomeEmail: true,
      requirePasswordChange: true
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const getRoleColor = (role: string) => {
    const roleOption = roleOptions.find(r => r.value === role);
    return roleOption?.color || 'gray';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Create New User</h2>
              <p className="text-sm text-text-secondary">Add a new user to the system</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      errors.firstName ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      errors.lastName ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    errors.email ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Security</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.password ? 'border-red-500' : 'border-border'
                      }`}
                      placeholder="Enter password"
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
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-border'
                      }`}
                      placeholder="Confirm password"
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
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role and Organization */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Role & Organization</h3>
              
              {/* Role Selection - Simplified */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
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

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Organization *
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    errors.organization ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Enter organization name"
                />
                {errors.organization && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.organization}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter position"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Options</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-text-primary">Send Welcome Email</h4>
                    <p className="text-sm text-text-secondary">Send login credentials to the user's email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendWelcomeEmail}
                      onChange={(e) => handleInputChange('sendWelcomeEmail', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-text-primary">Require Password Change</h4>
                    <p className="text-sm text-text-secondary">User must change password on first login</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requirePasswordChange}
                      onChange={(e) => handleInputChange('requirePasswordChange', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <UserPlus className="w-4 h-4 mr-2 animate-spin" />
                Creating User...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create User
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
