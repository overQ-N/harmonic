import { useEffect, useRef } from "react";
import { useAudioStore } from "@/stores/audioStore";
import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";

// 重试配置
const PLAY_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 500, // 初始延时 500ms
  maxDelay: 3000, // 最大延时 3000ms
};

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    setCurrentTime,
    setDuration,
    setPlaying,
    nextTrack,
  } = useAudioStore();

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      nextTrack();
    };
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      // 清除任何待处理的重试计时器
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // 带有重试机制的播放函数
  const playWithRetry = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      retryCountRef.current = 0; // 成功播放，重置计数
    } catch (error) {
      console.warn(
        `Play failed (attempt ${retryCountRef.current + 1}/${PLAY_RETRY_CONFIG.maxRetries}):`,
        error
      );

      if (retryCountRef.current < PLAY_RETRY_CONFIG.maxRetries) {
        // 计算延时时间（指数退避）
        const delay = Math.min(
          PLAY_RETRY_CONFIG.initialDelay * Math.pow(2, retryCountRef.current),
          PLAY_RETRY_CONFIG.maxDelay
        );

        retryCountRef.current++;

        // 清除之前的超时计时器
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        console.log(`Retrying play after ${delay}ms...`);
        retryTimeoutRef.current = setTimeout(() => {
          if (audioRef.current) {
            playWithRetry();
          }
        }, delay);
      } else {
        console.error("Play failed after maximum retries");
        setPlaying(false);
      }
    }
  };

  // Play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      playWithRetry();
    } else {
      audioRef.current.pause();
      // 暂停时清除重试计时器
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      retryCountRef.current = 0;
    }
  }, [isPlaying]);

  // Update source when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const loadAudio = async () => {
      try {
        // Use Tauri's asset protocol to serve local file
        // For simplicity, we'll use a blob URL via base64
        setPlaying(false);
        const data = await invoke<string>("read_file_as_base64", {
          path: currentTrack.path,
        });
        if (data) {
          const byteCharacters = atob(data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);
          audioRef.current!.src = url;
        } else {
          // Fallback to direct file path (may not work due to CORS)
          audioRef.current!.src = currentTrack.path;
        }

        audioRef.current!.load();
        setPlaying(true);

        // 向 LyricsWindow 发送歌词加载事件
        await emit("track-changed", {
          trackName: currentTrack.name,
          trackPath: currentTrack.path,
        });
      } catch (error) {
        console.error("Failed to load audio:", error);
      }
    };
    loadAudio();
  }, [currentTrack]);

  // Seek externally
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return {
    seek,
    currentTime,
    duration,
  };
}
