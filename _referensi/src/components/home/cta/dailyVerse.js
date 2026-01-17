import { Book, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function DailyVerse() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVerse = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add timeout to prevent blocking
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

      const response = await fetch(
        "https://beta.ourmanna.com/api/v1/get?format=json",
        {
          signal: controller.signal,
          next: { revalidate: 3600 }, // Revalidate every hour instead of force-cache
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Gagal mengambil ayat");
      }

      const data = await response.json();

      if (data.verse && data.verse.details) {
        setVerse(data.verse.details);
      } else {
        throw new Error("Format respons tidak valid");
      }
    } catch (err) {
      if (err.name === "AbortError") {
      } else {
      }
      setError(err.message);
      // Fallback verse - show immediately
      setVerse({
        text: "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.",
        reference: "Yohanes 3:16",
        version: "TB",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse();
  }, []);

  return (
    <div className="flex flex-col md:flex-row bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl w-full md:w-3/4 mx-auto gap-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-white/20 dark:border-slate-700/50 relative overflow-hidden group">
      {/* Glow Effect */}
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 bg-amber-400/20 blur-3xl rounded-full group-hover:bg-amber-400/30 transition-all duration-500 pointer-events-none"></div>
      {/* Icon/Visual */}
      <div className="flex-shrink-0 flex items-center justify-center md:w-80 md:h-72 relative flex-1">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-2 w-full h-full flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              fill
              alt="Alkitab Kudus"
              className="object-cover rounded-xl shadow-lg hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 768px) 288px, 100vw"
              src="/bible-image.webp"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center text-gray-800 dark:text-white transition-colors duration-300">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl font-bold tracking-wide font-sans text-gray-800 dark:text-white">
              Ayat Harian
            </h2>
          </div>
          <div className="w-16 h-1 bg-blue-600 rounded-full" />
        </div>

        <p className="text-lg font-medium mb-6 text-gray-600 dark:text-gray-300">
          Setiap hari, mari kita dikuatkan oleh Firman Tuhan.
        </p>

        {loading ? (
          <div className="mb-6 flex-grow flex items-center">
            <div className="flex items-center justify-center w-full py-4">
              <div className="loading loading-spinner loading-lg text-blue-600" />
            </div>
          </div>
        ) : (
          <div className="mb-6 flex-grow">
            <blockquote className="text-xl md:text-2xl italic font-serif leading-relaxed text-gray-800 dark:text-gray-100 mb-4 border-l-4 border-blue-500 pl-4 py-1">
              "{verse?.text}"
            </blockquote>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 text-right">
              — {verse?.reference} ({verse?.version})
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            className="btn btn-primary btn-sm rounded-full gap-2 px-6 shadow-md hover:shadow-lg transition-all"
            disabled={loading}
            onClick={fetchVerse}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {loading ? "Memuat..." : "Ayat Baru"}
          </button>

          {verse?.verseurl && (
            <a
              className="btn btn-ghost btn-sm text-xs opacity-60 rounded-full"
              href={verse.verseurl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Powered by OurManna.com
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
