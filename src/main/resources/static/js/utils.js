// js/utils.js

/**
 * Save data to localStorage
 */
export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Get data from localStorage
 */
export function getFromStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key) {
  localStorage.removeItem(key);
}

/**
 * Format date (YYYY-MM-DD → readable)
 */
export function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Debounce function (used for search input)
 */
export function debounce(func, delay = 300) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Generate random ID
 */
export function generateId() {
  return "_" + Math.random().toString(36).slice(2, 11);
}

/**
 * Capitalize first letter
 */
export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
