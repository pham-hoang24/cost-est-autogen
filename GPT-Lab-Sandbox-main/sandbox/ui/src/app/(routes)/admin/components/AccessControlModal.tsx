import React, { useState, useEffect } from 'react';
import { X, Shield, Users, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SubscriptionTier {
  name: string;
  displayName: string;
  description: string;
  maxUsers: number;
  maxOrganizations: number;
  maxProjects: number;
  maxStorageGB: number;
  maxComputeHours: number;
  allowedServices: string[];
  features: string[];
  price: number;
  color: string;
}

interface ServiceAccess {
  serviceId: string;
  serviceName: string;
  allowedTiers: string[];
  maxUsagePerMonth?: number;
  requiresApproval: boolean;
}

interface AccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  currentTier?: string;
}

export default function AccessControlModal({ 
  isOpen, 
  onClose, 
  userId, 
  userEmail, 
  currentTier = 'basic' 
}: AccessControlModalProps) {
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [serviceAccess, setServiceAccess] = useState<ServiceAccess[]>([]);
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAccessControlData();
    }
  }, [isOpen]);

  const fetchAccessControlData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription tiers
      const tiersResponse = await fetch('/api/access-control/subscription-tiers', {
        credentials: 'include'
      });
      if (tiersResponse.ok) {
        const tiersData = await tiersResponse.json();
        setSubscriptionTiers(tiersData.data);
      }

      // Fetch service access rules
      const servicesResponse = await fetch('/api/access-control/services', {
        credentials: 'include'
      });
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServiceAccess(servicesData.data);
      }
    } catch (error) {
      console.error('Error fetching access control data:', error);
      setError('Failed to load access control data');
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = (tierName: string) => {
    setSelectedTier(tierName);
  };

  const handleSave = async () => {
    if (!userId || !selectedTier) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/access-control/user-subscription/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ subscriptionTier: selectedTier }),
      });

      if (response.ok) {
        onClose();
        // Show success message
        alert('Subscription tier updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update subscription tier');
      }
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      setError('Failed to update subscription tier');
    } finally {
      setSaving(false);
    }
  };

  const getTierColor = (tierName: string) => {
    const tier = subscriptionTiers.find(t => t.name === tierName);
    return tier?.color || 'gray';
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'basic':
        return <Users className="w-5 h-5" />;
      case 'professional':
        return <Settings className="w-5 h-5" />;
      case 'enterprise':
        return <Shield className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Access Control Management</h2>
              {userEmail && (
                <p className="text-sm text-gray-600">Managing access for: {userEmail}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading access control data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Subscription Tiers */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subscriptionTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTier === tier.name
                          ? `border-${tier.color}-500 bg-${tier.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTierChange(tier.name)}
                    >
                      {selectedTier === tier.name && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className={`w-5 h-5 text-${tier.color}-500`} />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <div className={`text-${tier.color}-600`}>
                          {getTierIcon(tier.name)}
                        </div>
                        <h4 className="font-semibold text-gray-900">{tier.displayName}</h4>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Users:</span>
                          <span className="font-medium">
                            {tier.maxUsers === -1 ? 'Unlimited' : tier.maxUsers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage:</span>
                          <span className="font-medium">{tier.maxStorageGB}GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Compute:</span>
                          <span className="font-medium">{tier.maxComputeHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Projects:</span>
                          <span className="font-medium">
                            {tier.maxProjects === -1 ? 'Unlimited' : tier.maxProjects}
                          </span>
                        </div>
                      </div>
                      
                      {tier.price > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-lg font-bold text-gray-900">
                            ${tier.price}/month
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Access Rules */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Access Rules</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {serviceAccess.map((service) => {
                      const isAllowed = service.allowedTiers.includes(selectedTier);
                      const tier = subscriptionTiers.find(t => t.name === selectedTier);
                      
                      return (
                        <div
                          key={service.serviceId}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            {isAllowed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                              <p className="text-sm text-gray-600">
                                Required tier: {service.allowedTiers.map(t => 
                                  subscriptionTiers.find(st => st.name === t)?.displayName
                                ).join(', ')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {isAllowed ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Allowed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Restricted
                              </span>
                            )}
                            
                            {service.requiresApproval && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Requires Approval
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Features Comparison */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Included Features</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {subscriptionTiers.find(t => t.name === selectedTier)?.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 py-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Changes will take effect immediately
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || selectedTier === currentTier}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
