import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Language, getTranslation, getBookName, getBibleTranslation, getDateLocale } from "@/lib/i18n";

const STORAGE_KEY = "@daily_word_language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getBookName: (englishName: string) => string;
  bibleTranslation: string;
  dateLocale: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "es" || stored === "en") {
        setLanguageState(stored);
      }
    }).catch(() => {});
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  }, []);

  const t = useMemo(() => getTranslation(language), [language]);
  const bookNameFn = useCallback((name: string) => getBookName(name, language), [language]);
  const bibleTranslation = getBibleTranslation(language);
  const dateLocale = getDateLocale(language);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      getBookName: bookNameFn,
      bibleTranslation,
      dateLocale,
    }),
    [language, setLanguage, t, bookNameFn, bibleTranslation, dateLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
