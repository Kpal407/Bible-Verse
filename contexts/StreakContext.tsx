import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "@daily_word_streak";

interface StreakData {
  currentStreak: number;
  lastVisitDate: string;
  longestStreak: number;
  totalDays: number;
}

interface StreakContextValue {
  streak: number;
  longestStreak: number;
  totalDays: number;
  loaded: boolean;
}

const StreakContext = createContext<StreakContextValue | null>(null);

function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysDiff(olderDateStr: string, newerDateStr: string): number {
  const d1 = new Date(olderDateStr + "T00:00:00");
  const d2 = new Date(newerDateStr + "T00:00:00");
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function StreakProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    recordVisit();
  }, []);

  const recordVisit = async () => {
    const todayStr = getDateString(new Date());

    try {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      let data: StreakData = stored
        ? JSON.parse(stored)
        : { currentStreak: 0, lastVisitDate: "", longestStreak: 0, totalDays: 0 };

      if (data.lastVisitDate === todayStr) {
        setStreak(data.currentStreak);
        setLongestStreak(data.longestStreak);
        setTotalDays(data.totalDays);
        setLoaded(true);
        return;
      }

      if (!data.lastVisitDate) {
        data.currentStreak = 1;
      } else {
        const gap = daysDiff(data.lastVisitDate, todayStr);
        if (gap === 1) {
          data.currentStreak += 1;
        } else if (gap > 1) {
          data.currentStreak = 1;
        } else {
          setStreak(data.currentStreak);
          setLongestStreak(data.longestStreak);
          setTotalDays(data.totalDays);
          setLoaded(true);
          return;
        }
      }

      data.lastVisitDate = todayStr;
      data.totalDays += 1;
      if (data.currentStreak > data.longestStreak) {
        data.longestStreak = data.currentStreak;
      }

      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));

      setStreak(data.currentStreak);
      setLongestStreak(data.longestStreak);
      setTotalDays(data.totalDays);
    } catch (e) {
      setStreak(1);
      setTotalDays(1);
    } finally {
      setLoaded(true);
    }
  };

  const value = useMemo(
    () => ({ streak, longestStreak, totalDays, loaded }),
    [streak, longestStreak, totalDays, loaded]
  );

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error("useStreak must be used within a StreakProvider");
  }
  return context;
}
