import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Home,
  Megaphone,
  Shield,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/router";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DailyVerse from "@/components/dashboard/DailyVerse";
import PageTitle from "@/components/ui/PageTitle";
import { useAuth } from "@/contexts/AuthContext";
import dashboardService from "@/services/dashboardService";

function MajelisDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["majelis-dashboard"],
    queryFn: () => dashboardService.getMajelisDashboard(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const stats = dashboardData?.statistics || {};
  const rayon = dashboardData?.rayon || {};
  const recentJadwal = dashboardData?.recentJadwal || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  if (error) {
    console.error("Dashboard error:", error);
  }

  // Navigation handlers
  const handleNavigateTo = (path) => {
    router.push(path);
  };

  return (
    <ProtectedRoute allowedRoles="MAJELIS">
      <PageTitle
        description={`Dashboard untuk Majelis ${rayon.namaRayon || ""} - GMIT Betlehem Oesapa Barat`}
        title="Dashboard Majelis"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard Majelis
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rayon.namaRayon
                      ? `${rayon.namaRayon} - GMIT Betlehem Oesapa Barat`
                      : "GMIT Betlehem Oesapa Barat"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mb-6 transition-colors">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Selamat datang, {user?.username}!
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Anda masuk sebagai Majelis {rayon.namaRayon || ""}. Kelola
                    administrasi gereja dengan bijak.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {isLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg animate-pulse transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Jemaat
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.totalJemaat || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Home className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Keluarga
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.totalKeluarga || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Ibadah Bulan Ini
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.jadwalBulanIni || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserCheck className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Baptis Bulan Ini
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.baptisBulanIni || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserPlus className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Sidi Tahun Ini
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.sidiTahunIni || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Verse */}
          <div className="mb-8">
            <DailyVerse />
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8 transition-colors">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Akses Cepat
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => handleNavigateTo("/majelis/pengumuman")}
                >
                  <Megaphone className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Pengumuman Rayon
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Kelola pengumuman untuk rayon
                    </p>
                  </div>
                </button>

                <button
                  className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-300 dark:hover:border-green-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onClick={() => handleNavigateTo("/majelis/jadwal-ibadah")}
                >
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Jadwal Ibadah
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Atur jadwal kegiatan ibadah
                    </p>
                  </div>
                </button>

                <button
                  className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  onClick={() => handleNavigateTo("/majelis/keluarga")}
                >
                  <UsersRound className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Data Keluarga
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Kelola data keluarga di rayon
                    </p>
                  </div>
                </button>
              </div>

              {/* Second row of quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <button
                  className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onClick={() => handleNavigateTo("/majelis/jemaat")}
                >
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Data Jemaat
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Kelola data jemaat di rayon
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default MajelisDashboard;
