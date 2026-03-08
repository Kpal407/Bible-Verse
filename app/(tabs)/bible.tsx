import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  Pressable,
  useColorScheme,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/constants/colors";
import { bibleBooks, type BibleBook } from "@/data/bible-books";
import { usePremium } from "@/contexts/PremiumContext";
import { useBibleStorage } from "@/contexts/BibleStorageContext";

const oldTestament = bibleBooks.filter((b) => b.testament === "old");
const newTestament = bibleBooks.filter((b) => b.testament === "new");

const sections = [
  { title: "Old Testament", data: oldTestament },
  { title: "New Testament", data: newTestament },
];

function BookRow({ book, colors }: { book: BibleBook; colors: any }) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/bible/chapters",
          params: { book: book.name, chapters: book.chapters.toString() },
        })
      }
      style={({ pressed }) => [
        styles.bookRow,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.divider,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      testID={`book-${book.abbreviation}`}
    >
      <View style={styles.bookInfo}>
        <Text style={[styles.bookName, { color: colors.text }]}>{book.name}</Text>
        <Text style={[styles.bookChapters, { color: colors.textMuted }]}>
          {book.chapters} chapter{book.chapters !== 1 ? "s" : ""}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function DownloadBanner({ colors }: { colors: any }) {
  const { isPremium } = usePremium();
  const {
    isDownloaded,
    isDownloading,
    downloadProgress,
    downloadedBooks,
    totalBooks,
    currentBook,
    startDownload,
    cancelDownload,
    deleteDownload,
    totalVerses,
    hasPartialDownload,
  } = useBibleStorage();

  if (!isPremium && !isDownloaded) {
    return (
      <Pressable
        onPress={() => router.push("/paywall")}
        style={({ pressed }) => [
          styles.downloadBanner,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        testID="offline-upgrade-banner"
      >
        <View style={[styles.bannerIcon, { backgroundColor: colors.tintLight }]}>
          <Ionicons name="cloud-download-outline" size={22} color={colors.gold} />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>
            Offline Bible
          </Text>
          <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
            Upgrade to download all 31,102 verses for offline reading
          </Text>
        </View>
        <View style={[styles.upgradeBadge, { backgroundColor: colors.gold }]}>
          <Ionicons name="star" size={12} color="#FFFFFF" />
        </View>
      </Pressable>
    );
  }

  if (isDownloading) {
    const pct = Math.round(downloadProgress * 100);
    return (
      <View
        style={[
          styles.downloadBanner,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <View style={[styles.bannerIcon, { backgroundColor: colors.tintLight }]}>
          <ActivityIndicator size="small" color={colors.gold} />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>
            Downloading... {pct}%
          </Text>
          <Text style={[styles.bannerDesc, { color: colors.textSecondary }]} numberOfLines={1}>
            {currentBook} ({downloadedBooks}/{totalBooks} books)
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.divider }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.gold, width: `${pct}%` as any },
              ]}
            />
          </View>
        </View>
        <Pressable
          onPress={cancelDownload}
          style={({ pressed }) => [
            styles.cancelBtn,
            { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
          ]}
          hitSlop={8}
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    );
  }

  if (isDownloaded) {
    return (
      <View
        style={[
          styles.downloadBanner,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <View style={[styles.bannerIcon, { backgroundColor: "rgba(76,175,80,0.15)" }]}>
          <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>
            Offline Bible Ready
          </Text>
          <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
            {totalVerses > 0 ? `${totalVerses.toLocaleString()} verses` : "All 66 books"} available offline
          </Text>
        </View>
      </View>
    );
  }

  if (isPremium && !isDownloaded && !isDownloading) {
    return (
      <Pressable
        onPress={startDownload}
        style={({ pressed }) => [
          styles.downloadBanner,
          {
            backgroundColor: colors.card,
            borderColor: colors.gold,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        testID="download-bible-button"
      >
        <View style={[styles.bannerIcon, { backgroundColor: colors.tintLight }]}>
          <Ionicons name="cloud-download-outline" size={22} color={colors.gold} />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>
            {hasPartialDownload ? "Resume Download" : "Download Full KJV Bible"}
          </Text>
          <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
            {hasPartialDownload
              ? `${downloadedBooks}/${totalBooks} books downloaded -- tap to continue`
              : "Save all 31,102 verses for offline reading"}
          </Text>
        </View>
        <Ionicons name="download-outline" size={22} color={colors.gold} />
      </Pressable>
    );
  }

  return null;
}

export default function BibleScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.abbreviation}
        renderItem={({ item }) => <BookRow book={item} colors={colors} />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.sectionTitle, { color: colors.gold }]}>{title}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={{ paddingTop: insets.top + 16 + webTopInset }}>
            <View style={styles.header}>
              <View style={styles.headerIconRow}>
                <View style={[styles.headerIcon, { backgroundColor: colors.tintLight }]}>
                  <Ionicons name="book" size={28} color={colors.gold} />
                </View>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>King James Bible</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Read the complete Holy Bible
              </Text>
            </View>
            <DownloadBanner colors={colors} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
    alignItems: "center",
  },
  headerIconRow: {
    marginBottom: 12,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 8,
  },
  downloadBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  bannerDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  upgradeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden" as const,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  cancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    marginBottom: 2,
  },
  bookChapters: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
