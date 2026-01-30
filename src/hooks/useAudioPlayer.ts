import { useEffect, useRef } from "react";
import { useAudioStore } from "@/stores/audioStore";
import { invoke } from "@tauri-apps/api/core";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
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
        console.log(currentTrack, ";");
        audioRef.current!.load();
        setPlaying(true);
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
