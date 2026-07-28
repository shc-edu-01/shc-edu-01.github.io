const world = document.querySelector("#game-world");
const statusElement = document.querySelector("#game-status");
const fallback = document.querySelector("#game-fallback");
const introPanel = document.querySelector("#intro-panel");
const interactionPrompt = document.querySelector("#interaction-prompt");
const interactionPromptText = document.querySelector("#interaction-prompt-text");
const interactionPanel = document.querySelector("#interaction-panel");
const interactionClose = document.querySelector("#interaction-close");
const interactionCategory = document.querySelector("#interaction-category");
const interactionTitle = document.querySelector("#interaction-title");
const interactionBody = document.querySelector("#interaction-body");
const interactionDetails = document.querySelector("#interaction-details");
const interactionLink = document.querySelector("#interaction-link");
const chapterContinue = document.querySelector("#chapter-continue");
const questStep = document.querySelector("#quest-step");
const questState = document.querySelector("#quest-state");
const questTitle = document.querySelector("#quest-title");
const questObjective = document.querySelector("#quest-objective");
const progressBar = document.querySelector(".journey-progress");
const progressFill = document.querySelector("#journey-progress-fill");
const followQuest = document.querySelector("#follow-quest");
const mobileInteract = document.querySelector("#mobile-interact");
const chapterButtons = [...document.querySelectorAll(".quest-nav[data-chapter]")];

const chapters = [
  {
    id: "home",
    nav: "Home",
    category: "Prologue · Home",
    title: "The Moon Gate",
    objective: "Meet the Gatekeeper beneath the first constellation.",
    prompt: "Speak with the Gatekeeper",
    body:
      "Every long journey begins by deciding what deserves protection. SeungHyeon Cho follows that question as a security engineer, software builder, and curious explorer.",
    details: [
      "The realm is a playable map of a professional journey.",
      "Each landmark unlocks the next career chapter in chronological order.",
    ],
    color: 0xc9b6ff,
    position: [-5.2, 3.8],
  },
  {
    id: "about",
    nav: "About",
    category: "Chapter I · About",
    title: "The Academy of Foundations",
    objective: "Follow the path to the Academy of Foundations.",
    prompt: "Read the Academy ledger",
    body:
      "At Sejong University, from 2014 to 2020, foundations in computer and information security became a practical craft: understand systems deeply, question assumptions, and make defenses usable.",
    details: [
      "Computer and Information Security",
      "A foundation for security research and software engineering",
    ],
    color: 0x8fe3d1,
    position: [-3.2, 0.7],
  },
  {
    id: "research",
    nav: "Research",
    category: "Chapter II · Research",
    title: "The Frontier Observatory",
    objective: "Seek the researcher at the Frontier Observatory.",
    prompt: "Consult the Observatory",
    body:
      "From 2016 to 2019 at Grayhash, SeungHyeon worked in security research and assessment. The public version of this chapter stays intentionally broad: learning how real systems fail, communicating risk, and helping teams strengthen their defenses.",
    details: [
      "Security assessment and vulnerability research",
      "Work spanned devices, applications, and online services",
      "Customer and project specifics remain confidential",
    ],
    color: 0x75c9ff,
    position: [-0.6, -2.9],
  },
  {
    id: "experience",
    nav: "Experience",
    category: "Chapter III · Experience",
    title: "The Citadel of Trusted Systems",
    objective: "Enter the Citadel of Trusted Systems.",
    prompt: "Meet the Citadel Architect",
    body:
      "At Samsung Electronics from 2020 onward, SeungHyeon has worked on mobile and platform security. The mission is to turn demanding security requirements into dependable software components and engineering workflows.",
    details: [
      "Mobile and platform security engineering",
      "Secure components, communication layers, and delivery workflows",
      "Sensitive internal initiatives are deliberately described at a high level",
    ],
    color: 0xffd782,
    position: [2.5, -1.1],
  },
  {
    id: "projects",
    nav: "Projects",
    category: "Chapter IV · Projects",
    title: "The Rune Workshop",
    objective: "Inspect the craft preserved in the Rune Workshop.",
    prompt: "Inspect the Rune Workshop",
    body:
      "The workshop represents a portfolio of security-focused software rather than named confidential projects: building trusted components, automating verification, and shaping clearer development practices.",
    details: [
      "Python, Go, Java, C, JavaScript, and TypeScript",
      "Secure coding, vulnerability analysis, CI/CD, containers, and infrastructure tooling",
      "Selected competition and research recognition informs the craft",
    ],
    color: 0xff9f76,
    position: [5.0, 2.1],
  },
  {
    id: "contact",
    nav: "Contact",
    category: "Epilogue · Contact",
    title: "The Starbound Post",
    objective: "Reach the Starbound Post and complete the journey.",
    prompt: "Open the Starbound Post",
    body:
      "You have reached the edge of the public map. If the journey sparked a useful question, send a message to arrange an interview or request a detailed CV.",
    details: [
      "Detailed work is available through a direct conversation",
      "Only the public email address is shared on this site",
    ],
    color: 0xe4a7ff,
    position: [2.2, 4.8],
    email: true,
  },
];

