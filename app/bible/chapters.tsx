import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/constants/colors";

export default function ChaptersScreen() {
  const { book, chapters } = useLocalSearchParams<{ book: string; chapters: string }>();
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();
  const chapterCount = parseInt(chapters || "1");

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const chapterNumbers = Array.from({ length: chapterCount }, (_, i) => i + 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + webTopInset, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
            ]}
            hitSlop={12}
            testID="back-button"
          >
            <Ionicons name="chevron-back" size={22} color={colors.gold} />
          </Pressable>
        </View>

        <View style={styles.titleSection}>
          <View style={[styles.bookIcon, { backgroundColor: colors.tintLight }]}>
            <Ionicons name="book-outline" size={24} color={colors.gold} />
          </View>
          <Text style={[styles.bookTitle, { color: colors.text }]}>{book}</Text>
          <Text style={[styles.chapterLabel, { color: colors.textSecondary }]}>
            {chapterCount} Chapter{chapterCount !== 1 ? "s" : ""}
          </Text>
        </View>

        <View style={styles.grid}>
          {chapterNumbers.map((num) => (
            <Pressable
              key={num}
              onPress={() =>
                router.push({
                  pathname: "/bible/reader",
                  params: { book: book, chapter: num.toString() },
                })
              }
              style={({ pressed }) => [
                styles.chapterCell,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              testID={`chapter-${num}`}
            >
              <Text style={[styles.chapterNum, { color: colors.text }]}>{num}</Text>
            </Pressable>
          ))}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  bookIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  bookTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    textAlign: "center",
    marginBottom: 4,
  },
  chapterLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chapterCell: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterNum: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
});
