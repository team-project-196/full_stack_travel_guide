// js/bookmarks.js

import CONFIG from "./config.js";
import { get, post, del } from "./api.js";
import { showAlert } from "./ui.js";

import { requireAuth } from "./auth.js";

let bookmarks = [];

/**
 * Add bookmark
 */
export async function addBookmark(destinationId) {
  try {
    await post(CONFIG.ENDPOINTS.BOOKMARKS, {
      destinationId: destinationId,
    });

    showAlert("Destination bookmarked!");
  } catch (error) {
    console.error(error);
    showAlert("Failed to bookmark destination", "error");
  }
}

/**
 * Remove bookmark
 */
export async function removeBookmark(bookmarkId) {
  try {
    await del(`${CONFIG.ENDPOINTS.BOOKMARKS}/${bookmarkId}`);

    showAlert("Bookmark removed");

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

  if (!container) return;

  try {
    const data = await get(CONFIG.ENDPOINTS.BOOKMARKS);

    bookmarks = data;

    renderBookmarks();
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Failed to load bookmarks.</p>";
  }
}

/**
 * Render bookmarks on page
 */
function renderBookmarks() {
  const container = document.getElementById("bookmarksContainer");

  if (!container) return;

  container.innerHTML = "";

  if (!bookmarks.length) {
    container.innerHTML = "<p>No bookmarks yet.</p>";
    return;
  }

  bookmarks.forEach((bookmark) => {
    const card = document.createElement("div");
    card.className = "bookmark-card";

    card.innerHTML = `
            <img src="${bookmark.destination.imageUrl}" alt="${bookmark.destination.name}" />

            <div class="card-content">

                <h3>${bookmark.destination.name}</h3>

                <p>${(bookmark.destination.description || "").substring(0, 80)}...</p>

                <button class="remove-bookmark" data-id="${bookmark.id}">
                    Remove
                </button>

            </div>
        `;

    container.appendChild(card);
  });
}

/**
 * Handle remove button
 */
function handleBookmarkActions(event) {
  const id = event.target.dataset.id;

  if (event.target.classList.contains("remove-bookmark")) {
    removeBookmark(id);
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
});