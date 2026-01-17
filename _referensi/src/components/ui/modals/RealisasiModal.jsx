// import { useMutation, useQuery, useQueryClient } from "@tantml:parameter>@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Calculator, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

export default function RealisasiModal({
  isOpen,
  onClose,
  itemKeuangan, // Pass selected item keuangan if you want to pre-fill
  periodeId, // Pass periode if known
  mode = "create", // "create" or "edit"
  realisasiData = null, // Pass existing data for edit mode
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    itemKeuanganId: itemKeuangan?.id || "",
    periodeId: periodeId || itemKeuangan?.periodeId || "",
    tanggalRealisasi: "",
    totalRealisasi: "",
    keterangan: "",
  });

  // Query untuk get item keuangan (level 4 only) if not provided
  const { data: itemList, isLoading: itemLoading } = useQuery({
    queryKey: ["item-level-4", periodeId],
    queryFn: async () => {
      const params = { level: 4, limit: 500 };

      if (periodeId) params.periodeId = periodeId;

      const response = await axios.get("/api/keuangan/item", { params });

      return response.data.data.items;
    },
    enabled: !itemKeuangan && isOpen, // Only fetch if item not provided and modal is open
  });

  // Get selected item details
  const selectedItem =
    itemKeuangan ||
    itemList?.find((item) => item.id === formData.itemKeuanganId);

  // Initialize form with existing data in edit mode
  useEffect(() => {
    if (mode === "edit" && realisasiData) {
      setFormData({
        itemKeuanganId: realisasiData.itemKeuanganId || "",
        periodeId: realisasiData.periodeId || "",
        tanggalRealisasi: realisasiData.tanggalRealisasi?.split("T")[0] || "",
        totalRealisasi: realisasiData.totalRealisasi || "",
        keterangan: realisasiData.keterangan || "",
      });
    } else if (itemKeuangan) {
      setFormData((prev) => ({
        ...prev,
        itemKeuanganId: itemKeuangan.id,
        periodeId: itemKeuangan.periodeId,
      }));
    }
  }, [mode, realisasiData, itemKeuangan]);

  // Mutation untuk create
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/keuangan/realisasi", data);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["realisasi-summary"]);
      queryClient.invalidateQueries(["realisasi-list"]);
      queryClient.invalidateQueries(["realisasi-item-summary"]);
      queryClient.invalidateQueries(["dashboard-realisasi-summary"]);
      toast.success("Realisasi berhasil ditambahkan");
      handleClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan realisasi"
      );
    },
  });

  // Mutation untuk update
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`/api/keuangan/realisasi/${id}`, data);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["realisasi-summary"]);
      queryClient.invalidateQueries(["realisasi-list"]);
      queryClient.invalidateQueries(["realisasi-item-summary"]);
      queryClient.invalidateQueries(["dashboard-realisasi-summary"]);
      toast.success("Realisasi berhasil diperbarui");
      handleClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui realisasi"
      );
    },
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto set periode when item is selected (if not already set)
    if (name === "itemKeuanganId" && value && !periodeId) {
      const item = itemList?.find((item) => item.id === value);

      if (item) {
        setFormData((prev) => ({
          ...prev,
          periodeId: item.periodeId,
        }));
      }
    }
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.itemKeuanganId ||
      !formData.periodeId ||
      !formData.tanggalRealisasi ||
      !formData.totalRealisasi
    ) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");

      return;
    }

    if (mode === "edit" && realisasiData) {
      updateMutation.mutate({ id: realisasiData.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      itemKeuanganId: itemKeuangan?.id || "",
      periodeId: periodeId || itemKeuangan?.periodeId || "",
      tanggalRealisasi: "",
      totalRealisasi: "",
      keterangan: "",
    });
    onClose();
  };

  // Format rupiah for display
  const formatRupiah = (amount) => {
    if (!amount || amount === 0) return "Rp 0";

    return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {mode === "edit" ? "Edit Realisasi" : "Tambah Realisasi"}
            </h3>
            <button
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Item Keuangan - only show if not pre-filled */}
              {!itemKeuangan && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Keuangan <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    disabled={isLoading || itemLoading}
                    name="itemKeuanganId"
                    value={formData.itemKeuanganId}
                    onChange={handleInputChange}
                  >
                    <option value="">Pilih Item Keuangan</option>
                    {Array.isArray(itemList) &&
                      itemList.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.kode} - {item.nama} ({item.kategori?.nama})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Show selected item info */}
              {selectedItem && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <div className="font-semibold text-blue-900 dark:text-blue-100">
                        {selectedItem.kode} - {selectedItem.nama}
                      </div>
                      <div className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
                        <div>
                          Target: {selectedItem.targetFrekuensi || 0}x{" "}
                          {selectedItem.satuanFrekuensi || ""} ×{" "}
                          {formatRupiah(selectedItem.nominalSatuan || 0)} ={" "}
                          <span className="font-bold">
                            {formatRupiah(selectedItem.totalTarget || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tanggal Realisasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal Realisasi <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  disabled={isLoading}
                  name="tanggalRealisasi"
                  type="date"
                  value={formData.tanggalRealisasi}
                  onChange={handleInputChange}
                />
              </div>

              {/* Total Realisasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Realisasi <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  disabled={isLoading}
                  min="0"
                  name="totalRealisasi"
                  placeholder="Contoh: 5500000"
                  step="0.01"
                  type="number"
                  value={formData.totalRealisasi}
                  onChange={handleInputChange}
                />
                {formData.totalRealisasi && (
                  <div className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    {formatRupiah(formData.totalRealisasi)}
                  </div>
                )}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keterangan
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  disabled={isLoading}
                  name="keterangan"
                  placeholder="Catatan tambahan (opsional)..."
                  rows="3"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <Button
                disabled={isLoading}
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Batal
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading
                  ? "Menyimpan..."
                  : mode === "edit"
                    ? "Perbarui"
                    : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
