import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Calendar, Edit, Plus, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingScreen from "@/components/ui/LoadingScreen";
import RealisasiModal from "@/components/ui/modals/RealisasiModal";

export default function RealisasiList({ itemKeuangan, periodeId }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRealisasi, setSelectedRealisasi] = useState(null);
  const [realisasiToDelete, setRealisasiToDelete] = useState(null);

  // Query untuk get realisasi berdasarkan item
  const { data, isLoading } = useQuery({
    queryKey: ["realisasi-by-item", itemKeuangan?.id],
    queryFn: async () => {
      const params = {
        itemKeuanganId: itemKeuangan.id,
        limit: 100,
      };
      const response = await axios.get("/api/keuangan/realisasi", { params });
      return response.data.data;
    },
    enabled: !!itemKeuangan?.id,
  });

  // Mutation untuk delete
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/keuangan/realisasi/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["realisasi-by-item"]);
      queryClient.invalidateQueries(["realisasi-summary"]);
      queryClient.invalidateQueries(["dashboard-realisasi-summary"]);
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate statistics
  const realisasiList = data?.realisasi || [];
  const totalRealisasi = realisasiList.reduce(
    (sum, r) => sum + parseFloat(r.totalRealisasi || 0),
    0
  );
  const jumlahFrekuensi = realisasiList.length;
  const targetTotal = parseFloat(itemKeuangan?.totalTarget || 0);
  const targetFrekuensi = itemKeuangan?.targetFrekuensi || 0;
  const achievementPercentage =
    targetTotal > 0 ? (totalRealisasi / targetTotal) * 100 : 0;
  const frekuensiPercentage =
    targetFrekuensi > 0 ? (jumlahFrekuensi / targetFrekuensi) * 100 : 0;

  const handleEdit = (realisasi) => {
    setSelectedRealisasi(realisasi);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRealisasi(null);
  };

  if (isLoading) {
    return <LoadingScreen isLoading={true} message="Memuat data realisasi..." />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Realisasi Item
            </CardTitle>
            <Button
              className="flex items-center gap-2"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Tambah Realisasi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Realisasi
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatRupiah(totalRealisasi)}
              </div>
              <div className="text-xs text-gray-500">
                vs Target: {formatRupiah(targetTotal)}
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        achievementPercentage >= 100
                          ? "bg-green-500"
                          : achievementPercentage >= 75
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(achievementPercentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {achievementPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Frekuensi Realisasi
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {jumlahFrekuensi}x
              </div>
              <div className="text-xs text-gray-500">
                vs Target: {targetFrekuensi}x
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        frekuensiPercentage >= 100
                          ? "bg-green-500"
                          : frekuensiPercentage >= 75
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(frekuensiPercentage, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {frekuensiPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Rata-rata per Entry
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatRupiah(jumlahFrekuensi > 0 ? totalRealisasi / jumlahFrekuensi : 0)}
              </div>
              <div className="text-xs text-gray-500">
                vs Nominal Target:{" "}
                {formatRupiah(itemKeuangan?.nominalSatuan || 0)}
              </div>
            </div>
          </div>

          {/* Realisasi List */}
          {realisasiList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada data realisasi</p>
              <p className="text-sm mt-1">
                Klik tombol "Tambah Realisasi" untuk mulai mencatat
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Total Realisasi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Keterangan
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {realisasiList.map((realisasi, index) => (
                      <tr
                        key={realisasi.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(realisasi.tanggalRealisasi)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-right text-green-600 dark:text-green-400">
                          {formatRupiah(realisasi.totalRealisasi)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {realisasi.keterangan || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                              onClick={() => handleEdit(realisasi)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              onClick={() => setRealisasiToDelete(realisasi)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {realisasiList.map((realisasi, index) => (
                  <div
                    key={realisasi.id}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div className="flex gap-2">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          onClick={() => handleEdit(realisasi)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          onClick={() => setRealisasiToDelete(realisasi)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {formatDate(realisasi.tanggalRealisasi)}
                      </div>

                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatRupiah(realisasi.totalRealisasi)}
                      </div>

                      {realisasi.keterangan && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                          {realisasi.keterangan}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Realisasi Modal */}
      <RealisasiModal
        isOpen={isModalOpen}
        itemKeuangan={itemKeuangan}
        mode={selectedRealisasi ? "edit" : "create"}
        periodeId={periodeId}
        realisasiData={selectedRealisasi}
        onClose={handleCloseModal}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        confirmText="Hapus"
        description={`Apakah Anda yakin ingin menghapus realisasi tanggal ${formatDate(
          realisasiToDelete?.tanggalRealisasi
        )} sebesar ${formatRupiah(realisasiToDelete?.totalRealisasi)}?`}
        isOpen={!!realisasiToDelete}
        title="Konfirmasi Hapus"
        variant="danger"
        onCancel={() => setRealisasiToDelete(null)}
        onConfirm={() => deleteMutation.mutate(realisasiToDelete.id)}
      />
    </>
  );
}
