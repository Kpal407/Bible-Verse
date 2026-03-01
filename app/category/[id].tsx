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
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "@/constants/colors";
import { getCategoryById } from "@/data/verses";
import VerseCard from "@/components/VerseCard";
import type { Category } from "@/data/verses";

function CategoryIcon({ category, size, color }: { category: Category; size: number; color: string }) {
  const props = { name: category.icon as any, size, color };
  switch (category.iconFamily) {
    case "MaterialCommunityIcons":
      return <MaterialCommunityIcons {...props} />;
    case "Feather":
      return <Feather {...props} />;
    case "MaterialIcons":
      return <MaterialIcons {...props} />;
    default:
      return <Ionicons {...props} />;
  }
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();
  const category = getCategoryById(id);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Category not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + webTopInset, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={category.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
          </Pressable>

          <View style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <CategoryIcon category={category} size={36} color="rgba(255,255,255,0.95)" />
            </View>
            <Text style={styles.heroTitle}>{category.name}</Text>
            <Text style={styles.heroDescription}>{category.description}</Text>
            <Text style={styles.heroCount}>
              {category.verses.length} verse{category.verses.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.versesSection}>
          {category.verses.map((verse) => (
            <VerseCard key={verse.id} verse={verse} />
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
  scrollContent: {},
  heroGradient: {
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroContent: {
    alignItems: "center",
    gap: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    color: "#FFFFFF",
    textAlign: "center",
  },
  heroDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  heroCount: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  versesSection: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
});
