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
    <div className="flex flex-col h-screen pb-20 bg-background">
      {/* Mobile header */}
      <div className="flex items-center justify-between p-4 border-b lg:hidden border-border">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            w-64 shrink-0 border-r border-border bg-background
          `}
        >
          <Sidebar />
        </div>
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 p-4 overflow-y-auto lg:p-6">{children}</main>
      </div>
      <PlayerBar />
    </div>
  );
}
