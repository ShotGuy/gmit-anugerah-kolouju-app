import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import ViewModal from "@/components/ui/ViewModal";
import { useUser } from "@/hooks/useUser";
import masterService from "@/services/masterService";

export default function KategoriPengumumanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const { user: authData } = useUser();

  // Load all available data
  const { data, isLoading } = useQuery({
    queryKey: ["kategori-pengumuman", "all-data"],
    queryFn: () =>
      masterService.getKategoriPengumuman({
        includeCount: true,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const result = await masterService.deleteKategoriPengumuman(id);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["kategori-pengumuman", "all-data"] });
      toast.success(result.message || "Kategori pengumuman berhasil dihapus");
      setDeleteItem(null);
    },
    onError: (error) => {
      toast.error(error?.message || "Gagal menghapus data");
    },
  });

  const columns = [
    {
      key: "nama",
      label: "Nama Kategori",
      type: "text",
    },
    {
      key: "deskripsi",
      label: "Deskripsi",
      type: "text",
      truncate: true,
    },
    {
      key: "_count.jenisPengumuman",
      label: "Jumlah Jenis",
      type: "custom",
      render: (item) =>
        item && item._count && typeof item._count.jenisPengumuman === "number"
          ? `${item._count.jenisPengumuman} jenis`
          : "0 jenis",
    },
    {
      key: "_count.pengumuman",
      label: "Jumlah Pengumuman",
      type: "custom",
      render: (item) =>
        item && item._count && typeof item._count.pengumuman === "number"
          ? `${item._count.pengumuman} pengumuman`
          : "0 pengumuman",
    },
    {
      key: "isActive",
      label: "Status",
      type: "boolean",
      badgeVariant: (value) => (value === true ? "success" : "danger"),
    },
  ];

  const viewFields = [
    {
      key: "nama",
      label: "Nama Kategori",
      getValue: (item) => item.nama,
    },
    {
      key: "deskripsi",
      label: "Deskripsi",
      getValue: (item) => item.deskripsi || "-",
    },
    {
      key: "pasalDeskripsi",
      label: "Pasal & Deskripsi Lengkap",
      getValue: (item) => item.pasalDeskripsi ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: item.pasalDeskripsi }}
        />
      ) : (
        <span className="text-base-content/60">Tidak ada pasal deskripsi</span>
      ),
    },
    {
      key: "_count.jenisPengumuman",
      label: "Jumlah Jenis Pengumuman",
      getValue: (item) =>
        item && item._count && typeof item._count.jenisPengumuman === "number"
          ? `${item._count.jenisPengumuman} jenis`
          : "0 jenis",
    },
    {
      key: "_count.pengumuman",
      label: "Jumlah Pengumuman",
      getValue: (item) =>
        item && item._count && typeof item._count.pengumuman === "number"
          ? `${item._count.pengumuman} pengumuman`
          : "0 pengumuman",
    },
    {
      key: "isActive",
      label: "Status",
      getValue: (item) => (item.isActive ? "Aktif" : "Tidak Aktif"),
    },
    { key: "createdAt", label: "Dibuat Pada", type: "datetime" },
    { key: "updatedAt", label: "Diperbarui Pada", type: "datetime" },
  ];

  return (
    <>
      <ListGrid
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Kategori Pengumuman" },
        ]}
        columns={columns}
        data={Array.isArray(data?.data) ? data.data : data?.data?.items || []}
        description="Kelola data kategori pengumuman untuk pengelompokan jenis pengumuman"
        exportFilename="kategori-pengumuman"
        exportable={true}
        isLoading={isLoading}
        itemsPerPage={8}
        rowActionType="horizontal"
        rowActions={[
          {
            icon: Eye,
            onClick: (item) => setViewItem(item),
            variant: "outline",
            tooltip: "Lihat detail",
          },
          ...(authData?.isAdmin
            ? [
                {
                  icon: Edit,
                  onClick: (item) => router.push(`/admin/data-master/kategori-pengumuman/form?id=${item.id}`),
                  variant: "outline",
                  tooltip: "Edit detail",
                },
              ]
            : []),
          ...(authData?.isAdmin
            ? [
                {
                  icon: Trash2,
                  onClick: (item) => setDeleteItem(item),
                  variant: "outline",
                  tooltip: "Hapus data",
                },
              ]
            : []),
        ]}
        searchPlaceholder="Cari kategori pengumuman..."
        searchable={true}
        title="Kelola Kategori Pengumuman"
        onAdd={authData?.isAdmin ? () => router.push("/admin/data-master/kategori-pengumuman/form") : undefined}
      />

      <ConfirmDialog
        isLoading={deleteMutation.isPending}
        isOpen={!!deleteItem}
        message={`Apakah Anda yakin ingin menghapus "${deleteItem?.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        title="Hapus Kategori Pengumuman"
        variant="danger"
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
      />

      <ViewModal
        data={
          viewItem && Array.isArray(viewFields)
            ? viewFields.map((field) => ({
                label: field.label,
                value: field.getValue
                  ? field.getValue(viewItem)
                  : viewItem?.[field.key],
              }))
            : []
        }
        isOpen={!!viewItem}
        title="Detail Kategori Pengumuman"
        onClose={() => setViewItem(null)}
      />
    </>
  );
}
