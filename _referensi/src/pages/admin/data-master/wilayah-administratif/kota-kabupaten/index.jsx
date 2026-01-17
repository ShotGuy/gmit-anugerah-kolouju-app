import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pen, PlusIcon, Trash } from "lucide-react";
import { useState } from "react";

import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Drawer from "@/components/ui/Drawer";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import useDrawer from "@/hooks/useDrawer";
import useModalForm from "@/hooks/useModalForm";
import masterService from "@/services/masterService";
import {
  kecamatanSchema,
  kotaKabupatenSchema,
} from "@/validations/masterSchema";
import { useUser } from "@/hooks/useUser";

const kotaKabupatenFields = [
  {
    type: "text",
    name: "nama",
    label: "Nama Kota / Kabupaten",
    placeholder: "Masukkan nama kota/kabupaten",
    required: true,
  },
  {
    type: "select",
    name: "idProvinsi",
    label: "Provinsi",
    placeholder: "Pilih provinsi",
    required: true,
    options: [],
  },
];

const kecamatanFields = [
  {
    type: "text",
    name: "nama",
    label: "Nama Kecamatan",
    placeholder: "Masukkan nama kecamatan",
    required: true,
  },
];

export default function KotaKabupatenPage() {
  const modal = useModalForm();
  const drawer = useDrawer();
  const kecamatanModal = useModalForm();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [viewData, setViewData] = useState(null);

  const { user: authData } = useUser();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["kotaKabupaten"],
    queryFn: () => masterService.getKotaKabupaten(),
  });

  const { data: provinsiData } = useQuery({
    queryKey: ["provinsi-options"],
    queryFn: () => masterService.getProvinsi(),
  });

  const { data: kecamatanData, isLoading: isLoadingKecamatan } = useQuery({
    enabled: !!drawer.data?.id && drawer.isOpen,
    queryKey: ["kecamatan", drawer.data?.id],
    queryFn: () => masterService.getKecamatanByKotaKab(drawer.data.id),
  });

  // Kota/Kabupaten mutations
  const kotaKabupatenCreateMutation = useMutation({
    mutationFn: (data) => masterService.createKotaKabupaten(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kotaKabupaten"] });
      modal.close();
    },
  });

  const kotaKabupatenUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => masterService.updateKotaKabupaten(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kotaKabupaten"] });
      modal.close();
    },
  });

  // Kecamatan mutations
  const kecamatanCreateMutation = useMutation({
    mutationFn: (data) => masterService.createKecamatan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kecamatan", kecamatanModal.editData?.id],
      });
      kecamatanModal.close();
    },
  });

  const fieldsWithOptions = kotaKabupatenFields.map((field) => {
    if (field.name === "idProvinsi" && provinsiData?.data?.items) {
      return {
        ...field,
        options: provinsiData.data.items.map((item) => ({
          value: item.id,
          label: item.nama,
        })),
      };
    }

    return field;
  });

  const columns = [
    { key: "id", label: "ID", type: "text" },
    { key: "nama", label: "Nama Kota / Kabupaten", type: "text" },
    {
      key: "isActive",
      label: "Status",
      type: "boolean",
      badgeVariant: (value) => (value === true ? "success" : "danger"),
    },
  ];

  const handleSubmit = async (formData, isEdit) => {
    if (isEdit) {
      return kotaKabupatenUpdateMutation.mutateAsync({
        id: modal.editData.id,
        data: formData,
      });
    }

    return kotaKabupatenCreateMutation.mutateAsync(formData);
  };

  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Kota/Kabupaten",
      message: `Apakah Anda yakin ingin menghapus "${item.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await masterService.deleteKotaKabupaten(item.id);
          refetch();
        } catch (error) {
          console.error("Error deleting kota/kabupaten:", error);
        }
      },
    });
  };

  const handleView = (item) => {
    setViewData(item);
    setIsViewModalOpen(true);
  };

  const handleKecamatanSubmit = async (formData, isEdit) => {
    const dataWithKotaKab = {
      ...formData,
      idKotaKab: kecamatanModal.editData?.id || "",
    };

    return kecamatanCreateMutation.mutateAsync(dataWithKotaKab);
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
            label: "Kota / Kabupaten",
          },
        ]}
        columns={columns}
        data={data?.data?.items || []}
        description={"Kelola data kota kabupaten"}
        exportFilename="kota-kabupaten"
        exportable={true}
        isLoading={isLoading}
        rowActionType="horizontal"
        rowActions={[

          ...(authData?.isAdmin ? [
          {
            label: "Edit",
            icon: Pen,
            onClick: (item) => modal.open(item),
            variant: "outline",
            tooltip: "Edit kota/kabupaten",
          },
          ] : []),
          {
            label: "View",
            icon: Eye,
            onClick: handleView,
            variant: "outline",
            tooltip: "Lihat detail kota/kabupaten",
          },

          ...(authData?.isAdmin ? [
          {
            label: "Delete",
            icon: Trash,
            onClick: handleDelete,
            variant: "outline",
            tooltip: "Hapus kota/kabupaten",
          },
           ] : []),
          {
            label: "Tambah Kecamatan",
            icon: PlusIcon,
            onClick: (item) => kecamatanModal.open(item),
            variant: "outline",
            tooltip: "Tambah kecamatan baru",
          },
          {
            label: "Lihat Kecamatan",
            icon: Eye,
            onClick: (item) => drawer.open(item),
            variant: "outline",
            tooltip: "Lihat kecamatan yang ada",
          },
        ]}
        searchPlaceholder="Cari kota kabupaten..."
        title={"Daftar Kota / Kabupaten"}
        onAdd={
          authData?.isAdmin
            ? () => {
                modal.open();
              }
            : undefined
        }
      />

      <CreateOrEditModal
        defaultValues={{ nama: "", idProvinsi: "" }}
        editData={modal.editData}
        fields={fieldsWithOptions}
        isLoading={
          kotaKabupatenCreateMutation.isPending ||
          kotaKabupatenUpdateMutation.isPending
        }
        isOpen={modal.isOpen}
        schema={kotaKabupatenSchema}
        title="Kota / Kabupaten"
        onClose={modal.close}
        onSubmit={handleSubmit}
      />

      <CreateOrEditModal
        defaultValues={{
          nama: "",
          idKotaKab: kecamatanModal.editData?.id || "",
        }}
        editData={null}
        fields={kecamatanFields}
        isLoading={kecamatanCreateMutation.isPending}
        isOpen={kecamatanModal.isOpen}
        schema={kecamatanSchema}
        title={`Tambah Kecamatan untuk ${kecamatanModal.editData?.nama || ""}`}
        onClose={kecamatanModal.close}
        onSubmit={handleKecamatanSubmit}
      />

      <Drawer
        isOpen={drawer.isOpen}
        position="right"
        title={`Kecamatan - ${drawer.data?.nama || ""}`}
        width="w-96"
        onClose={drawer.close}
      >
        <div className="space-y-4">
          {isLoadingKecamatan ? (
            <div className="text-gray-900 dark:text-gray-100">Loading...</div>
          ) : (
            <div className="space-y-2">
              {kecamatanData?.data?.length > 0 ? (
                kecamatanData.data.map((item) => (
                  <div key={item.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.nama}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">ID: {item.id}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Belum ada kecamatan
                </div>
              )}
            </div>
          )}
        </div>
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
                  Detail Kota/Kabupaten
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
