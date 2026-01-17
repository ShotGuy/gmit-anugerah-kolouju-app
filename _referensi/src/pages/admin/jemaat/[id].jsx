import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";
import {
  User,
  MapPin,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  Calendar,
  Phone,
} from "lucide-react";

import jemaatService from "@/services/jemaatService";
import PageHeader from "@/components/ui/PageHeader";

export default function JemaatDetail() {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: jemaatData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jemaat", id],
    queryFn: () => jemaatService.getById(id),
    enabled: !!id,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (min, max) => {
    const formatRupiah = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };
    return `${formatRupiah(min)} - ${formatRupiah(max)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
        <h3 className="font-semibold">Error</h3>
        <p>Gagal memuat data jemaat. Silakan coba lagi.</p>
      </div>
    );
  }

  const jemaat = jemaatData?.data;

  if (!jemaat) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-gray-700 dark:text-gray-300">
        <h3 className="font-semibold">Data Tidak Ditemukan</h3>
        <p>Data jemaat dengan ID {id} tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Jemaat", href: "/admin/jemaat" },
          { label: jemaat.nama, href: `/admin/jemaat/${id}` },
        ]}
        description="Detail informasi jemaat"
        title="Detail Jemaat"
      />

      <div className="space-y-6 p-4">
        {/* Header Card with Photo and Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {jemaat.nama}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Jenis Kelamin:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {jemaat.jenisKelamin ? "Laki-laki" : "Perempuan"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Tanggal Lahir:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(jemaat.tanggalLahir)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Golongan Darah:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">{jemaat.golonganDarah || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Informasi Pribadi
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status dalam Keluarga
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {jemaat.statusDalamKeluarga?.status || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Suku
                </label>
                <p className="text-gray-900 dark:text-gray-100">{jemaat.suku?.namaSuku || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status Pernikahan
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {jemaat.idPernikahan ? "Menikah" : "Belum Menikah"}
                </p>
              </div>
            </div>
          </div>

          {/* Education & Career */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                Pendidikan & Pekerjaan
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pendidikan Terakhir
                </label>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                  {jemaat.pendidikan?.jenjang || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pekerjaan
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {jemaat.pekerjaan?.namaPekerjaan || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pendapatan
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {jemaat.pendapatan
                    ? formatCurrency(
                        jemaat.pendapatan.min,
                        jemaat.pendapatan.max
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Jaminan Kesehatan
                </label>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-500" />
                  {jemaat.jaminanKesehatan?.jenisJaminan || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-600" />
              Alamat & Lokasi
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Alamat Lengkap
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {jemaat.keluarga?.alamat?.jalan}, RT{" "}
                    {jemaat.keluarga?.alamat?.rt}/RW{" "}
                    {jemaat.keluarga?.alamat?.rw}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Kelurahan
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {jemaat.keluarga?.alamat?.kelurahan?.nama}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Kecamatan
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {jemaat.keluarga?.alamat?.kelurahan?.kecamatan?.nama}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Kota/Kabupaten
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {
                      jemaat.keluarga?.alamat?.kelurahan?.kecamatan?.kotaKab
                        ?.nama
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Provinsi
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {
                      jemaat.keluarga?.alamat?.kelurahan?.kecamatan?.kotaKab
                        ?.provinsi?.nama
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Kode Pos
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {jemaat.keluarga?.alamat?.kelurahan?.kodePos}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Home className="w-5 h-5 mr-2 text-purple-600" />
              Informasi Keluarga
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status Keluarga
                </label>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  {jemaat.keluarga?.statusKeluarga?.status || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Kepemilikan Rumah
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {jemaat.keluarga?.statusKepemilikanRumah?.status || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Keadaan Rumah
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {jemaat.keluarga?.keadaanRumah?.keadaan || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  No. Kartu Keluarga (KK)
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {jemaat.keluarga?.noKK || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  No. Bangunan
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {jemaat.keluarga?.noBagungan || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rayon
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {jemaat.keluarga?.rayon?.namaRayon || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={() => router.push("/admin/jemaat")}
          >
            Kembali
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={() => router.push(`/admin/jemaat/edit/${id}`)}
          >
            Edit Data
          </button>
        </div>
      </div>
    </>
  );
}
