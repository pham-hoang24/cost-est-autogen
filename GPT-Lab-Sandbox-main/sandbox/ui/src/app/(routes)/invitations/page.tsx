'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Mail, 
  Calendar, 
  Users, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Eye,
  UserPlus,
  Building2,
  Globe,
  Lock,
  Brain,
  Database,
  FileText,
  Code
} from 'lucide-react';

function InvitationsPage() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDataSharingAgreement, setShowDataSharingAgreement] = useState(false);
  const [consentData, setConsentData] = useState({
    data_sharing_consent: false,
    ai_processing_consent: false,
    cross_border_consent: false
  });
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchInvitations();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Separate useEffect for handling URL token
  useEffect(() => {
    const token = searchParams.get('token');
    if (token && invitations.length > 0) {
      const invitation = invitations.find(inv => inv.invitation_token === token);
      if (invitation && invitation.status === 'pending') {
        setSelectedInvitation(invitation);
        setShowDataSharingAgreement(true);
      }
    }
  }, [searchParams, invitations]);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/collaboration/invitations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setInvitations(result.data.invitations || []);
      } else {
        console.error('Failed to fetch invitations');
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
    setLoading(false);
  };

  const handleAcceptInvitation = async () => {
    if (!selectedInvitation) return;
    
    setAcceptLoading(true);
    setError('');

    try {
      const response = await fetch('/api/collaboration/invitations/accept', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invitation_token: selectedInvitation.invitation_token,
          ...consentData
        })
      });

      const result = await response.json();

      if (result.success) {
        setShowConsentModal(false);
        setSelectedInvitation(null);
        setConsentData({
          data_sharing_consent: false,
          ai_processing_consent: false,
          cross_border_consent: false
        });
        fetchInvitations(); // Refresh invitations
      } else {
        setError(result.message || 'Failed to accept invitation');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }

    setAcceptLoading(false);
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_development': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'data_analysis': return <Database className="w-4 h-4 text-blue-400" />;
      case 'research': return <FileText className="w-4 h-4 text-green-400" />;
      case 'model_training': return <Code className="w-4 h-4 text-orange-400" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return <Lock className="w-4 h-4 text-red-400" />;
      case 'organization': return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'public': return <Globe className="w-4 h-4 text-green-400" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'contributor': return 'secondary';
      case 'viewer': return 'muted';
      case 'reviewer': return 'secondary';
      default: return 'muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'declined': return 'danger';
      case 'expired': return 'muted';
      default: return 'muted';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary text-xl">Loading Invitations...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Mail className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Authentication Required</h2>
          <p className="text-text-secondary mb-4">Please log in to view your invitations</p>
          <Button className="btn-primary" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary text-xl">Loading Invitations...</p>
        </div>
      </div>
    );
  }

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const otherInvitations = invitations.filter(inv => inv.status !== 'pending');

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-text-primary">
            Project <span className="text-primary">Invitations</span>
          </h1>
          <p className="text-text-secondary mt-2">
            Manage your collaboration invitations and join research projects
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">
              {pendingInvitations.length} Pending
            </Badge>
            <Badge variant="muted">
              {invitations.length} Total
            </Badge>
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Pending Invitations</h2>
          <div className="grid gap-4">
            {pendingInvitations.map((invitation) => (
              <Card key={invitation.id} className="p-6 border-l-4 border-l-yellow-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getProjectTypeIcon(invitation.project?.project_type)}
                      <h3 className="text-lg font-semibold text-text-primary">
                        {invitation.project_name}
                      </h3>
                      <Badge variant={getRoleColor(invitation.role) as any}>
                        {invitation.role}
                      </Badge>
                    </div>
                    
                    <p className="text-text-secondary mb-3">
                      <strong>{invitation.invited_by_name}</strong> invited you to collaborate
                    </p>
                    
                    {invitation.message && (
                      <div className="bg-surface rounded-lg p-3 mb-3">
                        <p className="text-text-primary text-sm italic">"{invitation.message}"</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedInvitation(invitation);
                        setShowDataSharingAgreement(true);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Review & Accept
                    </Button>
                    <Button variant="outline" size="sm">
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Invitations History */}
      {otherInvitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Invitation History</h2>
          <div className="grid gap-4">
            {otherInvitations.map((invitation) => (
              <Card key={invitation.id} className="p-4 opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getProjectTypeIcon(invitation.project?.project_type)}
                    <div>
                      <h4 className="font-medium text-text-primary">{invitation.project_name}</h4>
                      <p className="text-sm text-text-secondary">
                        Invited by {invitation.invited_by_name} • {invitation.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(invitation.status) as any}>
                      {invitation.status}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {invitations.length === 0 && (
        <Card className="p-12 text-center">
          <Mail className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No invitations yet</h3>
          <p className="text-text-secondary mb-4">
            You'll see project collaboration invitations here when colleagues invite you to join their research
          </p>
        </Card>
      )}

      {/* Data Sharing Agreement Modal */}
      {showDataSharingAgreement && selectedInvitation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDataSharingAgreement(false)}
        >
          <Card 
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 bg-background border border-border shadow-2xl"
            onClick={() => {}}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Data Sharing Agreement</h2>
                <p className="text-text-secondary">{selectedInvitation.project_name}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDataSharingAgreement(false)}
                className="bg-background border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Close
              </Button>
            </div>

            <div className="space-y-6">
              {/* Agreement Overview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-bold">EU AI Act & GDPR Compliant Agreement</span>
                </div>
                <p className="text-blue-700 text-sm">
                  This data sharing agreement ensures full compliance with EU AI Act (2024/1689), 
                  GDPR, and research exemption provisions. Please review carefully before proceeding.
                </p>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-4 rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Project Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {selectedInvitation.project_name}</div>
                    <div><strong>Type:</strong> {selectedInvitation.project?.project_type || 'Research'}</div>
                    <div><strong>Your Role:</strong> {selectedInvitation.role}</div>
                    <div><strong>Invited by:</strong> {selectedInvitation.invited_by_name}</div>
                  </div>
                </div>
                <div className="bg-surface p-4 rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Legal Framework</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Legal Basis:</strong> Research Exemption (GDPR Art. 89)</div>
                    <div><strong>DPIA Required:</strong> {selectedInvitation.project?.requires_dpia ? 'Yes' : 'No'}</div>
                    <div><strong>Cross-border:</strong> {selectedInvitation.project?.cross_border_transfers ? 'Yes' : 'No'}</div>
                    <div><strong>Retention:</strong> {selectedInvitation.project?.data_retention_days || 365} days</div>
                  </div>
                </div>
              </div>

              {/* Data Processing Activities */}
              <div>
                <h4 className="font-medium text-text-primary mb-3">Data Processing Activities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2">✅ What We Will Do</h5>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Collaborative research and analysis</li>
                      <li>• Secure data sharing within project team</li>
                      <li>• Statistical analysis and pattern recognition</li>
                      <li>• Publication of anonymized research results</li>
                      {selectedInvitation.project?.project_type === 'ai_development' && (
                        <li>• AI model training with human oversight</li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h5 className="font-medium text-red-800 mb-2">❌ What We Will NOT Do</h5>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Sell or commercialize your personal data</li>
                      <li>• Use data for purposes outside this project</li>
                      <li>• Share data with unauthorized third parties</li>
                      <li>• Retain data beyond the specified period</li>
                      <li>• Use data for automated decision-making affecting you</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div>
                <h4 className="font-medium text-text-primary mb-3">Your Rights Under GDPR & EU AI Act</h4>
                <div className="bg-surface p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-text-primary mb-2">Data Subject Rights</h5>
                      <ul className="text-text-secondary space-y-1">
                        <li>✓ Right to access your data</li>
                        <li>✓ Right to rectification</li>
                        <li>✓ Right to erasure ("right to be forgotten")</li>
                        <li>✓ Right to restrict processing</li>
                        <li>✓ Right to data portability</li>
                        <li>✓ Right to object to processing</li>
                        <li>✓ Right to withdraw consent</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-text-primary mb-2">AI-Specific Rights</h5>
                      <ul className="text-text-secondary space-y-1">
                        <li>✓ Right to explanation of AI decisions</li>
                        <li>✓ Right to human review of automated decisions</li>
                        <li>✓ Right to challenge AI system outcomes</li>
                        <li>✓ Right to transparency about AI processing</li>
                        <li>✓ Right to opt-out of AI processing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Contacts */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-text-primary mb-2">Legal Contacts & Support</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-text-secondary">
                  <div>
                    <div><strong>Data Protection Officer:</strong> dpo@sw4e.org</div>
                    <div><strong>Privacy Questions:</strong> privacy@sw4e.org</div>
                  </div>
                  <div>
                    <div><strong>Legal Support:</strong> legal@sw4e.org</div>
                    <div><strong>Security Issues:</strong> security@sw4e.org</div>
                  </div>
                </div>
              </div>

              {/* Agreement Acceptance */}
              <div className="border-t border-border pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <input
                    id="agreement_accepted"
                    type="checkbox"
                    checked={agreementAccepted}
                    onChange={(e) => setAgreementAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label htmlFor="agreement_accepted" className="text-sm text-text-primary">
                    <strong>I have read and accept the Data Sharing Agreement</strong> and understand 
                    my rights under GDPR and EU AI Act. I acknowledge that this agreement complies 
                    with all applicable EU data protection regulations.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDataSharingAgreement(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  className="btn-primary flex-1"
                  disabled={!agreementAccepted}
                  onClick={() => {
                    setShowDataSharingAgreement(false);
                    setShowConsentModal(true);
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Proceed to Consent
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Consent Modal */}
      {showConsentModal && selectedInvitation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowConsentModal(false)}
        >
          <Card 
            className="max-w-lg w-full p-6 bg-background border border-border shadow-2xl"
            onClick={() => {}}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Join Project</h2>
                <p className="text-text-secondary">{selectedInvitation.project_name}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowConsentModal(false)}
                className="bg-background border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Close
              </Button>
            </div>

            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                  <AlertTriangle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Invitation Details */}
              <div className="bg-surface rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Invitation Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Role:</span>
                    <Badge variant={getRoleColor(selectedInvitation.role) as any}>
                      {selectedInvitation.role}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Invited by:</span>
                    <span className="text-text-primary">{selectedInvitation.invited_by_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Expires:</span>
                    <span className="text-text-primary">
                      {new Date(selectedInvitation.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {selectedInvitation.message && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-text-primary text-sm italic">"{selectedInvitation.message}"</p>
                  </div>
                )}
              </div>

              {/* GDPR Consent Form */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-primary">
                  <Shield className="w-5 h-5" />
                  <h4 className="font-medium">Data Processing Consent (GDPR)</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      id="data_sharing_consent"
                      type="checkbox"
                      checked={consentData.data_sharing_consent}
                      onChange={(e) => setConsentData(prev => ({ ...prev, data_sharing_consent: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    />
                    <div>
                      <label htmlFor="data_sharing_consent" className="text-sm font-medium text-text-primary">
                        I consent to sharing my research data within this project *
                      </label>
                      <p className="text-xs text-text-muted">
                        Required for collaboration. You can withdraw consent at any time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="ai_processing_consent"
                      type="checkbox"
                      checked={consentData.ai_processing_consent}
                      onChange={(e) => setConsentData(prev => ({ ...prev, ai_processing_consent: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    />
                    <div>
                      <label htmlFor="ai_processing_consent" className="text-sm font-medium text-text-primary">
                        I consent to AI processing of my data for research purposes
                      </label>
                      <p className="text-xs text-text-muted">
                        Allows automated analysis and AI model training on shared data.
                      </p>
                    </div>
                  </div>

                  {selectedInvitation.project?.cross_border_transfers && (
                    <div className="flex items-start gap-3">
                      <input
                        id="cross_border_consent"
                        type="checkbox"
                        checked={consentData.cross_border_consent}
                        onChange={(e) => setConsentData(prev => ({ ...prev, cross_border_consent: e.target.checked }))}
                        className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                      <div>
                        <label htmlFor="cross_border_consent" className="text-sm font-medium text-text-primary">
                          I consent to cross-border data transfers
                        </label>
                        <p className="text-xs text-text-muted">
                          Data may be processed outside the EU with appropriate safeguards.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Your Rights Under GDPR</span>
                </div>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Right to access your data</li>
                  <li>• Right to rectification and erasure</li>
                  <li>• Right to data portability</li>
                  <li>• Right to withdraw consent at any time</li>
                  <li>• Right to object to processing</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowConsentModal(false)}
                  disabled={acceptLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  className="btn-primary flex-1"
                  disabled={acceptLoading || !consentData.data_sharing_consent}
                  onClick={handleAcceptInvitation}
                >
                  {acceptLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept & Join
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}

// Wrapper component with Suspense boundary
function InvitationsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InvitationsPage />
    </Suspense>
  );
}

export default InvitationsPageWrapper;
