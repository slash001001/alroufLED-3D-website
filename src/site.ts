import { trackEvent, type AnalyticsEvent } from "./lib/analytics";

function setCurrentYear() {
  const yearNode = document.querySelector<HTMLElement>("[data-year]");
  if (!yearNode) return;
  yearNode.textContent = String(new Date().getFullYear());
}

function initSmoothScroll() {
  const links = document.querySelectorAll<HTMLElement>("[data-scroll-to]");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetSelector = link.dataset.scrollTo;
      if (!targetSelector) return;
      const target = document.querySelector(targetSelector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initAnalytics() {
  const tracked = document.querySelectorAll<HTMLElement>("[data-analytics-event]");
  tracked.forEach((node) => {
    const eventName = node.dataset.analyticsEvent as AnalyticsEvent | undefined;
    if (!eventName) return;
    node.addEventListener("click", () => {
      trackEvent(eventName);
    });
  });
}

function initRevealObserver() {
  const revealables = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!revealables.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) {
    revealables.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
      if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -15% 0px",
      threshold: 0.2
    }
  );

  revealables.forEach((node) => observer.observe(node));
}

function bootstrap() {
  setCurrentYear();
  initSmoothScroll();
  initAnalytics();
  initRevealObserver();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
