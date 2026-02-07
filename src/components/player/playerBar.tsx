import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Repeat1,
  ListVideo,
  Shuffle,
  Monitor,
  ScreenShareOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlbumCover } from "@/components/player/AlbumCover";
import { TrackDetailModal } from "@/components/player/TrackDetailModal";
import { useAudioStore } from "@/stores/audioStore";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useState, useEffect, useMemo } from "react";
import { Window } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

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
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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
      if (lyricsWindow) {
        const visible = await lyricsWindow.isVisible();

        if (visible) {
          await lyricsWindow.hide();
          setLyricsWindowVisible(false);
        } else {
          await lyricsWindow.show();
          await lyricsWindow.setAlwaysOnTop(true);
          setLyricsWindowVisible(true);
          await invoke("set_ignore_cursor_events", { label: "lyrics", ignore: true });
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

  const repeatMode = repeat === "all" ? "all" : "one";
  const repeatLabel = repeatMode === "one" ? "单曲循环" : "列表循环";

  const modeIcon = useMemo(() => {
    switch (repeat) {
      case "one":
        return <Repeat1 className="w-4 h-4" />;
      case "all":
        return <ListVideo className="w-4 h-4" />;
      default:
        return <Repeat className="w-4 h-4" />;
    }
  }, [repeat]);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between h-20 px-6 border-t bg-background border-border">
        {/* Current Track Info */}
        <div
          className="flex items-center w-64 gap-4 cursor-pointer"
          onClick={() => setDetailModalOpen(true)}
        >
          <AlbumCover
            cover={currentTrack?.cover}
            title={currentTrack?.name || "No track"}
            size="md"
          />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {currentTrack?.name || "No track selected"}
            </span>
            <span className="text-sm text-muted-foreground">
              {currentTrack?.source === "local" && currentTrack?.extension
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
              className={`h-8 w-8 ${shuffle ? "text-primary bg-gray-200" : ""}`}
              onClick={toggleShuffle}
              title="随机播放"
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
              className={`h-8 w-8 `}
              onClick={() => {
                const modes: Array<"one" | "all"> = ["one", "all"];
                const nextIndex = (modes.indexOf(repeat) + 1) % modes.length;
                setRepeat(modes[nextIndex]);
              }}
              title={repeatLabel}
            >
              {modeIcon}
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
            className={`h-8 w-8 ${lyricsWindowVisible ? "text-primary bg-gray-200" : ""}`}
            onClick={toggleLyricsWindow}
            title={lyricsWindowVisible ? "隐藏桌面歌词" : "显示桌面歌词"}
          >
            {lyricsWindowVisible ? (
              <Monitor className="w-4 h-4" />
            ) : (
              <ScreenShareOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <TrackDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} />
    </>
  );
}