const setStatus = (message, state) => {
  if (statusElement) statusElement.textContent = message;
  if (world && state) world.dataset.state = state;
};

const readProgress = () => {
  try {
    const value = Number(localStorage.getItem("shc-rpg-progress"));
    return Number.isInteger(value) && value >= 0 && value <= chapters.length ? value : 0;
  } catch {
    return 0;
  }
};

let completedCount = readProgress();
let viewedChapter = Math.min(completedCount, chapters.length - 1);
let realmReady = false;
let journeyStarted = false;
let panelOpen = false;
let focusBeforePanel = null;
let travelToChapter = null;
let openNearbyChapter = null;
let focusCanvas = null;

const saveProgress = () => {
  try {
    localStorage.setItem("shc-rpg-progress", String(completedCount));
  } catch {
    // Progress continues for this visit if storage is unavailable.
  }
};

const currentChapterIndex = () => Math.min(completedCount, chapters.length - 1);

const updateHud = () => {
  const currentIndex = currentChapterIndex();
  const chapter = chapters[currentIndex];
  const complete = completedCount === chapters.length;
  const progress = (completedCount / chapters.length) * 100;

  if (questStep) {
    questStep.textContent = complete
      ? `Journey complete · ${chapters.length} / ${chapters.length}`
      : `Journey ${currentIndex + 1} / ${chapters.length}`;
  }
  if (questState) questState.textContent = complete ? "Realm explored" : "Active quest";
  if (questTitle) questTitle.textContent = chapter.title;
  if (questObjective) {
    questObjective.textContent = complete
      ? "The full public journey is now open. Revisit any chapter or send a message."
      : chapter.objective;
  }
  if (progressFill) progressFill.style.width = `${progress}%`;
  if (progressBar) progressBar.setAttribute("aria-valuenow", String(completedCount));
  if (followQuest) {
    followQuest.disabled = !realmReady;
    followQuest.textContent = complete ? "Return to the Starbound Post" : "Follow the starlight";
  }

  chapterButtons.forEach((button) => {
    const index = Number(button.dataset.chapter);
    const unlocked = index <= currentIndex || complete;
    button.disabled = !unlocked;
    button.title = unlocked ? `Open ${chapters[index].nav}` : "Complete earlier chapters to unlock";
    if (index === currentIndex) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  });
};

const closePanel = () => {
  if (!interactionPanel || !panelOpen) return;
  interactionPanel.hidden = true;
  panelOpen = false;
  focusCanvas?.(false);
  focusBeforePanel?.focus?.({ preventScroll: true });
};

const openChapterPanel = (index) => {
  const chapter = chapters[index];
  if (
    !chapter ||
    !interactionPanel ||
    !interactionCategory ||
    !interactionTitle ||
    !interactionBody ||
    !interactionDetails ||
    !interactionLink ||
    !chapterContinue
  ) {
    return;
  }

  viewedChapter = index;
  focusBeforePanel = document.activeElement;
  interactionCategory.textContent = chapter.category;
  interactionTitle.textContent = chapter.title;
  interactionBody.textContent = chapter.body;
  interactionDetails.replaceChildren(
    ...chapter.details.map((detail) => {
      const item = document.createElement("li");
      item.textContent = detail;
      return item;
    }),
  );
  interactionLink.hidden = !chapter.email;

  const isActive = index === completedCount && completedCount < chapters.length;
  chapterContinue.textContent = isActive
    ? index === chapters.length - 1
      ? "Complete the journey"
      : "Unlock the next chapter"
    : "Return to the realm";

  interactionPanel.hidden = false;
  if (interactionPrompt) interactionPrompt.hidden = true;
  panelOpen = true;
  focusCanvas?.(true);
  chapterContinue.focus({ preventScroll: true });
};

