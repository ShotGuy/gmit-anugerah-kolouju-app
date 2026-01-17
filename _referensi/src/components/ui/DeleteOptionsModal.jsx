import { AlertTriangle, Database, Clock, X } from "lucide-react";
import { Button } from "./Button";

export default function DeleteOptionsModal({
  isOpen,
  onClose,
  onDeleteNow,
  onDeleteLater,
  itemName,
  itemType = "existing", // "existing", "new"
  hasChildren = false,
  childrenCount = 0,
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-xs bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Konfirmasi Penghapusan Item
              </h3>
              <div className="mt-3 space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    PERHATIAN: Item "{itemName}" akan dihapus!
                  </p>
                  {hasChildren && (
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Item ini memiliki {childrenCount} sub-item yang juga akan terhapus.
                    </p>
                  )}
                </div>

                {itemType === "existing" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pilih cara penghapusan:
                    </p>

                    {/* Delete Now Option */}
                    <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <div className="flex items-start space-x-3">
                        <Database className="w-5 h-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            Hapus Sekarang dari Database
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            • Item akan dihapus langsung dari database
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            • Tidak dapat dibatalkan
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            • Perubahan efektif segera
                          </p>
                          <Button
                            onClick={onDeleteNow}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            className="mt-3 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Database className="w-4 h-4 mr-2" />
                            {loading ? "Menghapus..." : "Hapus Sekarang"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Later Option */}
                    <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors">
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            Hapus Saat Menyimpan
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            • Item ditandai untuk dihapus
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            • Dihapus saat klik tombol "Update"
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            • Bisa dibatalkan sebelum disimpan
                          </p>
                          <Button
                            onClick={onDeleteLater}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Hapus Saat Simpan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {itemType === "new" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Item ini belum tersimpan di database.
                    </p>
                    <Button
                      onClick={onDeleteLater}
                      variant="outline"
                      disabled={loading}
                      className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Hapus dari Form
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={onClose}
              variant="ghost"
              disabled={loading}
              className="text-gray-600 dark:text-gray-400"
            >
              Batal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}