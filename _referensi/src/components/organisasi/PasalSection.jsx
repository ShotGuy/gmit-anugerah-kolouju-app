import { useState } from "react";
import { ChevronDown, FileText, BookOpen } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

export default function PasalSection({ pasalDeskripsi, categoryName }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Jika tidak ada pasal, jangan render apapun
  if (!pasalDeskripsi || pasalDeskripsi.trim() === "" || pasalDeskripsi === "<p><br></p>") {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg overflow-hidden border border-blue-100 dark:border-gray-700">
        {/* Header - Clickable untuk toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 dark:bg-blue-600 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                Ketentuan & Pasal
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 hidden sm:inline">
                  {categoryName && `(${categoryName})`}
                </span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isExpanded ? "Klik untuk menyembunyikan" : "Klik untuk melihat detail ketentuan"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isExpanded && (
              <span className="hidden sm:flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                <FileText className="w-4 h-4" />
                Baca Selengkapnya
              </span>
            )}
            <ChevronDown
              className={`w-6 h-6 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Content - Collapsible */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {/* Decorative top border */}
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6"></div>

              {/* HTML Content dari Quill Editor */}
              <div className="ql-container ql-snow border-0">
                <div
                  className="ql-editor !p-6 sm:!p-8
                    !bg-gradient-to-br from-gray-50 to-blue-50/30
                    dark:!bg-gradient-to-br dark:from-gray-900 dark:to-gray-800
                    rounded-xl border-l-4 border-blue-500 shadow-sm
                    text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: pasalDeskripsi }}
                />
              </div>

              {/* Decorative bottom element */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span className="italic">Ketentuan dan pasal dapat berubah sewaktu-waktu sesuai keputusan gereja</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsed Preview - Show when collapsed */}
        {!isExpanded && (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-900/50 dark:to-gray-800/50 border-t border-blue-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
              Terdapat informasi penting mengenai ketentuan dan pasal yang dapat Anda baca
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
