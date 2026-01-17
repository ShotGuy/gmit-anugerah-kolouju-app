import { X } from "lucide-react";

export default function ViewModal({ 
  isOpen, 
  onClose, 
  title = "Detail Data", 
  data = [] 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
       />
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">{title}</h3>
              <button
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {data.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      {item.label}:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-[200px] break-words transition-colors duration-200">
                      {item.value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200"
                onClick={onClose}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}