import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import publicStatisticsService from "../../../services/publicStatisticsService";

import StatPieChart from "./statPieChart";

export default function ChurchStatisticsHorizontal() {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Calculate how many slides we have (showing 1 chart per slide)
  const chartsPerSlide = 1;
  const totalSlides = Math.ceil(chartData.length / chartsPerSlide);

  // Auto-rotation effect (only create interval when we have data)
  useState(() => {
    if (totalSlides > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
      }, 10000);
      return () => clearInterval(interval);
    }
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="block md:hidden w-full bg-slate-800 dark:bg-gray-900 p-4 py-6 overflow-hidden transition-colors duration-300">
        <div className="flex flex-col h-80 items-center justify-center">
          <div className="loading loading-spinner loading-lg text-blue-400" />
          <p className="mt-4 text-sm text-gray-300 dark:text-gray-200">Memuat statistik...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="block md:hidden w-full bg-slate-800 dark:bg-gray-900 p-4 py-6 overflow-hidden transition-colors duration-300">
        <div className="flex flex-col h-80 items-center justify-center">
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
            <p className="text-sm text-gray-300 dark:text-gray-200">Gagal memuat statistik gereja</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no data
  if (!chartData.length) {
    return null;
  }

  return (
    <div className="block md:hidden w-full bg-base-300 dark:bg-gray-800 p-4 py-6 overflow-hidden transition-colors duration-300">
      <div className="flex flex-col h-80">
        {/* Chart container that takes most of the height */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          <div
            className="transition-transform duration-500 ease-in-out h-full flex"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {Array.from({ length: totalSlides }, (_, slideIndex) => {
              const startIdx = slideIndex * chartsPerSlide;
              const endIdx = startIdx + chartsPerSlide;
              const slideCharts = chartData.slice(startIdx, endIdx);

              return (
                <div
                  key={slideIndex}
                  className="h-full w-full flex-shrink-0 flex justify-center items-center px-4"
                >
                  {slideCharts.map((chart, chartIndex) => (
                    <div
                      key={`${slideIndex}-${chartIndex}`}
                      className="w-full max-w-xs h-full"
                    >
                      <StatPieChart
                        data={chart.data}
                        size="small"
                        title={chart.title}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicators at bottom */}
        {totalSlides > 1 && (
          <div className="flex justify-center space-x-2 py-3">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  index === currentIndex ? "bg-primary" : "bg-gray-400 dark:bg-gray-500"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
