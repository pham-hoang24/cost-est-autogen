'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Euro, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface HardwareResource {
  id: string;
  name: string;
  type: string;
  cluster: string;
  location: string;
  cost_per_hour: number;
  cores?: number;
  memory?: string;
  gpu_memory?: string;
  architecture?: string;
  cuda_cores?: number;
  utilization: number;
  energy_efficiency: number;
  status: 'available' | 'busy' | 'maintenance' | 'reserved';
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
}

interface NewHardwareRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: HardwareResource[];
  projects: Project[];
  onSubmit: (request: HardwareRequest) => void;
  preSelectedResource?: HardwareResource;
}

interface HardwareRequest {
  id: string;
  project_id: string;
  resource_id: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  start_date: string;
  end_date: string;
  duration_hours: number;
  justification: string;
  expected_usage: string;
  estimated_cost: number;
  status: 'pending' | 'approved' | 'rejected' | 'running' | 'completed';
  created_at: string;
  admin_notes?: string;
}

export default function NewHardwareRequestModal({ 
  isOpen, 
  onClose, 
  resources, 
  projects, 
  onSubmit,
  preSelectedResource
}: NewHardwareRequestModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    resource_id: '',
    priority: 'normal' as const,
    start_date: '',
    end_date: '',
    justification: '',
    expected_usage: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedResource = resources.find(r => r.id === formData.resource_id);
  const selectedProject = projects.find(p => p.id === formData.project_id);

  // Pre-populate form when a resource is pre-selected
  useEffect(() => {
    if (preSelectedResource && isOpen) {
      setFormData({
        project_id: '',
        resource_id: preSelectedResource.id,
        priority: 'normal',
        start_date: new Date().toISOString().slice(0, 16), // Current date and time
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Tomorrow
        justification: `Request for ${preSelectedResource.name} - ${preSelectedResource.cluster} cluster`,
        expected_usage: `Utilizing ${preSelectedResource.name} for computational tasks requiring ${preSelectedResource.type} resources`
      });
    }
  }, [preSelectedResource, isOpen]);

  const calculateCost = () => {
    if (!selectedResource || !formData.start_date || !formData.end_date) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const hours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    return Math.round(hours * selectedResource.cost_per_hour * 100) / 100;
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.project_id) newErrors.project_id = 'Please select a project';
      if (!formData.resource_id) newErrors.resource_id = 'Please select a resource';
    }

    if (stepNumber === 2) {
      if (!formData.start_date) newErrors.start_date = 'Please select start date';
      if (!formData.end_date) newErrors.end_date = 'Please select end date';
      if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (stepNumber === 3) {
      if (!formData.justification.trim()) newErrors.justification = 'Please provide justification';
      if (!formData.expected_usage.trim()) newErrors.expected_usage = 'Please describe expected usage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const request: HardwareRequest = {
      id: `req_${Date.now()}`,
      project_id: formData.project_id,
      resource_id: formData.resource_id,
      priority: formData.priority,
      start_date: formData.start_date,
      end_date: formData.end_date,
      duration_hours: Math.max(1, (new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60)),
      justification: formData.justification,
      expected_usage: formData.expected_usage,
      estimated_cost: calculateCost(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    onSubmit(request);
    setIsSubmitting(false);
    onClose();
    setStep(1);
    setFormData({
      project_id: '',
      resource_id: '',
      priority: 'normal',
      start_date: '',
      end_date: '',
      justification: '',
      expected_usage: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">New Hardware Request</h2>
              <p className="text-sm text-text-secondary">Request computational resources for your project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-primary text-background' 
                    : 'bg-surface text-text-muted'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                <div className="ml-2 text-sm">
                  <div className={`font-medium ${
                    step >= stepNumber ? 'text-text-primary' : 'text-text-muted'
                  }`}>
                    {stepNumber === 1 && 'Project & Resource'}
                    {stepNumber === 2 && 'Schedule'}
                    {stepNumber === 3 && 'Details'}
                  </div>
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-px mx-4 ${
                    step > stepNumber ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Project & Resource Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Select Project & Resource</h3>
                
                {/* Project Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Project *
                  </label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                    className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.description}
                      </option>
                    ))}
                  </select>
                  {errors.project_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.project_id}
                    </p>
                  )}
                </div>

                {/* Resource Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Hardware Resource *
                  </label>
                  {preSelectedResource ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Pre-selected Resource</span>
                      </div>
                      <div className="text-sm text-green-700">
                        <div className="font-medium">{preSelectedResource.name}</div>
                        <div>{preSelectedResource.cluster} - {preSelectedResource.location}</div>
                        <div>€{preSelectedResource.cost_per_hour}/hour</div>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={formData.resource_id}
                      onChange={(e) => setFormData({...formData, resource_id: e.target.value})}
                      className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a resource</option>
                      {resources.filter(r => r.status === 'available').map(resource => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name} - {resource.cluster} ({resource.location}) - €{resource.cost_per_hour}/hour
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.resource_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.resource_id}
                    </p>
                  )}
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
                      { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
                      { value: 'high', label: 'High', color: 'bg-yellow-100 text-yellow-800' },
                      { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
                    ].map(priority => (
                      <label key={priority.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                          className="sr-only"
                        />
                        <div className={`w-full p-3 rounded-lg border-2 transition-all ${
                          formData.priority === priority.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}>
                          <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${priority.color}`}>
                            {priority.label}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Schedule Your Request</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {errors.start_date && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.start_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {errors.end_date && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.end_date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Resource Preview */}
                {selectedResource && (
                  <div className="mt-6 p-4 bg-surface rounded-lg border border-border">
                    <h4 className="font-medium text-text-primary mb-2">Selected Resource</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-text-muted">Resource:</span>
                        <div className="font-medium">{selectedResource.name}</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Cluster:</span>
                        <div className="font-medium">{selectedResource.cluster}</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Cost/Hour:</span>
                        <div className="font-medium">€{selectedResource.cost_per_hour}</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Estimated Total:</span>
                        <div className="font-medium text-primary">€{calculateCost()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Request Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Justification *
                    </label>
                    <textarea
                      value={formData.justification}
                      onChange={(e) => setFormData({...formData, justification: e.target.value})}
                      placeholder="Explain why you need this resource and how it will be used..."
                      rows={4}
                      className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                    {errors.justification && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.justification}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Expected Usage *
                    </label>
                    <textarea
                      value={formData.expected_usage}
                      onChange={(e) => setFormData({...formData, expected_usage: e.target.value})}
                      placeholder="Describe the specific computational tasks, algorithms, or workloads you plan to run..."
                      rows={4}
                      className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                    {errors.expected_usage && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.expected_usage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Request Summary */}
                <div className="mt-6 p-4 bg-surface rounded-lg border border-border">
                  <h4 className="font-medium text-text-primary mb-3">Request Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted">Project:</span>
                      <div className="font-medium">{selectedProject?.name}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Resource:</span>
                      <div className="font-medium">{selectedResource?.name}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Priority:</span>
                      <div className="font-medium capitalize">{formData.priority}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Duration:</span>
                      <div className="font-medium">
                        {formData.start_date && formData.end_date 
                          ? `${Math.max(1, (new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60))} hours`
                          : 'Not specified'
                        }
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-text-muted">Estimated Cost:</span>
                      <div className="font-medium text-primary text-lg">€{calculateCost()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-surface/50">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary-500 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
