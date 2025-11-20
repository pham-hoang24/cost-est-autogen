'use client';

// Simplified Homepage - Application Focused
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Shield, 
  Brain, 
  Users, 
  LogIn,
  UserPlus,
  GraduationCap,
  Building2,
  User
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Only show landing page to non-authenticated users
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            {t('home.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="btn-primary text-lg px-8 py-3"
              onClick={() => router.push('/login')}
            >
              <LogIn className="w-5 h-5 mr-2" />
              {t('nav.login')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              onClick={() => router.push('/register')}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {t('nav.register')}
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academic Hub */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/academic')}>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{t('home.academicHub')}</h3>
              <p className="text-text-secondary text-sm mb-4">
                {t('home.academicHubDesc')}
              </p>
              <Button variant="outline" size="sm">{t('home.explore')}</Button>
            </Card>

            {/* Company Hub */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/company-onboarding')}>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{t('home.companyHub')}</h3>
              <p className="text-text-secondary text-sm mb-4">
                {t('home.companyHubDesc')}
              </p>
              <Button variant="outline" size="sm">{t('home.explore')}</Button>
            </Card>

            {/* Collaboration Hub */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/collaborations/discovery')}>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{t('home.collaborationHub')}</h3>
              <p className="text-text-secondary text-sm mb-4">
                {t('home.collaborationHubDesc')}
              </p>
              <Button variant="outline" size="sm">{t('home.explore')}</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-surface/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">{t('home.platformFeatures')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-text-primary mb-2">{t('home.aiServices')}</h3>
              <p className="text-sm text-text-secondary">{t('home.aiServicesDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-bold text-text-primary mb-2">{t('home.euCompliant')}</h3>
              <p className="text-sm text-text-secondary">{t('home.euCompliantDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-bold text-text-primary mb-2">{t('home.collaborative')}</h3>
              <p className="text-sm text-text-secondary">{t('home.collaborativeDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-8">{t('home.quickAccess')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" onClick={() => router.push('/features')}>{t('home.features')}</Button>
            <Button variant="outline" onClick={() => router.push('/faq')}>{t('nav.faq')}</Button>
          </div>
        </div>
      </section>

    </div>
  );
}