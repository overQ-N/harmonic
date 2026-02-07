import { PlaylistList } from "@/components/playList/palyList";
import { Button } from "@/components/ui/button";
import { FolderOpen, Music } from "lucide-react";
import { useAudioStore } from "@/stores/audioStore";
import { open } from "@tauri-apps/plugin-dialog";

export default function Home() {
  const { loadDirectory, playlist } = useAudioStore();

  const handleOpenFolder = async () => {
    // In a real app, use Tauri's dialog plugin to pick a folder
    // For demo, we'll use a fixed path (user's Music folder)
    // const musicPath = 'C:/Users/Public/Music' // placeholder
    try {
      // await loadDirectory(musicPath)
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected) {
        await loadDirectory(selected);
      }
    } catch (error) {
      console.error("Failed to load directory:", error);
      alert("Could not load directory. Please ensure the path exists.");
    }
  };
  return (
    <div>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
            <p className="text-muted-foreground">
              {playlist.length} tracks ·{" "}
              {/* {Math.round(playlist.reduce((acc, t) => acc + t.size, 0) / 1024 / 1024)} MB */}
            </p>
          </div>
          <Button className="gap-2" onClick={handleOpenFolder}>
            <FolderOpen className="w-4 h-4" />
            Open Music Folder
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <PlaylistList />
          </div>
        </div>
      </div>
    </div>
  );
}
