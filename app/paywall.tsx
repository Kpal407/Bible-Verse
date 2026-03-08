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

  const findPackage = (keyword: string) =>
    packages.find(
      (p) =>
        p.identifier.toLowerCase().includes(keyword) ||
        p.packageType?.toLowerCase?.()?.includes?.(keyword)
    );

  const TIERS = [
    {
      id: "yearly",
      label: t("paywall.yearly"),
      price: "$29.99",
      desc: t("paywall.yearlyDesc"),
      highlight: true,
      pkg: findPackage("annual") || findPackage("year"),
    },
    {
      id: "monthly",
      label: t("paywall.monthly"),
      price: "$4.99",
      desc: t("paywall.monthlyDesc"),
      highlight: false,
      pkg: findPackage("month"),
    },
    {
      id: "lifetime",
      label: t("paywall.lifetime"),
      price: "$59.99",
      desc: t("paywall.lifetimeDesc"),
      highlight: false,
      pkg: findPackage("lifetime"),
    },
  ];

  const FEATURES = [
    {
      icon: "calendar-outline" as const,
      title: t("paywall.liturgicalCalendar"),
      description: t("paywall.liturgicalCalendarDesc"),
    },
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
          colors={[colors.gold, "#A8287E"]}
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

        <View style={styles.packagesSection}>
          {TIERS.map((tier) => (
            <React.Fragment key={tier.id}>
              {tier.highlight && (
                <View style={[styles.bestValueTag, { backgroundColor: colors.gold }]}>
                  <Ionicons name="ribbon-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.bestValueText}>{t("paywall.bestValue")}</Text>
                </View>
              )}
              <Pressable
                onPress={() =>
                  tier.pkg
                    ? handlePurchase(tier.pkg)
                    : Alert.alert(t("paywall.comingSoon"), t("paywall.comingSoonAlert"))
                }
                disabled={purchasing}
                style={({ pressed }) => [
                  styles.packageCard,
                  tier.highlight && styles.packageCardHighlight,
                  {
                    backgroundColor: colors.card,
                    borderColor: tier.highlight ? colors.gold : colors.divider,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                testID={`package-${tier.id}`}
              >
                <Text style={[styles.packageTitle, { color: colors.text }]}>{tier.label}</Text>
                <Text style={[styles.packagePrice, { color: colors.gold }]}>{tier.price}</Text>
                <Text style={[styles.packageDesc, { color: colors.textSecondary }]}>{tier.desc}</Text>
              </Pressable>
            </React.Fragment>
          ))}
        </View>

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
  bestValueTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
    marginBottom: -8,
    zIndex: 1,
  },
  bestValueText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  packageCard: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  packageCardHighlight: {
    paddingTop: 28,
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
