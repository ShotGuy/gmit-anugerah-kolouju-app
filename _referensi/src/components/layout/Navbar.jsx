"use client";

import { ChevronRight, FileText, Home, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import SkeletonOrganisasiDropdown from "../ui/skeletons/SkeletonOrganisasiDropdown";

import { useAuth } from "@/contexts/AuthContext";
// import { supabase } from "@/lib/supabaseClient";

export default function Navbar({
  menuItems,
  uppItems = [],
  uppLoading = false,
}) {
  const authContext = useAuth();
  const { user, logout } = authContext || {};
  const router = useRouter();

  // Check if current route is a role-based dashboard page
  const isInDashboard =
    router.pathname.startsWith("/admin") ||
    router.pathname.startsWith("/jemaat") ||
    router.pathname.startsWith("/majelis") ||
    router.pathname.startsWith("/employee");

  return (
    <div className="hidden flex-none lg:block">
      <ul className="menu menu-horizontal items-center">
        {menuItems.map((item) => (
          <li key={item.name} className="flex items-center">
            <a
              className="flex items-center text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
              href={item.path}
            >
              {item.name}
            </a>
          </li>
        ))}
        {/* UPP Dropdown */}
        <li className="flex items-center">
          <details className="flex items-center">
            <summary className="btn btn-ghost flex items-center px-4 py-2 text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
              <FileText className="w-4 h-4 mr-2" />
              Organisasi
              {/* <ChevronDown className="w-4 h-4 ml-2" /> */}
            </summary>
            <ul className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-t-none p-2 dropdown-content right-0 mt-3 w-72 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 max-h-96 overflow-y-auto">
              {uppLoading ? (
                <SkeletonOrganisasiDropdown />
              ) : uppItems.length > 0 ? (
                uppItems.map((kategori) => (
                  <li key={kategori.id}>
                    {/* Category Header */}
                    <div className="font-semibold px-2 py-2 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                      <Link
                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        href={`/organisasi/${kategori.nama
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {kategori.nama}
                      </Link>
                    </div>

                    {/* Subcategories */}
                    {kategori.jenisPengumuman &&
                      kategori.jenisPengumuman.length > 0 && (
                        <ul className="ml-4 mb-2">
                          {kategori.jenisPengumuman.map((jenis) => (
                            <li key={jenis.id}>
                              <Link
                                className="flex items-center px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded"
                                href={`/organisasi/${kategori.nama
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}/${jenis.nama
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                              >
                                <ChevronRight className="w-3 h-3 mr-2" />
                                {jenis.nama}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </li>
                ))
              ) : (
                <li className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Tidak ada kategori tersedia</div>
                </li>
              )}
            </ul>
          </details>
        </li>
        {/* Profile Dropdown */}
        {/* Profile Dropdown */}
        {/* Profile Dropdown */}
        <li className="flex items-center">
          {user ? (
            <details className="relative">
              <summary className="btn btn-ghost btn-circle avatar flex items-center p-0 border-0">
                <div className="w-10 h- rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      alt="Profile"
                      className="w-full h-full object-cover"
                      src={user.avatar_url}
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </summary>

              <ul className="menu menu-sm absolute right-0 mt-3 z-[1000] w-60 md:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                {!isInDashboard && (
                  <li>
                    <Link
                      className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      href={
                        user?.role?.toLowerCase() === "pendeta"
                          ? "/admin/dashboard"
                          : `/${user?.role?.toLowerCase() || "admin"}/dashboard`
                      }
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Kembali ke Dashboard
                    </Link>
                  </li>
                )}

                <li>
                  <Link
                    className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    href={
                      user?.role?.toLowerCase() === "pendeta"
                        ? "/admin/profile"
                        : `/${user?.role?.toLowerCase() || "admin"}/profile`
                    }
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profil
                  </Link>
                </li>

                <li>
                  <a
                    className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 cursor-pointer"
                    onClick={async () => {
                      if (logout) {
                        await logout();
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </a>
                </li>
              </ul>
            </details>
          ) : (
            <Link
              className="border border-green-500 dark:border-green-400 rounded-full text-green-500 dark:text-green-400 hover:bg-green-500 dark:hover:bg-green-400 hover:text-white dark:hover:text-gray-900 px-4 py-1 font-bold flex items-center transition-all duration-200"
              href="/login"
            >
              Masuk
            </Link>
          )}
        </li>
      </ul>
    </div>
  );
}
