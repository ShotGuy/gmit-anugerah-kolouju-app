import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  File,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import DokumenJemaatPreviewModal from "./DokumenJemaatPreviewModal";

import dokumenJemaatService from "@/services/dokumenJemaatService";
import { showToast } from "@/utils/showToast";

const DokumenJemaatList = ({ jemaatId, userRole = "USER" }) => {
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dokumen-jemaat-list", jemaatId],
    queryFn: async () => {
      if (!jemaatId) return [];

      const response = await dokumenJemaatService.getByJemaatId(jemaatId);

      if (!response.success) {
        throw new Error(response.message || "Gagal mengambil data dokumen");
      }

      return response.data || [];
    },
    enabled: !!jemaatId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (dokumenId) => {
      const response = await dokumenJemaatService.delete(dokumenId);

      if (!response.success) {
        throw new Error(response.message || "Gagal menghapus dokumen");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dokumen-jemaat-list", jemaatId]);
      queryClient.invalidateQueries(["dokumen-jemaat-progress", jemaatId]);

      showToast({
        title: "Berhasil!",
        description: "Dokumen berhasil dihapus",
        color: "success",
        timeout: 3000,
      });
    },
    onError: (error) => {
      showToast({
        title: "Gagal Hapus",
        description:
          error.message || "Terjadi kesalahan saat menghapus dokumen",
        color: "error",
        timeout: 4000,
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ dokumenId, status, catatan = "" }) => {
      const response = await dokumenJemaatService.verify(
        dokumenId,
        status,
        catatan
      );

      if (!response.success) {
        throw new Error(response.message || "Gagal verifikasi dokumen");
      }

      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["dokumen-jemaat-list", jemaatId]);
      queryClient.invalidateQueries(["dokumen-jemaat-progress", jemaatId]);

      const statusText =
        variables.status === "APPROVED" ? "disetujui" : "ditolak";

      showToast({
        title: "Berhasil!",
        description: `Dokumen berhasil ${statusText}`,
        color: "success",
        timeout: 3000,
      });
    },
    onError: (error) => {
      showToast({
        title: "Gagal Verifikasi",
        description:
          error.message || "Terjadi kesalahan saat verifikasi dokumen",
        color: "error",
        timeout: 4000,
      });
    },
  });

  const getDocumentTypeLabel = (tipeDokumen, judulDokumen) => {
    const documentTypeLabels = {
      BAPTIS: "Surat Baptis",
      SIDI: "Surat Sidi",
      NIKAH: "Surat Nikah",
      LAINNYA: judulDokumen || "Dokumen Lainnya",
    };

    return documentTypeLabels[tipeDokumen] || "Dokumen Tidak Dikenal";
  };

  const statusLabels = {
    PENDING: {
      label: "Menunggu Verifikasi",
      color:
        "text-yellow-600 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-900/30",
      icon: Clock,
    },
    APPROVED: {
      label: "Disetujui",
      color:
        "text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900/30",
      icon: CheckCircle2,
    },
    REJECTED: {
      label: "Ditolak",
      color: "text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30",
      icon: XCircle,
    },
  };

  const handleDelete = async (dokumenId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      return;
    }
    deleteMutation.mutate(dokumenId);
  };

  const handleVerification = async (dokumenId, status, catatan = "") => {
    verifyMutation.mutate({ dokumenId, status, catatan });
  };

  const handlePreview = (document) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setSelectedDocument(null);
    setIsPreviewOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Memuat dokumen...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
        <p>{error.message}</p>
        <button
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          onClick={() =>
            queryClient.invalidateQueries(["dokumen-jemaat-list", jemaatId])
          }
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <File className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p>Belum ada dokumen yang diupload</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        const status = statusLabels[doc.statusDokumen];
        const StatusIcon = status.icon;

        return (
          <div
            key={doc.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-white dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <File className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {getDocumentTypeLabel(doc.tipeDokumen, doc.judulDokumen)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {doc.namaFile}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span>Upload: {formatDate(doc.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </span>
                </div>

                {doc.catatan && (
                  <div
                    className={`p-3 rounded-lg text-sm mb-3 ${
                      doc.statusDokumen === "REJECTED"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {doc.statusDokumen === "REJECTED" && (
                        <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong>
                          {doc.statusDokumen === "REJECTED"
                            ? "Alasan Penolakan:"
                            : "Catatan:"}
                        </strong>{" "}
                        {doc.catatan}
                      </div>
                    </div>
                  </div>
                )}

                {doc.verifiedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Diverifikasi pada: {formatDate(doc.verifiedAt)}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Preview dokumen"
                  onClick={() => handlePreview(doc)}
                >
                  <Eye className="w-4 h-4" />
                </button>

                <a
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  download={doc.namaFile}
                  href={doc.urlFile}
                  title="Download dokumen"
                >
                  <Download className="w-4 h-4" />
                </a>

                {/* {(userRole === "ADMIN" || doc.statusDokumen === "PENDING") && (
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    disabled={deleteMutation.isPending}
                    title="Hapus dokumen"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )} */}
              </div>
            </div>

            {userRole === "ADMIN" && doc.statusDokumen === "PENDING" && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-300"
                    disabled={verifyMutation.isPending}
                    onClick={() => handleVerification(doc.id, "APPROVED")}
                  >
                    Setujui
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-gray-300"
                    disabled={verifyMutation.isPending}
                    onClick={() => {
                      const catatan = prompt(
                        "Masukkan alasan penolakan (opsional):"
                      );

                      if (catatan !== null) {
                        handleVerification(doc.id, "REJECTED", catatan);
                      }
                    }}
                  >
                    Tolak
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Preview Modal */}
      <DokumenJemaatPreviewModal
        document={selectedDocument}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default DokumenJemaatList;
