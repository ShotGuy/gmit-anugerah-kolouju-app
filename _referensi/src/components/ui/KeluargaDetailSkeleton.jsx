export function KeluargaInfoSkeleton() {
  return (
    <div className="space-y-4">
      {/* No. Bangunan */}
      <div>
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* No. KK */}
      <div>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Rayon */}
      <div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Status Keluarga */}
      <div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>

      {/* Status Kepemilikan Rumah */}
      <div>
        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
        <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>

      {/* Keadaan Rumah */}
      <div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>

      {/* Alamat */}
      <div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
        <div className="space-y-1">
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function KepalaKeluargaSkeleton() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {/* Nama */}
          <div className="flex items-center">
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
          </div>

          {/* Jenis Kelamin */}
          <div className="flex items-center">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
          </div>

          {/* Tanggal Lahir */}
          <div className="flex items-center">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
          </div>
        </div>

        <div className="space-y-3">
          {/* Pekerjaan */}
          <div className="flex items-center">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
          </div>

          {/* Pendidikan */}
          <div className="flex items-center">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
          </div>

          {/* No. HP */}
          <div className="flex items-center">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnggotaKeluargaSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* Nama */}
              <div className="flex items-center">
                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
              </div>

              {/* Status */}
              <div className="flex items-center">
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
              </div>

              {/* Jenis Kelamin */}
              <div className="flex items-center">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
              </div>

              {/* Tanggal Lahir */}
              <div className="flex items-center">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
              </div>
            </div>

            <div className="space-y-3">
              {/* Pekerjaan */}
              <div className="flex items-center">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
              </div>

              {/* Pendidikan */}
              <div className="flex items-center">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
              </div>

              {/* No. HP */}
              <div className="flex items-center">
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
              </div>

              {/* Status Nikah */}
              <div className="flex items-center">
                <div className="h-4 w-18 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-2" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
