import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { atestasiSchema } from "@/validations/masterSchema";
import atestasiService from "@/services/atestasiService";
import { showToast } from "@/utils/showToast";

export default function CreateAtestasiPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    watch,
    register,
    formState: { isValid, errors },
  } = useForm({
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
          color: "success"
        });

        // Jika tipe MASUK, tanyakan apakah ingin create jemaat
        if (data.tipe === "MASUK") {
          setTimeout(() => {
            if (
              confirm(
                "Atestasi masuk berhasil dibuat! Apakah ingin langsung membuat data jemaat?"
              )
            ) {
              router.push(
                `/employee/lainnya/atestasi/create-jemaat/${response.data.id}`
              );

              return;
            }
            router.push("/employee/lainnya/atestasi");
          }, 500);
        } else {
          router.push("/employee/lainnya/atestasi");
        }
      }
    } catch (error) {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal membuat data atestasi",
        color: "error"
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
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            type="button"
            onClick={() => router.push("/employee/lainnya/atestasi")}
          >
            ← Kembali
          </button>
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
        <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Base Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Atestasi *
              </label>
              <select
                {...register("tipe")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih tipe atestasi</option>
                <option value="MASUK">Jemaat Masuk</option>
                <option value="KELUAR">Jemaat Keluar</option>
              </select>
              {errors.tipe && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tipe.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Atestasi *
              </label>
              <input
                type="date"
                {...register("tanggal")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.tanggal && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tanggal.message}
                </p>
              )}
            </div>
          </div>

          {/* Conditional Fields */}
          {tipeValue === "KELUAR" && (
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Informasi Jemaat Keluar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jemaat yang Keluar *
                    </label>
                    <input
                      type="text"
                      {...register("idJemaat")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Pilih jemaat yang akan keluar"
                    />
                    {errors.idJemaat && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.idJemaat.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gereja Tujuan *
                    </label>
                    <input
                      type="text"
                      {...register("gerejaTujuan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nama gereja tujuan"
                    />
                    {errors.gerejaTujuan && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.gerejaTujuan.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klasis Tujuan (Opsional)
                    </label>
                    <input
                      type="text"
                      {...register("idKlasis")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Pilih klasis tujuan"
                    />
                  </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Calon Jemaat *
                    </label>
                    <input
                      type="text"
                      {...register("namaCalonJemaat")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama calon jemaat"
                    />
                    {errors.namaCalonJemaat && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.namaCalonJemaat.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gereja Asal *
                    </label>
                    <input
                      type="text"
                      {...register("gerejaAsal")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nama gereja asal"
                    />
                    {errors.gerejaAsal && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.gerejaAsal.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klasis Asal (Opsional)
                    </label>
                    <input
                      type="text"
                      {...register("idKlasis")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Pilih klasis asal"
                    />
                  </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alasan *
                    </label>
                    <textarea
                      {...register("alasan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Alasan atestasi"
                      rows={3}
                    />
                    {errors.alasan && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.alasan.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keterangan (Opsional)
                    </label>
                    <textarea
                      {...register("keterangan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Keterangan tambahan"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
              type="button"
              onClick={() => router.push("/employee/lainnya/atestasi")}
            >
              Batal
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isValid || isSubmitting || !tipeValue}
              type="submit"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Atestasi"}
            </button>
          </div>
        </form>
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
    </div>
  );
}
