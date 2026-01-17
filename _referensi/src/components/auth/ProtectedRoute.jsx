import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import LoadingScreen from "../ui/LoadingScreen";

import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = null, fallback = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/login");

      return;
    }

    // Check if user has required role
    if (allowedRoles) {
      const hasRequiredRole = Array.isArray(allowedRoles)
        ? allowedRoles.includes(user?.role)
        : user?.role === allowedRoles;

      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on user's role
        const userDashboard = getRoleRedirectUrl(user?.role);

        router.push(userDashboard);

        return;
      }
    }

    setIsAuthorized(true);
  }, [isAuthenticated, user, loading, allowedRoles, router]);

  const getRoleRedirectUrl = (role) => {
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
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show fallback or nothing while redirecting
  if (!isAuthorized) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          {/* <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Memverifikasi akses...</p>
          </div> */}
          <LoadingScreen isLoading={loading} />
        </div>
      )
    );
  }

  return children;
};

export default ProtectedRoute;
