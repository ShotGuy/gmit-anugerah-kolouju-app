import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  FileText,
  Home,
  MapPin,
  TrendingUp,
  Upload,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DailyVerse from "@/components/dashboard/DailyVerse";
import DokumenJemaatList from "@/components/dokumen-jemaat/DokumenJemaatList";
import DokumenJemaatProgressBar from "@/components/dokumen-jemaat/DokumenJemaatProgressBar";
import DokumenJemaatUploadModal from "@/components/dokumen-jemaat/DokumenJemaatUploadModal";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import dokumenJemaatService from "@/services/dokumenJemaatService";
import PageTitle from "@/components/ui/PageTitle";

function JemaatDashboard() {
  const { user, refreshUser } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [replaceDocument, setReplaceDocument] = useState(null);

 
  // Check if user profile is incomplete (no idJemaat)
  const isProfileIncomplete = !user?.idJemaat;

  // Fetch upcoming worship schedules
  const { data: upcomingJadwal } = useQuery({
    queryKey: ["upcoming-jadwal", user?.jemaat?.keluarga?.rayon?.id],
    queryFn: async () => {
      if (!user?.jemaat?.keluarga?.rayon?.id) return [];

      const currentDate = new Date();
      const params = new URLSearchParams({
        rayon: user.jemaat.keluarga.rayon.id,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });

      const response = await api.get(`/jadwal-ibadah?${params}`);
      const schedules = response.data.data || [];

      // Filter upcoming schedules (today and future)
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      return schedules
        .filter((jadwal) => new Date(jadwal.tanggal) >= today)
        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
        .slice(0, 3); // Get next 3 upcoming schedules
    },
    enabled: !!user?.jemaat?.keluarga?.rayon?.id,
  });

  // Fetch rejected documents using TanStack Query
  const { data: rejectedDocuments = [], refetch: refetchRejectedDocs } =
    useQuery({
      queryKey: ["rejected-documents", user?.idJemaat],
      queryFn: async () => {
        if (!user?.idJemaat) return [];

        const response = await dokumenJemaatService.getByJemaatId(
          user.idJemaat
        );

        if (response.success) {
          return response.data.filter(
            (doc) => doc.statusDokumen === "REJECTED"
          );
        }

        return [];
      },
      enabled: !!user?.idJemaat,
    });

  const handleUploadSuccess = () => {
    refetchRejectedDocs();
    setReplaceDocument(null);
  };

  const handleReplaceDocument = (document) => {
    setReplaceDocument(document);
    setIsUploadModalOpen(true);
  };

  return (
    <ProtectedRoute allowedRoles="JEMAAT">
      {/* Show onboarding dialog if profile is incomplete */}
      {isProfileIncomplete && (
        <OnboardingDialog user={user} onComplete={refreshUser} />
      )}

      <PageTitle title="Dashboard Jemaat" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard Jemaat
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GMIT Imanuel Oepura
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-12 w-12 text-green-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Selamat datang, {user?.jemaat?.nama || user?.username}!
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Anda masuk sebagai Jemaat. Berikut adalah informasi akun
                    Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Anggota Keluarga
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {user?.jemaat?.keluarga?.jemaats?.length || "4"} Orang
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Home className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Rayon
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {user?.jemaat?.keluarga?.rayon?.namaRayon || "-"}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        No. Bangunan
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {user?.jemaat?.keluarga?.noBagungan || "-"}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Jadwal Mendatang
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {upcomingJadwal?.length || 0} Event
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Verse */}
          <div className="mb-6">
            <DailyVerse />
          </div>

          {/* Document Upload Section */}
          {user?.idJemaat && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <DokumenJemaatProgressBar jemaatId={user.idJemaat} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Dokumen Pribadi</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Upload dan kelola dokumen baptis, sidi, dan nikah Anda untuk
                  melengkapi data gereja.
                </p>
                <button
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Dokumen</span>
                </button>
              </div>
            </div>
          )}

          {/* Rejected Documents Alert */}
          {rejectedDocuments.length > 0 && (
            <div className="mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                      Dokumen Ditolak
                    </h3>
                    <p className="text-red-700 dark:text-red-300 mb-4">
                      {rejectedDocuments.length} dokumen Anda telah ditolak dan
                      perlu diperbaiki. Silakan periksa alasan penolakan dan
                      upload ulang dokumen yang benar.
                    </p>
                    <div className="space-y-3">
                      {rejectedDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-red-900 dark:text-red-200">
                              {doc.tipeDokumen === "BAPTIS"
                                ? "Surat Baptis"
                                : doc.tipeDokumen === "SIDI"
                                  ? "Surat Sidi"
                                  : "Surat Nikah"}
                            </h4>
                            <span className="text-xs text-red-600 dark:text-red-400">
                              Ditolak pada{" "}
                              {new Date(doc.verifiedAt).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          {doc.catatan && (
                            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 text-sm">
                              <strong className="text-red-800 dark:text-red-200">
                                Alasan Penolakan:
                              </strong>
                              <p className="text-red-700 dark:text-red-300 mt-1">
                                {doc.catatan}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex space-x-3">
                      {/* <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        onClick={() => setIsUploadModalOpen(true)}
                      >
                        Upload Dokumen Baru
                      </button> */}
                      {rejectedDocuments.map((doc) => (
                        <button
                          key={`replace-${doc.id}`}
                          className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                          onClick={() => handleReplaceDocument(doc)}
                        >
                          Ganti{" "}
                          {doc.tipeDokumen === "BAPTIS"
                            ? "Surat Baptis"
                            : doc.tipeDokumen === "SIDI"
                              ? "Surat Sidi"
                              : doc.tipeDokumen === "NIKAH"
                                ? "Surat Nikah"
                                : doc.judulDokumen || "Dokumen"}
                        </button>
                      ))}
                      <button
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        onClick={() => refetchRejectedDocs()}
                      >
                        Refresh
                      </button>
                    </div>

                    {/* Individual replace buttons for each rejected document */}
                    <div className="mt-3 space-y-2" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document List Section */}
          {user?.idJemaat && (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Dokumen Saya
                  </h3>
                  <button
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium flex items-center space-x-1"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Dokumen</span>
                  </button>
                </div>

                <DokumenJemaatList jemaatId={user.idJemaat} userRole="JEMAAT" />
              </div>
            </div>
          )}

          {/* Upcoming Worship Schedules */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Jadwal Ibadah Mendatang
                </h3>
                <button
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
                  onClick={() =>
                    (window.location.href = "/jemaat/jadwal-ibadah")
                  }
                >
                  Lihat Semua
                </button>
              </div>

              {upcomingJadwal && upcomingJadwal.length > 0 ? (
                <div className="space-y-4">
                  {upcomingJadwal.map((jadwal) => (
                    <div
                      key={jadwal.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {jadwal.judul}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {jadwal.jenisIbadah?.namaIbadah || "Ibadah"}
                            </span>
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              {jadwal.kategori?.namaKategori || "Umum"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(jadwal.tanggal).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </span>
                          </div>
                          {jadwal.waktuMulai && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>
                                {new Date(
                                  `1970-01-01T${jadwal.waktuMulai}`
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {jadwal.lokasi && (
                        <div className="flex items-center mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{jadwal.lokasi}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada jadwal ibadah mendatang</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div
                className="p-5"
                onClick={() => (window.location.href = "/jemaat/jadwal-ibadah")}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Jadwal Ibadah
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        Lihat jadwal rayon
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div
                className="p-5"
                onClick={() => (window.location.href = "/jemaat/keluarga")}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Keluarga
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        Anggota keluarga
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div
                className="p-5"
                onClick={() => (window.location.href = "/jemaat/profile")}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Profil
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        Edit profil
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Document Upload Modal */}
        {user?.idJemaat && (
          <DokumenJemaatUploadModal
            existingDocument={replaceDocument}
            isOpen={isUploadModalOpen}
            jemaatId={user.idJemaat}
            replaceMode={!!replaceDocument}
            onClose={() => {
              setIsUploadModalOpen(false);
              setReplaceDocument(null);
            }}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

export default JemaatDashboard;
