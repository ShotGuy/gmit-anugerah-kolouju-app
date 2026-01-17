import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import authService from "@/services/authService";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
  console.warn(
      "useAuth called outside of AuthProvider. Some auth features may not work."
    );

    return {
      user: null,
      login: async () => ({ success: false, message: "Auth not initialized" }),
      logout: async () => {},
      hasRole: () => false,
      isAuthenticated: false,
      loading: false,
    };
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session - only run once on mount
    const getInitialSession = async () => {
      try {
        // Initialize auth service and check if authenticated
        const isAuth = authService.init();

        if (isAuth) {
          const userData = await authService.getCurrentUser();

          setUser(userData);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();
  }, []); // Empty dependency array - only run once

  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await authService.login(credentials);

      if (result.success) {
        const userData = await authService.getCurrentUser();

        setUser(userData);
        toast.success("Login berhasil");

        // Redirect based on role
        const redirectUrl =
          result.data.redirect_url ||
          authService.getRoleRedirectUrl(userData?.role || "JEMAAT");

        router.push(redirectUrl);

        return { success: true };
      } else {
        toast.error(result.message || "Login gagal");

        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Terjadi kesalahan saat login";

      toast.error(errorMessage);

      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      toast.success("Logout berhasil");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Terjadi kesalahan saat logout");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();

        setUser(userData);

        return userData;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }

    return null;
  };

  const hasRole = (roles) => {
    if (!user || !user.role) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    login,
    logout,
    refreshUser,
    hasRole,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
