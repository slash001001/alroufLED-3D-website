# alroufLED 3D experience

Interactive marketing site + product viewer for the alroufLED ufo5-200W luminaire. The homepage renders a lightweight React Three Fiber viewer, with fallbacks for low-power devices, GA4 analytics hooks, and a STEP → GLB automation pipeline.

## Getting started

```bash
npm install
npm run dev
```

The dev server mounts the current repository as a Vite application. Hot-module reload is enabled for both the marketing site and the viewer components.

Build static assets for GitHub Pages/Vercel:

```bash
npm run build
```

Output is written to `dist/`.

## 3D pipeline (STEP → GLB)

Source CAD: `assets/ufo5-200W.stp`

Generate / refresh the GLB:

```bash
npm run model:build
```

What the script does:

- Detects whether `freecadcmd` is installed.
  - If available, it converts the STEP → OBJ → GLB, applies Draco + Meshopt compression, and writes the result to both `public/models/` and `docs/models/`.
  - If FreeCAD is missing, it falls back to a procedurally generated placeholder GLB so the viewer keeps working (helpful on machines without CAD tooling).
- Cleans up temporary OBJ files.

Need the placeholder only? Use `npm run model:placeholder`.

> Install FreeCAD on macOS with `brew install --cask freecad` (make sure `FreeCADCmd` is on your `$PATH`).

### Alternative: Blender decimation

When you need finer control over topology, convert the STEP (or any OBJ you produce manually) inside Blender headless:

```bash
blender --background --python tools/blender_obj_to_glb.py -- \
  --input path/to/ufo5-200W.obj \
  --output public/models/ufo5-200W.glb \
  --decimate 0.35
```

Then run the compression step by executing `npm run model:build` again (it will detect the new GLB and recompress it).

## Viewer architecture

- React 18 + React Three Fiber + Drei
- Draco + Meshopt decoding configured in `src/3d/loaders.ts`
- Light theme UI defined in `src/styles/viewer.css`
- Fallback (`detect-gpu`) → 360° sprite strip with CTA to full viewer page
- GA4 events emitted via `src/lib/analytics.ts`
- Camera persistence via `localStorage`

### Relevant entry points

| Path | Description |
| --- | --- |
| `src/main.tsx` | Boots the homepage viewer with GPU detection + fallback |
| `src/viewer-page.tsx` | Fullscreen `/viewer.html` experience |
| `src/ViewerApp.tsx` | Viewer shell, controls, analytics integration |
| `src/3d/ProductViewer.tsx` | R3F scene, lighting, camera controller |
| `src/ui/FallbackHero.tsx` | Sprite-based fallback |

## Analytics

Elements with `data-analytics-event` automatically call `trackEvent()` via `src/site.ts`. GA4 events flowing from the viewer:

- `viewer_open`
- `viewer_rotate`
- `viewer_wireframe_toggle`
- `viewer_reset`
- `viewer_download_glb`
- `cta_whatsapp_click`

## CI/CD

GitHub Actions workflow (`.github/workflows/convert-and-deploy.yml`) performs:

1. Install dependencies
2. Run the STEP → GLB pipeline (if the STEP file changed)
3. Build the static site (`npm run build`)
4. Publish to the `gh-pages` branch (GitHub Pages)

Configure repository secrets:

- `GH_PAGES_TOKEN` – classic PAT or token with `repo` scope for deployment (optional if using `GITHUB_TOKEN` with Pages v4).
- `FREECAD_VERSION` (optional) – to pin FreeCAD package version when using a runner with APT.

## Accessibility & performance budgets

- Lighthouse mobile ≥ 95 (Performance / Accessibility / SEO / Best Practices)
- LCP < 2.5s, CLS < 0.1, TBT < 200ms (measured via Lighthouse CI in workflow)
- GPU fallback ensures WebGL failures still render hero content

## Local testing checklist

- `npm run lint` – ESLint (TypeScript + React)
- `npm run build` – static bundle generation
- `npm run model:build` – generating GLB before committing (requires FreeCAD)

## Repository layout

```
assets/
  ufo5-200W.stp          # Source CAD
public/
  models/ufo5-200W.glb   # Generated GLB (git tracked)
  sprites/               # 360° sprite fallback assets
src/
  3d/                    # R3F scene + loaders
  ui/                    # HUD, fallback UI, error boundary
  lib/                   # Analytics + GPU helpers
  styles/                # Viewer-specific styles
  main.tsx               # Homepage bootstrap
  site.ts                # Marketing page utilities + analytics
  viewer-page.tsx        # Fullscreen viewer entry
```

## Next steps

- Replace the placeholder WhatsApp number with production contact
- Tune Draco/Meshopt quantisation once real CAD is available
- Add photometric data downloads (PDF) alongside GLB download button
