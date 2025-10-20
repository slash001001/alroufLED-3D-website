---
name: Replace parallax with a real 3D product viewer (ufo5‑200W)
about: تكليف مباشر لأنيس لاستبدال حركة الـ PNG بعرض 3D حقيقي مضغوط مع R3F + خط أنابيب GLB
title: Replace parallax with a real 3D product viewer (ufo5‑200W) — R3F + GLB pipeline
assignees: Anis
labels: feature, 3D, priority:high, marketing, UX, performance
---

**Assignee:** @Anis  
**Milestone:** 3D Launch

### Context (what exists today)

* The live homepage “movement” is **2D parallax** (see `index.html:43`, `app.js:3`) moving PNG layers on pointer move.
* `docs/factory.js` is an **old experimental Three.js scene** that renders abstract geometry; it’s **not** connected to the homepage and **not** the ufo5 luminaire.
* There is **no real 3D model** or interactive viewer on production yet.

**This issue delivers the missing 3D experience**: convert the STEP model to GLB (compressed), build a React Three Fiber (R3F) viewer, wire it into the homepage hero, add fallbacks + analytics + SEO/perf best practices. Remove all parallax hacks.

---

### Goals

1. Show the **actual ufo5‑200W** in the homepage hero as a **real 3D viewer** (React Three Fiber).
2. **Light theme** across the hero (very light background #F7F8FA / #FFFFFF) with good contrast.
3. Ship a **compressed GLB** (Draco + Meshopt) with a smooth interaction on modern mobile/desktop.
4. Remove parallax code and the old `docs/factory.js` experiment from the live path.
5. Add **fallbacks** (360° sprite or poster) for low‑end devices.
6. Track key **analytics events** (viewer interactions, downloads, CTA clicks).
7. Keep **Lighthouse** (mobile) ≥ 95 for Performance/SEO/Best‑Practices/Accessibility.

---

### Deliverables

* ✅ **3D pipeline**: `assets/ufo5-200W.stp` → `public/models/ufo5-200W.glb`

  * CLI scripts (FreeCAD for STEP→OBJ, obj2gltf or Blender for OBJ→GLB).
  * Draco + Meshopt compression; optional KTX2 textures if any appear.
  * A GitHub Action to auto-convert on push of `.stp` (artifact committed to `public/models/`).
* ✅ **Viewer**: React Three Fiber + @react-three/drei

  * Orbit controls, soft lighting (hemisphere + key directional), ground/receiveShadow (subtle), light background.
  * UI toggles: **Wireframe**, **Auto-rotate**, **Reset view**, **Download GLB**.
  * Fit-to-frame + persist last camera via `localStorage`.
* ✅ **Homepage integration**: Replace current parallax hero with the 3D viewer component.
* ✅ **Fallback**: Use `detect-gpu` gating; if tier is low/no WebGL → show 360° sprite (or static hero) + “Open 3D viewer” button route.
* ✅ **Analytics**: GA4 events: `viewer_open`, `viewer_rotate`, `viewer_wireframe`, `glb_download`, plus CTA events.
* ✅ **Cleanup**: Remove the parallax JS (`index.html:43`, `app.js:3`) and exclude `docs/factory.js` from the live bundle.
* ✅ **Docs**: README section “3D pipeline & viewer” with commands and troubleshooting.

---

### Acceptance Criteria (Definition of Done)

* [ ] Homepage hero renders **ufo5‑200W.glb** (not PNG layers).
* [ ] `index.html:43` and `app.js:3` parallax logic **removed**; `docs/factory.js` not loaded anywhere in production.
* [ ] 3D interaction **smooth** on recent iOS/Android + desktop (target 60 fps where possible; no jank).
* [ ] GLB size **≤ ~5–8 MB** after Draco/Meshopt (or justify if larger).
* [ ] Fallback path works (no WebGL → 360° or static poster).
* [ ] GA4 receives the listed events on real interactions.
* [ ] Lighthouse (mobile) ≥ 95 on all categories; Web Vitals within budget (LCP < 2.5s, CLS < 0.1, TBT < 200 ms).
* [ ] Code passes ESLint/Prettier; CI green; Pages deployment succeeds.

---

### Tech Choices (current best practices)

* **Viewer:** React Three Fiber (`@react-three/fiber`) + `@react-three/drei`, `three@latest`.
* **Compression:** `gltf-pipeline` (Draco), `meshoptimizer` (meshopt).
* **Fallback detection:** `detect-gpu` (pmndrs) + feature detect for WebGL2 → choose viewer or fallback.
* **Bundling:** Keep current hosting (GitHub Pages). You can integrate R3F via a small React entry (Vite build) emitted into `/public/` and referenced by homepage, or migrate to Next.js static export if needed.
* **Telemetry:** GA4 (and Meta Pixel if configured). Fire custom events from the viewer UI.

---

### File/Folder Plan (incremental, no big‑bang)

```
/assets
  ufo5-200W.stp
/public
  /models/ufo5-200W.glb        # built artifact (compressed)
  /sprites/ufo5-200W-360/*.png # optional fallback sprite
/src
  /3d/ProductViewer.tsx        # R3F component (viewer)
  /3d/loaders.ts               # GLTF/Draco/Meshopt setup
  /ui/ViewerHud.tsx            # UI toggles
  analytics.ts                 # GA4 helpers (events)
  main.tsx                     # React entry (hydrate viewer in homepage)
/tools
  convert_step_to_obj.py       # FreeCAD CLI
  blender_obj_to_glb.py        # Blender headless (OBJ->GLB)
/.github/workflows
  convert-and-deploy.yml       # auto pipeline for STEP->GLB + deploy
```

---

### Tasks & Checklists

**A) 3D Pipeline**

