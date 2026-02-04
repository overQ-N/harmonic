import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface AudioFile {
  path: string;
  name: string;
  size: number;
  extension: string;
  cover?: string; // Base64编码的封面图片
  artist?: string;
  album?: string;
}

interface AudioState {
  // Playback
  currentTrack: AudioFile | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: "one" | "all";
  // Playlist
  playlist: AudioFile[];
  currentIndex: number;
  // Actions
  setCurrentTrack: (track: AudioFile) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  setRepeat: (mode: "one" | "all") => void;
  setPlaylist: (files: AudioFile[]) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  selectTrack: (index: number) => void;
  // Tauri commands
  loadDirectory: (path: string) => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  shuffle: false,
  repeat: "all",
  playlist: [],
  currentIndex: -1,

  setCurrentTrack: track => set({ currentTrack: track }),
  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),
  setPlaying: playing => set({ isPlaying: playing }),
  setCurrentTime: time => set({ currentTime: time }),
  setDuration: duration => set({ duration }),
  setVolume: volume => set({ volume }),
  toggleShuffle: () => set(state => ({ shuffle: !state.shuffle })),
  setRepeat: mode => set({ repeat: mode }),
  setPlaylist: files => set({ playlist: files }),
  nextTrack: () => {
    const { playlist, currentIndex, shuffle } = get();
    if (playlist.length === 0) return;
    let nextIndex = currentIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (nextIndex >= playlist.length) {
      nextIndex = 0;
    }
    set({ currentIndex: nextIndex, currentTrack: playlist[nextIndex] });
  },
  prevTrack: () => {
    const { playlist, currentIndex, shuffle } = get();
    if (playlist.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (shuffle) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else if (prevIndex < 0) {
      prevIndex = playlist.length - 1;
    }
    set({
      currentIndex: prevIndex,
      currentTrack: playlist[prevIndex],
    });
  },
  selectTrack: index => {
    const { playlist } = get();
    if (index >= 0 && index < playlist.length) {
      set({ currentIndex: index, currentTrack: playlist[index] });
    }
  },

  loadDirectory: async (path: string) => {
    try {
      const files: AudioFile[] = await invoke("list_audio_files", { path });
      console.log("files", files);
      set({ playlist: files });
      if (files.length > 0) {
        set({ currentIndex: 0, currentTrack: files[0] });
      }
    } catch (error) {
      console.error("Failed to load directory:", error);
    }
  },
}));
