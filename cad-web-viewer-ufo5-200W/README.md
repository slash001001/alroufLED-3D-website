# CAD Web Viewer — Interactive 3D viewer for STEP files (ufo5-200W)

**العربي** | [English below](#english)

## نظرة عامة
هذا الريبو يقدّم موقع ويب تفاعلي (Three.js) لعرض ملفّات CAD المحوّلة إلى صيغة **glb** (glTF).
الافتراضي هنا هو الموديل: **ufo5-200W**.

### المتطلبات
- Node.js (للسيرفر المحلي).
- FreeCAD أو Blender (اختياري للتحويل محليًا)، أو أداة `obj2gltf` لتحويل OBJ → GLB.

### خطوات سريعة
1) **ضع ملف STEP** لديك في `assets/` كـ `assets/ufo5-200W.stp`.
   > ملاحظة: لم أضمّن الملف الأصلي تلقائيًا لأنه أكبر من 30MB. انسخه يدويًا إلى `assets/ufo5-200W.stp`.

2) **حوّل STEP → OBJ** عبر FreeCAD (سطر أوامر):
```bash
freecadcmd tools/convert_step_to_obj.py assets/ufo5-200W.stp public/models/ufo5-200W.obj
```

3) **حوّل OBJ → GLB** (خياران):
- عبر Node:  
```bash
npx obj2gltf -i public/models/ufo5-200W.obj -o public/models/ufo5-200W.glb
# (اختياري) ضغط Draco:
npx gltf-pipeline -i public/models/ufo5-200W.glb -o public/models/ufo5-200W.draco.glb -d
mv -f public/models/ufo5-200W.draco.glb public/models/ufo5-200W.glb
```
- أو عبر Blender (رأسياً/بدون واجهة):  
```bash
blender -b -P tools/blender_obj_to_glb.py -- public/models/ufo5-200W.obj public/models/ufo5-200W.glb
```

4) **التشغيل محليًا**:
```bash
npm install
npm run serve
# افتح http://localhost:8080
```

5) **النشر على GitHub Pages**:  
استعمل الـ workflow الجاهز `deploy.yml`. عند وجود أي ملف STEP في `assets/` سيحوّله تلقائيًا إلى OBJ ثم GLB وينشر `public/`.

---

## <a name="english"></a>English

### Overview
A minimal Three.js web app to preview CAD models on the web. Default model name: **ufo5-200W**.

### Quick Start
1) Put your STEP file at `assets/ufo5-200W.stp`.  
> Note: Skipped auto-including the original STEP (over 30 MB). Copy it manually to `assets/ufo5-200W.stp`.

2) Convert STEP → OBJ with FreeCAD (CLI):
```bash
freecadcmd tools/convert_step_to_obj.py assets/ufo5-200W.stp public/models/ufo5-200W.obj
```

3) Convert OBJ → GLB:
```bash
npx obj2gltf -i public/models/ufo5-200W.obj -o public/models/ufo5-200W.glb
npx gltf-pipeline -i public/models/ufo5-200W.glb -o public/models/ufo5-200W.draco.glb -d
mv -f public/models/ufo5-200W.draco.glb public/models/ufo5-200W.glb
```

4) Run locally:
```bash
npm install
npm run serve
# open http://localhost:8080
```

5) Deploy to GitHub Pages: the included `deploy.yml` workflow auto-converts any STEP files found in `assets/` into `public/models/*.glb` and publishes `public/`.
