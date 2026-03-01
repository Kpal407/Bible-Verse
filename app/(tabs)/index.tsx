import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/constants/colors";
import { getVerseOfTheDay, getAllCategories } from "@/data/verses";
import VerseCard from "@/components/VerseCard";
import CategoryCard from "@/components/CategoryCard";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [, setTick] = useState(0);

  const { verse: todayVerse, category: todayCategory } = getVerseOfTheDay();
  const categories = getAllCategories();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTick((t) => t + 1);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const webTopInset = Platform.OS === "web" ? 67 : 0;

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
          <Text style={[styles.dateLabel, { color: colors.textMuted }]}>{dateStr}</Text>
          <Text style={[styles.title, { color: colors.text }]}>Verse of the Day</Text>
        </View>

        <VerseCard
          verse={todayVerse}
          gradient={todayCategory.gradient}
          showCategory={todayCategory.name}
          large
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What are you going through?
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Find verses that speak to your heart
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse Topics</Text>
        </View>

        {categories.slice(0, 5).map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </ScrollView>
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
