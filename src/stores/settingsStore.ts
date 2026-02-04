import { create } from "zustand";
import { emit } from "@tauri-apps/api/event";

export interface DesktopLyricsSettings {
  fontSize: number;
  displayLines: number;
  textColor: string;
  lineHeight: number;
  fontWeight: "normal" | "bold";
}

export interface AppSettings {
  // Desktop Lyrics
  desktopLyrics: DesktopLyricsSettings;
  // Future: Audio settings, Display settings, etc.
}

interface SettingsState {
  settings: AppSettings;
  updateDesktopLyricsSettings: (updates: Partial<DesktopLyricsSettings>) => void;
  loadSettingsFromStorage: () => void;
  saveSettingsToStorage: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  desktopLyrics: {
    fontSize: 24,
    displayLines: 3,
    textColor: "#c084fc", // 亮紫色
    lineHeight: 1.5,
    fontWeight: "normal",
  },
};

const STORAGE_KEY = "harmonic_settings";

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  updateDesktopLyricsSettings: (updates: Partial<DesktopLyricsSettings>) => {
    set(state => ({
      settings: {
        ...state.settings,
        desktopLyrics: {
          ...state.settings.desktopLyrics,
          ...updates,
        },
      },
    }));
    // Auto-save to localStorage after update
    setTimeout(() => get().saveSettingsToStorage(), 0);
    // Emit settings change so other windows (e.g., lyrics window) can sync
    const payload = { desktopLyrics: { ...get().settings.desktopLyrics } };
    emit("settings-changed", payload).catch(err =>
      console.warn("Failed to emit settings-changed:", err)
    );
  },

  loadSettingsFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ settings: { ...DEFAULT_SETTINGS, ...parsed } });
      }
    } catch (error) {
      console.error("Failed to load settings from storage:", error);
    }
  },

  saveSettingsToStorage: () => {
    try {
      const { settings } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to storage:", error);
    }
  },
}));

// Load settings on app init
useSettingsStore.getState().loadSettingsFromStorage();