const completeViewedChapter = () => {
  if (viewedChapter === completedCount && completedCount < chapters.length) {
    completedCount += 1;
    saveProgress();
    updateHud();
    window.dispatchEvent(
      new CustomEvent("rpg:progress", {
        detail: { completed: completedCount, total: chapters.length },
      }),
    );
  }
  closePanel();
};

const handleChapterRequest = (index) => {
  if (!Number.isInteger(index) || index < 0 || index >= chapters.length) return;
  const maxUnlocked = currentChapterIndex();
  if (index > maxUnlocked && completedCount < chapters.length) {
    setStatus("That chapter is sealed · complete the active quest first");
    return;
  }
  introPanel?.setAttribute("hidden", "");
  journeyStarted = true;
  if (index < completedCount || completedCount === chapters.length) {
    openChapterPanel(index);
  } else {
    travelToChapter?.(index);
  }
};

chapterContinue?.addEventListener("click", completeViewedChapter);
interactionClose?.addEventListener("click", closePanel);
interactionPanel?.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [
    ...interactionPanel.querySelectorAll("a[href]:not([hidden]), button:not([disabled])"),
  ];
  if (!focusable.length) return;
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

followQuest?.addEventListener("click", () => {
  introPanel?.setAttribute("hidden", "");
  journeyStarted = true;
  travelToChapter?.(currentChapterIndex());
});

mobileInteract?.addEventListener("click", () => openNearbyChapter?.());

window.addEventListener("rpg:start", () => {
  journeyStarted = true;
  updateHud();
  focusCanvas?.(false);
});

window.addEventListener("rpg:resume", () => {
  journeyStarted = true;
  closePanel();
  focusCanvas?.(false);
});

window.addEventListener("rpg:chapter-request", (event) => {
  handleChapterRequest(Number(event.detail?.index));
});

const makeWizard = (THREE) => {
  const wizard = new THREE.Group();
  wizard.name = "traveler";
  const robe = new THREE.MeshToonMaterial({ color: 0x7051c3 });
  const trim = new THREE.MeshToonMaterial({ color: 0xd8c8ff });
  const skin = new THREE.MeshToonMaterial({ color: 0xf0c7a5 });
  const wood = new THREE.MeshToonMaterial({ color: 0x6d432d });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.35, 8), robe);
  body.position.y = 0.72;
  wizard.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 10), skin);
  head.position.y = 1.5;
  wizard.add(head);

  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.43, 0.95, 10), robe);
  hat.position.set(0.06, 2.02, 0);
  hat.rotation.z = -0.15;
  wizard.add(hat);

  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.08, 14), trim);
  brim.position.y = 1.76;
  wizard.add(brim);

  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.8, 7), wood);
  staff.position.set(0.57, 0.95, 0);
  staff.rotation.z = -0.1;
  wizard.add(staff);

  const orb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.13),
    new THREE.MeshToonMaterial({ color: 0xbfe9ff, emissive: 0x355b7a }),
  );
  orb.position.set(0.66, 1.85, 0);
  wizard.add(orb);
  return wizard;
};

