// js/admin.js

import CONFIG from "./config.js";
import { get, post, put, del } from "./api.js";
import { showAlert } from "./ui.js";
import { formatCurrency, formatDate } from "./utils.js";
import { logout, requireAuth } from "./auth.js";
import { setupNavigation, isAdmin } from "./nav.js";

let destinations = [];
let bookings = [];
let users = [];
let editingDestinationId = null;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  setupNavigation();
  // ensure only admins stay on this page
  if (!isAdmin()) {
    alert("Access denied: Admins only");
    window.location.href = "index.html";
    return;
  }
  setupLogout();
  setupTabs();
  setupModalClose();
  setupForm();
  setupAddButton();
  loadAdminData();
});

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;
      showTab(tabName);
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function showTab(tabName) {
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach((content) => content.classList.remove("active"));
  const tab = document.getElementById(`${tabName}-tab`);
  if (tab) tab.classList.add("active");
}

async function loadAdminData() {
  try {
    destinations = await get(CONFIG.ENDPOINTS.DESTINATIONS);
    renderDestinations();

    bookings = await get(`${CONFIG.ENDPOINTS.ADMIN}/bookings`);
    renderBookings();

    users = await get(`${CONFIG.ENDPOINTS.ADMIN}/users`);
    renderUsers();

    document.getElementById("destCount").textContent = destinations.length;
    document.getElementById("bookingCount").textContent = bookings.length;
    document.getElementById("userCount").textContent = users.length;
  } catch (error) {
    console.error(error);
    showAlert("Failed to load admin data", "error");
  }
}

function renderDestinations() {
  const container = document.getElementById("destinationsList");
  if (!container) return;

  container.innerHTML = "";

  if (!destinations.length) {
    container.innerHTML = "<p>No destinations found. Add one to get started!</p>";
    return;
  }

  destinations.forEach((dest) => {
    const card = document.createElement("div");
    card.className = "admin-card";
    card.innerHTML = `
      <img src="${dest.imageUrl}" alt="${dest.name}" class="admin-card-image">
      <div class="admin-card-content">
        <h4>${dest.name}</h4>
        <p>📍 ${dest.country} | ${dest.category}</p>
        <p class="price">${formatCurrency(dest.basePrice)}</p>
        <p class="description">${(dest.description || "").substring(0, 60)}...</p>
        <div class="admin-actions">
          <button class="btn-secondary btn-edit" data-id="${dest.id}">✏️ Edit</button>
          <button class="btn-danger btn-delete" data-id="${dest.id}">🗑️ Delete</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => openEditDestination(e.target.dataset.id));
  });

  container.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => deleteDestination(e.target.dataset.id));
  });
}

function renderBookings() {
  const container = document.getElementById("bookingsList");
  if (!container) return;

  container.innerHTML = "";

  if (!bookings.length) {
    container.innerHTML = "<p>No bookings yet.</p>";
    return;
  }

  bookings.forEach((booking) => {
    const statusClass = booking.status === "CONFIRMED" ? "status-confirmed" : "status-cancelled";
    const card = document.createElement("div");
    card.className = "admin-card";
    card.innerHTML = `
      <div class="admin-card-content">
        <h4>${booking.destination?.name || "Unknown"}</h4>        <p>🚩 From: ${booking.startCity || "N/A"}</p>        <p>👤 User: ${booking.user?.name || "Unknown"}</p>
        <p>📧 ${booking.user?.email}</p>
        <p>🏷️ Mode: ${booking.travelMode?.toUpperCase()}</p>
        <p>💰 Amount: ${formatCurrency(booking.totalAmount)}</p>
        <p>📅 Date: ${formatDate(booking.bookingDate)}</p>
        <p class="status ${statusClass}">${booking.status}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderUsers() {
  const container = document.getElementById("usersList");
  if (!container) return;

  container.innerHTML = "";

  if (!users.length) {
    container.innerHTML = "<p>No users found.</p>";
    return;
  }

  users.forEach((user) => {
    const roleClass = user.role === "ADMIN" ? "role-admin" : "role-user";
    const card = document.createElement("div");
    card.className = "admin-card";
    card.innerHTML = `
      <div class="admin-card-content">
        <h4>${user.name}</h4>
        <p>📧 ${user.email}</p>
        <p class="role ${roleClass}">👤 ${user.role}</p>
        <p>🆔 ID: ${user.id}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function setupAddButton() {
  const addBtn = document.getElementById("addDestinationBtn");
  if (addBtn) {
    addBtn.addEventListener("click", openAddDestination);
  }
}

function openAddDestination() {
  editingDestinationId = null;
  document.getElementById("destinationForm").reset();
  document.getElementById("modalTitle").textContent = "➕ Add New Destination";
  document.getElementById("destinationModal").style.display = "block";
}

function openEditDestination(id) {
  const dest = destinations.find((d) => d.id == id);
  if (!dest) return;

  editingDestinationId = id;
  document.getElementById("destName").value = dest.name;
  document.getElementById("destCountry").value = dest.country;
  document.getElementById("destCategory").value = dest.category;
  document.getElementById("destDescription").value = dest.description;
  document.getElementById("destBestTime").value = dest.bestTime || "";
  document.getElementById("destBasePrice").value = dest.basePrice;
  document.getElementById("destImageUrl").value = dest.imageUrl;
  document.getElementById("destLatitude").value = dest.latitude;
  document.getElementById("destLongitude").value = dest.longitude;
  document.getElementById("modalTitle").textContent = "✏️ Edit Destination";
  document.getElementById("destinationModal").style.display = "block";
}

async function deleteDestination(id) {
  if (!confirm("Are you sure you want to delete this destination?")) {
    return;
  }

  try {
    await del(`${CONFIG.ENDPOINTS.DESTINATIONS}/${id}`);
    showAlert("✅ Destination deleted");
    loadAdminData();
  } catch (error) {
    console.error(error);
    showAlert("Failed to delete destination: " + (error.message || "Try again"), "error");
  }
}

function setupForm() {
  const form = document.getElementById("destinationForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const destination = {
    name: document.getElementById("destName").value,
    country: document.getElementById("destCountry").value,
    category: document.getElementById("destCategory").value,
    description: document.getElementById("destDescription").value,
    bestTime: document.getElementById("destBestTime").value,
    basePrice: parseFloat(document.getElementById("destBasePrice").value),
    imageUrl: document.getElementById("destImageUrl").value,
    latitude: parseFloat(document.getElementById("destLatitude").value),
    longitude: parseFloat(document.getElementById("destLongitude").value),
  };

  try {
    if (editingDestinationId) {
      await put(`${CONFIG.ENDPOINTS.DESTINATIONS}/${editingDestinationId}`, destination);
      showAlert("✅ Destination updated");
    } else {
      await post(CONFIG.ENDPOINTS.DESTINATIONS, destination);
      showAlert("✅ Destination created");
    }
    document.getElementById("destinationModal").style.display = "none";
    editingDestinationId = null;
    loadAdminData();
  } catch (error) {
    console.error(error);
    showAlert("Operation failed: " + (error.message || "Try again"), "error");
  }
}

function setupModalClose() {
  const closeBtn = document.getElementById("closeDestinationModal");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("destinationModal").style.display = "none";
      editingDestinationId = null;
    });
  }

  const modal = document.getElementById("destinationModal");
  if (modal) {
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
        editingDestinationId = null;
      }
    });
  }
}
