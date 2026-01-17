"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  DollarSign,
  PinIcon,
  UserCheck,
  Users,
} from "lucide-react";

import DailyVerse from "@/components/dashboard/DailyVerse";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageHeader from "@/components/ui/PageHeader";
import PageTitle from "@/components/ui/PageTitle";
import { formatNumber } from "@/lib/formatUtils";
import dashboardService from "@/services/dashboardService";
import { getEventTypeBadge, getStatusBadge } from "@/utils/common";

export default function DashboardPageAdmin() {
  // Query untuk dashboard stats dengan caching
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 menit - data dianggap fresh
    cacheTime: 30 * 60 * 1000, // 30 menit - data tetap di cache
    refetchOnWindowFocus: false, // Tidak refetch saat window focus
    refetchOnMount: false, // Tidak refetch saat component mount jika sudah ada cache
  });

  // Query untuk recent activities dengan caching
  const { data: recentActivities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: dashboardService.getRecentActivities,
    staleTime: 2 * 60 * 1000, // 2 menit
    cacheTime: 15 * 60 * 1000, // 15 menit
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Query untuk upcoming events dengan caching
  const { data: upcomingEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: dashboardService.getUpcomingEvents,
    staleTime: 5 * 60 * 1000, // 5 menit
    cacheTime: 30 * 60 * 1000, // 30 menit
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const loading = statsLoading || activitiesLoading || eventsLoading;
  const error = null; // Error handling akan di-handle oleh React Query

  const headerStats = [
    {
      label: "Total Jemaat",
      value: formatNumber(stats?.totalMembers || 0),
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: `${stats?.sacraments?.baptis?.thisYear || 0} baptis tahun ini`,
      changeType: "positive",
    },
    {
      label: "Total Keluarga",
      value: formatNumber(stats?.totalFamilies || 0),
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: `${stats?.membersByGender?.male || 0}L, ${stats?.membersByGender?.female || 0}P`,
      changeType: "neutral",
    },
    {
      label: "Jadwal Ibadah",
      value: upcomingEvents.length,
      icon: Calendar,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "Mendatang",
      changeType: "neutral",
    },
    {
      label: "Baptis & Sidi",
      value: `${stats?.sacraments?.baptis?.total || 0}/${stats?.sacraments?.sidi?.total || 0}`,
      icon: AlertCircle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      change: "Total baptis/sidi",
      changeType: "neutral",
    },
  ];

  // Show loading screen saat pertama kali load
  if (loading && !stats) {
    return <LoadingScreen isLoading={true} message="Memuat dashboard..." />;
  }

  return (
    <>
      <PageTitle title="Dashboard Utama Gereja" />
      <PageHeader
        // breadcrumb={[
        //   // { label: "Admin", href: "/admin" },
        //   { label: "Dashboard" },
        // ]}
        description="Ringkasan sistem administrasi GMIT Imanuel Oepura"
        stats={headerStats}
        title="Dashboard"
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pernikahan
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.sacraments?.pernikahan?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total Pernikahan
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jemaat Remaja
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.ageGroups?.youth || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Jemaat Remaja (13-25)
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Daily Verse Card */}
          <div className="md:col-span-2 lg:col-span-1">
            <DailyVerse />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>
                Kegiatan administrasi terbaru di gereja
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{activity.member}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {activity.type} • {activity.date}
                        </p>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  ))}
                </div>
              )}
              {/* <div className="mt-4">
                <Button className="w-full" variant="outline">
                  Lihat Semua Aktivitas
                </Button>
              </div> */}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Ibadah</CardTitle>
              <CardDescription>
                Jadwal ibadah dan kegiatan gereja mendatang
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        </div>
                        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {event.date} • {event.time}
                            </p>
                            {event.location && (
                              <p className="text-xs text-gray-600 mt-1">
                                <PinIcon /> {event.location}
                              </p>
                            )}
                            {event.speaker &&
                              event.speaker !== "Belum ditentukan" && (
                                <p className="text-xs text-gray-600">
                                  👤 {event.speaker}
                                </p>
                              )}
                            {event.tema && (
                              <p className="text-xs text-blue-600 font-medium mt-1">
                                {event.tema}
                              </p>
                            )}
                            {event.firman && (
                              <p className="text-xs text-green-600">
                                📖 {event.firman}
                              </p>
                            )}
                            {event.rayon && (
                              <p className="text-xs text-purple-600">
                                🏘️ Rayon {event.rayon}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            {getEventTypeBadge(event.type)}
                            {event.kategori && (
                              <Badge className="text-xs" variant="outline">
                                {event.kategori}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">
                        Tidak ada jadwal ibadah mendatang
                      </p>
                      <p className="text-xs mt-1">
                        Hubungi administrator untuk menambah jadwal
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Fungsi administrasi yang sering digunakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                className="flex flex-col items-center p-6 h-auto"
                onClick={() => (window.location.href = "/admin/jemaat")}
              >
                <Users className="h-6 w-6 mb-2" />
                <span>Kelola Jemaat</span>
              </Button>
              <Button
                className="flex flex-col items-center p-6 h-auto"
                variant="outline"
                onClick={() => (window.location.href = "/admin/keluarga")}
              >
                <Calendar className="h-6 w-6 mb-2" />
                <span>Kelola Keluarga</span>
              </Button>
              <Button
                className="flex flex-col items-center p-6 h-auto"
                variant="outline"
                onClick={() => (window.location.href = "/admin/baptis")}
              >
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Data Baptis</span>
              </Button>
              <Button
                className="flex flex-col items-center p-6 h-auto"
                variant="outline"
                onClick={() => (window.location.href = "/admin/sidi")}
              >
                <DollarSign className="h-6 w-6 mb-2" />
                <span>Data Sidi</span>
              </Button>
              <Button
                className="flex flex-col items-center p-6 h-auto"
                variant="outline"
                onClick={() => (window.location.href = "/admin/rayon")}
              >
                <Users className="h-6 w-6 mb-2" />
                <span>Kelola Rayon</span>
              </Button>
              <Button
                className="flex flex-col items-center p-6 h-auto"
                variant="outline"
                onClick={() =>
                  (window.location.href = "/admin/data-master/klasis")
                }
              >
                <Calendar className="h-6 w-6 mb-2" />
                <span>Data Klasis</span>
              </Button>
              <Button
                className="flex flex-col items-center p-6 h-auto"
                variant="outline"
                onClick={() => (window.location.href = "/admin/users")}
              >
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Kelola User</span>
              </Button>
              <Button
                className="flex flex-col items-center p-6 h-auto"
                variant="outline"
                onClick={() => (window.location.href = "/admin/laporan")}
              >
                <DollarSign className="h-6 w-6 mb-2" />
                <span>Laporan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Add layout to component
DashboardPageAdmin.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
