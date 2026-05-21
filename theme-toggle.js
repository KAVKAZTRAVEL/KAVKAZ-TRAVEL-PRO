(function () {
  const storageKey = "kavkaz-travel-theme";
  const root = document.documentElement;
  const body = document.body;

  function getInitialTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === "night" || saved === "day") return saved;
    return "day";
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    body.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);

    const toggle = document.querySelector("[data-kx-theme-toggle]");
    if (toggle) {
      const isNight = theme === "night";
      toggle.setAttribute("aria-pressed", String(isNight));
      toggle.setAttribute("aria-label", isNight ? "Включить дневной режим" : "Включить ночной режим");
    }
  }

  function createAtmosphere() {
    if (document.querySelector(".kx-atmosphere")) return;

    const atmosphere = document.createElement("div");
    atmosphere.className = "kx-atmosphere";
    atmosphere.setAttribute("aria-hidden", "true");
    atmosphere.innerHTML = `
      <div class="kx-sky-layer kx-sky-day"></div>
      <div class="kx-sky-layer kx-sky-night"></div>
      <div class="kx-cloud-layer"></div>
      <div class="kx-star-layer"></div>
      <svg class="kx-constellation-layer" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <g class="kx-constellation kx-constellation-ursa">
          <polyline points="150,245 208,230 262,252 316,220 366,190 428,180 492,202"></polyline>
          <circle cx="150" cy="245" r="3.2"></circle><circle cx="208" cy="230" r="2.7"></circle><circle cx="262" cy="252" r="2.9"></circle><circle cx="316" cy="220" r="3.1"></circle><circle cx="366" cy="190" r="2.8"></circle><circle cx="428" cy="180" r="3.3"></circle><circle cx="492" cy="202" r="2.9"></circle>
        </g>
        <g class="kx-constellation kx-constellation-cassiopeia">
          <polyline points="900,150 954,108 1010,156 1068,112 1130,162"></polyline>
          <circle cx="900" cy="150" r="2.8"></circle><circle cx="954" cy="108" r="3.1"></circle><circle cx="1010" cy="156" r="2.7"></circle><circle cx="1068" cy="112" r="3.0"></circle><circle cx="1130" cy="162" r="2.8"></circle>
        </g>
        <g class="kx-constellation kx-constellation-orion">
          <polyline points="704,444 742,500 776,560"></polyline>
          <polyline points="630,390 704,444 785,390"></polyline>
          <polyline points="628,655 776,560 898,650"></polyline>
          <polyline points="706,520 742,500 779,482"></polyline>
          <circle cx="630" cy="390" r="3.4"></circle><circle cx="785" cy="390" r="3.0"></circle><circle cx="704" cy="444" r="2.6"></circle><circle cx="706" cy="520" r="2.5"></circle><circle cx="742" cy="500" r="2.8"></circle><circle cx="779" cy="482" r="2.4"></circle><circle cx="776" cy="560" r="3.2"></circle><circle cx="628" cy="655" r="3.0"></circle><circle cx="898" cy="650" r="3.4"></circle>
        </g>
        <g class="kx-constellation kx-constellation-cygnus">
          <polyline points="1110,420 1182,470 1258,522 1322,568"></polyline>
          <polyline points="1212,402 1258,522 1288,636"></polyline>
          <circle cx="1110" cy="420" r="2.6"></circle><circle cx="1182" cy="470" r="2.8"></circle><circle cx="1258" cy="522" r="3.4"></circle><circle cx="1322" cy="568" r="2.7"></circle><circle cx="1212" cy="402" r="2.5"></circle><circle cx="1288" cy="636" r="2.9"></circle>
        </g>
      </svg>
      <div class="kx-moon-glow"></div>
      <div class="kx-sun-bloom"></div>
      <div class="kx-cinematic-grain"></div>
    `;
    body.prepend(atmosphere);
  }

  function createToggle() {
    if (document.querySelector("[data-kx-theme-toggle]")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "kx-theme-toggle";
    button.dataset.kxThemeToggle = "";
    button.innerHTML = `
      <span class="kx-toggle-track">
        <span class="kx-toggle-icon kx-toggle-sun" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"></path></svg>
        </span>
        <span class="kx-toggle-thumb" aria-hidden="true"></span>
        <span class="kx-toggle-icon kx-toggle-moon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7.8 7.8 0 1 0 20.5 14.5Z"></path></svg>
        </span>
      </span>
    `;

    button.addEventListener("click", function () {
      setTheme(root.dataset.theme === "night" ? "day" : "night");
    });

    const nav = document.querySelector(".reference-nav");
    if (nav) {
      nav.appendChild(button);
    } else {
      body.appendChild(button);
    }
  }

  function init() {
    createAtmosphere();
    createToggle();
    setTheme(getInitialTheme());
    root.classList.add("theme-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
