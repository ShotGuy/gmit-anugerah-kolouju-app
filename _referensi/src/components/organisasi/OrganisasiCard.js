import { AlertCircle, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

// Helper function to extract text content from JSON konten
const extractTextFromKonten = (konten) => {
  if (!konten) return "No content available";

  try {
    // If konten is string, return it
    if (typeof konten === "string") return konten;

    // If konten is object, try to extract text
    if (typeof konten === "object") {
      // Handle different JSON structures that might be used for content
      if (konten.text) return konten.text;
      if (konten.content) return konten.content;
      if (konten.deskripsi) return konten.deskripsi;
      if (konten.body) return konten.body;

      // If it's an array, join the text
      if (Array.isArray(konten)) {
        return konten
          .map((item) => {
            if (typeof item === "string") return item;
            if (item.text || item.content) return item.text || item.content;
            return "";
          })
          .filter(Boolean)
          .join(" ");
      }

      // Fallback: stringify the object
      return JSON.stringify(konten).substring(0, 200) + "...";
    }

    return String(konten);
  } catch (error) {
    console.error("Error extracting text from konten:", error);
    return "Content unavailable";
  }
};

// Helper function to format date
const formatDate = (dateString, timeString) => {
  try {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // If time is provided, append it
    if (timeString) {
      return `${formattedDate} • ${timeString}`;
    }

    return formattedDate;
  } catch (error) {
    return "Date unavailable";
  }
};

// Helper function to get priority badge color
const getPriorityColor = (prioritas) => {
  switch (prioritas) {
    case "HIGH":
      return "badge-warning";
    case "LOW":
      return "badge-success";
    case "URGENT":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

export default function OrganisasiCard({ pengumuman }) {
  if (!pengumuman) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 text-center border border-gray-100 dark:border-gray-700">
        <AlertCircle
          className="mx-auto mb-3 text-gray-400 dark:text-gray-500"
          size={40}
        />
        <p className="text-gray-600 dark:text-gray-400">Belum Ada Pengumuman</p>
      </div>
    );
  }

  const { id, judul, konten, tanggalPengumuman, waktuPengumuman, prioritas, isPinned, jenis, lokasi } = pengumuman;

  const description = extractTextFromKonten(konten);
  const formattedDate = formatDate(tanggalPengumuman, waktuPengumuman);

  return (
    <div className="group relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-1">
      {/* Priority Badge */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {isPinned && <div className="badge badge-secondary shadow-sm">📌 Sematkan</div>}
        {prioritas && prioritas !== "MEDIUM" && (
          <div className={`badge ${getPriorityColor(prioritas)} shadow-sm text-xs font-bold`}>
            {prioritas === "HIGH" ? "PENTING" : prioritas === "URGENT" ? "MENDESAK" : "INFO"}
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        {/* Meta Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            {formattedDate}
          </div>
          {jenis && (
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full uppercase tracking-wide">
              {jenis.nama}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {judul || "Tanpa Judul"}
        </h3>

        {/* Location if available */}
        {lokasi && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1 text-red-500" />
            <span className="line-clamp-1">{lokasi}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
          {description}
        </p>

        {/* Footer Action */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <Link href={`/news/${id}`} className="w-full">
            <button className="btn btn-primary btn-sm w-full dark:btn-info dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white border-none normal-case font-medium">
              Baca Selengkapnya
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
