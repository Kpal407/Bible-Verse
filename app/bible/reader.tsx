import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import { getBookByName } from "@/data/bible-books";

interface BibleVerse {
  verse: number;
  text: string;
}

export default function ReaderScreen() {
  const { book, chapter } = useLocalSearchParams<{ book: string; chapter: string }>();
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chapterNum = parseInt(chapter || "1");
  const bookData = getBookByName(book || "");
  const maxChapters = bookData?.chapters || 1;

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    loadChapter();
  }, [book, chapter]);

  const loadChapter = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("GET", `/api/bible/${encodeURIComponent(book || "")}/${chapterNum}`);
      const data = await res.json();
      if (data.verses) {
        setVerses(data.verses);
      }
    } catch (err) {
      setError("Unable to load this chapter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToChapter = (ch: number) => {
    router.replace({
      pathname: "/bible/reader",
      params: { book: book, chapter: ch.toString() },
    });
  };

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
          <View style={styles.headerCenter}>
            <Text style={[styles.headerBook, { color: colors.text }]} numberOfLines={1}>
              {book}
            </Text>
            <Text style={[styles.headerChapter, { color: colors.textMuted }]}>
              Chapter {chapterNum}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading chapter...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
            <Pressable
              onPress={loadChapter}
              style={({ pressed }) => [
                styles.retryBtn,
                { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.retryText, { color: colors.gold }]}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.chapterTitle}>
              <Text style={[styles.chapterTitleText, { color: colors.gold }]}>
                Chapter {chapterNum}
              </Text>
            </View>

            <View style={styles.versesContainer}>
              {verses.map((v) => (
                <Text key={v.verse} style={[styles.verseText, { color: colors.text }]}>
                  <Text style={[styles.verseNumber, { color: colors.gold }]}>
                    {v.verse}{" "}
                  </Text>
                  {v.text}
                </Text>
              ))}
            </View>
          </>
        )}

        {!loading && !error && (
          <View style={styles.navRow}>
            {chapterNum > 1 ? (
              <Pressable
                onPress={() => goToChapter(chapterNum - 1)}
                style={({ pressed }) => [
                  styles.navBtn,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 },
                ]}
                testID="prev-chapter"
              >
                <Ionicons name="chevron-back" size={18} color={colors.gold} />
                <Text style={[styles.navText, { color: colors.gold }]}>
                  Ch. {chapterNum - 1}
                </Text>
              </Pressable>
            ) : (
              <View />
            )}
            {chapterNum < maxChapters ? (
              <Pressable
                onPress={() => goToChapter(chapterNum + 1)}
                style={({ pressed }) => [
                  styles.navBtn,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 },
                ]}
                testID="next-chapter"
              >
                <Text style={[styles.navText, { color: colors.gold }]}>
                  Ch. {chapterNum + 1}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.gold} />
              </Pressable>
            ) : (
              <View />
            )}
          </View>
        )}
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerBook: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
  },
  headerChapter: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  loadingContainer: {
    paddingTop: 100,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  errorContainer: {
    paddingTop: 80,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  chapterTitle: {
    alignItems: "center",
    marginBottom: 20,
  },
  chapterTitleText: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 20,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  versesContainer: {
    gap: 4,
  },
  verseText: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 2,
  },
  verseNumber: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    paddingBottom: 20,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  navText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
