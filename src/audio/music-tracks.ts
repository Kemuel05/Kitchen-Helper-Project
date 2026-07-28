import type { AudioSource } from "expo-audio";

export type MusicTrackId =
  | "stardew-valley-overture"
  | "cloud-country"
  | "grandpas-theme"
  | "settling-in"
  | "pelican-town";

export type MusicTrack = {
  id: MusicTrackId;
  title: string;
  source: AudioSource;
};

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "stardew-valley-overture",
    title: "Stardew Valley Overture",
    source: require("../../assets/audio/stardew-valley-overture.mp3"),
  },
  {
    id: "cloud-country",
    title: "Cloud Country",
    source: require("../../assets/audio/cloud-country.mp3"),
  },
  {
    id: "grandpas-theme",
    title: "Grandpa's Theme",
    source: require("../../assets/audio/grandpas-theme.mp3"),
  },
  {
    id: "settling-in",
    title: "Settling In",
    source: require("../../assets/audio/settling-in.mp3"),
  },
  {
    id: "pelican-town",
    title: "Pelican Town",
    source: require("../../assets/audio/pelican-town.mp3"),
  },
];

export const DEFAULT_MUSIC_TRACK_ID: MusicTrackId =
  "stardew-valley-overture";

export function isMusicTrackId(
  value: unknown
): value is MusicTrackId {
  return MUSIC_TRACKS.some((track) => track.id === value);
}

export function getMusicTrackById(
  trackId: MusicTrackId
): MusicTrack {
  return (
    MUSIC_TRACKS.find((track) => track.id === trackId) ??
    MUSIC_TRACKS[0]
  );
}