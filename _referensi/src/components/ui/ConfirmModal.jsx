import { AlertTriangle, Info, X } from "lucide-react";
import { Button } from "./Button";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning", // "warning", "danger", "info"
  confirmText = "Ya",
  cancelText = "Batal",
  confirmVariant = "default",
  loading = false
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "danger":
        return "border-red-200 dark:border-red-800";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800";
      case "info":
        return "border-blue-200 dark:border-blue-800";
      default:
        return "border-yellow-200 dark:border-yellow-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className={`relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 border ${getBorderColor()} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
              {getIcon()}
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              <div className="mt-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                  {message}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <Button
              onClick={onConfirm}
              variant={confirmVariant}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Memproses..." : confirmText}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}