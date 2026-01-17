export function KeluargaEditFormSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* No. Bangunan */}
      <div>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* No. KK */}
      <div>
        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Rayon */}
      <div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Status Keluarga */}
      <div>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Status Kepemilikan Rumah */}
      <div>
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Keadaan Rumah */}
      <div>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function KeluargaEditButtonsSkeleton() {
  return (
    <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
      <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-3" />
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}
