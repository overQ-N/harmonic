import { useState, useEffect, useRef } from "react";
import { useLyrics } from "@/hooks/useLyrics";
import { findCurrentLineIndex } from "@/lib/lrcParser";
import { Plus, Minus, X, Settings, Move, Pin, PinOff, Type, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentWindow, Window, currentMonitor, PhysicalPosition } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import FloatingControl from "./FloatingControl";
import { cn } from "@/lib/utils";

interface FloatingLyricsProps {
  // 不再需要默认位置和大小，由窗口自身决定
}

export function FloatingLyrics(_props: FloatingLyricsProps) {
  const { lyrics, loading, error } = useLyrics();
  const [fontSize, setFontSize] = useState(24);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [displayLines, setDisplayLines] = useState(3); // 上下各显示多少行（默认5行）
  const [isUserScrolling, setIsUserScrolling] = useState(false); // 用户是否正在滚动

  // 独立的时间状态（用于 LyricsWindow 中的时间同步）
  const [syncedTime, setSyncedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const windowRef = useRef<Window | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initPosition = async () => {
      const appWindow = getCurrentWindow();

      // 1. 获取当前显示器信息
      const monitor = await currentMonitor();
      if (!monitor) return;

      // 2. 获取显示器分辨率 (物理像素)
      const screenWidth = monitor.size.width;

      // 3. 获取当前窗口大小 (物理像素)
      // 注意：这里一定要用 outerSize (包含边框，虽然你没有边框) 以防万一
      const windowSize = await appWindow.outerSize();

      // 4. 计算右下角坐标
      // 假设我们要留 20px 的边距
      const margin = 20;
      const x = screenWidth - windowSize.width - margin;
      const y = monitor.workArea.size.height - windowSize.height - margin;

      await appWindow.setPosition(new PhysicalPosition(x, y));
    };

    initPosition();
  }, []);

  // 监听主窗口的播放状态和时间更新事件
  useEffect(() => {
    let unlistenPlaybackState: (() => void) | null = null;

    const setupPlaybackListener = async () => {
      unlistenPlaybackState = await listen<{
        isPlaying: boolean;
        currentTime: number;
      }>("playback-state-changed", event => {
        const { isPlaying, currentTime } = event.payload;
        setIsPlaying(isPlaying);
        setSyncedTime(currentTime);
      });
    };

    setupPlaybackListener().catch(err => {
      console.warn("Failed to setup playback-state-changed listener:", err);
    });

    return () => {
      if (unlistenPlaybackState) {
        unlistenPlaybackState();
      }
    };
  }, []);

  // 计算当前行索引（优先使用同步的时间）
  useEffect(() => {
    if (lyrics.length === 0) {
      setCurrentIndex(-1);
      return;
    }
    // 使用 syncedTime（来自主窗口的同步时间）
    const index = findCurrentLineIndex(lyrics, syncedTime);
    setCurrentIndex(index);
  }, [syncedTime, lyrics]);

  // 自动滚动当前行到中间（仅在播放时自动滚动）
  useEffect(() => {
    if (!isUserScrolling && isPlaying && lyricsContainerRef.current && currentIndex >= 0) {
      // 清除之前的超时
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 延迟执行滚动，确保 DOM 已更新（增加延迟以应对字体大小变化）
      scrollTimeoutRef.current = setTimeout(() => {
        const container = lyricsContainerRef.current;
        if (!container) return;

        const lines = container.querySelectorAll("[data-lyric-line]");
        const currentLine = lines[currentIndex] as HTMLElement;

        if (currentLine) {
          // 获取当前行的实际渲染高度
          const lineRect = currentLine.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const currentLineHeight = lineRect.height;
          const containerHeight = container.clientHeight;
          const containerScrollHeight = container.scrollHeight;
          const containerScrollTop = container.scrollTop;
          const paddingTop = parseFloat(getComputedStyle(container).paddingTop) || 0;
          const paddingBottom = parseFloat(getComputedStyle(container).paddingBottom) || 0;

          // 计算内容区域高度（除去内边距）
          const contentHeight = containerHeight - paddingTop - paddingBottom;
          // 当前行相对于容器内容区域的位置（考虑滚动）
          const lineTopRelativeToContainer = lineRect.top - containerRect.top + containerScrollTop;
          // 转换为相对于内容区域（减去上内边距）
          const lineTopRelativeToContent = lineTopRelativeToContainer - paddingTop;
          // 计算目标滚动位置，使当前行在内容区域内垂直居中
          let targetScrollTop = lineTopRelativeToContent - (contentHeight - currentLineHeight) / 2;
          // 限制在有效滚动范围内
          const maxScrollTop = containerScrollHeight - containerHeight;
          targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

          // 平滑滚动
          container.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
          });
        }
      }, 100); // 增加延迟到 100ms，确保字体大小变化后 DOM 已完全渲染
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentIndex, isPlaying, isUserScrolling, fontSize, displayLines]);

  const closeWindow = async () => {
    if (windowRef.current) {
      await windowRef.current.hide();
    }
  };

  const toggleAlwaysOnTop = async () => {
    const newValue = !alwaysOnTop;
    setAlwaysOnTop(newValue);
    if (windowRef.current) {
      await windowRef.current.setAlwaysOnTop(newValue);
    }
  };

  // 处理用户滚动事件
  const handleScroll = () => {
    setIsUserScrolling(true);

    // 用户停止滚动 2 秒后，恢复自动滚动
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* 标题栏 - 可拖拽区域 */}
      <div
        className="flex items-center justify-between px-3 py-2 pr-8 border-b cursor-move select-none border-white/10"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Move className="w-4 h-4" />
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
            onClick={closeWindow}
            title="关闭"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Button variant="ghost" size="icon" className="absolute top-0 right-0 hover:bg-white/20">
        <Lock className="w-5 h-5" />
      </Button>

      {/* 歌词内容 - 隐藏滚动条但保留滚动功能 */}
      <div
        className="flex flex-col flex-1 p-4 overflow-y-scroll scrollbar-hide"
        ref={lyricsContainerRef}
        onScroll={handleScroll}
        style={
          {
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE and Edge
          } as any
        }
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/50">加载歌词中...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-white/50">{error}</div>
        ) : lyrics.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/50">暂无歌词</div>
        ) : (
          <div className="flex flex-col items-center justify-start space-y-1">
            {/* 动态显示前后多行歌词 */}
            {lyrics.map((line, index) => {
              const distanceFromCurrent = index - currentIndex;
              const isCurrentLine = distanceFromCurrent === 0;
              const isVisible = Math.abs(distanceFromCurrent) <= displayLines;

              if (!isVisible) return null;

              // 根据距离计算透明度和大小
              const opacity = isCurrentLine
                ? 1
                : Math.max(0.3, 1 - Math.abs(distanceFromCurrent) / (displayLines + 1));
              const scale = isCurrentLine
                ? 1
                : 0.8 + (0.2 * (displayLines - Math.abs(distanceFromCurrent))) / displayLines;

              return (
                <div
                  key={index}
                  data-lyric-line={index}
                  className={cn(
                    "w-full text-center text-transparent transition-all duration-200 ",
                    {
                      "bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500": isCurrentLine,
                    },
                    !isCurrentLine ? `rgba(167, 139, 250, ${0.6 * opacity})` : ""
                  )}
                  style={{
                    fontSize: isCurrentLine ? fontSize : fontSize * scale,
                    opacity,
                    fontWeight: isCurrentLine ? "bold" : "normal",
                    color: isCurrentLine ? "transparent" : `rgba(167, 139, 250, ${0.6 * opacity})`,
                  }}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* <FloatingControl
        fontSize={fontSize}
        setFontSize={setFontSize}
        syncedTime={syncedTime}
        displayLines={displayLines}
        setDisplayLines={setDisplayLines}
      /> */}
    </div>
  );
}
