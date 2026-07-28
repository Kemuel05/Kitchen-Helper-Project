import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  DEFAULT_MUSIC_TRACK_ID,
  MUSIC_TRACKS,
  getMusicTrackById,
  isMusicTrackId,
} from "./music-tracks";
import type {
  MusicTrack,
  MusicTrackId,
} from "./music-tracks";

const SELECTED_TRACK_STORAGE_KEY =
  "food-valley-selected-music-track";

const MUSIC_ENABLED_STORAGE_KEY =
  "food-valley-music-enabled";

const MUSIC_VOLUME = 0.35;

type MusicContextValue = {
  tracks: MusicTrack[];
  selectedTrackId: MusicTrackId;
  selectedTrack: MusicTrack;
  isMusicEnabled: boolean;
  isPlaying: boolean;
  isReady: boolean;
  selectTrack: (
    trackId: MusicTrackId
  ) => Promise<void>;
  setMusicEnabled: (
    enabled: boolean
  ) => Promise<void>;
  toggleMusic: () => Promise<void>;
};

type MusicProviderProps = {
  children: ReactNode;
};

const MusicContext =
  createContext<MusicContextValue | null>(null);

export function MusicProvider({
  children,
}: MusicProviderProps) {
  const defaultTrack = getMusicTrackById(
    DEFAULT_MUSIC_TRACK_ID
  );

  const player = useAudioPlayer(defaultTrack.source, {
    downloadFirst: true,
  });

  const playerStatus = useAudioPlayerStatus(player);

  const [selectedTrackId, setSelectedTrackId] =
    useState<MusicTrackId>(
      DEFAULT_MUSIC_TRACK_ID
    );

  const [isMusicEnabled, setIsMusicEnabledState] =
    useState(true);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function initializeMusic() {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: "doNotMix",
        });

        player.loop = true;
        player.volume = MUSIC_VOLUME;

        const [
          storedTrackId,
          storedMusicEnabled,
        ] = await Promise.all([
          AsyncStorage.getItem(
            SELECTED_TRACK_STORAGE_KEY
          ),
          AsyncStorage.getItem(
            MUSIC_ENABLED_STORAGE_KEY
          ),
        ]);

        if (!isActive) {
          return;
        }

        const restoredTrackId =
          isMusicTrackId(storedTrackId)
            ? storedTrackId
            : DEFAULT_MUSIC_TRACK_ID;

        const restoredMusicEnabled =
        storedMusicEnabled === null
            ? true
            : storedMusicEnabled === "true";

        const restoredTrack =
          getMusicTrackById(restoredTrackId);

        setSelectedTrackId(restoredTrackId);
        setIsMusicEnabledState(
          restoredMusicEnabled
        );

        if (
          restoredTrackId !==
          DEFAULT_MUSIC_TRACK_ID
        ) {
          player.replace(restoredTrack.source);
        }

        player.loop = true;
        player.volume = MUSIC_VOLUME;

        if (restoredMusicEnabled) {
          player.play();
        }
      } catch (error) {
        console.error(
          "Unable to initialize music:",
          error
        );
      } finally {
        if (isActive) {
          setIsReady(true);
        }
      }
    }

    void initializeMusic();

    return () => {
      isActive = false;
    };
  }, [player]);

  const selectTrack = useCallback(
    async (trackId: MusicTrackId) => {
      const nextTrack =
        getMusicTrackById(trackId);

      try {
        player.pause();
        player.replace(nextTrack.source);

        player.loop = true;
        player.volume = MUSIC_VOLUME;

        setSelectedTrackId(trackId);

        await AsyncStorage.setItem(
          SELECTED_TRACK_STORAGE_KEY,
          trackId
        );

        if (isMusicEnabled) {
          player.play();
        }
      } catch (error) {
        console.error(
          "Unable to change music track:",
          error
        );

        throw error;
      }
    },
    [isMusicEnabled, player]
  );

  const setMusicEnabled = useCallback(
    async (enabled: boolean) => {
      try {
        if (enabled) {
          player.loop = true;
          player.volume = MUSIC_VOLUME;
          player.play();
        } else {
          player.pause();
        }

        setIsMusicEnabledState(enabled);

        await AsyncStorage.setItem(
          MUSIC_ENABLED_STORAGE_KEY,
          enabled.toString()
        );
      } catch (error) {
        console.error(
          "Unable to update music setting:",
          error
        );

        throw error;
      }
    },
    [player]
  );

  const toggleMusic = useCallback(async () => {
    await setMusicEnabled(!isMusicEnabled);
  }, [isMusicEnabled, setMusicEnabled]);

  const selectedTrack = useMemo(
    () => getMusicTrackById(selectedTrackId),
    [selectedTrackId]
  );

  const contextValue = useMemo<MusicContextValue>(
    () => ({
      tracks: MUSIC_TRACKS,
      selectedTrackId,
      selectedTrack,
      isMusicEnabled,
      isPlaying: playerStatus.playing,
      isReady,
      selectTrack,
      setMusicEnabled,
      toggleMusic,
    }),
    [
      selectedTrackId,
      selectedTrack,
      isMusicEnabled,
      playerStatus.playing,
      isReady,
      selectTrack,
      setMusicEnabled,
      toggleMusic,
    ]
  );

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextValue {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error(
      "useMusic must be used inside MusicProvider."
    );
  }

  return context;
}