import { useAudioStore } from "@/stores/audioStore";
import { Button } from "@/components/ui/button";
import { Play, MoreVertical, File } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlaylistList() {
  const { playlist, currentTrack, selectTrack } = useAudioStore();

  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="mb-4 text-4xl">🎵</div>
        <p className="text-lg">No tracks in playlist</p>
        <p className="text-sm">Add music by opening a folder</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border rounded-lg border-border">
      <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium border-b border-border bg-muted/30 text-muted-foreground">
        <div className="col-span-1">#</div>
        <div className="col-span-6">Title</div>
        <div className="col-span-3">Album</div>
        <div className="flex justify-center col-span-1">Size</div>
        <div className="col-span-1"></div>
      </div>
      <div className="divide-y divide-border">
        {playlist.map((track, index) => (
          <div
            key={track.path}
            className={cn(
              "grid grid-cols-12 gap-4 p-4 items-center hover:bg-accent/50 transition-colors",
              currentTrack?.path === track.path && "bg-primary/10"
            )}
            onClick={() => selectTrack(index)}
          >
            <div className="col-span-1 text-muted-foreground">
              {currentTrack?.path === track.path ? (
                <Play className="w-4 h-4 fill-current" />
              ) : (
                index + 1
              )}
            </div>
            <div className="col-span-6 font-medium">{track.name}</div>
            <div className="col-span-3 text-sm text-muted-foreground">
              {track.extension.toUpperCase()}
            </div>
            <div className="col-span-1 text-sm text-center text-muted-foreground">
              {Math.round(track.size / 1024 / 1024)} MB
            </div>
            <div className="flex justify-end col-span-1">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
