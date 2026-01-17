import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import AdminLayout from "@/components/layout/AdminLayout";
import AdminSystemDashboard from "@/components/system/AdminSystemDashboard";

export default function AdminSystemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading") {
      if (!session) {
        router.push("/login");
        return;
      }

      if (session.user.role !== "admin") {
        router.push("/unauthorized");
        return;
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <AdminLayout>
      <AdminSystemDashboard />
    </AdminLayout>
  );
}