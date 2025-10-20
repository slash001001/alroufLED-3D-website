import { useEffect, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ProductViewer } from "./3d/ProductViewer";
import { ViewerHud } from "./ui/ViewerHud";
import { trackEvent, trackViewerToggle } from "./lib/analytics";
import "./styles/viewer.css";
import { ViewerErrorBoundary } from "./ui/ViewerErrorBoundary";

const MODEL_DOWNLOAD_URL = new URL(
  "models/ufo5-200W.glb",
  import.meta.env.BASE_URL
).toString();

type ViewerAppProps = {
  onInteraction: () => void;
};

export function ViewerApp({ onInteraction }: ViewerAppProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  useEffect(() => {
    trackEvent("viewer_open");
  }, []);

  function registerInteraction() {
    setAutoRotate(false);
    trackEvent("viewer_rotate", { reason: "orbit" });
    onInteraction();
  }

  function handleReset() {
    controlsRef.current?.reset();
    setAutoRotate(false);
    trackEvent("viewer_reset");
    onInteraction();
  }

  function handleDownload() {
    trackEvent("viewer_download_glb");
    onInteraction();
  }

  function handleAutoRotateToggle(next: boolean) {
    setAutoRotate(next);
    trackViewerToggle("viewer_rotate", next);
    if (!next) {
      onInteraction();
    }
  }

  function handleWireframeToggle(next: boolean) {
    setWireframe(next);
    trackViewerToggle("viewer_wireframe_toggle", next);
    onInteraction();
  }

  return (
    <div className="viewer-shell">
      <ViewerErrorBoundary
        fallback={
          <div className="viewer-loading viewer-loading--error">
            Model unavailable — run the STEP → GLB pipeline to generate ufo5-200W.glb.
          </div>
        }
      >
        <ProductViewer
          autoRotate={autoRotate}
          wireframe={wireframe}
          controlsRef={controlsRef}
          onCameraChange={() => {
            /* persistence handled internally */
          }}
          onInteraction={registerInteraction}
        />
      </ViewerErrorBoundary>
      <ViewerHud
        autoRotate={autoRotate}
        wireframe={wireframe}
        onToggleAutoRotate={handleAutoRotateToggle}
        onToggleWireframe={handleWireframeToggle}
        onReset={handleReset}
        onDownload={handleDownload}
        downloadHref={MODEL_DOWNLOAD_URL}
      />
    </div>
  );
}
