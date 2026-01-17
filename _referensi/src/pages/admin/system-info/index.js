import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  MemoryStick,
  RefreshCw,
  Server,
} from "lucide-react";
import { useEffect, useState } from "react";

import DatabaseConnectionMonitor from "@/components/system/DatabaseConnectionMonitor";
import DatabaseStats from "@/components/system/DatabaseStats";
import SystemInfo from "@/components/system/SystemInfo";
import PageTitle from "@/components/ui/PageTitle";

export default function SystemInfoPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch system information
  const {
    data: systemData,
    isLoading: systemLoading,
    error: systemError,
    refetch: refetchSystem,
  } = useQuery({
    queryKey: ["system-info"],
    queryFn: async () => {
      const response = await fetch("/api/admin/system-info-test");

      if (!response.ok) {
        throw new Error("Failed to fetch system info");
      }

      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch database information
  const {
    data: databaseData,
    isLoading: databaseLoading,
    error: databaseError,
    refetch: refetchDatabase,
  } = useQuery({
    queryKey: ["system-database"],
    queryFn: async () => {
      const response = await fetch("/api/admin/system-database-test");

      if (!response.ok) {
        throw new Error("Failed to fetch database info");
      }

      return response.json();
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Fetch real-time database connection monitoring
  const {
    data: connectionData,
    isLoading: connectionLoading,
    error: connectionError,
    refetch: refetchConnection,
  } = useQuery({
    queryKey: ["database-connections"],
    queryFn: async () => {
      const response = await fetch("/api/admin/database-connections-test");

      if (!response.ok) {
        throw new Error("Failed to fetch connection info");
      }

      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch real-time metrics for frequent updates
  const {
    data: realTimeData,
    isLoading: realTimeLoading,
    error: realTimeError,
    refetch: refetchRealTime,
  } = useQuery({
    queryKey: ["database-realtime"],
    queryFn: async () => {
      const response = await fetch(
        "/api/admin/database-connections-test?type=realtime"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch real-time data");
      }

      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const handleRefreshAll = () => {
    refetchSystem();
    refetchDatabase();
    refetchConnection();
    refetchRealTime();
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const isLoading = systemLoading || databaseLoading || connectionLoading;
  const hasError = systemError || databaseError || connectionError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Memuat informasi sistem...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Informasi Sistem" />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="px-6 py-6">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex mb-4">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a
                    className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 md:ml-2"
                    href="/admin/dashboard"
                  >
                    Dashboard
                  </a>
                </li>
                <li className="inline-flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400 dark:text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                    Informasi Sistem
                  </span>
                </li>
              </ol>
            </nav>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Informasi Sistem
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Status dan statistik sistem server & database
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {currentTime.toLocaleString("id-ID")}
                </div>
                <button
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleRefreshAll}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {hasError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-700 dark:text-red-400 font-medium">
                  Gagal memuat beberapa informasi sistem
                </p>
                {systemError && (
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    Server: {systemError.message}
                  </p>
                )}
                {databaseError && (
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    Database: {databaseError.message}
                  </p>
                )}
                {connectionError && (
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    Connection: {connectionError.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status Server
                </p>
                <p
                  className={`text-2xl font-bold ${getStatusColor(
                    systemData?.data?.status || "unknown"
                  )}`}
                >
                  {systemData?.data?.status?.toUpperCase() || "UNKNOWN"}
                </p>
              </div>
              {getStatusIcon(systemData?.data?.status)}
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Records
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {databaseData?.data?.tables?.summary?.totalRecords?.toLocaleString() ||
                    "0"}
                </p>
              </div>
              <Database className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Uptime
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemData?.data?.uptime
                    ? formatUptime(systemData.data.uptime)
                    : "N/A"}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Node.js Version */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Node.js
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemData?.data?.nodeVersion || "N/A"}
                </p>
              </div>
              <Server className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Real-time Database Connection Monitor */}
        {(connectionData || realTimeData) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Database className="w-6 h-6 text-purple-600 mr-2" />
                  Real-time Database Monitoring
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Live
                  </span>
                </div>
              </div>
              <DatabaseConnectionMonitor
                connectionData={connectionData?.data}
                realTimeData={realTimeData?.data}
              />
            </div>
          </div>
        )}

        {/* System Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Server System Info */}
          {systemData && !systemError && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Server className="w-6 h-6 text-blue-600 mr-2" />
                  Informasi Server
                </h3>
                <SystemInfo
                  compact={true}
                  formatBytes={formatBytes}
                  formatUptime={formatUptime}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  systemData={systemData}
                />
              </div>
            </div>
          )}

          {/* Database Statistics */}
          {databaseData && !databaseError && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Database className="w-6 h-6 text-purple-600 mr-2" />
                  Statistik Database
                </h3>
                <DatabaseStats databaseData={databaseData} />
              </div>
            </div>
          )}
        </div>

        {/* Detailed System Information */}
        {systemData && !systemError && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Memory Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <MemoryStick className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Penggunaan Memori
                </h3>
              </div>

              {systemData?.data?.memory && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Used</span>
                      <span>{formatBytes(systemData.data.memory.used)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (systemData.data.memory.used /
                              systemData.data.memory.total) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatBytes(systemData.data.memory.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Free</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatBytes(
                          systemData.data.memory.total -
                            systemData.data.memory.used
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CPU Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Cpu className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Informasi CPU
                </h3>
              </div>

              {systemData?.data?.cpu && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Model:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%] truncate">
                      {systemData.data.cpu.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Cores:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {systemData.data.cpu.cores}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Usage:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {systemData.data.cpu.usage}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Environment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Server className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Environment
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Platform:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {systemData?.data?.platform || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Architecture:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {systemData?.data?.architecture || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Hostname:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {systemData?.data?.hostname || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
