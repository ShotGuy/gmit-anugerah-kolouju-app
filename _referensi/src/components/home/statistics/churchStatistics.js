import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import publicStatisticsService from "../../../services/publicStatisticsService";

import { ChartSkeleton } from "../../ui/skeletons/SkeletonChart";
import StatPieChart from "./statPieChart";

export default function ChurchStatistics() {
  const scrollContainerRef = useRef(null);

  // Replace useEffect with TanStack Query
  const {
    data: chartData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["churchStatistics"],
    queryFn: async () => {
      const response = await publicStatisticsService.getChurchStatistics();

      return publicStatisticsService.formatChartData(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      // Scroll amount typically width of one card + gap
      // Assuming card min-width 300px + gap 24px (gap-6) ~= 324px
      const scrollAmount = 324;

      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <ChartSkeleton />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-red-400 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <p className="text-sm text-gray-300">
            Gagal memuat statistik gereja
          </p>
        </div>
      </div>
    );
  }

  // Don't render if no data
  if (!chartData.length) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 transition-colors">
          Statistik Gereja
        </h2>
        <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full" />
        <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto transition-colors">
          Gambaran umum data jemaat dan pelayanan GMIT Betlehem Oesapa Barat
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow Button */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:opacity-100"
          onClick={() => scroll("left")}
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
        </button>

        {/* Right Arrow Button */}
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:opacity-100"
          onClick={() => scroll("right")}
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for Firefox and IE/Edge
        >
          {chartData.map((chart, index) => (
            <div
              key={index}
              className="min-w-[300px] md:min-w-[350px] flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-md snap-center border border-gray-100 dark:border-gray-700 transition-colors"
            >
              <StatPieChart
                data={chart.data}
                size="small"
                title={chart.title}
              />
            </div>
          ))}
        </div>

        {/* Hide scrollbar for Webkit browsers */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
