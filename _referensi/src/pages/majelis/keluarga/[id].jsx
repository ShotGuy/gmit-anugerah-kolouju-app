import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  DollarSign,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  Shield,
  User,
  Users
} from "lucide-react";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import PageTitle from "@/components/ui/PageTitle";
import keluargaService from "@/services/keluargaService";

// Page Header Component
function PageHeader({ title, description, breadcrumb, onBack }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="flex mb-4">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumb.map((item, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        clipRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  )}
                  {item.href ? (
                    <a
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              {onBack && (
                <Button
                  className="mr-3"
                  size="sm"
                  variant="ghost"
                  onClick={onBack}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  {title}
                </h1>
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2" />
                    <div className="h-5 bg-gray-300 rounded w-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Jemaat Card Component
function JemaatCard({ jemaat }) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGenderText = (jenisKelamin) => {
    return jenisKelamin ? "Perempuan" : "Laki-laki";
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} tahun`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {jemaat.nama}
            </h3>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {jemaat.statusDalamKeluarga?.status || "-"}
            </span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${jemaat.jenisKelamin
              ? "bg-pink-100 text-pink-800"
              : "bg-blue-100 text-blue-800"
            }`}>
            {getGenderText(jemaat.jenisKelamin)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Info */}
          <div>
            <label className="text-sm font-medium text-gray-500">
              Tanggal Lahir
            </label>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
              <p className="text-sm text-gray-900">
                {formatDate(jemaat.tanggalLahir)}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Usia
            </label>
            <p className="text-sm text-gray-900">
              {calculateAge(jemaat.tanggalLahir)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Golongan Darah
            </label>
            <p className="text-sm text-gray-900">
              {jemaat.golonganDarah || "-"}
            </p>
          </div>

          {/* Demographic Info */}
          <div>
            <label className="text-sm font-medium text-gray-500">
              Suku
            </label>
            <p className="text-sm text-gray-900">
              {jemaat.suku?.namaSuku || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Pendidikan
            </label>
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 text-gray-400 mr-1" />
              <p className="text-sm text-gray-900">
                {jemaat.pendidikan?.jenjang || "-"}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Pekerjaan
            </label>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 text-gray-400 mr-1" />
              <p className="text-sm text-gray-900">
                {jemaat.pekerjaan?.namaPekerjaan || "-"}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Pendapatan
            </label>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
              <p className="text-sm text-gray-900">
                {jemaat.pendapatan?.label || "-"}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Jaminan Kesehatan
            </label>
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-gray-400 mr-1" />
              <p className="text-sm text-gray-900">
                {jemaat.jaminanKesehatan?.jenisJaminan || "-"}
              </p>
            </div>
          </div>

          {/* Marital Status */}
          {jemaat.pernikahan && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status Pernikahan
              </label>
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-gray-400 mr-1" />
                <p className="text-sm text-gray-900">
                  Menikah ({formatDate(jemaat.pernikahan.tanggal)})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Church Activities */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baptis Info */}
            {jemaat.baptiss && jemaat.baptiss.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Baptis
                </label>
                {jemaat.baptiss.map((baptis, index) => (
                  <div key={index} className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {formatDate(baptis.tanggal)} - {baptis.klasis?.nama || "Klasis"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Sidi Info */}
            {jemaat.sidis && jemaat.sidis.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Sidi
                </label>
                {jemaat.sidis.map((sidi, index) => (
                  <div key={index} className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {formatDate(sidi.tanggal)} - {sidi.klasis?.nama || "Klasis"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function KeluargaDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // Fetch keluarga detail data from API
  const {
    data: keluargaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["keluarga", id],
    queryFn: () => keluargaService.getById(id),
    enabled: !!id,
  });

  const handleBack = () => {
    router.push("/majelis/keluarga");
  };

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Terjadi Kesalahan
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {error.message || "Gagal memuat data keluarga"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const keluarga = keluargaData?.data;
  const jemaats = keluarga?.jemaats || [];

  return (
    <>
      <PageTitle
        description="Detail informasi keluarga dan anggota - GMIT Betlehem Oesapa Barat"
        title={keluarga ? `Detail Keluarga Bangunan ${keluarga.noBagungan}` : "Detail Keluarga"}
      />

      <div className="space-y-6 p-4">
        {/* Page Header */}
        <PageHeader
          breadcrumb={[
            { label: "Majelis", href: "/majelis/dashboard" },
            { label: "Data Keluarga", href: "/majelis/keluarga" },
            { label: "Detail Keluarga" },
          ]}
          description={keluarga ? `${keluarga.rayon?.namaRayon || "Rayon"} - ${jemaats.length} anggota keluarga` : ""}
          title={keluarga ? `Keluarga Bangunan ${keluarga.noBagungan}` : "Detail Keluarga"}
          onBack={handleBack}
        />

        {isLoading ? (
          <DetailSkeleton />
        ) : keluarga ? (
          <>
            {/* Family Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Home className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Informasi Keluarga
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      No. Bangunan
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {keluarga.noBagungan}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      No. Kartu Keluarga (KK)
                    </label>
                    <p className="text-sm text-gray-900">
                      {keluarga.noKK || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Rayon
                    </label>
                    <p className="text-sm text-gray-900">
                      {keluarga.rayon?.namaRayon || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total Anggota
                    </label>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-sm text-gray-900">
                        {jemaats.length} orang
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Alamat Lengkap
                    </label>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                      <p className="text-sm text-gray-900">
                        {keluarga.alamat ?
                          `${keluarga.alamat.jalan || ""} RT ${keluarga.alamat.rt || ""} RW ${keluarga.alamat.rw || ""}, ${keluarga.alamat.kelurahan?.nama || ""}, ${keluarga.alamat.kelurahan?.kecamatan?.nama || ""}, ${keluarga.alamat.kelurahan?.kecamatan?.kotaKab?.nama || ""}, ${keluarga.alamat.kelurahan?.kecamatan?.kotaKab?.provinsi?.nama || ""} ${keluarga.alamat.kelurahan?.kodePos || ""}`
                          : "-"
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status Keluarga
                    </label>
                    <p className="text-sm text-gray-900">
                      {keluarga.statusKeluarga?.status || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Keadaan Rumah
                    </label>
                    <p className="text-sm text-gray-900">
                      {keluarga.keadaanRumah?.keadaan || "-"}
                    </p>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium text-gray-500">
                      Status Kepemilikan Rumah
                    </label>
                    <p className="text-sm text-gray-900">
                      {keluarga.statusKepemilikanRumah?.status || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Members */}
            <div>
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Anggota Keluarga ({jemaats.length})
                </h2>
              </div>

              {jemaats.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {jemaats.map((jemaat) => (
                    <JemaatCard key={jemaat.id} jemaat={jemaat} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Belum ada anggota keluarga
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Data anggota keluarga belum tersedia.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Data tidak ditemukan
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Data keluarga yang Anda cari tidak ditemukan.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}