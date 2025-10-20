import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { MutableRefObject } from "react";
import { Color, Vector3 } from "three";
import { useProductModel } from "./loaders";

const CAMERA_STORAGE_KEY = "ufo5-viewer-camera-v1";

const DEFAULT_CAMERA_POSITION: [number, number, number] = [4.2, 2.4, 5.6];
const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, 0.8, 0];

export type CameraState = {
  position: [number, number, number];
  target: [number, number, number];
};

const backgroundColor = new Color("#F7F8FA");

function persistCamera(state: CameraState) {
  try {
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("[viewer] Failed to persist camera", error);
  }
}

function readPersistedCamera(): CameraState | null {
  try {
    const raw = localStorage.getItem(CAMERA_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CameraState) : null;
  } catch (error) {
    console.warn("[viewer] Failed to read stored camera", error);
    return null;
  }
}

type SceneProps = {
  wireframe: boolean;
};

function SceneContent({ wireframe }: SceneProps) {
  const { scene } = useProductModel(wireframe);

  return (
    <group dispose={null}>
      <primitive object={scene} position={[0, -1.6, 0]} />
      <Environment preset="city" background={false} />
      <ambientLight intensity={0.55} />
      <directionalLight
        intensity={1.2}
        position={[6, 8, 6]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight intensity={0.35} position={[-6, 3, -4]} color="#a6d1ff" />
      <ContactShadows
        opacity={0.35}
        position={[0, -1.7, 0]}
        blur={2.4}
        scale={8.5}
      />
    </group>
  );
}

type ControlsProps = {
  autoRotate: boolean;
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
  onCameraChange: (state: CameraState) => void;
  onInteraction: () => void;
};

function CameraControls({
  autoRotate,
  controlsRef,
  onCameraChange,
  onInteraction
}: ControlsProps) {
  const controls = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    controlsRef.current = controls.current;
    return () => {
      controlsRef.current = null;
    };
  }, [controlsRef]);

  useEffect(() => {
    const stored = readPersistedCamera();
    if (stored) {
      camera.position.fromArray(stored.position);
      const target = new Vector3().fromArray(stored.target);
      controls.current?.target.copy(target);
      controls.current?.update();
    } else {
      camera.position.fromArray(DEFAULT_CAMERA_POSITION);
      controls.current?.target.set(
        DEFAULT_CAMERA_TARGET[0],
        DEFAULT_CAMERA_TARGET[1],
        DEFAULT_CAMERA_TARGET[2]
      );
      controls.current?.update();
    }
  }, [camera, controls]);

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={0.6}
      maxPolarAngle={1.45}
      maxDistance={11}
      minDistance={2.2}
      autoRotate={autoRotate}
      autoRotateSpeed={0.7}
      makeDefault
      onEnd={() => {
        const next: CameraState = {
          position: camera.position.toArray() as CameraState["position"],
          target: controls.current?.target.toArray() as CameraState["target"]
        };
        persistCamera(next);
        onCameraChange(next);
        onInteraction();
      }}
      onStart={onInteraction}
    />
  );
}

type ProductViewerProps = {
  autoRotate: boolean;
  wireframe: boolean;
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
  onCameraChange: (state: CameraState) => void;
  onInteraction: () => void;
};

export function ProductViewer({
  autoRotate,
  wireframe,
  controlsRef,
  onCameraChange,
  onInteraction
}: ProductViewerProps) {
  return (
    <Canvas
      shadows
      className="viewer-canvas"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: DEFAULT_CAMERA_POSITION, fov: 40, near: 0.1, far: 50 }}
      onCreated={({ gl }) => {
        gl.setClearColor(backgroundColor);
      }}
    >
      <Suspense
        fallback={
          <Html center className="viewer-loading">
            Loading product…
          </Html>
        }
      >
        <SceneContent wireframe={wireframe} />
        <CameraControls
          autoRotate={autoRotate}
          controlsRef={controlsRef}
          onCameraChange={onCameraChange}
          onInteraction={onInteraction}
        />
      </Suspense>
    </Canvas>
  );
}
