import { Home, Search, Library, Plus, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
	{ label: 'Home', icon: Home },
	{ label: 'Search', icon: Search },
	{ label: 'Your Library', icon: Library },
]

const playlistItems = [
	'Recently Played',
	'Liked Songs',
	'Top Tracks 2025',
	'Chill Vibes',
	'Workout Mix',
]

export function Sidebar() {
	return (
		<div className="flex flex-col h-full bg-background border-r border-border w-64">
			<div className="p-6">
				<h1 className="text-2xl font-bold text-foreground">Harmonic</h1>
				<p className="text-sm text-muted-foreground">Your music, your way</p>
			</div>
			<nav className="flex-1 px-4">
				<div className="space-y-2">
					{navItems.map(item => (
						<Button
							key={item.label}
							variant="ghost"
							className="w-full justify-start gap-3 text-foreground hover:bg-accent"
						>
							<item.icon className="h-5 w-5" />
							{item.label}
						</Button>
					))}
				</div>
				<div className="mt-8">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold text-foreground">Playlists</h2>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<Plus className="h-4 w-4" />
						</Button>
					</div>
					<div className="space-y-2">
						{playlistItems.map(playlist => (
							<Button
								key={playlist}
								variant="ghost"
								className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
							>
								{playlist}
							</Button>
						))}
					</div>
				</div>
			</nav>
			<div className="p-4 border-t border-border">
				<Button variant="outline" className="w-full gap-2">
					<Heart className="h-4 w-4" />
					Liked Songs
				</Button>
			</div>
		</div>
	)
}
