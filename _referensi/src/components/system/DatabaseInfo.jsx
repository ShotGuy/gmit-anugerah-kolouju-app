import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  HardDrive,
  Network,
  RefreshCw,
  Table,
  Zap,
} from "lucide-react";

const DatabaseInfo = () => {
  // Fetch database information
  const {
    data: dbData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["database-info"],
    queryFn: async () => {
      const response = await fetch("/api/admin/database-info");

      if (!response.ok) {
        throw new Error("Failed to fetch database info");
      }

      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const getConnectionStatus = (current, max) => {
    const percentage = (current / max) * 100;

    if (percentage > 80) return { color: "text-red-600", status: "High" };
    if (percentage > 60) return { color: "text-yellow-600", status: "Medium" };

    return { color: "text-green-600", status: "Good" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Memuat informasi database...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 dark:text-red-400">
            Gagal memuat informasi database: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const connectionStatus = dbData?.data?.connections
    ? getConnectionStatus(
        dbData.data.connections.active,
        dbData.data.connections.max
      )
    : { color: "text-gray-600", status: "Unknown" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Informasi Database
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Status dan statistik database PostgreSQL
          </p>
        </div>
        <button
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Database Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Database Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Status Database
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-lg font-bold text-green-600">ONLINE</span>
              </div>
            </div>
            <Database className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Active Connections */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Koneksi Aktif
              </p>
              <p className={`text-2xl font-bold ${connectionStatus.color}`}>
                {dbData?.data?.connections?.active || 0}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  /{dbData?.data?.connections?.max || 0}
                </span>
              </p>
              <p className={`text-xs ${connectionStatus.color}`}>
                {connectionStatus.status}
              </p>
            </div>
            <Network className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Total Tables */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tabel
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dbData?.data?.tables?.count || 0}
              </p>
            </div>
            <Table className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* Database Size */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ukuran Database
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dbData?.data?.size ? formatBytes(dbData.data.size) : "N/A"}
              </p>
            </div>
            <HardDrive className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Network className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detail Koneksi
            </h3>
          </div>

          {dbData?.data?.connections && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Active</span>
                  <span>{dbData.data.connections.active}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(dbData.data.connections.active / dbData.data.connections.max) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Idle</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dbData.data.connections.idle || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Waiting</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dbData.data.connections.waiting || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Max Pool</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dbData.data.connections.max || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Min Pool</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dbData.data.connections.min || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Database Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performa Database
            </h3>
          </div>

          {dbData?.data?.performance && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Queries:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(dbData.data.performance.totalQueries || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Avg Query Time:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dbData.data.performance.avgQueryTime || 0}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Slow Queries:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(dbData.data.performance.slowQueries || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Cache Hit Ratio:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(dbData.data.performance.cacheHitRatio || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Table Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Table className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Statistik Tabel
            </h3>
          </div>

          {dbData?.data?.tables?.list && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {dbData.data.tables.list.map((table, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {table.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(table.rows || 0)} rows
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatBytes(table.size || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Konfigurasi Database
            </h3>
          </div>

          {dbData?.data?.config && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Version:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dbData.data.config.version}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Host:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dbData.data.config.host}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Port:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dbData.data.config.port}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Database:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dbData.data.config.database}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  SSL Mode:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dbData.data.config.sslMode || "disabled"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseInfo;
