
export default function SkeletonOrganisasiDropdown() {
  return (
    <ul className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-t-none p-2 dropdown-content right-0 mt-3 w-60 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 max-h-96  animate-pulse">
      {[...Array(4)].map((_, i) => (
        <li key={i} className="mb-2">
          {/* Skeleton kategori header */}
          <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
          </div>

          {/* Skeleton subkategori */}
          <ul className="ml-4 mt-2 space-y-1">
            {[...Array(3)].map((_, j) => (
              <li key={j}>
                <div className="flex items-center space-x-2 px-2 py-1">
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
