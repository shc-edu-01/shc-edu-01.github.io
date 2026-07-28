const world = document.querySelector("#game-world");
const statusElement = document.querySelector("#game-status");
const fallback = document.querySelector("#game-fallback");
const combatTextLayer = document.querySelector("#combat-text-layer");
const combatAnnouncer = document.querySelector("#combat-announcer");
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
const combatHud = document.querySelector("#combat-hud");
const combatStateLabel = document.querySelector("#combat-state-label");
const shieldMeter = document.querySelector("#shield-meter");
const shieldPips = [...document.querySelectorAll("[data-shield]")];
const mobileInteract = document.querySelector("#mobile-interact");
const mobileAttack = document.querySelector("#mobile-attack");
const chapterButtons = [...document.querySelectorAll(".quest-nav[data-chapter]")];

const achievementHitPhrases = Object.freeze([
  "Security Research",
  "Platform Security",
  "Secure Coding",
  "CTF Finalist",
  "Software Security",
  "Cryptography Prize",
]);
const combatConfig = Object.freeze({
  enemiesPerEncounter: 2,
  hitsPerEnemy: 3,
  playerShield: 3,
  attackCooldownMs: 450,
  attackRange: 2.15,
});
const enemyStates = Object.freeze({
  DORMANT: "DORMANT",
  ACTIVE: "ACTIVE",
  TRACKING: "TRACKING",
  HIT: "HIT",
  DEFEATED: "DEFEATED",
});

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

const readClearedEncounters = () => {
  try {
    const value = JSON.parse(localStorage.getItem("shc-rpg-encounters") || "[]");
    return new Set(
      Array.isArray(value)
        ? value.filter(
            (index) => Number.isInteger(index) && index > 0 && index < chapters.length,
          )
        : [],
    );
  } catch {
    return new Set();
  }
};

let completedCount = readProgress();
const clearedEncounters = readClearedEncounters();
let viewedChapter = Math.min(completedCount, chapters.length - 1);
let realmReady = false;
let journeyStarted = false;
let panelOpen = false;
let focusBeforePanel = null;
let travelToChapter = null;
let openNearbyChapter = null;
let focusCanvas = null;

const combatStates = Object.freeze({
  EXPLORING: "EXPLORING",
  ENGAGED: "ENGAGED",
  ATTACKING: "ATTACKING",
  HIT: "HIT",
  ENCOUNTER_COMPLETE: "ENCOUNTER_COMPLETE",
});
const combatTransitions = Object.freeze({
  EXPLORING: new Set(["ENGAGED"]),
  ENGAGED: new Set(["ATTACKING", "ENCOUNTER_COMPLETE", "EXPLORING"]),
  ATTACKING: new Set(["HIT", "ENGAGED"]),
  HIT: new Set(["ENGAGED", "ENCOUNTER_COMPLETE"]),
  ENCOUNTER_COMPLETE: new Set(["EXPLORING", "ENGAGED"]),
});
let combatState = combatStates.EXPLORING;
let combatTransitionCount = 0;
let attackActionCount = 0;
let attackRecoveryAt = 0;
let playerShield = combatConfig.playerShield;
let encounterRestartCount = 0;
let lastCombatAnnouncementAt = 0;

const canAcceptCombatInput = () =>
  journeyStarted && !panelOpen && Boolean(introPanel?.hidden);

const transitionCombat = (nextState, reason = "system") => {
  if (nextState === combatState) return true;
  if (!combatTransitions[combatState]?.has(nextState)) return false;
  const previousState = combatState;
  combatState = nextState;
  combatTransitionCount += 1;
  window.dispatchEvent(
    new CustomEvent("rpg:combat-state", {
      detail: { previousState, state: combatState, reason },
    }),
  );
  updateCombatHud();
  return true;
};

const announceCombat = (message, minimumGapMs = 380) => {
  if (!combatAnnouncer) return;
  const now = performance.now();
  if (now - lastCombatAnnouncementAt < minimumGapMs) return;
  lastCombatAnnouncementAt = now;
  combatAnnouncer.textContent = message;
};

