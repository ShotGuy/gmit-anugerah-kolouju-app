import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Book,
  Calendar,
  Clock,
  ExternalLink,
  Home,
  MapPin,
  Navigation,
  Target,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PageTitle from "@/components/ui/PageTitle";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";


export default function JemaatJadwalIbadahPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: jadwalData, isLoading } = useQuery({
    queryKey: [
      "jadwal-ibadah",
      user?.jemaat?.keluarga?.rayon.id,
      selectedMonth,
      selectedYear,
    ],
    queryFn: async () => {
      if (!user?.jemaat?.keluarga?.rayon.id) return [];

      const params = new URLSearchParams({
        rayon: user.jemaat.keluarga.rayon.id,
        month: selectedMonth + 1,
        year: selectedYear,
      });

      const response = await api.get(`/jadwal-ibadah?${params}`);
      return response.data.data || [];
    },
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles="JEMAAT">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-600 mx-auto" />
            <p className="mt-4 text-slate-600 font-medium">
              Memuat jadwal ibadah...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIbadahIcon = (jenisIbadah) => {
    const nama = jenisIbadah?.toLowerCase() || "";
    if (nama.includes("keluarga")) return Home;
    if (nama.includes("minggu") || nama.includes("umum")) return Users;
    return Book;
  };

  const openGoogleMaps = (googleMapsLink, alamat) => {
    if (googleMapsLink) {
      window.open(googleMapsLink, "_blank");
    } else if (alamat) {
      const encodedAddress = encodeURIComponent(alamat);
      window.open(`https://www.google.com/maps?q=${encodedAddress}`, "_blank");
    }
  };

  return (
    <ProtectedRoute allowedRoles="JEMAAT">
      <PageTitle title="Jadwal Ibadah - GMIT Betlehem Oesapa Barat" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <button
                className="mr-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                onClick={() => router.push("/jemaat/dashboard")}
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>

              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-slate-100 mr-4">
                  <Calendar className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">
                    Jadwal Ibadah
                  </h1>
                  <p className="text-sm text-slate-500">
                    Rayon {user?.jemaat?.keluarga?.rayon?.namaRayon || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Filter Section */}
          <div className="bg-white shadow-sm rounded-lg mb-6 border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-slate-900">
                Filter Periode
              </h2>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pilih Bulan
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 py-2 px-3 text-sm transition-colors duration-200"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pilih Tahun
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 py-2 px-3 text-sm transition-colors duration-200"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule List */}
          {jadwalData && jadwalData.length > 0 ? (
            <div className="space-y-6">
              {jadwalData.map((jadwal) => {
                const IconComponent = getIbadahIcon(
                  jadwal.jenisIbadah?.namaIbadah
                );

                return (
                  <div
                    key={jadwal.id}
                    className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="p-2 rounded-lg bg-slate-100 mr-4">
                            <IconComponent className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                              {jadwal.judul}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                {jadwal.jenisIbadah?.namaIbadah || "Ibadah"}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {jadwal.kategori?.namaKategori || "Umum"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <Calendar className="h-4 w-4 text-slate-500 mr-3" />
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Tanggal
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {formatDate(jadwal.tanggal)}
                            </p>
                          </div>
                        </div>

                        {(jadwal.waktuMulai || jadwal.waktuSelesai) && (
                          <div className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <Clock className="h-4 w-4 text-slate-500 mr-3" />
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Waktu
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {formatTime(jadwal.waktuMulai)}
                                {jadwal.waktuSelesai &&
                                  ` - ${formatTime(jadwal.waktuSelesai)}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        {jadwal.pemimpin && (
                          <div className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <User className="h-4 w-4 text-slate-500 mr-3" />
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Pemimpin
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {jadwal.pemimpin.nama}
                              </p>
                            </div>
                          </div>
                        )}

                        {jadwal.targetPeserta && (
                          <div className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <Target className="h-4 w-4 text-slate-500 mr-3" />
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Target Peserta
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {jadwal.targetPeserta} orang
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location with Maps Button */}
                      {(jadwal.lokasi || jadwal.alamat) && (
                        <div className="mb-6">
                          <div className="flex items-start justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="flex items-start flex-1">
                              <MapPin className="h-4 w-4 text-slate-500 mr-3 mt-1" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                  Lokasi
                                </p>
                                {jadwal.lokasi && (
                                  <p className="text-sm font-medium text-slate-900 mb-1">
                                    {jadwal.lokasi}
                                  </p>
                                )}
                                {jadwal.alamat && (
                                  <p className="text-sm text-slate-600">
                                    {jadwal.alamat}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Google Maps Button */}
                            <button
                              className="ml-4 flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                              onClick={() =>
                                openGoogleMaps(
                                  jadwal.googleMapsLink,
                                  jadwal.alamat
                                )
                              }
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Buka Maps
                              <ExternalLink className="h-3 w-3 ml-2" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Theme and Scripture */}
                      {(jadwal.tema || jadwal.firman) && (
                        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className="flex items-start">
                            <Book className="h-4 w-4 text-slate-500 mr-3 mt-1" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Materi Ibadah
                              </p>
                              {jadwal.tema && (
                                <div className="mb-2">
                                  <span className="font-medium text-slate-700">
                                    Tema:{" "}
                                  </span>
                                  <span className="text-slate-900">
                                    {jadwal.tema}
                                  </span>
                                </div>
                              )}
                              {jadwal.firman && (
                                <div>
                                  <span className="font-medium text-slate-700">
                                    Firman:{" "}
                                  </span>
                                  <span className="text-slate-900">
                                    {jadwal.firman}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {jadwal.keterangan && (
                        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                          <p className="text-sm text-slate-700">
                            <span className="font-medium text-slate-800">
                              Keterangan:{" "}
                            </span>
                            {jadwal.keterangan}
                          </p>
                        </div>
                      )}

                      {/* Family-specific info */}
                      {jadwal.keluarga && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className="flex items-center">
                            <Home className="h-4 w-4 text-slate-500 mr-3" />
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Ibadah Keluarga
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                Bangunan {jadwal.keluarga.noBagungan}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-12 text-center">
                <div className="mb-6">
                  <div className="p-4 rounded-lg bg-slate-100 mx-auto w-16 h-16 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-slate-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Belum Ada Jadwal Ibadah
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Tidak ada jadwal ibadah untuk {monthNames[selectedMonth]}{" "}
                  {selectedYear} di Rayon{" "}
                  {user?.jemaat?.keluarga?.rayon?.namaRayon || "Anda"}.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
