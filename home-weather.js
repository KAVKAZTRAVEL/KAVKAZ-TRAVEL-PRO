(function () {
  const icons = {
    clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.1"></circle><path d="M12 2.8v2.1M12 19.1v2.1M4.4 4.4l1.5 1.5M18.1 18.1l1.5 1.5M2.8 12h2.1M19.1 12h2.1M4.4 19.6l1.5-1.5M18.1 5.9l1.5-1.5"></path></svg>',
    cloud: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 18h9.1a4 4 0 0 0 .4-7.9 5.7 5.7 0 0 0-10.8 1.6A3.2 3.2 0 0 0 7.8 18Z"></path></svg>',
    rain: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 15.8h9.1a4 4 0 0 0 .4-7.9 5.7 5.7 0 0 0-10.8 1.6 3.2 3.2 0 0 0 1.3 6.3Z"></path><path d="M8.6 18.3 7.7 21M12.4 18.3l-.9 2.7M16.2 18.3l-.9 2.7"></path></svg>',
    snow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 15.8h9.1a4 4 0 0 0 .4-7.9 5.7 5.7 0 0 0-10.8 1.6 3.2 3.2 0 0 0 1.3 6.3Z"></path><path d="M9 19h.01M12 21h.01M15 19h.01"></path></svg>',
    storm: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 15.2h9.1a4 4 0 0 0 .4-7.9 5.7 5.7 0 0 0-10.8 1.6 3.2 3.2 0 0 0 1.3 6.3Z"></path><path d="m12.6 15-2.1 4h3l-1.7 3.2"></path></svg>'
  };

  function weatherMeta(code, cloudCover) {
    if (code === 0 && cloudCover < 18) return { label: "Ясно", icon: icons.clear };
    if ([1, 2].includes(code)) return { label: "Мало облаков", icon: icons.cloud };
    if (code === 3 || cloudCover >= 65) return { label: "Облачно", icon: icons.cloud };
    if ([45, 48].includes(code)) return { label: "Туман", icon: icons.cloud };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { label: "Дождь", icon: icons.rain };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Снег", icon: icons.snow };
    if ([95, 96, 99].includes(code)) return { label: "Гроза", icon: icons.storm };
    return { label: "Облачно", icon: icons.cloud };
  }

  function setLoading(card) {
    const icon = card.querySelector("[data-weather-icon]");
    const temp = card.querySelector("[data-weather-temp]");
    const text = card.querySelector("[data-weather-text]");
    if (icon) icon.innerHTML = icons.cloud;
    if (temp) temp.textContent = "--";
    if (text) text.textContent = "Погода";
  }

  async function loadCardWeather(card) {
    const lat = card.dataset.lat;
    const lon = card.dataset.lon;
    const icon = card.querySelector("[data-weather-icon]");
    const temp = card.querySelector("[data-weather-temp]");
    const text = card.querySelector("[data-weather-text]");

    setLoading(card);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,cloud_cover&timezone=Europe%2FMoscow`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather request failed");

      const data = await response.json();
      const current = data.current || {};
      const meta = weatherMeta(current.weather_code, current.cloud_cover || 0);

      if (icon) icon.innerHTML = meta.icon;
      if (temp) temp.textContent = `${Math.round(current.temperature_2m)}°`;
      if (text) text.textContent = meta.label;
      card.classList.add("weather-loaded");
    } catch (error) {
      if (icon) icon.innerHTML = icons.cloud;
      if (temp) temp.textContent = "--";
      if (text) text.textContent = "Нет данных";
    }
  }

  function initHomeWeather() {
    document.querySelectorAll("[data-home-weather]").forEach(loadCardWeather);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeWeather, { once: true });
  } else {
    initHomeWeather();
  }
})();
