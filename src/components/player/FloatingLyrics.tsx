import { useState, useEffect, useRef } from "react";
import { useAudioStore } from "@/stores/audioStore";
import { useLyrics } from "@/hooks/useLyrics";
import { findCurrentLineIndex } from "@/lib/lrcParser";
import { Maximize2, Minimize2, X, Settings, Move, Pin, PinOff, Expand, Shrink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getCurrentWindow, Window, LogicalSize } from "@tauri-apps/api/window";

interface FloatingLyricsProps {
  // 不再需要默认位置和大小，由窗口自身决定
}

export function FloatingLyrics(_props: FloatingLyricsProps) {
  const { currentTime } = useAudioStore();
  const { lyrics, loading, error } = useLyrics();
  const [fontSize, setFontSize] = useState(24);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const windowRef = useRef<Window | null>(null);

  // 获取歌词窗口实例并初始化状态
  useEffect(() => {
    const win = getCurrentWindow();
    if (win) {
      windowRef.current = win;
      // 获取当前置顶状态
      win.isAlwaysOnTop().then(top => setAlwaysOnTop(top));
    }
  }, []);

  // 计算当前行索引
  useEffect(() => {
    if (lyrics.length === 0) {
      setCurrentIndex(-1);
      return;
    }
    const index = findCurrentLineIndex(lyrics, currentTime);
    setCurrentIndex(index);
  }, [currentTime, lyrics]);

  const currentLine = currentIndex >= 0 ? lyrics[currentIndex] : null;
  const prevLine = currentIndex > 0 ? lyrics[currentIndex - 1] : null;
  const nextLine = currentIndex < lyrics.length - 1 ? lyrics[currentIndex + 1] : null;

  const toggleAlwaysOnTop = async () => {
    const newValue = !alwaysOnTop;
    setAlwaysOnTop(newValue);
    if (windowRef.current) {
      await windowRef.current.setAlwaysOnTop(newValue);
    }
  };

  const closeWindow = async () => {
    if (windowRef.current) {
      await windowRef.current.hide();
    }
  };

  const resizeWindow = async (deltaWidth: number, deltaHeight: number) => {
    if (windowRef.current) {
      const size = await windowRef.current.innerSize();
      const newWidth = Math.max(200, size.width + deltaWidth);
      const newHeight = Math.max(150, size.height + deltaHeight);
      await windowRef.current.setSize(new LogicalSize(newWidth, newHeight));
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-black/80 backdrop-blur-lg border-white/20">
      {/* 标题栏 - 可拖拽区域 */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b cursor-move border-white/10"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Move className="w-4 h-4" />
          <span>桌面歌词</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-white/70 hover:text-white hover:bg-white/20"
            onClick={toggleAlwaysOnTop}
            title={alwaysOnTop ? "取消置顶" : "置顶"}
          >
            {alwaysOnTop ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-white/70 hover:text-white hover:bg-white/20"
            onClick={() => resizeWindow(20, 20)}
            title="放大窗口"
          >
            <Expand className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-white/70 hover:text-white hover:bg-white/20"
            onClick={() => resizeWindow(-20, -20)}
            title="缩小窗口"
          >
            <Shrink className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-white/70 hover:text-white hover:bg-white/20"
            onClick={closeWindow}
            title="关闭"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 歌词内容 */}
      <div className="flex-1 p-4 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/50">加载歌词中...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-white/50">{error}</div>
        ) : lyrics.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/50">暂无歌词</div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            {prevLine && (
              <div className="text-center text-white/50" style={{ fontSize: fontSize * 0.7 }}>
                {prevLine.text}
              </div>
            )}
            {currentLine && (
              <div
                className="font-bold text-center text-white transition-all duration-300"
                style={{ fontSize }}
              >
                {currentLine.text}
              </div>
            )}
            {nextLine && (
              <div className="text-center text-white/50" style={{ fontSize: fontSize * 0.7 }}>
                {nextLine.text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 控制栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-white/70" />
          <span className="text-xs text-white/70">字体大小</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-white/70 hover:text-white hover:bg-white/20"
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            title="缩小"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Slider
            value={[fontSize]}
            min={12}
            max={48}
            step={1}
            className="w-24"
            onValueChange={value => setFontSize(value[0])}
          />
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-white/70 hover:text-white hover:bg-white/20"
            onClick={() => setFontSize(Math.min(48, fontSize + 2))}
            title="放大"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
