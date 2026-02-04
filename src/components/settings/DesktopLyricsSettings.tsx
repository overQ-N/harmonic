import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settingsStore";
import { Type, Minus, Plus } from "lucide-react";

export function DesktopLyricsSettings() {
  const { settings, updateDesktopLyricsSettings } = useSettingsStore();
  const { desktopLyrics } = settings;
  const [colorInput, setColorInput] = useState(desktopLyrics.textColor);

  return (
    <div className="p-6 space-y-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-foreground">桌面歌词设置</h3>

      {/* 字体大小 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Type className="w-4 h-4" />
            字体大小
          </label>
          <span className="text-sm font-medium text-white">{desktopLyrics.fontSize}px</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-gray-100"
            onClick={() =>
              updateDesktopLyricsSettings({
                fontSize: Math.max(12, desktopLyrics.fontSize - 2),
              })
            }
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Slider
            value={[desktopLyrics.fontSize]}
            min={12}
            max={48}
            step={1}
            className="flex-1"
            onValueChange={value => updateDesktopLyricsSettings({ fontSize: value[0] })}
          />
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-gray-100"
            onClick={() =>
              updateDesktopLyricsSettings({
                fontSize: Math.min(48, desktopLyrics.fontSize + 2),
              })
            }
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 显示行数 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">显示行数</label>
          <span className="text-sm font-medium text-foreground">{desktopLyrics.displayLines}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-gray-100"
            onClick={() =>
              updateDesktopLyricsSettings({
                displayLines: Math.max(1, desktopLyrics.displayLines - 1),
              })
            }
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Slider
            value={[desktopLyrics.displayLines]}
            min={1}
            max={15}
            step={1}
            className="flex-1"
            onValueChange={value => updateDesktopLyricsSettings({ displayLines: value[0] })}
          />
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-gray-100"
            onClick={() =>
              updateDesktopLyricsSettings({
                displayLines: Math.min(15, desktopLyrics.displayLines + 1),
              })
            }
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 行高 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">行距比例</label>
          <span className="text-sm font-medium text-foreground">
            {desktopLyrics.lineHeight.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[desktopLyrics.lineHeight]}
          min={1}
          max={2}
          step={0.1}
          className="w-full"
          onValueChange={value => updateDesktopLyricsSettings({ lineHeight: value[0] })}
        />
      </div>

      {/* 文本颜色 */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">当前行颜色</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colorInput}
            onChange={e => {
              setColorInput(e.target.value);
              updateDesktopLyricsSettings({ textColor: e.target.value });
            }}
            className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
          />
          <input
            type="text"
            value={colorInput}
            onChange={e => {
              setColorInput(e.target.value);
              if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                updateDesktopLyricsSettings({ textColor: e.target.value });
              }
            }}
            placeholder="#c084fc"
            className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* 字体粗细 */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">字体粗细</label>
        <div className="flex gap-2">
          {(["normal", "bold"] as const).map(weight => (
            <Button
              key={weight}
              variant={desktopLyrics.fontWeight === weight ? "default" : "ghost"}
              className="flex-1"
              onClick={() => updateDesktopLyricsSettings({ fontWeight: weight })}
            >
              {weight === "normal" ? "正常" : "加粗"}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">前后行颜色</label>
        <div className="flex items-center gap-3">
          <span className="text-sm">跟随当前行</span>
          <input
            type="checkbox"
            checked={desktopLyrics.followTextColor}
            onChange={e => {
              updateDesktopLyricsSettings({ followTextColor: e.target.checked });
            }}
            className="w-4 h-4 border border-gray-200 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 预览 */}
      <div className="pt-6 mt-8 border-t border-gray-200">
        <p className="mb-2 text-xs text-muted-foreground">预览</p>
        <div
          className="p-4 text-center border border-gray-100 rounded bg-gray-50"
          style={{
            fontSize: `${desktopLyrics.fontSize}px`,
            color: desktopLyrics.textColor,
            fontWeight: desktopLyrics.fontWeight,
            lineHeight: desktopLyrics.lineHeight,
          }}
        >
          <div>这是当前行</div>
          {desktopLyrics.followTextColor ? (
            <div style={{ opacity: 0.6, fontSize: `${desktopLyrics.fontSize * 0.85}px` }}>
              这是前后行
            </div>
          ) : (
            <div
              className="text-white drop-shadow-2xl"
              style={{
                opacity: 0.6,
                fontSize: `${desktopLyrics.fontSize * 0.85}px`,
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.25)",
              }}
            >
              这是前后行
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
