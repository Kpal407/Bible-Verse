import React from "react";
import { StyleSheet, Text, View, Pressable, useColorScheme } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";

interface UpgradeBannerProps {
  variant?: "full" | "compact" | "inline";
}

export default function UpgradeBanner({ variant = "full" }: UpgradeBannerProps) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const { t } = useLanguage();

  if (variant === "inline") {
    return (
      <Pressable
        onPress={() => router.push("/paywall")}
        style={({ pressed }) => [
          styles.inlineContainer,
          { backgroundColor: colors.tintLight, opacity: pressed ? 0.85 : 1 },
        ]}
        testID="upgrade-banner-inline"
      >
        <Ionicons name="star" size={16} color={colors.gold} />
        <Text style={[styles.inlineText, { color: colors.gold }]}>
          {t("upgrade.unlockAll")}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.gold} />
      </Pressable>
    );
  }

  if (variant === "compact") {
    return (
      <Pressable
        onPress={() => router.push("/paywall")}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        testID="upgrade-banner-compact"
      >
        <LinearGradient
          colors={[colors.gold, "#A8287E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.compactContainer}
        >
          <View style={styles.compactLeft}>
            <Ionicons name="star" size={18} color="rgba(255,255,255,0.95)" />
            <View>
              <Text style={styles.compactTitle}>{t("upgrade.goPremium")}</Text>
              <Text style={styles.compactSubtitle}>{t("upgrade.compactDesc")}</Text>
            </View>
          </View>
          <View style={styles.compactButton}>
            <Text style={styles.compactButtonText}>{t("upgrade.upgrade")}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push("/paywall")}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      testID="upgrade-banner-full"
    >
      <LinearGradient
        colors={[colors.gold, "#A8287E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fullContainer}
      >
        <View style={styles.fullHeader}>
          <View style={styles.starBadge}>
            <Ionicons name="star" size={20} color="rgba(255,255,255,0.95)" />
          </View>
          <Text style={styles.fullTitle}>{t("upgrade.goPremium")}</Text>
        </View>
        <Text style={styles.fullDescription}>{t("upgrade.fullDesc")}</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="cloud-download-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.featureText}>{t("upgrade.featureOffline")}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="infinite-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.featureText}>{t("upgrade.featureUnlimited")}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="musical-notes-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.featureText}>{t("upgrade.featureMusic")}</Text>
          </View>
        </View>
        <View style={styles.fullButton}>
          <Text style={styles.fullButtonText}>{t("upgrade.tryPremium")}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 22,
    gap: 14,
  },
  fullHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  starBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  fullDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  fullButton: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 2,
  },
  fullButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  compactContainer: {
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  compactTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  compactSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  compactButton: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  compactButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  inlineText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
