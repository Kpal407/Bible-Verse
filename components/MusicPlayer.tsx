import React from "react";
import { StyleSheet, Text, View, Pressable, useColorScheme, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/constants/colors";
import { useMusic } from "@/contexts/MusicContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MusicPlayer() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const { currentTrack, isPlaying, isLoading, pause, resume, stop } = useMusic();
  const { t } = useLanguage();

  if (!currentTrack) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.divider,
          bottom: Platform.OS === "web" ? 94 : 85,
        },
      ]}
    >
      <Pressable
        style={styles.trackInfo}
        onPress={() => router.push("/music")}
      >
        <View style={[styles.musicIcon, { backgroundColor: colors.tintLight }]}>
          <Ionicons name="musical-notes" size={16} color={colors.gold} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.trackName, { color: colors.text }]} numberOfLines={1}>
            {currentTrack.name}
          </Text>
          <Text style={[styles.trackDesc, { color: colors.textMuted }]} numberOfLines={1}>
            {isLoading ? t("music.loading") : isPlaying ? t("music.playing") : t("music.paused")}
          </Text>
        </View>
      </Pressable>
      <View style={styles.controls}>
        <Pressable
          onPress={isPlaying ? pause : resume}
          style={({ pressed }) => [
            styles.controlBtn,
            { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
          ]}
          disabled={isLoading}
          hitSlop={8}
          testID="music-play-pause"
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color={colors.gold}
          />
        </Pressable>
        <Pressable
          onPress={stop}
          style={({ pressed }) => [
            styles.controlBtn,
            { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
          ]}
          hitSlop={8}
          testID="music-stop"
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    zIndex: 100,
  },
  trackInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  musicIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  trackName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  trackDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  controlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