const makeLandmark = (THREE, chapter, index) => {
  const landmark = new THREE.Group();
  landmark.name = chapter.id;
  landmark.position.set(chapter.position[0], 0, chapter.position[1]);

  const stone = new THREE.MeshToonMaterial({ color: 0x323b63 });
  const darkStone = new THREE.MeshToonMaterial({ color: 0x1c2344 });
  const glow = new THREE.MeshToonMaterial({
    color: chapter.color,
    emissive: new THREE.Color(chapter.color).multiplyScalar(0.26),
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.95, 0.34, 10), stone);
  base.position.y = 0.17;
  landmark.add(base);

  if (index === 0 || index === 5) {
    [-0.58, 0.58].forEach((x) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.75, 8), darkStone);
      pillar.position.set(x, 1.18, 0);
      landmark.add(pillar);
    });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.13, 8, 20, Math.PI), glow);
    arch.position.y = 1.95;
    arch.rotation.z = Math.PI;
    landmark.add(arch);
  } else if (index === 1) {
    const hall = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.2, 1.05), darkStone);
    hall.position.y = 0.92;
    landmark.add(hall);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.75, 4), glow);
    roof.position.y = 1.88;
    roof.rotation.y = Math.PI / 4;
    landmark.add(roof);
  } else if (index === 2) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 1.55, 8), darkStone);
    column.position.y = 0.95;
    landmark.add(column);
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.13, 8, 24), glow);
    lens.position.y = 1.8;
    lens.rotation.y = Math.PI / 2;
    landmark.add(lens);
  } else if (index === 3) {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.82, 2.4, 8), darkStone);
    tower.position.y = 1.35;
    landmark.add(tower);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.1, 8), glow);
    roof.position.y = 3.05;
    landmark.add(roof);
  } else {
    const forge = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.75, 8), darkStone);
    forge.position.y = 0.57;
    landmark.add(forge);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.11, 8, 22), glow);
    ring.position.y = 1.42;
    ring.rotation.x = Math.PI / 2;
    landmark.add(ring);
    const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28), glow);
    core.position.y = 1.42;
    landmark.add(core);
  }

  const beacon = new THREE.Mesh(
    new THREE.RingGeometry(0.88, 1.02, 28),
    new THREE.MeshBasicMaterial({
      color: chapter.color,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    }),
  );
  beacon.rotation.x = -Math.PI / 2;
  beacon.position.y = 0.04;
  beacon.name = "quest-beacon";
  landmark.add(beacon);
  landmark.userData.beacon = beacon;
  landmark.userData.chapterIndex = index;
  return landmark;
};

