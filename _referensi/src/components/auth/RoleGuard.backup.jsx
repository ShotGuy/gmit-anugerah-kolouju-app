import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import LoadingScreen from "../ui/LoadingScreen";

import { useAuth } from "@/contexts/AuthContext";

/**
 * RoleGuard component to protect routes based on user roles
 * Prevents unauthorized access between different role dashboards
 */
export default function RoleGuard({
  children,
  allowedRoles = [],
  redirectTo = null,
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const hasRedirected = useRef(false);

  // Reset redirect flag on route change
  useEffect(() => {
    const handleRouteChange = () => {
      hasRedirected.current = false;
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    // Don't run if loading or already redirected
    if (loading || hasRedirected.current) return;

    if (!user) {
      // User not authenticated - only redirect if not already on login
      if (router.pathname !== "/login") {
        hasRedirected.current = true;
        router.replace("/login");
      }

      return;
    }

    // Check if user role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Role not allowed - redirect to appropriate dashboard
      const redirectPath = redirectTo || getRoleBasedRedirect(user.role);

      // Only redirect if not already on the target path
      if (router.pathname !== redirectPath) {
        hasRedirected.current = true;
        router.replace(redirectPath);
      }

      return;
    }

    // User is authorized
    setIsAuthorized(true);
  }, [user, loading, router.pathname, allowedRoles, redirectTo]);

  // Helper function to get role-based redirect
  function getRoleBasedRedirect(userRole) {
    const roleRedirects = {
      ADMIN: "/admin/dashboard",
      MAJELIS: "/majelis/dashboard",
      EMPLOYEE: "/employee/dashboard",
      JEMAAT: "/jemaat/dashboard",
    };

    return roleRedirects[userRole] || "/login";
  }

  // Show loading while checking authentication
  if (
    loading ||
    (!user && !hasRedirected.current) ||
    (user &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role) &&
      !hasRedirected.current) ||
    !isAuthorized
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Memverifikasi akses...
          </p> */}

          <LoadingScreen isLoading={loading} />
        </div>
      </div>
    );
  }

  return children;
}

/**
 * Higher-order component for protecting admin routes
 */
export function AdminGuard({ children }) {
  return <RoleGuard allowedRoles={["ADMIN"]}>{children}</RoleGuard>;
}

/**
 * Higher-order component for protecting majelis routes
 */
export function MajelisGuard({ children }) {
  return <RoleGuard allowedRoles={["MAJELIS"]}>{children}</RoleGuard>;
}

/**
 * Higher-order component for protecting employee routes
 */
export function EmployeeGuard({ children }) {
  return <RoleGuard allowedRoles={["EMPLOYEE"]}>{children}</RoleGuard>;
}

/**
 * Higher-order component for protecting jemaat routes
 */
export function JemaatGuard({ children }) {
  return <RoleGuard allowedRoles={["JEMAAT"]}>{children}</RoleGuard>;
}

/**
 * Higher-order component for protecting staff-only routes (admin, majelis, employee)
 */
export function StaffGuard({ children }) {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MAJELIS", "EMPLOYEE"]}>
      {children}
    </RoleGuard>
  );
}
