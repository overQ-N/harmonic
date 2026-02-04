import { Home, Search, Library, Plus, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React from "react";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
};

const navItems: NavItem[] = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Search", icon: Search },
  { label: "Your Library", icon: Library },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const playlistItems = [
  "Recently Played",
  "Liked Songs",
  "Top Tracks 2025",
  "Chill Vibes",
  "Workout Mix",
];

export function Sidebar() {
  const navigate = useNavigate();

  const navigateTo = (item: NavItem) => {
    if (item.path) navigate(item.path);
  };
  return (
    <div className="flex flex-col w-64 h-full border-r bg-background border-border">
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
              className="justify-start w-full gap-3 text-foreground hover:bg-accent"
              onClick={() => navigateTo(item)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          ))}
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Playlists</h2>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {playlistItems.map(playlist => (
              <Button
                key={playlist}
                variant="ghost"
                className="justify-start w-full text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                {playlist}
              </Button>
            ))}
          </div>
        </div>
      </nav>
      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full gap-2">
          <Heart className="w-4 h-4" />
          Liked Songs
        </Button>
      </div>
    </div>
  );
}
