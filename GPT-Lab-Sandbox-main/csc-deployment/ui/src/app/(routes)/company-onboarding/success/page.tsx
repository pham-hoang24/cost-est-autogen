'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { 
  CheckCircle,
  Building2,
  Handshake,
  Target,
  ArrowRight,
  Mail,
  Calendar,
  Users,
  Lightbulb
} from 'lucide-react';

export default function CompanyOnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Welcome to SW4E Sandbox!
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Your company registration has been submitted successfully. Our team will review your application and get back to you within 2-3 business days.
          </p>

          {/* Next Steps */}
          <Card className="p-8 bg-surface/50 border-primary/20 mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">What Happens Next?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Email Confirmation</h3>
                <p className="text-text-secondary text-sm">
                  You'll receive a confirmation email with your application details and next steps.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Review Process</h3>
                <p className="text-text-secondary text-sm">
                  Our team will review your application and verify your company information.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Get Started</h3>
                <p className="text-text-secondary text-sm">
                  Once approved, you'll get access to our collaboration platform and research network.
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">While You Wait</h2>
            <p className="text-text-secondary mb-6">
              Explore our platform and learn more about the collaboration opportunities available.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/collaborations/discovery">
                <Button className="w-full btn-outline">
                  <Target className="w-4 h-4 mr-2" />
                  Explore Collaborations
                </Button>
              </Link>
              <Link href="/academic">
                <Button className="w-full btn-outline">
                  <Users className="w-4 h-4 mr-2" />
                  Meet Researchers
                </Button>
              </Link>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 bg-surface/50 border-primary/20">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Need Help?</h2>
            <p className="text-text-secondary mb-4">
              If you have any questions about your application or need assistance, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/help">
                <Button className="btn-outline">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Help Center
                </Button>
              </Link>
              <Link href="mailto:support@sw4e.org">
                <Button className="btn-outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </Card>

          {/* Back to Home */}
          <div className="mt-8">
            <Link href="/">
              <Button className="btn-primary">
                <Building2 className="w-4 h-4 mr-2" />
                Back to Home
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
