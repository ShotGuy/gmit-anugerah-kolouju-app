import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  BarChart3,
  Edit,
  Filter,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageHeader from "@/components/ui/PageHeader";
import PageTitle from "@/components/ui/PageTitle";
import { useUser } from "@/hooks/useUser";

export default function RealisasiKeuanganPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedPeriode, setSelectedPeriode] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [realisasiToDelete, setRealisasiToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchItemSummary, setSearchItemSummary] = useState("");
  const [searchRealisasi, setSearchRealisasi] = useState("");

  const { user: authData } = useUser();

  // Query untuk get periode list
  const { data: periodeList } = useQuery({
    queryKey: ["periode-list"],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/periode", {
        params: { limit: 50, isActive: true },
      });

      return response.data.data.items;
    },
    onSuccess: (data) => {
      // Set default to "Periode I" if not already selected
      if (!selectedPeriode && data && data.length > 0) {
        const periodeI = data.find((periode) => periode.nama === "Periode I");

        if (periodeI) {
          setSelectedPeriode(periodeI.id);
        } else {
          // If "Periode I" not found, use the first periode
          setSelectedPeriode(data[0].id);
        }
      }
    },
  });

  // Query untuk get kategori list
  const { data: kategoriList } = useQuery({
    queryKey: ["kategori-list"],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/kategori");

      return response.data.data.items;
    },
  });

  // Query untuk get item keuangan
  const { data: itemList } = useQuery({
    queryKey: ["item-keuangan-list", selectedPeriode, selectedKategori],
    queryFn: async () => {
      const params = { level: 4 }; // Only level 4 items can have realization

      if (selectedPeriode) params.periodeId = selectedPeriode;
      if (selectedKategori) params.kategoriId = selectedKategori;

      const response = await axios.get("/api/keuangan/item", { params });

      return response.data.data.items;
    },
    enabled: !!selectedPeriode,
  });

  // Query untuk get realisasi summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: [
      "realisasi-summary",
      selectedPeriode,
      selectedKategori,
      selectedItem,
    ],
    queryFn: async () => {
      const params = {};

      if (selectedPeriode) params.periodeId = selectedPeriode;
      if (selectedKategori) params.kategoriId = selectedKategori;
      if (selectedItem) params.itemKeuanganId = selectedItem;

      const response = await axios.get("/api/keuangan/realisasi/summary", {
        params,
      });

      return response.data.data;
    },
    enabled: !!selectedPeriode,
  });

  // Query untuk get realisasi detail
  const { data: realisasiData, isLoading: realisasiLoading } = useQuery({
    queryKey: [
      "realisasi-list",
      selectedPeriode,
      selectedKategori,
      selectedItem,
    ],
    queryFn: async () => {
      const params = {};

      if (selectedPeriode) params.periodeId = selectedPeriode;
      if (selectedKategori) params.kategoriId = selectedKategori;
      if (selectedItem) params.itemKeuanganId = selectedItem;

      const response = await axios.get("/api/keuangan/realisasi", { params });

      return response.data.data;
    },
    enabled: !!selectedPeriode,
  });

  // Mutation untuk delete realisasi
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/keuangan/realisasi/${id}`);
    },
    onSuccess: () => {
      // Refetch all realisasi-related queries
      queryClient.invalidateQueries(["realisasi-summary"]);
      queryClient.invalidateQueries(["realisasi-list"]);
      queryClient.invalidateQueries(["realisasi-item-summary"]);
      queryClient.invalidateQueries(["realisasi-item-list"]);
      toast.success("Realisasi berhasil dihapus");
      setRealisasiToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus realisasi");
    },
  });

  // Format rupiah
  const formatRupiah = (amount) => {
    if (!amount || amount === 0) return "Rp 0";

    return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
  };

  // Format persentase
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Filter item summary berdasarkan search
  const filteredItemSummary = summaryData?.items?.filter((item) => {
    if (!searchItemSummary) return true;
    const searchLower = searchItemSummary.toLowerCase();
    return (
      item.kode.toLowerCase().includes(searchLower) ||
      item.nama.toLowerCase().includes(searchLower)
    );
  });

  // Filter realisasi berdasarkan search
  const filteredRealisasi = realisasiData?.realisasi?.filter((realisasi) => {
    if (!searchRealisasi) return true;
    const searchLower = searchRealisasi.toLowerCase();
    return (
      realisasi.itemKeuangan.kode.toLowerCase().includes(searchLower) ||
      realisasi.itemKeuangan.nama.toLowerCase().includes(searchLower) ||
      realisasi.keterangan?.toLowerCase().includes(searchLower) ||
      realisasi.periode?.nama?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        description="Kelola dan pantau realisasi vs target anggaran"
        title="Manajemen Realisasi Keuangan"
      />

      <PageTitle title={"Manajemen Realisasi Keuangan"} />

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Periode Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Periode
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
              >
                <option value="">Pilih Periode</option>
                {Array.isArray(periodeList) &&
                  periodeList.map((periode) => (
                    <option key={periode.id} value={periode.id}>
                      {periode.nama} ({periode.tahun})
                    </option>
                  ))}
              </select>
            </div>

            {/* Kategori Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kategori
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {Array.isArray(kategoriList) &&
                  kategoriList.map((kategori) => (
                    <option key={kategori.id} value={kategori.id}>
                      {kategori.nama}
                    </option>
                  ))}
              </select>
            </div>

            {/* Item Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Keuangan
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                disabled={!itemList}
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                <option value="">Semua Item</option>
                {Array.isArray(itemList) &&
                  itemList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.kode} - {item.nama}
                    </option>
                  ))}
              </select>
            </div>

            {/* Action Buttons */}
            {authData?.isAdmin && (
              <div className="flex items-end gap-2">
                <Button
                  className="flex items-center gap-2"
                  disabled={!selectedPeriode}
                  onClick={() => router.push("/admin/keuangan/realisasi/create")}
                >
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Target
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatRupiah(summaryData.summary?.totalTargetAmount || 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Realisasi
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatRupiah(
                      summaryData.summary?.totalRealisasiAmount || 0
                    )}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selisih</p>
                  <p
                    className={`text-2xl font-bold ${
                      parseFloat(
                        summaryData.summary?.totalVarianceAmount || 0
                      ) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatRupiah(
                      summaryData.summary?.totalVarianceAmount || 0
                    )}
                  </p>
                </div>
                {parseFloat(summaryData.summary?.totalVarianceAmount || 0) >=
                0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Target Tercapai
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summaryData.summary?.itemsTargetAchieved || 0}/
                    {summaryData.summary?.totalItems || 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Item Summary Table */}
      {summaryData?.items && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Ringkasan Realisasi per Item</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kode atau nama item..."
                  value={searchItemSummary}
                  onChange={(e) => setSearchItemSummary(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <LoadingScreen isLoading={true} message="Memuat ringkasan realisasi..." />
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold">
                          Item Keuangan
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-sm font-semibold">
                          Target
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-sm font-semibold">
                          Realisasi
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-sm font-semibold">
                          Selisih
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-sm font-semibold">
                          Capaian
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-sm font-semibold">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItemSummary && filteredItemSummary.length > 0 ? (
                        filteredItemSummary.map((item) => {
                          const level = (item.kode.match(/\./g) || []).length + 1;
                          const indentClass = level > 1 ? `pl-${level * 4}` : "";

                          return (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                              <div className={`flex items-start gap-2 ${indentClass}`}>
                                <span className="font-mono text-xs text-gray-500 dark:text-gray-400 min-w-[60px] mt-0.5">
                                  {item.kode}
                                </span>
                                <span className="font-medium text-sm">{item.nama}</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatRupiah(item.totalTarget)}
                              </span>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {formatRupiah(item.totalRealisasiAmount)}
                              </span>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right">
                              <span
                                className={`text-sm font-semibold ${
                                  parseFloat(item.varianceAmount) >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {formatRupiah(item.varianceAmount)}
                              </span>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <Badge
                                  variant={
                                    item.achievementPercentage >= 100
                                      ? "success"
                                      : item.achievementPercentage >= 75
                                        ? "warning"
                                        : "secondary"
                                  }
                                >
                                  {formatPercentage(item.achievementPercentage)}
                                </Badge>
                                <Badge
                                  variant={
                                    item.isTargetAchieved ? "success" : "secondary"
                                  }
                                >
                                  {item.isTargetAchieved ? "Tercapai" : "Belum"}
                                </Badge>
                              </div>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  router.push(
                                    `/admin/keuangan/realisasi/${item.id}`
                                  )
                                }
                              >
                                Detail
                              </Button>
                            </td>
                          </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            {searchItemSummary ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile & Tablet View */}
                <div className="lg:hidden space-y-4">
                  {filteredItemSummary && filteredItemSummary.length > 0 ? (
                    filteredItemSummary.map((item) => {
                      const level = (item.kode.match(/\./g) || []).length + 1;

                      return (
                      <div
                        key={item.id}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                                {item.kode}
                              </span>
                              <span className={`text-xs text-gray-500 dark:text-gray-400`}>
                                Level {level}
                              </span>
                            </div>
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                              {item.nama}
                            </h3>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/admin/keuangan/realisasi/${item.id}`
                              )
                            }
                          >
                            Detail
                          </Button>
                        </div>

                        {/* Financial Data */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Target:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatRupiah(item.totalTarget)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Realisasi:
                            </span>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {formatRupiah(item.totalRealisasiAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Selisih:
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                parseFloat(item.varianceAmount) >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {formatRupiah(item.varianceAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Badge
                            variant={
                              item.achievementPercentage >= 100
                                ? "success"
                                : item.achievementPercentage >= 75
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            {formatPercentage(item.achievementPercentage)}
                          </Badge>
                          <Badge
                            variant={
                              item.isTargetAchieved ? "success" : "secondary"
                            }
                          >
                            {item.isTargetAchieved ? "Tercapai" : "Belum"}
                          </Badge>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {searchItemSummary ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data"}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Realisasi Table */}
      {realisasiData?.realisasi && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Data Realisasi Terbaru</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari item atau keterangan..."
                  value={searchRealisasi}
                  onChange={(e) => setSearchRealisasi(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {realisasiLoading ? (
              <LoadingScreen isLoading={true} message="Memuat data realisasi..." />
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold">
                          Item Keuangan
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold">
                          Periode
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-sm font-semibold">
                          Total Realisasi
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-sm font-semibold">
                          Tanggal
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold">
                          Keterangan
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-sm font-semibold">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRealisasi && filteredRealisasi.length > 0 ? (
                        filteredRealisasi.map((realisasi) => (
                          <tr
                            key={realisasi.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                {realisasi.itemKeuangan.kode}
                              </span>
                              <span className="font-medium text-sm">
                                {realisasi.itemKeuangan.nama}
                              </span>
                            </div>
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                            <span className="text-sm">{realisasi.periode?.nama || "-"}</span>
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {formatRupiah(realisasi.totalRealisasi)}
                            </span>
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(
                                realisasi.tanggalRealisasi
                              ).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {realisasi.keterangan || "-"}
                            </span>
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                            {authData?.isAdmin && (
                              <div className="flex justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    router.push(
                                      `/admin/keuangan/realisasi/edit/${realisasi.id}`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setRealisasiToDelete(realisasi)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            {searchRealisasi ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile & Tablet View */}
                <div className="md:hidden space-y-3">
                  {filteredRealisasi && filteredRealisasi.length > 0 ? (
                    filteredRealisasi.map((realisasi) => (
                      <div
                        key={realisasi.id}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
                      >
                      {/* Header with Item Info */}
                      <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                            {realisasi.itemKeuangan.kode}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {realisasi.periode?.nama || "-"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {realisasi.itemKeuangan.nama}
                        </h3>
                      </div>

                      {/* Realisasi Amount & Date */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Total Realisasi:
                          </span>
                          <span className="text-base font-bold text-green-600 dark:text-green-400">
                            {formatRupiah(realisasi.totalRealisasi)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Tanggal:
                          </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {new Date(
                              realisasi.tanggalRealisasi
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Keterangan */}
                      {realisasi.keterangan && (
                        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                            Keterangan:
                          </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {realisasi.keterangan}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {authData?.isAdmin && (
                        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                              router.push(
                                `/admin/keuangan/realisasi/edit/${realisasi.id}`
                              )
                            }
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => setRealisasiToDelete(realisasi)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {searchRealisasi ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data"}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        description={`Apakah Anda yakin ingin menghapus realisasi untuk item "${realisasiToDelete?.itemKeuangan?.nama}" tanggal ${realisasiToDelete?.tanggalRealisasi ? new Date(realisasiToDelete.tanggalRealisasi).toLocaleDateString("id-ID") : ""}? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deleteMutation.isPending}
        isOpen={!!realisasiToDelete}
        title="Hapus Realisasi"
        onClose={() => setRealisasiToDelete(null)}
        onConfirm={() => deleteMutation.mutate(realisasiToDelete.id)}
      />
    </div>
  );
}
