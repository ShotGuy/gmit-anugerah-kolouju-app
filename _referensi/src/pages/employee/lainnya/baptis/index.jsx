import { useQuery } from "@tanstack/react-query";
import {
  Baby,
  Building2,
  Calendar,
  Eye,
  MapPin,
  Pen,
  Trash,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";

import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import useModalForm from "@/hooks/useModalForm";
import baptisService from "@/services/baptisService";
import { showToast } from "@/utils/showToast";
import { baptisSchema } from "@/validations/masterSchema";

const baptisFields = [
  {
    type: "select",
    name: "idJemaat",
    label: "Pilih Jemaat",
    placeholder: "Pilih jemaat untuk baptis",
    required: true,
    apiEndpoint: "/jemaat/options",
  },
  {
    type: "date",
    name: "tanggal",
    label: "Tanggal Baptis",
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

export default function BaptisPage() {
  const modal = useModalForm();
  const confirm = useConfirm();
  const [viewData, setViewData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["baptis"],
    queryFn: () => baptisService.getAll(),
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAge = (birthDate, baptisDate) => {
    if (!birthDate || !baptisDate) return "-";
    const birth = new Date(birthDate);
    const baptis = new Date(baptisDate);
    const diffTime = Math.abs(baptis - birth);
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
          <User className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {value?.nama || "-"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {value?.jenisKelamin ? "Laki-laki" : "Perempuan"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "tanggal",
      label: "Tanggal Baptis",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm text-gray-900 dark:text-white">
          <Calendar className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" />
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "ageAtBaptis",
      label: "Umur Saat Baptis",
      type: "text",
      render: (value, row) => {
        const age = calculateAge(row.jemaat?.tanggalLahir, row.tanggal);

        return (
          <span className="flex items-center text-sm text-gray-900 dark:text-white">
            <Baby className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
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
        <span className="flex items-center text-sm text-gray-900 dark:text-white">
          <Building2 className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
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
            <div className="flex items-center text-gray-900 dark:text-white">
              <MapPin className="w-3 h-3 mr-1 text-gray-400 dark:text-gray-500" />
              <span>Bag. {keluarga?.noBagungan || "-"}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {keluarga?.rayon?.namaRayon || "-"}
            </div>
          </div>
        );
      },
    },
  ];

  const handleBaptisSuccess = () => {
    showToast({
      title: "Berhasil",
      description: modal.editData
        ? "Data baptis berhasil diperbarui"
        : "Data baptis berhasil ditambahkan",
      color: "success",
    });
    refetch();
    modal.close();
  };

  const handleBaptisSubmit = async (formData, isEdit) => {
    setIsSubmitting(true);
    try {
      if (isEdit) {
        return await baptisService.update(modal.editData.id, formData);
      }

      return await baptisService.create(formData);
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Data Baptis",
      message: `Apakah Anda yakin ingin menghapus data baptis "${item.jemaat?.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await baptisService.delete(item.id);
          refetch();
        } catch (error) {
          console.error("Error deleting baptis:", error);
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
      label: "Total Baptis",
      value: data?.data?.pagination?.total?.toString() || "0",
      icon: Users,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Baptis Tahun Ini",
      value:
        data?.data?.items
          ?.filter(
            (item) =>
              new Date(item.tanggal).getFullYear() === new Date().getFullYear()
          )
          .length.toString() || "0",
      icon: Calendar,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Laki-laki",
      value:
        data?.data?.items
          ?.filter((item) => item.jemaat?.jenisKelamin === true)
          .length.toString() || "0",
      icon: User,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Perempuan",
      value:
        data?.data?.items
          ?.filter((item) => item.jemaat?.jenisKelamin === false)
          .length.toString() || "0",
      icon: User,
      iconBg: "bg-pink-100 dark:bg-pink-900/30",
      iconColor: "text-pink-600 dark:text-pink-400",
    },
  ];

  return (
    <>
      <ListGrid
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Baptis", href: "/admin/baptis" },
        ]}
        columns={columns}
        data={data?.data?.items || []}
        description="Kelola data baptis jemaat GMIT Imanuel Oepura"
        exportFilename="baptis-employee"
        exportable={true}
        isLoading={isLoading}
        rowActionType="horizontal"
        rowActions={[
          {
            icon: Pen,
            onClick: (item) => modal.open(item),
            variant: "outline",
            tooltip: "Edit data baptis",
          },
          {
            icon: Eye,
            onClick: handleView,
            variant: "outline",
            tooltip: "Lihat detail lengkap",
          },
          {
            icon: Trash,
            onClick: handleDelete,
            variant: "outline",
            tooltip: "Hapus data baptis",
          },
        ]}
        searchPlaceholder="Cari nama jemaat..."
        stats={stats}
        title="Manajemen Data Baptis"
        onAdd={() => modal.open()}
      />

      <CreateOrEditModal
        defaultValues={{
          idJemaat: "",
          tanggal: "",
          idKlasis: "",
          keterangan: "",
        }}
        editData={modal.editData}
        fields={baptisFields}
        isLoading={isSubmitting}
        isOpen={modal.isOpen}
        schema={baptisSchema}
        title="Data Baptis"
        onClose={modal.close}
        onSubmit={handleBaptisSubmit}
        onSuccess={handleBaptisSuccess}
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
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all duration-200 sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 transition-colors duration-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                  Detail Data Baptis
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Nama Jemaat
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                      {viewData.jemaat?.nama}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Tanggal Baptis
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                      {formatDate(viewData.tanggal)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Klasis
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                      {viewData.klasis?.nama}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Umur Saat Baptis
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                      {calculateAge(
                        viewData.jemaat?.tanggalLahir,
                        viewData.tanggal
                      )}
                    </p>
                  </div>
                  {viewData.keterangan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        Keterangan
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                        {viewData.keterangan}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 transition-colors duration-200">
                <button
                  className="inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 sm:w-auto transition-colors duration-200"
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
