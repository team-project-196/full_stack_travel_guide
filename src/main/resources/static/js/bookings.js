// js/bookings.js

import CONFIG from "./config.js";
import { get, del } from "./api.js";
import { showAlert } from "./ui.js";
import { formatDate, formatCurrency } from "./utils.js";
import { requireAuth } from "./auth.js";

let bookings = [];

/**
 * Cancel booking
 */
async function cancelBooking(bookingId) {
  if (!confirm("Are you sure you want to cancel this booking?")) {
    return;
  }

  try {
    await del(`${CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}`);
    showAlert("✅ Booking cancelled successfully");
    loadBookings();
  } catch (error) {
    console.error(error);
    showAlert("Failed to cancel booking: " + (error.message || "Try again"), "error");
  }
}

/**
 * Load user bookings
 */
async function loadBookings() {
  const container = document.getElementById("bookingsContainer");
  const loading = document.getElementById("loadingBookings");
  const noBookings = document.getElementById("noBookings");

  if (!container) return;

  try {
    loading.style.display = "block";
    const data = await get(`${CONFIG.ENDPOINTS.BOOKINGS}/my`);
    bookings = data;
    renderBookings();
    loading.style.display = "none";
  } catch (error) {
    console.error(error);
    loading.innerText = "Failed to load bookings.";
  }
}

/**
 * Render bookings
 */
function renderBookings() {
  const container = document.getElementById("bookingsContainer");
  const noBookings = document.getElementById("noBookings");

  if (!container) return;

  container.innerHTML = "";

  if (!bookings.length) {
    noBookings.style.display = "block";
    return;
  }

  noBookings.style.display = "none";

  bookings.forEach((booking) => {
    const card = document.createElement("div");
    card.className = "booking-card";

    const statusClass = booking.status === "CONFIRMED" ? "status-confirmed" : "status-cancelled";
    const statusIcon = booking.status === "CONFIRMED" ? "✅" : "❌";

    card.innerHTML = `
      <div class="card-image">
        <img src="${booking.destination?.imageUrl}" alt="${booking.destination?.name}" />
        <span class="card-status ${statusClass}">${statusIcon} ${booking.status}</span>
      </div>

      <div class="card-content">
        <h3>${booking.destination?.name || "Destination"}</h3>
        <p class="booking-info">� From: ${booking.startCity || "N/A"}</p>
        <p class="booking-info">�📍 ${booking.destination?.country}</p>
        <p class="booking-info">🏷️ <strong>Mode:</strong> ${booking.travelMode?.toUpperCase()}</p>
        <p class="booking-info">💰 <strong>Amount:</strong> ${formatCurrency(booking.totalAmount)}</p>
        <p class="booking-info">📅 <strong>Booked on:</strong> ${formatDate(booking.bookingDate)}</p>

        <div class="card-actions">
          <a href="destinations.html#${booking.destination?.id}" class="btn-secondary">View Destination</a>
          ${booking.status === "CONFIRMED" ? `<button class="cancel-booking" data-id="${booking.id}">Cancel Booking</button>` : ''}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Handle booking actions
 */
function handleBookingActions(event) {
  const bookingId = event.target.dataset.id;

  if (event.target.classList.contains("cancel-booking")) {
    cancelBooking(bookingId);
  }
}

/**
 * Initialize bookings page
 */
document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const container = document.getElementById("bookingsContainer");

  if (container) {
    loadBookings();
    container.addEventListener("click", handleBookingActions);
  }

  // Listen for booking changes from other pages
  window.addEventListener('bookingChanged', () => {
    loadBookings();
  });
});