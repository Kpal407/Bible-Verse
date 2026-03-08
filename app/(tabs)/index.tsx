import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "@/constants/colors";
import { getVerseOfTheDay, getAllCategories } from "@/data/verses";
import { getTodayEvent, getUpcomingEvents, LiturgicalEvent } from "@/data/liturgical-calendar";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useMusic } from "@/contexts/MusicContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStreak } from "@/contexts/StreakContext";
import VerseCard from "@/components/VerseCard";
import CategoryCard from "@/components/CategoryCard";
import MusicPlayer from "@/components/MusicPlayer";
import UpgradeBanner from "@/components/UpgradeBanner";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [, setTick] = useState(0);

  const { prefs } = useNotifications();
  const { isPremium } = usePremium();
  const { currentTrack } = useMusic();
  const { t, language, setLanguage, dateLocale } = useLanguage();
  const { streak, loaded: streakLoaded } = useStreak();
  const { verse: todayVerse, category: todayCategory } = getVerseOfTheDay();
  const categories = getAllCategories();

  const todayEvent = getTodayEvent();
  const upcomingEvents = getUpcomingEvents(1);
  const liturgicalEvent: LiturgicalEvent | null = todayEvent ?? (upcomingEvents.length > 0 ? upcomingEvents[0] : null);
  const isToday = !!todayEvent;

  const getDaysUntil = (event: LiturgicalEvent): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTick((t) => t + 1);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString(dateLocale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const categoryName = t(`category.${todayCategory.id}.name`);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 + webTopInset, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.dateLabel, { color: colors.textMuted }]}>{dateStr}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{t("today.verseOfTheDay")}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={toggleLanguage}
                style={({ pressed }) => [
                  styles.headerBtn,
                  { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
                ]}
                hitSlop={8}
                testID="language-toggle"
              >
                <Ionicons name="globe-outline" size={18} color={colors.gold} />
                <Text style={[styles.langLabel, { color: colors.gold }]}>
                  {language.toUpperCase()}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/music")}
                style={({ pressed }) => [
                  styles.headerBtn,
                  { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
                ]}
                hitSlop={8}
                testID="music-button"
              >
                <Ionicons
                  name={currentTrack ? "musical-notes" : "musical-notes-outline"}
                  size={18}
                  color={colors.gold}
                />
              </Pressable>
              {!isPremium && (
                <Pressable
                  onPress={() => router.push("/paywall")}
                  style={({ pressed }) => [
                    styles.headerBtn,
                    { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
                  ]}
                  hitSlop={8}
                  testID="premium-button"
                >
                  <Ionicons name="star" size={16} color={colors.gold} />
                </Pressable>
              )}
              <Pressable
                onPress={() => router.push("/notification-settings")}
                style={({ pressed }) => [
                  styles.headerBtn,
                  { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
                ]}
                hitSlop={8}
                testID="notification-settings-button"
              >
                <Ionicons
                  name={prefs.enabled ? "notifications" : "notifications-outline"}
                  size={20}
                  color={colors.gold}
                />
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable
          onPress={toggleLanguage}
          style={({ pressed }) => [
            styles.bilingualBadge,
            { backgroundColor: colors.tintLight, opacity: pressed ? 0.85 : 1 },
          ]}
          testID="bilingual-badge"
        >
          <Ionicons name="globe-outline" size={16} color={colors.gold} />
          <Text style={[styles.bilingualText, { color: colors.gold }]}>
            {t("bilingual.badge")}
          </Text>
          <Text style={[styles.bilingualDivider, { color: colors.textMuted }]}>|</Text>
          <Text style={[styles.bilingualTranslation, { color: colors.textSecondary }]}>
            {language === "en" ? t("bilingual.kjv") : t("bilingual.rvr")}
          </Text>
          <Ionicons name="swap-horizontal" size={14} color={colors.textMuted} />
        </Pressable>

        {liturgicalEvent && (
          <Pressable
            onPress={() => router.push("/(tabs)/calendar" as any)}
            style={({ pressed }) => [
              styles.eventBanner,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            testID="liturgical-event-banner"
          >
            <LinearGradient
              colors={liturgicalEvent.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.eventBannerGradient}
            >
              <View style={styles.eventIconWrap}>
                <Ionicons name={liturgicalEvent.icon as any} size={22} color="#FFFFFF" />
              </View>
              <View style={styles.eventTextWrap}>
                <View style={styles.eventNameRow}>
                  <Text style={styles.eventName} numberOfLines={1}>
                    {t(liturgicalEvent.nameKey)}
                  </Text>
                  {isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>{t("calendar.today")}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.eventDate} numberOfLines={1}>
                  {isToday
                    ? t(liturgicalEvent.descKey).length > 60
                      ? t(liturgicalEvent.descKey).slice(0, 60) + "..."
                      : t(liturgicalEvent.descKey)
                    : (() => {
                        const days = getDaysUntil(liturgicalEvent);
                        if (days === 1) return t("calendar.tomorrow");
                        return t("calendar.inDays").replace("{count}", String(days));
                      })()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </Pressable>
        )}

        {streakLoaded && streak > 0 && (
          <View style={[styles.streakCard, { backgroundColor: colors.tintLight }]}>
            <View style={[styles.streakBadge, { backgroundColor: colors.gold }]}>
              <Ionicons name="flame" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.streakInfo}>
              <Text style={[styles.streakNumber, { color: colors.gold }]}>
                {streak} {t("streak.days")}
              </Text>
              <Text style={[styles.streakHint, { color: colors.textSecondary }]}>
                {streak === 1 ? t("streak.firstDay") : t("streak.keepGoing")}
              </Text>
            </View>
          </View>
        )}

        <VerseCard
          verse={todayVerse}
          gradient={todayCategory.gradient}
          showCategory={categoryName}
          large
        />

        {!isPremium && (
          <View style={styles.upgradeBannerWrap}>
            <UpgradeBanner variant="full" />
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("today.whatAreYouGoingThrough")}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            {t("today.findVerses")}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} compact />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("today.browseTopics")}</Text>
        </View>

        {categories.slice(0, 5).map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}

        {!isPremium && (
          <View style={styles.upgradeBannerWrap}>
            <UpgradeBanner variant="compact" />
          </View>
        )}
      </ScrollView>
      <MusicPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    flexShrink: 0,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  langLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    marginTop: -2,
  },
  dateLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    lineHeight: 36,
  },
  bilingualBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  bilingualText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  bilingualDivider: {
    fontSize: 13,
    marginHorizontal: 1,
  },
  bilingualTranslation: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 12,
  },
  streakBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  streakHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  eventBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
  },
  eventBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  eventIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  eventTextWrap: {
    flex: 1,
  },
  eventNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  todayBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  eventDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  upgradeBannerWrap: {
    marginTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
  },
  sectionSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 2,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
});
