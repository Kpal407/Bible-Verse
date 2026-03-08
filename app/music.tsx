import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  useColorScheme,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "@/constants/colors";
import { useMusic, type Track } from "@/contexts/MusicContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useLanguage } from "@/contexts/LanguageContext";

function TrackCard({ track }: { track: Track }) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const { currentTrack, isPlaying, isLoading, playTrack, pause, resume } = useMusic();
  const { isPremium } = usePremium();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isLocked = track.premium && !isPremium;

  const handlePress = async () => {
    if (isLocked) {
      router.push("/paywall");
      return;
    }
    if (isCurrentTrack && isPlaying) {
      await pause();
    } else if (isCurrentTrack && !isPlaying) {
      await resume();
    } else {
      await playTrack(track);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isLoading && isCurrentTrack}
      style={({ pressed }) => [
        styles.trackCard,
        {
          backgroundColor: isCurrentTrack ? colors.tintLight : colors.card,
          borderColor: isCurrentTrack ? colors.gold : colors.cardBorder,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      testID={`track-${track.id}`}
    >
      <View style={[styles.trackIcon, { backgroundColor: isCurrentTrack ? colors.gold : colors.tintLight }]}>
        {isLoading && isCurrentTrack ? (
          <ActivityIndicator size="small" color={isCurrentTrack ? "#FFFFFF" : colors.gold} />
        ) : (
          <Ionicons
            name={isCurrentTrack && isPlaying ? "pause" : isLocked ? "lock-closed" : "play"}
            size={20}
            color={isCurrentTrack ? "#FFFFFF" : colors.gold}
          />
        )}
      </View>
      <View style={styles.trackText}>
        <View style={styles.trackNameRow}>
          <Text style={[styles.trackName, { color: colors.text }]}>{track.name}</Text>
          {track.premium && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.tintLight }]}>
              <Ionicons name="star" size={10} color={colors.gold} />
            </View>
          )}
        </View>
        <Text style={[styles.trackDesc, { color: colors.textSecondary }]}>{track.description}</Text>
      </View>
      {isCurrentTrack && isPlaying && (
        <View style={styles.equalizerWrap}>
          <View style={[styles.eqBar, styles.eqBar1, { backgroundColor: colors.gold }]} />
          <View style={[styles.eqBar, styles.eqBar2, { backgroundColor: colors.gold }]} />
          <View style={[styles.eqBar, styles.eqBar3, { backgroundColor: colors.gold }]} />
        </View>
      )}
    </Pressable>
  );
}

export default function MusicScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();
  const { tracks, tracksLoaded, currentTrack, isPlaying, stop } = useMusic();
  const { t } = useLanguage();

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const freeTracks = tracks.filter((t) => !t.premium);
  const premiumTracks = tracks.filter((t) => t.premium);

  const renderHeader = () => (
    <View>
      <LinearGradient
        colors={[colors.gold, "#9A7008"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + webTopInset + 12 }]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
          hitSlop={12}
          testID="music-back-button"
        >
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
        </Pressable>
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Ionicons name="musical-notes" size={36} color="rgba(255,255,255,0.95)" />
          </View>
          <Text style={styles.heroTitle}>{t("music.title")}</Text>
          <Text style={styles.heroSubtitle}>{t("music.subtitle")}</Text>
        </View>
      </LinearGradient>

      {currentTrack && (
        <View style={[styles.nowPlaying, { backgroundColor: colors.tintLight }]}>
          <View style={styles.nowPlayingInfo}>
            <Ionicons name={isPlaying ? "volume-high" : "volume-mute"} size={18} color={colors.gold} />
            <Text style={[styles.nowPlayingText, { color: colors.text }]}>
              {isPlaying ? `${t("music.nowPlaying")}: ${currentTrack.name}` : `${t("music.paused")}: ${currentTrack.name}`}
            </Text>
          </View>
          <Pressable
            onPress={stop}
            style={({ pressed }) => [styles.stopBtn, { opacity: pressed ? 0.7 : 1 }]}
            hitSlop={8}
          >
            <Ionicons name="stop-circle" size={24} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t("music.freeTracks")}</Text>
    </View>
  );

  const allItems = [
    ...freeTracks.map((t) => ({ type: "track" as const, track: t })),
    { type: "premiumHeader" as const, track: null as any },
    ...premiumTracks.map((t) => ({ type: "track" as const, track: t })),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!tracksLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item, idx) => item.type === "premiumHeader" ? "premium-header" : item.track.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => {
            if (item.type === "premiumHeader") {
              return (
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                  {t("music.premiumTracks")}
                </Text>
              );
            }
            return <TrackCard track={item.track} />;
          }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
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
  heroSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  nowPlaying: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  nowPlayingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  nowPlayingText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  stopBtn: {
    padding: 4,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.5,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  trackIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  trackText: {
    flex: 1,
  },
  trackNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trackName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  premiumBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  trackDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  equalizerWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 16,
    marginRight: 4,
  },
  eqBar: {
    width: 3,
    borderRadius: 1.5,
  },
  eqBar1: {
    height: 8,
  },
  eqBar2: {
    height: 14,
  },
  eqBar3: {
    height: 10,
  },
});
