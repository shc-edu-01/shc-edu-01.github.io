const world = document.querySelector("#game-world");
const status = document.querySelector("#game-status");
const fallback = document.querySelector("#game-fallback");
const interactionPrompt = document.querySelector("#interaction-prompt");
const interactionPromptText = document.querySelector("#interaction-prompt-text");
const interactionPanel = document.querySelector("#interaction-panel");
const interactionClose = document.querySelector("#interaction-close");
const interactionCategory = document.querySelector("#interaction-category");
const interactionTitle = document.querySelector("#interaction-title");
const interactionBody = document.querySelector("#interaction-body");
const interactionLink = document.querySelector("#interaction-link");

const interactionContent = {
  experience: {
    category: "Experience",
    title: "The Archivist",
    prompt: "Speak with the Archivist",
    body:
      "SeungHyeon builds secure software components, communication layers, and development workflows for connected devices. Earlier security research work helped teams understand risks across devices, applications, and online services.",
    email: true,
  },
  skills: {
    category: "Skills",
    title: "The Rune Forge",
    prompt: "Inspect the Rune Forge",
    body:
      "The craft combines Python, Go, Java, C, JavaScript, and TypeScript with secure coding, vulnerability analysis, CI/CD, containers, and infrastructure tooling.",
    email: false,
  },
  honors: {
    category: "Honors",
    title: "The Moon Archive",
    prompt: "Read the Moon Archive",
    body:
      "A trail of security competitions and research challenges includes DEF CON CTF finalist appearances, university competition awards, and recognition in software security and cryptography.",
    email: false,
  },
};

const setStatus = (message, state = "loading") => {
  if (status) {
    status.textContent = message;
  }
  if (world) {
    world.dataset.state = state;
  }
};

const makeWizard = (THREE) => {
  const wizard = new THREE.Group();
  wizard.name = "wizard";

  const robeMaterial = new THREE.MeshToonMaterial({ color: 0x7459bf });
  const trimMaterial = new THREE.MeshToonMaterial({ color: 0xd8c8ff });
  const skinMaterial = new THREE.MeshToonMaterial({ color: 0xf0c7a5 });
  const woodMaterial = new THREE.MeshToonMaterial({ color: 0x6d432d });

  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.9, 8), robeMaterial);
  robe.position.y = 1;
  wizard.add(robe);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), skinMaterial);
  head.position.y = 2.08;
  wizard.add(head);

  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.64, 1.4, 12), robeMaterial);
  hat.position.set(0.08, 2.92, 0);
  hat.rotation.z = -0.18;
  wizard.add(hat);

  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.12, 16), trimMaterial);
  brim.position.y = 2.45;
  wizard.add(brim);

  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 2.5, 8), woodMaterial);
  staff.position.set(0.85, 1.35, 0);
  staff.rotation.z = -0.1;
  wizard.add(staff);

  const staffOrb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.2),
    new THREE.MeshToonMaterial({ color: 0xbfe9ff, emissive: 0x355b7a }),
  );
  staffOrb.position.set(0.98, 2.62, 0);
  wizard.add(staffOrb);

  wizard.position.set(-1.4, 0, 0.6);
  return wizard;
};

const makeTower = (THREE) => {
  const tower = new THREE.Group();
  tower.name = "moon-archive";
  const stone = new THREE.MeshToonMaterial({ color: 0x34395f });
  const roof = new THREE.MeshToonMaterial({ color: 0x171a36 });
  const windowMaterial = new THREE.MeshToonMaterial({
    color: 0xffd889,
    emissive: 0x80500f,
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.2, 4.5, 8), stone);
  body.position.y = 2.25;
  tower.add(body);

  const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(1.45, 2.2, 8), roof);
  roofMesh.position.y = 5.4;
  tower.add(roofMesh);

  const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.72), windowMaterial);
  windowMesh.position.set(0, 2.6, 1.03);
  tower.add(windowMesh);

  tower.position.set(3.2, 0, -1.8);
  return tower;
};

