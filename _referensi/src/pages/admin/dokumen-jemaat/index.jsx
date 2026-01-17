import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import PageTitle from "@/components/ui/PageTitle";
import TextInput from "@/components/ui/inputs/TextInput";
import SkeletonDokumenJemaat from "@/components/ui/skeletons/SkeletonDokumenJemaat";
import useConfirm from "@/hooks/useConfirm";
import useDebounce from "@/hooks/useDebounce";
import dokumenJemaatService from "@/services/dokumenJemaatService";
import { showToast } from "@/utils/showToast";

export default function AdminDokumenJemaatPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  // State for filters and pagination
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search term to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Build query parameters
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    ...filters,
  };

  // Fetch dokumen data with server-side filtering
  const {
    data: dokumenData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-dokumen-jemaat", queryParams],
    queryFn: () => dokumenJemaatService.getAll(queryParams),
    keepPreviousData: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: dokumenJemaatService.delete,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Dokumen berhasil dihapus",
        color: "success",
      });
      queryClient.invalidateQueries(["admin-dokumen-jemaat"]);
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

  // Extract documents from API response
  const documents = dokumenData?.data?.items || [];
  const pagination = dokumenData?.data?.pagination || {};

  // Handle delete with confirmation dialog
  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Dokumen",
      message: `Apakah Anda yakin ingin menghapus dokumen "${item.namaFile}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: () => {
        deleteMutation.mutate(item.id);
      },
    });
  };

  const documentTypeLabels = {
    BAPTIS: "Surat Baptis",
    SIDI: "Surat Sidi",
    NIKAH: "Surat Nikah",
  };

  const statusConfig = {
    PENDING: {
      label: "Menunggu Verifikasi",
      color: "warning",
      icon: Clock,
    },
    APPROVED: {
      label: "Disetujui",
      color: "success",
      icon: CheckCircle2,
    },
    REJECTED: {
      label: "Ditolak",
      color: "destructive",
      icon: XCircle,
    },
  };

  const columns = [
    {
      key: "namaFile",
      label: "Nama File",
      type: "text",
    },
    {
      key: "tipeDokumen",
      label: "Jenis Dokumen",
      render: (value) => documentTypeLabels[value] || value,
    },
    {
      key: "jemaat",
      label: "Nama Jemaat",
      render: (value) => value?.nama || "-",
    },
    {
      key: "jemaat",
      label: "Rayon",
      render: (value) => value?.keluarga?.rayon?.namaRayon || "-",
    },
    {
      key: "statusDokumen",
      label: "Status",
      type: "badge",
      badgeVariant: (value) => statusConfig[value]?.color || "outline",
      render: (value) => statusConfig[value]?.label || value,
    },
    {
      key: "createdAt",
      label: "Tanggal Upload",
      type: "date",
    },
    {
      key: "verifiedAt",
      label: "Tanggal Verifikasi",
      type: "date",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("id-ID") : "-",
    },
  ];

  // Row actions using ButtonActions
  const rowActions = [
    {
      label: "Lihat File",
      icon: Eye,
      onClick: (item) => window.open(item.urlFile, "_blank"),
      variant: "outline",
      tooltip: "Lihat dokumen",
    },
    {
      label: "Download",
      icon: Download,
      onClick: (item) => {
        const link = document.createElement("a");

        link.href = item.urlFile;
        link.download = item.namaFile;
        link.click();
      },
      variant: "outline",
      tooltip: "Download dokumen",
    },
    // {
    //   label: "Edit",
    //   icon: Edit,
    //   onClick: (item) => router.push(`/admin/dokumen-jemaat/edit/${item.id}`),
    //   variant: "outline",
    //   tooltip: "Edit dokumen",
    // },
    // {
    //   label: "Hapus",
    //   icon: Trash2,
    //   onClick: handleDelete,
    //   variant: "destructive",
    //   tooltip: "Hapus dokumen",
    // },
  ];

  // Stats configuration - dynamic from API data
  const stats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter(
      (doc) => doc.statusDokumen === "PENDING"
    ).length;
    const approved = documents.filter(
      (doc) => doc.statusDokumen === "APPROVED"
    ).length;
    const rejected = documents.filter(
      (doc) => doc.statusDokumen === "REJECTED"
    ).length;

    return [
      {
        label: "Total Dokumen",
        value: pagination?.total?.toString() || "0",
        icon: FileText,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "Menunggu Verifikasi",
        value: pending.toString(),
        icon: Clock,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
      },
      {
        label: "Disetujui",
        value: approved.toString(),
        icon: CheckCircle2,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        label: "Ditolak",
        value: rejected.toString(),
        icon: XCircle,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
      },
    ];
  }, [documents, pagination?.total]);

  // Header actions
  const headerActions = [
    {
      label: "Tambah Dokumen",
      icon: Plus,
      onClick: () => router.push("/admin/dokumen-jemaat/create"),
      variant: "default",
    },
  ];

  // Filter options for the documents
  const filterOptions = [
    {
      key: "statusDokumen",
      label: "Status",
      type: "select",
      options: [
        { value: "", label: "Semua Status" },
        { value: "PENDING", label: "Menunggu" },
        { value: "APPROVED", label: "Disetujui" },
        { value: "REJECTED", label: "Ditolak" },
      ],
    },
    {
      key: "tipeDokumen",
      label: "Jenis Dokumen",
      type: "select",
      options: [
        { value: "", label: "Semua Jenis" },
        { value: "BAPTIS", label: "Surat Baptis" },
        { value: "SIDI", label: "Surat Sidi" },
        { value: "NIKAH", label: "Surat Nikah" },
      ],
    },
  ];

  // Handle loading and error states
  if (isLoading) {
    return <SkeletonDokumenJemaat />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Terjadi kesalahan saat memuat data dokumen
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() =>
              queryClient.invalidateQueries(["admin-dokumen-jemaat"])
            }
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Manajemen Dokumen Jemaat" />

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
                  Dokumen Jemaat
                </span>
              </li>
            </ol>
          </nav>

          {/* Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 transition-colors duration-200 sm:text-3xl sm:truncate">
                Manajemen Dokumen Jemaat
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                Kelola dokumen jemaat seperti surat baptis, sidi, dan nikah
              </p>
            </div>

            {/* Actions */}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-5">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-full mt-5">
        {/* Search Bar */}
        <div className="mb-6">
          <TextInput
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            placeholder="Cari nama file, jemaat, atau rayon..."
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-full">
        <ListGrid
          // Basic props that ListGrid supports
          searchPlaceholder="Cari nama file, jemaat, atau rayon..."
          searchable={false} // Disable since we have custom search above
          onFiltersChange={handleFiltersChange}
          columns={columns}
          // Row Actions Props
          rowActions={rowActions}
          exportFilename="dokumen-jemaat"
          // Pagination Props
          itemsPerPage={itemsPerPage}
          isLoading={isLoading}
          // Data Props
          data={documents}
          maxVisibleActions={3}
          // Filters
          filters={filterOptions}
        />

        {/* Custom Pagination */}
        {pagination && (
          <Card className="mt-4">
            <CardContent>
              {/* Mobile Layout */}
              <div className="block md:hidden px-3 py-3 space-y-3">
                {/* Compact Info Row */}
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>
                    {documents.length}/{pagination.total} dokumen
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
                    <Button
                      disabled={currentPage <= 1}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                    >
                      ←
                    </Button>
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
                      →
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between px-6 py-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Menampilkan{" "}
                    <span className="font-medium">{documents.length}</span> dari{" "}
                    <span className="font-medium">{pagination.total}</span>{" "}
                    dokumen
                    {Object.keys(filters).length > 0 && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {` (dengan ${
                          Object.keys(filters).length
                        } filter aktif)`}
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
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  >
                    ← Sebelumnya
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300 px-2">
                    Halaman{" "}
                    <span className="font-medium">{pagination.page}</span> dari{" "}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </span>
                  <Button
                    disabled={currentPage >= pagination.totalPages}
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
            </CardContent>
          </Card>
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
    </>
  );
}
