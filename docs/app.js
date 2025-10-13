import { initFactoryScene } from "./factory.js";

const docEl = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const langToggle = document.getElementById("langToggle");
const themeToggle = document.getElementById("themeToggle");
const sections = Array.from(document.querySelectorAll("main section"));
const progressButtons = Array.from(document.querySelectorAll(".progress-nav button"));
const scrollTargets = document.querySelectorAll("[data-scroll-target]");
const kpiValues = Array.from(document.querySelectorAll(".kpi-value"));

const sectionLayerMap = {
  hero: "ingestion",
  vision: "qa",
  layers: "index",
  services: "pdpl",
  pdpl: "reasoning",
  integrations: "channels",
  scope: "monitoring",
};

const state = {
  lang: localStorage.getItem("leen_lang") || "en",
  theme: localStorage.getItem("leen_theme") || "light",
  countersTriggered: false,
  factory: null,
  teardownFns: [],
};

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("leen_lang", lang);
  docEl.setAttribute("lang", lang);
  docEl.setAttribute("data-lang", lang);
  docEl.dir = lang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-en]").forEach((node) => {
    const en = node.getAttribute("data-en");
    const ar = node.getAttribute("data-ar");
    if (lang === "ar" && ar != null) {
      node.textContent = ar;
    } else if (en != null) {
      node.textContent = en;
    }
  });

  if (langToggle) {
    const nextLabel = lang === "en" ? langToggle.getAttribute("data-en") : langToggle.getAttribute("data-ar");
    langToggle.textContent = nextLabel || "";
    langToggle.setAttribute("aria-pressed", lang === "ar");
  }
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem("leen_theme", theme);
  docEl.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", theme === "dark");
  }
}

function toggleLanguage() {
  setLanguage(state.lang === "en" ? "ar" : "en");
}

function toggleTheme() {
  setTheme(state.theme === "light" ? "dark" : "light");
}

function bindToggles() {
  if (langToggle) {
    langToggle.addEventListener("click", toggleLanguage);
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

function applyScrollTargets() {
  scrollTargets.forEach((trigger) => {
    const selector = trigger.getAttribute("data-scroll-target");
    if (!selector) return;
    const target = document.querySelector(selector);
    if (!target) return;
    trigger.addEventListener("click", () => {
      target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });
    });
  });
}

function setupProgressNav() {
  progressButtons.forEach((button) => {
    const sel = button.getAttribute("data-target");
    if (!sel) return;
    const target = document.querySelector(sel);
    button.addEventListener("click", () => {
      if (target) {
        target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "center" });
      }
    });
  });

  const activate = (index) => {
    progressButtons.forEach((btn, idx) => {
      btn.classList.toggle("is-active", idx === index);
    });
    sections.forEach((section, idx) => {
      section.classList.toggle("is-active-section", idx === index);
    });
    const sectionId = sections[index]?.id;
    if (sectionId) {
      const key = sectionLayerMap[sectionId];
      if (key) {
        syncLayerHighlight(key);
      }
    }
  };

  if (window.ScrollTrigger && window.gsap && !prefersReducedMotion.matches) {
    window.gsap.utils.toArray(sections).forEach((section, index) => {
      const st = window.ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => activate(index),
        onEnterBack: () => activate(index),
      });
      state.teardownFns.push(() => st.kill());
    });
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target);
            if (idx >= 0) activate(idx);
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((section) => observer.observe(section));
    state.teardownFns.push(() => observer.disconnect());
  }
}

function setupReveals() {
  const revealTargets = Array.from(
    new Set([
      ...document.querySelectorAll(
        ".section-header, .card, .layers-map li, .timeline li, .integration-icon, .progress-bar, .flip-card, .stack-layer"
      ),
    ])
  );

  revealTargets.forEach((el) => el.classList.add("reveal-item"));

  if (prefersReducedMotion.matches) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  if (window.gsap && window.ScrollTrigger) {
    revealTargets.forEach((el) => {
      const anim = window.gsap.fromTo(
        el,
        { autoAlpha: 0, y: 24, rotateX: 8 },
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        }
      );
      if (anim.scrollTrigger) {
        state.teardownFns.push(() => anim.scrollTrigger.kill());
      }
    });
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    revealTargets.forEach((el) => observer.observe(el));
    state.teardownFns.push(() => observer.disconnect());
  }
}

