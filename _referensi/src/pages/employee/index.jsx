import { useEffect } from "react";
import { useRouter } from "next/router";

export default function EmployeeIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to employee dashboard
    router.replace("/employee/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Mengalihkan ke Portal Pegawai...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      </div>
    </div>
  );
}
