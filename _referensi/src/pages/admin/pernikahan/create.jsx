import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Heart, Search, UserCheck } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import DatePicker from "@/components/ui/inputs/DatePicker";
import jemaatService from "@/services/jemaatService";
import klasisService from "@/services/klasisService";
import pernikahanService from "@/services/pernikahanService";
import { showToast } from "@/utils/showToast";

// Validation schema
const pernikahanSchema = z.object({
  tanggal: z.string().min(1, "Tanggal pernikahan wajib diisi"),
  idKlasis: z.string().min(1, "Klasis wajib dipilih"),
  jemaatIds: z
    .array(z.string())
    .min(1, "Minimal pilih 1 jemaat")
    .max(10, "Maksimal 10 jemaat"),
});

export default function CreatePernikahanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedJemaats, setSelectedJemaats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm({
    resolver: zodResolver(pernikahanSchema),
    defaultValues: {
      tanggal: "",
      idKlasis: "",
      jemaatIds: [],
    },
  });

  // Fetch master data
  const { data: klasisData } = useQuery({
    queryKey: ["klasis"],
    queryFn: () => klasisService.getAll(),
  });

  // Fetch ALL jemaat data (yang belum menikah) - admin can see all
  const { data: jemaatData } = useQuery({
    queryKey: ["jemaat-single"],
    queryFn: () => jemaatService.getAll({ limit: 1000 }), // Get all for selection
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: pernikahanService.create,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Data pernikahan berhasil dibuat!",
        color: "success",
      });

      // Invalidate pernikahan query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["pernikahan"] });

      router.push("/admin/pernikahan");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal membuat data pernikahan",
        color: "error",
      });
    },
  });

  const handleSubmit = (data) => {
    createMutation.mutate({
      tanggal: data.tanggal,
      idKlasis: data.idKlasis,
      jemaatIds: selectedJemaats.map((j) => j.id),
    });
  };

  // Handle jemaat selection with gender validation
  const handleJemaatSelect = (jemaat) => {
    const isSelected = selectedJemaats.find((j) => j.id === jemaat.id);

    if (isSelected) {
      setSelectedJemaats(selectedJemaats.filter((j) => j.id !== jemaat.id));
    } else {
      // Check if trying to select 2 males
      const maleCount = selectedJemaats.filter(
        (j) => j.jenisKelamin === true
      ).length;

      if (jemaat.jenisKelamin === true && maleCount >= 1) {
        showToast({
          title: "Peringatan",
          description:
            "Tidak dapat memilih 2 jemaat laki-laki untuk pernikahan!",
          color: "warning",
        });

        return;
      }

      setSelectedJemaats([...selectedJemaats, jemaat]);
    }

    // Update form value
    const newIds = isSelected
      ? selectedJemaats.filter((j) => j.id !== jemaat.id).map((j) => j.id)
      : [...selectedJemaats.map((j) => j.id), jemaat.id];

    form.setValue("jemaatIds", newIds);
  };

  // Filter jemaat yang belum menikah - admin sees ALL available jemaats
  const availableJemaats =
    jemaatData?.data?.items?.filter((j) => !j.idPernikahan) || [];

  // Filter jemaats based on search term
  const filteredJemaats = availableJemaats.filter(
    (jemaat) =>
      jemaat.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jemaat.keluarga?.rayon?.namaRayon
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      jemaat.keluarga?.noBagungan?.toString().includes(searchTerm)
  );

  return (
    <>
      <PageHeader
        actions={[
          {
            label: "Kembali",
            icon: ArrowLeft,
            variant: "outline",
            onClick: () => router.push("/admin/pernikahan"),
          },
        ]}
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Data Pernikahan", href: "/admin/pernikahan" },
          { label: "Tambah Data" },
        ]}
        description="Tambah data pernikahan jemaat"
        icon={Heart}
        title="Buat Data Pernikahan"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          {/* Basic Information */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  Informasi Pernikahan
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <DatePicker
                    error={form.formState.errors.tanggal?.message}
                    label="Tanggal Pernikahan"
                    placeholder="Pilih tanggal pernikahan"
                    required={true}
                    value={form.watch("tanggal")}
                    onChange={(value) => form.setValue("tanggal", value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                    Klasis *
                  </label>
                  <select
                    {...form.register("idKlasis", { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                  >
                    <option value="">Pilih klasis</option>
                    {klasisData?.data?.items?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.idKlasis && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {form.formState.errors.idKlasis.message}
                    </p>
                  )}
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                    Jemaat Terpilih ({selectedJemaats.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedJemaats.map((jemaat, index) => (
                    <div
                      key={jemaat.id}
                      className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-lg transition-colors duration-200"
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
                          <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                            {jemaat.nama}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                            Bag. {jemaat.keluarga?.noBagungan || "-"} •{" "}
                            {jemaat.keluarga?.rayon?.namaRayon || "-"}
                          </p>
                        </div>
                      </div>
                      <button
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                    Pilih Jemaat
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    ({filteredJemaats.length} dari {availableJemaats.length}{" "}
                    jemaat)
                  </span>
                </div>

                {/* Search Input */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    placeholder="Cari jemaat..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {form.formState.errors.jemaatIds && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg transition-colors duration-200">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.jemaatIds.message}
                  </p>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredJemaats.length === 0 && searchTerm ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>Tidak ada jemaat ditemukan</p>
                    <p className="text-sm">Coba kata kunci lain</p>
                  </div>
                ) : availableJemaats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>Tidak ada jemaat yang tersedia</p>
                    <p className="text-sm">Semua jemaat sudah menikah</p>
                  </div>
                ) : (
                  filteredJemaats.map((jemaat) => {
                    const isSelected = selectedJemaats.find(
                      (j) => j.id === jemaat.id
                    );

                    return (
                      <div
                        key={jemaat.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => handleJemaatSelect(jemaat)}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                              jemaat.jenisKelamin
                                ? "bg-blue-500"
                                : "bg-pink-500"
                            }`}
                          >
                            {jemaat.jenisKelamin ? "♂" : "♀"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                              {jemaat.nama}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                              {jemaat.jenisKelamin ? "Laki-laki" : "Perempuan"}{" "}
                              • Bag. {jemaat.keluarga?.noBagungan || "-"} •{" "}
                              {jemaat.keluarga?.rayon?.namaRayon || "-"}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="text-blue-600 dark:text-blue-400">
                              ✓
                            </div>
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
              disabled={createMutation.isLoading}
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/pernikahan")}
            >
              Batal
            </Button>
            <Button
              disabled={
                createMutation.isLoading || selectedJemaats.length === 0
              }
              type="submit"
            >
              {createMutation.isLoading
                ? "Menyimpan..."
                : "Simpan Data Pernikahan"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
