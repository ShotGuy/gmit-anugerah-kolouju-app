import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, User, Users } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import PageTitle from "@/components/ui/PageTitle";
import { useAuth } from "@/contexts/AuthContext";
import jemaatService from "@/services/jemaatService";
import masterDataService from "@/services/masterService";
import { showToast } from "@/utils/showToast";

const golonganDarahOptions = [
  { value: "", label: "Pilih Golongan Darah" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
  { value: "O", label: "O" },
];

const jenisKelaminOptions = [
  { value: "", label: "Pilih Jenis Kelamin" },
  { value: "true", label: "Laki-laki" },
  { value: "false", label: "Perempuan" },
];

const statusOptions = [
  { value: "", label: "Pilih Status" },
  { value: "AKTIF", label: "Aktif" },
  { value: "TIDAK_AKTIF", label: "Tidak Aktif" },
  { value: "KELUAR", label: "Keluar" },
];

function EditJemaatMajelisPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const methods = useForm();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  // Fetch jemaat detail
  const {
    data: jemaatDetail,
    isLoading: loadingJemaat,
    error: jemaatError,
  } = useQuery({
    queryKey: ["majelis-jemaat-detail", id],
    queryFn: () => jemaatService.getById(id),
    enabled: !!id,
  });

  const jemaat = jemaatDetail?.data;

  // Check if jemaat belongs to current majelis rayon
  const belongsToRayon = jemaat?.keluarga?.idRayon === user?.majelis?.idRayon;

  // Fetch master data
  const { data: statusDalamKeluargaData } = useQuery({
    queryKey: ["status-dalam-keluarga"],
    queryFn: () => masterDataService.getStatusDalamKeluarga(),
  });

  const { data: sukuData } = useQuery({
    queryKey: ["suku"],
    queryFn: () => masterDataService.getSuku(),
  });

  const { data: pendidikanData } = useQuery({
    queryKey: ["pendidikan"],
    queryFn: () => masterDataService.getPendidikan(),
  });

  const { data: pekerjaanData } = useQuery({
    queryKey: ["pekerjaan"],
    queryFn: () => masterDataService.getPekerjaan(),
  });

  const { data: pendapatanData } = useQuery({
    queryKey: ["pendapatan"],
    queryFn: () => masterDataService.getPendapatan(),
  });

  const { data: jaminanKesehatanData } = useQuery({
    queryKey: ["jaminan-kesehatan"],
    queryFn: () => masterDataService.getJaminanKesehatan(),
  });

  // Initialize form when jemaat data is loaded
  useEffect(() => {
    if (jemaat) {
      reset({
        nama: jemaat.nama,
        jenisKelamin: String(jemaat.jenisKelamin), // Convert boolean to string
        tanggalLahir: jemaat.tanggalLahir?.split("T")[0], // Convert to YYYY-MM-DD format
        golonganDarah: jemaat.golonganDarah || "",
        idStatusDalamKeluarga: jemaat.idStatusDalamKeluarga,
        idSuku: jemaat.idSuku,
        idPendidikan: jemaat.idPendidikan,
        idPekerjaan: jemaat.idPekerjaan,
        idPendapatan: jemaat.idPendapatan,
        idJaminanKesehatan: jemaat.idJaminanKesehatan,
        status: jemaat.status,
      });
    }
  }, [jemaat, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => jemaatService.update(id, data),
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Data jemaat berhasil diperbarui",
        color: "success",
      });
      queryClient.invalidateQueries(["majelis-jemaat-detail", id]);
      queryClient.invalidateQueries(["majelis-jemaat"]);
      router.push(`/majelis/jemaat/${id}`);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.errors ||
        error.response?.data?.message ||
        "Gagal memperbarui data";

      showToast({
        title: "Gagal",
        description: errorMessage,
        color: "error",
      });
    },
  });

  const handleBack = () => {
    router.push(`/majelis/jemaat/${id}`);
  };

  const onSubmit = async (data) => {
    try {
      // Convert form data to proper format
      const submitData = {
        ...data,
        jenisKelamin:
          data.jenisKelamin === "true"
            ? true
            : data.jenisKelamin === "false"
              ? false
              : data.jenisKelamin,
        tanggalLahir: data.tanggalLahir,
      };

      await updateMutation.mutateAsync(submitData);
    } catch (error) {
      // Error handled in mutation
    }
  };

  // Access checks
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
                Anda belum memiliki rayon yang ditugaskan.
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

  if (loadingJemaat) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (jemaatError || !jemaat) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">
                Data Tidak Ditemukan
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Data jemaat tidak ditemukan atau sudah dihapus.
              </p>
              <Button onClick={() => router.push("/majelis/jemaat")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!belongsToRayon) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Akses Ditolak</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Jemaat ini tidak berada dalam rayon yang Anda kelola.
              </p>
              <Button onClick={() => router.push("/majelis/jemaat")}>
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
        description="Edit informasi data jemaat"
        title={`Edit Jemaat - ${jemaat.nama}`}
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
                  Edit Jemaat
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rayon: {jemaat.keluarga?.rayon?.namaRayon}
                </p>
              </div>
            </div>
          </div>

          <FormProvider {...methods}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span>Informasi Pribadi</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField required label="Nama Lengkap" name="nama">
                      <input
                        {...register("nama", {
                          required: "Nama wajib diisi",
                          minLength: {
                            value: 2,
                            message: "Nama minimal 2 karakter",
                          },
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan nama lengkap"
                      />
                    </FormField>

                    <FormField
                      required
                      label="Jenis Kelamin"
                      name="jenisKelamin"
                    >
                      <select
                        {...register("jenisKelamin", {
                          required: "Jenis kelamin wajib dipilih",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {jenisKelaminOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField
                      required
                      label="Tanggal Lahir"
                      name="tanggalLahir"
                    >
                      <input
                        {...register("tanggalLahir", {
                          required: "Tanggal lahir wajib diisi",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        type="date"
                      />
                    </FormField>

                    <FormField label="Golongan Darah" name="golonganDarah">
                      <select
                        {...register("golonganDarah")}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {golonganDarahOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField required label="Suku" name="idSuku">
                      <select
                        {...register("idSuku", {
                          required: "Suku wajib dipilih",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Pilih Suku</option>
                        {sukuData?.data?.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.namaSuku}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField required label="Status" name="status">
                      <select
                        {...register("status", {
                          required: "Status wajib dipilih",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </CardContent>
                </Card>

                {/* Family & Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span>Informasi Tambahan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      required
                      label="Status dalam Keluarga"
                      name="idStatusDalamKeluarga"
                    >
                      <select
                        {...register("idStatusDalamKeluarga", {
                          required: "Status dalam keluarga wajib dipilih",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Pilih Status dalam Keluarga</option>
                        {statusDalamKeluargaData?.data?.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.status}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField required label="Pendidikan" name="idPendidikan">
                      <select
                        {...register("idPendidikan", {
                          required: "Pendidikan wajib dipilih",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Pilih Pendidikan</option>
                        {pendidikanData?.data?.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.jenjang}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField required label="Pekerjaan" name="idPekerjaan">
                      <select
                        {...register("idPekerjaan", {
                          required: "Pekerjaan wajib dipilih",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Pilih Pekerjaan</option>
                        {pekerjaanData?.data?.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.namaPekerjaan}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField required label="Pendapatan" name="idPendapatan">
                      <select
                        {...register("idPendapatan", {
                          required: "Pendapatan wajib dipilih",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Pilih Pendapatan</option>
                        {pendapatanData?.data?.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField
                      required
                      label="Jaminan Kesehatan"
                      name="idJaminanKesehatan"
                    >
                      <select
                        {...register("idJaminanKesehatan", {
                          required: "Jaminan kesehatan wajib dipilih",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Pilih Jaminan Kesehatan</option>
                        {jaminanKesehatanData?.data?.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.jenisJaminan}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </CardContent>
                </Card>
              </div>

              {/* Submit Button */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                    >
                      Batal
                    </Button>
                    <Button
                      className="flex items-center space-x-2"
                      disabled={isSubmitting || updateMutation.isLoading}
                      type="submit"
                    >
                      <Save className="h-4 w-4" />
                      <span>
                        {isSubmitting || updateMutation.isLoading
                          ? "Menyimpan..."
                          : "Simpan Perubahan"}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default EditJemaatMajelisPage;
