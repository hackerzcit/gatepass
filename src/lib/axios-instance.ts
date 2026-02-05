import axios from "axios";
import { signOut } from "next-auth/react";

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
export const baseAdminURL = process.env.NEXT_PUBLIC_BASE_ADMIN_URL;
export const baseAppURL = process.env.NEXT_PUBLIC_BASE_APP_URL;
export const baseGoogleURL = process.env.NEXT_PUBLIC_GOOGLE_BASE_URL;

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

// Create axios interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Get token securely from our API endpoint
      const tokenResponse = await fetch('/api/auth/get-token');

      if (!tokenResponse.ok) {
        throw new Error("Failed to get authentication token");
      }

      const tokenData = await tokenResponse.json();
      console.log("tokenData from request interceptor", tokenData)

      if (tokenData.access_token) {
        config.headers["Authorization"] = `Bearer ${tokenData.access_token}`;
      }
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config;

    // If error is 403 and we haven't retried yet
    if ((error.response?.status === 403 || error.response?.status === 401 || error.response?.status === 400) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from our secure API endpoint
        const tokenResponse = await fetch('/api/auth/get-token');

        if (!tokenResponse.ok) {
          throw new Error("Failed to get refresh token");
        }

        const tokenData = await tokenResponse.json();
        console.log("tokenData from response interceptor", tokenData)

        if (!tokenData.refresh_token) {
          throw new Error("No refresh token available");
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {
            refresh_token: tokenData.refresh_token
          }
        );
        if (response.data && response.data.success) {
          console.log("New access token obtained:", response.data.data.access_token);
          const newAccessToken = response.data.data.access_token;

          // Update the NextAuth session with the new token
          const updateResponse = await fetch('/api/auth/update-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: newAccessToken }),
          });

          if (!updateResponse.ok) {
            console.warn("Failed to update session with new token");
          } else {
            console.log("Session updated with new token");
          }

          // Create a direct axios call that bypasses the interceptors
          // This ensures we use the new token and not the old one from the session
          return axios({
            ...originalRequest,
            baseURL: originalRequest.baseURL || baseURL,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${newAccessToken}`
            }
          });
        }
      } catch (refreshError) {
        console.error("Refresh token error:", refreshError);
        // Force logout on refresh token failure
        await signOut({ callbackUrl: "/" });
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;
