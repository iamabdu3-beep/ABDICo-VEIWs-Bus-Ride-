import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';

type TranslationsType = typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (newLang: Language) => void;
  toggleLang: () => void;
  isAm: boolean;
  t: TranslationsType;
  formatETB: (amount: number) => string;
  getLocalized: (enText: string, amText?: string) => string;
}

const STORAGE_KEY = 'busride_language_preference';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: Language;
  onLanguageChange?: (lang: Language) => void;
}> = ({ children, initialLang, onLanguageChange }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (initialLang) return initialLang;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'am') {
        return stored;
      }
      // Check browser navigator language
      const navLang = navigator.language?.toLowerCase() || '';
      if (navLang.startsWith('am')) return 'am';
    }
    return 'en';
  });

  // Sync with document element for screen readers and styling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-lang', lang);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  }, [lang, onLanguageChange]);

  // Synchronize when other tabs / components update storage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'en' || e.newValue === 'am')) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    triggerHaptic(12);
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
      // Dispatch custom event for any listeners
      window.dispatchEvent(new CustomEvent('busride-language-changed', { detail: { lang: newLang } }));
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'am' : 'en');
  }, [lang, setLang]);

  const isAm = lang === 'am';

  const t = useMemo(() => {
    return translations[lang] || translations.en;
  }, [lang]);

  const formatETB = useCallback(
    (amount: number) => {
      return isAm ? `${amount.toLocaleString()} ብር` : `${amount.toLocaleString()} ETB`;
    },
    [isAm]
  );

  const getLocalized = useCallback(
    (enText: string, amText?: string) => {
      if (isAm && amText) return amText;
      return enText;
    },
    [isAm]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      isAm,
      t,
      formatETB,
      getLocalized,
    }),
    [lang, setLang, toggleLang, isAm, t, formatETB, getLocalized]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for isolated component testing or outside provider
    const fallbackLang: Language = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'am' ? 'am' : 'en';
    return {
      lang: fallbackLang,
      setLang: () => {},
      toggleLang: () => {},
      isAm: fallbackLang === 'am',
      t: translations[fallbackLang] || translations.en,
      formatETB: (amt: number) => (fallbackLang === 'am' ? `${amt} ብር` : `${amt} ETB`),
      getLocalized: (en: string, am?: string) => (fallbackLang === 'am' && am ? am : en),
    };
  }
  return context;
};
