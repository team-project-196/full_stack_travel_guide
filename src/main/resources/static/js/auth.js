// js/auth.js

import CONFIG from "./config.js";
import { post } from "./api.js";
import { showAlert } from "./ui.js";
import { saveToStorage, getFromStorage, removeFromStorage } from "./utils.js";

/**
 * Handle Login
 */
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await post(CONFIG.ENDPOINTS.LOGIN, {
      email,
      password,
    });

    // Save token
    saveToStorage("token", response.token);
    saveToStorage("user", response.user);

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
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await post(CONFIG.ENDPOINTS.REGISTER, {
      name,
      email,
      password,
    });

    showAlert("Registration successful! Please login.");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    showAlert("Registration failed. Try again.", "error");
  }
}

/**
 * Logout
 */
export function logout() {
  removeFromStorage("token");
  removeFromStorage("user");

  showAlert("Logged out successfully");

  setTimeout(() => {
    window.location.href = "login.html";
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
 * Protect page
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
  }
}

/**
 * Attach event listeners if forms exist
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