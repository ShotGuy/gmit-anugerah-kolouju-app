import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextInput from "@/components/ui/inputs/TextInput";
import atestasiService from "@/services/atestasiService";
import { showToast } from "@/utils/showToast";
import { atestasiSchema } from "@/validations/masterSchema";

export default function CreateAtestasiPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateJemaatDialog, setShowCreateJemaatDialog] = useState(false);
  const [atestasiId, setAtestasiId] = useState(null);

  const methods = useForm({
    resolver: zodResolver(atestasiSchema),
    defaultValues: {
      tipe: "",
      tanggal: "",
      idJemaat: "",
      idKlasis: "",
      namaCalonJemaat: "",
      gerejaAsal: "",
      gerejaTujuan: "",
      alasan: "",
      keterangan: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    watch,
    formState: { isValid },
  } = methods;
  const tipeValue = watch("tipe");

  // Handle form submission
  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await atestasiService.create(data);

      if (response.success) {
        showToast({
          title: "Berhasil",
          description: "Data atestasi berhasil dibuat!",
          color: "success",
        });

        // Invalidate queries to refresh list
        queryClient.invalidateQueries(["atestasi"]);

        // Jika tipe MASUK, tanyakan apakah ingin create jemaat
        if (data.tipe === "MASUK") {
          setAtestasiId(response.data.id);
          setShowCreateJemaatDialog(true);
        } else {
          router.push("/employee/lainnya/atestasi");
        }
      }
    } catch (error) {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal membuat data atestasi",
        color: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get helper text
  const getHelperText = () => {
    if (tipeValue === "MASUK") {
      return "Setelah atestasi masuk dibuat, Anda akan diarahkan untuk membuat data jemaat lengkap.";
    } else if (tipeValue === "KELUAR") {
      return "Jemaat yang dipilih akan diubah statusnya menjadi KELUAR setelah atestasi disimpan.";
    }

    return "Pilih tipe atestasi untuk melihat field yang perlu diisi.";
  };

  // Handle create jemaat confirmation
  const handleCreateJemaat = () => {
    setShowCreateJemaatDialog(false);
    router.push(`/employee/lainnya/atestasi/create-jemaat/${atestasiId}`);
  };

  const handleSkipCreateJemaat = () => {
    setShowCreateJemaatDialog(false);
    router.push("/employee/lainnya/atestasi");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Buat Data Atestasi
            </h1>
            <p className="text-gray-600 mt-2">
              Tambah data atestasi jemaat masuk atau keluar
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/employee/lainnya/atestasi")}
          >
            ← Kembali
          </Button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {/* Helper Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Panduan Pengisian
          </h3>
          <p className="text-sm text-blue-700">{getHelperText()}</p>
        </div>

        {/* Form */}
        <FormProvider {...methods}>
          <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Base Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectInput
                required
                label="Tipe Atestasi"
                name="tipe"
                options={[
                  { value: "MASUK", label: "Jemaat Masuk" },
                  { value: "KELUAR", label: "Jemaat Keluar" },
                ]}
                placeholder="Pilih tipe atestasi"
              />
              <DatePicker required label="Tanggal Atestasi" name="tanggal" />
            </div>

            {/* Conditional Fields */}
            {tipeValue === "KELUAR" && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Informasi Jemaat Keluar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AutoCompleteInput
                      required
                      apiEndpoint="jemaat/options"
                      label="Pilih Jemaat yang Keluar"
                      name="idJemaat"
                      placeholder="Pilih jemaat yang akan keluar"
                    />
                    <TextInput
                      required
                      label="Gereja Tujuan"
                      name="gerejaTujuan"
                      placeholder="Nama gereja tujuan"
                    />
                    <AutoCompleteInput
                      apiEndpoint="klasis/options"
                      label="Klasis Tujuan"
                      name="idKlasis"
                      placeholder="Pilih klasis tujuan (opsional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {tipeValue === "MASUK" && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Informasi Jemaat Masuk
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInput
                      required
                      label="Nama Calon Jemaat"
                      name="namaCalonJemaat"
                      placeholder="Masukkan nama calon jemaat"
                    />
                    <TextInput
                      required
                      label="Gereja Asal"
                      name="gerejaAsal"
                      placeholder="Nama gereja asal"
                    />
                    <AutoCompleteInput
                      apiEndpoint="klasis/options"
                      label="Klasis Asal"
                      name="idKlasis"
                      placeholder="Pilih klasis asal (opsional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Common Fields */}
            {tipeValue && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Alasan dan Keterangan
                  </h4>
                  <div className="space-y-4">
                    <TextInput
                      required
                      label="Alasan"
                      name="alasan"
                      placeholder="Alasan atestasi"
                      type="textarea"
                    />
                    <TextInput
                      label="Keterangan"
                      name="keterangan"
                      placeholder="Keterangan tambahan (opsional)"
                      type="textarea"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                disabled={isSubmitting}
                type="button"
                variant="outline"
                onClick={() => router.push("/employee/lainnya/atestasi")}
              >
                Batal
              </Button>
              <Button
                disabled={!isValid || isSubmitting || !tipeValue}
                type="submit"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Atestasi"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Info Cards */}
      {tipeValue && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tipeValue === "MASUK" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-2">
                Info Atestasi Masuk
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Isi nama calon jemaat baru</li>
                <li>• Tentukan gereja asal</li>
                <li>• Klasis asal (opsional)</li>
              </ul>
            </div>
          )}

          {tipeValue === "KELUAR" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-900 mb-2">
                Info Atestasi Keluar
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Pilih jemaat yang keluar</li>
                <li>• Tentukan gereja tujuan</li>
                <li>• Klasis tujuan (opsional)</li>
              </ul>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Tips Pengisian
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Tanggal atestasi wajib diisi</li>
              <li>• Alasan harus jelas</li>
              <li>• Keterangan tambahan opsional</li>
            </ul>
          </div>
        </div>
      )}

      {/* Create Jemaat Confirmation Dialog */}
      <ConfirmDialog
        cancelText="Tidak, Nanti Saja"
        confirmText="Ya, Buat Data Jemaat"
        isOpen={showCreateJemaatDialog}
        message="Atestasi masuk berhasil dibuat! Apakah Anda ingin langsung membuat data jemaat untuk orang ini?"
        title="Buat Data Jemaat"
        variant="success"
        onClose={handleSkipCreateJemaat}
        onConfirm={handleCreateJemaat}
      />
    </div>
  );
}
