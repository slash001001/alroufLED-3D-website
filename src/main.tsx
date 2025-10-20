import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { FallbackHero } from "./ui/FallbackHero";
import { evaluateGpu, type GPUEvaluation } from "./lib/gpu";
import { trackEvent } from "./lib/analytics";

const SPRITE_FRAMES = [
  "sprites/290W-1.png",
  "sprites/50-240W-5.png",
  "sprites/50-240W-6.png",
  "sprites/50-240W-7.png",
  "sprites/50-240W-8.png"
].map((path) => new URL(path, import.meta.env.BASE_URL).toString());

const VIEWER_PAGE_URL = new URL("viewer.html", import.meta.env.BASE_URL).toString();

const ViewerApp = lazy(async () => {
  const mod = await import("./ViewerApp");
  return { default: mod.ViewerApp };
});

type Mode = "loading" | "viewer" | "fallback";

type ViewerBootstrapProps = {
  gpu: GPUEvaluation | null;
  initialMode: Mode;
};

function ViewerBootstrap({ gpu, initialMode }: ViewerBootstrapProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    if (!gpu) return;
    setMode(gpu.supported ? "viewer" : "fallback");
  }, [gpu]);

  if (mode === "fallback") {
    return (
      <FallbackHero
        frames={SPRITE_FRAMES}
        onLaunchViewer={() => {
          trackEvent("viewer_open", { forced: true });
          window.location.href = VIEWER_PAGE_URL;
        }}
      />
    );
  }

  if (mode === "loading") {
    return <div className="viewer-loading">Benchmarking GPU…</div>;
  }

  return (
    <Suspense fallback={<div className="viewer-loading">Loading viewer…</div>}>
      <ViewerApp onInteraction={() => {}} />
    </Suspense>
  );
}

async function bootstrap() {
  const container = document.getElementById("viewer-root");
  if (!container) return;

  const root = createRoot(container);
  let gpu: GPUEvaluation | null = null;

  try {
    gpu = await evaluateGpu();
  } catch (error) {
    console.error("[viewer] GPU detection failed", error);
  }

  root.render(
    <StrictMode>
      <ViewerBootstrap gpu={gpu} initialMode={gpu?.supported ? "viewer" : "fallback"} />
    </StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  void bootstrap();
}