const isEncounterCleared = (chapterIndex) =>
  chapterIndex === 0 ||
  chapterIndex < completedCount ||
  completedCount === chapters.length ||
  clearedEncounters.has(chapterIndex);

const saveProgress = () => {
  try {
    localStorage.setItem("shc-rpg-progress", String(completedCount));
  } catch {
    // Progress continues for this visit if storage is unavailable.
  }
};

const saveClearedEncounters = () => {
  try {
    localStorage.setItem(
      "shc-rpg-encounters",
      JSON.stringify([...clearedEncounters].sort((a, b) => a - b)),
    );
  } catch {
    // Encounter progress continues for this visit if storage is unavailable.
  }
};

const currentChapterIndex = () => Math.min(completedCount, chapters.length - 1);

const updateCombatHud = () => {
  const currentIndex = currentChapterIndex();
  const complete = completedCount === chapters.length;
  const encounterCleared = isEncounterCleared(currentIndex);
  if (combatHud) {
    combatHud.hidden = currentIndex === 0 || complete;
    combatHud.dataset.state = combatState;
  }
  if (combatStateLabel) {
    combatStateLabel.textContent = encounterCleared
      ? "Path clear"
      : combatState === combatStates.ATTACKING || combatState === combatStates.HIT
        ? "Casting"
        : "Risk Shadows";
  }
  if (shieldMeter) shieldMeter.setAttribute("aria-valuenow", String(playerShield));
  shieldPips.forEach((pip, index) => {
    pip.dataset.active = String(index < playerShield);
  });
};

const updateHud = () => {
  const currentIndex = currentChapterIndex();
  const chapter = chapters[currentIndex];
  const complete = completedCount === chapters.length;
  const encounterPending = !complete && !isEncounterCleared(currentIndex);
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
      : encounterPending
        ? "Dispel the Risk Shadows guarding this chapter."
      : chapter.objective;
  }
  if (progressFill) progressFill.style.width = `${progress}%`;
  if (progressBar) progressBar.setAttribute("aria-valuenow", String(completedCount));
  if (followQuest) {
    followQuest.disabled = !realmReady;
    followQuest.textContent = complete
      ? "Return to the Starbound Post"
      : encounterPending
        ? "Face the Risk Shadows"
        : "Follow the starlight";
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
  updateCombatHud();
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
    index === currentChapterIndex() &&
    completedCount < chapters.length &&
    !isEncounterCleared(index)
  ) {
    setStatus("Risk Shadows guard this chapter · clear the encounter first");
    return;
  }
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

