import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Server,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const SystemInfo = ({
  systemData = null,
  formatUptime = null,
  formatBytes = null,
  getStatusColor = null,
  getStatusIcon = null,
  compact = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Only use internal query if no external systemData is provided
  const {
    data: internalSystemData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["system-info"],
    queryFn: async () => {
      const response = await fetch("/api/admin/system-info");

      if (!response.ok) {
        throw new Error("Failed to fetch system info");
      }

      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !systemData, // Only run if no external data
  });

  // Use provided data or internal data
  const activeSystemData = systemData || internalSystemData;

  // Use provided helper functions or define defaults
  const formatUptimeHelper = formatUptime || ((seconds) => {
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
  });

  const formatBytesHelper = formatBytes || ((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  });

  const getStatusColorHelper = getStatusColor || ((status) => {
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
  });

  const getStatusIconHelper = getStatusIcon || ((status) => {
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
  });

  // Only show loading/error states if using internal data and in compact mode
  if (!systemData && isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Memuat informasi sistem...
        </span>
      </div>
    );
  }

  if (!systemData && error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 dark:text-red-400">
            Gagal memuat informasi sistem: {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if no data available
  if (!activeSystemData?.data) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">
          Data sistem tidak tersedia
        </p>
      </div>
    );
  }

  // If compact mode, return simplified view
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Basic System Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Platform:</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {activeSystemData.data.platform}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Architecture:</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {activeSystemData.data.architecture}
            </p>
          </div>
        </div>

        {/* Memory Usage */}
        {activeSystemData.data.memory && (
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage:</span>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(activeSystemData.data.memory.used / activeSystemData.data.memory.total) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{formatBytesHelper(activeSystemData.data.memory.used)}</span>
                <span>{formatBytesHelper(activeSystemData.data.memory.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* CPU Info */}
        {activeSystemData.data.cpu && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">CPU Cores:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {activeSystemData.data.cpu.cores}
            </span>
          </div>
        )}

        {/* Load Average */}
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Load Average:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {activeSystemData.data.loadAverage || "N/A"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Informasi Sistem
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Status dan statistik sistem server
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 inline mr-1" />
            {currentTime.toLocaleString("id-ID")}
          </div>
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Status Sistem
              </p>
              <p
                className={`text-2xl font-bold ${getStatusColorHelper(activeSystemData?.data?.status || "unknown")}`}
              >
                {activeSystemData?.data?.status?.toUpperCase() || "UNKNOWN"}
              </p>
            </div>
            {getStatusIconHelper(activeSystemData?.data?.status)}
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
                {activeSystemData?.data?.uptime
                  ? formatUptimeHelper(activeSystemData.data.uptime)
                  : "N/A"}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Active Connections */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Koneksi Aktif
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeSystemData?.data?.connections || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
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
                {activeSystemData?.data?.nodeVersion || "N/A"}
              </p>
            </div>
            <Server className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Detailed System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <MemoryStick className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Penggunaan Memori
            </h3>
          </div>

          {activeSystemData?.data?.memory && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Used</span>
                  <span>{formatBytesHelper(activeSystemData.data.memory.used)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(activeSystemData.data.memory.used / activeSystemData.data.memory.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatBytesHelper(activeSystemData.data.memory.total)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Free</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatBytesHelper(activeSystemData.data.memory.total - activeSystemData.data.memory.used)}
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

          {activeSystemData?.data?.cpu && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Model:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {activeSystemData.data.cpu.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cores:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {activeSystemData.data.cpu.cores}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Usage:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {activeSystemData.data.cpu.usage}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Disk Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <HardDrive className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Penggunaan Disk
            </h3>
          </div>

          {activeSystemData?.data?.disk && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Used</span>
                  <span>{formatBytesHelper(activeSystemData.data.disk.used)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${(activeSystemData.data.disk.used / activeSystemData.data.disk.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatBytesHelper(activeSystemData.data.disk.total)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Free</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatBytesHelper(activeSystemData.data.disk.free)}
                  </p>
                </div>
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
                {activeSystemData?.data?.platform || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Architecture:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {activeSystemData?.data?.architecture || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Hostname:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {activeSystemData?.data?.hostname || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
