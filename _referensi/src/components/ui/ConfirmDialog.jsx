import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin ingin melanjutkan?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger", // danger, warning, info
}) {
  if (!isOpen) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-red-500 dark:text-red-400",
          confirmBtn: "btn-error",
          bg: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
        };
      case "warning":
        return {
          icon: "text-yellow-500 dark:text-yellow-400",
          confirmBtn: "btn-warning",
          bg: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
        };
      default:
        return {
          icon: "text-blue-500 dark:text-blue-400",
          confirmBtn: "btn-primary",
          bg: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity" />

      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all duration-200 sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 transition-colors duration-200">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${variantClasses.bg} border-2 sm:mx-0 sm:h-10 sm:w-10`}>
                <AlertTriangle className={`h-6 w-6 ${variantClasses.icon}`} />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 transition-colors duration-200">
            <button
              className={`inline-flex w-full justify-center rounded-md btn ${variantClasses.confirmBtn} px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto`}
              type="button"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 sm:mt-0 sm:w-auto transition-colors duration-200"
              type="button"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}