import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useSettingsStore } from "@/stores/settingsStore";
import { Layout } from "@/components/layout/layout";
import Home from "@/pages/Home";
import SettingsPage from "@/pages/SettingsPage";
import "./App.css";
import Search from "./pages/Search";

const AppContent = () => {
  const location = useLocation();
  const { pathname } = location;

  return (
    <div className="app-container">
      <div style={{ display: pathname === "/" ? "block" : "none" }}>
        <Home />
      </div>

      <div style={{ display: pathname === "/settings" ? "block" : "none" }}>
        <SettingsPage />
      </div>

      <div style={{ display: pathname === "/search" ? "block" : "none" }}>
        <Search />
      </div>
    </div>
  );
};

function App() {
  const { updateDesktopLyricsSettings } = useSettingsStore();

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    const setup = async () => {
      unlisten = await listen("update-settings", event => {
        const payload = event.payload as any;
        if (payload && payload.desktopLyrics) {
          updateDesktopLyricsSettings(payload.desktopLyrics);
        }
      });
    };
    setup().catch(err => console.warn("Failed to listen for update-settings:", err));
    return () => {
      if (unlisten) unlisten();
    };
  }, [updateDesktopLyricsSettings]);
  return (
    <HashRouter>
      <Layout>
        <AppContent />
      </Layout>
    </HashRouter>
  );
}

export default App;
