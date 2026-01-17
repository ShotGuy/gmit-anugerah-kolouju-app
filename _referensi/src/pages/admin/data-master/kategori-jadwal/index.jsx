import { useQuery } from "@tanstack/react-query";
import { Calendar, Eye, Pen, Trash } from "lucide-react";
import { useState } from "react";

import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import useModalForm from "@/hooks/useModalForm";
import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";
import { kategoriJadwalSchema } from "@/validations/masterSchema";
import { useUser } from "@/hooks/useUser";

const kategoriJadwalFields = [
  {
    type: "text",
    name: "namaKategori",
    label: "Nama Kategori Jadwal",
    placeholder: "Masukkan nama kategori jadwal",
    required: true,
  },
];

export default function KategoriJadwalPage() {
  const modal = useModalForm();
  const confirm = useConfirm();
  const [viewData, setViewData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { user: authData } = useUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["kategori-jadwal"],
    queryFn: () => masterService.getKategoriJadwal(),
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
      key: "namaKategori",
      label: "Nama Kategori",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm font-medium">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          {value}
        </span>
      ),
    },
  ];

  const handleKategoriJadwalSuccess = () => {
    refetch();
    modal.close();
  };

  const handleKategoriJadwalSubmit = async (formData, isEdit) => {
    if (isEdit) {
      return await masterService.updateKategoriJadwal(
        modal.editData.id,
        formData,
      );
    }

    return await masterService.createKategoriJadwal(formData);
  };

  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Kategori Jadwal",
      message: `Apakah Anda yakin ingin menghapus kategori jadwal "${item.namaKategori}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await masterService.deleteKategoriJadwal(item.id);
          refetch();
          showToast({
            title: "Hapus data kategori jadwal",
            description: "data Kategori Jadwal berhasil dihapus",
            type: "success",
          });
        } catch (error) {
          console.error("Error deleting kategori jadwal:", error);
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
          { label: "Data Master", href: "/admin/data-master" },
          {
            label: "Kategori Jadwal",
            href: "/admin/data-master/kategori-jadwal",
          },
        ]}
        columns={columns}
        data={data?.data?.items || []}
        description="Kelola data kategori jadwal kegiatan gereja"
        exportFilename="kategori-jadwal"
        exportable={true}
        isLoading={isLoading}
        rowActionType="horizontal"
        rowActions={[
          ...(authData?.isAdmin ? [
          {
            icon: Pen,
            onClick: (item) => modal.open(item),
            variant: "outline",
            tooltip: "Edit kategori jadwal",
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
            tooltip: "Hapus kategori jadwal",
          },
           ] : []),
        ]}
        searchPlaceholder="Cari nama kategori..."
        title="Manajemen Kategori Jadwal"
        onAdd={
          authData?.isAdmin ? () => modal.open() : undefined  
        }
      />

      <CreateOrEditModal
        defaultValues={{
          namaKategori: "",
        }}
        editData={modal.editData}
        fields={kategoriJadwalFields}
        isOpen={modal.isOpen}
        schema={kategoriJadwalSchema}
        title="Kategori Jadwal"
        onClose={modal.close}
        onSubmit={handleKategoriJadwalSubmit}
        onSuccess={handleKategoriJadwalSuccess}
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
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white dark:bg-gray-700 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                  Detail Kategori Jadwal
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
                      Nama Kategori
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {viewData.namaKategori}
                    </p>
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
