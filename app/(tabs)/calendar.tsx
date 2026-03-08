import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useThemeColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import {
  getEventsForYear,
  getUpcomingEvents,
  getCurrentSeason,
  getTodayEvent,
  type LiturgicalEvent,
} from "@/data/liturgical-calendar";

function formatDate(date: Date, language: string): string {
  const months =
    language === "es"
      ? ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function groupByMonth(events: LiturgicalEvent[], language: string): { month: string; events: LiturgicalEvent[] }[] {
  const monthNames =
    language === "es"
      ? ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
      : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const groups: Record<number, LiturgicalEvent[]> = {};
  for (const event of events) {
    const m = event.date.getMonth();
    if (!groups[m]) groups[m] = [];
    groups[m].push(event);
  }

  return Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b)
    .map((m) => ({ month: monthNames[m], events: groups[m] }));
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const { isPremium } = usePremium();

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const currentSeason = useMemo(() => getCurrentSeason(), []);
  const todayEvent = useMemo(() => getTodayEvent(), []);
  const upcoming = useMemo(() => getUpcomingEvents(5), []);
  const year = new Date().getFullYear();
  const allEvents = useMemo(() => getEventsForYear(year), [year]);
  const monthGroups = useMemo(() => groupByMonth(allEvents, language), [allEvents, language]);

  const renderEventCard = (event: LiturgicalEvent, showDays: boolean = false) => {
    const days = daysUntil(event.date);
    const isToday = days === 0;
    const isPast = days < 0;

    return (
      <View
        key={event.id}
        style={[
          styles.eventCard,
          {
            backgroundColor: colors.card,
            borderLeftColor: event.color,
            opacity: isPast ? 0.5 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={event.gradient}
          style={styles.eventIconWrap}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={event.icon as any} size={18} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.eventInfo}>
          <Text style={[styles.eventName, { color: colors.text }]}>{t(event.nameKey)}</Text>
          <Text style={[styles.eventDate, { color: colors.textMuted }]}>
            {formatDate(event.date, language)}
          </Text>
          {isPremium && (
            <Text style={[styles.eventDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {t(event.descKey)}
            </Text>
          )}
        </View>
        {showDays && (
          <View style={styles.eventDaysBadge}>
            {isToday ? (
              <View style={[styles.todayBadge, { backgroundColor: colors.gold }]}>
                <Text style={styles.todayBadgeText}>{t("calendar.today")}</Text>
              </View>
            ) : !isPast ? (
              <Text style={[styles.daysText, { color: colors.textMuted }]}>
                {days === 1
                  ? t("calendar.tomorrow")
                  : t("calendar.inDays").replace("{count}", String(days))}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 + webTopInset, paddingBottom: 100 + webBottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>{t("calendar.title")}</Text>

        {currentSeason && (
          <LinearGradient
            colors={currentSeason.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.seasonBanner}
          >
            <Text style={styles.seasonLabel}>{t("calendar.currentSeason")}</Text>
            <Text style={styles.seasonName}>{t(currentSeason.nameKey)}</Text>
          </LinearGradient>
        )}

        {todayEvent && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("calendar.todayEvent")}</Text>
            {renderEventCard(todayEvent, true)}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("calendar.upcoming")}</Text>
          {upcoming.map((event) => renderEventCard(event, true))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("calendar.fullCalendar")}</Text>
            {!isPremium && (
              <View style={[styles.premiumLockBadge, { backgroundColor: colors.tintLight }]}>
                <Ionicons name="lock-closed" size={12} color={colors.gold} />
                <Text style={[styles.premiumLockText, { color: colors.gold }]}>{t("paywall.premium")}</Text>
              </View>
            )}
          </View>

          {!isPremium && (
            <Pressable
              onPress={() => router.push("/paywall")}
              style={({ pressed }) => [
                styles.unlockCard,
                { backgroundColor: colors.tintLight, opacity: pressed ? 0.85 : 1 },
              ]}
              testID="calendar-unlock-button"
            >
              <Ionicons name="calendar-outline" size={28} color={colors.gold} />
              <Text style={[styles.unlockTitle, { color: colors.text }]}>
                {t("calendar.unlockCalendar")}
              </Text>
              <Text style={[styles.unlockDesc, { color: colors.textSecondary }]}>
                {t("calendar.premiumCalendar")}
              </Text>
              <View style={[styles.unlockBtn, { backgroundColor: colors.gold }]}>
                <Text style={styles.unlockBtnText}>{t("upgrade.upgrade")}</Text>
              </View>
            </Pressable>
          )}

          {isPremium &&
            monthGroups.map((group) => (
              <View key={group.month} style={styles.monthGroup}>
                <Text style={[styles.monthTitle, { color: colors.gold }]}>{group.month}</Text>
                {group.events.map((event) => renderEventCard(event, false))}
              </View>
            ))}

          {!isPremium && (
            <View style={styles.lockedPreview}>
              {monthGroups.slice(0, 2).map((group) => (
                <View key={group.month} style={[styles.monthGroup, styles.blurredGroup]}>
                  <Text style={[styles.monthTitle, { color: colors.gold }]}>{group.month}</Text>
                  {group.events.slice(0, 2).map((event) => (
                    <View key={event.id} style={[styles.eventCard, { backgroundColor: colors.card, borderLeftColor: event.color, opacity: 0.4 }]}>
                      <LinearGradient colors={event.gradient} style={styles.eventIconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Ionicons name={event.icon as any} size={18} color="#FFFFFF" />
                      </LinearGradient>
                      <View style={styles.eventInfo}>
                        <Text style={[styles.eventName, { color: colors.text }]}>{t(event.nameKey)}</Text>
                        <Text style={[styles.eventDate, { color: colors.textMuted }]}>{formatDate(event.date, language)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 16,
  },
  seasonBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  seasonLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  seasonName: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    marginBottom: 12,
  },
  premiumLockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    marginBottom: 12,
  },
  premiumLockText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    marginBottom: 10,
    gap: 12,
  },
  eventIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  eventDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  eventDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  eventDaysBadge: {
    alignItems: "flex-end",
    minWidth: 50,
  },
  todayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
  daysText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  unlockCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  unlockTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  unlockDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 4,
  },
  unlockBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  unlockBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  monthGroup: {
    marginBottom: 16,
  },
  monthTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  blurredGroup: {
    opacity: 0.5,
  },
  lockedPreview: {
    overflow: "hidden",
  },
});
