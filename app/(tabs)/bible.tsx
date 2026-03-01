import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/constants/colors";
import { bibleBooks, type BibleBook } from "@/data/bible-books";

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
          <View style={[styles.header, { paddingTop: insets.top + 16 + webTopInset }]}>
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
