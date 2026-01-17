"use client";

import {
  Activity,
  BarChart3,
  Building,
  Calendar,
  Heart,
  MapPin,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { formatNumber, formatPercentage } from "@/lib/formatUtils";
import analyticsService from "@/services/analyticsService";

// Import custom chart components
import CustomAreaChart from "@/components/charts/AreaChart";
import CustomBarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import CustomPieChart from "@/components/charts/PieChart";
import PageTitle from "@/components/ui/PageTitle";

export default function AnalyticsPageAdmin() {
  const [analytics, setAnalytics] = useState({
    overview: {},
    demographics: {},
    sacraments: {},
    trends: {},
    distributions: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("year");

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getFullAnalytics(selectedPeriod);

        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
        setError("Gagal memuat data analitik");
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Memuat analitik...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <Button onClick={() => window.location.reload()}>Muat Ulang</Button>
        </div>
      </div>
    );
  }

  const headerStats = [
    {
      label: "Total Anggota",
      value: formatNumber(analytics.overview.totalMembers || 0),
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: `+${analytics.trends.memberGrowth || 0}% tahun ini`,
      changeType: "positive",
    },
    {
      label: "Pertumbuhan",
      value: formatPercentage(analytics.trends.growthRate || 0),
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "Vs tahun lalu",
      changeType: "positive",
    },
    {
      label: "Aktivitas Sakramen",
      value: analytics.sacraments.totalThisYear || 0,
      icon: Activity,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "Tahun ini",
      changeType: "neutral",
    },
    {
      label: "Keluarga Aktif",
      value: formatNumber(analytics.overview.activeFamilies || 0),
      icon: Building,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      change: `${analytics.distributions.avgMembersPerFamily || 0} rata-rata/keluarga`,
      changeType: "neutral",
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Analitik" }]}
        description="Analisis komprehensif data gereja dan tren keanggotaan"
        stats={headerStats}
        title="Analitik & Statistik"
      />

      <PageTitle title="Analitik & Statistik" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Period Selector */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            📊 Visualisasi Data Komprehensif
          </h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedPeriod === "month" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("month")}
            >
              Bulan Ini
            </Button>
            <Button
              size="sm"
              variant={selectedPeriod === "year" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("year")}
            >
              Tahun Ini
            </Button>
            <Button
              size="sm"
              variant={selectedPeriod === "all" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("all")}
            >
              Semua Data
            </Button>
          </div>
        </div>

        {/* Charts Section 1: Gender & Age Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Distribusi Jenis Kelamin
              </CardTitle>
              <CardDescription>
                Perbandingan jemaat pria dan wanita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomPieChart
                data={[
                  {
                    name: "Pria",
                    value: analytics.demographics.maleCount || 0,
                    total: analytics.overview.totalMembers || 0,
                  },
                  {
                    name: "Wanita",
                    value: analytics.demographics.femaleCount || 0,
                    total: analytics.overview.totalMembers || 0,
                  },
                ]}
                height={300}
                showLabels={true}
                showLegend={true}
              />
            </CardContent>
          </Card>

          {/* Age Distribution Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Distribusi Usia
              </CardTitle>
              <CardDescription>
                Sebaran jemaat berdasarkan kelompok usia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={[
                  {
                    name: "Anak (0-12)",
                    value: analytics.demographics.childrenCount || 0,
                  },
                  {
                    name: "Remaja (13-25)",
                    value: analytics.demographics.youthCount || 0,
                  },
                  {
                    name: "Dewasa (26-59)",
                    value: analytics.demographics.adultCount || 0,
                  },
                  {
                    name: "Lansia (60+)",
                    value: analytics.demographics.elderlyCount || 0,
                  },
                ]}
                height={300}
                showTotal={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Section 2: Sacraments Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sacraments Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Total Sakramen
              </CardTitle>
              <CardDescription>
                Perbandingan total baptis, sidi, dan pernikahan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomBarChart
                barColor="#3B82F6"
                data={[
                  {
                    name: "Baptis",
                    value: analytics.sacraments.baptisTotal || 0,
                    percentage: 0,
                  },
                  {
                    name: "Sidi",
                    value: analytics.sacraments.sidiTotal || 0,
                    percentage: 0,
                  },
                  {
                    name: "Pernikahan",
                    value: analytics.sacraments.pernikahanTotal || 0,
                    percentage: 0,
                  },
                ]}
                height={300}
                showGrid={true}
              />
            </CardContent>
          </Card>

          {/* Sacraments This Year Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sakramen Tahun Ini
              </CardTitle>
              <CardDescription>
                Aktivitas sakramen dalam periode ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={[
                  {
                    name: "Baptis",
                    value: analytics.sacraments.baptisThisYear || 0,
                  },
                  {
                    name: "Sidi",
                    value: analytics.sacraments.sidiThisYear || 0,
                  },
                  {
                    name: "Pernikahan",
                    value: analytics.sacraments.pernikahanThisYear || 0,
                  },
                ]}
                height={300}
                showTotal={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Section 3: Distribution Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rayon Distribution Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Distribusi Per Rayon
              </CardTitle>
              <CardDescription>Sebaran jemaat di setiap rayon</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomBarChart
                barColor="#10B981"
                data={(analytics.distributions.rayonStats || []).map(
                  (rayon) => ({
                    name: rayon.name,
                    value: rayon.members,
                    percentage: rayon.percentage,
                  })
                )}
                height={400}
                showGrid={true}
              />
            </CardContent>
          </Card>

          {/* Education Distribution Horizontal Bar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribusi Pendidikan
              </CardTitle>
              <CardDescription>Tingkat pendidikan jemaat</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomBarChart
                barColor="#8B5CF6"
                data={(analytics.distributions.educationStats || []).map(
                  (education) => ({
                    name: education.level,
                    value: education.count,
                    percentage: education.percentage,
                  })
                )}
                height={400}
                showGrid={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Section 4: Job Distribution & Age Area Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Top 10 Pekerjaan
              </CardTitle>
              <CardDescription>Distribusi pekerjaan jemaat</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomBarChart
                barColor="#F59E0B"
                data={(analytics.distributions.jobStats || [])
                  .slice(0, 10)
                  .map((job) => ({
                    name: job.job,
                    value: job.count,
                    percentage: job.percentage,
                  }))}
                height={400}
                showGrid={true}
              />
            </CardContent>
          </Card>

          {/* Age Demographics Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Komposisi Usia Detail
              </CardTitle>
              <CardDescription>
                Visualisasi sebaran kelompok usia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomAreaChart
                areas={[
                  {
                    dataKey: "children",
                    color: "#3B82F6",
                    name: "Anak (0-12)",
                  },
                  {
                    dataKey: "youth",
                    color: "#10B981",
                    name: "Remaja (13-25)",
                  },
                  {
                    dataKey: "adult",
                    color: "#F59E0B",
                    name: "Dewasa (26-59)",
                  },
                  {
                    dataKey: "elderly",
                    color: "#8B5CF6",
                    name: "Lansia (60+)",
                  },
                ]}
                data={[
                  {
                    name: "Anak",
                    children: analytics.demographics.childrenCount || 0,
                    youth: 0,
                    adult: 0,
                    elderly: 0,
                  },
                  {
                    name: "Remaja",
                    children: 0,
                    youth: analytics.demographics.youthCount || 0,
                    adult: 0,
                    elderly: 0,
                  },
                  {
                    name: "Dewasa",
                    children: 0,
                    youth: 0,
                    adult: analytics.demographics.adultCount || 0,
                    elderly: 0,
                  },
                  {
                    name: "Lansia",
                    children: 0,
                    youth: 0,
                    adult: 0,
                    elderly: analytics.demographics.elderlyCount || 0,
                  },
                ]}
                height={400}
                showLegend={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Section 5: Ethnic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ethnic Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Distribusi Suku
              </CardTitle>
              <CardDescription>Keberagaman etnis jemaat</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomPieChart
                data={(analytics.distributions.ethnicStats || [])
                  .slice(0, 8)
                  .map((ethnic) => ({
                    name: ethnic.ethnicity,
                    value: ethnic.count,
                    total: analytics.overview.totalMembers || 0,
                  }))}
                height={400}
                showLabels={true}
                showLegend={true}
              />
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ringkasan Statistik
              </CardTitle>
              <CardDescription>Insight dan tren utama</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rata-rata per Keluarga
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(analytics.distributions.avgMembersPerFamily || 0).toFixed(
                      1
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    orang/keluarga
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rasio Gender
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {(
                      (analytics.demographics.maleCount || 0) /
                      (analytics.demographics.femaleCount || 1)
                    ).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    pria:wanita
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aktivitas Baptis/Bulan
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {analytics.trends.avgBaptisPerMonth || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    rata-rata
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Sakramen
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(analytics.sacraments.baptisTotal || 0) +
                      (analytics.sacraments.sidiTotal || 0) +
                      (analytics.sacraments.pernikahanTotal || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    sepanjang masa
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  📈 Insight Utama:
                </h4>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>
                    • Kelompok terbesar: Dewasa (
                    {formatPercentage(
                      analytics.demographics.adultPercentage || 0
                    )}
                    %)
                  </li>
                  <li>
                    • Gender balance:{" "}
                    {analytics.demographics.malePercentage >
                    analytics.demographics.femalePercentage
                      ? "Pria lebih dominan"
                      : "Wanita lebih dominan"}
                  </li>
                  <li>
                    • Total keluarga aktif:{" "}
                    {analytics.overview.activeFamilies || 0} keluarga
                  </li>
                  <li>
                    • Aktivitas tahun ini:{" "}
                    {analytics.sacraments.totalThisYear || 0} sakramen
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// Add layout to component
AnalyticsPageAdmin.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
