// js/bookings.js

import CONFIG from "./config.js";
import { get, post, del } from "./api.js";
import { showAlert } from "./ui.js";
import { formatDate } from "./utils.js";

import { requireAuth } from "./auth.js";

let bookings = [];

/**
 * Create booking
 */
export async function createBooking(destinationId, travelDate) {
  try {
    await post(CONFIG.ENDPOINTS.BOOKINGS, {
      destinationId: destinationId,
      travelDate: travelDate,
    });

    showAlert("Booking successful!");
  } catch (error) {
    console.error(error);
    showAlert("Failed to create booking", "error");
  }
}

/**
 * Load user bookings
 */
async function loadBookings() {
  const container = document.getElementById("bookingsContainer");

  if (!container) return;

  try {
    const data = await get(CONFIG.ENDPOINTS.BOOKINGS);

    bookings = data;

    renderBookings();
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Failed to load bookings.</p>";
  }
}

/**
 * Render bookings
 */
function renderBookings() {
  const container = document.getElementById("bookingsContainer");

  if (!container) return;

  container.innerHTML = "";

  if (!bookings.length) {
    container.innerHTML = "<p>No bookings yet.</p>";
    return;
  }

  bookings.forEach((booking) => {
    const card = document.createElement("div");
    card.className = "booking-card";

    card.innerHTML = `
            <img src="${booking.destination?.imageUrl}" alt="${booking.destination.name}" />

            <div class="card-content">

                <h3>${booking.destination.name}</h3>

                <p><strong>Travel Date:</strong> ${formatDate(booking.travelDate)}</p>

                <button class="cancel-booking" data-id="${booking.id}">
                    Cancel Booking
                </button>

            </div>
        `;

    container.appendChild(card);
  });
}

/**
 * Cancel booking
 */
async function cancelBooking(id) {
  try {
    await del(`${CONFIG.ENDPOINTS.BOOKINGS}/${id}`);

    showAlert("Booking cancelled");

    loadBookings();
  } catch (error) {
    console.error(error);
    showAlert("Failed to cancel booking", "error");
  }
}

/**
 * Handle cancel button
 */
function handleBookingActions(event) {
  const id = event.target.dataset.id;

  if (event.target.classList.contains("cancel-booking")) {
    cancelBooking(id);
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
});