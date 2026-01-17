import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Bell,
  Calendar,
  Download,
  Edit,
  Eye,
  Pin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { Button } from "@/components/ui/Button";
import ButtonActions from "@/components/ui/ButtonActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import pengumumanService from "@/services/pengumumanService";
import { showToast } from "@/utils/showToast";
import PageTitle from "@/components/ui/PageTitle";
import { useUser } from "@/hooks/useUser";

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

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    DRAFT: { color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200", label: "Draft" },
    PUBLISHED: { color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", label: "Published" },
    ARCHIVED: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300", label: "Archived" },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }) {
  const priorityConfig = {
    LOW: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", label: "Low" },
    MEDIUM: { color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200", label: "Medium" },
    HIGH: { color: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300", label: "High" },
    URGENT: { color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300", label: "Urgent" },
  };

  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

export default function PengumumanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    kategoriId: "",
    status: "",
    prioritas: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { user: authData } = useUser();

  // Fetch pengumuman data
  const {
    data: pengumumanData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pengumuman", pagination, searchTerm, filters],
    queryFn: () =>
      pengumumanService.getAll({
        ...pagination,
        search: searchTerm,
        includeRelations: true,
        ...filters,
      }),
    keepPreviousData: true,
  });

  // Fetch options for filters
  const { data: optionsData } = useQuery({
    queryKey: ["pengumuman-options"],
    queryFn: () => pengumumanService.getOptions(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: pengumumanService.delete,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Pengumuman berhasil dihapus",
        color: "success",
      });
      queryClient.invalidateQueries(["pengumuman"]);
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal menghapus pengumuman",
        color: "danger",
      });
    },
  });

  const handleDelete = (item) => {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: idLocale });
    } catch (_error) {
      return dateString;
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const actions = [
    {
      icon: Eye,
      label: "Detail",
      onClick: (item) => router.push(`/admin/pengumuman/${item.id}`),
      variant: "outline",
    },
    {
      icon: Download,
      label: "Lampiran",
      onClick: (item) =>
        router.push(`/admin/pengumuman/${item.id}/attachments`),
      variant: "outline",
      show: (item) => true, // Selalu tampilkan, nanti di halaman attachments baru cek ada atau tidak
    },
    ...(authData?.isAdmin
      ? [
          {
            icon: Edit,
            label: "Edit",
            onClick: (item) => router.push(`/admin/pengumuman/${item.id}/edit`),
            variant: "outline",
          },
        ]
      : []),
    ...(authData?.isAdmin
      ? [
          {
            icon: Trash2,
            label: "Hapus",
            onClick: (item) => handleDelete(item),
            variant: "outline",
          },
        ]
      : []),
  ];

  const items = pengumumanData?.data?.items || [];
  const paginationInfo = pengumumanData?.data?.pagination || {};
  const kategoriOptions = optionsData?.data?.kategori || [];
  const statusOptions = optionsData?.data?.enums?.status || [];
  const prioritasOptions = optionsData?.data?.enums?.prioritas || [];

  return (
    <div className="space-y-6 p-4">
      <PageTitle title="Daftar Pengumuman" />
      {/* Page Header */}
      <PageHeader
        actions={
          authData?.isAdmin
            ? [
                {
                  label: "Buat Pengumuman",
                  onClick: () => router.push("/admin/pengumuman/create"),
                  icon: Plus,
                },
              ]
            : []
        }
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Pengumuman" },
        ]}
        description="Kelola pengumuman untuk seluruh gereja dengan akses penuh"
        title="Daftar Pengumuman"
      />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Cari pengumuman..."
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori
                </label>
                <select
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filters.kategoriId}
                  onChange={(e) =>
                    handleFilterChange("kategoriId", e.target.value)
                  }
                >
                  <option value="">Semua Kategori</option>
                  {kategoriOptions.map((kategori) => (
                    <option key={kategori.id} value={kategori.id}>
                      {kategori.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">Semua Status</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioritas
                </label>
                <select
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filters.prioritas}
                  onChange={(e) =>
                    handleFilterChange("prioritas", e.target.value)
                  }
                >
                  <option value="">Semua Prioritas</option>
                  {prioritasOptions.map((prioritas) => (
                    <option key={prioritas.value} value={prioritas.value}>
                      {prioritas.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Indicator */}
            {(filters.kategoriId || filters.status || filters.prioritas) && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <span>Filter aktif:</span>
                {filters.kategoriId && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs">
                    Kategori
                  </span>
                )}
                {filters.status && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs">
                    Status
                  </span>
                )}
                {filters.prioritas && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs">
                    Prioritas
                  </span>
                )}
                <button
                  className="text-xs text-red-600 dark:text-red-400 hover:underline ml-2"
                  onClick={() => setFilters({ kategoriId: "", status: "", prioritas: "" })}
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Pengumuman {!isLoading && `(${paginationInfo.total || 0})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">
                    Judul & Kategori
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">
                    Tanggal
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">
                    Prioritas
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton />
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      {/* Judul & Kategori */}
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.judul}
                            </div>
                            {item.isPinned && (
                              <Pin className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.kategori?.nama}
                            {item.jenis?.nama && ` • ${item.jenis.nama}`}
                          </div>
                        </div>
                      </td>

                      {/* Tanggal */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {formatDate(item.tanggalPengumuman)}
                            </div>
                            {item.publishedAt && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Dipublikasi: {formatDate(item.publishedAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Prioritas */}
                      <td className="p-4">
                        <PriorityBadge priority={item.prioritas} />
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
                    <td className="text-center py-8 text-gray-500 dark:text-gray-400" colSpan="5">
                      <div className="flex flex-col items-center gap-2">
                        <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <span>Belum ada pengumuman</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Menampilkan{" "}
                {(paginationInfo.page - 1) * paginationInfo.limit + 1} hingga{" "}
                {Math.min(
                  paginationInfo.page * paginationInfo.limit,
                  paginationInfo.total,
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
                  (_, i) => i + 1,
                )
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === paginationInfo.totalPages ||
                      Math.abs(page - paginationInfo.page) <= 2,
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus Pengumuman"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${deleteTarget?.judul}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
