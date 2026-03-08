import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { SavedVersesProvider } from "@/contexts/SavedVersesContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { MusicProvider } from "@/contexts/MusicContext";
import { BibleStorageProvider } from "@/contexts/BibleStorageContext";
import { useThemeColors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="category/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="bible/chapters"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="bible/reader"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="notification-settings"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          headerShown: false,
          presentation: "formSheet",
          sheetAllowedDetents: [0.85, 1],
          sheetGrabberVisible: true,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="music"
        options={{ headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PremiumProvider>
          <BibleStorageProvider>
            <SavedVersesProvider>
              <NotificationProvider>
                  <MusicProvider>
                  <GestureHandlerRootView>
                    <KeyboardProvider>
                      <RootLayoutNav />
                    </KeyboardProvider>
                  </GestureHandlerRootView>
                </MusicProvider>
              </NotificationProvider>
            </SavedVersesProvider>
          </BibleStorageProvider>
        </PremiumProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
