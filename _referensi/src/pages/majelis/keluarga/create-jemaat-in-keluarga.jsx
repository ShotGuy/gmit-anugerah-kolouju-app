import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, User, Users } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import TextInput from "@/components/ui/inputs/TextInput";
import PageTitle from "@/components/ui/PageTitle";
import PhoneInput from "@/components/ui/PhoneInput";
import { useAuth } from "@/contexts/AuthContext";
import jemaatService from "@/services/jemaatService";
import keluargaService from "@/services/keluargaService";
import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";
import { jemaatCreateSchema } from "@/validations/masterSchema";

function MajelisCreateJemaatInKeluarga() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { keluargaId } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(jemaatCreateSchema),
    defaultValues: {
      nama: "",
      jenisKelamin: "", // Will be true/false for Boolean
      tanggalLahir: "",
      tempatLahir: "",
      golonganDarah: "",
      nomorTelepon: "",
      email: "",
      username: "",
      password: "",
      idStatusDalamKeluarga: "",
      idSuku: "",
      idPendidikan: "",
      idPekerjaan: "",
      idPendapatan: "",
      idJaminanKesehatan: "",
      idPernikahan: "",
      isKepalaKeluarga: true, // Always true for this flow
    },
  });

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // Fetch keluarga data to show context
  const { data: keluargaData, isLoading: isLoadingKeluarga } = useQuery({
    queryKey: ["keluarga", keluargaId],
    queryFn: () => keluargaService.getById(keluargaId),
    enabled: !!keluargaId,
  });

  // Fetch master data
  const { data: statusDalamKeluargaData, isLoading: isLoadingStatusKeluarga } =
    useQuery({
      queryKey: ["status-dalam-keluarga"],
      queryFn: () => masterService.getStatusDalamKeluarga(),
    });

  const { data: sukuData, isLoading: isLoadingSuku } = useQuery({
    queryKey: ["suku"],
    queryFn: () => masterService.getSuku(),
  });

  const { data: pendidikanData, isLoading: isLoadingPendidikan } = useQuery({
    queryKey: ["pendidikan"],
    queryFn: () => masterService.getPendidikan(),
  });

  const { data: pekerjaanData, isLoading: isLoadingPekerjaan } = useQuery({
    queryKey: ["pekerjaan"],
    queryFn: () => masterService.getPekerjaan(),
  });

  const { data: pendapatanData, isLoading: isLoadingPendapatan } = useQuery({
    queryKey: ["pendapatan"],
    queryFn: () => masterService.getPendapatan(),
  });

  const { data: jaminanKesehatanData, isLoading: isLoadingJaminan } = useQuery({
    queryKey: ["jaminan-kesehatan"],
    queryFn: () => masterService.getJaminanKesehatan(),
  });

  const { data: pernikahanData, isLoading: isLoadingPernikahan } = useQuery({
    queryKey: ["pernikahan"],
    queryFn: () => masterService.getPernikahan(),
  });

  // Auto-set "Kepala Keluarga" as default when status dalam keluarga data is loaded
  useEffect(() => {
    if (statusDalamKeluargaData?.data) {
      // Handle both possible response formats: data as array or data.items as array
      const dataArray = Array.isArray(statusDalamKeluargaData.data)
        ? statusDalamKeluargaData.data
        : statusDalamKeluargaData.data?.items || [];

      const kepalaKeluargaOption = dataArray.find(
        (item) =>
          item.status?.toLowerCase().includes("kepala keluarga") ||
          item.status?.toLowerCase().includes("kepala")
      );

      if (kepalaKeluargaOption && !watch("idStatusDalamKeluarga")) {
        setValue("idStatusDalamKeluarga", kepalaKeluargaOption.id);
      }
    }
  }, [statusDalamKeluargaData, setValue, watch]);

  // Transform options data for AutoCompleteInput based on actual API response structure
  const statusDalamKeluargaOptions = statusDalamKeluargaData?.data?.map
    ? statusDalamKeluargaData.data.map((item) => ({
        value: item.id,
        label: item.status,
      }))
    : statusDalamKeluargaData?.data?.items?.map((item) => ({
        value: item.id,
        label: item.status,
      })) || [];

  const sukuOptions = sukuData?.data?.map
    ? sukuData.data.map((item) => ({
        value: item.id,
        label: item.namaSuku,
      }))
    : sukuData?.data?.items?.map((item) => ({
        value: item.id,
        label: item.namaSuku,
      })) || [];

  const pendidikanOptions = pendidikanData?.data?.map
    ? pendidikanData.data.map((item) => ({
        value: item.id,
        label: item.jenjang,
      }))
    : pendidikanData?.data?.items?.map((item) => ({
        value: item.id,
        label: item.jenjang,
      })) || [];

  const pekerjaanOptions = pekerjaanData?.data?.map
    ? pekerjaanData.data.map((item) => ({
        value: item.id,
        label: item.namaPekerjaan,
      }))
    : pekerjaanData?.data?.items?.map((item) => ({
        value: item.id,
        label: item.namaPekerjaan,
      })) || [];

  const pendapatanOptions = pendapatanData?.data?.map
    ? pendapatanData.data.map((item) => ({
        value: item.id,
        label: item.label,
      }))
    : pendapatanData?.data?.items?.map((item) => ({
        value: item.id,
        label: item.label,
      })) || [];

  const jaminanKesehatanOptions = jaminanKesehatanData?.data?.map
    ? jaminanKesehatanData.data.map((item) => ({
        value: item.id,
        label: item.jenisJaminan,
      }))
    : jaminanKesehatanData?.data?.items?.map((item) => ({
        value: item.id,
        label: item.jenisJaminan,
      })) || [];

  const pernikahanOptions = pernikahanData?.data?.map
    ? pernikahanData.data.map((item) => ({
        value: item.id,
        label: `${item.tanggal} - ${item.klasis?.nama || "Unknown"}`,
      }))
    : pernikahanData?.data?.items?.map((item) => ({
        value: item.id,
        label: `${item.tanggal} - ${item.klasis?.nama || "Unknown"}`,
      })) || [];

  // Golongan Darah options
  const golonganDarahOptions = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "AB", label: "AB" },
    { value: "O", label: "O" },
  ];

  // Jenis Kelamin options
  const jenisKelaminOptions = [
    { value: true, label: "Laki-laki" },
    { value: false, label: "Perempuan" },
  ];

  // Create jemaat mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Prepare jemaat data according to Prisma schema
      const jemaatData = {
        // Basic info
        nama: data.nama,
        jenisKelamin:
          data.jenisKelamin === "true" || data.jenisKelamin === true, // Convert to Boolean
        tanggalLahir: data.tanggalLahir,
        tempatLahir: data.tempatLahir,
        golonganDarah: data.golonganDarah || null,
        nomorTelepon: data.nomorTelepon,
        email: data.email,

        // Relations (required)
        idKeluarga: keluargaId,
        idStatusDalamKeluarga: data.idStatusDalamKeluarga,
        idSuku: data.idSuku,
        idPendidikan: data.idPendidikan,
        idPekerjaan: data.idPekerjaan,
        idPendapatan: data.idPendapatan,
        idJaminanKesehatan: data.idJaminanKesehatan,

        // Optional relations
        idPernikahan: data.idPernikahan || null,

        // Status (default AKTIF)
        status: "AKTIF",

        // For user account creation
        username: data.username,
        password: data.password,
        noWhatsapp: data.nomorTelepon,
        isKepalaKeluarga: true,
      };

      return jemaatService.createWithUser(jemaatData);
    },
    onSuccess: (data) => {
      showToast({
        title: "Berhasil!",
        description: `Kepala keluarga ${data.data.jemaat?.nama || data.data.nama} berhasil ditambahkan! Akun user juga berhasil dibuat.`,
        color: "success",
      });

      // Invalidate and refetch
      queryClient.invalidateQueries(["keluarga"]);
      queryClient.invalidateQueries(["jemaat"]);
      queryClient.invalidateQueries(["majelis-dashboard"]);

      // Redirect back to keluarga list
      router.push("/majelis/keluarga");
    },
    onError: (error) => {
      console.error("Create jemaat error:", error);
      showToast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal menambahkan kepala keluarga",
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

  const handleSkip = () => {
    showToast({
      title: "Informasi",
      description:
        "Keluarga berhasil dibuat. Anda dapat menambahkan jemaat nanti.",
      color: "info",
    });
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

  // Loading state
  if (isLoadingKeluarga) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p>Memuat data keluarga...</p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles="MAJELIS">
      <PageTitle
        description="Menambahkan kepala keluarga untuk keluarga yang baru dibuat"
        title="Tambah Kepala Keluarga"
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
                  Tambah Kepala Keluarga
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rayon: {user.majelis?.rayon?.namaRayon || "Tidak diketahui"}
                </p>
              </div>
            </div>
          </div>

          {/* Keluarga Info Card */}
          {keluargaData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <Users className="h-5 w-5" />
                  <span>Keluarga Berhasil Dibuat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">No. Bangunan:</span>{" "}
                    {keluargaData.data.noBagungan}
                  </div>
                  <div>
                    <span className="font-medium">Rayon:</span>{" "}
                    {keluargaData.data.rayon?.namaRayon}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Alamat:</span>{" "}
                    {keluargaData.data.alamat?.jalan}, RT{" "}
                    {keluargaData.data.alamat?.rt}, RW{" "}
                    {keluargaData.data.alamat?.rw},{" "}
                    {keluargaData.data.alamat?.kelurahan?.nama}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Data Kepala Keluarga</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lengkapi data kepala keluarga. Akun user akan otomatis dibuat
                dengan username dan password yang digenerate.
              </p>
            </CardHeader>
            <CardContent>
              <FormProvider {...form}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Basic Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      {...register("nama")}
                      required
                      error={errors.nama?.message}
                      label="Nama Lengkap"
                      placeholder="Contoh: John Doe"
                    />

                    <AutoCompleteInput
                      required
                      label="Jenis Kelamin"
                      name="jenisKelamin"
                      options={jenisKelaminOptions}
                      placeholder="Pilih jenis kelamin"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tanggal Lahir *
                      </label>
                      <input
                        type="date"
                        {...register("tanggalLahir")}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      {errors.tanggalLahir && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.tanggalLahir.message}
                        </p>
                      )}
                    </div>

                    <TextInput
                      {...register("tempatLahir")}
                      required
                      error={errors.tempatLahir?.message}
                      label="Tempat Lahir"
                      placeholder="Contoh: Jakarta"
                    />

                    <AutoCompleteInput
                      label="Golongan Darah"
                      name="golonganDarah"
                      options={golonganDarahOptions}
                      placeholder="Pilih golongan darah"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {isLoadingStatusKeluarga ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    ) : (
                      <AutoCompleteInput
                        required
                        label="Status Dalam Keluarga"
                        name="idStatusDalamKeluarga"
                        options={statusDalamKeluargaOptions}
                        placeholder="Otomatis dipilih: Kepala Keluarga"
                      />
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Informasi Tambahan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isLoadingSuku ? (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
                          <div className="h-10 bg-gray-200 rounded" />
                        </div>
                      ) : (
                        <AutoCompleteInput
                          required
                          label="Suku"
                          name="idSuku"
                          options={sukuOptions}
                          placeholder="Pilih suku"
                        />
                      )}

                      {isLoadingPendidikan ? (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                          <div className="h-10 bg-gray-200 rounded" />
                        </div>
                      ) : (
                        <AutoCompleteInput
                          required
                          label="Pendidikan"
                          name="idPendidikan"
                          options={pendidikanOptions}
                          placeholder="Pilih pendidikan"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {isLoadingPekerjaan ? (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                          <div className="h-10 bg-gray-200 rounded" />
                        </div>
                      ) : (
                        <AutoCompleteInput
                          required
                          label="Pekerjaan"
                          name="idPekerjaan"
                          options={pekerjaanOptions}
                          placeholder="Pilih pekerjaan"
                        />
                      )}

                      {isLoadingPendapatan ? (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                          <div className="h-10 bg-gray-200 rounded" />
                        </div>
                      ) : (
                        <AutoCompleteInput
                          required
                          label="Pendapatan"
                          name="idPendapatan"
                          options={pendapatanOptions}
                          placeholder="Pilih pendapatan"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {isLoadingJaminan ? (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                          <div className="h-10 bg-gray-200 rounded" />
                        </div>
                      ) : (
                        <AutoCompleteInput
                          required
                          label="Jaminan Kesehatan"
                          name="idJaminanKesehatan"
                          options={jaminanKesehatanOptions}
                          placeholder="Pilih jaminan kesehatan"
                        />
                      )}

                      {isLoadingPernikahan ? (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
                          <div className="h-10 bg-gray-200 rounded" />
                        </div>
                      ) : (
                        <AutoCompleteInput
                          label="Pernikahan (Opsional)"
                          name="idPernikahan"
                          options={pernikahanOptions}
                          placeholder="Pilih data pernikahan"
                        />
                      )}
                    </div>
                  </div>

                  {/* User Account Section */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Data Akun User (Wajib)
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Informasi
                      </h4>
                      <p className="text-sm text-blue-700">
                        • Akun ini akan digunakan kepala keluarga untuk login ke
                        sistem
                        <br />
                        • Role otomatis: JEMAAT
                        <br />• Email, nomor WhatsApp, username dan password
                        harus diisi manual
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextInput
                        {...register("email")}
                        required
                        error={errors.email?.message}
                        label="Email"
                        placeholder="contoh@email.com"
                        type="email"
                      />

                      <PhoneInput
                        {...register("nomorTelepon")}
                        required
                        error={errors.nomorTelepon?.message}
                        label="Nomor WhatsApp"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <TextInput
                        {...register("username")}
                        required
                        error={errors.username?.message}
                        label="Username"
                        placeholder="Contoh: john123"
                      />

                      <TextInput
                        {...register("password")}
                        required
                        error={errors.password?.message}
                        label="Password"
                        placeholder="Minimal 6 karakter"
                        type="password"
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      className="text-gray-600"
                      disabled={isSubmitting}
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                    >
                      Lewati (Tambah Nanti)
                    </Button>

                    <div className="flex space-x-4">
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
                          {isSubmitting
                            ? "Menyimpan..."
                            : "Simpan Kepala Keluarga"}
                        </span>
                      </Button>
                    </div>
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

export default MajelisCreateJemaatInKeluarga;