const startRealm = async () => {
  if (!world || !fallback) return;

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
    scene.fog = new THREE.Fog(0x080b20, 14, 31);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(11.5, 11.5, 14.5);
    camera.lookAt(0, 0.8, 0.6);

    scene.add(new THREE.HemisphereLight(0x94a7ff, 0x111324, 2.6));
    const moon = new THREE.DirectionalLight(0xe2d8ff, 3.8);
    moon.position.set(-8, 13, 9);
    moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    scene.add(moon);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(10.3, 56),
      new THREE.MeshToonMaterial({ color: 0x17233c }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const pathMaterial = new THREE.MeshToonMaterial({ color: 0x30365a });
    chapters.slice(0, -1).forEach((chapter, index) => {
      const next = chapters[index + 1];
      const start = new THREE.Vector2(...chapter.position);
      const end = new THREE.Vector2(...next.position);
      const center = start.clone().add(end).multiplyScalar(0.5);
      const path = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15, start.distanceTo(end)),
        pathMaterial,
      );
      path.rotation.x = -Math.PI / 2;
      path.rotation.z = -Math.atan2(end.y - start.y, end.x - start.x) - Math.PI / 2;
      path.position.set(center.x, 0.012, center.y);
      scene.add(path);
    });

    const landmarks = chapters.map((chapter, index) => {
      const root = makeLandmark(THREE, chapter, index);
      root.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
          object.userData.chapterIndex = index;
        }
      });
      scene.add(root);
      return { index, root };
    });
    const landmarkMeshes = landmarks.flatMap(({ root }) => {
      const meshes = [];
      root.traverse((object) => {
        if (object.isMesh) meshes.push(object);
      });
      return meshes;
    });

    const wizard = makeWizard(THREE);
    wizard.position.set(-6.35, 0, 4.8);
    wizard.traverse((object) => {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(wizard);

    const crystals = new THREE.Group();
    const crystalMaterial = new THREE.MeshToonMaterial({
      color: 0x79cfff,
      emissive: 0x173e65,
    });
    [
      [-6.8, 0.3, 0.2],
      [-1.8, 0.42, 4.8],
      [1.2, 0.35, 1.7],
      [5.9, 0.46, -2.4],
      [6.4, 0.32, 5.2],
      [-4.7, 0.38, -4.5],
    ].forEach(([x, y, z], index) => {
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.25 + (index % 3) * 0.06),
        crystalMaterial,
      );
      crystal.position.set(x, y, z);
      crystal.userData.baseY = y;
      crystals.add(crystal);
    });
    scene.add(crystals);

    const destinationMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.44, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffd782,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      }),
    );
    destinationMarker.rotation.x = -Math.PI / 2;
    destinationMarker.position.y = 0.04;
    destinationMarker.visible = false;
    scene.add(destinationMarker);

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
    const playRadius = 8.4;
    const interactionRange = 1.65;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let hasDestination = false;
    let pendingChapter = null;
    let nearestUnlocked = null;

    const setDestinationForChapter = (index) => {
      const target = landmarks[index]?.root;
      if (!target) return;
      destination.copy(target.position);
      destination.y = 0;
      destinationMarker.position.set(destination.x, 0.04, destination.z);
      destinationMarker.visible = true;
      hasDestination = true;
      pendingChapter = index;
      setStatus(`Following starlight · ${chapters[index].title}`);
      renderer.domElement.focus({ preventScroll: true });
    };

    travelToChapter = setDestinationForChapter;
    openNearbyChapter = () => {
      if (nearestUnlocked) openChapterPanel(nearestUnlocked.index);
    };
    focusCanvas = (inert) => {
      renderer.domElement.inert = inert;
      movementKeys.clear();
      if (!inert) renderer.domElement.focus({ preventScroll: true });
    };

    const refreshJourneyState = () => {
      const activeIndex = currentChapterIndex();
      landmarks.forEach(({ index, root }) => {
        const unlocked = index <= activeIndex || completedCount === chapters.length;
        root.userData.beacon.visible = index === activeIndex;
        root.scale.setScalar(unlocked ? 1 : 0.86);
        root.traverse((object) => {
          if (!object.isMesh || !object.material) return;
          object.material.transparent = !unlocked;
          object.material.opacity = unlocked ? 1 : 0.42;
        });
      });
    };

    const refreshNearest = () => {
      const maxUnlocked = currentChapterIndex();
      nearestUnlocked =
        landmarks
          .filter(({ index }) => index <= maxUnlocked || completedCount === chapters.length)
          .map((item) => ({
            ...item,
            distance: wizard.position.distanceTo(item.root.position),
          }))
          .filter((item) => item.distance <= interactionRange)
          .sort((a, b) => a.distance - b.distance)[0] ?? null;

      if (interactionPrompt && interactionPromptText && !panelOpen && journeyStarted) {
        interactionPrompt.hidden = !nearestUnlocked;
        if (nearestUnlocked) {
          interactionPromptText.textContent = chapters[nearestUnlocked.index].prompt;
        }
      }
      if (mobileInteract) mobileInteract.disabled = !nearestUnlocked || panelOpen;

      if (
        pendingChapter !== null &&
        nearestUnlocked?.index === pendingChapter &&
        !panelOpen
      ) {
        const chapterToOpen = pendingChapter;
        pendingChapter = null;
        openChapterPanel(chapterToOpen);
      }
    };

    const isInteractiveTarget = (target) =>
      target instanceof Element &&
      Boolean(target.closest("a, button, input, select, textarea, [contenteditable='true']"));

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (event.key === "Escape" && panelOpen) {
        closePanel();
        event.preventDefault();
        return;
      }
      if (
        (key === "e" || event.key === "Enter") &&
        nearestUnlocked &&
        !panelOpen &&
        !isInteractiveTarget(event.target)
      ) {
        openChapterPanel(nearestUnlocked.index);
        event.preventDefault();
        return;
      }
      if (
        !journeyStarted ||
        panelOpen ||
        !supportedKeys.has(key) ||
        isInteractiveTarget(event.target)
      ) {
        return;
      }
      movementKeys.add(key);
      hasDestination = false;
      pendingChapter = null;
      destinationMarker.visible = false;
      event.preventDefault();
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      if (!supportedKeys.has(key)) return;
      movementKeys.delete(key);
      if (!isInteractiveTarget(event.target)) event.preventDefault();
    });

    document.querySelectorAll("[data-move]").forEach((button) => {
      const keyMap = { up: "w", down: "s", left: "a", right: "d" };
      const key = keyMap[button.dataset.move];
      const press = (event) => {
        if (!journeyStarted || panelOpen) return;
        movementKeys.add(key);
        hasDestination = false;
        pendingChapter = null;
        destinationMarker.visible = false;
        if (event.isTrusted) {
          button.setPointerCapture?.(event.pointerId);
        }
        event.preventDefault();
      };
      const release = (event) => {
        movementKeys.delete(key);
        event.preventDefault();
      };
      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", () => movementKeys.delete(key));
    });

    renderer.domElement.setAttribute(
      "aria-label",
      "Moonlit career RPG. Move with WASD, arrow keys, mouse click, touch, or the on-screen direction pad.",
    );
    renderer.domElement.tabIndex = 0;
    renderer.domElement.addEventListener("pointerdown", (event) => {
      if (!journeyStarted || panelOpen) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const selected = raycaster.intersectObjects(landmarkMeshes, false)[0]?.object;
      const selectedIndex = selected?.userData.chapterIndex;
      if (Number.isInteger(selectedIndex)) {
        const maxUnlocked = currentChapterIndex();
        if (selectedIndex > maxUnlocked && completedCount < chapters.length) {
          setStatus("That landmark is sealed · complete the active quest first");
        } else {
          const target = landmarks[selectedIndex].root;
          if (wizard.position.distanceTo(target.position) <= interactionRange) {
            openChapterPanel(selectedIndex);
          } else {
            setDestinationForChapter(selectedIndex);
          }
        }
        return;
      }

      const hit = raycaster.ray.intersectPlane(groundPlane, destination);
      if (!hit) return;
      if (destination.length() > playRadius) destination.setLength(playRadius);
      destination.y = 0;
      destinationMarker.position.set(destination.x, 0.04, destination.z);
      destinationMarker.visible = true;
      hasDestination = true;
      pendingChapter = null;
      renderer.domElement.focus({ preventScroll: true });
    });

    interactionPrompt?.addEventListener("click", () => {
      if (nearestUnlocked) openChapterPanel(nearestUnlocked.index);
    });

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

    realmReady = true;
    refreshJourneyState();
    updateHud();
    setStatus("Moonlit realm · ready", "ready");

    world.rpgState = {
      getSnapshot: () => ({
        player: {
          x: Number(wizard.position.x.toFixed(3)),
          z: Number(wizard.position.z.toFixed(3)),
        },
        currentChapter: currentChapterIndex(),
        completedCount,
        totalChapters: chapters.length,
        destinationActive: hasDestination,
        nearestInteraction: nearestUnlocked?.index ?? null,
        panelOpen,
        sceneState: world.dataset.state,
      }),
    };

    let previousCompleted = completedCount;
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

      if (!journeyStarted || panelOpen) {
        travelDirection.set(0, 0, 0);
      } else if (keyboardDirection.lengthSq() > 0) {
        travelDirection.copy(keyboardDirection).normalize();
      } else if (hasDestination) {
        travelDirection.subVectors(destination, wizard.position);
        travelDirection.y = 0;
        if (travelDirection.length() < 0.13) {
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
        const speed = reducedMotion.matches ? 3.2 : 4.1;
        wizard.position.addScaledVector(travelDirection, speed * delta);
        if (wizard.position.length() > playRadius) wizard.position.setLength(playRadius);
        wizard.position.y = 0;
        wizard.rotation.y = Math.atan2(travelDirection.x, travelDirection.z);
      }

      if (previousCompleted !== completedCount) {
        previousCompleted = completedCount;
        refreshJourneyState();
      }
      refreshNearest();

      landmarks.forEach(({ index, root }) => {
        const beacon = root.userData.beacon;
        if (beacon.visible && !reducedMotion.matches) {
          const pulse = 1 + Math.sin(elapsed * 2.4) * 0.12;
          beacon.scale.setScalar(pulse);
          beacon.rotation.z = elapsed * 0.25;
        }
        if (index === 4) {
          root.children.forEach((child) => {
            if (child.geometry?.type === "TorusGeometry" && !reducedMotion.matches) {
              child.rotation.z = elapsed * 0.45;
            }
          });
        }
      });

      crystals.children.forEach((crystal, index) => {
        if (!reducedMotion.matches) {
          crystal.rotation.y = elapsed * (0.35 + index * 0.04);
          crystal.position.y =
            crystal.userData.baseY + Math.sin(elapsed * 1.2 + index) * 0.07;
        }
      });

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };
    render();
  } catch (error) {
    realmReady = true;
    updateHud();
    setStatus("3D realm unavailable · guided journal active", "fallback");
    fallback.querySelector("p").textContent =
      "The 3D realm could not open. Use “Follow the starlight” to continue through the accessible career journal.";
    travelToChapter = (index) => openChapterPanel(index);
    followQuest.disabled = false;
    console.warn("RPG scene unavailable", error);
  }
};

updateHud();
startRealm();
