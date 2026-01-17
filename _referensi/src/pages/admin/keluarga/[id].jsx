import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Home, MapPin, User, Users } from "lucide-react";
import { useRouter } from "next/router";

import { Card } from "@/components/ui/Card";
import {
  AnggotaKeluargaSkeleton,
  KeluargaInfoSkeleton,
  KepalaKeluargaSkeleton,
} from "@/components/ui/KeluargaDetailSkeleton";
import PageTitle from "@/components/ui/PageTitle";
import keluargaService from "@/services/keluargaService";

export default function KeluargaDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: keluargaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["keluarga", id],
    queryFn: () => keluargaService.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <PageTitle title="Detail Keluarga" />
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
            onClick={() => router.push("/admin/keluarga")}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Kembali
          </button>
          <div>
            <div className="h-8 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informasi Keluarga Skeleton */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center dark:text-white">
                <Home className="w-5 h-5 mr-2 text-blue-500" />
                Informasi Keluarga
              </h2>
              <KeluargaInfoSkeleton />
            </Card>
          </div>

          {/* Anggota Keluarga Skeleton */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center dark:text-white">
                <Users className="w-5 h-5 mr-2 text-green-500" />
                Anggota Keluarga
              </h2>

              {/* Kepala Keluarga Skeleton */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                  Kepala Keluarga
                </h3>
                <KepalaKeluargaSkeleton />
              </div>

              {/* Anggota Lainnya Skeleton */}
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-green-500" />
                  Anggota Keluarga Lainnya
                </h3>
                <AnggotaKeluargaSkeleton count={2} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Gagal memuat data keluarga
          </p>
        </div>
      </div>
    );
  }

  const keluarga = keluargaData?.data;

  if (!keluarga) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Data Tidak Ditemukan
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Keluarga tidak ditemukan
          </p>
        </div>
      </div>
    );
  }

  const kepalaKeluarga = keluarga?.jemaats?.find(
    (jemaat) => jemaat.statusDalamKeluarga?.status === "Kepala Keluarga"
  );

  const anggotaKeluarga = keluarga?.jemaats?.filter(
    (jemaat) => jemaat.statusDalamKeluarga?.status !== "Kepala Keluarga"
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageTitle
        title={`Detail Keluarga - No. Bangunan ${keluarga.noBagungan}`}
      />
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
          onClick={() => router.push("/admin/keluarga")}
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Kembali
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detail Keluarga - No. Bangunan {keluarga.noBagungan}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Informasi lengkap keluarga dan anggota keluarga
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Keluarga */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center dark:text-white">
              <Home className="w-5 h-5 mr-2 text-blue-500" />
              Informasi Keluarga
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  No. Bangunan
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {keluarga.noBagungan || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  No. Kartu Keluarga (KK)
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {keluarga.noKK || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Rayon
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {keluarga.rayon?.namaRayon || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status Keluarga
                </label>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    keluarga.statusKeluarga?.status === "Kawin"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : keluarga.statusKeluarga?.status === "Belum Kawin"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {keluarga.statusKeluarga?.status || "-"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status Kepemilikan Rumah
                </label>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    keluarga.statusKepemilikanRumah?.status === "Milik Sendiri"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : keluarga.statusKepemilikanRumah?.status === "Kredit/KPR"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : keluarga.statusKepemilikanRumah?.status === "Sewa"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {keluarga.statusKepemilikanRumah?.status || "-"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Keadaan Rumah
                </label>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    keluarga.keadaanRumah?.keadaan === "Sangat Baik"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : keluarga.keadaanRumah?.keadaan === "Baik"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : keluarga.keadaanRumah?.keadaan === "Cukup Baik"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : keluarga.keadaanRumah?.keadaan === "Kurang Baik"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {keluarga.keadaanRumah?.keadaan || "-"}
                </span>
              </div>

              {keluarga.alamat && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Alamat
                  </label>
                  <div className="text-gray-900 dark:text-gray-100 text-sm">
                    <p>{keluarga.alamat.jalan}</p>
                    <p>
                      RT {keluarga.alamat.rt}/RW {keluarga.alamat.rw}
                    </p>
                    <p>{keluarga.alamat.kelurahan?.nama}</p>
                    <p>{keluarga.alamat.kelurahan?.kecamatan?.nama}</p>
                    <p>{keluarga.alamat.kelurahan?.kecamatan?.kotaKab?.nama}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Anggota Keluarga */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center dark:text-white">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              Anggota Keluarga ({keluarga.jemaats?.length || 0} orang)
            </h2>

            {/* Kepala Keluarga */}
            {kepalaKeluarga && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                  Kepala Keluarga
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nama:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {kepalaKeluarga.nama}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Jenis Kelamin:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {kepalaKeluarga.jenisKelamin
                              ? "Laki-laki"
                              : "Perempuan"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tanggal Lahir:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {kepalaKeluarga.tanggalLahir
                              ? new Date(
                                  kepalaKeluarga.tanggalLahir
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pekerjaan:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {kepalaKeluarga.pekerjaan?.namaPekerjaan || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pendidikan:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {kepalaKeluarga.pendidikan?.jenjang || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            No. HP:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {kepalaKeluarga.noHp || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Anggota Keluarga Lainnya */}
            {anggotaKeluarga && anggotaKeluarga.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-green-500" />
                  Anggota Keluarga Lainnya ({anggotaKeluarga.length} orang)
                </h3>
                <div className="space-y-4">
                  {anggotaKeluarga.map((jemaat) => (
                    <div
                      key={jemaat.id}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nama:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                                {jemaat.nama}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {jemaat.statusDalamKeluarga?.status || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Jenis Kelamin:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {jemaat.jenisKelamin
                                  ? "Laki-laki"
                                  : "Perempuan"}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tanggal Lahir:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {jemaat.tanggalLahir
                                  ? new Date(
                                      jemaat.tanggalLahir
                                    ).toLocaleDateString("id-ID")
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Pekerjaan:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {jemaat.pekerjaan?.namaPekerjaan || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Pendidikan:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {jemaat.pendidikan?.jenjang || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                No. HP:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {jemaat.noHp || "-"}
                              </span>
                            </div>
                            {jemaat.statusNikah && (
                              <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Status Nikah:
                                </span>
                                <span className="ml-2 text-gray-900 dark:text-gray-100">
                                  {jemaat.statusNikah?.status || "-"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!keluarga.jemaats || keluarga.jemaats.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p>Belum ada anggota keluarga terdaftar</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
