import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  HardDrive,
  Link,
  Server,
  Timer,
  Users,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";

const DatabaseConnectionMonitor = ({ connectionData, realTimeData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!connectionData && !realTimeData) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">
          Data koneksi database tidak tersedia
        </p>
      </div>
    );
  }

  // Use real-time data if available, otherwise use full connection data
  const data = realTimeData || connectionData;

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
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

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
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

  return (
    <div className="space-y-6">
      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Supabase Health */}
        {/* Supabase Health - REMOVED */},

        {/* Prisma Health */}
        {(data.prismaHealth || data.prisma) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Prisma ORM
                </p>
                <p
                  className={`text-lg font-bold ${getStatusColor(
                    data.prismaHealth?.status || data.prisma?.status
                  )}`}
                >
                  {(data.prismaHealth?.status || data.prisma?.status)?.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {data.prismaHealth?.responseTime || data.prisma?.responseTime || 0}ms
                </p>
              </div>
              <Database className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        )}

        {/* Active Connections */}
        {data.connectionCounts && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Connections
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {data.connectionCounts.active}/{data.connectionCounts.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {data.connectionCounts.idle} idle
                </p>
              </div>
              <Link className="w-8 h-8 text-green-600" />
            </div>
          </div>
        )}

        {/* Performance */}
        {(data.performanceSnapshot || data.performance) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Query Time
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {data.performanceSnapshot?.queryTime || data.performance?.averageResponseTime || 0}ms
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(data.performanceSnapshot?.status || data.performance?.queries?.simple?.status) === 'success' ? 'Healthy' : 'Error'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        )}
      </div>

      {/* Detailed Connection Information */}
      {connectionData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supabase Details - REMOVED */},

          {/* Prisma Details */}
          {connectionData.prisma && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Prisma Connection
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(connectionData.prisma.status)}
                    <span className={`font-medium ${getStatusColor(connectionData.prisma.status)}`}>
                      {connectionData.prisma.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Database:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {connectionData.prisma.database}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Host:</span>
                  <span className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                    {connectionData.prisma.host}:{connectionData.prisma.port}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">SSL:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {connectionData.prisma.ssl ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {connectionData.prisma.responseTime}ms
                  </span>
                </div>

                {/* Connection Pool */}
                {connectionData.prisma.pooling && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-2">Connection Pool:</span>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span className="text-green-600 dark:text-green-400">
                          {connectionData.prisma.pooling.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max Connections:</span>
                        <span>{connectionData.prisma.pooling.maxConnections}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Server Statistics */}
      {connectionData?.serverStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Database Size */}
          {connectionData.serverStats.size && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <HardDrive className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Database Size
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Database:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {connectionData.serverStats.size.database_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Size:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {connectionData.serverStats.size.database_size}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PostgreSQL Version */}
          {connectionData.serverStats.version && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Server className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  PostgreSQL
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Version:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    PostgreSQL 17.6
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.floor(connectionData.serverStats.version.uptime_seconds / 86400)}d {Math.floor((connectionData.serverStats.version.uptime_seconds % 86400) / 3600)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Started:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {new Date(connectionData.serverStats.version.server_start_time).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Table Statistics */}
          {connectionData.serverStats.tables && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Table Activity
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Tables:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {connectionData.serverStats.tables.total_tables}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Inserts:</span>
                  <span className="font-medium text-green-600">
                    {parseInt(connectionData.serverStats.tables.total_inserts).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Updates:</span>
                  <span className="font-medium text-blue-600">
                    {parseInt(connectionData.serverStats.tables.total_updates).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deletes:</span>
                  <span className="font-medium text-red-600">
                    {parseInt(connectionData.serverStats.tables.total_deletes).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics */}
      {connectionData?.performance && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Timer className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Metrics
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(connectionData.performance.queries).map(([queryType, result]) => (
              <div key={queryType} className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-2">
                  {queryType} Query
                </h4>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.executionTime}ms
                  </span>
                  {getStatusIcon(result.status)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average Response Time: <span className="font-medium">{connectionData.performance.averageResponseTime}ms</span>
            </p>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Last updated: {currentTime.toLocaleString('id-ID')}
        {data.timestamp && (
          <span className="ml-2">
            | Data from: {new Date(data.timestamp).toLocaleTimeString('id-ID')}
          </span>
        )}
      </div>
    </div>
  );
};

export default DatabaseConnectionMonitor;