import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Crown,
  Eye,
  MapPin,
  Pen,
  Trash,
  User,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import useModalForm from "@/hooks/useModalForm";
import { useUser } from "@/hooks/useUser";
import majelisService from "@/services/majelisService";
import masterService from "@/services/masterService";
import { majelisEditSchema } from "@/validations/masterSchema";

export default function MajelisPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const modal = useModalForm();
  const [viewData, setViewData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { user: authData } = useUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["majelis"],
    queryFn: () => majelisService.getAll(),
  });

  const { data: rayonData } = useQuery({
    queryKey: ["rayon"],
    queryFn: () => masterService.getRayon(),
  });

  const { data: jenisJabatanData } = useQuery({
    queryKey: ["jenis-jabatan"],
    queryFn: () => masterService.getJenisJabatan(),
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
      render: (value, item) => (
        <span className="font-mono text-sm text-gray-600">
          {value ? String(value).slice(0, 8) + "..." : "-"}
        </span>
      ),
    },
    {
      key: "jemaat.nama",
      label: "Nama Majelis",
      type: "text",
      render: (value, item) => (
        <span className="flex items-center text-sm font-medium">
          <Crown className="w-4 h-4 mr-2 text-purple-500" />
          {item.jemaat?.nama || "-"}
        </span>
      ),
    },
    {
      key: "jenisJabatan",
      label: "Jenis Jabatan",
      type: "text",
      render: (value, item) => (
        <span className="flex items-center text-sm">
          <User className="w-4 h-4 mr-2 text-blue-500" />
          {value?.namaJabatan || "-"}
        </span>
      ),
    },
    {
      key: "rayon",
      label: "Rayon",
      type: "text",
      render: (value, item) => (
        <span className="flex items-center text-sm">
          <MapPin className="w-4 h-4 mr-2 text-green-500" />
          {value?.namaRayon || "-"}
        </span>
      ),
    },
    {
      key: "mulai",
      label: "Periode Jabatan",
      type: "text",
      render: (value, item) => (
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 mr-2 text-orange-500" />
          <div>
            <div className="font-medium">
              {new Date(value).toLocaleDateString("id-ID")}
            </div>
            {item.selesai && (
              <div className="text-gray-500 text-xs">
                s/d {new Date(item.selesai).toLocaleDateString("id-ID")}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "User",
      label: "Akun Login",
      type: "text",
      render: (value, item) => (
        <div className="text-sm">
          {value ? (
            <div>
              <div className="font-medium text-green-600">✓ Ada</div>
              <div className="text-gray-500 text-xs">{value.username}</div>
            </div>
          ) : (
            <span className="text-red-500 text-xs">✗ Tidak ada</span>
          )}
        </div>
      ),
    },
  ];

  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Majelis",
      message: `Apakah Anda yakin ingin menghapus majelis "${item.jemaat?.nama || item.id}"? ${item.User ? "Akun pengguna terkait juga akan dihapus. " : ""
        }Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await majelisService.delete(item.id);
          refetch();
        } catch (error) {
          console.error("Error deleting majelis:", error);
        }
      },
    });
  };

  const handleView = (item) => {
    setViewData(item);
    setIsViewModalOpen(true);
  };

  const handleCreate = () => {
    router.push("/admin/majelis/create");
  };

  const handleEditSuccess = () => {
    refetch();
    modal.close();
  };

  const handleEditSubmit = async (formData, isEdit) => {
    if (isEdit) {
      return await majelisService.update(modal.editData.id, formData);
    }
    return { success: false };
  };

  return (
    <>
      <ListGrid
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Majelis", href: "/admin/majelis" },
        ]}
        columns={columns}
        customAddButton={{
          ...(authData?.isAdmin
            ? {
              onClick: handleCreate,
              variant: "primary",
              icon: <UserPlus className="w-4 h-4 mr-2" />,
              text: "Tambah Majelis + Akun",
            }
            : {}),
        }}
        data={data?.data?.items || []}
        description="Kelola data majelis dan akun login mereka"
        exportFilename="majelis"
        exportable={true}
        isLoading={isLoading}
        rowActionType="horizontal"
        rowActions={[
          ...(authData?.isAdmin
            ? [
              {
                icon: Pen,
                onClick: (item) => modal.open(item),
                variant: "outline",
                tooltip: "Edit majelis",
              },
            ]
            : []),
          {
            icon: Eye,
            onClick: handleView,
            variant: "outline",
            tooltip: "Lihat detail lengkap",
          },
          ...(authData?.isAdmin
            ? [
              {
                icon: Trash,
                onClick: handleDelete,
                variant: "outline",
                tooltip: "Hapus majelis",
              },
            ]
            : []),
        ]}
        searchPlaceholder="Cari nama majelis..."
        title="Manajemen Majelis"
        onAdd={authData?.isAdmin ? handleCreate : undefined}
      />

      <CreateOrEditModal
        defaultValues={{
          mulai: "",
          selesai: "",
          idRayon: "",
          jenisJabatanId: "",
        }}
        editData={modal.editData}
        fields={[
          {
            type: "date",
            name: "mulai",
            label: "Tanggal Mulai",
            placeholder: "Pilih tanggal mulai",
            required: true,
          },
          {
            type: "date",
            name: "selesai",
            label: "Tanggal Selesai",
            placeholder: "Pilih tanggal selesai (opsional)",
          },
          {
            type: "select",
            name: "idRayon",
            label: "Rayon",
            placeholder: "Pilih rayon (opsional)",
            options: rayonData?.data?.items?.map((item) => ({
              value: item.id,
              label: item.namaRayon,
            })) || [],
          },
          {
            type: "select",
            name: "jenisJabatanId",
            label: "Jenis Jabatan",
            placeholder: "Pilih jenis jabatan",
            required: true,
            options: jenisJabatanData?.data?.items?.map((item) => ({
              value: item.id,
              label: item.namaJabatan,
            })) || [],
          },
        ]}
        isOpen={modal.isOpen}
        schema={majelisEditSchema}
        title="Edit Majelis"
        onClose={modal.close}
        onSubmit={handleEditSubmit}
        onSuccess={handleEditSuccess}
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
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Detail Majelis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-100">
                        ID
                      </label>
                      <p className="text-sm text-gray-900 font-mono dark:text-gray-100">
                        {viewData.id}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-100">
                        Nama Majelis
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {viewData.jemaat?.nama || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-100">
                        Jenis Jabatan
                      </label>
                      <p className="text-sm text-gray-900  dark:text-gray-100">
                        {viewData.jenisJabatan?.namaJabatan || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-100">
                        Rayon
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {viewData.rayon?.namaRayon || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-100">
                        Tanggal Mulai
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(viewData.mulai).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    {viewData.selesai && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-100">
                          Tanggal Selesai
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(viewData.selesai).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {viewData.User && (
                    <div className="md:col-span-2 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">
                        Informasi Akun Login
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-green-700 ">Username:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-900">
                            {viewData.User.username}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700">Email:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-900">
                            {viewData.User.email}
                          </span>
                        </div>
                        {viewData.User.noWhatsapp && (
                          <div>
                            <span className="text-green-700">WhatsApp:</span>
                            <span className="ml-2 font-medium">
                              {viewData.User.noWhatsapp}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
