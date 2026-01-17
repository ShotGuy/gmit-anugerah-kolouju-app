import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { Button } from "@/components/ui/Button";
import ButtonActions from "@/components/ui/ButtonActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import jadwalIbadahService from "@/services/jadwalIbadahService";
import { showToast } from "@/utils/showToast";

// Page Header Component
function PageHeader({ title, description, breadcrumb, onAdd }) {
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
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex space-x-3 lg:mt-0 lg:ml-4">
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Jadwal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b">
          <td className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </td>
          <td className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </td>
          <td className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </td>
          <td className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </td>
          <td className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </td>
          <td className="p-4">
            <div className="animate-pulse flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function JadwalIbadahPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch jadwal ibadah data from API
  const {
    data: jadwalData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jadwal-ibadah", pagination, searchTerm],
    queryFn: () =>
      jadwalIbadahService.getAll({ ...pagination, search: searchTerm }),
    keepPreviousData: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: jadwalIbadahService.delete,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Jadwal ibadah berhasil dihapus",
        color: "success",
      });
      queryClient.invalidateQueries(["jadwal-ibadah"]);
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menghapus jadwal",
        color: "danger",
      });
    },
  });

  const handleDelete = (id) => {
    if (
      window.confirm("Apakah Anda yakin ingin menghapus jadwal ibadah ini?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: idLocale });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      const date = new Date(timeString);
      return format(date, "HH:mm");
    } catch (error) {
      try {
        const fallbackDate = new Date(`1970-01-01T${timeString}`);
        return format(fallbackDate, "HH:mm");
      } catch (fallbackError) {
        return timeString;
      }
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when searching
  };

  const actions = [
    {
      icon: Eye,
      label: "Detail",
      onClick: (item) => router.push(`/majelis/jadwal-ibadah/${item.id}`),
      variant: "outline",
    },
    {
      icon: Edit,
      label: "Edit",
      onClick: (item) => router.push(`/majelis/jadwal-ibadah/${item.id}/edit`),
      variant: "outline",
    },
    {
      icon: Trash2,
      label: "Hapus",
      onClick: (item) => handleDelete(item.id),
      variant: "outline",
    },
  ];

  const items = jadwalData?.data?.items || [];
  const paginationInfo = jadwalData?.data?.pagination || {};

  return (
    <div className="space-y-6 p-4">
      {/* Page Header */}
      <PageHeader
        breadcrumb={[
          { label: "Majelis", href: "/majelis/dashboard" },
          { label: "Jadwal Ibadah" },
        ]}
        description="Kelola jadwal ibadah yang akan dilaksanakan di gereja atau secara online"
        title="Daftar Jadwal Ibadah"
        onAdd={() => router.push("/majelis/jadwal-ibadah/create")}
      />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col lg:flex-row gap-4 items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cari jadwal ibadah..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Jadwal Ibadah {!isLoading && `(${paginationInfo.total || 0})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-600">
                    Judul
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600">
                    Tanggal & Waktu
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600">
                    Pemimpin
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600">
                    Lokasi
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600">
                    Tema & Firman
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton />
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      {/* Judul */}
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.judul}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.jenisIbadah?.namaIbadah} •{" "}
                            {item.kategori?.namaKategori}
                          </div>
                        </div>
                      </td>

                      {/* Tanggal & Waktu */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {formatDate(item.tanggal)}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(item.waktuMulai)} -{" "}
                              {formatTime(item.waktuSelesai)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pemimpin */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{item.pemimpin?.nama || "-"}</span>
                        </div>
                      </td>

                      {/* Lokasi */}
                      <td className="p-4">
                        <div>
                          {item.lokasi && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{item.lokasi}</span>
                            </div>
                          )}
                          {item.keluarga && (
                            <div className="text-sm text-gray-500">
                              Keluarga: Bangunan {item.keluarga.noBagungan} (
                              {item.keluarga.rayon?.namaRayon})
                            </div>
                          )}
                          {item.rayon && (
                            <div className="text-sm text-gray-500">
                              Rayon: {item.rayon.namaRayon}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Tema & Firman */}
                      <td className="p-4">
                        <div>
                          {item.tema && (
                            <div className="font-medium">{item.tema}</div>
                          )}
                          {item.firman && (
                            <div className="text-sm text-gray-500">
                              {item.firman}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <ButtonActions
                          actions={actions}
                          item={item}
                          maxVisible={3}
                          type="horizontal"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center py-8 text-gray-500" colSpan="6">
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Menampilkan{" "}
                {(paginationInfo.page - 1) * paginationInfo.limit + 1} hingga{" "}
                {Math.min(
                  paginationInfo.page * paginationInfo.limit,
                  paginationInfo.total
                )}{" "}
                dari {paginationInfo.total} data
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={!paginationInfo.hasPrev}
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(paginationInfo.page - 1)}
                >
                  Sebelumnya
                </Button>

                {/* Page Numbers */}
                {Array.from(
                  { length: paginationInfo.totalPages },
                  (_, i) => i + 1
                )
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === paginationInfo.totalPages ||
                      Math.abs(page - paginationInfo.page) <= 2
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      )}
                      <Button
                        size="sm"
                        variant={
                          paginationInfo.page === page ? "default" : "outline"
                        }
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}

                <Button
                  disabled={!paginationInfo.hasNext}
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(paginationInfo.page + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        jadwal={selectedJadwal}
      />
    </div>
  );
}
