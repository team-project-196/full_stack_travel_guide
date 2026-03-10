// js/destinations.js

import CONFIG from "./config.js";
import { get } from "./api.js";
import { showAlert, openModal, closeModal } from "./ui.js";
import { debounce } from "./utils.js";
import { isAuthenticated } from "./auth.js";

let destinations = [];
let map;
let marker;

/* Load destinations */
async function loadDestinations() {
  const loading = document.getElementById("loadingMessage");

  try {
    const data = await get(CONFIG.ENDPOINTS.DESTINATIONS);

    destinations = data;

    renderDestinations(destinations);

    loading.style.display = "none";
  } catch (error) {
    loading.innerText = "Failed to load destinations.";
  }
}

/* Render destination cards */
function renderDestinations(list) {
  const container = document.getElementById("destinationsContainer");
  const noResults = document.getElementById("noResults");

  container.innerHTML = "";

  if (!list.length) {
    noResults.style.display = "block";
    return;
  }

  noResults.style.display = "none";

  list.forEach((dest) => {
    const card = document.createElement("div");
    card.className = "destination-card";

    card.innerHTML = `
      <img src="${dest.imageUrl}" alt="${dest.name}">

      <div class="card-content">

        <h3>${dest.name}</h3>

        <p>${(dest.description || "").substring(0, 100)}...</p>

        <div class="card-actions">

          <button class="btn-view" data-id="${dest.id}">
            View Details
          </button>

          <button class="btn-bookmark" data-id="${dest.id}">
            Bookmark
          </button>

        </div>

      </div>
    `;

    container.appendChild(card);
  });
}

/* Search */
function searchDestinations() {
  const query = document.getElementById("searchInput").value.toLowerCase();

  const filtered = destinations.filter((d) =>
    d.name.toLowerCase().includes(query),
  );

  renderDestinations(filtered);
}

/* Category filter */
function filterCategory() {
  const category = document.getElementById("categoryFilter").value;

  if (!category) {
    renderDestinations(destinations);
    return;
  }

  const filtered = destinations.filter((d) => d.category === category);

  renderDestinations(filtered);
}

/* Show modal */
function showDestinationDetails(id) {
  const destination = destinations.find((d) => d.id == id);

  if (!destination) {
    showAlert("Destination not found", "error");
    return;
  }

  const modalBody = document.getElementById("modalBody");

  let activitiesHTML = "";

  if (destination.activities && destination.activities.length) {
    activitiesHTML = `
      <h4>Activities</h4>
      <ul>
        ${destination.activities
          .map((a) => `<li>${a.name} - ₹${a.price}</li>`)
          .join("")}
      </ul>
    `;
  }

  modalBody.innerHTML = `
      <h2>${destination.name}</h2>

      <img src="${destination.imageUrl}" alt="${destination.name}">

      <p>${destination.description}</p>

      <p><strong>Category:</strong> ${destination.category}</p>
      <p><strong>Best Time:</strong> ${destination.bestTime}</p>
      <p><strong>Base Price:</strong> ₹${destination.basePrice}</p>

      ${activitiesHTML}

      <div id="destinationMap" style="height:300px;margin-top:15px;"></div>

      <div class="modal-actions">

        <button class="btn-bookmark" data-id="${destination.id}">
          Bookmark
        </button>

        <button class="btn-book">
          Book Trip
        </button>

      </div>
  `;

  openModal("destinationModal");

  initMap(destination);
}

/* Bookmark */
function handleBookmark(destinationId) {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  showAlert("Bookmark saved!");
}

/* Card button handling */
function handleCardActions(event) {
  const id = event.target.dataset.id;

  if (event.target.classList.contains("btn-view")) {
    showDestinationDetails(id);
  }

  if (event.target.classList.contains("btn-bookmark")) {
    handleBookmark(id);
  }
}

/* Leaflet map */
function initMap(destination) {
  const lat = destination.latitude;
  const lng = destination.longitude;

  if (!lat || !lng) return;

  setTimeout(() => {
    map = L.map("destinationMap").setView([lat, lng], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    marker = L.marker([lat, lng]).addTo(map);
  }, 200);
}

/* Modal close */
function setupModalClose() {
  const modal = document.getElementById("destinationModal");
  const closeBtn = document.getElementById("closeModal");

  closeBtn.addEventListener("click", () => {
    closeModal("destinationModal");
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal("destinationModal");
    }
  });
}

/* Setup controls */
function setupControls() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  searchInput.addEventListener("input", debounce(searchDestinations, 300));
  categoryFilter.addEventListener("change", filterCategory);
}

/* Init */
document.addEventListener("DOMContentLoaded", () => {
  loadDestinations();

  setupControls();

  setupModalClose();

  document
    .getElementById("destinationsContainer")
    .addEventListener("click", handleCardActions);
});