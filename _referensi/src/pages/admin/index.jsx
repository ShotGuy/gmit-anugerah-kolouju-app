import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Mengalihkan ke Dashboard Admin...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      </div>
    </div>
  );
}
