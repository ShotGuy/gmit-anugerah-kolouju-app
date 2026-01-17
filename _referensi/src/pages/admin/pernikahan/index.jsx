import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, Heart, Plus, Trash2, Users } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import ListGrid from "@/components/ui/ListGrid";
import pernikahanService from "@/services/pernikahanService";
import { showToast } from "@/utils/showToast";
import { useUser } from "@/hooks/useUser";

export default function PernikahanManagement() {
  const router = useRouter();
  const { user: authData } = useUser()
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  // Fetch pernikahan data from API
  const {
    data: pernikahanData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pernikahan", pagination],
    queryFn: () => pernikahanService.getAll(pagination),
    keepPreviousData: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: pernikahanService.delete,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Data pernikahan berhasil dihapus",
        color: "success",
      });
      queryClient.invalidateQueries(["pernikahan"]);
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menghapus data",
        color: "error",
      });
    },
  });

  // Handle delete with confirmation
  const handleDelete = (id, displayName) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus data pernikahan ${displayName}?`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  // Format data for ListGrid
  const formattedData =
    pernikahanData?.data?.items?.map((item) => ({
      id: item.id,
      tanggal: new Date(item.tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      klasis: item.klasis?.nama || "-",
      pasangan:
        item.jemaats?.map((j) => j.nama).join(" & ") || "Belum ada pasangan",
      jumlahJemaat: `${item.jemaats?.length || 0} orang`,
      displayName:
        item.jemaats?.map((j) => j.nama).join(" & ") ||
        `Pernikahan ${new Date(item.tanggal).getFullYear()}`,
    })) || [];

  // Define columns for the table
  const columns = [
    {
      key: "tanggal",
      label: "Tanggal Nikah",
      sortable: true,
      render: (value) => (
        <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
          {value}
        </div>
      ),
    },
    {
      key: "klasis",
      label: "Klasis",
      sortable: true,
      render: (value) => (
        <div className="text-gray-700 dark:text-gray-300 transition-colors duration-200">
          {value}
        </div>
      ),
    },
    {
      key: "pasangan",
      label: "Pasangan",
      sortable: false,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-red-500 dark:text-red-400" />
          <span className="text-gray-900 dark:text-gray-100 font-medium transition-colors duration-200">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "jumlahJemaat",
      label: "Jumlah Jemaat",
      sortable: false,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300 transition-colors duration-200">
            {value}
          </span>
        </div>
      ),
    },
  ];

  // Define actions
  const actions = [
        ...(authData?.isAdmin ? [
    {
      icon: Eye,
      label: "Lihat Detail",
      onClick: (item) => router.push(`/admin/pernikahan/${item.id}`),
      className:
        "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
    },
    {
      icon: Edit,
      label: "Edit",
      onClick: (item) => router.push(`/admin/pernikahan/edit/${item.id}`),
      className:
        "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300",
    },
    {
      icon: Trash2,
      label: "Hapus",
      onClick: (item) => handleDelete(item.id, item.displayName),
      className:
        "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300",
      loading: deleteMutation.isLoading,
    },
    ] : []),
  ];

  return (
    <ListGrid
      actions={actions}
      breadcrumb={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Data Pernikahan" },
      ]}
      columns={columns}
      data={formattedData}
      description="Kelola data pernikahan jemaat"
      emptyState={{
        title: "Belum ada data pernikahan",
        description: "Mulai tambahkan data pernikahan jemaat di sini.",
        action: {
          label: "Tambah Data Pernikahan",
          onClick: () => router.push("/admin/pernikahan/create"),
          icon: Plus,
        },
      }}
      error={error}
      exportFilename="pernikahan"
      exportable={true}
      headerActions={[
        ...(authData?.isAdmin ? [ 

          {
            label: "Tambah Pernikahan",
            onClick: () => router.push("/admin/pernikahan/create"),
            icon: Plus,
            primary: true,
          },
        ] : []),
      ]}
      icon={Heart}
      isLoading={isLoading}
      pagination={{
        ...pagination,
        total: pernikahanData?.data?.pagination?.total || 0,
        totalPages: pernikahanData?.data?.pagination?.totalPages || 0,
      }}
      searchPlaceholder="Cari berdasarkan klasis atau nama jemaat..."
      searchable={true}
      title="Data Pernikahan"
      onPaginationChange={setPagination}
    />
  );
}
