import React from "react";
import { StyleSheet, Text, View, Pressable, Platform, useColorScheme } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { Category } from "@/data/verses";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryCardProps {
  category: Category;
  compact?: boolean;
}

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

export default function CategoryCard({ category, compact }: CategoryCardProps) {
  const { t } = useLanguage();
  const name = t(`category.${category.id}.name`);
  const description = t(`category.${category.id}.description`);

  const handlePress = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: "/category/[id]", params: { id: category.id } });
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compactCard,
          { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <LinearGradient
          colors={category.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          <CategoryIcon category={category} size={24} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
        <Text style={styles.compactName} numberOfLines={1}>
          {name}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={category.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <CategoryIcon category={category} size={28} color="rgba(255,255,255,0.95)" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        </View>
        <View style={styles.count}>
          <Text style={styles.countText}>{category.verses.length}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  count: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  compactCard: {
    alignItems: "center",
    width: 80,
    gap: 6,
  },
  compactGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  compactName: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#8E8EA0",
    textAlign: "center",
  },
});
