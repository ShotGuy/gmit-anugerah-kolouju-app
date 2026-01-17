import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Calendar,
  Edit,
  Eye,
  Plus,
  Trash2,
  Search,
  MapPin,
  Image as ImageIcon,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { showToast } from "@/utils/showToast";
import galeriService from "@/services/galeriService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ButtonActions from "@/components/ui/ButtonActions";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import useConfirm from "@/hooks/useConfirm";
import { useUser } from "@/hooks/useUser";

// Page Header Component
function PageHeader({ title, description, breadcrumb, onAdd, showAddButton }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
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
                      className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 md:ml-2 transition-colors"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
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
            <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate transition-colors">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">{description}</p>
            )}
          </div>

          {/* Actions */}
          {showAddButton && (
            <div className="mt-4 flex space-x-3 lg:mt-0 lg:ml-4">
              <Button onClick={onAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Galeri
              </Button>
            </div>
          )}
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
        <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20" />
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="aspect-square bg-gray-200 dark:bg-gray-600 rounded" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
          </div>
        </div>
      ))}
    </>
  );
}

// Status Badge Component
function StatusBadge({ isPublished }) {
  if (isPublished) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <XCircle className="w-3 h-3 mr-1" />
      Draft
    </span>
  );
}

// Galeri Card Component
function GaleriCard({ item, onView, onEdit, onDelete, showEditDelete }) {
  const fotos = item.fotos ? JSON.parse(item.fotos) : [];
  const displayPhotos = fotos.slice(0, 4);
  const remainingCount = fotos.length - 4;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 transition-colors">
            {item.namaKegiatan}
          </h3>
          <StatusBadge isPublished={item.isPublished} />
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {displayPhotos.map((foto, index) => (
            <div key={index} className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              <img
                alt={foto.originalName || `Foto ${index + 1}`}
                className="w-full h-full object-cover"
                src={foto.url}
              />
              {index === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-medium">+{remainingCount}</span>
                </div>
              )}
            </div>
          ))}
          {fotos.length === 0 && (
            <div className="col-span-2 aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Belum ada foto</span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            {galeriService.formatDate(item.tanggalKegiatan)}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
            <MapPin className="h-4 w-4 mr-2" />
            {item.tempat}
          </div>
          {fotos.length > 0 && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
              <Camera className="h-4 w-4 mr-2" />
              {fotos.length} foto
            </div>
          )}
        </div>

        {/* Description */}
        {item.deskripsi && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2 transition-colors">
            {item.deskripsi}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(item)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Detail
          </Button>
          {showEditDelete && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(item)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                size="sm"
                variant="outline"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Hapus
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GaleriPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirmDialog = useConfirm();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    isPublished: "",
  });

  const { user: authData } = useUser();

  // Fetch galeri data
  const {
    data: galeriData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["galeri", pagination, searchTerm, filters],
    queryFn: () =>
      galeriService.getAll({
        ...pagination,
        search: searchTerm,
        ...filters
      }),
    keepPreviousData: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: galeriService.delete,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Galeri berhasil dihapus",
        color: "success",
      });
      queryClient.invalidateQueries(["galeri"]);
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menghapus galeri",
        color: "danger",
      });
    },
  });

  const handleDelete = (id) => {
    confirmDialog.showConfirm({
      title: "Hapus Galeri",
      message: "Apakah Anda yakin ingin menghapus galeri ini? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: () => {
        deleteMutation.mutate(id);
      },
    });
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

  const items = galeriData?.data?.items || [];
  const paginationInfo = galeriData?.data?.pagination || {};

  return (
    <>
    <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Page Header */}
      <PageHeader
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Galeri" },
        ]}
        description="Kelola dokumentasi foto kegiatan gereja"
        showAddButton={authData?.isAdmin}
        title="Galeri Kegiatan"
        onAdd={() => router.push("/admin/galeri/create")}
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Cari nama kegiatan, tempat..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={filters.isPublished}
                  onChange={(e) => handleFilterChange("isPublished", e.target.value)}
                >
                  <option value="">Semua Status</option>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Galeri Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Galeri Kegiatan {!isLoading && `(${paginationInfo.total || 0})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TableSkeleton />
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <GaleriCard
                  key={item.id}
                  item={item}
                  showEditDelete={authData?.isAdmin}
                  onDelete={handleDelete}
                  onEdit={(item) => router.push(`/admin/galeri/${item.id}/edit`)}
                  onView={(item) => router.push(`/admin/galeri/${item.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Camera className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">
                    Belum Ada Galeri
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors">
                    Mulai dokumentasikan kegiatan gereja dengan membuat galeri pertama
                  </p>
                  {authData?.isAdmin && (
                    <Button onClick={() => router.push("/admin/galeri/create")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Galeri
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-700 dark:text-gray-300 transition-colors">
                Menampilkan{" "}
                {(paginationInfo.page - 1) * paginationInfo.limit + 1} hingga{" "}
                {Math.min(
                  paginationInfo.page * paginationInfo.limit,
                  paginationInfo.total
                )}{" "}
                dari {paginationInfo.total} galeri
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
    </div>

    {/* Confirm Dialog */}
    <ConfirmDialog
      cancelText={confirmDialog.config.cancelText}
      confirmText={confirmDialog.config.confirmText}
      isOpen={confirmDialog.isOpen}
      message={confirmDialog.config.message}
      title={confirmDialog.config.title}
      variant={confirmDialog.config.variant}
      onClose={confirmDialog.hideConfirm}
      onConfirm={confirmDialog.handleConfirm}
    />
    </>
  );
}
