import { useMemo, useState } from "react";

type FallbackHeroProps = {
  frames: string[];
  onLaunchViewer: () => void;
};

export function FallbackHero({ frames, onLaunchViewer }: FallbackHeroProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const safeFrames = useMemo(() => (frames.length ? frames : [null]), [frames]);

  function advanceFrame(delta: number) {
    if (!frames.length) return;
    setFrameIndex((current) => (current + delta + frames.length) % frames.length);
  }

  return (
    <div className="fallback-hero">
      <div
        className="fallback-hero__sprite"
        role="img"
        aria-label="Product preview"
        onPointerMove={(event) => {
          if (!frames.length) return;
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const next = Math.min(
            frames.length - 1,
            Math.max(0, Math.floor(ratio * frames.length))
          );
          setFrameIndex(next);
        }}
      >
        {safeFrames[frameIndex] ? (
          <img src={safeFrames[frameIndex] ?? undefined} alt="" />
        ) : (
          <div className="fallback-hero__placeholder" />
        )}
        <div className="fallback-hero__hint">
          Drag to rotate · Low-power mode preview
        </div>
      </div>
      <div className="fallback-hero__actions">
        <button type="button" onClick={onLaunchViewer}>
          Open 3D viewer (beta)
        </button>
        <button type="button" onClick={() => advanceFrame(1)}>
          Next angle
        </button>
      </div>
    </div>
  );
}
