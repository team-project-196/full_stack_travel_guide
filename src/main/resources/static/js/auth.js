// js/auth.js

import CONFIG from "./config.js";
import { post } from "./api.js";
import { showAlert } from "./ui.js";
import { saveToStorage, getFromStorage, removeFromStorage } from "./utils.js";

/**
 * Handle Login
 */
export async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAlert("Please fill in all fields", "error");
    return;
  }

  try {
    const response = await post(CONFIG.ENDPOINTS.LOGIN, {
      email,
      password,
    });

    // backend returns a successful 200 even for bad credentials, so
    // check for the token explicitly before proceeding.
    if (!response || !response.token) {
      // display message from server if available, otherwise generic text
      showAlert(response?.message || "Invalid credentials", "error");
      return;
    }

    // Save token, email & role
    saveToStorage("token", response.token);
    saveToStorage("email", email);
    if (response.role) {
      saveToStorage("role", response.role);
    }

    showAlert("Login successful!");

    // Redirect to destinations page
    setTimeout(() => {
      window.location.href = "destinations.html";
    }, 1000);
  } catch (error) {
    showAlert(error.message || "Login failed.", "error");
  }
}

/**
 * Handle Registration
 */
export async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!name || !email || !password || !confirmPassword) {
    showAlert("Please fill in all fields", "error");
    return;
  }

  if (password !== confirmPassword) {
    showAlert("Passwords do not match", "error");
    return;
  }

  if (password.length < 8) {
    showAlert("Password must be at least 8 characters", "error");
    return;
  }

  try {
    const response = await post(CONFIG.ENDPOINTS.REGISTER, {
      name,
      email,
      password,
    });

    showAlert("Registration successful! Please login.");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    showAlert("Registration failed. " + (error.message || "Try again."), "error");
  }
}

/**
 * Logout
 */
export function logout() {
  removeFromStorage("token");
  removeFromStorage("email");
  removeFromStorage("role");

  showAlert("Logged out successfully");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

/**
 * Check if user is logged in
 */
export function isAuthenticated() {
  const token = getFromStorage("token");
  return !!token;
}

/**
 * Get current user email
 */
export function getCurrentUserEmail() {
  return getFromStorage("email");
}

/**
 * Protect page - redirect to login if not authenticated
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
  }
}

/**
 * Attach event listeners
 */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("msg") === "login-required") {
    showAlert("Please login to access that feature", "error");
  }

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
});