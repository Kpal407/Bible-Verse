import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  useColorScheme,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "@/constants/colors";
import { usePremium } from "@/contexts/PremiumContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PaywallScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();
  const { offerings, purchasePackage, restorePurchases, isPremium } = usePremium();
  const { t } = useLanguage();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const currentOffering = offerings?.current;
  const packages = currentOffering?.availablePackages || [];

  const FEATURES = [
    {
      icon: "cloud-download-outline" as const,
      title: t("paywall.offlineBible"),
      description: t("paywall.offlineBibleDesc"),
    },
    {
      icon: "infinite-outline" as const,
      title: t("paywall.unlimitedAi"),
      description: t("paywall.unlimitedAiDesc"),
    },
    {
      icon: "musical-notes-outline" as const,
      title: t("paywall.premiumMusic"),
      description: t("paywall.premiumMusicDesc"),
    },
    {
      icon: "heart-outline" as const,
      title: t("paywall.supportMission"),
      description: t("paywall.supportMissionDesc"),
    },
  ];

  const handlePurchase = async (pkg: any) => {
    setPurchasing(true);
    try {
      const success = await purchasePackage(pkg);
      if (success) {
        router.back();
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert(t("paywall.restored"), t("paywall.restoredMsg"));
        router.back();
      } else {
        Alert.alert(t("paywall.noPurchases"), t("paywall.noPurchasesMsg"));
      }
    } finally {
      setRestoring(false);
    }
  };

  if (isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.premiumActive, { paddingTop: insets.top + webTopInset + 20 }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.closeBtn, { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 }]}
            hitSlop={12}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={48} color={colors.gold} />
          </View>
          <Text style={[styles.premiumTitle, { color: colors.text }]}>{t("paywall.yourePremium")}</Text>
          <Text style={[styles.premiumSubtitle, { color: colors.textSecondary }]}>
            {t("paywall.fullAccess")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + webTopInset }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.closeBtn, { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 }]}
          hitSlop={12}
          testID="paywall-close-button"
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>

        <LinearGradient
          colors={[colors.gold, "#B8832E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <Ionicons name="star" size={40} color="#FFFFFF" />
          <Text style={styles.heroTitle}>{t("paywall.title")}</Text>
          <Text style={styles.heroSubtitle}>{t("paywall.subtitle")}</Text>
        </LinearGradient>

        <View style={styles.featuresSection}>
          {FEATURES.map((feature, idx) => (
            <View key={idx} style={[styles.featureRow, { borderBottomColor: colors.divider }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.tintLight }]}>
                <Ionicons name={feature.icon} size={22} color={colors.gold} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {packages.length > 0 ? (
          <View style={styles.packagesSection}>
            {packages.map((pkg) => {
              const product = pkg.product;
              return (
                <Pressable
                  key={pkg.identifier}
                  onPress={() => handlePurchase(pkg)}
                  disabled={purchasing}
                  style={({ pressed }) => [
                    styles.packageCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.gold,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  testID={`package-${pkg.identifier}`}
                >
                  <Text style={[styles.packageTitle, { color: colors.text }]}>
                    {product.title || pkg.identifier}
                  </Text>
                  <Text style={[styles.packagePrice, { color: colors.gold }]}>
                    {product.priceString}
                  </Text>
                  {product.description ? (
                    <Text style={[styles.packageDesc, { color: colors.textSecondary }]}>
                      {product.description}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.packagesSection}>
            <Pressable
              onPress={() => {
                Alert.alert(
                  t("paywall.comingSoon"),
                  t("paywall.comingSoonAlert")
                );
              }}
              style={({ pressed }) => [
                styles.packageCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.gold,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              testID="premium-placeholder"
            >
              <Text style={[styles.packageTitle, { color: colors.text }]}>{t("paywall.premium")}</Text>
              <Text style={[styles.packagePrice, { color: colors.gold }]}>{t("paywall.comingSoon")}</Text>
              <Text style={[styles.packageDesc, { color: colors.textSecondary }]}>
                {t("paywall.comingSoonDesc")}
              </Text>
            </Pressable>
          </View>
        )}

        {purchasing && (
          <ActivityIndicator size="small" color={colors.gold} style={styles.spinner} />
        )}

        <Pressable
          onPress={handleRestore}
          disabled={restoring}
          style={({ pressed }) => [styles.restoreBtn, { opacity: pressed ? 0.6 : 1 }]}
          testID="restore-purchases-button"
        >
          {restoring ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <Text style={[styles.restoreText, { color: colors.textMuted }]}>{t("paywall.restorePurchases")}</Text>
          )}
        </Pressable>

        <Text style={[styles.legalText, { color: colors.textMuted }]}>
          {t("paywall.legalText")}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  heroBanner: {
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 36,
    alignItems: "center",
    gap: 10,
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    textAlign: "center",
  },
  heroSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  featuresSection: {
    marginTop: 28,
    marginHorizontal: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  featureDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  packagesSection: {
    marginTop: 28,
    marginHorizontal: 20,
    gap: 12,
  },
  packageCard: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  packageTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
  packagePrice: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
  },
  packageDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },
  spinner: {
    marginTop: 16,
  },
  restoreBtn: {
    alignSelf: "center",
    paddingVertical: 14,
    marginTop: 20,
  },
  restoreText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  legalText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
    marginHorizontal: 30,
    marginTop: 16,
    lineHeight: 16,
  },
  premiumActive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  premiumBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  premiumTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
  },
});
