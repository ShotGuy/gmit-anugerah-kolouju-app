import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Calendar,
  Eye,
  LogIn,
  LogOut,
  MapPin,
  Pen,
  Trash,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import CreateOrEditModal from "@/components/common/CreateOrEditModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import useModalForm from "@/hooks/useModalForm";
import atestasiService from "@/services/atestasiService";
import { atestasiSchema } from "@/validations/masterSchema";

// Daftar field yang akan ditampilkan sesuai tipe atestasi
const getAtestasiFields = (formData) => {
  const baseFields = [
    {
      type: "select",
      name: "tipe",
      label: "Tipe Atestasi",
      placeholder: "Pilih tipe atestasi",
      required: true,
      options: [
        { value: "MASUK", label: "Jemaat Masuk" },
        { value: "KELUAR", label: "Jemaat Keluar" },
      ],
    },
    {
      type: "date",
      name: "tanggal",
      label: "Tanggal Atestasi",
      required: true,
    },
  ];

  // Fields untuk KELUAR
  const keluarFields = [
    {
      type: "select",
      name: "idJemaat",
      label: "Pilih Jemaat yang Keluar",
      placeholder: "Pilih jemaat yang akan keluar",
      required: true,
      apiEndpoint: "jemaat/options",
    },
    {
      type: "text",
      name: "gerejaTujuan",
      label: "Gereja Tujuan",
      placeholder: "Nama gereja tujuan",
      required: true,
    },
    {
      type: "select",
      name: "idKlasis",
      label: "Klasis Tujuan",
      placeholder: "Pilih klasis tujuan",
      required: false,
      apiEndpoint: "klasis/options",
    },
  ];

  // Fields untuk MASUK
  const masukFields = [
    {
      type: "text",
      name: "namaCalonJemaat",
      label: "Nama Calon Jemaat",
      placeholder: "Masukkan nama calon jemaat",
      required: true,
    },
    {
      type: "text",
      name: "gerejaAsal",
      label: "Gereja Asal",
      placeholder: "Nama gereja asal",
      required: true,
    },
    {
      type: "select",
      name: "idKlasis",
      label: "Klasis Asal",
      placeholder: "Pilih klasis asal",
      required: false,
      apiEndpoint: "klasis/options",
    },
  ];

  // Fields umum
  const commonFields = [
    {
      type: "textarea",
      name: "alasan",
      label: "Alasan",
      placeholder: "Alasan atestasi",
    },
    {
      type: "textarea",
      name: "keterangan",
      label: "Keterangan",
      placeholder: "Keterangan tambahan (opsional)",
    },
  ];

  // Mengembalikan field sesuai tipe yang dipilih
  if (formData && formData.tipe === "KELUAR") {
    return [...baseFields, ...keluarFields, ...commonFields];
  } else if (formData && formData.tipe === "MASUK") {
    return [...baseFields, ...masukFields, ...commonFields];
  }

  // Default: hanya menampilkan field dasar
  return baseFields;
};

