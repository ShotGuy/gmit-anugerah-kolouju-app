import axios from "@/lib/axios";

const TOKEN_KEY = "auth_token";

const authService = {
  // Login user
  login: async (credentials) => {
    const response = await axios.post("/auth/login", credentials);

    if (response.data.success) {
      // Store the JWT token in localStorage
      localStorage.setItem(TOKEN_KEY, response.data.data.token);
      // Axios interceptor will automatically include token in future requests
    }

    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      // Call logout API (axios interceptor will include token automatically)
      await axios.post("/auth/logout");

      // Remove token from localStorage
      localStorage.removeItem(TOKEN_KEY);

      return { success: true };
    } catch (error) {
      console.error("Error during logout:", error);
      // Still clear local data even if API call fails
      localStorage.removeItem(TOKEN_KEY);
      return { success: true };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        return null;
      }

      // Get user details from our API (axios interceptor will include token automatically)
      const response = await axios.get("/auth/me");

      return response.data.data;
    } catch (error) {
      console.error("Error getting current user:", error);
      // If token is invalid, clear it
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  // Get redirect URL based on user role
  getRoleRedirectUrl: (role) => {
    switch (role) {
      case "ADMIN":
      case "PENDETA": // PENDETA has same access as ADMIN
        return "/admin/dashboard";
      case "JEMAAT":
        return "/jemaat/dashboard";
      case "MAJELIS":
        return "/majelis/dashboard";
      case "EMPLOYEE":
        return "/employee/dashboard";
      default:
        return "/dashboard";
    }
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Set token (for external use)  
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    // Axios interceptor will automatically include token in future requests
  },

  // Initialize auth service (call this on app start)
  init: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    // Axios interceptor will automatically include token if it exists
    return !!token;
  },
};

export default authService;
