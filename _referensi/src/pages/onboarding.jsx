import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextInput from "@/components/ui/inputs/TextInput";
import PageTitle from "@/components/ui/PageTitle";
import { showToast } from "@/utils/showToast";

const validationSchema = z.object({
  nama: z.string().min(1, "Nama lengkap harus diisi"),
  jenisKelamin: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === "string") {
      return val === "true";
    }

    return val;
  }),
  tanggalLahir: z
    .string()
    .min(1, "Tanggal lahir harus diisi")
    .transform((str) => new Date(str)),
  idStatusDalamKeluarga: z
    .string()
    .min(1, "Status dalam keluarga harus dipilih"),
  idSuku: z.string().min(1, "Suku harus dipilih"),
  idPendidikan: z.string().min(1, "Pendidikan harus dipilih"),
  idPekerjaan: z.string().min(1, "Pekerjaan harus dipilih"),
  idPendapatan: z.string().min(1, "Pendapatan harus dipilih"),
  idJaminanKesehatan: z.string().min(1, "Jaminan kesehatan harus dipilih"),
  noKK: z
    .string()
    .min(16, "NIK harus 16 digit")
    .max(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK harus berupa angka"),
  golonganDarah: z.string().optional(),
  idPernikahan: z.string().optional(),
});

const jenisKelaminOptions = [
  { value: "true", label: "Laki-laki" },
  { value: "false", label: "Perempuan" },
];

