import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  useColorScheme,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/constants/colors";
import { getCategoryById, shuffleVerses } from "@/data/verses";
import VerseCard from "@/components/VerseCard";
import { apiRequest } from "@/lib/query-client";
import { usePremium } from "@/contexts/PremiumContext";
import type { Category, Verse } from "@/data/verses";

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
  const [verses, setVerses] = useState<Verse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [aiLoadCount, setAiLoadCount] = useState(0);
  const seenRefsRef = useRef<Set<string>>(new Set());
  const { isPremium, canLoadMoreAI, remainingFreeLoads } = usePremium();

  const loadAIVerses = useCallback(async (currentVerses: Verse[], pageNum: number): Promise<{ verses: Verse[]; gotNew: boolean }> => {
    try {
      const excludeRefs = Array.from(seenRefsRef.current);
      const excludeParam = excludeRefs.length > 0 ? `&exclude=${encodeURIComponent(excludeRefs.join(","))}` : "";
      const res = await apiRequest("GET", `/api/verses/${id}?page=${pageNum}${excludeParam}`);
      const data = await res.json();

      if (data.available === false) {
        setAiAvailable(false);
        return { verses: currentVerses, gotNew: false };
      }

      if (data.verses && Array.isArray(data.verses)) {
        const newVerses = data.verses.filter(
          (v: Verse) => !seenRefsRef.current.has(v.reference)
        );
        newVerses.forEach((v: Verse) => seenRefsRef.current.add(v.reference));
        return { verses: [...currentVerses, ...newVerses], gotNew: newVerses.length > 0 };
      }
    } catch (err) {
      console.log("AI verses unavailable, using local only");
    }
    return { verses: currentVerses, gotNew: false };
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (category) {
        seenRefsRef.current = new Set();
        setAiAvailable(true);
        const shuffled = shuffleVerses(category.verses);
        shuffled.forEach((v) => seenRefsRef.current.add(v.reference));
        setVerses(shuffled);
        setPage(1);

        loadAIVerses(shuffled, 1).then(({ verses: merged }) => {
          setVerses(merged);
        });
      }
    }, [id])
  );

  const handleReshuffle = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (category) {
      setRefreshing(true);
      seenRefsRef.current = new Set();
      setAiAvailable(true);
      const shuffled = shuffleVerses(category.verses);
      shuffled.forEach((v) => seenRefsRef.current.add(v.reference));
      setVerses(shuffled);
      setPage(1);

      const { verses: merged } = await loadAIVerses(shuffled, 1);
      setVerses(shuffleVerses(merged));
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    if (!canLoadMoreAI(aiLoadCount)) {
      router.push("/paywall");
      return;
    }
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    const { verses: merged } = await loadAIVerses(verses, nextPage);
    setVerses(merged);
    setAiLoadCount((c) => c + 1);
    setLoadingMore(false);
  };

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

  const renderHeader = () => (
    <LinearGradient
      colors={category.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroGradient, { paddingTop: insets.top + webTopInset + 12 }]}
    >
      <View style={styles.heroTopRow}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          hitSlop={12}
          testID="back-button"
        >
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
        </Pressable>
        <Pressable
          onPress={handleReshuffle}
          style={({ pressed }) => [
            styles.shuffleBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          hitSlop={12}
          testID="shuffle-button"
        >
          <Ionicons name="shuffle" size={22} color="rgba(255,255,255,0.9)" />
        </Pressable>
      </View>

      <View style={styles.heroContent}>
        <View style={styles.heroIcon}>
          <CategoryIcon category={category} size={36} color="rgba(255,255,255,0.95)" />
        </View>
        <Text style={styles.heroTitle}>{category.name}</Text>
        <Text style={styles.heroDescription}>{category.description}</Text>
        <Text style={styles.heroCount}>
          {verses.length} verse{verses.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </LinearGradient>
  );

  const renderFooter = () => {
    if (!aiAvailable) return null;
    if (loadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.gold} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding more verses...
          </Text>
        </View>
      );
    }

    const canLoad = canLoadMoreAI(aiLoadCount);
    const remaining = remainingFreeLoads(aiLoadCount);

    return (
      <View>
        <Pressable
          onPress={handleLoadMore}
          style={({ pressed }) => [
            styles.loadMoreBtn,
            { backgroundColor: canLoad ? colors.card : colors.tintLight, opacity: pressed ? 0.8 : 1 },
          ]}
          testID="load-more-button"
        >
          <Ionicons
            name={canLoad ? "add-circle-outline" : "star"}
            size={20}
            color={colors.gold}
          />
          <Text style={[styles.loadMoreText, { color: colors.gold }]}>
            {canLoad ? "Load More Verses" : "Unlock Unlimited Verses"}
          </Text>
        </Pressable>
        {!isPremium && canLoad && remaining < 3 && (
          <Text style={[styles.freeLoadsHint, { color: colors.textMuted }]}>
            {remaining} free {remaining === 1 ? "load" : "loads"} remaining
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={verses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VerseCard verse={item} />}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleReshuffle}
            tintColor="#FFFFFF"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroGradient: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  shuffleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
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
  loadingMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 10,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  loadMoreText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  freeLoadsHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
});
