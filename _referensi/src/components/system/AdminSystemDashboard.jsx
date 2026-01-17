import { Database, HardDrive, Monitor } from "lucide-react";
import { useState } from "react";

import DatabaseInfo from "./DatabaseInfo";
import S3Browser from "./S3Browser";
import SystemInfo from "./SystemInfo";

const AdminSystemDashboard = () => {
  const [activeTab, setActiveTab] = useState("system");

  const tabs = [
    {
      id: "system",
      name: "System Info",
      icon: Monitor,
      component: SystemInfo,
    },
    {
      id: "database",
      name: "Database",
      icon: Database,
      component: DatabaseInfo,
    },
    {
      id: "storage",
      name: "S3 Storage",
      icon: HardDrive,
      component: S3Browser,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor dan kelola sistem, database, dan storage
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon
                  className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
};

export default AdminSystemDashboard;
