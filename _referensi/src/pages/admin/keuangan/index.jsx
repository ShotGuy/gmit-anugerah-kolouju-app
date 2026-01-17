
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronRight,
  DollarSign,
  Filter,
  LayoutDashboard,
  PieChart as PieIcon,
  Target,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

export default function KeuanganDashboard() {
  const router = useRouter();
  const [selectedPeriode, setSelectedPeriode] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("root"); // 'root' means top level

  // 1. Fetch Periode List
  const { data: periodeList, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ["periode-list"],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/periode", {
        params: { limit: 50, isActive: true },
      });
      return response.data.data.items;
    },
    onSuccess: (data) => {
      // Auto-select active period if none selected
      if (!selectedPeriode && data.length > 0) {
        const active = data.find((p) => p.status === "AKTIF");
        if (active) setSelectedPeriode(active.id);
      }
    },
  });

  // 2. Fetch Aggregated Summary Data
  const { data: summaryData, isLoading: isLoadingData } = useQuery({
    queryKey: ["realisasi-summary-aggregated", selectedPeriode],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/realisasi/summary", {
        params: { periodeId: selectedPeriode },
      });
      return response.data.data; // { items: [], summary: {} }
    },
    enabled: !!selectedPeriode,
  });

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // 3. Process Data for Visualization based on Selection
  const dashboardData = useMemo(() => {
    if (!summaryData || !summaryData.items) return null;

    const allItems = summaryData.items;

    // Determine the "Current Scope" item (The parent we are looking at)
    // If 'root', we are looking at top-level items (level 1 usually, or items with no parent)
    let currentScopeItem = null;
    let childItems = [];

    if (selectedParentId === "root") {
      // Logic: Get items with level 1 or no parent
      childItems = allItems.filter(
        (i) => i.level === 1 || !i.parentId || i.parentId === null
      );

      // Calculate total scope stats manually from children for Root view
      currentScopeItem = {
        nama: "Ringkasan Eksekutif (All)",
        kode: "ALL",
        totalTarget: childItems
          .reduce((sum, i) => sum + parseFloat(i.totalTarget || 0), 0)
          .toString(),
        totalRealisasiAmount: childItems
          .reduce((sum, i) => sum + parseFloat(i.totalRealisasiAmount || 0), 0)
          .toString(),
      };
    } else {
      currentScopeItem = allItems.find((i) => i.id === selectedParentId);
      if (currentScopeItem) {
        childItems = allItems.filter((i) => i.parentId === selectedParentId);
      }
    }

    if (!currentScopeItem) return null;

    // A. Chart Data: Bar Chart (Target vs Realisasi per Child)
    const barChartData = childItems.map((child) => ({
      name: child.nama.length > 20 ? child.nama.substring(0, 20) + "..." : child.nama,
      full_name: child.nama,
      kode: child.kode,
      target: parseFloat(child.totalTarget || 0),
      realisasi: parseFloat(child.totalRealisasiAmount || 0),
      capaian: parseFloat(child.achievementPercentage || 0),
    }));

    // B. Chart Data: Donut Chart (Composition of Realization)
    const compositionData = childItems
      .map((child) => ({
        name: child.nama,
        value: parseFloat(child.totalRealisasiAmount || 0),
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);

    // C. Statistics for Cards
    const stats = {
      target: parseFloat(currentScopeItem.totalTarget || 0),
      realisasi: parseFloat(currentScopeItem.totalRealisasiAmount || 0),
      variance:
        parseFloat(currentScopeItem.totalRealisasiAmount || 0) -
        parseFloat(currentScopeItem.totalTarget || 0),
      percentage:
        parseFloat(currentScopeItem.totalTarget || 0) > 0
          ? (parseFloat(currentScopeItem.totalRealisasiAmount || 0) /
            parseFloat(currentScopeItem.totalTarget || 0)) *
          100
          : 0,
    };

    return {
      currentScopeItem,
      childItems,
      barChartData,
      compositionData,
      stats,
      allItems, // Pass through for searching/filtering in dropdown
    };
  }, [summaryData, selectedParentId]);

  // Handle Loading
  if (isLoadingPeriode) return <LoadingScreen message="Memuat periode..." />;

  // Define colors for charts
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
      <Head>
        <title>Dashboard Statistik Keuangan | GMIT J-BOB</title>
      </Head>

      <div className="p-6">
        <PageHeader
          title="Analisis Keuangan"
          description="Pusat data statistik dan monitoring anggaran gereja"
          breadcrumb={[
            { label: "Admin", href: "/admin" },
            { label: "Keuangan", href: "/admin/keuangan" },
          ]}
        />

        {/* --- Top Filters --- */}
        <Card className="mb-6 shadow-sm border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 1. Periode Selector */}
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Periode Anggaran
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <select
                    value={selectedPeriode}
                    onChange={(e) => {
                      setSelectedPeriode(e.target.value);
                      setSelectedParentId("root"); // Reset drill-down
                    }}
                    className="w-full pl-11 pr-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="" disabled>Pilih Periode...</option>
                    {periodeList?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.tahun})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Drill-down Selector */}
              {dashboardData && (
                <div className="w-full md:w-2/3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Fokus Analisis (Drill-down)
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full pl-11 pr-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="root">🔍 Tampilkan Ringkasan Utama (Level Teratas)</option>
                      <optgroup label="Detail Per Kategori/Bidang">
                        {dashboardData.allItems
                          .filter(i => i.hasChildren) // Only show items that have children (sub-items) to drill into
                          .sort((a, b) => a.kode.localeCompare(b.kode))
                          .map(item => (
                            <option key={item.id} value={item.id}>
                              {item.kode} - {item.nama}
                            </option>
                          ))
                        }
                      </optgroup>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* --- Main Dashboard Content --- */}
        {!selectedPeriode ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <LayoutDashboard className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pilih Periode Anggaran</h3>
            <p className="text-gray-500">Silakan pilih periode di atas untuk melihat data.</p>
          </div>
        ) : isLoadingData ? (
          <div className="py-20 text-center">
            <LoadingScreen message="Sedang mengagregasi data keuangan..." />
          </div>
        ) : dashboardData ? (
          <div className="space-y-6 animate-in fade-in duration-500">

            {/* 1. Header with Breadcrumb-like indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Fokus:</span>
              <span className="flex items-center">
                {selectedParentId === "root" ? "Semua Bidang (Root)" : (
                  <>
                    <span className="font-medium text-gray-900 dark:text-white">{dashboardData.currentScopeItem.kode}</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="font-medium text-gray-900 dark:text-white">{dashboardData.currentScopeItem.nama}</span>
                  </>
                )}
              </span>
            </div>

            {/* 2. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Target Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800 border-blue-100 dark:border-blue-900/30">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Target</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatRupiah(dashboardData.stats.target)}
                      </h3>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Anggaran yang direncanakan
                  </div>
                </CardContent>
              </Card>

              {/* Realisasi Card */}
              <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-gray-800 border-green-100 dark:border-green-900/30">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Realisasi</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatRupiah(dashboardData.stats.realisasi)}
                      </h3>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`font-semibold mr-1 ${dashboardData.stats.percentage >= 100 ? "text-green-600" : "text-yellow-600"}`}>
                      {dashboardData.stats.percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-500">dari target tercapai</span>
                  </div>
                </CardContent>
              </Card>

              {/* Variance Card */}
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Selisih (Variance)</p>
                      <h3 className={`text-2xl font-bold mt-1 ${dashboardData.stats.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatRupiah(Math.abs(dashboardData.stats.variance))}
                      </h3>
                    </div>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {dashboardData.stats.variance < 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {dashboardData.stats.variance < 0 ? "Under Budget (Surplus/Efisien)" : "Over Budget / Belum Tercapai"}
                  </div>
                </CardContent>
              </Card>

              {/* Sub-items count */}
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sub-Item</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {dashboardData.childItems.length}
                      </h3>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <LayoutDashboard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Item dalam kategori ini
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3. Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart: Bar Chart Target vs Realisasi */}
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                    Performa per Sub-Item (Target vs Realisasi)
                  </CardTitle>
                  <CardDescription>
                    Membandingkan rencana dan realisasi untuk setiap bagian di bawah {dashboardData.currentScopeItem.nama}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dashboardData.barChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          height={60}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          tickFormatter={(valor) => new Intl.NumberFormat("id-ID", { notation: "compact" }).format(valor)}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(value) => formatRupiah(value)}
                          labelStyle={{ color: "black" }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Bar name="Target Anggaran" dataKey="target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        <Bar name="Realisasi" dataKey="realisasi" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Composition Chart: Donut */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <PieIcon className="h-5 w-5 mr-2 text-green-500" />
                    Komposisi Realisasi
                  </CardTitle>
                  <CardDescription>
                    Proporsi penyerapan dana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full relative">
                    {dashboardData.compositionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.compositionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {dashboardData.compositionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatRupiah(value)} />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                        Belum ada data realisasi
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 4. Detailed Table */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Rincian Data: {dashboardData.currentScopeItem.nama}</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/keuangan/item?periodeId=${selectedPeriode}`)}
                  >
                    Kelola Data Master <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">Kode</th>
                        <th className="px-4 py-3 text-left">Item Anggaran</th>
                        <th className="px-4 py-3 text-right">Target (Roll-up)</th>
                        <th className="px-4 py-3 text-right">Realisasi (Roll-up)</th>
                        <th className="px-4 py-3 text-center">% Capaian</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {dashboardData.childItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{item.kode}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {item.nama}
                            {item.hasChildren && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                Group
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                            {formatRupiah(item.totalTarget)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                            {formatRupiah(item.totalRealisasiAmount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.achievementPercentage.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={item.isTargetAchieved ? "success" : "secondary"} className="text-[10px]">
                              {item.isTargetAchieved ? "Tercapai" : "Belum"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.hasChildren && (
                              <button
                                onClick={() => setSelectedParentId(item.id)}
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium inline-flex items-center hover:underline"
                              >
                                Drill Down <ChevronRight className="h-3 w-3 ml-0.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {dashboardData.childItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            Tidak ada sub-item data untuk level ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        ) : null}
      </div>
    </div>
  );
}
