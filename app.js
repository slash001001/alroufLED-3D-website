const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const parallaxScenes = [...document.querySelectorAll("[data-parallax]")].map(
  (group) => ({
    element: group,
    layers: [...group.querySelectorAll("[data-depth]")].map((layer) => ({
      element: layer,
      depth: Number(layer.dataset.depth) || 0,
    })),
  })
);

const pointerState = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
};

function applyParallax() {
  pointerState.x += (pointerState.targetX - pointerState.x) * 0.12;
  pointerState.y += (pointerState.targetY - pointerState.y) * 0.12;

  const rotateY = pointerState.x * 10;
  const rotateX = pointerState.y * -10;

  parallaxScenes.forEach(({ layers }) => {
    layers.forEach(({ element, depth }) => {
      element.style.transform = `translate3d(${pointerState.x * depth * 60}px, ${
        pointerState.y * depth * 60
      }px, ${depth * 90}px) rotateX(${rotateX * depth}deg) rotateY(${
        rotateY * depth
      }deg)`;
    });
  });

  if (
    Math.abs(pointerState.targetX - pointerState.x) > 0.001 ||
    Math.abs(pointerState.targetY - pointerState.y) > 0.001
  ) {
    requestAnimationFrame(applyParallax);
  }
}

function handlePointerMove(event) {
  if (prefersReducedMotion.matches) return;
  const { clientX, clientY } =
    event.type.startsWith("touch") && event.touches.length
      ? event.touches[0]
      : event;

  pointerState.targetX = (clientX / window.innerWidth - 0.5) * 2;
  pointerState.targetY = (clientY / window.innerHeight - 0.5) * 2;

  requestAnimationFrame(applyParallax);
}

function resetPointer() {
  pointerState.targetX = 0;
  pointerState.targetY = 0;
  requestAnimationFrame(applyParallax);
}

function initParallax() {
  if (!parallaxScenes.length || prefersReducedMotion.matches) return;
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerleave", resetPointer);
  window.addEventListener("touchmove", handlePointerMove, { passive: true });
  window.addEventListener("touchend", resetPointer);
}

function initRevealObserver() {
  const revealables = document.querySelectorAll("[data-reveal]");
  if (!revealables.length) return;

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
      threshold: 0.2,
      rootMargin: "0px 0px -10%",
    }
  );

  revealables.forEach((element) => observer.observe(element));
}

function initTiltCards() {
  if (prefersReducedMotion.matches) return;

  const cards = document.querySelectorAll("[data-tilt]");
  cards.forEach((card) => {
    const maxTilt = 10;

    function handleTilt(event) {
      const bounds = card.getBoundingClientRect();
      const offsetX = event.clientX - bounds.left;
      const offsetY = event.clientY - bounds.top;
      const normX = offsetX / bounds.width - 0.5;
      const normY = offsetY / bounds.height - 0.5;

      card.style.transform = `rotateY(${normX * maxTilt}deg) rotateX(${
        -normY * maxTilt
      }deg) translateZ(12px)`;
    }

    function resetTilt() {
      card.style.transform = "rotateY(0deg) rotateX(0deg)";
    }

    card.addEventListener("pointermove", handleTilt);
    card.addEventListener("pointerleave", resetTilt);
  });
}

function initScrollTo() {
  document.querySelectorAll("[data-scroll-to]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetSelector = trigger.getAttribute("data-scroll-to");
      const target = targetSelector
        ? document.querySelector(targetSelector)
        : null;
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function setCurrentYear() {
  const yearNode = document.querySelector("[data-year]");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

function init() {
  setCurrentYear();
  initRevealObserver();
  initScrollTo();
  initParallax();
  initTiltCards();
}

init();

prefersReducedMotion.addEventListener("change", () => {
  resetPointer();
  init();
});
