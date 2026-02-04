import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useSettingsStore } from "@/stores/settingsStore";
import { Layout } from "@/components/layout/layout";
import Home from "@/pages/Home";
import SettingsPage from "@/pages/SettingsPage";
import "./App.css";

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
