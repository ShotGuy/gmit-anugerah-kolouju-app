import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Upload, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import TextInput from "@/components/ui/inputs/TextInput";
import profilPendetaService from "@/services/profilPendetaService";
import { showToast } from "@/utils/showToast";

const ProfilPendetaModal = ({
  isOpen,
  onClose,
  profile = null, // For edit mode
  mode = "create", // 'create' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    nama: "",
    status: "",
    periode: "",
    quote: "",
    foto: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  const queryClient = useQueryClient();

  // Reset form when modal opens/closes or profile changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && profile) {
        setFormData({
          nama: profile.nama || "",
          status: profile.status || "",
          periode: profile.periode || "",
          quote: profile.quote || "",
          foto: null,
        });
        setPreviewUrl(profile.urlFoto || null);
      } else {
        setFormData({ nama: "", status: "", periode: "", quote: "", foto: null });
        setPreviewUrl(null);
      }
      setError("");
    }
  }, [isOpen, mode, profile]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();

      formDataToSend.append("nama", data.nama);
      formDataToSend.append("status", data.status);
      formDataToSend.append("periode", data.periode);
      formDataToSend.append("quote", data.quote);

      if (data.foto) {
        formDataToSend.append("foto", data.foto);
      }

      if (mode === "edit" && profile) {
        return await profilPendetaService.update(profile.id, formDataToSend);
      } else {
        return await profilPendetaService.create(formDataToSend);
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries(["profil-pendeta"]);
      queryClient.invalidateQueries(["profil-pendeta-active"]);

      showToast({
        title: "Berhasil!",
        description:
          mode === "edit"
            ? "Profil pendeta berhasil diperbarui"
            : "Profil pendeta berhasil dibuat",
        color: "success",
        timeout: 4000,
      });

      handleClose();
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Terjadi kesalahan";

      setError(message);

      showToast({
        title: "Gagal",
        description: message,
        color: "error",
        timeout: 5000,
      });
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    setError("");

    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      setError("Tipe file harus PNG, JPG, atau JPEG");

      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");

      return;
    }

    setFormData((prev) => ({ ...prev, foto: file }));

    // Create preview URL
    const reader = new FileReader();

    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      setError("Nama pendeta harus diisi");

      return;
    }

    if (mode === "create" && !formData.foto) {
      setError("Foto pendeta harus diupload");

      return;
    }

    mutation.mutate(formData);
  };

  const handleClose = () => {
    setFormData({ nama: "", status: "", periode: "", quote: "", foto: null });
    setPreviewUrl(null);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === "edit" ? "Edit Profil Pendeta" : "Tambah Profil Pendeta"}
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={mutation.isPending}
            onClick={handleClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Nama Pendeta */}
          <div>
            <TextInput
              label="Nama Pendeta *"
              required
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              disabled={mutation.isPending}
              maxLength={100}
              placeholder="Masukkan nama lengkap pendeta"
              type="text"
              value={formData.nama}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, nama: value }))
              }
            />
          </div>

          {/* Jabatan/Status & Periode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Jabatan / Status"
              placeholder="Contoh: Ketua Majelis"
              disabled={mutation.isPending}
              value={formData.status}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            />
            <TextInput
              label="Periode Pelayanan"
              placeholder="Contoh: 2023 - 2027"
              disabled={mutation.isPending}
              value={formData.periode}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, periode: value }))
              }
            />
          </div>

          {/* Quote */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kutipan Inspiratif (Quote)
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              rows={3}
              placeholder="Masukkan kutipan ayat atau kata mutiara..."
              disabled={mutation.isPending}
              value={formData.quote}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, quote: e.target.value }))
              }
            />
          </div>

          {/* Foto Pendeta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Foto Pendeta{" "}
              {mode === "create" && <span className="text-red-500">*</span>}
            </label>

            {/* Preview */}
            {previewUrl && (
              <div className="mb-4 flex justify-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600">
                  <img
                    alt="Preview"
                    className="w-full h-full object-cover"
                    src={previewUrl}
                  />
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <input
                accept=".png,.jpg,.jpeg"
                className="hidden"
                disabled={mutation.isPending}
                id="foto-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label
                className="cursor-pointer flex flex-col items-center space-y-2"
                htmlFor="foto-upload"
              >
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    {previewUrl ? "Ganti foto" : "Klik untuk upload"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, JPEG (max. 2MB)
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              disabled={mutation.isPending}
              type="button"
              onClick={handleClose}
            >
              Batal
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              disabled={
                mutation.isPending ||
                !formData.nama.trim() ||
                (mode === "create" && !formData.foto)
              }
              type="submit"
            >
              {mutation.isPending && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {mutation.isPending
                  ? mode === "edit"
                    ? "Memperbarui..."
                    : "Membuat..."
                  : mode === "edit"
                    ? "Perbarui"
                    : "Buat Profil"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilPendetaModal;
