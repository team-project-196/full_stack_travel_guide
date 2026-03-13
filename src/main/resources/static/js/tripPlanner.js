import CONFIG from "./config.js";
import { get, post } from "./api.js";
import { formatCurrency, parseCurrency } from "./utils.js";
import { showAlert } from "./ui.js";
import { isAuthenticated } from "./auth.js";

let destinations = [];
let map;
let marker;
let routeLine;
let selectedTravelMode = "BUS"; // default travel mode

/* Major Indian cities */
const cities = {
  chennai: { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  mumbai: { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  delhi: { name: "Delhi", lat: 28.6139, lng: 77.209 },
  bangalore: { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  hyderabad: { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  kolkata: { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  jaipur: { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  kochi: { name: "Kochi", lat: 9.9312, lng: 76.2673 },
  goa: { name: "Goa", lat: 15.2993, lng: 74.124 },
  ahmedabad: { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
};

/* Map */
function initMap() {
  map = L.map("map").setView([20.5937, 78.9629], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
}

/* Load destinations */
async function loadDestinations() {
  const select = document.getElementById("destinationSelect");

  try {
    const data = await get(CONFIG.ENDPOINTS.DESTINATIONS);

    destinations = data;

    data.forEach((dest) => {
      const option = document.createElement("option");
      option.value = dest.id;
      option.textContent = dest.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading destinations:", error);
    showAlert("Failed to load destinations", "error");
  }
}

/* Haversine distance formula */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/* Activities UI */
function renderActivities(destination) {
  const container = document.getElementById("activitiesContainer");

  if (!destination.activities || destination.activities.length === 0) {
    container.innerHTML = "<p>No activities available</p>";
    return;
  }

  container.innerHTML = "";

  destination.activities.forEach((act) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <label>
        <input type="checkbox" class="activityCheck" value="${act.price}">
        ${act.name} — ₹${act.price}
      </label>
    `;

    container.appendChild(div);
  });
}

/* Smart Transport Engine */
function calculateTransport(distance, destination) {
  const BUS_RATE = 5;
  const TRAIN_RATE = 7;
  const FLIGHT_RATE = 35;
  const SHIP_RATE = 10;

  const AIRPORT_TRANSFER = 300;
  const PORT_TRANSFER = 250;

  let transportText = "";
  let totalTransportCost = 0;
  let selectedMode = "BUS"; // default

  if (distance < 300) {
    const bus = distance * BUS_RATE;
    const train = distance * TRAIN_RATE;
    const flight = distance * FLIGHT_RATE;

    transportText =
      "🚌 Bus " + formatCurrency(bus) + " | 🚂 Train " + formatCurrency(train) + " | ✈️ Flight " + formatCurrency(flight);

    totalTransportCost = Math.min(bus, train, flight);

    // Determine which mode was selected based on minimum cost
    if (totalTransportCost === bus) selectedMode = "BUS";
    else if (totalTransportCost === train) selectedMode = "TRAIN";
    else selectedMode = "FLIGHT";

  } else if (distance < 1200) {
    const bus = distance * BUS_RATE;
    const train = distance * TRAIN_RATE;
    const flight = distance * FLIGHT_RATE;

    transportText =
      "🚌 Bus " + formatCurrency(bus) + " | 🚂 Train " + formatCurrency(train) + " | ✈️ Flight " + formatCurrency(flight);

    totalTransportCost = Math.min(train, flight);

    // Only train or flight for medium distances
    if (totalTransportCost === train) selectedMode = "TRAIN";
    else selectedMode = "FLIGHT";

  } else {
    const flight = distance * FLIGHT_RATE;
    const airportCost = AIRPORT_TRANSFER;

    transportText = "🚌 Bus to Airport " + formatCurrency(airportCost) + " + ✈️ Flight " + formatCurrency(flight);

    totalTransportCost = airportCost + flight;
    selectedMode = "FLIGHT"; // Primary mode is FLIGHT even though bus transfer is included

    /* Ship option if coastal */
    if (destination.category === "Beach") {
      const ship = distance * SHIP_RATE;
      const shipTotal = PORT_TRANSFER + ship;

      transportText += " | 🚢 Bus to Port " + formatCurrency(PORT_TRANSFER) + " + Ship " + formatCurrency(ship);

      // If ship is cheaper, use ship
      if (shipTotal < totalTransportCost) {
        totalTransportCost = shipTotal;
        selectedMode = "SHIP"; // Primary mode is SHIP
      }
    }
  }

  return {
    text: transportText,
    cost: Math.round(totalTransportCost),
    mode: selectedMode
  };
}

/* Trip calculation */
function calculateTrip(e) {
  e.preventDefault();

  const startKey = document.getElementById("startLocation").value;
  const destId = document.getElementById("destinationSelect").value;

  const destination = destinations.find((d) => d.id == destId);

  if (!startKey || !destination) return;

  const start = cities[startKey];

  const distance = calculateDistance(
    start.lat,
    start.lng,
    destination.latitude,
    destination.longitude,
  );

  const transport = calculateTransport(distance, destination);

  // Update the selected travel mode based on the calculated transport
  selectedTravelMode = transport.mode;

  let activityCost = 0;

  document.querySelectorAll(".activityCheck:checked").forEach((cb) => {
    activityCost += Number(cb.value);
  });

  const total = transport.cost + activityCost;

  document.getElementById("distanceValue").textContent = distance + " km";
  document.getElementById("transportCost").textContent = transport.text;
  document.getElementById("activityCost").textContent = formatCurrency(activityCost);
  document.getElementById("totalCost").textContent = formatCurrency(total);

  /* Remove previous marker */
  if (marker) map.removeLayer(marker);

  /* Remove previous route */
  if (routeLine) map.removeLayer(routeLine);

  /* Add destination marker */
  marker = L.marker([destination.latitude, destination.longitude]).addTo(map);

  /* Draw route line */
  routeLine = L.polyline(
    [
      [start.lat, start.lng],
      [destination.latitude, destination.longitude],
    ],
    {
      weight: 4,
      opacity: 0.8,
    },
  ).addTo(map);

  L.marker([start.lat, start.lng])
  .addTo(map)
  .bindPopup("Start: " + start.name);

  /* Fit map to show both points */
  map.fitBounds(routeLine.getBounds());
}

/* Activity loader */
function setupActivityLoader() {
  document
    .getElementById("destinationSelect")
    .addEventListener("change", (e) => {
      const destId = e.target.value;

      const destination = destinations.find((d) => d.id == destId);

      if (destination) renderActivities(destination);
    });
}

/* read hash to preselect destination on load */
function preselectDestinationFromHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  const select = document.getElementById("destinationSelect");
  if (!select) return;
  select.value = hash;
  select.dispatchEvent(new Event('change'));
}

/* Book trip handler */
async function handleBookTrip() {
  if (!isAuthenticated()) {
    showAlert("❌ Login required to book a trip. Redirecting...", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 500);
    return;
  }

  const destId = document.getElementById("destinationSelect").value;
  let totalAmountText = document.getElementById("totalCost").textContent.trim();
  
  // Parse currency string like "₹2,450" to number
  let totalAmount = parseCurrency(totalAmountText);

  // if amount missing, try computing automatically
  if (!destId) {
    showAlert("Please select a destination", "error");
    return;
  }

  if (!totalAmount || isNaN(totalAmount) || totalAmount === 0) {
    // trigger calculation programmatically
    calculateTrip(new Event('submit'));
    totalAmountText = document.getElementById("totalCost").textContent.trim();
    totalAmount = parseCurrency(totalAmountText);
  }

  if (!totalAmount || isNaN(totalAmount) || totalAmount === 0) {
    showAlert("Please calculate trip cost first", "error");
    return;
  }

  try {
    await post(`${CONFIG.ENDPOINTS.BOOKINGS}/${destId}`, {
      totalAmount,
      startCity: document.getElementById("startLocation").value,
      travelMode: selectedTravelMode
    });

    showAlert("🎉 Trip booked! Check your bookings page.");
    // notify any open bookings page to reload
    window.dispatchEvent(new CustomEvent('bookingChanged', { detail: { destinationId: destId }}));
    setTimeout(() => {
      window.location.href = "bookings.html";
    }, 1500);
  } catch (error) {
    showAlert("Booking failed. " + (error.message || "Try again."), "error");
    console.error(error);
  }
}

/* Setup booking button */
function setupBookingButton() {
  const bookBtn = document.getElementById("bookTripBtn");
  const bookingActions = document.getElementById("bookingActions");

  if (bookBtn) {
    bookBtn.addEventListener("click", handleBookTrip);
  }

  // Show booking actions after first calculation
  const originalCalculateTrip = calculateTrip;
  calculateTrip = function(e) {
    originalCalculateTrip.call(this, e);
    if (bookingActions) {
      bookingActions.style.display = "block";
    }
  };
}

/* Init */
document.addEventListener("DOMContentLoaded", () => {
  initMap();

  loadDestinations().then(() => {
    // attempt to preselect after destinations are loaded
    preselectDestinationFromHash();
  });

  setupActivityLoader();

  setupBookingButton();

  document.getElementById("tripForm").addEventListener("submit", calculateTrip);
});
