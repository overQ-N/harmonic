import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/stores/settingsStore";
import { FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";

export function DownloadSettings() {
  const { settings, updateDownloadDirectory } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectDirectory = async () => {
    setIsLoading(true);
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "选择下载目录",
      });
      if (selected && !Array.isArray(selected)) {
        updateDownloadDirectory(selected);
      }
    } catch (error) {
      console.error("Failed to open directory dialog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-foreground">下载设置</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">下载目录</label>
          <p className="text-sm text-muted-foreground">选择保存下载音乐文件的文件夹。</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              value={settings.downloadDirectory || "未选择目录"}
              readOnly
              placeholder="请选择目录"
              className="bg-gray-50"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleSelectDirectory}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            {isLoading ? "选择中..." : "浏览"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          {settings.downloadDirectory ? (
            <span>当前目录: {settings.downloadDirectory}</span>
          ) : (
            <span>未设置目录，下载功能可能不可用。</span>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="mb-2 text-sm font-medium text-foreground">说明</h4>
          <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
            <li>下载的音乐将保存在上述目录中。</li>
            <li>请确保应用有写入该目录的权限。</li>
            <li>目录路径将保存到本地设置中。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
