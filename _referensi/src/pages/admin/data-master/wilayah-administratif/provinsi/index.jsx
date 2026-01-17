import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, PlusIcon, Trash } from "lucide-react";
import { useState } from "react";

import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import KotaKabupatenDrawerContent from "@/components/geografis/KotaKabupatenDrawerContent";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Drawer from "@/components/ui/Drawer";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import useDrawer from "@/hooks/useDrawer";
import useModalForm from "@/hooks/useModalForm";
import masterService from "@/services/masterService";
import {
  kotaKabupatenSchema,
  provinsiSchema,
} from "@/validations/masterSchema";
import { useUser } from "@/hooks/useUser";

// Konfigurasi field input di modal provinsi
const provinsiFields = [
  {
    type: "text",
    name: "nama",
    label: "Nama Provinsi",
    required: true,
    placeholder: "Masukkan nama provinsi",
  },
];

// Konfigurasi field input di modal kota/kabupaten
const kotaKabupatenFields = [
  {
    type: "text",
    name: "nama",
    required: true,
    label: "Nama Kota / Kabupaten",
    placeholder: "Masukkan nama kota / kabupaten",
  },
];

export default function ProvinsiPage() {
  const kotaKabupatenModal = useModalForm(); // untuk Kota/Kabupaten
  const modal = useModalForm(); // For provinsi modal
  const drawer = useDrawer(); // Untuk drawer kota/kab
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [viewData, setViewData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { user : authData } = useUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["provinsi"],
    queryFn: () => masterService.getProvinsi(),
  });

  const { data: kotaKabupatenData, isLoading: isLoadingKotaKabupaten } =
    useQuery({
      enabled: !!drawer.data?.id && drawer.isOpen,
      queryKey: ["kota-kabupaten", drawer.data?.id],
      queryFn: () => masterService.getKotaKabupatenByProvinsi(drawer.data.id),
    });

  // Provinsi mutations
  const provinsiCreateMutation = useMutation({
    mutationFn: (data) => masterService.createProvinsi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provinsi"] });
      modal.close();
    },
  });

  const provinsiUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => masterService.updateProvinsi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provinsi"] });
      modal.close();
    },
  });

  // Kota/Kabupaten mutations
  const kotaKabupatenCreateMutation = useMutation({
    mutationFn: (data) => masterService.createKotaKabupaten(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kota-kabupaten", kotaKabupatenModal.editData?.id],
      });
      kotaKabupatenModal.close();
    },
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
    },
    {
      key: "nama",
      label: "Nama Provinsi",
      type: "text",
    },
    {
      key: "isActive",
      label: "Status",
      type: "boolean",
      badgeVariant: (value) => (value === true ? "success" : "danger"),
    },
  ];

  const handleProvinsiSubmit = async (formData, isEdit) => {
    if (isEdit) {
      return provinsiUpdateMutation.mutateAsync({
        id: modal.editData.id,
        data: formData,
      });
    }

    return provinsiCreateMutation.mutateAsync(formData);
  };

  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Provinsi",
      message: `Apakah Anda yakin ingin menghapus "${item.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await masterService.deleteProvinsi(item.id);
          refetch();
        } catch (error) {
          console.error("Error deleting provinsi:", error);
        }
      },
    });
  };

  const handleView = (item) => {
    setViewData(item);
    setIsViewModalOpen(true);
  };

  // Handle kota/kabupaten form submission
  const handleKotaKabupatenSubmit = async (formData, isEdit) => {
    return kotaKabupatenCreateMutation.mutateAsync(formData);
  };

  return (
    <>
      <ListGrid
        breadcrumb={[
          {
            label: "Wilayah Administratif",
            href: "/admin/data-master/wilayah-administratif",
          },
          {
            label: "Provinsi",
            href: "/admin/data-master/wilayah-administratif/provinsi",
          },
        ]}
        columns={columns}
        data={data?.data.items || []}
        description={"Kelola data provinsi"}
        exportFilename="provinsi"
        exportable={true}
        isLoading={isLoading}
        rowActionType="horizontal"
        rowActions={[

          ...(authData?.isAdmin ? [

            {
              label: "Edit",
              icon: Edit,
              onClick: (item) => modal.open(item),
              variant: "outline",
            },

          {
            label: "Delete",
            icon: Trash,
            onClick: handleDelete,
            variant: "outline",
            tooltip: "Hapus provinsi",
          },
          {
            label: "Tambah Kota / Kabupaten",
            icon: PlusIcon,
            onClick: (item) => kotaKabupatenModal.open(item),
            variant: "outline",
            tooltip: "Tambah kota / kabupaten baru",
          },

        ] : []),

          {
            label: "View",
            icon: Eye,
            onClick: handleView,
            variant: "outline",
            tooltip: "Lihat detail lengkap provinsi",
          },

          {
            label: "Lihat kota / Kabupaten",
            icon: Eye,
            onClick: (item) => drawer.open(item),
            variant: "outline",
            tooltip: "Lihat kota / kabupaten yang ada",
          },
        ]}
        searchPlaceholder="Cari provinsi..."
        title={"Daftar Provinsi"}
          // ...(authData?.isAdmin ? [] : [])
        onAdd={
           
            authData?.isAdmin
            ? () => {
              modal.open()
            }
            : undefined
        }
      />

      {/* Provinsi Modal */}
      <CreateOrEditModal
        defaultValues={{ nama: "" }}
        editData={modal.editData}
        fields={provinsiFields}
        isLoading={
          provinsiCreateMutation.isPending || provinsiUpdateMutation.isPending
        }
        isOpen={modal.isOpen}
        schema={provinsiSchema}
        title="Provinsi"
        onClose={modal.close}
        onSubmit={handleProvinsiSubmit}
      />

      {/* Kota/Kabupaten Modal */}
      <CreateOrEditModal
        defaultValues={{
          nama: "",
          idProvinsi: kotaKabupatenModal.editData?.id || "",
        }}
        editData={null}
        fields={kotaKabupatenFields}
        isLoading={kotaKabupatenCreateMutation.isPending}
        isOpen={kotaKabupatenModal.isOpen}
        schema={kotaKabupatenSchema}
        title={`Tambah Kota / Kabupaten untuk ${kotaKabupatenModal.editData?.nama || ""}`}
        onClose={kotaKabupatenModal.close}
        onSubmit={handleKotaKabupatenSubmit}
      />

      {/* Drawer untuk melihat kota/kabupaten - Sekarang menggunakan komponen reusable */}
      <Drawer
        isOpen={drawer.isOpen}
        position="right"
        title={`Kota / Kabupaten - ${drawer.data?.nama || ""}`}
        width="w-96"
        onClose={drawer.close}
      >
        <KotaKabupatenDrawerContent
          data={kotaKabupatenData?.data}
          isLoading={isLoadingKotaKabupaten}
          provinsiName={drawer.data?.nama}
        />
      </Drawer>

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

      {/* View Modal */}
      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/10 dark:bg-black/50 backdrop-blur-sm transition-opacity" />

          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                  Detail Provinsi
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
                      Nama
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{viewData.nama}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewData.isActive
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {viewData.isActive ? "Aktif" : "Tidak Aktif"}
                    </span>
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
