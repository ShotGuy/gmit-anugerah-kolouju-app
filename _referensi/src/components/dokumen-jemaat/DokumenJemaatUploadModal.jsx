import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, File, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

import TextInput from "@/components/ui/inputs/TextInput";
import dokumenJemaatService from "@/services/dokumenJemaatService";
import { showToast } from "@/utils/showToast";

const DokumenJemaatUploadModal = ({
  isOpen,
  onClose,
  jemaatId,
  onUploadSuccess,
  replaceMode = false,
  existingDocument = null,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tipeDokumen, setTipeDokumen] = useState("");
  const [judulDokumen, setJudulDokumen] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const queryClient = useQueryClient();

  // Auto-select document type and title in replace mode
  useEffect(() => {
    if (replaceMode && existingDocument && isOpen) {
      setTipeDokumen(existingDocument.tipeDokumen);
      setJudulDokumen(existingDocument.judulDokumen || "");
    } else if (!replaceMode) {
      // Reset when not in replace mode
      setTipeDokumen("");
      setJudulDokumen("");
    }
  }, [replaceMode, existingDocument, isOpen]);

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      jemaatId,
      tipeDokumen,
      judulDokumen,
      dokumenId,
    }) => {
      const formData = new FormData();

      formData.append("dokumen", file);

      if (replaceMode && dokumenId) {
        // Replace mode
        formData.append("dokumenId", dokumenId);
        if (tipeDokumen === "LAINNYA" && judulDokumen) {
          formData.append("judulDokumen", judulDokumen);
        }

        return await dokumenJemaatService.replace(dokumenId, formData);
      } else {
        // Normal upload mode
        formData.append("jemaatId", jemaatId);
        formData.append("tipeDokumen", tipeDokumen);
        if (tipeDokumen === "LAINNYA" && judulDokumen) {
          formData.append("judulDokumen", judulDokumen);
        }

        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/dokumen/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Gagal upload dokumen");
        }

        return data;
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries(["dokumen-jemaat-list", jemaatId]);
      queryClient.invalidateQueries(["dokumen-jemaat-progress", jemaatId]);
      queryClient.invalidateQueries(["rejected-documents", jemaatId]);

      if (onUploadSuccess) {
        onUploadSuccess(data.data);
      }

      // Show success toast
      const message = replaceMode
        ? "Dokumen berhasil diganti dan menunggu verifikasi ulang"
        : "Dokumen berhasil diupload dan menunggu verifikasi";

      showToast({
        title: "Berhasil!",
        description: message,
        color: "success",
        timeout: 4000,
      });

      // Close modal immediately
      handleClose();
    },
    onError: (error) => {
      setError(error.message);

      // Show error toast
      showToast({
        title: "Gagal Upload",
        description: error.message || "Terjadi kesalahan saat upload dokumen",
        color: "error",
        timeout: 5000,
      });
    },
  });

  const documentTypes = [
    { value: "BAPTIS", label: "Surat Baptis" },
    { value: "SIDI", label: "Surat Sidi" },
    { value: "NIKAH", label: "Surat Nikah" },
    { value: "LAINNYA", label: "Lainnya (Custom)" },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    setError("");
    setSuccess("");

    if (!file) return;

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];

    if (!allowedTypes.includes(file.type)) {
      setError("Tipe file harus PDF, PNG, atau JPG");

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");

      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !tipeDokumen) {
      setError("Pilih file dan tipe dokumen terlebih dahulu");

      return;
    }

    if (tipeDokumen === "LAINNYA" && !judulDokumen.trim()) {
      setError('Judul dokumen harus diisi untuk tipe dokumen "Lainnya"');

      return;
    }

    uploadMutation.mutate({
      file: selectedFile,
      jemaatId,
      tipeDokumen,
      judulDokumen: judulDokumen.trim(),
      dokumenId: existingDocument?.id,
    });
  };

  const resetModal = () => {
    setSelectedFile(null);
    setTipeDokumen("");
    setJudulDokumen("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {replaceMode ? "Ganti Dokumen" : "Upload Dokumen"}
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={handleClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {replaceMode && existingDocument && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <div className="text-sm">
                <strong>Mode Ganti Dokumen:</strong> Anda akan mengganti dokumen
                "{existingDocument.namaFile}" yang sudah ada.
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipe Dokumen
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              disabled={uploadMutation.isPending || replaceMode}
              value={tipeDokumen}
              onChange={(e) => setTipeDokumen(e.target.value)}
            >
              <option value="">Pilih Tipe Dokumen</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Document Title Field - only show when LAINNYA is selected */}
          {tipeDokumen === "LAINNYA" && (
            <div>
              <TextInput
                label="Judul Dokumen *"
                disabled={uploadMutation.isPending}
                maxLength={255}
                placeholder="Masukkan judul dokumen..."
                type="text"
                value={judulDokumen}
                onChange={(e) => setJudulDokumen(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Contoh: Surat Keterangan Domisili, Akta Kelahiran, dll.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Dokumen
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <input
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                disabled={uploadMutation.isPending}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label
                className="cursor-pointer flex flex-col items-center space-y-2"
                htmlFor="file-upload"
              >
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    Klik untuk upload
                  </span>{" "}
                  atau drag and drop
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, PNG, JPG (max. 2MB)
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-3 flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <File className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  disabled={uploadMutation.isPending}
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            disabled={uploadMutation.isPending}
            onClick={handleClose}
          >
            Batal
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            disabled={
              !selectedFile ||
              !tipeDokumen ||
              (tipeDokumen === "LAINNYA" && !judulDokumen.trim()) ||
              uploadMutation.isPending
            }
            onClick={handleUpload}
          >
            {uploadMutation.isPending && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {uploadMutation.isPending
                ? replaceMode
                  ? "Mengganti..."
                  : "Uploading..."
                : replaceMode
                  ? "Ganti Dokumen"
                  : "Upload"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DokumenJemaatUploadModal;
