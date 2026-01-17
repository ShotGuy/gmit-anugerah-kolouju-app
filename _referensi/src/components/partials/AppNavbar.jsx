import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  Globe,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import CommandPalette from "@/components/CommandPalette";
import HeaderDateTimeWidget from "../HeaderDateTimeWidget";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { getRoleConfig } from "@/config/navigationItem";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/hooks/useUser";

export default function AppNavbar({
  role = "admin",
  sidebarOpen,
  setSidebarOpen,
  userInfo = null,
  isCollapsed = false,
  setIsCollapsed,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const { user: authUser } = useUser();
  const config = getRoleConfig(
    authUser ? authUser.role.toLowerCase() : role.toLowerCase(),
    authUser
  );
  const LogoIcon = config.logoIcon;
  // console.log(authUser)

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Use real user data, fallback to provided userInfo, then config default
  const currentUser = authUser || userInfo || config.userInfo;

  const isActiveRoute = (href) => {
    return router.pathname === href;
  };

  const isParentActive = (item) => {
    if (isActiveRoute(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isActiveRoute(child.href));
    }

    return false;
  };

  const toggleSubmenu = (href) => {
    setExpandedMenus((prev) => {
      // If the clicked menu is already open, close it (empty object or remove specific key)
      if (prev[href]) {
        return {};
      }
      // Otherwise, close all others and open only this one
      return { [href]: true };
    });
  };

  // Tooltip component for collapsed sidebar
  const Tooltip = ({ children, content, show }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });
    const triggerRef = useRef(null);
    const timeoutRef = useRef(null);

    if (!show || !isCollapsed) return children;

    const handleMouseEnter = () => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();

        setTooltipPosition({
          top: rect.top + rect.height / 2,
        });
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      // Add small delay to prevent flickering
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 150);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <>
        <div
          ref={triggerRef}
          className="w-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </div>

        {isVisible && (
          <div
            className="fixed left-20 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-md whitespace-nowrap pointer-events-none shadow-lg transition-all duration-200 opacity-100"
            style={{
              top: tooltipPosition.top,
              transform: "translateY(-50%)",
              zIndex: 10000,
            }}
          >
            {content}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-100" />
          </div>
        )}
      </>
    );
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const IconComponent = item.icon;
    const isActive = isActiveRoute(item.href);
    const isParentActiveState = isParentActive(item);
    const isExpanded = expandedMenus[item.href];

    if (hasChildren) {
      return (
        <li key={item.href}>
          {/* Parent Menu Item */}
          <Tooltip content={item.label} show={isCollapsed}>
            <div
              className={`
                flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer group
                ${isParentActiveState
                  ? "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-900/20 text-blue-700 dark:text-blue-200 shadow-sm"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-gray-700/50 dark:hover:to-gray-700/20"
                }
              `}
              onClick={() => !isCollapsed && toggleSubmenu(item.href)}
            >
              <div
                className={`flex items-center ${isCollapsed ? "justify-center w-full" : ""}`}
              >
                <div
                  className={`p-2 rounded-md transition-all duration-200 ${isParentActiveState
                    ? "bg-blue-600/10 dark:bg-blue-600/20"
                    : "bg-gray-200 dark:bg-gray-600 group-hover:bg-blue-200/50 dark:group-hover:bg-blue-600/30"
                    }`}
                >
                  <IconComponent
                    className={`
                      w-5 h-5 transition-colors duration-200
                      ${isParentActiveState
                        ? "text-blue-600 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      }
                    `}
                  />
                </div>
                {!isCollapsed && <span className="ml-2">{item.label}</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                    } ${isParentActiveState
                      ? "text-blue-600 dark:text-blue-300"
                      : "text-gray-400 dark:text-gray-500"
                    }`}
                />
              )}
            </div>
          </Tooltip>

          {/* Submenu Items */}
          {isExpanded && !isCollapsed && (
            <ul className="ml-2 mt-1.5 space-y-0.5">
              {item.children.map((child) => {
                const ChildIconComponent = child.icon;
                const isChildActive = isActiveRoute(child.href);

                return (
                  <li key={child.href}>
                    <Link
                      className={`
                        flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 group relative
                        ${isChildActive
                          ? "bg-blue-600/10 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 font-medium"
                          : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                        }
                      `}
                      href={child.href}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {isChildActive && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-500 rounded-r" />
                      )}
                      <ChildIconComponent
                        className={`
                          w-4 h-4 mr-2.5 transition-colors duration-200
                          ${isChildActive
                            ? "text-blue-600 dark:text-blue-300"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          }
                        `}
                      />
                      <span className="truncate">{child.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    // Regular menu item without children
    return (
      <li key={item.href}>
        <Tooltip content={item.label} show={isCollapsed}>
          <Link
            className={`
              flex items-center ${isCollapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 group relative
              ${isActive
                ? "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-900/20 text-blue-700 dark:text-blue-200 shadow-sm"
                : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-gray-700/50 dark:hover:to-gray-700/20"
              }
            `}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
          >
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-400/5 dark:from-blue-600/10 dark:to-blue-400/10 rounded-lg " />
            )}
            <div
              className={`p-2 rounded-md transition-all duration-200 relative z-10 ${isActive
                ? "bg-blue-600/10 dark:bg-blue-600/20"
                : "bg-gray-200 dark:bg-gray-600 group-hover:bg-blue-200/50 dark:group-hover:bg-blue-600/30"
                }`}
            >
              <IconComponent
                className={`
                  w-5 h-5 transition-colors duration-200
                  ${isActive
                    ? "text-blue-600 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }
                `}
              />
            </div>
            {!isCollapsed && (
              <span className="ml-2 relative z-10">{item.label}</span>
            )}
          </Link>
        </Tooltip>
      </li>
    );
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30 top-0 transition-colors duration-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              {/* Mobile/Desktop sidebar toggle */}
              <button
                className="inline-flex items-center p-2 text-sm text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-colors duration-200"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo - Hidden on larger screens when sidebar is visible */}
              <Link
                className="flex ml-2 lg:hidden"
                href={config.dashboardRoute}
              >
                <span className="self-center text-xl font-semibold whitespace-nowrap text-blue-600 dark:text-blue-400">
                  {config.fullTitle}
                </span>
              </Link>

              {/* DateTime Widget - Adjust margin based on sidebar state */}
              <div
                className={`hidden md:block ml-4 transition-all duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-60"}`}
              >
                <HeaderDateTimeWidget />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Command Palette Button */}
              <button
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-colors duration-200"
                onClick={() => setIsCommandPaletteOpen(true)}
                title="Tekan Ctrl+K untuk membuka pencarian"
              >
                <Command className="w-4 h-4" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Ctrl+K
                </span>
              </button>

              {/* View Public Website Button */}
              <Link
                className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-colors duration-200"
                href="/"
                rel="noopener noreferrer"
                target="_blank"
                title="Lihat Website Public"
              >
                <Globe className="w-5 h-5" />
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              {/* <button className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button> */}

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <button
                  className="flex items-center text-sm bg-gray-800 dark:bg-gray-600 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-500 transition-colors duration-200"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 transition-colors duration-200">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                      <div className="font-medium">{currentUser.name}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {currentUser.email}
                      </div>
                    </div>
                    {/* <Link
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      href={config.dashboardRoute}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Kembali ke Dashboard
                    </Link> */}
                    <Link
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      href={`${config.baseRoute}/profile`}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profil
                    </Link>
                    {/* <Link
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      href={`${config.baseRoute}/settings`}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Pengaturan
                    </Link> */}
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden bg-black/25 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-40 ${isCollapsed ? "w-16" : "w-64"} h-screen pt-2 transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="h-full px-3 overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 custom-scrollbar transition-colors duration-300 flex flex-col">
          {/* Sidebar Header */}
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-4 rounded-lg transition-all duration-300 ${isCollapsed
              ? ""
              : "bg-gradient-to-r from-blue-500/5 to-blue-600/5 dark:from-blue-600/10 dark:to-blue-700/10 border border-blue-100 dark:border-blue-900/30 mb-2"
              }`}
          >
            <Link
              className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}
              href={config.dashboardRoute}
            >
              <Tooltip content={config.fullTitle} show={isCollapsed}>
                <div
                  className={`w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md ${isCollapsed ? "" : "mr-3"} transition-all duration-200`}
                >
                  <LogoIcon className="w-5 h-5 text-white" />
                </div>
              </Tooltip>
              {!isCollapsed && (
                <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent transition-colors duration-300">
                  {config.fullTitle}
                </span>
              )}
            </Link>

            {!isCollapsed && (
              <>
                {/* Collapse button for desktop */}
                <button
                  className="hidden lg:block p-1.5 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setIsCollapsed(true)}
                  title="Simpan sidebar"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Close button for mobile */}
                <button
                  className="lg:hidden p-1.5 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setSidebarOpen(false)}
                  title="Tutup sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Expand button when collapsed */}
            {isCollapsed && (
              <button
                className="hidden lg:block absolute top-4 left-12 p-1.5 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setIsCollapsed(false)}
                title="Perluas sidebar"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="mt-2 flex-1">
            <ul className="space-y-1">
              {config.navigation.map((item) => renderMenuItem(item))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/20 transition-all duration-300">
            {isCollapsed ? (
              <Tooltip
                content={`${currentUser.name} - ${currentUser.organization}`}
                show={isCollapsed}
              >
                <div className="flex justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md transition-all duration-200">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-200">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentUser.organization}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        userRole={authUser?.role}
      />
    </>
  );
}
