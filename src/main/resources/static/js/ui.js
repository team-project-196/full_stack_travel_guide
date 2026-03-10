// js/ui.js

/**
 * Show alert message
 */
export function showAlert(message, type = "success") {
  const alertBox = document.createElement("div");
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;

  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.remove();
  }, 3000);
}

/**
 * Show loading spinner
 */
export function showLoader(container) {
  if (container.querySelector(".loader")) return;

  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = "Loading...";

  container.appendChild(loader);
}

/**
 * Remove loading spinner
 */
export function hideLoader(container) {
  const loader = container.querySelector(".loader");
  if (loader) loader.remove();
}

/**
 * Open modal
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);

  if (modal) {
    modal.style.display = "block";
  }
}

/**
 * Close modal
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);

  if (modal) {
    modal.style.display = "none";
  }
}

/**
 * Clear form inputs
 */
export function clearForm(formId) {
  const form = document.getElementById(formId);

  if (!form) return;

  const inputs = form.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    input.value = "";
  });
}

/**
 * Show element
 */
export function showElement(elementId) {
  const element = document.getElementById(elementId);

  if (element) {
    element.style.display = "block";
  }
}

/**
 * Hide element
 */
export function hideElement(elementId) {
  const element = document.getElementById(elementId);

  if (element) {
    element.style.display = "none";
  }
}
