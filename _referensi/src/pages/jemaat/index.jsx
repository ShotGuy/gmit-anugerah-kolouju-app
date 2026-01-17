import { useRouter } from "next/router";
import { useEffect } from "react";

export default function JemaatIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to jemaat dashboard
    router.replace("/jemaat/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Mengalihkan ke Portal Jemaat...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      </div>
    </div>
  );
}
