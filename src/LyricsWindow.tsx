import { FloatingLyrics } from "@/components/player/FloatingLyrics";
import "./LyricsWindow.css";
export default function LyricsWindow() {
  return (
    <div className="w-full h-full bg-transparent">
      <FloatingLyrics />
    </div>
  );
}
