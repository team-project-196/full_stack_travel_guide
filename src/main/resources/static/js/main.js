// js/main.js

import CONFIG from "./config.js";
import { get } from "./api.js";
import { getFromStorage, removeFromStorage } from "./utils.js";
import { logout, isAuthenticated } from "./auth.js";
import { setupNavigation } from "./nav.js";

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  loadPopularDestinations();
});


async function loadPopularDestinations() {
  const container = document.getElementById("popular-destination-list");

  if (!container) return;

  try {
    const destinations = await get(CONFIG.ENDPOINTS.DESTINATIONS);

    const popular = destinations.slice(0, 4);

    container.innerHTML = "";

    popular.forEach((dest) => {
      const card = document.createElement("div");
      card.className = "destination-card";

      card.innerHTML = `
        <img src="${dest.imageUrl}" alt="${dest.name}" />

        <div class="card-content">
          <h3>${dest.name}</h3>
          <p>${dest.country}</p>

          <a href="destinations.html" class="btn-secondary">
            View Details
          </a>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading destinations:", error);
    container.innerHTML = "<p>Unable to load destinations. Please try again later.</p>";
  }
}
