import { memo } from "react";

export type ViewerHudProps = {
  autoRotate: boolean;
  wireframe: boolean;
  onToggleAutoRotate: (next: boolean) => void;
  onToggleWireframe: (next: boolean) => void;
  onReset: () => void;
  onDownload: () => void;
  downloadHref: string;
};

export const ViewerHud = memo(function ViewerHud({
  autoRotate,
  wireframe,
  onToggleAutoRotate,
  onToggleWireframe,
  onReset,
  onDownload,
  downloadHref
}: ViewerHudProps) {
  return (
    <div className="viewer-hud" role="group" aria-label="3D viewer controls">
      <button
        type="button"
        className={autoRotate ? "is-active" : ""}
        onClick={() => onToggleAutoRotate(!autoRotate)}
      >
        <span>Auto-rotate</span>
      </button>
      <button
        type="button"
        className={wireframe ? "is-active" : ""}
        onClick={() => onToggleWireframe(!wireframe)}
      >
        <span>Wireframe</span>
      </button>
      <button type="button" onClick={onReset}>
        <span>Reset view</span>
      </button>
      <a
        className="viewer-download"
        href={downloadHref}
        download
        onClick={onDownload}
      >
        Download GLB
      </a>
    </div>
  );
});
