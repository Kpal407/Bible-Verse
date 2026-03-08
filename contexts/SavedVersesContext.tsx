import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Verse } from "@/data/verses";

const STORAGE_KEY = "@daily_word_saved_verses";

interface SavedVersesContextValue {
  savedVerses: Verse[];
  isSaved: (verseId: string) => boolean;
  toggleSave: (verse: Verse) => void;
  isLoading: boolean;
}

const SavedVersesContext = createContext<SavedVersesContextValue | null>(null);

export function SavedVersesProvider({ children }: { children: ReactNode }) {
  const [savedVerses, setSavedVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedVerses();
  }, []);

  const loadSavedVerses = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedVerses(JSON.parse(stored));
      }
    } catch (e) {
      if (__DEV__) console.error("Failed to load saved verses:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const isSaved = useCallback(
    (verseId: string) => savedVerses.some((v) => v.id === verseId),
    [savedVerses]
  );

  const toggleSave = useCallback(
    async (verse: Verse) => {
      const exists = savedVerses.some((v) => v.id === verse.id);
      let updated: Verse[];
      if (exists) {
        updated = savedVerses.filter((v) => v.id !== verse.id);
      } else {
        updated = [verse, ...savedVerses];
      }
      setSavedVerses(updated);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        if (__DEV__) console.error("Failed to save verses:", e);
      }
    },
    [savedVerses]
  );

  const value = useMemo(
    () => ({ savedVerses, isSaved, toggleSave, isLoading }),
    [savedVerses, isSaved, toggleSave, isLoading]
  );

  return (
    <SavedVersesContext.Provider value={value}>
      {children}
    </SavedVersesContext.Provider>
  );
}

export function useSavedVerses() {
  const context = useContext(SavedVersesContext);
  if (!context) {
    throw new Error("useSavedVerses must be used within a SavedVersesProvider");
  }
  return context;
}