export default function AtestasiPage() {
  const router = useRouter();
  const modal = useModalForm();
  const confirm = useConfirm();
  const [viewData, setViewData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["atestasi"],
    queryFn: () => atestasiService.getAll(),
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const columns = [
    {
      key: "tipe",
      label: "Tipe",
      type: "badge",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === "MASUK"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value === "MASUK" ? (
            <LogIn className="w-3 h-3 mr-1" />
          ) : (
            <LogOut className="w-3 h-3 mr-1" />
          )}
          {value === "MASUK" ? "Masuk" : "Keluar"}
        </span>
      ),
    },
    {
      key: "nama",
      label: "Nama",
      type: "text",
      render: (value, row) => (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-blue-500" />
          <div>
            <div className="font-medium">
              {row.jemaat?.nama || row.namaCalonJemaat || "-"}
            </div>
            <div className="text-xs text-gray-500">
              {row.jemaat
                ? row.jemaat.jenisKelamin
                  ? "Laki-laki"
                  : "Perempuan"
                : "Calon Jemaat"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "tanggal",
      label: "Tanggal",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm">
          <Calendar className="w-4 h-4 mr-2 text-green-500" />
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "gereja",
      label: "Gereja",
      type: "text",
      render: (value, row) => (
        <span className="flex items-center text-sm">
          <Building2 className="w-4 h-4 mr-2 text-orange-500" />
          {row.gerejaAsal || row.gerejaTujuan || "-"}
        </span>
      ),
    },
    {
      key: "klasis",
      label: "Klasis",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm">
          <Building2 className="w-4 h-4 mr-2 text-purple-500" />
          {value?.nama || "-"}
        </span>
      ),
    },
    {
      key: "keluarga",
      label: "Keluarga",
      type: "text",
      render: (value, row) => {
        const keluarga = row.jemaat?.keluarga;

        if (!keluarga) return "-";

        return (
          <div className="text-sm">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-gray-400" />
              <span>Bag. {keluarga.noBagungan}</span>
            </div>
            <div className="text-xs text-gray-500">
              {keluarga.rayon?.namaRayon || "-"}
            </div>
          </div>
        );
      },
    },
  ];

  const handleAtestasiSuccess = (newData) => {
    refetch();
    modal.close();

    // Jika tipe MASUK dan berhasil dibuat, arahkan ke halaman create jemaat
    if (newData?.data?.tipe === "MASUK") {
      setTimeout(() => {
        if (
          confirm(
            "Atestasi masuk berhasil dibuat! Apakah ingin langsung membuat data jemaat?"
          )
        ) {
          router.push(
            `/employee/lainnya/atestasi/create-jemaat/${newData.data.id}`
          );
        }
      }, 500);
    }
  };

  const handleAtestasiSubmit = async (formData, isEdit) => {
    if (isEdit) {
      return await atestasiService.update(modal.editData.id, formData);
    }

    return await atestasiService.create(formData);
  };

  const handleDelete = (item) => {
    confirm.showConfirm({
      title: "Hapus Data Atestasi",
      message: `Apakah Anda yakin ingin menghapus data atestasi "${
        item.jemaat?.nama || item.namaCalonJemaat
      }"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        try {
          await atestasiService.delete(item.id);
          refetch();
        } catch (error) {
          console.error("Error deleting atestasi:", error);
        }
      },
    });
  };

  const handleView = (item) => {
    setViewData(item);
    setIsViewModalOpen(true);
  };

  const handleCreateJemaat = (item) => {
    if (item.tipe === "MASUK" && !item.jemaat) {
      router.push(`/employee/lainnya/atestasi/create-jemaat/${item.id}`);
    }
  };

  // Stats untuk header
  const stats = [
    {
      label: "Total Atestasi",
      value: data?.data?.pagination?.total?.toString() || "0",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Jemaat Masuk",
      value:
        data?.data?.items
          ?.filter((item) => item.tipe === "MASUK")
          .length.toString() || "0",
      icon: LogIn,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Jemaat Keluar",
      value:
        data?.data?.items
          ?.filter((item) => item.tipe === "KELUAR")
          .length.toString() || "0",
      icon: LogOut,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "Belum Diproses",
      value:
        data?.data?.items
          ?.filter((item) => item.tipe === "MASUK" && !item.jemaat)
          .length.toString() || "0",
      icon: UserPlus,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <>
      <ListGrid
        breadcrumb={[
          { label: "Dashboard", href: "/employee/dashboard" },
          { label: "Lainnya", href: "/employee/lainnya" },
          { label: "Atestasi", href: "/employee/lainnya/atestasi" },
        ]}
        columns={columns}
        data={data?.data?.items || []}
        description="Kelola data atestasi jemaat masuk dan keluar GMIT Imanuel Oepura"
        exportable={true}
        isLoading={isLoading}
        rowActionType="horizontal"
        rowActions={[
          {
            icon: Pen,
            onClick: (item) => modal.open(item),
            variant: "outline",
            tooltip: "Edit data atestasi",
          },
          {
            icon: Eye,
            onClick: handleView,
            variant: "outline",
            tooltip: "Lihat detail lengkap",
          },
          {
            icon: UserPlus,
            onClick: handleCreateJemaat,
            variant: "default",
            tooltip: "Buat data jemaat",
            condition: (item) => item.tipe === "MASUK" && !item.jemaat,
          },
          {
            icon: Trash,
            onClick: handleDelete,
            variant: "outline",
            tooltip: "Hapus data atestasi",
          },
        ]}
        searchPlaceholder="Cari nama jemaat atau calon jemaat..."
        stats={stats}
        title="Manajemen Atestasi Jemaat"
        onAdd={() => router.push("/employee/lainnya/atestasi/create")}
        exportFilename="atestasi"
        // onAdd={() => modal.open()}
        filters={[
          {
            key: "tipe",
            label: "Semua Tipe",
            options: [
              { value: "MASUK", label: "Jemaat Masuk" },
              { value: "KELUAR", label: "Jemaat Keluar" },
            ],
          },
        ]}
      />

      <CreateOrEditModal
        defaultValues={{
          tipe: "",
          tanggal: "",
          idJemaat: "",
          idKlasis: "",
          namaCalonJemaat: "",
          gerejaAsal: "",
          gerejaTujuan: "",
          alasan: "",
          keterangan: "",
        }}
        editData={modal.editData}
        fields={getAtestasiFields(modal.formData)}
        helperText={
          modal.formData?.tipe === "MASUK"
            ? "Setelah atestasi masuk dibuat, Anda akan diarahkan untuk membuat data jemaat lengkap."
            : modal.formData?.tipe === "KELUAR"
              ? "Jemaat yang dipilih akan diubah statusnya menjadi KELUAR setelah atestasi disimpan."
              : "Pilih tipe atestasi untuk melihat field yang perlu diisi."
        }
        isOpen={modal.isOpen}
        schema={atestasiSchema}
        title="Data Atestasi"
        onClose={modal.close}
        onSubmit={handleAtestasiSubmit}
        onSuccess={handleAtestasiSuccess}
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
                  Detail Data Atestasi
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Tipe Atestasi
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewData.tipe === "MASUK"
                        ? "Jemaat Masuk"
                        : "Jemaat Keluar"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Nama
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewData.jemaat?.nama || viewData.namaCalonJemaat || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Tanggal
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(viewData.tanggal)}
                    </p>
                  </div>
                  {viewData.gerejaAsal && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Gereja Asal
                      </label>
                      <p className="text-sm text-gray-900">
                        {viewData.gerejaAsal}
                      </p>
                    </div>
                  )}
                  {viewData.gerejaTujuan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Gereja Tujuan
                      </label>
                      <p className="text-sm text-gray-900">
                        {viewData.gerejaTujuan}
                      </p>
                    </div>
                  )}
                  {viewData.klasis && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Klasis
                      </label>
                      <p className="text-sm text-gray-900">
                        {viewData.klasis.nama}
                      </p>
                    </div>
                  )}
                  {viewData.alasan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Alasan
                      </label>
                      <p className="text-sm text-gray-900">{viewData.alasan}</p>
                    </div>
                  )}
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