const makeArchivist = (THREE) => {
  const archivist = new THREE.Group();
  archivist.name = "archivist";
  const cloak = new THREE.MeshToonMaterial({ color: 0x2f8a88 });
  const feathers = new THREE.MeshToonMaterial({ color: 0xd6e4df });
  const eyes = new THREE.MeshToonMaterial({ color: 0xffd36d, emissive: 0x7f4e0a });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.45, 8), cloak);
  body.position.y = 0.75;
  archivist.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 14, 10), feathers);
  head.position.y = 1.62;
  archivist.add(head);

  [-0.17, 0.17].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), eyes);
    eye.position.set(x, 1.68, 0.42);
    archivist.add(eye);
  });

  archivist.position.set(-3.6, 0, -2.1);
  return archivist;
};

const makeRuneForge = (THREE) => {
  const forge = new THREE.Group();
  forge.name = "rune-forge";
  const stone = new THREE.MeshToonMaterial({ color: 0x3d456a });
  const rune = new THREE.MeshToonMaterial({ color: 0xffa95c, emissive: 0x71340d });

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.95, 0.8, 8), stone);
  pedestal.position.y = 0.4;
  forge.add(pedestal);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.12, 8, 20), rune);
  ring.position.y = 1.2;
  ring.rotation.x = Math.PI / 2;
  forge.add(ring);

  const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28), rune);
  core.position.y = 1.2;
  forge.add(core);

  forge.position.set(2.7, 0, 3);
  return forge;
};

