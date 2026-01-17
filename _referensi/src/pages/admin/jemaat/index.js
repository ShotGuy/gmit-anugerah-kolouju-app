import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Edit,
  Eye,
  Plus,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import JemaatFilters from "@/components/ui/JemaatFilters";
import JemaatSuperExportModal from "@/components/ui/JemaatSuperExportModal";
import ListGrid from "@/components/ui/ListGrid";
import PageTitle from "@/components/ui/PageTitle";
import useConfirm from "@/hooks/useConfirm";
import useDebounce from "@/hooks/useDebounce";
import { useUser } from "@/hooks/useUser";
import exportService from "@/services/exportService";
import jemaatService from "@/services/jemaatService";
import { showToast } from "@/utils/showToast";

export default function MembersManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { user: authData } = useUser();

  // State for filters and pagination
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for export modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Debounce search term to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Build query parameters
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    ...filters,
  };

  // Fetch jemaat data with server-side filtering
  const {
    data: jemaatData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jemaat", queryParams],
    queryFn: () => jemaatService.getAll(queryParams),
    keepPreviousData: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: jemaatService.delete,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Data jemaat berhasil dihapus",
        color: "success",
      });
      queryClient.invalidateQueries(["jemaat"]);
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
        ...exportConfig.filters, // Additional filters from selected values in export modal
      };

      const exportData = await jemaatService.exportData(
        mergedFilters, // Use merged filters
        exportConfig
      );

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

  // Extract members from API response
  const members = jemaatData?.data?.items || [];
  const pagination = jemaatData?.data?.pagination || {};

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

  const columns = [
    {
      key: "id",
      label: "ID Jemaat",
      type: "text",
    },
    {
      key: "nama",
      label: "Nama",
      type: "text",
    },
    {
      key: "jenisKelamin",
      label: "Gender",
      render: (value) => (value ? "Laki-laki" : "Perempuan"),
    },
    {
      key: "tanggalLahir",
      label: "Tanggal Lahir",
      type: "date",
    },
    {
      key: "keluarga",
      label: "No. Bagungan",
      render: (value) => value?.noBagungan || "-",
    },
    {
      key: "statusDalamKeluarga",
      label: "Status Keluarga",
      render: (value) => value?.status || "-",
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeVariant: (value) => {
        switch (value) {
          case "active":
            return "success";
          case "inactive":
            return "secondary";
          case "pending":
            return "warning";
          default:
            return "outline";
        }
      },
      render: (value) => {
        const labels = {
          active: "Aktif",
          inactive: "Tidak Aktif",
          pending: "Menunggu",
        };

        return labels[value] || value;
      },
    },
  ];

  // Reusable row actions using ButtonActions
  const rowActions = [
    {
      label: "Detail",
      icon: Eye,
      onClick: (item) => router.push(`/admin/jemaat/${item.id}`),
      variant: "outline",
      tooltip: "Lihat detail lengkap jemaat",
    },

    ...(authData?.isAdmin
      ? [
          {
            label: "Edit",
            icon: Edit,
            onClick: (item) => router.push(`/admin/jemaat/edit/${item.id}`),
            variant: "outline",
            tooltip: "Edit informasi jemaat",
          },
        ]
      : []),

    ...(authData?.isAdmin
      ? [
          {
            label: "Hapus",
            icon: Trash2,
            onClick: handleDelete,
            variant: "destructive",
            tooltip: "Hapus data jemaat",
          },
        ]
      : []),
  ];

  // Stats configuration - dynamic from API data
  const stats = [
    {
      label: "Total Jemaat",
      value: pagination?.total?.toString() || "0",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Halaman",
      value: `${pagination?.page || 1} / ${pagination?.totalPages || 1}`,
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Ditampilkan",
      value: `${members.length} dari ${pagination?.total || 0}`,
      icon: UserPlus,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Filter Aktif",
      value: Object.keys(filters).length.toString(),
      icon: UserPlus,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    },
  ];

  /*
    The spread syntax ...() allows conditional inclusion.
    If authData?.isAdmin is false, the “Tambah Jemaat” button is added.
    If the user is an admin, the array spreads an empty array ([]), so nothing is added.
  */
  //Header actions
  const headerActions = [
    {
      label: "Super Export",
      icon: Download,
      onClick: () => setShowExportModal(true),
      variant: "outline",
    },
    // Only add this item if the user is NOT admin
    ...(authData?.isAdmin
      ? [
          {
            label: "Tambah Jemaat",
            icon: Plus,
            onClick: () => router.push("/admin/jemaat/create"),
            variant: "default",
          },
        ]
      : []),
  ];

  // Breadcrumb

  // Handle loading and error states

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Terjadi kesalahan saat memuat data jemaat
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => queryClient.invalidateQueries(["jemaat-all"])}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Daftar Jemaat" />
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex mb-4">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a
                  className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 md:ml-2"
                  href="/admin/dashboard"
                >
                  Dashboard
                </a>
              </li>
              <li className="inline-flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400 dark:text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    fillRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                  Manajemen Jemaat
                </span>
              </li>
            </ol>
          </nav>

          {/* Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 transition-colors duration-200 sm:text-3xl sm:truncate">
                Manajemen Jemaat
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                Kelola data anggota jemaat GMIT Imanuel Oepura dengan mudah dan
                efisien
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex space-x-3 lg:mt-0 lg:ml-4">
              {headerActions.map((action, index) => (
                <button
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                  onClick={action.onClick}
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg transition-colors duration-200"
                  >
                    <div className="p-5 animate-pulse">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-6 w-6 rounded-md bg-gray-200 dark:bg-gray-700" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                            </dt>
                            <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg transition-colors duration-200"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <stat.icon
                            aria-hidden="true"
                            className={`h-6 w-6 ${stat.iconColor}`}
                          />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              {stat.label}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {stat.value}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Search and Comprehensive Filters - Full Width */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-full mt-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
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

        <JemaatFilters
          initialFilters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Jemaat List - Full Width */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-full">
        <ListGrid
          // Basic props that ListGrid supports
          columns={columns}
          pageSizeOptions={[]}
          showPageSizeSelector={false}
          exportFilename="jemaat"
          // Pagination Props
          itemsPerPage={itemsPerPage}
          isLoading={isLoading}
          // Data Props
          data={members}
          maxVisibleActions={2}
          // Remove filters since we use comprehensive filters above
          filters={[]}
          searchable={false} // Disable since we have custom search above
          // Row Actions Props
          rowActions={rowActions}
          searchPlaceholder="Cari nama, email, atau ID jemaat..."
          // Export Props
          // exportable={true}
        />

        {/* Custom Pagination */}
        {pagination && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-4 shadow-sm">
            {/* Mobile Layout */}
            <div className="block md:hidden px-3 py-3 space-y-3">
              {/* Compact Info Row */}
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>
                  {members.length}/{pagination.total} jemaat
                </span>
                {Object.keys(filters).length > 0 && (
                  <span className="text-blue-600 dark:text-blue-400">
                    {Object.keys(filters).length} filter
                  </span>
                )}
              </div>

              {/* Compact Pagination Controls */}
              <div className="flex items-center justify-between">
                {/* Page Size - Compact */}
                <select
                  className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-0 w-16"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>

                {/* Page Info */}
                <span className="text-xs text-gray-700 dark:text-gray-300 flex-shrink-0">
                  {pagination.page}/{pagination.totalPages}
                </span>

                {/* Navigation Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-w-0"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  >
                    ←
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-w-0"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() =>
                      setCurrentPage(
                        Math.min(pagination.totalPages, currentPage + 1)
                      )
                    }
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between px-6 py-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Menampilkan{" "}
                  <span className="font-medium">{members.length}</span> dari{" "}
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
                <button
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  ← Sebelumnya
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300 px-2">
                  Halaman <span className="font-medium">{pagination.page}</span>{" "}
                  dari{" "}
                  <span className="font-medium">{pagination.totalPages}</span>
                </span>
                <button
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.totalPages, currentPage + 1)
                    )
                  }
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          </div>
        )}
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
    </>
  );
}
