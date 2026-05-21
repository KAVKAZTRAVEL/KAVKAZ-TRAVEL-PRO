
async function loadSitePrices() {
  let prices = null;

  try {
    const apiResponse = await fetch("/api/prices", { cache: "no-store" });
    if (apiResponse.ok) {
      prices = await apiResponse.json();
    }
  } catch (error) {
    // Public price APIs for these attractions were not found.
    // Fallback uses verified open-source data from prices.json.
  }

  if (!prices) {
    try {
      const localResponse = await fetch("prices.json", { cache: "no-store" });
      if (localResponse.ok) {
        prices = await localResponse.json();
      }
    } catch (error) {
      return;
    }
  }

  document.querySelectorAll("[data-price-key]").forEach((node) => {
    const key = node.dataset.priceKey;
    const item = prices[key];

    if (!item) return;

    const badge = document.createElement("div");
    badge.className = "price-badge";
    badge.innerHTML = `
      <span class="price-badge-label">${item.label}</span>
      <span class="price-badge-title">${item.title}</span>
    `;

    const details = document.createElement("div");
    details.className = "price-details";
    details.textContent = item.details;

    node.appendChild(badge);
    node.appendChild(details);
  });
}

document.addEventListener("DOMContentLoaded", loadSitePrices);
