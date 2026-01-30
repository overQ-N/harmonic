import { useState } from "react";
import { Sidebar } from "./sidebar";
import { PlayerBar } from "@/components/player/playerBar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="text-xl font-bold">Harmonic</h1>
        <div className="w-10" /> {/* spacer */}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop, toggleable for mobile */}
        <div
          className={`
            ${sidebarOpen ? "absolute inset-0 z-50" : "hidden"}
            lg:relative lg:flex lg:z-0
            w-64 flex-shrink-0 border-r border-border bg-background
          `}
        >
          <Sidebar />
        </div>
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
      <PlayerBar />
    </div>
  );
}
