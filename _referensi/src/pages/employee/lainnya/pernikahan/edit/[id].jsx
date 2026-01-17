import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Heart, UserCheck } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";

import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import DatePicker from "@/components/ui/inputs/DatePicker";
import SelectInput from "@/components/ui/inputs/SelectInput";
import jemaatService from "@/services/jemaatService";
import klasisService from "@/services/klasisService";
import pernikahanService from "@/services/pernikahanService";
import { showToast } from "@/utils/showToast";

export default function EditPernikahanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const [selectedJemaats, setSelectedJemaats] = useState([]);

  // Fetch pernikahan data
  const { data: pernikahanData, isLoading: loadingPernikahan } = useQuery({
    queryKey: ["pernikahan", id],
    queryFn: () => pernikahanService.getById(id),
    enabled: !!id,
  });

  // Fetch master data
  const { data: klasisData } = useQuery({
    queryKey: ["klasis"],
    queryFn: () => klasisService.getAll(),
  });

  // Fetch jemaat data (yang belum menikah + yang sudah terpilih di pernikahan ini)
  const { data: jemaatData } = useQuery({
    queryKey: ["jemaat-single"],
    queryFn: () => jemaatService.getAll({ limit: 1000 }),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pernikahanService.update(id, data),
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Data pernikahan berhasil diperbarui!",
        color: "success",
      });
      queryClient.invalidateQueries(["pernikahan"]);
      router.push("/employee/lainnya/pernikahan");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal memperbarui data pernikahan",
        color: "error",
      });
    },
  });

  // Set initial data when pernikahan data is loaded
  React.useEffect(() => {
    if (pernikahanData?.data?.jemaats) {
      setSelectedJemaats(pernikahanData.data.jemaats);
    }
  }, [pernikahanData]);

  const handleSubmit = (data) => {
    updateMutation.mutate({
      id,
      data: {
        tanggal: data.tanggal,
        idKlasis: data.idKlasis,
        jemaatIds: selectedJemaats.map((j) => j.id),
      },
    });
  };

  // Handle jemaat selection
  const handleJemaatSelect = (jemaat) => {
    const isSelected = selectedJemaats.find((j) => j.id === jemaat.id);

    if (isSelected) {
      setSelectedJemaats(selectedJemaats.filter((j) => j.id !== jemaat.id));
    } else {
      setSelectedJemaats([...selectedJemaats, jemaat]);
    }
  };

  // Filter jemaat yang belum menikah atau yang sudah terpilih di pernikahan ini
  const availableJemaats =
    jemaatData?.data?.items?.filter(
      (j) =>
        !j.idPernikahan ||
        j.idPernikahan === id ||
        selectedJemaats.some((selected) => selected.id === j.id)
    ) || [];

  if (loadingPernikahan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            Memuat data pernikahan...
          </p>
        </div>
      </div>
    );
  }

  if (!pernikahanData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">
            Data pernikahan tidak ditemukan
          </p>
          <Button onClick={() => router.push("/employee/lainnya/pernikahan")}>Kembali</Button>
        </div>
      </div>
    );
  }

  const pernikahan = pernikahanData.data;

  return (
    <>
      <PageHeader
        actions={[
          {
            label: "Kembali",
            icon: ArrowLeft,
            variant: "outline",
            onClick: () => router.push("/employee/lainnya/pernikahan"),
          },
        ]}
        breadcrumb={[
          { label: "Dashboard", href: "/employee/dashboard" },
          { label: "Lainnya", href: "/employee/lainnya" },
          { label: "Data Pernikahan", href: "/employee/lainnya/pernikahan" },
          { label: "Edit Data" },
        ]}
        description="Edit data pernikahan jemaat"
        icon={Heart}
        title="Edit Data Pernikahan"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handleSubmit({
            tanggal: formData.get('tanggal'),
            idKlasis: formData.get('idKlasis'),
          });
        }}>
          {/* Basic Information */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Informasi Pernikahan
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Pernikahan *
                  </label>
                  <input
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                    defaultValue={
                      pernikahan.tanggal
                        ? new Date(pernikahan.tanggal).toISOString().split("T")[0]
                        : ""
                    }
                    name="tanggal"
                    type="date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Klasis *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                    defaultValue={pernikahan.idKlasis || ""}
                    name="idKlasis"
                  >
                    <option value="">Pilih klasis</option>
                    {klasisData?.data?.items?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Selected Jemaats */}
          {selectedJemaats.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Jemaat Terpilih ({selectedJemaats.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedJemaats.map((jemaat, index) => (
                    <div
                      key={jemaat.id}
                      className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            jemaat.jenisKelamin ? "bg-blue-500" : "bg-pink-500"
                          }`}
                        >
                          {jemaat.jenisKelamin ? "♂" : "♀"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {jemaat.nama}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Bag. {jemaat.keluarga?.noBagungan || "-"} •{" "}
                            {jemaat.keluarga?.rayon?.namaRayon || "-"}
                          </p>
                        </div>
                      </div>
                      <button
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600 transition-colors"
                        type="button"
                        onClick={() => handleJemaatSelect(jemaat)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Jemaat Selection */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Pilih Jemaat
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({availableJemaats.length} jemaat tersedia)
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableJemaats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>Tidak ada jemaat yang tersedia</p>
                  </div>
                ) : (
                  availableJemaats.map((jemaat) => {
                    const isSelected = selectedJemaats.find(
                      (j) => j.id === jemaat.id
                    );

                    return (
                      <div
                        key={jemaat.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => handleJemaatSelect(jemaat)}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                              jemaat.jenisKelamin ? "bg-blue-500" : "bg-pink-500"
                            }`}
                          >
                            {jemaat.jenisKelamin ? "♂" : "♀"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {jemaat.nama}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {jemaat.jenisKelamin ? "Laki-laki" : "Perempuan"} •
                              Bag. {jemaat.keluarga?.noBagungan || "-"} •
                              {jemaat.keluarga?.rayon?.namaRayon || "-"}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="text-blue-600 dark:text-blue-400">✓</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>

          {/* Submit Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              disabled={updateMutation.isLoading}
              type="button"
              variant="outline"
              onClick={() => router.push("/employee/lainnya/pernikahan")}
            >
              Batal
            </Button>
            <Button
              disabled={updateMutation.isLoading || selectedJemaats.length === 0}
              type="submit"
            >
              {updateMutation.isLoading
                ? "Menyimpan..."
                : "Perbarui Data Pernikahan"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}