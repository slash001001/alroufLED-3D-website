import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ViewerApp } from "./ViewerApp";
import "./styles/viewer.css";

function ViewerPage() {
  return (
    <div className="viewer-page">
      <header className="viewer-page__header">
        <a href="./" aria-label="Back to homepage">
          ← Back
        </a>
        <h1>alroufLED — UFO5 3D Viewer</h1>
      </header>
      <ViewerApp onInteraction={() => {}} />
    </div>
  );
}

function bootstrap() {
  const container = document.getElementById("viewer-page-root");
  if (!container) return;
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <ViewerPage />
    </StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
