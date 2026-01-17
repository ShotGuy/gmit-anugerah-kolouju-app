import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  Eye,
  EyeOff,
  Globe,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import ButtonActions from "@/components/ui/ButtonActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import useConfirm from "@/hooks/useConfirm";
import { useUser } from "@/hooks/useUser";
import kontenLandingPageService from "@/services/kontenLandingPageService";
import { showToast } from "@/utils/showToast";

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
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {showAddButton && (
            <div className="mt-4 flex space-x-3 lg:mt-0 lg:ml-4">
              <Button onClick={onAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Konten
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
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
      ))}
    </div>
  );
}

// Badge Component untuk Section
function SectionBadge({ section }) {
  const colors = {
    VISI: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    MISI: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    SEJARAH: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    HERO: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    TEMAGMIT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    TENTANG: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[section] || "bg-gray-100 text-gray-800"
        }`}
    >
      {section}
    </span>
  );
}

export default function KontenLandingPagePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser({ requiredRole: "admin" });

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [isPublishedFilter, setIsPublishedFilter] = useState("");
  const [kontenToDelete, setKontenToDelete] = useState(null);

  // Confirm Dialog
  const {
    isOpen: isDeleteDialogOpen,
    config: deleteConfig,
    showConfirm: showDeleteConfirm,
    hideConfirm: hideDeleteConfirm,
    handleConfirm: handleDeleteConfirm,
  } = useConfirm();

  // Query: Fetch konten
  const {
    data: kontenData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "konten-landing-page",
      currentPage,
      searchTerm,
      selectedSection,
      isPublishedFilter,
    ],
    queryFn: () =>
      kontenLandingPageService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        section: selectedSection,
        isPublished: isPublishedFilter,
        sortBy: "section",
        sortOrder: "asc",
      }),
    keepPreviousData: true,
  });

  // Mutation: Delete konten
  const deleteMutation = useMutation({
    mutationFn: kontenLandingPageService.delete,
    onSuccess: (response) => {
      queryClient.invalidateQueries(["konten-landing-page"]);
      showToast.success(response.message || "Konten berhasil dihapus");
      hideDeleteConfirm();
      setKontenToDelete(null);
    },
    onError: (error) => {
      showToast.error(error.message || "Gagal menghapus konten");
    },
  });

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSectionFilter = (e) => {
    setSelectedSection(e.target.value);
    setCurrentPage(1);
  };

  const handlePublishedFilter = (e) => {
    setIsPublishedFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleAddNew = () => {
    router.push("/admin/konten-landing-page/create");
  };

  const handleEdit = (id) => {
    router.push(`/admin/konten-landing-page/${id}`);
  };

  const handleDelete = (konten) => {
    setKontenToDelete(konten);
    showDeleteConfirm({
      title: "Hapus Konten",
      message: `Apakah Anda yakin ingin menghapus konten "${konten.judul}"?`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        if (konten?.id) {
          await deleteMutation.mutateAsync(konten.id);
        }
      },
    });
  };

  // Breadcrumb
  const breadcrumb = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Konten Landing Page" },
  ];

  const konten = kontenData?.data?.items || [];
  const pagination = kontenData?.data?.pagination || {};

  return (
    <>
      <PageHeader
        breadcrumb={breadcrumb}
        description="Kelola konten landing page seperti visi, misi, dan sejarah gereja"
        onAdd={handleAddNew}
        showAddButton
        title="Konten Landing Page"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Daftar Konten Landing Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    onChange={handleSearch}
                    placeholder="Cari judul, konten..."
                    type="text"
                    value={searchTerm}
                  />
                </div>
              </div>

              {/* Section Filter */}
              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                onChange={handleSectionFilter}
                value={selectedSection}
              >
                <option value="">Semua Section</option>
                <option value="VISI">VISI</option>
                <option value="MISI">MISI</option>
                <option value="SEJARAH">SEJARAH</option>
                <option value="HERO">HERO</option>
                <option value="TEMAGMIT">TEMA GMIT</option>
                <option value="TENTANG">TENTANG</option>
              </select>

              {/* Published Filter */}
              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                onChange={handlePublishedFilter}
                value={isPublishedFilter}
              >
                <option value="">Semua Status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>

            {/* Table */}
            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error: {error.message}
              </div>
            ) : konten.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Tidak ada konten
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Mulai dengan menambahkan konten baru
                </p>
                <div className="mt-6">
                  <Button onClick={handleAddNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Konten
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Judul
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Konten
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Urutan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {konten.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <SectionBadge section={item.section} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.judul}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {item.konten}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {item.urutan}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.isPublished ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                <Eye className="w-3 h-3 mr-1" />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <ButtonActions
                              actions={[
                                {
                                  label: "Edit",
                                  icon: Edit,
                                  onClick: () => handleEdit(item.id),
                                  variant: "outline"
                                },
                                {
                                  label: "Hapus",
                                  icon: Trash2,
                                  onClick: () => handleDelete(item),
                                  variant: "destructive"
                                }
                              ]}
                              item={item}
                              type="horizontal"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Menampilkan {konten.length} dari {pagination.total} konten
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={!pagination.hasPrev}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        variant="outline"
                      >
                        Sebelumnya
                      </Button>
                      <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        Halaman {pagination.page} dari {pagination.totalPages}
                      </span>
                      <Button
                        disabled={!pagination.hasNext}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        variant="outline"
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        message={deleteConfig.message}
        onClose={hideDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title={deleteConfig.title}
      />
    </>
  );
}
