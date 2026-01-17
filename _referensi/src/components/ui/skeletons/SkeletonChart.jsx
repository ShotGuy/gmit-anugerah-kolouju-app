export function ChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 animate-pulse">
      {/* Chart Title Skeleton */}
      <div className="w-3/4 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>

      {/* Pie Chart Circle Skeleton */}
      <div className="relative w-48 h-48 mb-6">
        <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="absolute inset-4 rounded-full bg-slate-800"></div>
      </div>

      {/* Legend Skeleton */}
      <div className="w-full space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
