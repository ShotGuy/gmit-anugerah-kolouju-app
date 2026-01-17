import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  Download
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import JemaatFilters from "@/components/ui/JemaatFilters";
import JemaatSuperExportModal from "@/components/ui/JemaatSuperExportModal";
import PageTitle from "@/components/ui/PageTitle";
import useConfirm from "@/hooks/useConfirm";
import useDebounce from "@/hooks/useDebounce";
import exportService from "@/services/exportService";
import jemaatService from "@/services/jemaatService";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/utils/showToast";
import { formatDate, calculateAge } from "@/utils/dateUtils";

function MajelisJemaatPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  
  const { user } = useAuth();
  // Get majelis permissions
  const majelisPermissions = user?.majelis || {};
  const { canView = true, canEdit = false, canCreate = false, canDelete = false } = majelisPermissions;

  // State for filters and pagination
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for export modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Debounce search term to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Build query parameters including rayon filtering for majelis
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    idRayon: user?.majelis?.idRayon, // Always filter by majelis's rayon
    ...filters,
  };

  // Fetch jemaat data with rayon filtering
  const {
    data: jemaatData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['majelis-jemaat', queryParams],
    queryFn: () => jemaatService.getAll(queryParams),
    enabled: !!user?.majelis?.idRayon,
    keepPreviousData: true,
  });

  const jemaats = jemaatData?.data?.items || [];
  const pagination = jemaatData?.data?.pagination || {};

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search change
  const handleSearchChange = (searchTerm) => {
    setSearch(searchTerm);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle export
  const handleExport = async (exportConfig) => {
    try {
      showToast({
        title: "Export Started",
        description: "Mengambil data dan memproses export...",
        color: "info",
      });

      // Get data from API - merge current queryParams with export config filters
      const mergedFilters = {
        ...queryParams, // Base filters from current search and filters
        ...exportConfig.filters // Additional filters from selected values in export modal
      };

      delete mergedFilters.page;
      delete mergedFilters.limit;

      const exportData = await jemaatService.getAll(mergedFilters);

      // Use export service to generate file
      await exportService.exportJemaat(exportData.data.items, exportConfig);

      showToast({
        title: "Export Berhasil",
        description: `Data berhasil diekspor ke format ${exportConfig.format.toUpperCase()}`,
        color: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      showToast({
        title: "Export Gagal",
        description:
          error.response?.data?.message || "Terjadi kesalahan saat export data",
        color: "error",
      });
    }
  };

  // Handle back to dashboard
  const handleBack = () => {
    router.push('/majelis/dashboard');
  };

  // Handle navigation
  const handleCreate = () => {
    router.push('/majelis/jemaat/create');
  };

  const handleView = (id) => {
    router.push(`/majelis/jemaat/${id}`);
  };

  const handleEdit = (id) => {
    router.push(`/majelis/jemaat/edit/${id}`);
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: jemaatService.delete,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Data jemaat berhasil dihapus",
        color: "success",
      });
      queryClient.invalidateQueries(['majelis-jemaat']);
      queryClient.invalidateQueries(['majelis-dashboard']);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.errors ||
        error.response?.data?.message ||
        "Gagal menghapus data";

      showToast({
        title: "Gagal",
        description: errorMessage,
        color: "error",
      });
    },
  });

  // Handle delete with confirmation dialog
  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Jemaat",
      message: `Apakah Anda yakin ingin menghapus jemaat "${item.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: () => {
        deleteMutation.mutate(item.id);
      },
    });
  };


  // Check if user has permission to view
  if (!canView) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Akses Ditolak</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Anda tidak memiliki permission untuk melihat data jemaat. Hubungi admin untuk mengatur permission Anda.
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

  // Check if user has majelis data with rayon
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
                Anda belum memiliki rayon yang ditugaskan. Hubungi admin untuk mengatur rayon Anda.
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
        description={`Kelola data jemaat untuk ${user.majelis?.rayon?.namaRayon || 'rayon Anda'}`}
        title="Data Jemaat"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                className="flex items-center space-x-2"
                variant="outline"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Data Jemaat
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rayon: {user.majelis?.rayon?.namaRayon || 'Tidak diketahui'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                className="flex items-center space-x-2"
                variant="outline"
                onClick={() => setShowExportModal(true)}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              {canCreate && (
                <Button
                  className="flex items-center space-x-2"
                  onClick={handleCreate}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Tambah Jemaat</span>
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Cari nama jemaat..."
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Comprehensive Filters */}
          <JemaatFilters
            initialFilters={filters}
            onFiltersChange={handleFiltersChange}
          />


          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Data Jemaat</span>
                </div>
                <span className="text-sm font-normal text-gray-600">
                  Total: {pagination.total || 0} jemaat
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 dark:text-red-400">
                    Error: {error.message}
                  </p>
                </div>
              ) : jemaats.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {search
                      ? `Tidak ada jemaat ditemukan untuk "${search}"`
                      : "Belum ada data jemaat di rayon ini"
                    }
                  </p>
                  {canCreate && (
                    <Button
                      className="mt-4"
                      onClick={handleCreate}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Tambah Jemaat Pertama
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Nama
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Jenis Kelamin
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Umur
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Status Keluarga
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Keluarga
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {jemaats.map((jemaat) => (
                        <tr
                          key={jemaat.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {jemaat.nama}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Status: {jemaat.status}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                            {jemaat.jenisKelamin ? 'Laki-laki' : 'Perempuan'}
                          </td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                            {calculateAge(jemaat.tanggalLahir)} tahun
                          </td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                            {jemaat.statusDalamKeluarga?.status || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p className="text-gray-900 dark:text-gray-100">
                                Bangunan {jemaat.keluarga?.noBagungan || '-'}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {jemaat.keluarga?.rayon?.namaRayon || '-'}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(jemaat.id)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(jemaat.id)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(jemaat)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Custom Pagination */}
              {pagination && (
                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-4 shadow-sm">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Menampilkan{" "}
                      <span className="font-medium">{jemaats.length}</span> dari{" "}
                      <span className="font-medium">{pagination.total}</span> jemaat
                      {Object.keys(filters).length > 0 && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {` (dengan ${Object.keys(filters).length} filter aktif)`}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                    >
                      <option value={10}>10 per halaman</option>
                      <option value={25}>25 per halaman</option>
                      <option value={50}>50 per halaman</option>
                      <option value={100}>100 per halaman</option>
                    </select>
                    <Button
                      disabled={currentPage <= 1}
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    >
                      ← Sebelumnya
                    </Button>
                    <span className="text-sm text-gray-700 dark:text-gray-300 px-2">
                      Halaman <span className="font-medium">{pagination.page}</span>{" "}
                      dari{" "}
                      <span className="font-medium">{pagination.totalPages}</span>
                    </span>
                    <Button
                      disabled={currentPage >= pagination.totalPages}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(pagination.totalPages, currentPage + 1)
                        )
                      }
                    >
                      Selanjutnya →
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        cancelText={confirm.config.cancelText}
        confirmText={confirm.config.confirmText}
        isOpen={confirm.isOpen}
        message={confirm.config.message}
        title={confirm.config.title}
        variant={confirm.config.variant}
        onClose={confirm.hideConfirm}
        onConfirm={confirm.handleConfirm}
      />

      {/* Super Export Modal */}
      <JemaatSuperExportModal
        currentFilters={queryParams}
        isOpen={showExportModal}
        totalRecords={pagination?.total || 0}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </ProtectedRoute>
  );
}

export default MajelisJemaatPage;