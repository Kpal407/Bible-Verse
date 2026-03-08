import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "react-native";

let NetInfo: any = null;

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS === "web") {
      if (typeof window === "undefined") return;
      const update = () => { if (mounted) setIsConnected(navigator.onLine); };
      update();
      window.addEventListener("online", update);
      window.addEventListener("offline", update);
      return () => {
        mounted = false;
        window.removeEventListener("online", update);
        window.removeEventListener("offline", update);
      };
    }

    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const mod = await import("@react-native-community/netinfo");
        NetInfo = mod.default;
        unsubscribe = NetInfo.addEventListener((state: any) => {
          if (mounted) setIsConnected(state.isConnected ?? true);
        });
      } catch {
        if (mounted) setIsConnected(true);
      }
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return isConnected;
}

export default function OfflineBanner() {
  const isConnected = useNetworkStatus();
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const { t } = useLanguage();

  if (isConnected) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.card }]}>
      <Ionicons name="cloud-offline-outline" size={16} color="#E57373" />
      <Text style={[styles.text, { color: colors.text }]}>
        {t("offline.noConnection")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(229,115,115,0.3)",
  },
  text: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
