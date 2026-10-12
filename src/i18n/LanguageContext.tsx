import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, IssueCategory, IssueStatus } from '../types';
import { translations, LANGUAGES } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallbackOrParams?: string | Record<string, string | number>) => string;
  languages: typeof LANGUAGES;
  currentLanguageObj: typeof LANGUAGES[0];
  translateCategory: (category: IssueCategory | string) => string;
  translateStatus: (status: IssueStatus | string) => string;
  translateDepartment: (deptName: string) => string;
  translateTier: (tier: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Category mapping helper
const categoryKeyMap: Record<string, string> = {
  'Potholes & Roads': 'cat_potholes',
  'Roads & Potholes': 'cat_potholes',
  'Garbage & Sanitation': 'cat_garbage',
  'Sanitation & Solid Waste': 'cat_garbage',
  'Water Supply': 'cat_water',
  'Street Lighting': 'cat_lighting',
  'Drainage & Sewage': 'cat_drainage',
  'Parks & Public Spaces': 'cat_parks',
  'Encroachment & Traffic': 'cat_encroachment',
};

// Status mapping helper
const statusKeyMap: Record<string, string> = {
  submitted: 'status_submitted',
  filed: 'status_filed',
  escalated_tier2: 'status_escalated_tier2',
  escalated_tier3: 'status_escalated_tier3',
  claimed_resolved_by_official: 'status_claimed_resolved_by_official',
  open_for_ngo: 'status_open_for_ngo',
  ngo_claimed: 'status_ngo_claimed',
  resolved: 'status_resolved',
  closed: 'status_closed',
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = (localStorage.getItem('cir_lang') || localStorage.getItem('civicsetu_lang')) as Language;
      if (saved && translations[saved]) {
        return saved;
      }
    }
    // Default to Telugu for GHMC / Hyderabad if browser hints or fallback to English
    return 'te';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('cir_lang', lang);
      }
    }
  }, []);

  const t = useCallback(
    (key: string, fallbackOrParams?: string | Record<string, string | number>): string => {
      const langDict = translations[language] || translations.en;
      let text = langDict[key] || translations.en[key];

      if (!text) {
        if (typeof fallbackOrParams === 'string') {
          return fallbackOrParams;
        }
        return key;
      }

      if (fallbackOrParams && typeof fallbackOrParams === 'object') {
        Object.entries(fallbackOrParams).forEach(([paramKey, paramVal]) => {
          text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal));
        });
      }

      return text;
    },
    [language]
  );

  const translateCategory = useCallback(
    (category: IssueCategory | string): string => {
      const key = categoryKeyMap[category];
      if (key) {
        return t(key, category);
      }
      return category;
    },
    [t]
  );

  const translateStatus = useCallback(
    (status: IssueStatus | string): string => {
      const key = statusKeyMap[status];
      if (key) {
        return t(key, status.replace(/_/g, ' '));
      }
      return status.replace(/_/g, ' ');
    },
    [t]
  );

  const translateDepartment = useCallback(
    (deptName: string): string => {
      // Clean up common department prefix/suffix while keeping it descriptive
      return deptName;
    },
    []
  );

  const translateTier = useCallback(
    (tier: number): string => {
      if (tier === 1) return t('tier_1_officer', 'Tier 1 Ward Officer');
      if (tier === 2) return t('tier_2_engineer', 'Tier 2 Municipal Engineer');
      if (tier === 3) return t('tier_3_commissioner', 'Tier 3 GHMC Commissioner');
      return `Tier ${tier}`;
    },
    [t]
  );

  const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: LANGUAGES,
        currentLanguageObj,
        translateCategory,
        translateStatus,
        translateDepartment,
        translateTier,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
