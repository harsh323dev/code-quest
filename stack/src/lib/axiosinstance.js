import axios from "axios";
// If you use toast globally here, import it:
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  // All API calls go to your Render backend
  baseURL: "https://codequest-harsh.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token on every request (if present)
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch {
        // Ignore parse errors
      }
    }
  }
  return config;
});

// Global error handling WITHOUT duplicate signup toast
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: show a generic error only when there is no page‑specific handler
    const status = error?.response?.status;

    if (status >= 500) {
      // Server errors
      toast.error("Server error. Please try again later.");
    }
    // For 4xx (validation, auth) let pages decide what to show
    // so Signup/Login pages can display their own messages.

    return Promise.reject(error);
  }
);

export default axiosInstance;
