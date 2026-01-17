import { toast } from "sonner";

/**
 * Tipe warna notifikasi yang didukung: success, error, warning, info
 * Sonner: success, error, warning, info, default
 */
export function showToast({
  title = "Notifikasi",
  description = "",
  color = "success", // success | error | warning | info
  timeout = 3000,
} = {}) {
  // Mapping warna custom ke varian sonner
  const toastTypeMap = {
    success: toast.success,
    error: toast.error,
    danger: toast.error, // Alias for danger -> error
    warning: toast.warning,
    info: toast.info,
  };

  const show = toastTypeMap[color] || toast;

  show(description || title, {
    description: description && title !== description ? description : undefined,
    duration: timeout,
  });
}

// Attach static helper methods for cleaner usage
showToast.success = (message, options = {}) => showToast({ title: "Sukses", description: message, color: "success", ...options });
showToast.error = (message, options = {}) => showToast({ title: "Error", description: message, color: "error", ...options });
showToast.warning = (message, options = {}) => showToast({ title: "Peringatan", description: message, color: "warning", ...options });
showToast.info = (message, options = {}) => showToast({ title: "Info", description: message, color: "info", ...options });
