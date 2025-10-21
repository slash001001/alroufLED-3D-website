# Alrouf Morph 3D Roadmap

This roadmap translates the “ALROUF Morph 3D” master prompt into concrete workstreams for the existing repository.

## Phase 1 — Repository Intake & Audit
- Manifest generated at `data/manifest.json` enumerating models, imagery, and scripts.
- Primary CAD asset: `assets/ufo5-200W.stp`; optimized runtime GLB: `public/models/ufo5-200W.glb`.
- No additional variants, PDFs, or video assets currently available.

## Phase 2 — 3D Pipeline Automation
- Implement STEP → OBJ → GLB conversion scripts (`scripts/convert_step_to_obj.py`, `scripts/blender_obj_to_glb.py` or Node equivalents).
- Add npm commands (`model:convert`, `model:compress`) and wire GitHub Action to regenerate GLBs and populate `docs/` on push.
- Mirror Draco/Meshopt decoders under `public/decoders/` (and emitted `docs/decoders/`) with relative loader paths.

## Phase 3 — Morph Viewer Implementation
- Build `src/components/ProductMorphViewer.tsx` using React Three Fiber + Drei/Framer Motion scroll timeline with:
  - Camera path segments (intro → reveal → light-on → CTA).
  - Lighting rig (hemisphere + directional) and contact shadows on light background `#F7F8FA`.
  - HUD controls (autorotate, reset, wireframe, download, language toggle) with analytics hooks and camera persistence.
- Replace hero in `src/main.tsx` with morph viewer while keeping fallback sprites via GPU tier detection.

## Phase 4 — Data & Content
- Autogenerate `data/products.json` from manifest for imagery/specs/download links.
- Populate homepage sections and viewer callouts from structured data.
- Surface all sprites in galleries or fallbacks; archive legacy parallax code under `archive/`.

## Phase 5 — UX, Localization, Accessibility
- Introduce `styles/theme.css` with light theme tokens, Cairo + Inter font stack.
- Add global error overlay, `prefers-reduced-motion` handling, and RTL mirroring when Arabic active.
- Ensure HUD and CTA controls are keyboard accessible with clear focus states.

## Phase 6 — Telemetry, SEO, Performance
- Extend GA4 events (`viewer_loaded`, `scroll_morph`, `wireframe_toggle`, etc.) using `src/lib/analytics.ts`.
- Add SEO/OG metadata, `schema.org/Product`, `sitemap.xml`, and `robots.txt`.
- Configure Lighthouse CI budget in GitHub Actions (mobile ≥ 95, LCP < 2.5 s, CLS < 0.1, TBT < 200 ms).

## Phase 7 — Documentation & Release
- Author `README_ALROUF_3D.md` covering setup, morph viewer usage, and deployment flow.
- Document fallback behavior, GPU gating, and asset budgets.
- After completion, publish via Pages workflow and verify live deployment.

> Status: Phase 1 complete (manifest ready). Next priorities: pipeline automation and morph viewer implementation.
