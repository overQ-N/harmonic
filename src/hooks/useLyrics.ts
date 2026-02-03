import { useEffect, useState } from "react";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useAudioStore } from "@/stores/audioStore";
import { parseLRC, LyricLine } from "@/lib/lrcParser";
import { listen } from "@tauri-apps/api/event";

export function useLyrics() {
  const { currentTrack } = useAudioStore();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载歌词的核心逻辑
  const loadLyricsForTrack = async (trackPath: string) => {
    if (!trackPath) {
      setLyrics([]);
      return;
    }

    // 替换扩展名为 .lrc
    const lyricPath = trackPath.replace(/\.[^/.]+$/, "") + ".lrc";

    setLoading(true);
    setError(null);
    try {
      const content = await readTextFile(lyricPath);
      const parsed = parseLRC(content);
      setLyrics(parsed);
      console.log(`Lyrics loaded for: ${trackPath}`);
    } catch (err) {
      console.warn("Failed to load lyrics:", err);
      setError("歌词文件未找到或读取失败");
      setLyrics([]);
    } finally {
      setLoading(false);
    }
  };

  // 监听 currentTrack 变化（主窗口）
  useEffect(() => {
    if (currentTrack) {
      loadLyricsForTrack(currentTrack.path);
    }
  }, [currentTrack]);

  // 监听 Tauri 事件（LyricsWindow）
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      unlisten = await listen<{ trackPath: string }>("track-changed", event => {
        console.log("Received track-changed event:", event.payload);
        loadLyricsForTrack(event.payload.trackPath);
      });
    };

    setupListener().catch(err => {
      console.warn("Failed to setup track-changed listener:", err);
    });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return { lyrics, loading, error };
}