const golonganDarahOptions = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
  { value: "O", label: "O" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { token } = router.query;
  const [tokenData, setTokenData] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [keluargaData, setKeluargaData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    getValues,
  } = methods;

  // Validate token on mount and when token changes
  useEffect(() => {
    if (token) {
      validateToken(token);
    }
  }, [token]);

  const validateToken = async (invitationToken) => {
    try {
      setIsValidating(true);

      const response = await axios.post("/api/auth/validate-invitation", {
        token: invitationToken,
      });

      if (response.data.success) {
        setTokenData(response.data.data);
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        showToast({
          title: "Token Tidak Valid",
          description:
            response.data.message ||
            "Token undangan tidak valid atau telah kedaluwarsa",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setIsTokenValid(false);
      showToast({
        title: "Gagal Validasi Token",
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan saat validasi token",
        color: "danger",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSearchKeluarga = async () => {
    const noKK = getValues("noKK");

    if (!noKK || noKK.length !== 16) {
      showToast({
        title: "NIK Tidak Valid",
        description: "NIK harus 16 digit",
        color: "warning",
      });
      return;
    }

    try {
      setIsSearching(true);
      setKeluargaData(null);

      const response = await axios.post("/api/keluarga/search-by-nokk", {
        noKK,
      });

      if (response.data.success) {
        setKeluargaData(response.data.data);
        showToast({
          title: "Keluarga Ditemukan",
          description: `Keluarga dengan kepala keluarga ${response.data.data.kepalaKeluarga?.nama || "Tidak diketahui"} ditemukan`,
          color: "success",
        });
      }
    } catch (error) {
      console.error("Error searching keluarga:", error);
      setKeluargaData(null);
      showToast({
        title: "Keluarga Tidak Ditemukan",
        description:
          error.response?.data?.message ||
          "Keluarga dengan NIK tersebut tidak ditemukan",
        color: "error",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Submit onboarding data
  const onboardingMutation = useMutation({
    mutationFn: async (data) => {
      // Validate keluarga data exists
      if (!keluargaData || !keluargaData.id) {
        throw new Error("Silakan cari dan pilih keluarga terlebih dahulu");
      }

      // Prepare clean data with direct field mapping
      const jemaatData = {
        nama: data.nama,
        jenisKelamin: data.jenisKelamin,
        tanggalLahir: data.tanggalLahir,
        golonganDarah: data.golonganDarah,
        idKeluarga: keluargaData.id,
        idStatusDalamKeluarga: data.idStatusDalamKeluarga,
        idSuku: data.idSuku,
        idPendidikan: data.idPendidikan,
        idPekerjaan: data.idPekerjaan,
        idPendapatan: data.idPendapatan,
        idJaminanKesehatan: data.idJaminanKesehatan,
        idPernikahan: data.idPernikahan,
      };

      const response = await axios.post("/api/auth/onboarding", {
        token,
        jemaatData: jemaatData,
      });

      return response.data;
    },
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description:
          "Profil berhasil dilengkapi! Silakan login untuk melanjutkan",
        color: "success",
      });
      router.push("/login");
    },
    onError: (error) => {
      console.error("Error onboarding:", error);
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal melengkapi profil",
        color: "danger",
      });
    },
  });

  const onSubmit = (data) => {
    onboardingMutation.mutate(data);
  };

  if (!token) {
    return (
      <>
        <PageTitle title="Token Tidak Ditemukan - Onboarding" />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Token Tidak Ditemukan
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Link undangan tidak lengkap atau tidak valid.
              </p>
              <Button onClick={() => router.push("/login")}>
                Kembali ke Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isValidating) {
    return (
      <>
        <PageTitle title="Validasi Token - Onboarding" />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Memvalidasi Token
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mohon tunggu sebentar...</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!isTokenValid || !tokenData) {
    return (
      <>
        <PageTitle title="Token Tidak Valid - Onboarding" />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Token Tidak Valid
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Link undangan tidak valid, telah kedaluwarsa, atau sudah
                digunakan.
              </p>
              <Button onClick={() => router.push("/login")}>
                Kembali ke Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        description="Lengkapi profil jemaat GMIT Betlehem Oesapa Barat"
        title="Lengkapi Profil - GMIT Betlehem Oesapa Barat"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  GMIT Betlehem Oesapa Barat
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lengkapi Profil Jemaat</p>
              </div>
            </div>
          </div>

          {/* User & Family Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Informasi Undangan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Nama User</label>
                  <p className="text-gray-900 dark:text-white">{tokenData.user.username}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="text-gray-900 dark:text-white">{tokenData.user.email}</p>
                </div>
                {tokenData.keluarga ? (
                  <>
                    <div>
                      <label className="font-medium text-gray-700 dark:text-gray-300">Keluarga</label>
                      <p className="text-gray-900 dark:text-white">
                        {tokenData.keluarga.namaKepalaKeluarga || `Bangunan ${tokenData.keluarga.noBagungan}`}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 dark:text-gray-300">Rayon</label>
                      <p className="text-gray-900 dark:text-white">
                        {tokenData.keluarga.rayon.namaRayon}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        ℹ️ Anda akan mencari keluarga sendiri menggunakan NIK saat melengkapi profil
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Data Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormProvider {...methods}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <TextInput
                        required
                        label="Nama Lengkap"
                        name="nama"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    <SelectInput
                      required
                      label="Jenis Kelamin"
                      name="jenisKelamin"
                      options={jenisKelaminOptions}
                      placeholder="Pilih jenis kelamin"
                    />

                    <DatePicker
                      required
                      label="Tanggal Lahir"
                      name="tanggalLahir"
                      placeholder="Pilih tanggal lahir"
                    />

                    <AutoCompleteInput
                      required
                      apiEndpoint="/status-dalam-keluarga/options"
                      label="Status dalam Keluarga"
                      name="idStatusDalamKeluarga"
                      placeholder="Pilih status dalam keluarga"
                    />

                    <AutoCompleteInput
                      required
                      apiEndpoint="/suku/options"
                      label="Suku"
                      name="idSuku"
                      placeholder="Pilih suku"
                    />

                    <AutoCompleteInput
                      required
                      apiEndpoint="/pendidikan/options"
                      label="Pendidikan"
                      name="idPendidikan"
                      placeholder="Pilih pendidikan terakhir"
                    />

                    <AutoCompleteInput
                      required
                      apiEndpoint="/pekerjaan/options"
                      label="Pekerjaan"
                      name="idPekerjaan"
                      placeholder="Pilih pekerjaan"
                    />

                    <AutoCompleteInput
                      required
                      apiEndpoint="/pendapatan/options"
                      label="Kategori Pendapatan"
                      name="idPendapatan"
                      placeholder="Pilih kategori pendapatan"
                    />

                    <AutoCompleteInput
                      required
                      apiEndpoint="/jaminan-kesehatan/options"
                      label="Jaminan Kesehatan"
                      name="idJaminanKesehatan"
                      placeholder="Pilih jaminan kesehatan"
                    />

                    <SelectInput
                      label="Golongan Darah"
                      name="golonganDarah"
                      options={golonganDarahOptions}
                      placeholder="Pilih golongan darah (opsional)"
                    />

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nomor Kartu Keluarga (KK) *
                      </label>
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            {...methods.register("noKK")}
                            maxLength={16}
                            placeholder="Masukkan 16 digit NIK"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                          {errors.noKK && (
                            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.noKK.message}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSearching || watch("noKK")?.length !== 16}
                          onClick={handleSearchKeluarga}
                          className="whitespace-nowrap"
                        >
                          {isSearching ? (
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4 mr-2" />
                          )}
                          {isSearching ? "Mencari..." : "Cari"}
                        </Button>
                      </div>
                    </div>

                    {/* Keluarga Search Result */}
                    {keluargaData && (
                      <div className="md:col-span-2">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                Keluarga Ditemukan
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700 dark:text-green-400">
                                <div>
                                  <span className="font-medium">Kepala Keluarga:</span>{" "}
                                  {keluargaData.kepalaKeluarga?.nama || "-"}
                                </div>
                                <div>
                                  <span className="font-medium">No. Bangunan:</span>{" "}
                                  {keluargaData.noBagungan}
                                </div>
                                <div>
                                  <span className="font-medium">Rayon:</span>{" "}
                                  {keluargaData.rayon}
                                </div>
                                <div className="md:col-span-2">
                                  <span className="font-medium">Alamat:</span>{" "}
                                  {keluargaData.alamat}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    {!keluargaData && (
                      <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          <AlertCircle className="h-4 w-4 inline mr-2" />
                          Silakan cari keluarga dengan NIK terlebih dahulu sebelum menyimpan profil
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/login")}
                      >
                        Batal
                      </Button>

                      <Button
                        className="min-w-[120px]"
                        disabled={!isValid || !keluargaData || onboardingMutation.isLoading}
                        type="submit"
                      >
                        {onboardingMutation.isLoading ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {onboardingMutation.isLoading
                          ? "Menyimpan..."
                          : "Simpan Profil"}
                      </Button>
                    </div>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
