'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '@/utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Only access localStorage after component is mounted
    try {
      if (typeof window !== 'undefined') {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ms')) {
          setLanguage(savedLanguage as 'en' | 'ms');
        }
      }
    } catch (error) {
      console.warn('Failed to load language from localStorage:', error);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang);
      }
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  };

  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: unknown = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key; // Return key if translation not found
        }
      }
      
      return typeof value === 'string' ? value : key;
    } catch (error) {
      console.warn('Translation error:', error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
