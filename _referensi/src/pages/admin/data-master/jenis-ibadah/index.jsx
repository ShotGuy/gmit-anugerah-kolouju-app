import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Trash,
  Plus,
  Church,
  Calendar,
  Pen,
} from "lucide-react";

import jenisIbadahService from "@/services/jenisIbadahService";
import { jenisIbadahSchema } from "@/validations/masterSchema";
import useModalForm from "@/hooks/useModalForm";
import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import ListGrid from "@/components/ui/ListGrid";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import useConfirm from "@/hooks/useConfirm";
import { showToast } from "@/utils/showToast";
import { useUser } from "@/hooks/useUser";

const jenisIbadahFields = [
  {
    type: "text",
    name: "namaIbadah",
    label: "Nama Ibadah",
    placeholder: "Masukkan nama ibadah",
    required: true,
  },
];

export default function JenisIbadahPage() {
  const modal = useModalForm();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [viewData, setViewData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { user: authData } = useUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["jenis-ibadah"],
    queryFn: () => jenisIbadahService.getAll(),
  });

  // Jenis Ibadah mutations
  const jenisIbadahCreateMutation = useMutation({
    mutationFn: (data) => jenisIbadahService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jenis-ibadah"] });
      modal.close();
    },
  });

  const jenisIbadahUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => jenisIbadahService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jenis-ibadah"] });
      modal.close();
    },
  });

  const jenisIbadahDeleteMutation = useMutation({
    mutationFn: (id) => jenisIbadahService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jenis-ibadah"] });
      showToast({
        title: "Berhasil",
        description: "Jenis ibadah berhasil dihapus",
        color: "success",
      });
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: "Gagal menghapus jenis ibadah",
        color: "error",
      });
    },
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
      render: (value) => (
        <span className="font-mono text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: "namaIbadah",
      label: "Nama Ibadah",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm font-medium">
          <Church className="w-4 h-4 mr-2 text-blue-500" />
          {value}
        </span>
      ),
    },
    {
      key: "_count",
      label: "Jumlah Penggunaan",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm">
          <Calendar className="w-4 h-4 mr-2 text-green-500" />
          {value?.jadwalIbadahs || 0} kali
        </span>
      ),
    },
  ];

  const handleJenisIbadahSubmit = async (formData, isEdit) => {
    if (isEdit) {
      return jenisIbadahUpdateMutation.mutateAsync({ id: modal.editData.id, data: formData });
    }
    return jenisIbadahCreateMutation.mutateAsync(formData);
  };

  const handleDelete = (item) => {
    if (item._count?.jadwalIbadahs > 0) {
      showToast({
        title: "Tidak dapat menghapus",
        description: "Jenis ibadah ini masih digunakan dalam jadwal ibadah",
        color: "error",
      });
      return;
    }

    confirm.showConfirm({
      title: "Hapus Jenis Ibadah",
      message: `Apakah Anda yakin ingin menghapus jenis ibadah "${item.namaIbadah}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        jenisIbadahDeleteMutation.mutate(item.id);
      },
    });
  };

  const handleView = (item) => {
    setViewData(item);
    setIsViewModalOpen(true);
  };

  return (
    <>
      <ListGrid
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Data Master", href: "/admin/data-master" },
          { label: "Jenis Ibadah", href: "/admin/data-master/jenis-ibadah" },
        ]}
        columns={columns}
        data={data?.data?.items || []}
        description="Kelola data jenis-jenis ibadah di gereja"
        exportFilename="jenis-ibadah"
        exportable={true}
        isLoading={isLoading}
        rowActionType="horizontal"
        rowActions={[
          ...(authData?.isAdmin ? [
          {
            icon: Pen,
            onClick: (item) => modal.open(item),
            variant: "outline",
            tooltip: "Edit jenis ibadah",
          },
          ] : []),
          {
            icon: Eye,
            onClick: handleView,
            variant: "outline",
            tooltip: "Lihat detail lengkap",
          },
          ...(authData?.isAdmin ? [
          {
            icon: Trash,
            onClick: handleDelete,
            variant: "outline",
            tooltip: "Hapus jenis ibadah",
          },
          ] : []),
        ]}
        searchPlaceholder="Cari nama ibadah..."
        title="Manajemen Jenis Ibadah"
        onAdd={
          authData?.isAdmin ? () => modal.open() : undefined  
        }
      />

      <CreateOrEditModal
        defaultValues={{
          namaIbadah: "",
        }}
        editData={modal.editData}
        fields={jenisIbadahFields}
        isLoading={jenisIbadahCreateMutation.isPending || jenisIbadahUpdateMutation.isPending}
        isOpen={modal.isOpen}
        schema={jenisIbadahSchema}
        title="Jenis Ibadah"
        onClose={modal.close}
        onSubmit={handleJenisIbadahSubmit}
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

      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/10 dark:bg-black/50 backdrop-blur-sm transition-opacity" />

          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                  Detail Jenis Ibadah
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{viewData.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Nama Ibadah
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{viewData.namaIbadah}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Jumlah Penggunaan
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {viewData._count?.jadwalIbadahs || 0} kali
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  className="inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 sm:w-auto"
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
