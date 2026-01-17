import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Home, Users } from "lucide-react";
import { useRouter } from "next/router";

import { Card } from "@/components/ui/Card";
import rayonService from "@/services/rayonService";

export default function RayonDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // Fetch rayon detail
  const {
    data: rayon,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rayon", id],
    queryFn: () => rayonService.getRayonById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat data rayon...</p>
        </div>
      </div>
    );
  }

  if (error || !rayon?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Terjadi kesalahan saat memuat data rayon
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => router.push("/admin/rayon")}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const rayonData = rayon.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            onClick={() => router.push("/admin/rayon")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Rayon
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Rayon {rayonData.namaRayon}
          </h1>
          <p className="text-gray-600">Detail informasi rayon</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informasi Rayon
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Rayon
                  </label>
                  <p className="text-gray-900">{rayonData.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Rayon
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {rayonData.namaRayon}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Keluarga
                  </label>
                  <p className="text-gray-900">
                    {rayonData._count?.keluargas || 0} keluarga
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Jemaat
                  </label>
                  <p className="text-gray-900">
                    {rayonData.keluargas?.reduce(
                      (total, keluarga) =>
                        total + (keluarga.jemaats?.length || 0),
                      0,
                    ) || 0}{" "}
                    jemaat
                  </p>
                </div>
              </div>
            </Card>

            {/* Keluarga List */}
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Daftar Keluarga
              </h2>
              {rayonData.keluargas && rayonData.keluargas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No. Bagungan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alamat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah Jemaat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rayonData.keluargas.map((keluarga) => (
                        <tr key={keluarga.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {keluarga.noBagungan}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {keluarga.alamat ? (
                              <span>
                                {keluarga.alamat.jalan}, RT {keluarga.alamat.rt}
                                /RW {keluarga.alamat.rw}
                                <br />
                                {keluarga.alamat.kelurahan?.nama},{" "}
                                {keluarga.alamat.kelurahan?.kecamatan?.nama}
                              </span>
                            ) : (
                              "Alamat tidak tersedia"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {keluarga.jemaats?.length || 0} orang
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {keluarga.statusKeluarga?.status || "Aktif"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Belum ada keluarga terdaftar di rayon ini
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistik
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Home className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      Total Keluarga
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {rayonData._count?.keluargas || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Total Jemaat</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {rayonData.keluargas?.reduce(
                      (total, keluarga) =>
                        total + (keluarga.jemaats?.length || 0),
                      0
                    ) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      Rata-rata per Keluarga
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {rayonData._count?.keluargas > 0
                      ? Math.round(
                          (rayonData.keluargas?.reduce(
                            (total, keluarga) =>
                              total + (keluarga.jemaats?.length || 0),
                            0
                          ) || 0) / rayonData._count.keluargas
                        )
                      : 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tindakan
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => router.push(`/admin/rayon/${id}/edit`)}
                >
                  Edit Rayon
                </button>
                <button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={() => router.push("/admin/keluarga?rayon=" + id)}
                >
                  Lihat Keluarga
                </button>
                <button
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  onClick={() => router.push("/admin/jemaat?rayon=" + id)}
                >
                  Lihat Jemaat
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