const makeRiskShadow = (THREE, index) => {
  const shadow = new THREE.Group();
  shadow.name = `risk-shadow-${index + 1}`;

  const smoke = new THREE.MeshToonMaterial({
    color: 0x252044,
    transparent: true,
    opacity: 0.92,
  });
  const veil = new THREE.MeshToonMaterial({
    color: 0x49357d,
    emissive: 0x120d2d,
    transparent: true,
    opacity: 0.86,
  });
  const eye = new THREE.MeshToonMaterial({
    color: 0xff8ca7,
    emissive: 0x7a1734,
  });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.25, 9), smoke);
  body.position.y = 0.72;
  shadow.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 10), veil);
  head.position.y = 1.42;
  shadow.add(head);

  [-0.13, 0.13].forEach((x) => {
    const eyeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), eye);
    eyeMesh.position.set(x, 1.48, 0.31);
    shadow.add(eyeMesh);
  });

  const aura = new THREE.Mesh(
    new THREE.RingGeometry(0.48, 0.64, 20),
    new THREE.MeshBasicMaterial({
      color: 0x9c79e8,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
    }),
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.035;
  shadow.add(aura);

  shadow.visible = false;
  shadow.userData.state = enemyStates.DORMANT;
  shadow.userData.hp = combatConfig.hitsPerEnemy;
  shadow.userData.spawn = new THREE.Vector3();
  shadow.userData.aura = aura;
  return shadow;
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

    const riskShadows = Array.from(
      { length: combatConfig.enemiesPerEncounter },
      (_, index) => makeRiskShadow(THREE, index),
    );
    riskShadows.forEach((enemy, enemyIndex) => {
      enemy.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
          object.userData.enemyIndex = enemyIndex;
        }
      });
      scene.add(enemy);
    });
    const enemyMeshes = riskShadows.flatMap((enemy) => {
      const meshes = [];
      enemy.traverse((object) => {
        if (object.isMesh) meshes.push(object);
      });
      return meshes;
    });

    const setEnemyState = (enemy, nextState) => {
      if (!Object.values(enemyStates).includes(nextState)) return false;
      enemy.userData.state = nextState;
      enemy.visible = nextState !== enemyStates.DORMANT && nextState !== enemyStates.DEFEATED;
      return true;
    };

    const retireEnemies = () => {
      riskShadows.forEach((enemy) => setEnemyState(enemy, enemyStates.DORMANT));
    };

    const placeEnemiesForChapter = (chapterIndex) => {
      clearTransientCombatEffects();
      if (
        chapterIndex <= 0 ||
        chapterIndex >= chapters.length ||
        isEncounterCleared(chapterIndex)
      ) {
        retireEnemies();
        if (combatState === combatStates.ENCOUNTER_COMPLETE) {
          transitionCombat(combatStates.EXPLORING, "chapter-ready");
        } else if (
          combatState === combatStates.ENGAGED ||
          combatState === combatStates.ATTACKING ||
          combatState === combatStates.HIT
        ) {
          if (
            combatState === combatStates.ATTACKING ||
            combatState === combatStates.HIT
          ) {
            transitionCombat(combatStates.ENGAGED, "encounter-retired");
          }
          transitionCombat(combatStates.EXPLORING, "encounter-retired");
        }
        return;
      }
      const [chapterX, chapterZ] = chapters[chapterIndex].position;
      const offsets = [
        [-1.15, 0.75],
        [1.05, -0.7],
      ];
      riskShadows.forEach((enemy, index) => {
        const [offsetX, offsetZ] = offsets[index];
        enemy.position.set(chapterX + offsetX, 0, chapterZ + offsetZ);
        if (enemy.position.length() > 8) enemy.position.setLength(8);
        enemy.userData.spawn.copy(enemy.position);
        enemy.userData.hp = combatConfig.hitsPerEnemy;
        enemy.userData.lastHitAction = null;
        setEnemyState(enemy, enemyStates.ACTIVE);
      });
      playerShield = combatConfig.playerShield;
      if (combatState === combatStates.ENCOUNTER_COMPLETE) {
        transitionCombat(combatStates.ENGAGED, "next-encounter");
      } else if (combatState === combatStates.EXPLORING) {
        transitionCombat(combatStates.ENGAGED, "encounter-active");
      } else if (
        combatState === combatStates.ATTACKING ||
        combatState === combatStates.HIT
      ) {
        transitionCombat(combatStates.ENGAGED, "encounter-reset");
      }
      updateHud();
    };

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

    const attackPulse = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.5, 28),
      new THREE.MeshBasicMaterial({
        color: 0xd8c6ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      }),
    );
    attackPulse.rotation.x = -Math.PI / 2;
    attackPulse.visible = false;
    attackPulse.userData.startedAt = 0;
    scene.add(attackPulse);

    const hitParticleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd782,
      transparent: true,
      opacity: 0.9,
    });
    const hitParticles = Array.from({ length: 12 }, (_, index) => {
      const particle = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.055 + (index % 3) * 0.012),
        hitParticleMaterial.clone(),
      );
      particle.visible = false;
      particle.userData.velocity = new THREE.Vector3();
      particle.userData.expiresAt = 0;
      scene.add(particle);
      return particle;
    });

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
    let pendingAttackEnemy = null;
    let nearestUnlocked = null;

    const setDestinationForChapter = (index) => {
      const target = landmarks[index]?.root;
      if (!target) return;
      const activeEnemy =
        index === currentChapterIndex() && !isEncounterCleared(index)
          ? riskShadows.find((enemy) => enemy.visible)
          : null;
      destination.copy(activeEnemy?.position ?? target.position);
      destination.y = 0;
      destinationMarker.position.set(destination.x, 0.04, destination.z);
      destinationMarker.visible = true;
      hasDestination = true;
      pendingChapter = index;
      setStatus(
        activeEnemy
          ? `Encounter active · dispel the Risk Shadows`
          : `Following starlight · ${chapters[index].title}`,
      );
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
      const encounterBlocksInteractions =
        completedCount < chapters.length && !isEncounterCleared(maxUnlocked);
      nearestUnlocked = encounterBlocksInteractions
        ? null
        : landmarks
          .filter(
            ({ index }) =>
              (index <= maxUnlocked || completedCount === chapters.length) &&
              (index !== maxUnlocked ||
                completedCount === chapters.length ||
                isEncounterCleared(index)),
          )
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
      if (mobileAttack) {
        mobileAttack.disabled =
          panelOpen ||
          !journeyStarted ||
          !riskShadows.some(
            (enemy) =>
              enemy.visible &&
              enemy.position.distanceTo(wizard.position) <= combatConfig.attackRange,
          );
      }

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

    const nearestAttackableEnemy = () =>
      riskShadows
        .map((enemy, index) => ({
          enemy,
          index,
          distance: enemy.position.distanceTo(wizard.position),
        }))
        .filter(
          ({ enemy, distance }) =>
            enemy.visible &&
            enemy.userData.state !== enemyStates.DEFEATED &&
            distance <= combatConfig.attackRange,
        )
        .sort((a, b) => a.distance - b.distance)[0] ?? null;

    let attackHitCount = 0;
    let achievementPhraseIndex = 0;
    const floatingCombatTexts = [];
    const maxFloatingCombatTexts = 8;
    const floatingCombatTextLifetimeMs = 1100;

    const removeFloatingCombatText = (entry) => {
      entry.element.remove();
      const index = floatingCombatTexts.indexOf(entry);
      if (index >= 0) floatingCombatTexts.splice(index, 1);
    };

    const clearTransientCombatEffects = () => {
      attackPulse.visible = false;
      attackPulse.material.opacity = 0;
      hitParticles.forEach((particle) => {
        particle.visible = false;
        particle.material.opacity = 0;
      });
      floatingCombatTexts.slice().forEach(removeFloatingCombatText);
    };

    const spawnAchievementHitText = (enemy) => {
      if (!combatTextLayer) return;
      while (floatingCombatTexts.length >= maxFloatingCombatTexts) {
        removeFloatingCombatText(floatingCombatTexts[0]);
      }
      const phrase =
        achievementHitPhrases[achievementPhraseIndex % achievementHitPhrases.length];
      achievementPhraseIndex += 1;
      announceCombat(`Achievement strike: ${phrase}`);
      const element = document.createElement("span");
      element.className = "achievement-hit-text";
      element.textContent = phrase;
      element.dataset.phrase = phrase;
      combatTextLayer.append(element);
      floatingCombatTexts.push({
        element,
        phrase,
        createdAt: performance.now(),
        worldPosition: enemy.position.clone().add(new THREE.Vector3(0, 2.05, 0)),
        screenPosition: new THREE.Vector3(),
      });
    };

    const triggerHitEffects = (enemy) => {
      const now = performance.now();
      attackPulse.position.set(wizard.position.x, 0.06, wizard.position.z);
      attackPulse.scale.setScalar(1);
      attackPulse.material.opacity = 0.78;
      attackPulse.visible = true;
      attackPulse.userData.startedAt = now;
      enemy.userData.hitFlashUntil = now + 180;

      if (reducedMotion.matches) return;
      const recoil = enemy.position.clone().sub(wizard.position);
      recoil.y = 0;
      if (recoil.lengthSq() > 0) {
        enemy.position.addScaledVector(recoil.normalize(), 0.14);
      }
      hitParticles.forEach((particle, index) => {
        const angle = (index / hitParticles.length) * Math.PI * 2;
        particle.position.copy(enemy.position);
        particle.position.y = 1.05;
        particle.userData.velocity.set(
          Math.cos(angle) * (0.55 + (index % 3) * 0.18),
          0.55 + (index % 4) * 0.14,
          Math.sin(angle) * (0.55 + (index % 2) * 0.2),
        );
        particle.userData.expiresAt = now + 420;
        particle.material.opacity = 0.9;
        particle.visible = true;
      });
    };

    const resolveAttackHit = (enemy, enemyIndex) => {
      if (
        !enemy.visible ||
        enemy.userData.state === enemyStates.DEFEATED ||
        enemy.userData.lastHitAction === attackActionCount ||
        enemy.position.distanceTo(wizard.position) > combatConfig.attackRange
      ) {
        return false;
      }
      enemy.userData.lastHitAction = attackActionCount;
      enemy.userData.hp = Math.max(0, enemy.userData.hp - 1);
      attackHitCount += 1;
      spawnAchievementHitText(enemy);
      triggerHitEffects(enemy);
      setEnemyState(enemy, enemyStates.HIT);
      transitionCombat(combatStates.HIT, "valid-hit");
      window.dispatchEvent(
        new CustomEvent("rpg:hit", {
          detail: {
            enemyIndex,
            remainingHits: enemy.userData.hp,
            hitCount: attackHitCount,
          },
        }),
      );

      if (enemy.userData.hp === 0) {
        setEnemyState(enemy, enemyStates.DEFEATED);
        if (riskShadows.every((riskShadow) => !riskShadow.visible)) {
          const clearedChapter = currentChapterIndex();
          clearedEncounters.add(clearedChapter);
          saveClearedEncounters();
          transitionCombat(combatStates.ENCOUNTER_COMPLETE, "all-shadows-cleared");
          updateHud();
          announceCombat("Encounter cleared. The career chapter is now open.", 0);
          const chapterTarget = landmarks[clearedChapter]?.root;
          if (chapterTarget) {
            destination.copy(chapterTarget.position);
            destination.y = 0;
            destinationMarker.position.set(destination.x, 0.04, destination.z);
            destinationMarker.visible = true;
            hasDestination = true;
            pendingChapter = clearedChapter;
          }
          window.dispatchEvent(
            new CustomEvent("rpg:encounter-complete", {
              detail: { chapterIndex: clearedChapter },
            }),
          );
        }
      }
      return true;
    };

    const beginAttack = (requestedEnemyIndex = null) => {
      const now = performance.now();
      if (!canAcceptCombatInput() || now < attackRecoveryAt) return false;
      const target =
        Number.isInteger(requestedEnemyIndex) &&
        riskShadows[requestedEnemyIndex]?.visible &&
        riskShadows[requestedEnemyIndex].position.distanceTo(wizard.position) <=
          combatConfig.attackRange
          ? { enemy: riskShadows[requestedEnemyIndex], index: requestedEnemyIndex }
          : nearestAttackableEnemy();
      if (!target) return false;
      if (combatState === combatStates.EXPLORING) {
        transitionCombat(combatStates.ENGAGED, "enemy-in-range");
      }
      if (!transitionCombat(combatStates.ATTACKING, "player-attack")) return false;
      attackActionCount += 1;
      attackRecoveryAt = now + combatConfig.attackCooldownMs;
      wizard.rotation.y = Math.atan2(
        target.enemy.position.x - wizard.position.x,
        target.enemy.position.z - wizard.position.z,
      );
      window.dispatchEvent(
        new CustomEvent("rpg:attack", {
          detail: { enemyIndex: target.index, actionCount: attackActionCount },
        }),
      );
      resolveAttackHit(target.enemy, target.index);
      return true;
    };

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (event.key === "Escape" && panelOpen) {
        closePanel();
        event.preventDefault();
        return;
      }
      if (
        event.code === "Space" &&
        !panelOpen &&
        !isInteractiveTarget(event.target)
      ) {
        if (beginAttack()) event.preventDefault();
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
    mobileAttack?.addEventListener("click", () => beginAttack());

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

      const selectedEnemy = raycaster
        .intersectObjects(enemyMeshes, false)
        .find(({ object }) => {
          const enemyIndex = object.userData.enemyIndex;
          return Number.isInteger(enemyIndex) && riskShadows[enemyIndex]?.visible;
        })?.object;
      const selectedEnemyIndex = selectedEnemy?.userData.enemyIndex;
      if (Number.isInteger(selectedEnemyIndex)) {
        const enemy = riskShadows[selectedEnemyIndex];
        if (
          enemy.position.distanceTo(wizard.position) <= combatConfig.attackRange
        ) {
          beginAttack(selectedEnemyIndex);
        } else {
          destination.copy(enemy.position);
          destination.y = 0;
          destinationMarker.position.set(destination.x, 0.04, destination.z);
          destinationMarker.visible = true;
          hasDestination = true;
          pendingAttackEnemy = selectedEnemyIndex;
        }
        return;
      }

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
    placeEnemiesForChapter(currentChapterIndex());
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
        combatState,
        combatTransitionCount,
        combatInputEnabled: canAcceptCombatInput(),
        attackActionCount,
        attackHitCount,
        playerShield,
        encounterRestartCount,
        encounterCleared: isEncounterCleared(currentChapterIndex()),
        clearedEncounters: [...clearedEncounters].sort((a, b) => a - b),
        floatingCombatTexts: floatingCombatTexts.map((entry) => entry.phrase),
        combatPoolCaps: {
          enemies: riskShadows.length,
          particles: hitParticles.length,
          floatingTexts: maxFloatingCombatTexts,
          attackPulses: 1,
          renderLoops: 1,
        },
        combatPoolUsage: {
          activeEnemies: riskShadows.filter((enemy) => enemy.visible).length,
          activeParticles: hitParticles.filter((particle) => particle.visible).length,
          activeFloatingTexts: floatingCombatTexts.length,
          activeAttackPulses: Number(attackPulse.visible),
        },
        enemies: riskShadows.map((enemy) => ({
          state: enemy.userData.state,
          hp: enemy.userData.hp,
          visible: enemy.visible,
          x: Number(enemy.position.x.toFixed(3)),
          z: Number(enemy.position.z.toFixed(3)),
        })),
        destinationActive: hasDestination,
        nearestInteraction: nearestUnlocked?.index ?? null,
        panelOpen,
        sceneState: world.dataset.state,
      }),
    };

    let previousCompleted = completedCount;
    let nextPlayerDamageAt = 0;
    const clock = new THREE.Clock();
    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const now = performance.now();
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
        placeEnemiesForChapter(currentChapterIndex());
        refreshJourneyState();
      }
      refreshNearest();

      if (
        pendingAttackEnemy !== null &&
        riskShadows[pendingAttackEnemy]?.visible &&
        riskShadows[pendingAttackEnemy].position.distanceTo(wizard.position) <=
          combatConfig.attackRange
      ) {
        const targetIndex = pendingAttackEnemy;
        pendingAttackEnemy = null;
        hasDestination = false;
        destinationMarker.visible = false;
        beginAttack(targetIndex);
      }
      if (
        (combatState === combatStates.ATTACKING ||
          combatState === combatStates.HIT) &&
        performance.now() >= attackRecoveryAt
      ) {
        transitionCombat(combatStates.ENGAGED, "attack-recovery");
      }

      riskShadows.forEach((enemy, index) => {
        if (!enemy.visible || panelOpen || !journeyStarted) return;
        const distanceToPlayer = enemy.position.distanceTo(wizard.position);
        if (distanceToPlayer < 5.2 && distanceToPlayer > 1.05) {
          setEnemyState(enemy, enemyStates.TRACKING);
          travelDirection.subVectors(wizard.position, enemy.position);
          travelDirection.y = 0;
          enemy.position.addScaledVector(travelDirection.normalize(), delta * 0.68);
          if (enemy.position.length() > playRadius) enemy.position.setLength(playRadius);
          enemy.rotation.y = Math.atan2(travelDirection.x, travelDirection.z);
        } else if (enemy.userData.state === enemyStates.TRACKING) {
          setEnemyState(enemy, enemyStates.ACTIVE);
        }
        if (
          distanceToPlayer <= 0.82 &&
          now >= nextPlayerDamageAt &&
          combatState !== combatStates.ENCOUNTER_COMPLETE
        ) {
          nextPlayerDamageAt = now + 1200;
          playerShield = Math.max(0, playerShield - 1);
          updateCombatHud();
          announceCombat(
            `Arcane shield weakened. ${playerShield} of ${combatConfig.playerShield} remains.`,
            0,
          );
          setStatus(`Arcane shield · ${playerShield} remaining`);
          window.dispatchEvent(
            new CustomEvent("rpg:player-hit", {
              detail: { shield: playerShield },
            }),
          );
          if (playerShield === 0) {
            encounterRestartCount += 1;
            const chapterIndex = currentChapterIndex();
            const [chapterX, chapterZ] = chapters[chapterIndex].position;
            wizard.position.set(chapterX - 2.8, 0, chapterZ + 2.2);
            if (wizard.position.length() > playRadius) {
              wizard.position.setLength(playRadius);
              wizard.position.y = 0;
            }
            hasDestination = false;
            pendingAttackEnemy = null;
            destinationMarker.visible = false;
            placeEnemiesForChapter(chapterIndex);
            setStatus("Arcane shield restored · encounter restarted");
            announceCombat("Shield restored. The current encounter restarted.", 0);
          }
        }
        if (!reducedMotion.matches) {
          enemy.position.y = Math.sin(elapsed * 2 + index) * 0.08;
          enemy.userData.aura.rotation.z = elapsed * (index ? -0.35 : 0.35);
        } else {
          enemy.position.y = 0;
        }
        const hitActive = now < (enemy.userData.hitFlashUntil ?? 0);
        enemy.scale.setScalar(hitActive && !reducedMotion.matches ? 1.12 : 1);
      });

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

      floatingCombatTexts.slice().forEach((entry, index) => {
        const age = now - entry.createdAt;
        if (age >= floatingCombatTextLifetimeMs) {
          removeFloatingCombatText(entry);
          return;
        }
        entry.screenPosition.copy(entry.worldPosition).project(camera);
        const left = ((entry.screenPosition.x + 1) / 2) * world.clientWidth;
        const top = ((1 - entry.screenPosition.y) / 2) * world.clientHeight;
        const halfWidth = Math.min(
          entry.element.offsetWidth / 2,
          Math.max(0, world.clientWidth / 2 - 8),
        );
        const halfHeight = Math.min(
          entry.element.offsetHeight / 2,
          Math.max(0, world.clientHeight / 2 - 8),
        );
        entry.element.style.left = `${Math.max(
          halfWidth + 8,
          Math.min(world.clientWidth - halfWidth - 8, left),
        )}px`;
        entry.element.style.top = `${Math.max(
          halfHeight + 8,
          Math.min(world.clientHeight - halfHeight - 8, top),
        )}px`;
        entry.element.style.opacity = String(Math.min(1, (floatingCombatTextLifetimeMs - age) / 260));
        entry.element.style.translate = reducedMotion.matches
          ? "0 0"
          : `0 ${-Math.min(36, age * 0.035 + index * 2)}px`;
      });

      if (attackPulse.visible) {
        const pulseAge = now - attackPulse.userData.startedAt;
        if (pulseAge >= 320) {
          attackPulse.visible = false;
          attackPulse.material.opacity = 0;
        } else {
          const progress = pulseAge / 320;
          attackPulse.scale.setScalar(
            reducedMotion.matches ? 1 : 1 + progress * 3.4,
          );
          attackPulse.material.opacity = 0.78 * (1 - progress);
        }
      }
      hitParticles.forEach((particle) => {
        if (!particle.visible) return;
        if (now >= particle.userData.expiresAt) {
          particle.visible = false;
          return;
        }
        particle.position.addScaledVector(particle.userData.velocity, delta);
        particle.userData.velocity.y -= 1.8 * delta;
        particle.material.opacity = Math.max(
          0,
          (particle.userData.expiresAt - now) / 420,
        );
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
