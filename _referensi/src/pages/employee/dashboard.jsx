import { useQuery } from "@tanstack/react-query";
import { Briefcase, Calendar, FileText, User } from "lucide-react";
import { useRouter } from "next/router";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DailyVerse from "@/components/dashboard/DailyVerse";
import { getRoleConfig } from "@/config/navigationItem";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/lib/axios";

function EmployeeDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const employeeConfig = getRoleConfig("employee");

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employeeDashboard"],
    queryFn: async () => {
      const response = await axios.get("/dashboard/employee");

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Gagal mengambil data dashboard"
        );
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles="EMPLOYEE">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            <span className="text-gray-700 dark:text-gray-300">
              Memuat data dashboard...
            </span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles="EMPLOYEE">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error.message}
            </p>
            <button
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const { statistics } = dashboardData;

  return (
    <ProtectedRoute allowedRoles="EMPLOYEE">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard Pegawai
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    GMIT Imanuel Oepura
                  </p>
                </div>
              </div>
              {/* <div className="flex items-center space-x-4">
                <div className="text-right">S
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <LogoutButton variant="secondary" />
              </div> */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mb-6 transition-colors">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                {/* <div className="flex-shrink-0">
                  <Briefcase className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                </div> */}
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Selamat datang, {user?.username}!
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Anda masuk sebagai Employee. Kelola tugas dan kegiatan
                    harian Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Church Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Data Baptis
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {statistics?.totalBaptis || 0}
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
                    <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Data Sidi
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {statistics?.totalSidi || 0}
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
                    <Calendar className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Data Pernikahan
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {statistics?.totalPernikahan || 0}
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
                    <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Data Atestasi
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {statistics?.totalAtestasi || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                {employeeConfig.navigation
                  .filter(
                    (item) =>
                      !item.children && item.href !== "/employee/dashboard"
                  )
                  .slice(0, 3)
                  .map((item) => {
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.href}
                        className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => router.push(item.href)}
                      >
                        <IconComponent className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Kelola {item.label.toLowerCase()}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default EmployeeDashboard;
