import { useAudioStore } from "@/stores/audioStore";
import PlayListTable from "@/components/playListTable";

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

  return <PlayListTable tracks={playlist} currentTrack={currentTrack} onSelect={selectTrack} />;
}
