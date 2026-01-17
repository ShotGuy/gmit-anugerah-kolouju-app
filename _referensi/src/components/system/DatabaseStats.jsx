import {
  BarChart3,
  Database,
  FileText,
  PieChart,
  Table,
  TrendingUp,
  Users,
} from "lucide-react";

const DatabaseStats = ({ databaseData }) => {
  if (!databaseData?.data) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">
          Data database tidak tersedia
        </p>
      </div>
    );
  }

  const { database, tables, usage } = databaseData.data;

  // Helper function to format numbers
  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  // Helper function to get percentage color
  const getPercentageColor = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 80) return "text-green-600";
    if (percent >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Database Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Jemaat
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(database?.totals?.jemaat)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {database?.percentages?.activeJemaat}% aktif
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Tables
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(tables?.summary?.totalTables)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatNumber(tables?.summary?.totalRecords)} records
          </p>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          Statistik Utama
        </h4>

        <div className="space-y-2">
          {/* Keluarga */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Keluarga
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(database?.totals?.keluarga)}
            </span>
          </div>

          {/* Rayon */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Rayon
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(database?.totals?.rayon)}
            </span>
          </div>

          {/* Majelis */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Majelis
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(database?.totals?.majelis)}
            </span>
          </div>

          {/* Users */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Users
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(database?.totals?.users)}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Status */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Status Aktivitas
        </h4>

        <div className="space-y-2">
          {/* Pengumuman Published */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Pengumuman Published
            </span>
            <div className="text-right">
              <span className="font-medium text-gray-900 dark:text-white">
                {formatNumber(database?.active?.pengumuman)}
              </span>
              <span
                className={`ml-2 text-xs ${getPercentageColor(
                  database?.percentages?.publishedPengumuman
                )}`}
              >
                ({database?.percentages?.publishedPengumuman}%)
              </span>
            </div>
          </div>

          {/* Dokumen Approved */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Dokumen Approved
            </span>
            <div className="text-right">
              <span className="font-medium text-gray-900 dark:text-white">
                {formatNumber(database?.active?.dokumen)}
              </span>
              <span
                className={`ml-2 text-xs ${getPercentageColor(
                  database?.percentages?.approvedDokumen
                )}`}
              >
                ({database?.percentages?.approvedDokumen}%)
              </span>
            </div>
          </div>

          {/* Jadwal Ibadah */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Jadwal Ibadah
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(database?.totals?.jadwalIbadah)}
            </span>
          </div>
        </div>
      </div>

      {/* Table Categories */}
      {tables?.master && tables?.operational && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <Table className="w-4 h-4 mr-2" />
            Kategori Tabel
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Master Data
                </span>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                  {tables.master.length}
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {formatNumber(
                  tables.master.reduce((sum, table) => sum + table.count, 0)
                )}{" "}
                records
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                  Operational
                </span>
                <span className="text-lg font-bold text-green-900 dark:text-green-200">
                  {tables.operational.length}
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {formatNumber(
                  tables.operational.reduce((sum, table) => sum + table.count, 0)
                )}{" "}
                records
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role Distribution */}
      {usage?.distributions?.roles && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <PieChart className="w-4 h-4 mr-2" />
            Distribusi Role
          </h4>

          <div className="space-y-2">
            {usage.distributions.roles.map((role, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {role.role}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(role.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          System Health
        </h4>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Status
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {usage?.systemHealth?.status || "Healthy"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Connection Pool
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {usage?.systemHealth?.connectionPool || "Active"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last Updated
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {databaseData.data.lastUpdated
                ? new Date(databaseData.data.lastUpdated).toLocaleTimeString("id-ID")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStats;