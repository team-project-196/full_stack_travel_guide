// js/admin.js

import CONFIG from "./config.js";
import { get, post, del } from "./api.js";
import { showAlert } from "./ui.js";

let users = [];
let bookings = [];
let destinations = [];

/**
 * Load dashboard data
 */
async function loadDashboard() {
  try {
    users = await get(`${CONFIG.ENDPOINTS.ADMIN}/users`);
    bookings = await get(`${CONFIG.ENDPOINTS.ADMIN}/bookings`);
    destinations = await get(`${CONFIG.ENDPOINTS.ADMIN}/destinations`);

    renderStats();
    renderUsers();
    renderBookings();
    renderDestinations();
  } catch (error) {
    console.error(error);
    showAlert("Failed to load admin dashboard", "error");
  }
}

/**
 * Render dashboard stats
 */
function renderStats() {
  const userCount = document.getElementById("userCount");
  const bookingCount = document.getElementById("bookingCount");
  const destinationCount = document.getElementById("destinationCount");

  if (userCount) userCount.textContent = users.length;
  if (bookingCount) bookingCount.textContent = bookings.length;
  if (destinationCount) destinationCount.textContent = destinations.length;
}

/**
 * Render users table
 */
function renderUsers() {
  const table = document.getElementById("usersTableBody");

  if (!table) return;

  table.innerHTML = "";

  users.forEach((user) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role || "USER"}</td>
        `;

    table.appendChild(row);
  });
}

/**
 * Render bookings table
 */
function renderBookings() {
  const table = document.getElementById("bookingsTableBody");

  if (!table) return;

  table.innerHTML = "";

  bookings.forEach((booking) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.destination?.name || "-"}</td>
            <td>${booking.user?.email || "-"}</td>
            <td>${booking.travelDate}</td>
        `;

    table.appendChild(row);
  });
}

/**
 * Render destinations table
 */
function renderDestinations() {
  const table = document.getElementById("destinationsTableBody");

  if (!table) return;

  table.innerHTML = "";

  destinations.forEach((dest) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${dest.id}</td>
            <td>${dest.name}</td>
            <td>${dest.category}</td>
            <td>
                <button class="delete-destination" data-id="${dest.id}">
                    Delete
                </button>
            </td>
        `;

    table.appendChild(row);
  });
}

/**
 * Add destination
 */
async function addDestination(event) {
  event.preventDefault();

  const name = document.getElementById("destName").value;
  const category = document.getElementById("destCategory").value;
  const description = document.getElementById("destDescription").value;
  const imageUrl = document.getElementById("destImage").value;

  try {
    await post(`${CONFIG.ENDPOINTS.ADMIN}/destinations`, {
      name,
      category,
      description,
      imageUrl,
    });

    showAlert("Destination added successfully");

    loadDashboard();
  } catch (error) {
    console.error(error);
    showAlert("Failed to add destination", "error");
  }
}

/**
 * Delete destination
 */
async function deleteDestination(id) {
  try {
    await del(`${CONFIG.ENDPOINTS.ADMIN}/destinations/${id}`);

    showAlert("Destination deleted");

    loadDashboard();
  } catch (error) {
    console.error(error);
    showAlert("Failed to delete destination", "error");
  }
}

/**
 * Handle destination actions
 */
function handleDestinationActions(event) {
  const id = event.target.dataset.id;

  if (event.target.classList.contains("delete-destination")) {
    if (confirm("Are you sure you want to delete this destination?")) {
      deleteDestination(id);
    }
  }
}

/**
 * Initialize admin page
 */
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();

  const form = document.getElementById("addDestinationForm");

  if (form) {
    form.addEventListener("submit", addDestination);
  }

  const destinationTable = document.getElementById("destinationsTableBody");

  if (destinationTable) {
    destinationTable.addEventListener("click", handleDestinationActions);
  }
});
