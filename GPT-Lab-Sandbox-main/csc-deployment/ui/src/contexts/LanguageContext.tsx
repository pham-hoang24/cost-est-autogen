'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultLanguage, getLanguageByCode, isRTL } from '@/lib/i18n/config';
import { getTranslation } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(defaultLanguage);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
      setDirection(isRTL(savedLanguage) ? 'rtl' : 'ltr');
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      const lang = getLanguageByCode(browserLang) ? browserLang : defaultLanguage;
      setLanguageState(lang);
      setDirection(isRTL(lang) ? 'rtl' : 'ltr');
    }
  }, []);

  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    setDirection(isRTL(lang) ? 'rtl' : 'ltr');
    localStorage.setItem('preferred-language', lang);
  };

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, direction }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

