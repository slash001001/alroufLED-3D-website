import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { Group, Mesh, Material } from "three";

const DRACO_DECODER_PATH = new URL(
  "decoders/draco/",
  import.meta.env.BASE_URL
).toString();

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
// Cast while upstream typings catch up with the Meshopt helper.
const gltfWithMeshopt = useGLTF as unknown as {
  setMeshoptDecoder?: (decoder: unknown) => void;
};

gltfWithMeshopt.setMeshoptDecoder?.(MeshoptDecoder);

export const MODEL_URL = new URL(
  "models/ufo5-200W.glb",
  import.meta.env.BASE_URL
).toString();

export function useProductModel(wireframe: boolean) {
  const gltf = useGLTF(MODEL_URL);
  const root = useRef<Group>();

  useEffect(() => {
    if (!gltf.scene) return;
    const scene = gltf.scene;
    root.current = scene;

    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const material = mesh.material as Material | Material[];
        if (Array.isArray(material)) {
          material.forEach((mat) => {
            if (mat && "wireframe" in mat) {
              (mat as Material & { wireframe?: boolean }).wireframe = wireframe;
            }
          });
        } else if (material && "wireframe" in material) {
          (material as Material & { wireframe?: boolean }).wireframe = wireframe;
        }
      }
    });
  }, [gltf.scene, wireframe]);

  return { scene: gltf.scene };
}

useGLTF.preload(MODEL_URL);
