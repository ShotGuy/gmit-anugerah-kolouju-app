import axios from "axios";

// Create an Axios instance with default configs
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to automatically include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");

        // Only redirect to login if NOT already on login page
        // This prevents refresh loop when login fails
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
