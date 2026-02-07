import { useEffect, useState } from "react";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { AudioTrack, useAudioStore } from "@/stores/audioStore";
import { parseLRC, LyricLine } from "@/lib/lrcParser";
import { listen } from "@tauri-apps/api/event";

export function useLyrics() {
  const { currentTrack } = useAudioStore();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载歌词的核心逻辑
  const loadLyricsForTrack = async (track: AudioTrack) => {
    if (track.source === "kw") {
      try {
        const resp = await fetch(track.lrc);
        const parsed = await resp.json();
        if (parsed.code === 200) {
          setLyrics(parseLRC(parsed.data.lrclist));
        }
      } catch (error) {
        console.log(`Lyrics loaded for: ${track.lrc}`);
      }
      return;
    }
    const trackPath = track.path;
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
      loadLyricsForTrack(currentTrack);
    }
  }, [currentTrack]);

  // 监听 Tauri 事件（LyricsWindow）
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      unlisten = await listen<AudioTrack>("track-changed", event => {
        console.log("Received track-changed event:", event.payload);
        loadLyricsForTrack(event.payload);
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
