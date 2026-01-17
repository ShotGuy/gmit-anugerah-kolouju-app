import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  Trash,
  Plus,
  Users,
  Calendar,
  Building2,
  User,
  MapPin,
  GraduationCap,
  Pen,
} from "lucide-react";

import sidiService from "@/services/sidiService";
import { sidiSchema } from "@/validations/masterSchema";
import useModalForm from "@/hooks/useModalForm";
import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import ListGrid from "@/components/ui/ListGrid";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import useConfirm from "@/hooks/useConfirm";
import { useUser } from "@/hooks/useUser";

const sidiFields = [
  {
    type: "select",
    name: "idJemaat",
    label: "Pilih Jemaat",
    placeholder: "Pilih jemaat untuk sidi",
    required: true,
    apiEndpoint: "/jemaat/options",
  },
  {
    type: "datepicker",
    name: "tanggal",
    label: "Tanggal Sidi",
    placeholder: "Pilih tanggal sidi",
    required: true,
  },
  {
    type: "select",
    name: "idKlasis",
    label: "Klasis",
    placeholder: "Pilih klasis",
    required: true,
    apiEndpoint: "/klasis/options",
  },
  {
    type: "textarea",
    name: "keterangan",
    label: "Keterangan",
    placeholder: "Keterangan tambahan (opsional)",
  },
];

export default function SidiPage() {
  const modal = useModalForm();
  const confirm = useConfirm();
  const [viewData, setViewData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { user: authData } = useUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["sidi"],
    queryFn: () => sidiService.getAll(),
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAge = (birthDate, sidiDate) => {
    if (!birthDate || !sidiDate) return "-";
    const birth = new Date(birthDate);
    const sidi = new Date(sidiDate);
    const diffTime = Math.abs(sidi - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} tahun${months > 0 ? ` ${months} bulan` : ""}`;
    } else if (months > 0) {
      return `${months} bulan`;
    } else {
      return `${diffDays} hari`;
    }
  };

  const columns = [
    {
      key: "jemaat",
      label: "Nama Jemaat",
      type: "text",
      render: (value) => (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-blue-500" />
          <div>
            <div className="font-medium">{value?.nama || "-"}</div>
            <div className="text-xs text-gray-500">
              {value?.jenisKelamin ? "Laki-laki" : "Perempuan"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "tanggal",
      label: "Tanggal Sidi",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm">
          <Calendar className="w-4 h-4 mr-2 text-green-500" />
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "ageAtSidi",
      label: "Umur Saat Sidi",
      type: "text",
      render: (value, row) => {
        const age = calculateAge(row.jemaat?.tanggalLahir, row.tanggal);
        return (
          <span className="flex items-center text-sm">
            <GraduationCap className="w-4 h-4 mr-2 text-purple-500" />
            {age}
          </span>
        );
      },
    },
    {
      key: "klasis",
      label: "Klasis",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm">
          <Building2 className="w-4 h-4 mr-2 text-orange-500" />
          {value?.nama || "-"}
        </span>
      ),
    },
    {
      key: "jemaat.keluarga",
      label: "Keluarga",
      type: "text",
      render: (value, row) => {
        const keluarga = row.jemaat?.keluarga;
        return (
          <div className="text-sm">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-gray-400" />
              <span>Bag. {keluarga?.noBagungan || "-"}</span>
            </div>
            <div className="text-xs text-gray-500">
              {keluarga?.rayon?.namaRayon || "-"}
            </div>
          </div>
        );
      },
    },
  ];

  const handleSidiSuccess = () => {
    refetch();
    modal.close();
  };

  const handleSidiSubmit = async (formData, isEdit) => {
    if (isEdit) {
      return await sidiService.update(modal.editData.id, formData);
    }
    return await sidiService.create(formData);
  };

  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Data Sidi",
      message: `Apakah Anda yakin ingin menghapus data sidi "${item.jemaat?.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await sidiService.delete(item.id);
          refetch();
        } catch (error) {
          console.error("Error deleting sidi:", error);
        }
      },
    });
  };

  const handleView = (item) => {
    setViewData(item);
    setIsViewModalOpen(true);
  };

  // Stats untuk header
  const stats = [
    {
      label: "Total Sidi",
      value: data?.data?.pagination?.total?.toString() || "0",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Sidi Tahun Ini",
      value:
        data?.data?.items
          ?.filter(
            (item) =>
              new Date(item.tanggal).getFullYear() === new Date().getFullYear()
          )
          .length.toString() || "0",
      icon: Calendar,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Laki-laki",
      value:
        data?.data?.items
          ?.filter((item) => item.jemaat?.jenisKelamin === true)
          .length.toString() || "0",
      icon: User,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Perempuan",
      value:
        data?.data?.items
          ?.filter((item) => item.jemaat?.jenisKelamin === false)
          .length.toString() || "0",
      icon: User,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    },
  ];

  return (
    <>
      <ListGrid
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Sidi", href: "/admin/sidi" },
        ]}
        columns={columns}
        data={data?.data?.items || []}
        description="Kelola data sidi jemaat GMIT Imanuel Oepura"
        exportFilename="sidi"
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
                  tooltip: "Edit data sidi",
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
                  tooltip: "Hapus data sidi",
                },
              ]
            : []),
        ]}
        searchPlaceholder="Cari nama jemaat..."
        stats={stats}
        title="Manajemen Data Sidi"
        onAdd={authData?.isAdmin ? () => modal.open() : undefined}
      />

      <CreateOrEditModal
        defaultValues={{
          idJemaat: "",
          tanggal: "",
          idKlasis: "",
          keterangan: "",
        }}
        editData={modal.editData}
        fields={sidiFields}
        isOpen={modal.isOpen}
        schema={sidiSchema}
        title="Data Sidi"
        onClose={modal.close}
        onSubmit={handleSidiSubmit}
        onSuccess={handleSidiSuccess}
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
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Detail Data Sidi
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Nama Jemaat
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewData.jemaat?.nama}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Tanggal Sidi
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(viewData.tanggal)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Klasis
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewData.klasis?.nama}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Umur Saat Sidi
                    </label>
                    <p className="text-sm text-gray-900">
                      {calculateAge(
                        viewData.jemaat?.tanggalLahir,
                        viewData.tanggal
                      )}
                    </p>
                  </div>
                  {viewData.keterangan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Keterangan
                      </label>
                      <p className="text-sm text-gray-900">
                        {viewData.keterangan}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
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
