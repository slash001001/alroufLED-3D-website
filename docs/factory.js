const layerKeys = [
  "ingestion",
  "qa",
  "index",
  "pdpl",
  "reasoning",
  "channels",
  "monitoring",
];

const layerColors = {
  ingestion: 0x0a84ff,
  qa: 0x13a9ff,
  index: 0x18c4e8,
  pdpl: 0x00c7c7,
  reasoning: 0x5bffe3,
  channels: 0x7ddfff,
  monitoring: 0xb0f3ff,
};

export function initFactoryScene({ gsap, ScrollTrigger, prefersReducedMotion }) {
  if (typeof window === "undefined" || typeof window.THREE === "undefined") {
    return { active: false };
  }

  const canvas = document.getElementById("factory3D");
  if (!canvas) {
    return { active: false };
  }

  const {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    PointLight,
    Group,
    BoxGeometry,
    MeshStandardMaterial,
    MeshBasicMaterial,
    Mesh,
    TorusGeometry,
    CylinderGeometry,
    SphereGeometry,
    Vector3,
    Clock,
  } = window.THREE;

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, -18, 120);
  camera.lookAt(new Vector3(0, 30, 0));

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ambientLight = new AmbientLight(0x8cb5ff, 1.2);
  scene.add(ambientLight);

  const pointLightTop = new PointLight(0x0a84ff, 2.2, 320);
  pointLightTop.position.set(-50, 80, 90);
  const pointLightBottom = new PointLight(0x00c7c7, 1.6, 260);
  pointLightBottom.position.set(60, -40, -60);
  scene.add(pointLightTop, pointLightBottom);

  const layerGroup = new Group();
  scene.add(layerGroup);

  const layers = [];
  const glowGroup = new Group();
  scene.add(glowGroup);

  const layerGeometry = new BoxGeometry(36, 1.2, 24);
  const glowGeometry = new TorusGeometry(20, 0.45, 28, 90);
  const connectorGeometry = new CylinderGeometry(0.45, 0.45, 12, 24, 1, true);

  const layerSpacing = 12;

  layerKeys.forEach((key, index) => {
    const color = layerColors[key] ?? 0x0a84ff;
    const material = new MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.14,
      metalness: 0.5,
      roughness: 0.35,
      transparent: true,
      opacity: 0.85,
    });
    const layerMesh = new Mesh(layerGeometry, material);
    layerMesh.position.set(0, index * layerSpacing, 0);
    layerMesh.userData = {
      key,
      baseEmissive: material.emissiveIntensity,
    };
    layerGroup.add(layerMesh);

    const glowMaterial = new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.12,
    });
    const glowMesh = new Mesh(glowGeometry, glowMaterial);
    glowMesh.rotation.x = Math.PI / 2;
    glowMesh.position.set(0, layerMesh.position.y + 0.2, 0);
    glowGroup.add(glowMesh);
    glowMesh.visible = false;

    layers.push({
      key,
      mesh: layerMesh,
      glow: glowMesh,
      material,
    });

    if (index > 0) {
      const connectorMaterial = new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.22,
      });
      const connector = new Mesh(connectorGeometry, connectorMaterial);
      connector.position.set(0, layerMesh.position.y - layerSpacing / 2, 0);
      layerGroup.add(connector);
    }
  });

  const particleGroup = new Group();
  scene.add(particleGroup);
  const particleGeometry = new SphereGeometry(0.4, 8, 8);
  const particleMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.65,
  });

  const particles = [];
  const particleCount = prefersReducedMotion ? 40 : 110;
  const particleBounds = {
    minY: -16,
    maxY: (layerKeys.length - 1) * layerSpacing + 18,
  };

  for (let i = 0; i < particleCount; i += 1) {
    const particle = new Mesh(particleGeometry, particleMaterial.clone());
    resetParticle(particle, particleBounds, Math.random() * particleBounds.maxY);
    const speed = 6 + Math.random() * 14;
    particleGroup.add(particle);
    particles.push({ mesh: particle, speed });
  }

  const clock = new Clock();
  let reduced = prefersReducedMotion;
  let activeKey = null;
  let targetCamera = {
    y: camera.position.y,
    z: camera.position.z,
  };

  function resetParticle(mesh, bounds, startY) {
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      typeof startY === "number" ? startY : bounds.minY,
      (Math.random() - 0.5) * 10
    );
  }

  function updateParticles(delta) {
    if (reduced) return;
    const boost = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.05;
    particles.forEach((item) => {
      item.mesh.position.y += item.speed * delta * boost;
      if (item.mesh.position.y > particleBounds.maxY) {
        resetParticle(item.mesh, particleBounds, particleBounds.minY);
      }
    });
  }

  function pulseGlows(delta) {
    if (reduced) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.2) * 0.06;
    glowGroup.children.forEach((glow) => {
      glow.scale.setScalar(pulse);
    });
  }

  function smoothCamera(delta) {
    const ease = reduced ? 0.1 : 0.06;
    camera.position.y += (targetCamera.y - camera.position.y) * ease * (delta * 60);
    camera.position.z += (targetCamera.z - camera.position.z) * ease * (delta * 60);
    camera.lookAt(0, 35, 0);
  }

  function setActiveLayer(key, focusY) {
    if (activeKey === key) return;
    activeKey = key;

    layers.forEach((layer) => {
      const isActive = layer.key === key;
      layer.material.emissiveIntensity = isActive ? 0.6 : layer.mesh.userData.baseEmissive;
      layer.glow.visible = isActive;
      layer.glow.material.opacity = isActive ? 0.32 : 0.12;
    });

    highlightUiLayer(key);

    const baseZ = 120;
    const zOffset = focusY * 0.55;
    if (gsap && !reduced) {
      gsap.to(targetCamera, {
        y: focusY - 10,
        z: baseZ - zOffset,
        duration: 1.2,
        ease: "power3.out",
      });
    } else {
      targetCamera.y = focusY - 10;
      targetCamera.z = baseZ - zOffset;
    }
  }

  function highlightUiLayer(key) {
    const mapItems = document.querySelectorAll(".layers-map li");
    mapItems.forEach((item) => {
      item.classList.toggle("is-active", item.dataset.key === key);
    });
    const fallbackLayers = document.querySelectorAll("[data-fallback-stack] .stack-layer");
    fallbackLayers.forEach((item) => {
      item.classList.toggle("is-active", item.dataset.key === key);
    });
  }

  function buildScrollMapping() {
    const mapping = [
      { id: "#hero", key: "ingestion" },
      { id: "#vision", key: "qa" },
      { id: "#layers", key: "index" },
      { id: "#services", key: "pdpl" },
      { id: "#pdpl", key: "reasoning" },
      { id: "#integrations", key: "channels" },
      { id: "#scope", key: "monitoring" },
    ];

    const triggers = [];

    mapping.forEach((entry, index) => {
      const section = document.querySelector(entry.id);
      const layer = layers.find((item) => item.key === entry.key);
      if (!section || !layer) return;
      const focusY = layer.mesh.position.y;

      const activateLayer = () => setActiveLayer(entry.key, focusY);

      if (ScrollTrigger && gsap && !prefersReducedMotion) {
        gsap.registerPlugin(ScrollTrigger);
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: activateLayer,
          onEnterBack: activateLayer,
        });
        triggers.push(st);
      } else {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((obsEntry) => {
              if (obsEntry.isIntersecting) {
                activateLayer();
              }
            });
          },
          { threshold: 0.5 }
        );
        observer.observe(section);
        triggers.push({ kill: () => observer.disconnect() });
      }
    });

    return () => {
      triggers.forEach((trigger) => {
        if (trigger.kill) trigger.kill();
      });
    };
  }

  const destroyScroll = buildScrollMapping();
  const externalLayerHandler = (event) => {
    const key = event.detail?.key;
    if (!key) return;
    const layer = layers.find((item) => item.key === key);
    if (!layer) return;
    setActiveLayer(key, layer.mesh.position.y);
  };
  document.addEventListener("leen-layer-activate", externalLayerHandler);
  setActiveLayer("ingestion", 0);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function setReducedMotion(value) {
    reduced = value;
  }

  function refresh() {
    if (ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  function renderLoop() {
    const delta = clock.getDelta();
    updateParticles(delta);
    pulseGlows(delta);
    smoothCamera(delta);
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(renderLoop);

  return {
    active: true,
    resize,
    setReducedMotion,
    refresh,
    destroy: () => {
      destroyScroll();
      document.removeEventListener("leen-layer-activate", externalLayerHandler);
      renderer.dispose();
    },
  };
}
