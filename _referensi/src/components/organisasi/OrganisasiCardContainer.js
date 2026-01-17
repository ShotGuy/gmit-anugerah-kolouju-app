import { FileText } from "lucide-react";
import { useRouter } from "next/router";


import usePengumuman from "@/hooks/usePengumuman";
import OrganisasiCard from "./OrganisasiCard";

export default function OrganisasiCardContainer({
  jenisId = null,
  kategoriId = null,
  limit = 6,
  emptyStateMessage = "Belum ada pengumuman yang tersedia.",
}) {
  const router = useRouter();
  // Fetch pengumuman data with filters
  const { pengumumanData, loading, error } = usePengumuman({
    jenisId,
    kategoriId,
    status: "PUBLISHED", // Only show published announcements
    limit,
    sortBy: "tanggalPengumuman",
    sortOrder: "desc",
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg" />
          <p className="text-gray-600">Memuat pengumuman...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Terjadi kesalahan saat memuat pengumuman</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!pengumumanData || pengumumanData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-gray-100 p-4">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-800">Belum Ada Pengumuman</h3>
          <p className="mt-2 text-gray-600">{emptyStateMessage}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-screen bg-gray-100 p-8">
      {pengumumanData.map((pengumuman) => (
        <OrganisasiCard
          key={pengumuman.id}
          pengumuman={pengumuman}
        />
      ))}
    </div>
  );
}
