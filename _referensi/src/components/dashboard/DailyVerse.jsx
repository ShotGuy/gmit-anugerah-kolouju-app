import { Book, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function DailyVerse() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVerse = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://beta.ourmanna.com/api/v1/get?format=json"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch verse");
      }

      const data = await response.json();

      if (data.verse && data.verse.details) {
        setVerse(data.verse.details);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching daily verse:", err);
      setError(err.message);
      // Fallback verse
      setVerse({
        text: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.",
        reference: "John 3:16",
        version: "NIV",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Daily Verse
          </h3>
        </div>
        <button
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
          disabled={loading}
          title="New Verse"
          onClick={fetchVerse}
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div>
          <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 italic">
            "{verse?.text}"
          </blockquote>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            — {verse?.reference} ({verse?.version})
          </p>

          {verse?.verseurl && (
            <a
              className="inline-block mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              href={verse.verseurl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Powered by OurManna.com
            </a>
          )}
        </div>
      )}
    </div>
  );
}
