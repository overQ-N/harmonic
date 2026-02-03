import React from "react";
import { Plus, Minus, Type } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

interface IProps {
  syncedTime: number;
  displayLines: number;
  setDisplayLines: (displayLines: number) => void;
  fontSize: number;
  setFontSize: (fontSize: number) => void;
}

const FloatingControl = (props: IProps) => {
  const { syncedTime, displayLines, setDisplayLines, fontSize, setFontSize } = props;
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-white/10">
      {/* 时间显示 */}
      <div className="flex items-center gap-2 text-xs text-white/70 min-w-12.5">
        <span>
          {Math.floor(syncedTime / 60)}:
          {Math.floor(syncedTime % 60)
            .toString()
            .padStart(2, "0")}
        </span>
      </div>

      {/* 显示行数控制 */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-white/70 whitespace-nowrap">行数</span>
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5 text-white/70 hover:text-white hover:bg-white/20"
          onClick={() => setDisplayLines(Math.max(1, displayLines - 1))}
          title="减少"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-5 text-xs text-center text-white/70">{displayLines}</span>
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5 text-white/70 hover:text-white hover:bg-white/20"
          onClick={() => setDisplayLines(Math.min(15, displayLines + 1))}
          title="增加"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* 字体大小控制 */}
      <div className="flex items-center flex-1 gap-1 max-w-30">
        <Type className="w-4 h-4 shrink-0 text-white/70" />
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5 shrink-0 text-white/70 hover:text-white hover:bg-white/20"
          onClick={() => setFontSize(Math.max(12, fontSize - 2))}
          title="缩小"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Slider
          value={[fontSize]}
          min={12}
          max={48}
          step={1}
          className="flex-1"
          onValueChange={value => setFontSize(value[0])}
        />
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5 shrink-0 text-white/70 hover:text-white hover:bg-white/20"
          onClick={() => setFontSize(Math.min(48, fontSize + 2))}
          title="放大"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default FloatingControl;
