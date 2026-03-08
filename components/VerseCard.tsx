import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Share,
  Platform,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/constants/colors";
import { useSavedVerses } from "@/contexts/SavedVersesContext";
import type { Verse } from "@/data/verses";

interface VerseCardProps {
  verse: Verse;
  gradient?: [string, string];
  showCategory?: string;
  large?: boolean;
}

function navigateToPassage(verse: Verse) {
  if (verse.book && verse.chapter) {
    router.push({
      pathname: "/bible/reader",
      params: { book: verse.book, chapter: verse.chapter.toString() },
    });
  }
}

export default function VerseCard({ verse, gradient, showCategory, large }: VerseCardProps) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const { isSaved, toggleSave } = useSavedVerses();
  const saved = isSaved(verse.id);
  const hasPassageLink = !!(verse.book && verse.chapter);

  const handleSave = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleSave(verse);
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Share.share({
        message: `"${verse.text}"\n\n- ${verse.reference}`,
      });
    } catch {}
  };

  const handleReadPassage = () => {
    if (hasPassageLink) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      navigateToPassage(verse);
    }
  };

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientCard, large && styles.gradientCardLarge]}
      >
        {showCategory ? (
          <Text style={styles.gradientCategoryLabel}>{showCategory}</Text>
        ) : null}
        <Text
          style={[
            styles.gradientVerseText,
            large && styles.gradientVerseTextLarge,
          ]}
        >
          {`\u201C${verse.text}\u201D`}
        </Text>
        {hasPassageLink ? (
          <Pressable
            onPress={handleReadPassage}
            style={({ pressed }) => [
              styles.referenceLink,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            hitSlop={6}
            testID={`read-passage-${verse.id}`}
          >
            <Text style={styles.gradientReference}>{verse.reference}</Text>
            <Ionicons name="open-outline" size={14} color="rgba(255,255,255,0.75)" />
          </Pressable>
        ) : (
          <Text style={styles.gradientReference}>{verse.reference}</Text>
        )}
        <View style={styles.actions}>
          <Pressable
            onPress={handleSave}
            hitSlop={12}
            style={({ pressed }) => [
              styles.actionBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={22}
              color="rgba(255,255,255,0.9)"
            />
          </Pressable>
          <Pressable
            onPress={handleShare}
            hitSlop={12}
            style={({ pressed }) => [
              styles.actionBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color="rgba(255,255,255,0.9)"
            />
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.verseText, { color: colors.text }]}>
        {`\u201C${verse.text}\u201D`}
      </Text>
      {hasPassageLink ? (
        <Pressable
          onPress={handleReadPassage}
          style={({ pressed }) => [
            styles.referenceLink,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          hitSlop={6}
          testID={`read-passage-${verse.id}`}
        >
          <Text style={[styles.reference, { color: colors.tint }]}>
            {verse.reference}
          </Text>
          <Ionicons name="open-outline" size={13} color={colors.tint} />
        </Pressable>
      ) : (
        <Text style={[styles.reference, { color: colors.tint }]}>
          {verse.reference}
        </Text>
      )}
      <View style={styles.actions}>
        <Pressable
          onPress={handleSave}
          hitSlop={12}
          style={({ pressed }) => [
            styles.actionBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={saved ? colors.tint : colors.textMuted}
          />
        </Pressable>
        <Pressable
          onPress={handleShare}
          hitSlop={12}
          style={({ pressed }) => [
            styles.actionBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="share-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  gradientCardLarge: {
    padding: 28,
    marginVertical: 12,
  },
  gradientCategoryLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  gradientVerseText: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 18,
    lineHeight: 28,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  gradientVerseTextLarge: {
    fontSize: 22,
    lineHeight: 34,
  },
  gradientReference: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  referenceLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 6,
    borderWidth: 1,
  },
  verseText: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 12,
  },
  reference: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },
});
