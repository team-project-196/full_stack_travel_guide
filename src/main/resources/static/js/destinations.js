// js/destinations.js

import CONFIG from "./config.js";
import { get, post, put, del } from "./api.js";
import { showAlert, openModal, closeModal } from "./ui.js";
import { debounce } from "./utils.js";
import { isAuthenticated, requireAuth } from "./auth.js";
import { formatCurrency } from "./utils.js";

let destinations = [];
let currentDestination = null;
let map;
let marker;
let userBookmarks = []; // Track user's bookmarks

/* Load destinations */
async function loadDestinations() {
  const loading = document.getElementById("loadingMessage");
  const container = document.getElementById("destinationsContainer");

  try {
    // fetch bookmarks for logged in user so UI reflects state
    if (isAuthenticated()) {
      const bmData = await get(CONFIG.ENDPOINTS.BOOKMARKS);
      // convert to string and dedupe - ensure all IDs are strings for consistent comparison
      userBookmarks = [...new Set(bmData.map((b) => String(b.destination.id)))];
    } else {
      userBookmarks = [];
    }

    const data = await get(CONFIG.ENDPOINTS.DESTINATIONS);
    destinations = data;
    renderDestinations(destinations);
    attachCardListeners();
    loading.style.display = "none";
  } catch (error) {
    loading.innerText = "Failed to load destinations.";
    console.error(error);
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
      <div class="card-image">
        <img src="${dest.imageUrl}" alt="${dest.name}">
        <span class="card-category">${dest.category}</span>
      </div>

      <div class="card-content">
        <h3>${dest.name}</h3>
        <p class="card-location">🌍 ${dest.country}</p>
        <p class="card-description">${(dest.description || "").substring(0, 100)}...</p>
        <div class="card-actions">
          <button class="btn-view" data-id="${dest.id}">View Details</button>
          ${isAuthenticated() ? `<button class="btn-bookmark" data-id="${dest.id}">${userBookmarks.includes(String(dest.id)) ? '⭐ Bookmarked' : '⭐ Bookmark'}</button>` : ''}
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
    d.name.toLowerCase().includes(query) ||
    d.country.toLowerCase().includes(query)
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

/* Show destination details */
function showDestinationDetails(id) {
  const destination = destinations.find((d) => d.id == id);

  if (!destination) {
    showAlert("Destination not found", "error");
    return;
  }

  currentDestination = destination;
  const modalBody = document.getElementById("modalBody");

  let activitiesHTML = "";

  if (destination.activities && destination.activities.length) {
    activitiesHTML = `
      <p style="margin-top: 18px; font-weight: 600; color: var(--text-dark);"><strong>Available Activities</strong></p>
      <div class="activities-list">
        ${destination.activities
          .map((a) => `<div class="activity-item">${a.name} - ${formatCurrency(a.price)}</div>`)
          .join("")}
      </div>
    `;
  }
  modalBody.innerHTML = `
    <div class="modal-destination-header">
      <h2>${destination.name}</h2>
      <p class="location-badge">${destination.country}</p>
    </div>

    <img src="${destination.imageUrl}" alt="${destination.name}" class="modal-image">

    <div class="modal-info">
      <p><strong>Category:</strong> ${destination.category}</p>
      <p><strong>Best Time to Visit:</strong> ${destination.bestTime}</p>
      <p style="margin-top: 12px; margin-bottom: 8px; font-weight: 600; color: var(--text-dark);"><strong>Description</strong></p>
      <p class="description-text">${destination.description}</p>

      ${activitiesHTML}
    </div>

    ${isAuthenticated() ? `<button class="btn-secondary bookmark-btn" data-id="${destination.id}">${userBookmarks.includes(String(destination.id)) ? '⭐ Bookmarked' : '⭐ Bookmark'}</button>` : ''}

    <a class="btn-primary" href="trip-planner.html#${destination.id}" style="margin-top:15px; display:inline-block;">📍 Calculate Trip Cost</a>

    <div id="destinationMap" class="modal-map" style="height:300px;margin-top:15px;"></div>
  `;

  openModal("destinationModal");

  const bookmarkBtn = document.querySelector(".bookmark-btn");
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", handleBookmark);
  }

  // no booking form in modal anymore
  initMap(destination);
}

/* helper: attach listeners on card buttons */
function attachCardListeners() {
  const viewBtns = document.querySelectorAll(".btn-view");
  viewBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => showDestinationDetails(e.target.dataset.id));
  });

  const bookmarkBtns = document.querySelectorAll(".btn-bookmark");
  bookmarkBtns.forEach((btn) => {
    btn.addEventListener("click", handleBookmark);
  });
}


