import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfilPendetaList from "@/components/profil-pendeta/ProfilPendetaList";
import PageTitle from "@/components/ui/PageTitle";

export default function AdminProfilPendetaPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/admin/dashboard");
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "PENDETA"]}>
      <PageTitle title="Kelola Profil Pendeta" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Kembali ke Dashboard</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <ProfilPendetaList />
        </div>
      </div>
    </ProtectedRoute>
  );
}
