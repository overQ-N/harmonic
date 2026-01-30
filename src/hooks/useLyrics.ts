import { useEffect, useState } from "react";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useAudioStore } from "@/stores/audioStore";
import { parseLRC, LyricLine } from "@/lib/lrcParser";

export function useLyrics() {
  const { currentTrack } = useAudioStore();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLyrics = async () => {
      if (!currentTrack) {
        setLyrics([]);
        return;
      }

      const audioPath = currentTrack.path;
      // 替换扩展名为 .lrc
      const lyricPath = audioPath.replace(/\.[^/.]+$/, "") + ".lrc";

      setLoading(true);
      setError(null);
      try {
        const content = await readTextFile(lyricPath);
        const parsed = parseLRC(content);
        setLyrics(parsed);
      } catch (err) {
        console.warn("Failed to load lyrics:", err);
        setError("歌词文件未找到或读取失败");
        setLyrics([]);
      } finally {
        setLoading(false);
      }
    };

    loadLyrics();
  }, [currentTrack]);

  return { lyrics, loading, error };
}
