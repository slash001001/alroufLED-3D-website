#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { processGltf } from "gltf-pipeline";
import * as meshopt from "meshoptimizer";

if (process.argv.length < 3) {
  console.error("Usage: node tools/postprocess-glb.mjs <input.glb> [output.glb]");
  process.exit(1);
}

const [inputPath, outputPath = inputPath] = process.argv.slice(2);
const src = resolve(inputPath);
const dst = resolve(outputPath);

const glb = await readFile(src);

const { glb: optimized } = await processGltf(glb, {
  dracoOptions: {
    compressionLevel: 7,
    quantizePositionBits: 12,
    quantizeNormalBits: 10,
    quantizeTexcoordBits: 12,
    quantizeColorBits: 8,
    quantizeGenericBits: 12
  },
  meshoptCompression: meshopt,
  separate: false
});

await writeFile(dst, optimized);
console.log(`Optimised GLB saved to ${dst}`);
