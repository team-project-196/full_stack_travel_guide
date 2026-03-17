// js/nav.js

import { getFromStorage, removeFromStorage } from "./utils.js";
import { logout } from "./auth.js";

/**
 * Setup navigation UI based on authentication status
 * Also checks for admin role and sets up nav links dynamically
 */
export function setupNavigation() {
  const token = getFromStorage("token");
  const userEmail = getFromStorage("email");
  const userRole = getFromStorage("role"); // Store role in localStorage after login

  // Get all nav elements
  const authLinks = document.getElementById("authLinks");
  const logoutContainer = document.getElementById("logoutContainer");
  const navBookmarks = document.getElementById("navBookmarks");
  const navBookings = document.getElementById("navBookings");
  const navAdmin = document.getElementById("navAdmin");
  const logoutBtn = document.getElementById("logoutBtn");
  const tripPlannerLink = document.querySelector('a[href="trip-planner.html"]');

  // If user is not authenticated
  if (!token) {
    // Show auth links (login/register)
    if (authLinks) authLinks.style.display = "block";
    if (logoutContainer) logoutContainer.style.display = "none";
    
    // Hide bookmarks and bookings links
    if (navBookmarks) {
      navBookmarks.parentElement.style.display = "none";
    }
    if (navBookings) {
      navBookings.parentElement.style.display = "none";
    }
    if (navAdmin) {
      navAdmin.parentElement.style.display = "none";
    }
    // Trip Planner is publicly accessible - keep it visible
  } else {
    // User IS authenticated
    if (authLinks) authLinks.style.display = "none";
    if (logoutContainer) logoutContainer.style.display = "list-item"; // ✅ FIX

    // Show bookmarks and bookings links
    if (navBookmarks) {
      navBookmarks.parentElement.style.display = "list-item"; // ✅ FIX
      navBookmarks.href = "bookmarks.html";
    }
    if (navBookings) {
      navBookings.parentElement.style.display = "list-item"; // ✅ FIX
      navBookings.href = "bookings.html";
    }

    // If user is admin, show admin link
    if (userRole === "ADMIN" && navAdmin) {
      navAdmin.parentElement.style.display = "list-item"; // ✅ FIX
      navAdmin.href = "admin.html";
    } else if (navAdmin) {
      navAdmin.parentElement.style.display = "none";
    }

    // Setup logout button
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }
  }
}

/**
 * Check if user is admin
 */
export function isAdmin() {
  return getFromStorage("role") === "ADMIN";
}

/**
 * Get current user role
 */
export function getUserRole() {
  return getFromStorage("role");
}
