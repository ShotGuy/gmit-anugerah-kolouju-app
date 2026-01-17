import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  GraduationCap,
  MapPin,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PageTitle from "@/components/ui/PageTitle";
import { useAuth } from "@/contexts/AuthContext";
import jemaatService from "@/services/jemaatService";
import { calculateAge, formatDate } from "@/utils/dateUtils";

function DetailJemaatMajelisPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  // Fetch jemaat detail
  const {
    data: jemaatDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["majelis-jemaat-detail", id],
    queryFn: () => jemaatService.getById(id),
    enabled: !!id,
  });

  const jemaat = jemaatDetail?.data;
  // Get majelis permissions
  const majelisPermissions = user?.majelis || {};
  const {
    canView = true,
    canEdit = false,
    canCreate = false,
    canDelete = false,
  } = majelisPermissions;

  // Check if jemaat belongs to current majelis rayon
  const belongsToRayon = jemaat?.keluarga?.idRayon === user?.majelis?.idRayon;

  const handleBack = () => {
    router.push("/majelis/jemaat");
  };

  const handleEdit = () => {
    router.push(`/majelis/jemaat/edit/${id}`);
  };

  // Check if user has access to this jemaat
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

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !jemaat) {
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
        description="Informasi lengkap data jemaat"
        title={`Detail Jemaat - ${jemaat.nama}`}
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
                  Detail Jemaat
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rayon: {jemaat.keluarga?.rayon?.namaRayon}
                </p>
              </div>
            </div>

            {canEdit && (
              <Button
                className="flex items-center space-x-2"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            )}
            {/* <Button
              className="flex items-center space-x-2"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Informasi Pribadi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Nama Lengkap
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {jemaat.nama}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Jenis Kelamin
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {jemaat.jenisKelamin ? "Laki-laki" : "Perempuan"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Tanggal Lahir
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {formatDate(jemaat.tanggalLahir)} (
                        {calculateAge(jemaat.tanggalLahir)} tahun)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Golongan Darah
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {jemaat.golonganDarah || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Suku
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {jemaat.suku?.namaSuku || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </label>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          jemaat.status === "AKTIF"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {jemaat.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Family Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Informasi Keluarga</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Nama Kepala Keluarga
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {jemaat.keluarga?.namaKepalaKeluarga || "-"}
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
                </CardContent>
              </Card>

              {/* Address Information */}
              {jemaat.keluarga?.alamat && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <span>Alamat</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-gray-900 dark:text-gray-100">
                        {jemaat.keluarga.alamat.jalan}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        RT {jemaat.keluarga.alamat.rt} / RW{" "}
                        {jemaat.keluarga.alamat.rw}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {jemaat.keluarga.alamat.kelurahan?.nama},{" "}
                        {jemaat.keluarga.alamat.kelurahan?.kecamatan?.nama}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {
                          jemaat.keluarga.alamat.kelurahan?.kecamatan?.kotaKab
                            ?.nama
                        }
                        ,{" "}
                        {
                          jemaat.keluarga.alamat.kelurahan?.kecamatan?.kotaKab
                            ?.provinsi?.nama
                        }
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Kode Pos: {jemaat.keluarga.alamat.kelurahan?.kodePos}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Education & Work */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    <span>Pendidikan & Pekerjaan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pendidikan
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
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
                      {jemaat.pendapatan?.label || "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Health Insurance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-teal-600" />
                    <span>Jaminan Kesehatan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 dark:text-gray-100">
                    {jemaat.jaminanKesehatan?.jenisJaminan || "-"}
                  </p>
                </CardContent>
              </Card>

              {/* User Account */}
              {jemaat.User && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-indigo-600" />
                      <span>Akun Pengguna</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {jemaat.User.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Role
                      </label>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {jemaat.User.role}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Bergabung
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {formatDate(jemaat.User.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default DetailJemaatMajelisPage;
