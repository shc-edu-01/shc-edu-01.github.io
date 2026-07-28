document.documentElement.classList.add("js-enabled");

const navigationToggle = document.querySelector(".nav-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const currentYear = document.querySelector("#current-year");
const languageButton = document.querySelector("#language-button");
const languageMenu = document.querySelector("#language-menu");

const locales = {
  en: {
    skip: "Skip to content",
    "nav.about": "About",
    "nav.experience": "Experience",
    "nav.games": "Games",
    "nav.contact": "Contact",
    "hero.eyebrow": "Security Engineer · Builder · Explorer",
    "hero.title": "Engineering trust for connected worlds.",
    "hero.copy":
      "I design secure software systems and development workflows across mobile, platform, and product environments.",
    "hero.cta": "Enter the RPG",
    "about.kicker": "About",
    "about.title": "Security thinking, built into the system.",
    "about.copy":
      "My work connects security architecture, software engineering, and practical delivery. I enjoy turning complex security requirements into reliable tools and clear experiences.",
    "experience.kicker": "Experience",
    "experience.title": "From research to resilient platforms.",
    "experience.samsung.meta": "Samsung Electronics · Security Engineer",
    "experience.samsung.title": "Mobile & platform security",
    "experience.samsung.copy":
      "Building secure software components, communication layers, and development workflows for connected devices.",
    "experience.grayhash.meta": "Grayhash · Security Research Engineer",
    "experience.grayhash.title": "Assessment & vulnerability research",
    "experience.grayhash.copy":
      "Helping teams understand risk and improve their defenses across devices, applications, and online services.",
    "games.kicker": "Games",
    "games.title": "A fantasy portfolio after dark.",
    "games.copy":
      "Guide the wizard with WASD, arrow keys, click, or touch. Explore the moonlit realm, approach its characters and relics, then press E or tap the prompt to discover the portfolio.",
    "games.status": "RPG world · preparing",
    "contact.kicker": "Contact",
    "contact.title": "Curious about the details?",
    "contact.copy": "Reach out for an interview or a detailed CV.",
    "language.change": "Change language",
  },
};

const applyLocale = (locale) => {
  const dictionary = locales[locale] ?? locales.en;
  document.documentElement.lang = locale in locales ? locale : "en";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (value) {
      element.textContent = value;
    }
  });

  try {
    localStorage.setItem("portfolio-locale", document.documentElement.lang);
  } catch {
    // The selected language still applies when storage is unavailable.
  }
};

if (currentYear) {
  currentYear.textContent = new Date().getFullYear().toString();
}

if (navigationToggle && primaryNavigation) {
  navigationToggle.addEventListener("click", () => {
    const isOpen = navigationToggle.getAttribute("aria-expanded") === "true";
    navigationToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNavigation.dataset.open = String(!isOpen);
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navigationToggle.setAttribute("aria-expanded", "false");
      primaryNavigation.dataset.open = "false";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigationToggle.getAttribute("aria-expanded") === "true") {
      navigationToggle.setAttribute("aria-expanded", "false");
      primaryNavigation.dataset.open = "false";
      navigationToggle.focus();
    }
  });
}

if (languageButton && languageMenu) {
  const setLanguageMenu = (isOpen) => {
    languageButton.setAttribute("aria-expanded", String(isOpen));
    languageMenu.hidden = !isOpen;
  };

  languageButton.addEventListener("click", () => {
    setLanguageMenu(languageButton.getAttribute("aria-expanded") !== "true");
  });

  languageMenu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-locale]");
    if (option) {
      applyLocale(option.dataset.locale);
      setLanguageMenu(false);
      languageButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".language-switcher")) {
      setLanguageMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setLanguageMenu(false);
      languageButton.focus();
    }
  });
}

let savedLocale = "en";
try {
  savedLocale = localStorage.getItem("portfolio-locale") || "en";
} catch {
  // Use English when storage is unavailable.
}
applyLocale(savedLocale);