const startRealm = async () => {
  if (!world || !status || !fallback) {
    return;
  }

  try {
    let THREE;
    try {
      THREE = await import("./vendor/three.module.min.js");
    } catch {
      THREE = await import(
        "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js"
      );
    }
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    world.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080b20);
    scene.fog = new THREE.Fog(0x080b20, 12, 27);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(9, 7, 11);
    camera.lookAt(0, 1.3, 0);

    const hemisphere = new THREE.HemisphereLight(0x899cff, 0x151225, 2.2);
    scene.add(hemisphere);

    const moonLight = new THREE.DirectionalLight(0xdacfff, 3.5);
    moonLight.position.set(-6, 10, 7);
    moonLight.castShadow = true;
    scene.add(moonLight);

    const warmLight = new THREE.PointLight(0xffc76e, 18, 9);
    warmLight.position.set(3.1, 3, -0.7);
    scene.add(warmLight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(10, 48),
      new THREE.MeshToonMaterial({ color: 0x17233c }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 18),
      new THREE.MeshToonMaterial({ color: 0x2a3152 }),
    );
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = -0.25;
    path.position.y = 0.012;
    scene.add(path);

    const wizard = makeWizard(THREE);
    wizard.traverse((object) => {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(wizard);

    const destinationMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.42, 24),
      new THREE.MeshBasicMaterial({
        color: 0xc9b6ff,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      }),
    );
    destinationMarker.rotation.x = -Math.PI / 2;
    destinationMarker.position.y = 0.035;
    destinationMarker.visible = false;
    scene.add(destinationMarker);

    const tower = makeTower(THREE);
    tower.traverse((object) => {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(tower);

    const archivist = makeArchivist(THREE);
    archivist.traverse((object) => {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(archivist);

    const runeForge = makeRuneForge(THREE);
    runeForge.traverse((object) => {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(runeForge);

    const interactables = [
      { id: "experience", root: archivist },
      { id: "skills", root: runeForge },
      { id: "honors", root: tower },
    ];
    const interactionMeshes = [];
    interactables.forEach(({ id, root }) => {
      root.traverse((object) => {
        if (object.isMesh) {
          object.userData.interactionId = id;
          interactionMeshes.push(object);
        }
      });
    });

    const crystals = new THREE.Group();
    const crystalMaterial = new THREE.MeshToonMaterial({
      color: 0x84d7ff,
      emissive: 0x1b4768,
    });
    [
      [-4, 0.5, -1.5],
      [1.5, 0.35, -3.2],
      [4.2, 0.45, 2.1],
    ].forEach(([x, y, z], index) => {
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.35 + index * 0.05), crystalMaterial);
      crystal.position.set(x, y, z);
      crystal.userData.baseY = y;
      crystal.rotation.z = 0.22;
      crystals.add(crystal);
    });
    scene.add(crystals);

    const resize = () => {
      const width = Math.max(world.clientWidth, 1);
      const height = Math.max(world.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(world);
    resize();

    const movementKeys = new Set();
    const supportedKeys = new Set([
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "w",
      "a",
      "s",
      "d",
    ]);
    const destination = new THREE.Vector3();
    const travelDirection = new THREE.Vector3();
    const keyboardDirection = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const playRadius = 7.4;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const interactionRange = 1.9;
    let hasDestination = false;
    let nearestInteraction = null;
    let pendingInteractionId = null;
    let panelOpen = false;
    let previouslyFocused = null;

    world.rpgState = {
      getSnapshot: () => ({
        player: {
          x: Number(wizard.position.x.toFixed(3)),
          z: Number(wizard.position.z.toFixed(3)),
        },
        destinationActive: hasDestination,
        nearestInteraction: nearestInteraction?.id ?? null,
        panelOpen,
        sceneState: world.dataset.state,
      }),
    };

    const getInteractable = (id) => interactables.find((item) => item.id === id);

    const closeInteraction = () => {
      if (!interactionPanel || !panelOpen) return;
      interactionPanel.hidden = true;
      panelOpen = false;
      renderer.domElement.inert = false;
      previouslyFocused?.focus?.({ preventScroll: true });
    };

    const openInteraction = (id) => {
      const content = interactionContent[id];
      if (
        !content ||
        !interactionPanel ||
        !interactionCategory ||
        !interactionTitle ||
        !interactionBody ||
        !interactionLink
      ) {
        return;
      }
      previouslyFocused = document.activeElement;
      interactionCategory.textContent = content.category;
      interactionTitle.textContent = content.title;
      interactionBody.textContent = content.body;
      interactionLink.hidden = !content.email;
      interactionPanel.hidden = false;
      if (interactionPrompt) interactionPrompt.hidden = true;
      panelOpen = true;
      renderer.domElement.inert = true;
      movementKeys.clear();
      hasDestination = false;
      pendingInteractionId = null;
      destinationMarker.visible = false;
      interactionClose?.focus({ preventScroll: true });
    };

    const refreshNearestInteraction = () => {
      nearestInteraction =
        interactables
          .map((item) => ({ ...item, distance: wizard.position.distanceTo(item.root.position) }))
          .filter((item) => item.distance <= interactionRange)
          .sort((a, b) => a.distance - b.distance)[0] ?? null;

      if (interactionPrompt && interactionPromptText && !panelOpen) {
        interactionPrompt.hidden = !nearestInteraction;
        if (nearestInteraction) {
          interactionPromptText.textContent = interactionContent[nearestInteraction.id].prompt;
        }
      }

      if (
        pendingInteractionId &&
        nearestInteraction?.id === pendingInteractionId &&
        !panelOpen
      ) {
        openInteraction(pendingInteractionId);
      }
    };

    const isInteractiveTarget = (target) =>
      target instanceof Element &&
      Boolean(target.closest("a, button, input, select, textarea, [contenteditable='true']"));

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (event.key === "Escape" && panelOpen) {
        closeInteraction();
        event.preventDefault();
        return;
      }
      if (
        (key === "e" || event.key === "Enter") &&
        nearestInteraction &&
        !panelOpen &&
        !isInteractiveTarget(event.target)
      ) {
        openInteraction(nearestInteraction.id);
        event.preventDefault();
        return;
      }
      if (!supportedKeys.has(key) || isInteractiveTarget(event.target)) return;
      movementKeys.add(key);
      hasDestination = false;
      destinationMarker.visible = false;
      event.preventDefault();
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      if (!supportedKeys.has(key) || isInteractiveTarget(event.target)) return;
      movementKeys.delete(key);
      event.preventDefault();
    });

    renderer.domElement.setAttribute(
      "aria-label",
      "Fantasy RPG scene. Move with WASD, arrow keys, mouse click, or touch.",
    );
    renderer.domElement.tabIndex = 0;
    renderer.domElement.addEventListener("pointerdown", (event) => {
      if (panelOpen) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const selectedObject = raycaster.intersectObjects(interactionMeshes, false)[0]?.object;
      const selectedId = selectedObject?.userData.interactionId;
      if (selectedId) {
        const selected = getInteractable(selectedId);
        if (selected && wizard.position.distanceTo(selected.root.position) <= interactionRange) {
          openInteraction(selectedId);
        } else if (selected) {
          destination.copy(selected.root.position);
          destination.y = 0;
          if (destination.length() > playRadius) destination.setLength(playRadius);
          destinationMarker.position.set(destination.x, 0.035, destination.z);
          destinationMarker.visible = true;
          hasDestination = true;
          pendingInteractionId = selectedId;
        }
        return;
      }
      const hit = raycaster.ray.intersectPlane(groundPlane, destination);
      if (!hit) return;
      if (destination.length() > playRadius) destination.setLength(playRadius);
      destination.y = 0;
      destinationMarker.position.set(destination.x, 0.035, destination.z);
      destinationMarker.visible = true;
      hasDestination = true;
      pendingInteractionId = null;
      renderer.domElement.focus({ preventScroll: true });
    });

    interactionPrompt?.addEventListener("click", () => {
      if (nearestInteraction) openInteraction(nearestInteraction.id);
    });
    interactionClose?.addEventListener("click", closeInteraction);
    interactionPanel?.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = [...interactionPanel.querySelectorAll("a[href], button:not([disabled])")];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    });

    setStatus("RPG world · scene ready", "ready");
    const clock = new THREE.Clock();

    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      keyboardDirection.set(
        Number(movementKeys.has("d") || movementKeys.has("arrowright")) -
          Number(movementKeys.has("a") || movementKeys.has("arrowleft")),
        0,
        Number(movementKeys.has("s") || movementKeys.has("arrowdown")) -
          Number(movementKeys.has("w") || movementKeys.has("arrowup")),
      );

      if (panelOpen) {
        travelDirection.set(0, 0, 0);
      } else if (keyboardDirection.lengthSq() > 0) {
        travelDirection.copy(keyboardDirection).normalize();
      } else if (hasDestination) {
        travelDirection.subVectors(destination, wizard.position);
        travelDirection.y = 0;
        if (travelDirection.length() < 0.12) {
          hasDestination = false;
          destinationMarker.visible = false;
          travelDirection.set(0, 0, 0);
        } else {
          travelDirection.normalize();
        }
      } else {
        travelDirection.set(0, 0, 0);
      }

      if (travelDirection.lengthSq() > 0) {
        const speed = reducedMotion.matches ? 2.8 : 3.6;
        wizard.position.addScaledVector(travelDirection, speed * delta);
        if (wizard.position.length() > playRadius) wizard.position.setLength(playRadius);
        wizard.position.y = 0;
        wizard.rotation.y = Math.atan2(travelDirection.x, travelDirection.z);
      }

      refreshNearestInteraction();

      crystals.children.forEach((crystal, index) => {
        if (!reducedMotion.matches) {
          crystal.rotation.y = elapsed * (0.35 + index * 0.08);
          crystal.position.y = crystal.userData.baseY + Math.sin(elapsed * 1.2 + index) * 0.08;
        }
      });
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };
    render();
  } catch (error) {
    setStatus("3D realm unavailable · portfolio mode active", "fallback");
    fallback.querySelector("p").textContent =
      "The 3D realm could not load. All portfolio information remains available on this page.";
    console.warn("RPG scene unavailable", error);
  }
};

startRealm();
