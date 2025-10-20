#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import obj2gltf from "obj2gltf";
import gltfPipeline from "gltf-pipeline";

const { processGltf } = gltfPipeline;

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = fileURLToPath(new URL("..", import.meta.url));

const assetsDir = join(projectRoot, "assets");
const publicModelsDir = join(projectRoot, "public", "models");
const docsModelsDir = join(projectRoot, "docs", "models");
const stepPath = join(assetsDir, "ufo5-200W.stp");
const objPath = join(publicModelsDir, "ufo5-200W.obj");
const glbPath = join(publicModelsDir, "ufo5-200W.glb");
const docsGlbPath = join(docsModelsDir, "ufo5-200W.glb");

const args = process.argv.slice(2);
const forcePlaceholder = args.includes("--placeholder");

function commandExists(command) {
  const binary = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(binary, [command], {
    stdio: "ignore"
  });
  return result.status === 0;
}

function run(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      stdio: "inherit",
      shell: false,
      ...options
    });
    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

function createPlaceholderBuffer() {
  const segments = 32;
  const radiusTop = 0.6;
  const radiusMid = 1.2;
  const radiusBottom = 1.4;
  const height = 0.6;
  const finHeight = 0.4;
  const finInset = 0.15;

  const topY = height / 2;
  const midY = 0.1;
  const bottomY = -height / 2;
  const finY = bottomY + finHeight;

  const positions = [];
  const normals = [];

  const topCentre = [0, topY, 0];
  const bottomCentre = [0, bottomY, 0];

  function addFace(a, b, c) {
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];

    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const length = Math.hypot(nx, ny, nz) || 1;
    const normal = [nx / length, ny / length, nz / length];

    positions.push(...a, ...b, ...c);
    normals.push(...normal, ...normal, ...normal);
  }

  function ring(radius, y) {
    return Array.from({ length: segments }, (_, i) => {
      const theta = (i / segments) * Math.PI * 2;
      return [Math.cos(theta) * radius, y, Math.sin(theta) * radius];
    });
  }

  const topRing = ring(radiusTop, topY);
  const midRing = ring(radiusMid, midY);
  const bottomRing = ring(radiusBottom, bottomY);
  const finOuter = ring(radiusBottom + finInset, finY);
  const finInner = ring(radiusBottom - finInset, bottomY);

  for (let i = 0; i < segments; i += 1) {
    const next = (i + 1) % segments;

    addFace(topCentre, topRing[next], topRing[i]);

    addFace(bottomCentre, bottomRing[i], bottomRing[next]);

    addFace(bottomRing[i], bottomRing[next], midRing[next]);
    addFace(bottomRing[i], midRing[next], midRing[i]);

    addFace(midRing[i], midRing[next], topRing[next]);
    addFace(midRing[i], topRing[next], topRing[i]);

    const finA0 = finInner[i];
    const finA1 = finOuter[i];
    const finB0 = finInner[next];
    const finB1 = finOuter[next];

    addFace(finA0, finB1, finB0);
    addFace(finA0, finA1, finB1);
  }

  const positionsArray = new Float32Array(positions);
  const normalsArray = new Float32Array(normals);

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < positionsArray.length; i += 3) {
    const x = positionsArray[i];
    const y = positionsArray[i + 1];
    const z = positionsArray[i + 2];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }

  const positionBuffer = Buffer.from(positionsArray.buffer);
  const normalBuffer = Buffer.from(normalsArray.buffer);
  const binaryBuffer = Buffer.concat([positionBuffer, normalBuffer]);

  const vertexCount = positionsArray.length / 3;

  const json = {
    asset: { version: "2.0", generator: "build-model.mjs" },
    buffers: [{ byteLength: binaryBuffer.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positionBuffer.length },
      { buffer: 0, byteOffset: positionBuffer.length, byteLength: normalBuffer.length }
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: vertexCount,
        type: "VEC3",
        min: [minX, minY, minZ],
        max: [maxX, maxY, maxZ]
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: vertexCount,
        type: "VEC3"
      }
    ],
    materials: [
      {
        name: "UFO Body",
        pbrMetallicRoughness: {
          baseColorFactor: [0.88, 0.92, 0.98, 1],
          metallicFactor: 0.2,
          roughnessFactor: 0.6
        },
        doubleSided: true
      }
    ],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            material: 0,
            mode: 4
          }
        ]
      }
    ],
    nodes: [{ mesh: 0, name: "ufo5-placeholder" }],
    scenes: [{ nodes: [0] }],
    scene: 0
  };

  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
  const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
  const jsonPadded = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPadding, 0x20)]);

  const binPadding = (4 - (binaryBuffer.length % 4)) % 4;
  const binPadded = Buffer.concat([binaryBuffer, Buffer.alloc(binPadding)]);

  const totalLength = 12 + 8 + jsonPadded.length + 8 + binPadded.length;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonPadded.length, 0);
  jsonHeader.write("JSON", 4, 4, "ascii");

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binPadded.length, 0);
  binHeader.write("BIN\0", 4, 4, "ascii");

  return Buffer.concat([header, jsonHeader, jsonPadded, binHeader, binPadded]);
}

async function ensureDirectories() {
  mkdirSync(publicModelsDir, { recursive: true });
  mkdirSync(docsModelsDir, { recursive: true });
}

async function copyToDocs(buffer) {
  await ensureDirectories();
  await writeFile(glbPath, buffer);
  await writeFile(docsGlbPath, buffer);
}

async function buildFromStep() {
  if (!existsSync(stepPath)) {
    throw new Error(`STEP file missing at ${stepPath}`);
  }

  if (!commandExists("freecadcmd")) {
    return null;
  }

  await ensureDirectories();
  await run("freecadcmd", [join(__dirname, "convert_step_to_obj.py"), stepPath, objPath]);

  const glbBuffer = await obj2gltf(objPath, { binary: true });
  const processed = await processGltf(Buffer.from(glbBuffer), {
    dracoOptions: {
      compressionLevel: 7,
      quantizePositionBits: 12,
      quantizeNormalBits: 10,
      quantizeTexcoordBits: 12,
      quantizeColorBits: 8,
      quantizeGenericBits: 12
    }
  });

  try {
    rmSync(objPath, { force: true });
  } catch (error) {
    // ignore
  }

  return processed.glb;
}

async function main() {
  try {
    let buffer;
    if (!forcePlaceholder) {
      buffer = await buildFromStep();
    }
    if (!buffer) {
      console.warn("[model] FreeCAD unavailable – using procedural placeholder.");
      buffer = createPlaceholderBuffer();
    }
    await copyToDocs(buffer);
    console.log(`[model] Generated ${glbPath.replace(projectRoot, "")} (${buffer.length} bytes)`);
  } catch (error) {
    console.error("[model] Failed to build GLB", error);
    process.exitCode = 1;
  }
}

main();
