
const weatherCodeText = {
  0: ["☀️", "Ясно"],
  1: ["🌤️", "Преимущественно ясно"],
  2: ["⛅", "Переменная облачность"],
  3: ["☁️", "Пасмурно"],
  45: ["🌫️", "Туман"],
  48: ["🌫️", "Изморозь"],
  51: ["🌦️", "Слабая морось"],
  53: ["🌦️", "Морось"],
  55: ["🌧️", "Сильная морось"],
  61: ["🌧️", "Небольшой дождь"],
  63: ["🌧️", "Дождь"],
  65: ["🌧️", "Сильный дождь"],
  71: ["🌨️", "Небольшой снег"],
  73: ["🌨️", "Снег"],
  75: ["❄️", "Сильный снег"],
  80: ["🌦️", "Кратковременный дождь"],
  81: ["🌧️", "Ливень"],
  82: ["⛈️", "Сильный ливень"],
  95: ["⛈️", "Гроза"]
};

const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function getWeatherInfo(code) {
  return weatherCodeText[code] || ["🌡️", "Погода обновляется"];
}

function roundTemp(value) {
  return Math.round(value);
}

async function loadWeatherCard(card) {
  const lat = card.dataset.lat;
  const lon = card.dataset.lon;
  const city = card.dataset.city;

  const currentTemp = card.querySelector("[data-current-temp]");
  const currentStatus = card.querySelector("[data-current-status]");
  const daysContainer = card.querySelector("[data-weather-days]");
  const cityNode = card.querySelector("[data-weather-city]");

  if (cityNode) cityNode.textContent = city;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FMoscow&forecast_days=7`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;
    const [currentIcon, currentText] = getWeatherInfo(current.weather_code);

    currentTemp.textContent = `${roundTemp(current.temperature_2m)}°C`;
    currentStatus.textContent = `${currentIcon} ${currentText}`;

    daysContainer.innerHTML = daily.time.map((date, index) => {
      const dateObject = new Date(date);
      const [icon] = getWeatherInfo(daily.weather_code[index]);
      const max = roundTemp(daily.temperature_2m_max[index]);
      const min = roundTemp(daily.temperature_2m_min[index]);

      return `
        <div class="weather-day">
          <span class="weather-day-name">${dayNames[dateObject.getDay()]}</span>
          <span class="weather-day-icon">${icon}</span>
          <span class="weather-day-temp">${max}° / ${min}°</span>
        </div>
      `;
    }).join("");

    document.querySelectorAll("[data-mini-weather]").forEach((badge) => {
      badge.innerHTML = `${currentIcon} Сейчас в городе: ${roundTemp(current.temperature_2m)}°C`;
    });

  } catch (error) {
    currentTemp.textContent = "—";
    currentStatus.textContent = "Не удалось загрузить погоду";
    daysContainer.innerHTML = `
      <div class="weather-day">
        <span class="weather-day-name">Ошибка</span>
        <span class="weather-day-icon">☁️</span>
        <span class="weather-day-temp">Попробуйте позже</span>
      </div>
    `;
  }
}

function loadAllWeatherCards() {
  document.querySelectorAll("[data-weather-card]").forEach(loadWeatherCard);
}

document.addEventListener("DOMContentLoaded", loadAllWeatherCards);
