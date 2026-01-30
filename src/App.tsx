import { useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { PlaylistList } from "@/components/playList/palyList";
import { LyricsDisplay } from "@/components/player/LyricsDisplay";
import { Button } from "@/components/ui/button";
import { FolderOpen, Music } from "lucide-react";
import { useAudioStore } from "@/stores/audioStore";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

function App() {
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
        const files = await loadDirectory(selected);
        console.log("files", files);
      }
    } catch (error) {
      console.error("Failed to load directory:", error);
      alert("Could not load directory. Please ensure the path exists.");
    }
  };

  useEffect(() => {
    console.log("palyList", playlist);
  }, [playlist]);

  return (
    <>
      <Layout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
              <p className="text-muted-foreground">
                {playlist.length} tracks ·{" "}
                {Math.round(playlist.reduce((acc, t) => acc + t.size, 0) / 1024 / 1024)} MB
              </p>
            </div>
            <Button className="gap-2" onClick={handleOpenFolder}>
              <FolderOpen className="w-4 h-4" />
              Open Music Folder
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PlaylistList />
            </div>
            <div className="space-y-6">
              <div className="p-6 border rounded-lg bg-muted/50 border-border">
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold">
                  <Music className="w-5 h-5" />
                  歌词
                </h2>
                <div className="h-[500px]">
                  <LyricsDisplay />
                </div>
              </div>
              <div className="p-6 border rounded-lg bg-primary/5 border-primary/20">
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold">
                  <Music className="w-5 h-5" />
                  Getting Started
                </h2>
                <p className="mb-4 text-muted-foreground">
                  Harmonic is a desktop music player that plays your local files. Click "Open Music
                  Folder" to select a folder with music.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm">
                    View Docs
                  </Button>
                  <Button size="sm">Import Music</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default App;
