document.documentElement.classList.add("js-enabled");

const navToggle = document.querySelector("#nav-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const gamesMenuButton = document.querySelector("#games-menu-button");
const languageButton = document.querySelector("#language-button");
const languageMenu = document.querySelector("#language-menu");
const startJourneyButton = document.querySelector("#start-journey");
const introPanel = document.querySelector("#intro-panel");

const closeNavigation = () => {
  if (!navToggle || !primaryNavigation) return;
  navToggle.setAttribute("aria-expanded", "false");
  primaryNavigation.dataset.open = "false";
};

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  if (primaryNavigation) primaryNavigation.dataset.open = String(!isOpen);
});

primaryNavigation?.addEventListener("click", closeNavigation);

gamesMenuButton?.addEventListener("click", () => {
  closeNavigation();
  introPanel?.setAttribute("hidden", "");
  document.querySelector("#game-world canvas")?.focus({ preventScroll: true });
  window.dispatchEvent(new CustomEvent("rpg:resume"));
});

document.querySelectorAll(".quest-nav").forEach((button) => {
  button.addEventListener("click", () => {
    closeNavigation();
    window.dispatchEvent(
      new CustomEvent("rpg:chapter-request", {
        detail: { index: Number(button.dataset.chapter) },
      }),
    );
  });
});

startJourneyButton?.addEventListener("click", () => {
  introPanel?.setAttribute("hidden", "");
  window.dispatchEvent(new CustomEvent("rpg:start"));
});

const setLanguageMenu = (open) => {
  if (!languageButton || !languageMenu) return;
  languageButton.setAttribute("aria-expanded", String(open));
  languageMenu.hidden = !open;
};

languageButton?.addEventListener("click", () => {
  setLanguageMenu(languageButton.getAttribute("aria-expanded") !== "true");
});

languageMenu?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-locale]");
  if (!option) return;
  document.documentElement.lang = option.dataset.locale || "en";
  setLanguageMenu(false);
  languageButton?.focus();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".language-switcher")) setLanguageMenu(false);
  if (!event.target.closest(".game-hud")) closeNavigation();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeNavigation();
  setLanguageMenu(false);
});
