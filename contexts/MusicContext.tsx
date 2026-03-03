import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
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
  playTrack: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tracksLoaded: boolean;
}

const MusicContext = createContext<MusicContextValue | null>(null);

function getTrackUri(trackId: string): string {
  const baseUrl = getApiUrl();
  return new URL(`/api/music/stream/${trackId}`, baseUrl).toString();
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [pendingTrack, setPendingTrack] = useState<Track | null>(null);

  const { data: tracksData } = useQuery<{ tracks: Track[] }>({
    queryKey: ["/api/music/tracks"],
    staleTime: Infinity,
  });

  const tracks = tracksData?.tracks ?? [];
  const tracksLoaded = !!tracksData;

  const player = useAudioPlayer(
    currentTrack ? getTrackUri(currentTrack.id) : null,
    { updateInterval: 500 }
  );
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;
  const isLoading = status.isBuffering && !status.isLoaded;

  useEffect(() => {
    if (player) {
      player.loop = true;
      player.volume = 0.6;
    }
  }, [player]);

  useEffect(() => {
    if (pendingTrack && player && status.isLoaded && !status.isBuffering) {
      player.play();
      setPendingTrack(null);
    }
  }, [pendingTrack, status.isLoaded, status.isBuffering, player]);

  const playTrack = useCallback((track: Track) => {
    if (!player) return;
    if (currentTrack?.id === track.id) {
      player.play();
      return;
    }
    setPendingTrack(track);
    setCurrentTrack(track);
  }, [currentTrack, player]);

  const pause = useCallback(() => {
    if (player && currentTrack) {
      player.pause();
    }
  }, [player, currentTrack]);

  const resume = useCallback(() => {
    if (player && currentTrack) {
      player.play();
    }
  }, [player, currentTrack]);

  const stop = useCallback(() => {
    if (player && currentTrack) {
      player.pause();
    }
    setCurrentTrack(null);
    setPendingTrack(null);
  }, [player, currentTrack]);

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
    }),
    [tracks, currentTrack, isPlaying, isLoading, playTrack, pause, resume, stop, tracksLoaded]
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
