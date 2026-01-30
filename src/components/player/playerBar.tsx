import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Shuffle,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioStore } from "@/stores/audioStore";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useState, useEffect } from "react";
import { Window } from "@tauri-apps/api/window";

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    togglePlay,
    setVolume,
    toggleShuffle,
    setRepeat,
    nextTrack,
    prevTrack,
  } = useAudioStore();
  const { seek } = useAudioPlayer();

  const [lyricsWindowVisible, setLyricsWindowVisible] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const lyricsWindow = await Window.getByLabel("lyrics");
        if (lyricsWindow && mounted) {
          const visible = await lyricsWindow.isVisible();
          setLyricsWindowVisible(visible);
        }
      } catch (error) {
        console.error("Failed to get lyrics window:", error);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleLyricsWindow = async () => {
    try {
      const lyricsWindow = await Window.getByLabel("lyrics");
      console.log(lyricsWindow, "===");
      if (lyricsWindow) {
        const visible = await lyricsWindow.isVisible();
        if (visible) {
          await lyricsWindow.hide();
          setLyricsWindowVisible(false);
        } else {
          await lyricsWindow.show();
          setLyricsWindowVisible(true);
        }
      }
    } catch (error) {
      console.error("Failed to toggle lyrics window:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressChange = (value: number[]) => {
    const time = value[0];
    seek(time);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const repeatMode = repeat === "off" ? "off" : repeat === "one" ? "one" : "all";
  const repeatLabel =
    repeatMode === "off" ? "Repeat off" : repeatMode === "one" ? "Repeat one" : "Repeat all";

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between h-20 px-6 border-t bg-background border-border">
      {/* Current Track Info */}
      <div className="flex items-center w-64 gap-4">
        <div className="flex items-center justify-center rounded-md h-14 w-14 bg-muted">
          <div className="w-10 h-10 rounded bg-primary/20" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {currentTrack?.name || "No track selected"}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentTrack
              ? `${currentTrack.extension.toUpperCase()} • ${formatTime(duration)}`
              : "—"}
          </span>
        </div>
      </div>

      {/* Playback Controls & Progress */}
      <div className="flex-1 max-w-2xl">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${shuffle ? "text-primary" : ""}`}
            onClick={toggleShuffle}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={prevTrack}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button size="icon" className="w-10 h-10 rounded-full" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={nextTrack}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${repeat !== "off" ? "text-primary" : ""}`}
            onClick={() => {
              const modes: Array<"off" | "one" | "all"> = ["off", "one", "all"];
              const nextIndex = (modes.indexOf(repeat) + 1) % modes.length;
              setRepeat(modes[nextIndex]);
            }}
            title={repeatLabel}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-10 text-xs text-right text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 1}
            step={1}
            className="flex-1"
            onValueChange={handleProgressChange}
          />
          <span className="w-10 text-xs text-muted-foreground">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Extra */}
      <div className="flex items-center justify-end w-64 gap-4">
        <Volume2 className="w-5 h-5 text-muted-foreground" />
        <Slider
          value={[volume]}
          max={100}
          step={1}
          className="w-24"
          onValueChange={handleVolumeChange}
        />
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${lyricsWindowVisible ? "text-primary" : ""}`}
          onClick={toggleLyricsWindow}
          title={lyricsWindowVisible ? "隐藏桌面歌词" : "显示桌面歌词"}
        >
          <Monitor className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
