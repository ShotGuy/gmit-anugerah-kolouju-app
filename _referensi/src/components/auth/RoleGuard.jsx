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
  const redirectingRef = useRef(false);

  // Helper function to get role-based redirect
  function getRoleBasedRedirect(userRole) {
    const roleRedirects = {
      ADMIN: "/admin/dashboard",
      PENDETA: "/admin/dashboard", // PENDETA has same access as ADMIN
      MAJELIS: "/majelis/dashboard",
      EMPLOYEE: "/employee/dashboard",
      JEMAAT: "/jemaat/dashboard",
    };

    return roleRedirects[userRole] || "/login";
  }

  useEffect(() => {
    // Skip if loading or already redirecting
    if (loading || redirectingRef.current) {
      return;
    }

    // User not authenticated
    if (!user) {
      // Only redirect if not already on login page
      if (router.pathname !== "/login") {
        redirectingRef.current = true;
        router.replace("/login").finally(() => {
          redirectingRef.current = false;
        });
      }
      setIsAuthorized(false);

      return;
    }

    // User authenticated - check role authorization
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Role not allowed - redirect to appropriate dashboard
      const redirectPath = redirectTo || getRoleBasedRedirect(user.role);

      // Only redirect if not already on the target path
      if (router.pathname !== redirectPath) {
        redirectingRef.current = true;
        router.replace(redirectPath).finally(() => {
          redirectingRef.current = false;
        });
      }
      setIsAuthorized(false);

      return;
    }

    // User is authorized
    setIsAuthorized(true);
  }, [user, loading, allowedRoles, router, redirectTo]);

  // Show loading while checking authentication
  if (loading || redirectingRef.current || !isAuthorized) {
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
  return <RoleGuard allowedRoles={["ADMIN", "PENDETA"]}>{children}</RoleGuard>;
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
