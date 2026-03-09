import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getAllCategories, getRandomVerseFromCategory } from "@/data/verses";

const STORAGE_KEY = "@daily_word_notification_prefs";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationPrefs {
  enabled: boolean;
  categoryId: string;
  hour: number;
  minute: number;
}

const defaultPrefs: NotificationPrefs = {
  enabled: false,
  categoryId: "daily-devotional",
  hour: 7,
  minute: 0,
};

interface NotificationContextType {
  prefs: NotificationPrefs;
  updatePrefs: (newPrefs: Partial<NotificationPrefs>) => Promise<void>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  prefs: defaultPrefs,
  updatePrefs: async () => {},
  hasPermission: false,
  requestPermission: async () => false,
});

export function useNotifications() {
  return useContext(NotificationContext);
}

async function scheduleDaily(prefs: NotificationPrefs) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!prefs.enabled) return;

  const categories = getAllCategories();
  const category = categories.find((c) => c.id === prefs.categoryId);
  const categoryName = category?.name || "Daily Devotional";

  const verse = getRandomVerseFromCategory(prefs.categoryId);
  const body = verse
    ? `${verse.text}\n— ${verse.reference}`
    : "Open Verse Bloom for today's verse.";

  await Notifications.scheduleNotificationAsync({
    content: {
      title: categoryName,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: prefs.hour,
      minute: prefs.minute,
    },
  });
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [hasPermission, setHasPermission] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setPrefs(JSON.parse(stored));
        }
      } catch {}

      if (Platform.OS !== "web") {
        const { status } = await Notifications.getPermissionsAsync();
        setHasPermission(status === "granted");
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded && prefs.enabled && hasPermission && Platform.OS !== "web") {
      scheduleDaily(prefs);
    }
  }, [loaded, prefs, hasPermission]);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === "web") return false;
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === "granted";
    setHasPermission(granted);
    return granted;
  }, []);

  const updatePrefs = useCallback(async (newPrefs: Partial<NotificationPrefs>) => {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (Platform.OS !== "web") {
      if (updated.enabled && hasPermission) {
        await scheduleDaily(updated);
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    }
  }, [prefs, hasPermission]);

  return (
    <NotificationContext.Provider value={{ prefs, updatePrefs, hasPermission, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}
