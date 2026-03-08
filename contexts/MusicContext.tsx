import React, { createContext, useContext, useState, useCallback, useMemo, useRef, ReactNode } from "react";
import { Platform, Alert } from "react-native";
import { Audio } from "expo-av";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/query-client";

export interface Track {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  premium: boolean;
}

interface MusicContextValue {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  playTrack: (track: Track) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  tracksLoaded: boolean;
  playbackError: string | null;
  clearError: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const { data: tracksData } = useQuery<{ tracks: Track[] }>({
    queryKey: ["/api/music/tracks"],
    staleTime: Infinity,
  });

  const tracks = tracksData?.tracks ?? [];
  const tracksLoaded = !!tracksData;

  const cleanup = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        if (__DEV__) console.log("Error cleaning up sound:", e);
      }
      soundRef.current = null;
    }
  }, []);

  const playTrack = useCallback(async (track: Track) => {
    setIsLoading(true);
    try {
      await cleanup();

      if (Platform.OS !== "web") {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      }

      const baseUrl = getApiUrl();
      const uri = new URL(`/api/music/stream/${track.id}`, baseUrl).toString();
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: true, volume: 0.6 }
      );
      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && !status.isBuffering) {
          setIsPlaying(false);
        }
      });
    } catch (e) {
      if (__DEV__) console.log("Error playing track:", e);
      setCurrentTrack(null);
      setIsPlaying(false);
      const errorMsg = "Unable to play this track. Please check your connection and try again.";
      setPlaybackError(errorMsg);
      Alert.alert("Playback Error", errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup]);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } catch (e) {
        if (__DEV__) console.log("Error pausing track:", e);
      }
    }
  }, []);

  const resume = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } catch (e) {
        if (__DEV__) console.log("Error resuming track:", e);
      }
    }
  }, []);

  const stop = useCallback(async () => {
    await cleanup();
    setCurrentTrack(null);
    setIsPlaying(false);
  }, [cleanup]);

  const clearError = useCallback(() => {
    setPlaybackError(null);
  }, []);

  const value = useMemo(
    () => ({
      tracks,
      currentTrack,
      isPlaying,
      isLoading,
      playTrack,
      pause,
      resume,
      stop,
      tracksLoaded,
      playbackError,
      clearError,
    }),
    [tracks, currentTrack, isPlaying, isLoading, playTrack, pause, resume, stop, tracksLoaded, playbackError, clearError]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
