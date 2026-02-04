import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LyricsWindow from "./LyricsWindow";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

if (window.location.hash === "#/lyrics") {
  root.render(
    <React.StrictMode>
      <LyricsWindow />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
