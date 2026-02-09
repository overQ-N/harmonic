import { useState } from "react";
import { X, Music, Palette, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesktopLyricsSettings } from "./DesktopLyricsSettings";
import { DownloadSettings } from "./DownloadSettings";

type SettingTab = "lyrics" | "display" | "audio" | "download";

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingTab>("lyrics");

  const tabs: Array<{ id: SettingTab; label: string; icon: React.ReactNode }> = [
    { id: "lyrics", label: "桌面歌词", icon: <Music className="w-4 h-4" /> },
    { id: "display", label: "显示", icon: <Palette className="w-4 h-4" /> },
    { id: "audio", label: "音频", icon: <Volume2 className="w-4 h-4" /> },
    { id: "download", label: "下载", icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">设置</h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-4 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? "bg-gray-100 text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "lyrics" && <DesktopLyricsSettings />}

        {activeTab === "display" && (
          <div className="p-6 space-y-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-foreground">显示设置</h3>
            <p className="text-sm text-muted-foreground">更多显示设置敬请期待...</p>
          </div>
        )}

        {activeTab === "audio" && (
          <div className="p-6 space-y-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-foreground">音频设置</h3>
            <p className="text-sm text-muted-foreground">更多音频设置敬请期待...</p>
          </div>
        )}

        {activeTab === "download" && <DownloadSettings />}
      </div>
    </div>
  );
}
