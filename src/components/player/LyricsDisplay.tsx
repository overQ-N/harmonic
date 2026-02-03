import { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/stores/audioStore";
import { useLyrics } from "@/hooks/useLyrics";
import { findCurrentLineIndex } from "@/lib/lrcParser";
import { Loader2 } from "lucide-react";

export function LyricsDisplay() {
  const { currentTime } = useAudioStore();
  const { lyrics, loading, error } = useLyrics();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // 计算当前行索引
  useEffect(() => {
    if (lyrics.length === 0) {
      setCurrentIndex(-1);
      return;
    }
    const index = findCurrentLineIndex(lyrics, currentTime);
    setCurrentIndex(index);
  }, [currentTime, lyrics]);

  // 滚动到当前行
  useEffect(() => {
    if (currentLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const line = currentLineRef.current;
      const containerRect = container.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      const lineTopRelative = lineRect.top - containerRect.top + container.scrollTop;
      const containerHeight = container.clientHeight;
      const lineHeight = line.clientHeight;
      const scrollTop = lineTopRelative - containerHeight / 2 + lineHeight / 2;
      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        加载歌词中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">{error}</div>
    );
  }

  if (lyrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">暂无歌词</div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent scrollbar-hide"
    >
      <div className="px-2 py-4 space-y-4">
        {lyrics.map((line, index) => {
          const isCurrent = index === currentIndex;
          return (
            <div
              key={`${line.time}-${index}`}
              ref={isCurrent ? currentLineRef : null}
              className={`
                text-center transition-all duration-300
                ${isCurrent ? "text-3xl font-bold text-white" : "text-xl text-muted-foreground"}
              `}
            >
              {line.text || " "}
            </div>
          );
        })}
      </div>
    </div>
  );
}
