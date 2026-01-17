import { ChevronDown, ChevronRight, Home, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
// import { supabase } from "@/lib/supabaseClient";

export default function Sidebar({
  menuItems,
  uppItems = [],
  uppLoading = false,
}) {
  const router = useRouter();
  const authContext = useAuth();
  const { user, logout } = authContext || {};

  // State to manage dropdown open/close for each UPP category
  const [openDropdowns, setOpenDropdowns] = useState({});

  // State to manage main UPP section dropdown
  const [isUppOpen, setIsUppOpen] = useState(false);

  // Check if current route is a role-based dashboard page
  const isInDashboard =
    router.pathname.startsWith("/admin") ||
    router.pathname.startsWith("/jemaat") ||
    router.pathname.startsWith("/majelis") ||
    router.pathname.startsWith("/employee");

  // Function to close the sidebar
  const closeSidebar = () => {
    const drawerToggle = document.getElementById("my-drawer-3");

    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  };

  // Function to toggle dropdown for specific category
  const toggleDropdown = (categoryId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleLogout = async () => {
    // Close sidebar first
    closeSidebar();

    if (logout) {
      await logout();
    }
  };

  return (
    <div className="drawer-side z-[60]">
      <label
        aria-label="close sidebar"
        className="drawer-overlay"
        htmlFor="my-drawer-3"
      />
      <nav className="bg-white dark:bg-gray-800 min-h-full w-80 shadow-lg transition-colors duration-300 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="text-gray-900 dark:text-white">
            <h1 className="text-xl font-bold leading-tight">GMIT Betlehem</h1>
            <h2 className="text-xl font-bold leading-tight">Oesapa Barat</h2>
          </div>
        </div>

        {/* Scrollable Navigation Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-4 space-y-4">
            {/* Main Menu Items */}
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                  href={item.path}
                  onClick={closeSidebar}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* UPP Section */}
            <div className="space-y-2">
              <button
                onClick={() => setIsUppOpen(!isUppOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <span>Organisasi</span>
                {isUppOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>

              {/* UPP Content - only show when dropdown is open */}
              {isUppOpen && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  {uppLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Memuat...
                        </span>
                      </div>
                    </div>
                  ) : uppItems.length > 0 ? (
                    <div className="space-y-0.5">
                      {uppItems.map((kategori) => (
                        <div key={kategori.id} className="space-y-0.5">
                          {/* Category Header with Toggle */}
                          <div className="flex items-center">
                            <Link
                              className="flex-1 flex items-center px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-200 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                              href={`/organisasi/${kategori.nama.toLowerCase().replace(/\s+/g, "-")}`}
                              onClick={closeSidebar}
                            >
                              {kategori.nama}
                            </Link>
                            {/* Toggle Button - only show if there are subcategories */}
                            {kategori.jenisPengumuman && kategori.jenisPengumuman.length > 0 && (
                              <button
                                onClick={() => toggleDropdown(kategori.id)}
                                className="p-1 ml-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                aria-label={`Toggle ${kategori.nama} dropdown`}
                              >
                                {openDropdowns[kategori.id] ? (
                                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Subcategories - only show when dropdown is open */}
                          {kategori.jenisPengumuman &&
                            kategori.jenisPengumuman.length > 0 &&
                            openDropdowns[kategori.id] && (
                              <div className="ml-8 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                                {kategori.jenisPengumuman.map((jenis) => (
                                  <Link
                                    key={jenis.id}
                                    className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
                                    href={`/organisasi/${kategori.nama.toLowerCase().replace(/\s+/g, "-")}/${jenis.nama.toLowerCase().replace(/\s+/g, "-")}`}
                                    onClick={closeSidebar}
                                  >
                                    {jenis.nama}
                                  </Link>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <div className="text-gray-400 dark:text-gray-500">
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                          />
                        </svg>
                        <p className="text-xs font-medium">
                          Tidak ada kategori tersedia
                        </p>
                        <p className="text-xs mt-0.5 opacity-75">
                          Kategori akan muncul di sini ketika ditambahkan
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Login/User Section at Bottom - Fixed */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          {user ? (
            <div className="space-y-2">
              {/* User Profile Section */}
              <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-md">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3 flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      alt="Profile"
                      className="w-full h-full object-cover"
                      src={user.avatar_url}
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {user.nama || user.email || user.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.role?.toLowerCase() || "Member"}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                {!isInDashboard && (
                  <Link
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    href={`/${user?.role?.toLowerCase() || "admin"}/dashboard`}
                    onClick={closeSidebar}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dasbor
                  </Link>
                )}

                <Link
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                  href={`/${user?.role?.toLowerCase() || "admin"}/profile`}
                  onClick={closeSidebar}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </Link>

                <button
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </button>
              </div>
            </div>
          ) : (
            <Link
              className="flex items-center justify-center bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 transition-all duration-200 px-4 py-2 rounded-md font-medium"
              href="/login"
              onClick={closeSidebar}
            >
              <User className="w-4 h-4 mr-2" />
              Masuk
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
