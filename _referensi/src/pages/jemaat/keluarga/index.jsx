import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Home, MapPin, Phone, User, Users } from "lucide-react";
import { useRouter } from "next/router";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PageTitle from "@/components/ui/PageTitle";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

export default function JemaatKeluargaPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: keluargaData, isLoading } = useQuery({
    queryKey: ["keluarga", user?.jemaat?.idKeluarga],
    queryFn: async () => {
      // if (!user?.jemaat?.idKeluarga) return null;
      const response = await api.get(`/keluarga/${user.jemaat.keluarga.id}`);

      return response.data.data;
    },
    // enabled: !!user?.jemaat?.idKeluarga,
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles="JEMAAT">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Memuat data keluarga...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles="JEMAAT">
      <PageTitle title="Keluarga - GMIT Betlehem Oesapa Barat" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <button
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => router.push("/jemaat/dashboard")}
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Informasi Keluarga
                </h1>
                <p className="text-sm text-gray-600">
                  Data anggota keluarga dan alamat
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Family Overview */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Home className="h-5 w-5 mr-2 text-purple-600" />
                Informasi Keluarga
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    No. Bangunan
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {keluargaData?.noBagungan ||
                      user?.jemaat?.keluarga?.noBagungan ||
                      "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rayon
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {keluargaData?.rayon?.namaRayon ||
                      user?.jemaat?.keluarga?.rayon?.namaRayon ||
                      "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status Keluarga
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {keluargaData?.statusKeluarga?.status ||
                      user?.jemaat?.keluarga?.statusKeluarga?.status ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                Alamat Lengkap
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jalan
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {keluargaData?.alamat?.jalan ||
                      user?.jemaat?.keluarga?.alamat?.jalan ||
                      "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    RT/RW
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {keluargaData?.alamat
                      ? `RT ${keluargaData.alamat.rt} / RW ${keluargaData.alamat.rw}`
                      : user?.jemaat?.keluarga?.alamat
                        ? `RT ${user.jemaat.keluarga.alamat.rt} / RW ${user.jemaat.keluarga.alamat.rw}`
                        : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kelurahan
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {keluargaData?.alamat?.kelurahan?.nama ||
                      user?.jemaat?.keluarga?.alamat?.kelurahan?.nama ||
                      "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status Kepemilikan Rumah
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {keluargaData?.statusKepemilikanRumah?.status ||
                      user?.jemaat?.keluarga?.statusKepemilikanRumah?.status ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Family Members */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Anggota Keluarga
              </h3>

              {keluargaData?.jemaats && keluargaData.jemaats.length > 0 ? (
                <div className="grid gap-4">
                  {keluargaData.jemaats.map((member, index) => (
                    <div
                      key={member.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h4 className="text-lg font-medium text-gray-900">
                                {member.nama}
                              </h4>
                              {member.id === user?.jemaat?.id && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Anda
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {member.statusDalamKeluarga?.status ||
                                "Status tidak diketahui"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {member.jenisKelamin === true
                              ? "Laki-laki"
                              : member.jenisKelamin === false
                                ? "Perempuan"
                                : "-"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {member.tanggalLahir
                              ? new Date(
                                member.tanggalLahir
                              ).toLocaleDateString("id-ID")
                              : "Tanggal lahir tidak diketahui"}
                          </p>
                        </div>
                      </div>

                      {/* Additional member info */}
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Suku:</span>{" "}
                          {member.suku?.namaSuku || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Pendidikan:</span>{" "}
                          {member.pendidikan?.jenjang || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Pekerjaan:</span>{" "}
                          {member.pekerjaan?.namaPekerjaan || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Darah:</span>{" "}
                          {member.golonganDarah || "-"}
                        </div>
                      </div>

                      {/* Contact info if user has account */}
                      {member.User && (
                        <div className="mt-3 flex items-center text-xs text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          <span className="font-medium">WhatsApp:</span>
                          <span className="ml-1">
                            {member.User.noWhatsapp || "Tidak ada"}
                          </span>
                          <span className="ml-3 font-medium">Email:</span>
                          <span className="ml-1">
                            {member.User.email || "Tidak ada"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Data anggota keluarga tidak tersedia</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
