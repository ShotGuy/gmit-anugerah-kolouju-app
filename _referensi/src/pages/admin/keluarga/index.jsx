import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Eye, Plus, Trash2, Users } from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import { useUser } from "@/hooks/useUser";
import keluargaService from "@/services/keluargaService";
import { showToast } from "@/utils/showToast";

export default function KeluargaPage() {
  const confirm = useConfirm();

  const { user: authData } = useUser();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["keluarga"],
    queryFn: () => keluargaService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => keluargaService.delete(id),
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Data keluarga berhasil dihapus",
        color: "success",
      });
      refetch();
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: "Gagal menghapus data keluarga",
        color: "error",
      });
    },
  });

  const handleDelete = (row) => {
    confirm.showConfirm({
      title: "Hapus Keluarga",
      message: `Apakah Anda yakin ingin menghapus keluarga dengan No. Bangunan ${row.noBagungan}? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: () => {
        deleteMutation.mutate(row.id);
      },
    });
  };

  const columns = [
    {
      key: "noKK",
      label: "No. KK",
      type: "text",
      render: (value) => value || "-",
    },
    {
      key: "noBagungan",
      label: "No. Bangunan",
      type: "text",
      render: (value) => value || "-",
    },
    {
      key: "kepalaKeluarga",
      label: "Kepala Keluarga",
      type: "text",
      render: (value, row) => {
        const kepalaKeluarga = row.jemaats?.find(
          (jemaat) => jemaat.statusDalamKeluarga?.status === "Kepala Keluarga"
        );

        return kepalaKeluarga?.nama || "-";
      },
    },
    {
      key: "rayon",
      label: "Rayon",
      type: "text",
      render: (value) => value?.namaRayon || "-",
    },
    {
      key: "jemaats",
      label: "Jumlah Anggota",
      type: "text",
      render: (value) => {
        const count = value?.length || 0;

        return (
          <span className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-1 text-blue-500" />
            {count} orang
          </span>
        );
      },
    },
  ];

  return (
    <>
      <ListGrid
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Keluarga", href: "/admin/keluarga" },
        ]}
        columns={columns}
        data={data?.data?.items || []}
        description="Kelola data keluarga jemaat gereja"
        error={error}
        exportFilename="keluarga"
        exportable={true}
        headerActions={[
          ...(authData?.isAdmin
            ? [
                {
                  label: "Tambah Keluarga",
                  icon: Plus,
                  href: "/admin/keluarga/create",
                  variant: "primary",
                },
              ]
            : []),
        ]}
        isLoading={isLoading}
        rowActionType="vertical"
        rowActions={[
          {
            label: "Detail",
            icon: Eye,
            href: (row) => `/admin/keluarga/${row.id}`,
            variant: "info",
          },
          ...(authData?.isAdmin
            ? [
                {
                  label: "Edit",
                  icon: Edit,
                  href: (row) => `/admin/keluarga/${row.id}/edit`,
                  variant: "warning",
                },
              ]
            : []),

          ...(authData?.isAdmin
            ? [
                {
                  label: "Hapus",
                  icon: Trash2,
                  onClick: handleDelete,
                  variant: "danger",
                },
              ]
            : []),
        ]}
        searchPlaceholder="Cari berdasarkan alamat, kepala keluarga..."
        searchable={true}
        title="Manajemen Keluarga"
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
