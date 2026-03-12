// js/bookmarks.js

import CONFIG from "./config.js";
import { get, del } from "./api.js";
import { showAlert } from "./ui.js";
import { requireAuth } from "./auth.js";
import { formatCurrency } from "./utils.js";

let bookmarks = [];

/**
 * Remove bookmark
 */
export async function removeBookmark(destinationId) {
  try {
    await del(`${CONFIG.ENDPOINTS.BOOKMARKS}/${destinationId}`);
    showAlert("✅ Bookmark removed");
    loadBookmarks();
  } catch (error) {
    console.error(error);
    showAlert("Failed to remove bookmark", "error");
  }
}

/**
 * Fetch bookmarks from backend
 */
async function loadBookmarks() {
  const container = document.getElementById("bookmarksContainer");
  const loading = document.getElementById("loadingBookmarks");
  const noBookmarks = document.getElementById("noBookmarks");

  if (!container) return;

  try {
    loading.style.display = "block";
    const data = await get(CONFIG.ENDPOINTS.BOOKMARKS);
    // dedupe by destination id
    const seen = new Set();
    bookmarks = data.filter((b) => {
      const id = b.destination?.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    renderBookmarks();
    loading.style.display = "none";
  } catch (error) {
    console.error(error);
    loading.innerText = "Failed to load bookmarks.";
  }
}

/**
 * Render bookmarks on page
 */
function renderBookmarks() {
  const container = document.getElementById("bookmarksContainer");
  const noBookmarks = document.getElementById("noBookmarks");

  if (!container) return;

  container.innerHTML = "";

  if (!bookmarks.length) {
    noBookmarks.style.display = "block";
    return;
  }

  noBookmarks.style.display = "none";

  bookmarks.forEach((bookmark) => {
    const card = document.createElement("div");
    card.className = "destination-card";

    card.innerHTML = `
      <div class="card-image">
        <img src="${bookmark.destination.imageUrl}" alt="${bookmark.destination.name}" />
        <span class="card-category">${bookmark.destination.category}</span>
      </div>

      <div class="card-content">
        <h3>${bookmark.destination.name}</h3>
        <p class="card-location">📍 ${bookmark.destination.country}</p>
        <p class="card-description">${(bookmark.destination.description || "").substring(0, 80)}...</p>
        <p class="card-price">💰 ${formatCurrency(bookmark.destination.basePrice)}</p>

        <div class="card-actions">
          <a href="destinations.html" class="btn-secondary">View Full Details</a>
          <button class="remove-bookmark" data-id="${bookmark.destination.id}">Remove ❌</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Handle remove button
 */
function handleBookmarkActions(event) {
  const destinationId = event.target.dataset.id;

  if (event.target.classList.contains("remove-bookmark")) {
    if (confirm("Are you sure you want to remove this bookmark?")) {
      removeBookmark(destinationId);
    }
  }
}

/**
 * Initialize bookmarks page
 */
document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const container = document.getElementById("bookmarksContainer");

  if (container) {
    loadBookmarks();
    container.addEventListener("click", handleBookmarkActions);
  }

  // refresh when an external bookmark change occurs
  window.addEventListener('bookmarkChanged', () => {
    loadBookmarks();
  });
});