* [ ] Add `/tools/convert_step_to_obj.py` (FreeCAD) and `/tools/blender_obj_to_glb.py`.
* [ ] Local run:

  ```bash
  freecadcmd tools/convert_step_to_obj.py assets/ufo5-200W.stp public/models/ufo5-200W.obj
  npx obj2gltf -i public/models/ufo5-200W.obj -o public/models/ufo5-200W.glb
  npx gltf-pipeline -i public/models/ufo5-200W.glb -o public/models/ufo5-200W.draco.glb -d
  mv -f public/models/ufo5-200W.draco.glb public/models/ufo5-200W.glb
  ```
* [ ] Add Meshopt post-process if needed; consider KTX2 if textures appear.

**B) Viewer Implementation**

* [ ] Install: `npm i react react-dom three @react-three/fiber @react-three/drei detect-gpu`
* [ ] `ProductViewer.tsx`: load GLB via `GLTFLoader` + `DRACOLoader`/Meshopt, scene lights, shadows, orbit.
* [ ] `ViewerHud.tsx`: Wireframe/Auto-Rotate/Reset/Download + event hooks (`analytics.ts`).
* [ ] Persist camera target/position in `localStorage`.
* [ ] Very light background (#F7F8FA) for the hero container.

**C) Homepage Wiring**

* [ ] Replace parallax container in `index.html` with a `<div id="viewer-root">`.
* [ ] Hydrate React entry (`main.tsx`) only when GPU tier is medium+; otherwise render fallback.
* [ ] Remove parallax: delete code at `index.html:43`, `app.js:3`.
* [ ] Remove/ignore `docs/factory.js` in production bundle.

**D) Fallback**

* [ ] If `detect-gpu` tier = 0/1 or WebGL not available → show 360° sprite (or static poster) + CTA “Open 3D viewer (beta)”.
* [ ] Provide a dedicated `/viewer` page with full-screen R3F for users who opt in.

**E) Analytics**

* [ ] GA4 custom events:

  * `viewer_open`, `viewer_rotate`, `viewer_wireframe_toggle`, `viewer_reset`, `viewer_download_glb`, `cta_whatsapp_click`.
* [ ] Verify events in GA4 debug view.

**F) Performance & QA**

* [ ] Lighthouse (mobile) run in CI; meet budgets.
* [ ] Test latest Chrome/Edge/Safari + iOS/Android.
* [ ] Accessibility: keyboard focus, aria-labels for UI.

**G) CI/CD**

* [ ] `convert-and-deploy.yml`: if `.stp` exists → convert → compress → publish `/public`.
* [ ] Keep Pages deployment green.

---

### Branch & PR Plan

* Create `feat/3d-viewer-ufo5-200W`.
* Open small PRs:

  1. `chore/pipeline-3d` (tools + workflow)
  2. `feat/viewer-core` (R3F component + loaders)
  3. `feat/homepage-integration` (replace parallax + fallback)
  4. `feat/analytics-a11y` (events + a11y fixes)

* Each PR must show: short demo GIF + Lighthouse before/after + GLB size.

---

### Risks & Mitigations

* **Large mesh size** → decimate/cleanup in Blender and increase Draco quantization.
* **Mobile perf** → cap polycount, turn off shadows on low tier, reduce HDRI.
* **WebGL blocked devices** → robust fallback.

---

### Done = Merge + Deploy

We consider this issue complete when the homepage shows the interactive 3D luminaire (not parallax), analytics fire, budgets pass, and Pages deployment is live.

---

## توضيح بالعربي (مختصر)

هذا الطلب يخلّي **أنيس** يوقف الـ parallax الحالي، ويحوّل **ufo5‑200W.stp** إلى **GLB** مضغوط، ويبني **عارض 3D** حقيقي (React Three Fiber)، ويشبكه بالصفحة الرئيسية بخلفية فاتحة، مع بدائل للأجهزة الضعيفة وتتبع تحليلات وأداء قوي. وفيه معايير قبول واضحة عشان نقفل المهمة بثقة.
