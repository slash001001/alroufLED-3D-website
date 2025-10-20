---
name: Rebuild alroufLED 3D Website — Full Redesign & Replatform
about: تكليف لأنيس لإعادة بناء موقع alroufLED ثلاثي الأبعاد بواجهة فاتحة وفق أفضل الممارسات
title: Rebuild alroufLED 3D Website — Full Redesign & Replatform (Light UI, 3D-first, Best Practices)
assignees: Anis
labels: enhancement, redesign
---

**Assignee:** @Anis  
**Role:** أنت تعمل هنا كمزيج من: **Full‑Stack Developer + Product Designer + Marketing Lead**.

### 0) السياق & الموجود حاليًا

لدينا ريبو باسم **alroufLED-3D-website** يحتوي (بحسب الوضع الحالي):

* صفحات ثابتة: `index.html`, `styles.css`, `app.js`
* صور منتجات: سلسلة صور `50-240W (1..8).png` وملفات داخل `docs/`
* ملف CAD: **`ufo5-200W.stp`** (الموديل المعتمد)
* نشر GitHub Pages مفعل (Workflow موجود)
  المطلوب: **إعادة تنظيم، ثم تصميم وتطوير** موقع 3D تفاعلي بخلفية **فاتحة** وفق أفضل الممارسات، مع جاهزية تسويق وقياس أداء.

---

### 1) الهدف

* بناء **تجربة ويب تفاعلية** لمنتجات الإنارة (ufo5-200W أساسًا + بقية القدرات 50–240W) مع **عارض 3D** في القلب.
* واجهة **فاتحة وخفيفة** (Light theme)، عصرية، سهلة القراءة بالعربية والإنجليزية، وداعمة لـ **RTL/LTR**.
* **سرعة وأداء** عاليان (Lighthouse ≥ 95، LCP < 2.5s، CLS < 0.1)، **SEO ممتاز**، وتجهيز كامل للتسويق وتتبع التحويلات.
* بنية كود معيارية، CI/CD نظيف، وقابلية توسّع مستقبلية.

---

### 2) مخرجات مطلوبة (Deliverables)

1. **إعادة منصة** إلى **Next.js 14+ (App Router)** + **TypeScript** + **Tailwind CSS**.

   * بدائل: لو أردت بساطة، استخدم Vite + React؛ لكن نفضّل Next للـ SEO و i18n والـ SSR.
