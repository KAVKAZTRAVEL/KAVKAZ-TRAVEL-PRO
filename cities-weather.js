(function () {
  const cityWeather = {
    "pyatigorsk.html": { lat: 44.0486, lon: 43.0594 },
    "kislovodsk.html": { lat: 43.9133, lon: 42.7208 },
    "essentuki.html": { lat: 44.0445, lon: 42.8589 },
    "arkhyz.html": { lat: 43.5653, lon: 41.2794 },
    "elbrus.html": { lat: 43.3499, lon: 42.4453 },
    "dombay.html": { lat: 43.2917, lon: 41.6269 }
  };

  const icons = {
    clear: "☀",
    cloud: "☁",
    rain: "☂",
    snow: "❄",
    storm: "⚡"
  };

  function normalizeHref(href) {
    return (href || "").split("/").pop().split("?")[0].split("#")[0];
  }

  function weatherMeta(code, cloudCover, precipitation) {
    if (precipitation > 0.1 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return { icon: icons.rain, label: "Дождь" };
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: icons.snow, label: "Снег" };
    if ([95, 96, 99].includes(code)) return { icon: icons.storm, label: "Гроза" };
    if (code === 0 && cloudCover < 18) return { icon: icons.clear, label: "Ясно" };
    if ([1, 2].includes(code) || cloudCover < 45) return { icon: icons.cloud, label: "Мало облаков" };
    if (cloudCover < 75) return { icon: icons.cloud, label: "Облачно" };
    if ([45, 48].includes(code)) return { icon: icons.cloud, label: "Туман" };
    return { icon: icons.cloud, label: "Пасмурно" };
  }

  function createWeatherPanel() {
    const panel = document.createElement("div");
    panel.className = "cities-live-weather";
    panel.setAttribute("aria-label", "Погода сейчас");
    panel.innerHTML = `
      <div class="cities-weather-instapill" data-cities-weather-badge>
        <span class="cities-weather-instapill-copy">
          <small data-cities-weather-text>Погода</small>
          <strong data-cities-weather-temp>--°</strong>
        </span>
        <span class="cities-weather-instapill-icon" data-cities-weather-icon>${icons.cloud}</span>
      </div>
    `;
    return panel;
  }

  async function loadWeather(card, panel, city) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,cloud_cover,precipitation&timezone=Europe%2FMoscow`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather request failed");

      const data = await response.json();
      const current = data.current || {};
      const temperature = Math.round(Number(current.temperature_2m || 0));
      const cloudCover = Number(current.cloud_cover || 0);
      const precipitation = Number(current.precipitation || 0);
      const meta = weatherMeta(current.weather_code, cloudCover, precipitation);

      panel.querySelector("[data-cities-weather-icon]").innerHTML = meta.icon;
      panel.querySelector("[data-cities-weather-temp]").textContent = `${temperature > 0 ? "+" : ""}${temperature}°`;
      panel.querySelector("[data-cities-weather-text]").textContent = meta.label;
      panel.querySelector("[data-cities-weather-badge]").setAttribute("title", meta.label);
      card.classList.add("cities-weather-loaded");
    } catch (error) {
      panel.querySelector("[data-cities-weather-temp]").textContent = "--°";
      panel.querySelector("[data-cities-weather-text]").textContent = "Нет данных";
      panel.querySelector("[data-cities-weather-badge]").setAttribute("title", "Нет данных");
    }
  }

  function initCitiesWeather() {
    document.querySelectorAll(".cities-directory-card").forEach((card) => {
      const city = cityWeather[normalizeHref(card.getAttribute("href"))];
      const copy = card.querySelector(".cities-directory-copy");
      if (!city || !copy || card.querySelector(".cities-live-weather")) return;

      const panel = createWeatherPanel();
      copy.append(panel);
      loadWeather(card, panel, city);
      window.setInterval(() => loadWeather(card, panel, city), 10 * 60 * 1000);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCitiesWeather, { once: true });
  } else {
    initCitiesWeather();
  }
})();
