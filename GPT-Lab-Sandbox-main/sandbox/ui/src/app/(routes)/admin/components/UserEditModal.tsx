'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import UserAvatar from './UserAvatar';
import { 
  X, 
  Save, 
  Mail, 
  Calendar, 
  Building2,
  Shield,
  Activity,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Eye,
  Key,
  Phone,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id?: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    role_type?: string;
    status?: string;
    organization?: string;
    department?: string;
    position?: string;
    phone?: string;
    created_at?: string;
    last_login?: string;
    approved_at?: string;
    approved_by?: string;
    signup_reason?: string;
    research_area?: string;
  };
  onSave?: (updatedUser: any) => void;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  organization: string;
  department: string;
  position: string;
  phone: string;
  signup_reason: string;
  research_area: string;
}

const roleOptions = [
  {
    value: 'super_admin',
    label: 'Super Administrator',
    description: 'Full system access and control',
    color: 'red' as const
  },
  {
    value: 'research_admin',
    label: 'Research Administrator',
    description: 'Organization management and user oversight',
    color: 'orange' as const
  },
  {
    value: 'researcher',
    label: 'Researcher',
    description: 'Access to research tools and data',
    color: 'blue' as const
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to assigned resources',
    color: 'green' as const
  }
];

const statusOptions = [
  { value: 'approved', label: 'Active', description: 'User can access the system' },
  { value: 'pending', label: 'Pending', description: 'Awaiting approval' },
  { value: 'rejected', label: 'Rejected', description: 'Access denied' },
  { value: 'suspended', label: 'Suspended', description: 'Temporarily disabled' }
];

export default function UserEditModal({ isOpen, onClose, user, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'researcher',
    status: 'pending',
    organization: '',
    department: '',
    position: '',
    phone: '',
    signup_reason: '',
    research_area: ''
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [saving, setSaving] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        role: user.role_type || user.role || 'researcher',
        status: user.status || 'pending',
        organization: user.organization || '',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || '',
        signup_reason: user.signup_reason || '',
        research_area: user.research_area || ''
      });
      setErrors({});
    }
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.organization.trim()) newErrors.organization = 'Organization is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
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
      const updatedUser = {
        ...user,
        ...formData,
        role_type: formData.role, // Map role to role_type for backend
        updated_at: new Date().toISOString()
      };

      if (onSave) {
        await onSave(updatedUser);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        role: user.role_type || user.role || 'researcher',
        status: user.status || 'pending',
        organization: user.organization || '',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || '',
        signup_reason: user.signup_reason || '',
        research_area: user.research_area || ''
      });
    }
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface/50">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="xl" />
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">Edit User</h2>
              <p className="text-text-secondary">Modify user information and settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className={`w-full px-3 py-2 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                            errors.first_name ? 'border-red-500' : 'border-border'
                          }`}
                          placeholder="Enter first name"
                        />
                        {errors.first_name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.first_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className={`w-full px-3 py-2 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                            errors.last_name ? 'border-red-500' : 'border-border'
                          }`}
                          placeholder="Enter last name"
                        />
                        {errors.last_name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.last_name}
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
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Department <span className="text-xs text-text-tertiary">(Read-only)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.department || 'Not specified'}
                          readOnly
                          className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-text-secondary cursor-not-allowed"
                          placeholder="Not specified"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Position <span className="text-xs text-text-tertiary">(Read-only)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.position || 'Not specified'}
                          readOnly
                          className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-text-secondary cursor-not-allowed"
                          placeholder="Not specified"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Phone Number <span className="text-xs text-text-tertiary">(Read-only)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || 'Not specified'}
                        readOnly
                        className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-text-secondary cursor-not-allowed"
                        placeholder="Not specified"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Role and Status */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Role & Status</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        User Role
                      </label>
                      <div className="space-y-2">
                        {roleOptions.map((role) => (
                          <div
                            key={role.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                              formData.role === role.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-surface/50'
                            }`}
                            onClick={() => handleInputChange('role', role.value)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-3 h-3 rounded-full mt-1 ${
                                role.color === 'red' ? 'bg-red-500' :
                                role.color === 'orange' ? 'bg-orange-500' :
                                role.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                              }`}></div>
                              <div className="flex-1">
                                <h4 className="font-medium text-text-primary mb-1">{role.label}</h4>
                                <p className="text-sm text-text-secondary">{role.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Account Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label} - {status.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Research Information */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Research Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Signup Reason
                      </label>
                      <textarea
                        value={formData.signup_reason}
                        onChange={(e) => handleInputChange('signup_reason', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Why did the user sign up?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Research Area
                      </label>
                      <input
                        type="text"
                        value={formData.research_area}
                        onChange={(e) => handleInputChange('research_area', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter research area"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-surface/50">
          <div className="text-sm text-text-secondary">
            User ID: {user.id || user.user_id}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="btn-primary px-6 py-2">
              {saving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
