import { useAudioStore } from '@/stores/audioStore'
import { Button } from '@/components/ui/button'
import { Play, MoreVertical, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PlaylistList() {
	const { playlist, currentTrack, selectTrack } = useAudioStore()

	if (playlist.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
				<div className="text-4xl mb-4">🎵</div>
				<p className="text-lg">No tracks in playlist</p>
				<p className="text-sm">Add music by opening a folder</p>
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-border overflow-hidden">
			<div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-sm font-medium text-muted-foreground">
				<div className="col-span-1">#</div>
				<div className="col-span-6">Title</div>
				<div className="col-span-3">Album</div>
				<div className="col-span-1 flex justify-center">
					<Clock className="h-4 w-4" />
				</div>
				<div className="col-span-1"></div>
			</div>
			<div className="divide-y divide-border">
				{playlist.map((track, index) => (
					<div
						key={track.path}
						className={cn(
							'grid grid-cols-12 gap-4 p-4 items-center hover:bg-accent/50 transition-colors',
							currentTrack?.path === track.path && 'bg-primary/10',
						)}
						onClick={() => selectTrack(index)}
					>
						<div className="col-span-1 text-muted-foreground">
							{currentTrack?.path === track.path ? (
								<Play className="h-4 w-4 fill-current" />
							) : (
								index + 1
							)}
						</div>
						<div className="col-span-6 font-medium">{track.name}</div>
						<div className="col-span-3 text-sm text-muted-foreground">
							{track.extension.toUpperCase()}
						</div>
						<div className="col-span-1 text-sm text-muted-foreground text-center">
							{Math.round(track.size / 1024)} KB
						</div>
						<div className="col-span-1 flex justify-end">
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
