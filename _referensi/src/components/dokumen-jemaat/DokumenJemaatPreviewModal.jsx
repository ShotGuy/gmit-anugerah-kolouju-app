import { Download, ExternalLink, X } from "lucide-react";
import { useState } from "react";

const DokumenJemaatPreviewModal = ({ isOpen, onClose, document }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!isOpen || !document) return null;

  const isPDF = document.namaFile?.toLowerCase().endsWith(".pdf");
  const isImage = document.namaFile?.toLowerCase().match(/\.(jpg|jpeg|png)$/);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const getDocumentTitle = () => {
    const typeLabels = {
      BAPTIS: "Surat Baptis",
      SIDI: "Surat Sidi",
      NIKAH: "Surat Nikah",
      LAINNYA: document.judulDokumen || "Dokumen Lainnya",
    };

    return typeLabels[document.tipeDokumen] || "Dokumen";
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getDocumentTitle()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {document.namaFile}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <a
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              download={document.namaFile}
              href={document.urlFile}
              title="Download dokumen"
            >
              <Download className="w-5 h-5" />
            </a>
            <a
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              href={document.urlFile}
              rel="noopener noreferrer"
              target="_blank"
              title="Buka di tab baru"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Tutup"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 h-full overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">
                  Memuat dokumen...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">
                  Gagal memuat preview dokumen
                </p>
                <div className="space-x-2">
                  <a
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    href={document.urlFile}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Buka di Tab Baru
                  </a>
                  <a
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    download={document.namaFile}
                    href={document.urlFile}
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* PDF Preview */}
          {isPDF && (
            <iframe
              className={`w-full h-full border-0 rounded-lg ${loading ? "hidden" : "block"}`}
              src={`${document.urlFile}#toolbar=1`}
              title={`Preview ${document.namaFile}`}
              onError={handleError}
              onLoad={handleLoad}
            />
          )}

          {/* Image Preview */}
          {isImage && (
            <div className="flex items-center justify-center h-full">
              <img
                alt={document.namaFile}
                className={`max-w-full max-h-full object-contain rounded-lg ${loading ? "hidden" : "block"}`}
                src={document.urlFile}
                onError={handleError}
                onLoad={handleLoad}
              />
            </div>
          )}

          {/* Unsupported file type */}
          {!isPDF && !isImage && !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Preview tidak tersedia untuk tipe file ini
                </p>
                <div className="space-x-2">
                  <a
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    href={document.urlFile}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Buka di Tab Baru
                  </a>
                  <a
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    download={document.namaFile}
                    href={document.urlFile}
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DokumenJemaatPreviewModal;