2. **عارض 3D** مبني بـ **React Three Fiber (r3f)** + **@react-three/drei** + **Three.js**:

   * تحميل نموذج المنتج **ufo5-200W.glb** (سنحوّله من STEP).
   * تحكّم Orbit، إضاءة جيدة، خلفية فاتحة (#F7F8FA مثلاً)، ظل أرضي، وواجهة صغيرة: Wireframe/Auto‑Rotate/Reset/Download.
   * **Fallback** تلقائي للأجهزة الضعيفة: صورة 360°/فيديو قصير أو معرض صور.
3. **بايبلاين 3D**:

   * تحويل `assets/ufo5-200W.stp` → OBJ (FreeCAD CLI) → GLB (obj2gltf أو Blender)، مع **Draco** + **Meshopt** + **KTX2** (إن وجِدت خامات).
   * سكربتات CLI + GitHub Actions تؤتمت التحويل عند أي تحديث للـ STEP.
4. **تصميم واجهة وهوية (Light Theme)**:

   * نظام ألوان فاتح، درجات رمادي محايدة (Text #111، Body #444، Surface #FFFFFF/#FAFAFA).
   * **Design tokens** عبر CSS Variables، ومكوّنات UI قابلة لإعادة الاستخدام (Buttons، Cards، Section Header…).
   * **RTL/LTR** عبر `dir` و i18n (ar/en) باستخدام `next-intl` أو `next-i18next`.
5. **هيكل معلومات (IA) وصفحات**:

   * `/` صفحة هيرو + قيمة المنتج + معاينة 3D.
   * `/products/ufo5-200W` صفحة منتج متعمقة (3D + المواصفات + صور + تنزيل كتيّب PDF).
   * `/products/[power]` لنسخ 50–240W (مولّد صفحات ديناميكي من `data/products.json`).
   * `/about`, `/contact` (نموذج Leads + WhatsApp CTA).
   * `/viewer` صفحة عرض 3D كاملة الشاشة.
6. **SEO/Marketing**:

   * Meta + OpenGraph + Twitter Cards + **schema.org/Product**.
   * خريطة موقع + robots.txt + عناوين URL نظيفة.
   * **Analytics**: GA4 + Meta Pixel + تحويلات (CTA/WhatsApp/تحميلات).
   * UTM تلقائي لأزرار الحملة.
7. **الأداء وإمكانية الوصول**:

   * Lazy‑load لكل شيء غير أساسي، **code‑splitting**، prefetch الذكي.
   * WebGL في **Web Worker** إن أمكن (Draco/Meshopt loaders).
   * A11y: تباين ألوان، مفاتيح لوحة مفاتيح، ARIA للواجهة.
8. **CI/CD**:

   * GitHub Actions: lint/test/build/Lighthouse CI (مخبري)، تحويل 3D، ونشر Pages/Vercel.
9. **وثائق**:

   * README مفصّل (تشغيل/تحويل/نشر)، **CONTRIBUTING.md**، **Issue/PR templates**.

**Definition of Done (DoD)**

* Lighthouse (Mobile) ≥ 95/100 لكل Performance/SEO/Best‑Practices/Accessibility.
* CLS < 0.1، LCP < 2.5s (على 4G محاكى)، TBT < 200ms.
* 3D يعمل على أحدث iOS/Android وChrome/Edge/Safari مع fallback للأجهزة الضعيفة.
* i18n (ar/en) كاملة + RTL/LTR سليم.
* Analytics/Pixel تعمل وتُسجّل أهداف التحويل (نقرات CTA/WhatsApp/تحميل GLB/PDF).
* CI/CD أخضر للنشر التلقائي.

---

### 3) خطة التنفيذ (خطوات مرتبة)

**المرحلة A — التحليل والتنظيف (Repo Audit)**

* [ ] جرد الملفات الحالية (HTML/CSS/JS/PNG/STP). نقل الوسائط إلى `public/` وبيانات المنتجات إلى `data/products.json`.
* [ ] حدد ما سيُعاد استخدامه وما سيُستبدل.

**المرحلة B — الهيكلة**

* [ ] إنشاء مشروع Next.js + TS + Tailwind + ESLint + Prettier.
* [ ] بنية مجلدات:

  ```
  /app (App Router)
    /(main)/page.tsx
    /products/[slug]/page.tsx
    /viewer/page.tsx
    /about/page.tsx
    /contact/page.tsx
  /components (UI + 3D)
  /lib (utils, analytics)
  /public (images, models, icons)
  /data/products.json
  /styles/globals.css
  ```
* [ ] إعداد i18n (ar/en) + تبديل اتجاه الصفحة حسب اللغة.

**المرحلة C — 3D Pipeline**

* [ ] سكربتات: STEP→OBJ (FreeCAD) وOBJ→GLB (obj2gltf/Blender) + ضغط Draco/Meshopt + KTX2.
* [ ] Action: عند push لأي `.stp` شغّل التحويل وادفع `.glb` إلى `public/models/`.

**المرحلة D — الواجهة والتجربة**

* [ ] مكوّن `<ProductViewer3D>` (r3f/drei): كاميرا، إضاءة، أرضية، أدوات (wireframe/autorotate/reset/download).
* [ ] خلفية فاتحة جدًا (`#F7F8FA`) وتدرجات لطيفة للعناصر.
* [ ] Sections للصفحة الرئيسية: Hero (لقطة 3D)، Value, Specs Highlights, Gallery, CTA.

**المرحلة E — المحتوى والتسويق**

* [ ] نصوص عربية/إنجليزية مركّزة للمبيعات (H1/H2/CTA).
* [ ] نماذج Leads (Email/Phone/Company) + خيار **WhatsApp CTA** مع UTM.
* [ ] Schema.org Product + OG Images.

**المرحلة F — الأداء & A11y**

* [ ] Mesh decimation إذا احتجنا، وتقسيم المشهد إن كان كبيرًا.
* [ ] lazy hydration للمكونات الثقيلة (3D فقط عند التفاعل إن لزم).
* [ ] اختبارات A11y (axe) ودعم الكيبورد.

**المرحلة G — الإطلاق**

* [ ] تحقق Lighthouse CI في الـ PR.
* [ ] نشر إلى GitHub Pages أو Vercel، وتفعيل المراقبة (Web Vitals/GA4).

---

### 4) المواصفات التفصيلية (مختصرة)

* **Theme (Light):**

  * `--bg: #F7F8FA`, `--surface: #FFFFFF`, `--text: #111`, `--muted: #6B7280`, `--primary: #2563EB`, `--accent: #0EA5E9`.
  * خط عربي واضح (مثلاً IBM Plex Sans Arabic أو Cairo)، إنجليزي Inter/Manrope.
* **3D:**

  * GLB واحد مضغوط Draco، استخدم `GLTFLoader` مع `DRACOLoader` + `MeshoptDecoder`.
  * Exposure/aoLight بيئي لطيف، HDRI اختيارية خفيفة.
  * قياس تلقائي وتوسيط النموذج، وحفظ آخر وضع كاميرا في `localStorage`.
* **SEO:**

  * عناوين فريدة، meta desc، canonical، OG/Twitter.
  * `sitemap.xml` و`robots.txt`.
  * `schema.org/Product` مع السعر/الفولت/القدرة إن توفرت.
* **Analytics:**

  * GA4 + مقاييس أحداث: `cta_click`, `whatsapp_click`, `glb_download`, `viewer_interaction`.
  * Meta Pixel (PageView + ViewContent + Lead).
* **التطوير:**

  * ESM فقط، no jQuery.
  * ESLint strict, Prettier, Husky pre-commit (lint-staged).
  * Branches: `feat/*`, `fix/*`, `chore/*`. Conventional Commits.
* **القابلية الدولية:**

  * `lang="ar"` و`dir="rtl"` للواجهة العربية. تبديل لغوي في الهيدر.

---

### 5) معايير القبول (Acceptance Criteria)

* [ ] هوم/منتج/عارض/تواصل تعمل بالعربية والإنجليزية.
* [ ] العارض 3D سريع وسلس على موبايل حديث (60fps تقريبًا) مع fallback.
* [ ] Lighthouse (Mobile) ≥ 95 لجميع المؤشرات.
* [ ] Forms + WhatsApp CTA تسجّل أحداث التحويل في GA4.
* [ ] السيو مُفعّل + schema.org ظاهر في Rich Results Test.
* [ ] CI/CD: بناء تلقائي + تحويل STEP→GLB + نشر ناجح.

---

### 6) ملاحظات التنفيذ السريعة

* اعتمد المنتج الافتراضي **ufo5-200W**؛ أنشئ `data/products.json` لباقي القدرات (50–240W) واستخدمه في مولّد صفحات ديناميكي.
* اجعل الخلفية فاتحة جدًا في كامل الموقع، ووفّر **تباينًا كافيًا** للنصوص.
* وفّر زر **تحميل GLB**، واستبدله بتحميل **PDF** للداتا شيت إن وُجد.
* لا تُحمّل الـ 3D فورًا في الهوم على الأجهزة الضعيفة: استخدم **Poster** مع زر "عرض 3D".

---

### 7) تسليم نهائي

* رابط Demo (Pages/Vercel) + تقرير Lighthouse.
* مستند قصير يشرح قرارات التصميم/التنفيذ، ونقاط التحسين اللاحقة.
* خطة محتوى لحملات Ads (عناوين/CTA/UTM) و3 شرائح صور/فيديو قصيرة جاهزة للاستخدام.

> **ابدأ الآن** بالمرحلة A (Audit) وافتح PRات صغيرة لكل خطوة. أي أسئلة تصميمية/تسويقية رئيسية وثّقها في هذا الـ Issue قبل اعتمادها.
