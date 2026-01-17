import { useQuery } from "@tanstack/react-query";
import { Baby, Building2, Eye, Heart, Pen, Trash, Users } from "lucide-react";
import { useState } from "react";

import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import useModalForm from "@/hooks/useModalForm";
import klasisService from "@/services/klasisService";
import { showToast } from "@/utils/showToast";
import { klasisSchema } from "@/validations/masterSchema";
import { useUser } from "@/hooks/useUser";

const klasisFields = [
  {
    type: "text",
    name: "nama",
    label: "Nama Klasis",
    placeholder: "Masukkan nama klasis",
    required: true,
  },
];

export default function KlasisPage() {
  const modal = useModalForm();
  const confirm = useConfirm();
  const [viewData, setViewData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { user: authData } = useUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["klasis"],
    queryFn: () => klasisService.getAll(),
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
      key: "nama",
      label: "Nama Klasis",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm font-medium">
          <Building2 className="w-4 h-4 mr-2 text-blue-500" />
          {value}
        </span>
      ),
    },
    {
      key: "_count",
      label: "Total Penggunaan",
      type: "text",
      render: (value) => {
        const total =
          (value?.pernikahans || 0) +
          (value?.baptiss || 0) +
          (value?.sidis || 0);

        return (
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-xs">
              <Heart className="w-3 h-3 mr-1 text-pink-500" />
              {value?.pernikahans || 0}
            </span>
            <span className="flex items-center text-xs">
              <Baby className="w-3 h-3 mr-1 text-blue-500" />
              {value?.baptiss || 0}
            </span>
            <span className="flex items-center text-xs">
              <Users className="w-3 h-3 mr-1 text-green-500" />
              {value?.sidis || 0}
            </span>
            <span className="font-semibold text-sm">= {total}</span>
          </div>
        );
      },
    },
  ];

  const handleKlasisSuccess = () => {
    refetch();
    modal.close();
  };

  const handleKlasisSubmit = async (formData, isEdit) => {
    if (isEdit) {
      return await klasisService.update(modal.editData.id, formData);
    }

    return await klasisService.create(formData);
  };

  const handleDelete = (item) => {
    const totalUsage =
      (item._count?.pernikahans || 0) +
      (item._count?.baptiss || 0) +
      (item._count?.sidis || 0);

    if (totalUsage > 0) {
      alert(
        "Tidak dapat menghapus klasis ini karena masih digunakan dalam data pernikahan, baptis, atau sidi"
      );

      return;
    }

    confirm.showConfirm({
      title: "Hapus Klasis",
      message: `Apakah Anda yakin ingin menghapus klasis "${item.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await klasisService.delete(item.id);
          refetch();
          showToast({
            title: "Hapus data klasis",
            description: "data Klasis berhasil dihapus",
            type: "success",
          });
        } catch (error) {
          console.error("Error deleting klasis:", error);
        }
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
          { label: "Klasis", href: "/admin/klasis" },
        ]}
        columns={columns}
        data={data?.data?.items || []}
        description="Kelola data klasis untuk pernikahan, baptis, dan sidi"
        exportFilename="klasis"
        exportable={true}
        isLoading={isLoading}
        rowActionType="horizontal"
        rowActions={[
          ...(authData?.isAdmin ? [
          {
            icon: Pen,
            onClick: (item) => modal.open(item),
            variant: "outline",
            tooltip: "Edit klasis",
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
            tooltip: "Hapus klasis",
          },
          ] : []),
        ]}
        searchPlaceholder="Cari nama klasis..."
        title="Manajemen Klasis"
        onAdd={
          authData?.isAdmin ? () => modal.open() : undefined  
        }
      />

      <CreateOrEditModal
        defaultValues={{
          nama: "",
        }}
        editData={modal.editData}
        fields={klasisFields}
        isOpen={modal.isOpen}
        schema={klasisSchema}
        title="Klasis"
        onClose={modal.close}
        onSubmit={handleKlasisSubmit}
        onSuccess={handleKlasisSuccess}
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
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity" />

          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                  Detail Klasis
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-100">
                      ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {viewData.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-100">
                      Nama Klasis
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {viewData.nama}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-100">
                      Total Penggunaan
                    </label>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-xs">
                        <Heart className="w-3 h-3 mr-1 text-pink-500" />
                        Pernikahan: {viewData._count?.pernikahans || 0}
                      </span>
                      <span className="flex items-center text-xs">
                        <Baby className="w-3 h-3 mr-1 text-blue-500" />
                        Baptis: {viewData._count?.baptiss || 0}
                      </span>
                      <span className="flex items-center text-xs">
                        <Users className="w-3 h-3 mr-1 text-green-500" />
                        Sidi: {viewData._count?.sidis || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
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