function animateCounters() {
  if (state.countersTriggered) return;
  state.countersTriggered = true;

  if (!kpiValues.length) return;

  if (window.gsap && !prefersReducedMotion.matches) {
    kpiValues.forEach((node) => {
      const target = Number(node.dataset.target || 0);
      const suffix = node.dataset.suffix || "";
      window.gsap.fromTo(
        { value: 0 },
        { value: target, duration: 1.4, ease: "power2.out" },
        {
          value: target,
          onUpdate: function () {
            const current = this.targets()[0].value;
            node.textContent = `${current.toFixed(suffix === "%" ? 0 : 1)}${suffix}`;
          },
        }
      );
    });
  } else {
    kpiValues.forEach((node) => {
      const target = Number(node.dataset.target || 0);
      const suffix = node.dataset.suffix || "";
      node.textContent = `${target}${suffix}`;
    });
  }
}

function handleKpiReveal() {
  const kpiSection = document.querySelector("#kpis");
  if (!kpiSection) return;
  const trigger = () => animateCounters();

  if (window.ScrollTrigger && window.gsap && !prefersReducedMotion.matches) {
    const st = window.ScrollTrigger.create({
      trigger: kpiSection,
      start: "top 70%",
      once: true,
      onEnter: trigger,
    });
    state.teardownFns.push(() => st.kill());
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trigger();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(kpiSection);
    state.teardownFns.push(() => observer.disconnect());
  }
}

function setupPricingFlips() {
  const cards = document.querySelectorAll(".flip-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flip-active");
    });
    card.addEventListener("keypress", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.classList.toggle("flip-active");
      }
    });
  });
}

function syncLayerHighlight(layerKey) {
  if (!layerKey) return;
  if (docEl.getAttribute("data-3d") === "off") {
    document.querySelectorAll(".layers-map li").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.key === layerKey);
    });
    document.querySelectorAll("[data-fallback-stack] .stack-layer").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.key === layerKey);
    });
  }
  document.dispatchEvent(new CustomEvent("leen-layer-activate", { detail: { key: layerKey } }));
}

function bootFactoryScene() {
  if (typeof window.THREE === "undefined") {
    docEl.setAttribute("data-3d", "off");
    syncLayerHighlight(sectionLayerMap[sections[0]?.id] || "ingestion");
    return;
  }

  try {
    state.factory = initFactoryScene({
      gsap: window.gsap,
      ScrollTrigger: window.ScrollTrigger,
      prefersReducedMotion: prefersReducedMotion.matches,
    });
    if (!state.factory || state.factory.active === false) {
      docEl.setAttribute("data-3d", "off");
      syncLayerHighlight(sectionLayerMap[sections[0]?.id] || "ingestion");
    }
  } catch (error) {
    console.warn("3D scene initialisation failed:", error);
    docEl.setAttribute("data-3d", "off");
    syncLayerHighlight(sectionLayerMap[sections[0]?.id] || "ingestion");
  }
}

function registerResize() {
  window.addEventListener("resize", () => {
    if (state.factory && typeof state.factory.resize === "function") {
      state.factory.resize();
    }
  });
}

function init() {
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }
  setTheme(state.theme);
  setLanguage(state.lang);
  bindToggles();
  applyScrollTargets();
  setupProgressNav();
  setupReveals();
  handleKpiReveal();
  setupPricingFlips();
  bootFactoryScene();
  registerResize();
}

prefersReducedMotion.addEventListener("change", () => {
  state.countersTriggered = false;
  state.teardownFns.forEach((fn) => fn());
  state.teardownFns = [];
  setupProgressNav();
  setupReveals();
  handleKpiReveal();
  if (state.factory && typeof state.factory.setReducedMotion === "function") {
    state.factory.setReducedMotion(prefersReducedMotion.matches);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state.factory && typeof state.factory.refresh === "function") {
    state.factory.refresh();
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
