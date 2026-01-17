import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, Heart, Plus, Trash2, Users } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import pernikahanService from "@/services/pernikahanService";
import { showToast } from "@/utils/showToast";

export default function PernikahanManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
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
  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Data Pernikahan",
      message: `Apakah Anda yakin ingin menghapus data pernikahan "${item.displayName}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(item.id);
        } catch (error) {
          console.error("Error deleting pernikahan:", error);
        }
      },
    });
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
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm text-gray-900 dark:text-white">
          <Heart className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" />
          {value}
        </span>
      ),
    },
    {
      key: "klasis",
      label: "Klasis",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm text-gray-900 dark:text-white">
          <Users className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
          {value}
        </span>
      ),
    },
    {
      key: "pasangan",
      label: "Pasangan",
      type: "text",
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-pink-500 dark:text-pink-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "jumlahJemaat",
      label: "Jumlah Jemaat",
      type: "text",
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">{value}</span>
        </div>
      ),
    },
  ];

  // Define row actions
  const rowActions = [
    {
      icon: Eye,
      onClick: (item) => router.push(`/employee/lainnya/pernikahan/${item.id}`),
      variant: "outline",
      tooltip: "Lihat detail pernikahan",
    },
    {
      icon: Edit,
      onClick: (item) =>
        router.push(`/employee/lainnya/pernikahan/edit/${item.id}`),
      variant: "outline",
      tooltip: "Edit data pernikahan",
    },
    {
      icon: Trash2,
      onClick: handleDelete,
      variant: "outline",
      tooltip: "Hapus data pernikahan",
    },
  ];

  return (
    <>
      <ListGrid
        breadcrumb={[
          { label: "Dashboard", href: "/employee/dashboard" },
          { label: "Lainnya", href: "/employee/lainnya" },
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
            onClick: () => router.push("/employee/lainnya/pernikahan/create"),
            icon: Plus,
          },
        }}
        error={error}
        exportFilename="pernikahan"
        exportable={true}
        headerActions={[
          {
            label: "Tambah Pernikahan",
            onClick: () => router.push("/employee/lainnya/pernikahan/create"),
            icon: Plus,
            primary: true,
          },
        ]}
        icon={Heart}
        isLoading={isLoading}
        pagination={{
          ...pagination,
          total: pernikahanData?.data?.pagination?.total || 0,
          totalPages: pernikahanData?.data?.pagination?.totalPages || 0,
        }}
        rowActionType="horizontal"
        rowActions={rowActions}
        searchPlaceholder="Cari berdasarkan klasis atau nama jemaat..."
        searchable={true}
        title="Data Pernikahan"
        onPaginationChange={setPagination}
      />

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
