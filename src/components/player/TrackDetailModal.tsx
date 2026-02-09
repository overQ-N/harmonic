import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useAudioStore } from "@/stores/audioStore";
import { LyricsDisplay } from "./LyricsDisplay";
import { AlbumCover } from "./AlbumCover";

interface TrackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackDetailModal({ isOpen, onClose }: TrackDetailModalProps) {
  const { currentTime, currentTrack, duration, isPlaying } = useAudioStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl h-[80vh] bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl shadow-2xl overflow-hidden">
        {/* 关闭按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute z-10 cursor-pointer top-4 right-4 text-white/70 hover:text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* 主容器 */}
        <div className="flex h-full">
          {/* 左侧：封面和歌曲信息 */}
          <div className="flex flex-col items-center justify-center w-1/3 p-8 border-r border-white/10 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
            {/* 专辑封面 */}
            <div className="relative w-48 h-48 mb-6 overflow-hidden shadow-2xl rounded-xl">
              <AlbumCover
                cover={currentTrack?.cover}
                title={currentTrack?.name || "No track"}
                size="xl"
              />
              {/* 播放指示器 */}
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="text-4xl text-white animate-pulse">▶</div>
                </div>
              )}
            </div>

            {/* 歌曲信息 */}
            <div className="w-full text-center">
              <h2 className="mb-2 text-2xl font-bold text-white truncate">{currentTrack.name}</h2>

              <p className="mb-4 text-sm text-white/60">
                {currentTrack.source === "local" && currentTrack?.extension?.toUpperCase()} •{" "}
                {formatTime(duration)}
              </p>

              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex justify-between mb-1 text-xs text-white/50">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="w-full h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full transition-all duration-100 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{
                      width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：歌词 */}
          <div className="flex flex-col flex-1 p-8 overflow-hidden">
            <h3 className="mb-4 text-lg font-semibold text-white">歌词</h3>
            <LyricsDisplay />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
