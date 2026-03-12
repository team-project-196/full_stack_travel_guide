// js/api.js

import CONFIG from "./config.js";
import { getFromStorage } from "./utils.js";

/**
 * Get stored JWT token
 */
function getToken() {
  return getFromStorage("token");
}

/**
 * Generic API request handler
 */
async function request(endpoint, method = "GET", data = null) {
  const url = `${CONFIG.BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    // Check if response has content
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } else {
      return {};
    }
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
}

/**
 * GET request
 */
export function get(endpoint) {
  return request(endpoint, "GET");
}

/**
 * POST request
 */
export function post(endpoint, data) {
  return request(endpoint, "POST", data);
}

/**
 * PUT request
 */
export function put(endpoint, data) {
  return request(endpoint, "PUT", data);
}

/**
 * DELETE request
 */
export function del(endpoint) {
  return request(endpoint, "DELETE");
}
