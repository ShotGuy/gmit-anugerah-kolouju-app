import { useEffect, useState } from "react";
import publicJadwalService from "../../../services/publicJadwalService";
import ScheduleCard from "./scheduleCard";

export default function ScheduleRow({
  jenisIbadah = null,
  kategori = null,
  title = "Jadwal Ibadah",
  limit = 6,
}) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch schedule data from API
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);

        const response = await publicJadwalService.getJadwalIbadah({
          jenisIbadah,
          kategori,
          limit,
          upcoming: true,
        });

        const formattedSchedules =
          publicJadwalService.formatForScheduleRow(response);

        if (formattedSchedules.length === 0) {
          setSchedules([]);
        } else {
          setSchedules(formattedSchedules);
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
        // Fallback to empty
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [jenisIbadah, kategori, limit, title]);

  // Show loading state
  if (loading) {
    return (
      <div className="py-8 w-full">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Skeleton */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
            <div className="h-1 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't render if error or no schedules
  if (error || !schedules.length) {
    // Optional: Return null or a subtle "No Schedule" message. 
    // Usually best to hide the section if empty to avoid clutter.
    return null;
  }

  return (
    <div className="py-12 w-full bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Clean Consolidated Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white tracking-tight">
            {title}
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
        </div>

        {/* Clean Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="h-full">
              <ScheduleCard
                date={schedule.date}
                firman={schedule.firman}
                jenisIbadah={schedule.jenisIbadah}
                location={schedule.location}
                rayon={schedule.rayon}
                speaker={schedule.speaker}
                tema={schedule.tema}
                time={schedule.time}
                title={schedule.title}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
