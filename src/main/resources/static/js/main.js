const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
  setupAuthUI();
  loadPopularDestinations();
});

function setupAuthUI() {
  const token = localStorage.getItem("token");

  const authLinks = document.getElementById("authLinks");
  const logoutContainer = document.getElementById("logoutContainer");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!authLinks || !logoutContainer) return;

  if (token) {
    authLinks.style.display = "none";
    logoutContainer.style.display = "block";

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.reload();
      });
    }
  } else {
    authLinks.style.display = "block";
    logoutContainer.style.display = "none";
  }
}

async function loadPopularDestinations() {
  const container = document.getElementById("popular-destination-list");

  if (!container) return;

  try {
    const response = await fetch(API_BASE + "/destinations");

    if (!response.ok) {
      throw new Error("Failed to load destinations");
    }

    const destinations = await response.json();

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
    container.innerHTML = "Unable to load destinations.";
  }
}