/* Add bookmark */
async function handleBookmark(e) {
  e.preventDefault();

  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const destinationId = e.target.dataset.id;
  const button = e.target;

  try {
    const destinationIdStr = String(destinationId);
    const isAdded = userBookmarks.includes(destinationIdStr);
    if (isAdded) {
      // Remove bookmark
      await del(`${CONFIG.ENDPOINTS.BOOKMARKS}/${destinationId}`);
      userBookmarks = userBookmarks.filter(id => id !== destinationIdStr);
      button.textContent = '⭐ Bookmark';
      showAlert("✅ Bookmark removed!");
    } else {
      // Add bookmark
      await post(`${CONFIG.ENDPOINTS.BOOKMARKS}/${destinationId}`, {});
      userBookmarks.push(destinationIdStr);
      // keep unique
      userBookmarks = [...new Set(userBookmarks)];
      button.textContent = '⭐ Bookmarked';
      showAlert("✅ Destination added to bookmarks!");
    }

    // also update any card button matching this id
    const cardBtn = document.querySelector(`.btn-bookmark[data-id="${destinationId}"]`);
    if (cardBtn && cardBtn !== button) {
      cardBtn.textContent = userBookmarks.includes(destinationIdStr) ? '⭐ Bookmarked' : '⭐ Bookmark';
    }

    // also update modal button if it exists
    const modalBtn = document.querySelector(`.bookmark-btn[data-id="${destinationId}"]`);
    if (modalBtn && modalBtn !== button) {
      modalBtn.textContent = userBookmarks.includes(destinationIdStr) ? '⭐ Bookmarked' : '⭐ Bookmark';
    }

    // notify other components (bookmarks page) about change
    window.dispatchEvent(new CustomEvent('bookmarkChanged', {
      detail: { destinationId, added: !isAdded }
    }));
  } catch (error) {
    showAlert("Failed to update bookmark", "error");
    console.error(error);
  }
}

/* Complete booking */
async function handleBooking(e) {
  e.preventDefault();

  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  if (!currentDestination) return;

  const totalAmount = parseFloat(document.getElementById("totalAmount").value);

  if (!totalAmount || totalAmount < currentDestination.basePrice) {
    showAlert("Please enter a valid amount", "error");
    return;
  }

  try {
    await post(`${CONFIG.ENDPOINTS.BOOKINGS}/${currentDestination.id}`, {
      totalAmount
    });

    showAlert("🎉 Booking confirmed! Check your bookings page.");
    closeModal("destinationModal");
    
    setTimeout(() => {
      window.location.href = "bookings.html";
    }, 2000);
  } catch (error) {
    showAlert("Booking failed. " + (error.message || "Try again."), "error");
    console.error(error);
  }
}

/* Card button handling */
function handleCardActions(event) {
  const id = event.target.dataset.id;

  if (event.target.classList.contains("btn-view")) {
    showDestinationDetails(id);
  }

  if (event.target.classList.contains("btn-bookmark")) {
    event.target.dataset.id = id;
    handleBookmark(event);
  }
}

/* Leaflet map initialization */
function initMap(destination) {
  const lat = destination.latitude;
  const lng = destination.longitude;

  if (!lat || !lng) return;

  setTimeout(() => {
    if (typeof L !== 'undefined') {
      // Clear existing map if any
      if (map) {
        map.remove();
      }

      map = L.map("destinationMap").setView([lat, lng], 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      L.marker([lat, lng]).addTo(map).bindPopup(`<b>${destination.name}</b>`);
    }
  }, 100);
}

/* Setup modal close */
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

  if (searchInput) {
    searchInput.addEventListener("input", debounce(searchDestinations, 300));
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterCategory);
  }
}

/* Initialize */
document.addEventListener("DOMContentLoaded", () => {
  loadDestinations();
  setupControls();
  setupModalClose();

  const container = document.getElementById("destinationsContainer");
  if (container) {
    container.addEventListener("click", handleCardActions);
  }
});