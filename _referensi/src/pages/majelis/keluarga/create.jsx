import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Home, Save } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PageTitle from "@/components/ui/PageTitle";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextInput from "@/components/ui/inputs/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import keluargaService from "@/services/keluargaService";
import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";

// Validation schema for majelis keluarga creation
const keluargaSchema = z.object({
  noBagungan: z.coerce
    .number()
    .min(1, "No. Bangunan wajib diisi dan harus berupa angka"),
  noKK: z.string().min(1, "No. Kartu Keluarga (KK) wajib diisi"),
  rt: z.string().min(1, "RT wajib diisi"),
  rw: z.string().min(1, "RW wajib diisi"),
  jalan: z.string().min(1, "Alamat jalan wajib diisi"),
  idKelurahan: z.string().nonempty("Kelurahan wajib dipilih"),
  idStatusKeluarga: z.string().optional(),
  idStatusKepemilikanRumah: z.string().optional(),
  idKeadaanRumah: z.string().optional(),
});

function MajelisCreateKeluarga() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(keluargaSchema),
    defaultValues: {
      noBagungan: "",
      noKK: "",
      rt: "",
      rw: "",
      jalan: "",
      idKelurahan: "",
      idStatusKeluarga: "",
      idStatusKepemilikanRumah: "",
      idKeadaanRumah: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  // Fetch master data
  const { data: kelurahanData } = useQuery({
    queryKey: ["kelurahan"],
    queryFn: () => masterService.getKelurahan(),
  });

  const { data: statusKeluargaData } = useQuery({
    queryKey: ["status-keluarga"],
    queryFn: () => masterService.getStatusKeluarga(),
  });

  const { data: statusKepemilikanRumahData } = useQuery({
    queryKey: ["status-kepemilikan-rumah"],
    queryFn: () => masterService.getStatusKepemilikanRumah(),
  });

  const { data: keadaanRumahData } = useQuery({
    queryKey: ["keadaan-rumah"],
    queryFn: () => masterService.getKeadaanRumah(),
  });

  // Transform options data
  const kelurahanOptions =
    kelurahanData?.data?.items?.map((item) => ({
      value: item.id,
      label: item.kodepos ? `${item.nama} - ${item.kodepos}` : item.nama,
    })) || [];

  const statusKeluargaOptions =
    statusKeluargaData?.data?.items?.map((item) => ({
      value: item.id,
      label: item.status,
    })) || [];

  const statusKepemilikanRumahOptions =
    statusKepemilikanRumahData?.data?.items?.map((item) => ({
      value: item.id,
      label: item.status,
    })) || [];

  const keadaanRumahOptions =
    keadaanRumahData?.data?.items?.map((item) => ({
      value: item.id,
      label: item.keadaan,
    })) || [];

  // Create keluarga mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Create alamat first
      const alamatData = {
        rt: parseInt(data.rt),
        rw: parseInt(data.rw),
        jalan: data.jalan,
        idKelurahan: data.idKelurahan,
      };

      const alamatResponse = await keluargaService.createAlamat(alamatData);

      // Then create keluarga with the alamat ID and majelis's rayon
      const keluargaData = {
        noBagungan: data.noBagungan, // No need to parse, Zod coerce handles it
        noKK: data.noKK,
        idAlamat: alamatResponse.data.id,
        idRayon: user.majelis?.idRayon, // Use majelis's rayon automatically
        idStatusKeluarga: data.idStatusKeluarga || null,
        idStatusKepemilikanRumah: data.idStatusKepemilikanRumah || null,
        idKeadaanRumah: data.idKeadaanRumah || null,
      };

      return keluargaService.create(keluargaData);
    },
    onSuccess: (data) => {
      showToast({
        title: "Berhasil!",
        description:
          "Keluarga berhasil dibuat! Sekarang tambahkan jemaat sebagai kepala keluarga.",
        color: "success",
      });

      // Invalidate and refetch
      queryClient.invalidateQueries(["keluarga"]);
      queryClient.invalidateQueries(["majelis-dashboard"]);

      // Redirect to specialized page for adding kepala keluarga in the same flow
      router.push(
        `/majelis/keluarga/create-jemaat-in-keluarga?keluargaId=${data.data.id}`
      );
    },
    onError: (error) => {
      console.error("Create keluarga error:", error);
      showToast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal menambahkan data keluarga",
        color: "error",
      });
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/majelis/keluarga");
  };

  // Check if user has majelis data with rayon
  if (!user?.majelis?.idRayon) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Akses Terbatas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Anda belum memiliki rayon yang ditugaskan. Hubungi admin untuk
                mengatur rayon Anda.
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles="MAJELIS">
      <PageTitle
        description="Menambahkan data keluarga baru untuk rayon yang Anda kelola"
        title="Tambah Keluarga Baru"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                className="flex items-center space-x-2"
                variant="outline"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tambah Keluarga Baru
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rayon: {user.majelis?.rayon?.namaRayon || "Tidak diketahui"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-blue-600" />
                <span>Data Keluarga</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormProvider {...form}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      {...register("noBagungan")}
                      required
                      error={errors.noBagungan?.message}
                      label="No. Bangunan"
                      placeholder="Contoh: 123"
                      type="number"
                    />

                    <TextInput
                      {...register("noKK")}
                      required
                      error={errors.noKK?.message}
                      label="NIK Kepala Keluarga"
                      maxLength={16}
                      placeholder="Masukkan NIK (16 digit)"
                    />
                  </div>

                  {/* Address Section */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Alamat Keluarga
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <TextInput
                        {...register("rt")}
                        required
                        error={errors.rt?.message}
                        label="RT"
                        placeholder="Contoh: 001"
                        type="number"
                      />
                      <TextInput
                        {...register("rw")}
                        required
                        error={errors.rw?.message}
                        label="RW"
                        placeholder="Contoh: 001"
                        type="number"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextInput
                        {...register("jalan")}
                        required
                        error={errors.jalan?.message}
                        label="Alamat Jalan"
                        placeholder="Contoh: Jl. Merdeka No. 123"
                      />

                      <SelectInput
                        {...register("idKelurahan")}
                        required
                        error={errors.idKelurahan?.message}
                        label="Kelurahan"
                        options={[
                          { value: "", label: "Pilih Kelurahan" },
                          ...kelurahanOptions,
                        ]}
                      />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Informasi Tambahan (Opsional)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <SelectInput
                        {...register("idStatusKeluarga")}
                        error={errors.idStatusKeluarga?.message}
                        label="Status Keluarga"
                        options={[
                          { value: "", label: "Pilih Status Keluarga" },
                          ...statusKeluargaOptions,
                        ]}
                      />

                      <SelectInput
                        {...register("idStatusKepemilikanRumah")}
                        error={errors.idStatusKepemilikanRumah?.message}
                        label="Status Kepemilikan Rumah"
                        options={[
                          { value: "", label: "Pilih Status Kepemilikan" },
                          ...statusKepemilikanRumahOptions,
                        ]}
                      />

                      <SelectInput
                        {...register("idKeadaanRumah")}
                        error={errors.idKeadaanRumah?.message}
                        label="Keadaan Rumah"
                        options={[
                          { value: "", label: "Pilih Keadaan Rumah" },
                          ...keadaanRumahOptions,
                        ]}
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                      disabled={isSubmitting}
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                    >
                      Batal
                    </Button>
                    <Button
                      className="flex items-center space-x-2"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      <Save className="h-4 w-4" />
                      <span>
                        {isSubmitting ? "Menyimpan..." : "Simpan Keluarga"}
                      </span>
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default MajelisCreateKeluarga;
