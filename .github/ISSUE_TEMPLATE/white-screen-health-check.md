---
name: White screen on production — Full site health check & 3D enablement
about: Diagnose the blank page, restore the 3D viewer, and harden the deployment for ufo5-200W
title: White screen on production — Full site health check & 3D enablement (ufo5-200W)
assignees: Anis
labels:
  - bug
  - 3D
  - priority:critical
  - triage
  - frontend
  - deployment
---

### Summary

The current site renders a **white/blank page** on production. We need a **full checkup** and a reliable fix, then ship the real **3D product viewer** (ufo5-200W) with a light background and robust fallbacks. Parallax mock must be removed from the live path.

---

## Phase 0 — Triage (reproduce & capture signals)

- [ ] **Open DevTools** (Chrome/Safari) → Console & Network. Capture:
  - Any red errors (syntax errors, MIME mismatch, module 404).
  - Network 404/403 on `index.html` imports, `src/viewer.js`, `models/ufo5-200W.glb`, draco/meshopt decoders, CSS/PNG.
- [ ] Check **GitHub Pages deployment logs** (last run) for build errors.
- [ ] Verify **served root**: we publish `public/` as the site root. Ensure `index.html` lives inside the published artifact (not duplicated at repo root).
- [ ] Confirm **paths are relative** (e.g., `./src/viewer.js`, `models/ufo5-200W.glb`) — **no leading slashes**.
- [ ] Confirm **canvas container has height** (no `height: 0` / collapsed parent).

Deliverable: short triage note with screenshots of Console & Network, plus a list of failed URLs.

---

## Phase 1 — Fix common root causes (pick all that apply)

### JS entry / modules

- [ ] If Console shows: _“Refused to execute module… MIME type ‘text/html’”_ → your script path returns HTML (404). Fix `index.html` to import the correct relative path:

  ```html
  <script type="module" src="./src/viewer.js"></script>
  ```

- [ ] If using Next/Vite build → ensure **built** assets are the ones deployed (no stale references).

### Asset paths on GitHub Pages

- [ ] Ensure `models/ufo5-200W.glb` exists in **published** folder.
- [ ] Avoid leading `/` in asset URLs (GitHub Pages uses repo subpath).
- [ ] Case sensitivity: check `ufo5-200W.glb` vs `UFO5-200W.glb`.

### Layout / CSS

- [ ] Give the viewer container a real height to avoid a white area:

  ```css
  html,
  body {
    height: 100%;
  }

  #viewer-root,
  canvas {
    width: 100%;
    height: 100vh;
    display: block;
  }
  ```

- [ ] Ensure background is **light** but not masking the canvas (`#F7F8FA` / `#FFFFFF`).

### 3D pipeline

- [ ] If GLB 404/too big/fails to decode → re-run pipeline:

  ```bash
  freecadcmd tools/convert_step_to_obj.py assets/ufo5-200W.stp public/models/ufo5-200W.obj
  npx obj2gltf -i public/models/ufo5-200W.obj -o public/models/ufo5-200W.glb
  npx gltf-pipeline -i public/models/ufo5-200W.glb -o public/models/ufo5-200W.draco.glb -d
  mv -f public/models/ufo5-200W.draco.glb public/models/ufo5-200W.glb
  ```

- [ ] Budget: keep **GLB ≤ 5–8 MB** (use decimation/Draco quantization if needed).

### Decoders / Workers

- [ ] If using Draco/Meshopt: set decoder paths properly or inline via CDN. Example (R3F/three):

  ```js
  dracoLoader.setDecoderPath('./decoders/'); // relative, no leading slash
  ```

### Error UX

- [ ] Add a minimal **error overlay** so we never ship a silent white page (see Phase 2).

---

## Phase 2 — Hardening (never blank again)

- [ ] **Global error overlay** (runtime):

  ```html
  <div
    id="error-overlay"
    style="display:none;position:fixed;inset:0;background:#fff;color:#111;font-family:system-ui;padding:16px;z-index:9999;overflow:auto"
  >
    <h3>Something went wrong</h3>
    <pre id="error-log" style="white-space:pre-wrap"></pre>
  </div>
  <script>
    const showErr = (msg) => {
      const o = document.getElementById('error-overlay');
      const l = document.getElementById('error-log');
      o.style.display = 'block';
      l.textContent = msg;
    };
    window.addEventListener(
      'error',
      (e) => showErr(String(e.error || e.message)),
      true,
    );
    window.addEventListener(
      'unhandledrejection',
      (e) => showErr(String(e.reason)),
      true,
    );
  </script>
  ```

- [ ] **Fallback**: use `detect-gpu` to gate the viewer; if low tier/no WebGL → show a 360° sprite or hero image + button “Open 3D viewer”.
- [ ] **Analytics** (GA4): log `viewer_loaded`, `viewer_error`, `glb_404`, `glb_download`, `cta_click`.

---

## Phase 3 — 3D enablement (light background & UX)

- [ ] Replace parallax with **React Three Fiber** viewer (light theme).
- [ ] Controls: orbit + auto-rotate toggle + reset + wireframe + **Download GLB**.
- [ ] Lighting: hemisphere + soft directional, **background `#F7F8FA`**.
- [ ] Fit to bounds; persist last camera in `localStorage`.

---

## Phase 4 — Tests & Budgets

- [ ] Add **Playwright smoke test**:
  - Page returns 200, `<canvas>` exists and has non-zero size.
  - `/models/ufo5-200W.glb` returns 200 with `content-length > 0`.
- [ ] **Lighthouse (mobile)** budgets: Perf ≥ 95, LCP < 2.5s, CLS < 0.1, TBT < 200ms.
- [ ] CI must fail if budgets regress.

---

## Acceptance Criteria

- Site no longer shows a white screen. If the viewer or assets fail, the **error overlay** appears with a human-readable message.
- Real **ufo5-200W.glb** renders in the hero with a **light background**.
- Paths are fixed for GitHub Pages; no module/asset 404s.
- Fallback engages automatically on weak devices.
- GLB within size budget; Lighthouse (mobile) ≥ 95 across the board.
- GA4 events visible in DebugView.

---

## CLI to create this issue

```bash
gh issue create \
  --title "White screen on production — Full site health check & 3D enablement (ufo5-200W)" \
  --assignee "Anis" \
  --label "bug,3D,priority:critical,triage,frontend,deployment" \
  --body-file - <<'EOF'
[PASTE THE BODY ABOVE HERE]
EOF
```

---

## 🔧 Hot-fix now (quick verification)

1. Open **Console** and note the first red error — usually a 404 on `viewer.js` or the GLB.
2. Ensure `index.html` in the published root loads:

   ```html
   <script type="module" src="./src/viewer.js"></script>
   ```

3. Drop in the error overlay snippet above so the page never stays blank.
4. Confirm the published structure:

   ```
   public/
     index.html
     src/viewer.js
     models/ufo5-200W.glb
   ```

   Paths must be relative, and file names must match exactly (case-sensitive).
5. Re-deploy GitHub Pages or rerun the workflow, then re-test.
