import axios from "axios";

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
export const baseAdminURL = process.env.NEXT_PUBLIC_BASE_ADMIN_URL;
export const baseAppURL = process.env.NEXT_PUBLIC_BASE_APP_URL;
export const baseGoogleURL = process.env.NEXT_PUBLIC_GOOGLE_BASE_URL;

// Backend API base URL for sync operations
export const backendApiURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://hackerz-app-backend-new-production.up.railway.app";
console.log("backendApiURL", backendApiURL)
export const axiosBase = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const axiosAdminInstance = axios.create({
  baseURL: baseAdminURL,
  headers: {
    "Content-Type": "application/json",

  }
});

export const axiosAppInstance = axios.create({
  baseURL: baseAppURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const axiosGoogleInstance = axios.create({
  baseURL: baseGoogleURL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Backend API instance for sync operations (push/pull)
export const axiosBackendInstance = axios.create({
  baseURL: backendApiURL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Block backend API requests when offline so we don't fire failed network calls
axiosBackendInstance.interceptors.request.use((config) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return Promise.reject(
      new Error("You are offline. Data will sync when back online.")
    );
  }
  return config;
});

export default axiosInstance;
