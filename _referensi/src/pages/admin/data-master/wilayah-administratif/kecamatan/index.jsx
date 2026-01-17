import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pen, PlusIcon, Trash } from "lucide-react";

import masterService from "@/services/masterService";
import {
  kecamatanSchema,
  kelurahanDesaSchema,
} from "@/validations/masterSchema";
import useModalForm from "@/hooks/useModalForm";
import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import ListGrid from "@/components/ui/ListGrid";
import useDrawer from "@/hooks/useDrawer";
import Drawer from "@/components/ui/Drawer";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import useConfirm from "@/hooks/useConfirm";
import { useUser } from "@/hooks/useUser";

const kecamatanFields = [
  {
    type: "text",
    name: "nama",
    label: "Nama Kecamatan",
    placeholder: "Masukkan nama kecamatan",
    required: true,
  },
  {
    type: "select",
    name: "idKotaKab",
    label: "Kota / Kabupaten",
    placeholder: "Pilih kota/kabupaten",
    required: true,
    options: [],
  },
];

const kelurahanDesaFields = [
  {
    type: "text",
    name: "nama",
    label: "Nama Kelurahan / Desa",
    placeholder: "Masukkan nama kelurahan/desa",
    required: true,
  },
  {
    type: "number",
    name: "kodePos",
    label: "Kode Pos",
    placeholder: "Masukkan kode pos",
    required: false,
  },
];

export default function KecamatanPage() {
  const modal = useModalForm();
  const drawer = useDrawer();
  const kelurahanDesaModal = useModalForm();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [viewData, setViewData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { user: authData } = useUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["kecamatan"],
    queryFn: () => masterService.getKecamatan(),
  });

  const { data: kotaKabupatenData } = useQuery({
    queryKey: ["kota-kabupaten-options"],
    queryFn: () => masterService.getKotaKabupaten(),
  });

  const { data: kelurahanDesaData, isLoading: isLoadingKelurahanDesa } =
    useQuery({
      enabled: !!drawer.data?.id && drawer.isOpen,
      queryKey: ["kelurahan-desa", drawer.data?.id],
      queryFn: () => masterService.getKelurahanDesaByKecamatan(drawer.data.id),
    });

  // Kecamatan mutations
  const kecamatanCreateMutation = useMutation({
    mutationFn: (data) => masterService.createKecamatan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kecamatan"] });
      modal.close();
    },
  });

  const kecamatanUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => masterService.updateKecamatan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kecamatan"] });
      modal.close();
    },
  });

  // Kelurahan/Desa mutations
  const kelurahanDesaCreateMutation = useMutation({
    mutationFn: (data) => masterService.createKelurahanDesa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kelurahan-desa", kelurahanDesaModal.editData?.id] });
      kelurahanDesaModal.close();
    },
  });

  const fieldsWithOptions = kecamatanFields.map((field) => {
    if (field.name === "idKotaKab" && kotaKabupatenData?.data?.items) {
      return {
        ...field,
        options: kotaKabupatenData.data.items.map((item) => ({
          value: item.id,
          label: item.nama,
        })),
      };
    }
    return field;
  });

  const columns = [
    { key: "id", label: "ID", type: "text" },
    { key: "nama", label: "Nama Kecamatan", type: "text" },
    {
      key: "isActive",
      label: "Status",
      type: "boolean",
      badgeVariant: (value) => (value === true ? "success" : "danger"),
    },
  ];

  const handleSubmit = async (formData, isEdit) => {
    if (isEdit) {
      return kecamatanUpdateMutation.mutateAsync({ id: modal.editData.id, data: formData });
    }
    return kecamatanCreateMutation.mutateAsync(formData);
  };

  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Kecamatan",
      message: `Apakah Anda yakin ingin menghapus "${item.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await masterService.deleteKecamatan(item.id);
          refetch();
        } catch (error) {
          console.error("Error deleting kecamatan:", error);
        }
      },
    });
  };

  const handleView = (item) => {
    setViewData(item);
    setIsViewModalOpen(true);
  };

  const handleKelurahanDesaSubmit = async (formData, isEdit) => {
    const dataWithKecamatan = {
      ...formData,
      idKecamatan: kelurahanDesaModal.editData?.id || "",
    };
    return kelurahanDesaCreateMutation.mutateAsync(dataWithKecamatan);
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
            label: "Kecamatan",
          },
        ]}
        columns={columns}
        data={data?.data?.items || []}
        description={"Kelola data kecamatan"}
        exportFilename="kecamatan"
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
            tooltip: "Edit kecamatan",
          },
          ] : []),
          {
            label: "View",
            icon: Eye,
            onClick: handleView,
            variant: "outline",
            tooltip: "Lihat detail kecamatan",
          },
          ...(authData?.isAdmin ? [
          {
            label: "Delete",
            icon: Trash,
            onClick: handleDelete,
            variant: "outline",
            tooltip: "Hapus kecamatan",
          },
          
          {
            label: "Tambah Kelurahan/Desa",
            icon: PlusIcon,
            onClick: (item) => kelurahanDesaModal.open(item),
            variant: "outline",
            tooltip: "Tambah kelurahan/desa baru",
          },
        ] : []),
          {
            label: "Lihat Kelurahan/Desa",
            icon: Eye,
            onClick: (item) => drawer.open(item),
            variant: "outline",
            tooltip: "Lihat kelurahan/desa yang ada",
          },
        ]}
        searchPlaceholder="Cari kecamatan..."
        title={"Daftar Kecamatan"}
        onAdd={
          authData?.isAdmin ? () => modal.open() : undefined  
        }
      />

      <CreateOrEditModal
        defaultValues={{ nama: "", idKotaKab: "" }}
        editData={modal.editData}
        fields={fieldsWithOptions}
        isLoading={kecamatanCreateMutation.isPending || kecamatanUpdateMutation.isPending}
        isOpen={modal.isOpen}
        schema={kecamatanSchema}
        title="Kecamatan"
        onClose={modal.close}
        onSubmit={handleSubmit}
      />

      <CreateOrEditModal
        defaultValues={{
          nama: "",
          idKecamatan: kelurahanDesaModal.editData?.id || "",
          kodePos: "",
        }}
        editData={null}
        fields={kelurahanDesaFields}
        isLoading={kelurahanDesaCreateMutation.isPending}
        isOpen={kelurahanDesaModal.isOpen}
        schema={kelurahanDesaSchema}
        title={`Tambah Kelurahan/Desa untuk ${kelurahanDesaModal.editData?.nama || ""}`}
        onClose={kelurahanDesaModal.close}
        onSubmit={handleKelurahanDesaSubmit}
      />

      <Drawer
        isOpen={drawer.isOpen}
        position="right"
        title={`Kelurahan/Desa - ${drawer.data?.nama || ""}`}
        width="w-96"
        onClose={drawer.close}
      >
        <div className="space-y-4">
          {isLoadingKelurahanDesa ? (
            <div className="text-gray-900 dark:text-gray-100">Loading...</div>
          ) : (
            <div className="space-y-2">
              {kelurahanDesaData?.data?.length > 0 ? (
                kelurahanDesaData.data.map((item) => (
                  <div key={item.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.nama}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">ID: {item.id}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Belum ada kelurahan/desa
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
                  Detail Kecamatan
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
