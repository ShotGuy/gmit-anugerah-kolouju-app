import { BookOpen, Clock, MapPin, Mic, Users } from "lucide-react";

export default function ScheduleCard({
  title,
  date,
  time,
  location,
  speaker,
  tema,
  firman,
  jenisIbadah,
  rayon
}) {
  // Parse date for visual display if possible (Expected format: "Minggu, 12 Januari 2025")
  let day = "";
  let month = "";
  let dateNum = "";

  if (date) {
    const parts = date.split(' ');
    if (parts.length >= 3) {
      // Simple heuristic, might need adjustment based on real data format
      // Assuming "Minggu, 12 Januari 2025" or similar
      day = parts[0].replace(',', '').substring(0, 3).toUpperCase(); // MIN, SEN, ...
      dateNum = parts[1]; // 12
      month = parts[2].substring(0, 3).toUpperCase(); // JAN, FEB...
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col group">
      {/* Top Border Accent */}
      <div className="h-1 w-full bg-blue-600 group-hover:bg-blue-500 transition-colors" />

      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          {/* Title & Type */}
          <div className="flex-1 pr-2">
            <span className="inline-block px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
              {title}
            </span>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg line-clamp-2 leading-tight">
              {jenisIbadah || "Ibadah Raya"}
            </h3>
          </div>

          {/* Visual Date Box */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg p-2 min-w-[60px] border border-gray-200 dark:border-gray-600">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{month || 'JADWAL'}</span>
            <span className="text-xl font-black text-gray-800 dark:text-gray-100">{dateNum || '?'}</span>
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{day || 'TBS'}</span>
          </div>
        </div>

        <div className="space-y-3 flex-grow">
          {time && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
              <span>{time}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
          {speaker && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Mic className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
              <span className="line-clamp-1 font-medium">{speaker}</span>
            </div>
          )}
          {rayon && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
              <span className="line-clamp-1">{rayon}</span>
            </div>
          )}
        </div>

        {/* Footer info (Theme/Firman) */}
        {(tema || firman) && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            {tema && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2 mb-1">
                "{tema}"
              </p>
            )}
            {firman && (
              <div className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                <BookOpen className="w-3 h-3 mr-1.5" />
                <span>{firman}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
