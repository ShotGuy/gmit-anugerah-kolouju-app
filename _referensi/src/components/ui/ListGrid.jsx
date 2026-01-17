import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import ExportModal from "./ExportModal";
import PageTitle from "./PageTitle";
import { GridSkeleton } from "./skeletons/SkeletonGrid";
import { TableSkeleton } from "./skeletons/SkeletonTable";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import ButtonActions from "@/components/ui/ButtonActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

// Skeleton Components

// Integrated PageHeader Component
function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  stats,
  className = "",
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 ${className}`}
    >
      <div className="max-w-7xl mx-2 px-6 py-6">
        {/* Breadcrumb */}
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="flex mb-4">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumb.map((item, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
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
                  )}
                  {item.href ? (
                    <a
                      className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 md:ml-2"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 transition-colors duration-200 sm:text-3xl break-words">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="mt-4 flex space-x-3 lg:mt-0 lg:ml-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  className={action.className}
                  href={action.href}
                  size={action.size || "default"}
                  variant={action.variant || "default"}
                  onClick={action.onClick}
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    {stat.icon && (
                      <div
                        className={`flex-shrink-0 p-2 rounded-lg ${
                          stat.iconBg || "bg-blue-100 dark:bg-blue-900"
                        }`}
                      >
                        <stat.icon
                          className={`w-5 h-5 ${
                            stat.iconColor || "text-blue-600 dark:text-blue-400"
                          }`}
                        />
                      </div>
                    )}
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        {stat.label}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                        {stat.value}
                      </p>
                      {stat.change && (
                        <p
                          className={`text-sm ${
                            stat.changeType === "positive"
                              ? "text-green-600"
                              : stat.changeType === "negative"
                                ? "text-red-600"
                                : "text-gray-500"
                          }`}
                        >
                          {stat.change}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main ListGrid Component
export default function ListGrid({
  // Page Header Props
  title,
  description,
  breadcrumb,
  stats,
  headerActions = [],

  // Data Props
  data = [],
  columns = [],

  // Row Actions Props - Using ButtonActions component
  rowActions = [],
  rowActionType = "vertical", // "vertical" | "horizontal"
  maxVisibleActions = 3,

  // Filter & Search Props
  filters = [],
  customFilterFunction,
  customSearchFunction,
  customSortFunction,
  disableSorting = false,
  searchable = true,
  searchPlaceholder = "Cari data...",

  // Export Props
  exportable = false,
  exportFilename,
  exportColumns = null,

  // Legacy action handlers (for backward compatibility)
  onAdd,
  onView,
  onEdit,
  onDelete,
  onExport,

  // Pagination Props
  itemsPerPage = 10,
  showPageSizeSelector = true,
  pageSizeOptions = [5, 10, 25, 50, 100],

  // Loading State
  isLoading = false,

  // Style Props
  className = "",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [viewMode, setViewMode] = useState("table"); // table or grid
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showExportModal, setShowExportModal] = useState(false);
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    // Check on mount
    checkIsMobile();

    // Add event listener
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Auto-switch to grid view on mobile/tablet
  useEffect(() => {
    if (isMobile && viewMode === "table") {
      setViewMode("grid");
    }
  }, [isMobile, viewMode]);

  // Merge legacy actions with new rowActions array for backward compatibility
  const allRowActions = [
    ...rowActions,
    ...(onView
      ? [{ label: "Lihat", icon: Eye, onClick: onView, variant: "outline" }]
      : []),
    ...(onEdit
      ? [{ label: "Edit", icon: Edit, onClick: onEdit, variant: "outline" }]
      : []),
    ...(onDelete
      ? [
          {
            label: "Hapus",
            icon: Trash2,
            onClick: onDelete,
            variant: "destructive",
          },
        ]
      : []),
  ];

  // Handle export functionality
  const handleExport = () => {
    if (onExport) {
      // Use legacy export if provided
      onExport();
    } else {
      // Use new export modal
      setShowExportModal(true);
    }
  };

  // Merge header actions with legacy actions
  const allHeaderActions = [
    ...headerActions,
    ...(exportable || onExport
      ? [
          {
            label: "Export",
            icon: Download,
            onClick: handleExport,
            variant: "outline",
          },
        ]
      : []),
    ...(onAdd ? [{ label: "Tambah", icon: Plus, onClick: onAdd }] : []),
  ];

  // Sorting function
  const sortData = (data, sortConfig) => {
    if (!sortConfig.key) {
      // No default sorting - return data as-is from backend
      return data;
    }

    // Use custom sort function if provided
    if (customSortFunction) {
      return customSortFunction(data, sortConfig);
    }

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;

      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal)
          .toLowerCase()
          .localeCompare(String(bVal).toLowerCase());
      }

      return sortConfig.direction === "desc" ? -comparison : comparison;
    });
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Filter and search data
  const filteredData = data.filter((item) => {
    // Search filter - use custom search function if provided
    const matchesSearch = customSearchFunction
      ? customSearchFunction(item, searchTerm)
      : !searchable ||
        !searchTerm ||
        columns.some((col) =>
          String(item[col.key] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );

    // Additional filters - use custom filter function if provided
    const matchesFilters = customFilterFunction
      ? customFilterFunction(item, selectedFilters)
      : Object.entries(selectedFilters).every(([filterKey, filterValue]) => {
          if (!filterValue || filterValue === "all") return true;

          return item[filterKey] === filterValue;
        });

    return matchesSearch && matchesFilters;
  });

  // Sort the filtered data
  const sortedData = disableSorting
    ? filteredData
    : sortData(filteredData, sortConfig);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setCurrentPage(1);
  };

  const renderCellContent = (item, column) => {
    const value = item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === "badge") {
      const variant = column.badgeVariant
        ? column.badgeVariant(value)
        : "default";

      return <Badge variant={variant}>{value}</Badge>;
    }

    if (column.type === "boolean") {
      // return value ? "Aktif" : "Tidak Aktif";
      return (
        <Badge variant={value === true ? "success" : "danger"}>
          {value === true ? "Aktif" : "Tidak Aktif"}
        </Badge>
      );
    }

    if (column.type === "date") {
      return new Date(value).toLocaleDateString("id-ID");
    }

    if (column.type === "currency") {
      return `Rp ${Number(value).toLocaleString("id-ID")}`;
    }

    return value;
  };

  return (
    <div
      className={`space-y-6 p-4 transition-colors duration-200 ${className}`}
    >
      {/* Integrated Page Header */}
      {(title ||
        description ||
        breadcrumb ||
        stats ||
        allHeaderActions.length > 0) && (
        <PageHeader
          actions={allHeaderActions}
          breadcrumb={breadcrumb}
          description={description}
          stats={stats}
          title={title}
        />
      )}

      {/*  i make a condition here if the title is exist. used */}
      {title && <PageTitle title={title} />}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col lg:flex-row gap-4 items-center flex-1">
              {/* Search */}
              {searchable && (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <input
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    placeholder={searchPlaceholder}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              {/* Filters */}
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    value={selectedFilters[filter.key] || "all"}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                  >
                    <option value="all">{filter.label}</option>
                    {filter.options.map((option, optIndex) => (
                      <option key={optIndex} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Page Size Selector */}
              {showPageSizeSelector && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Show:
                  </span>
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* View Mode Toggle - Hide on mobile/tablet */}
              {!isMobile && (
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-200">
                  <button
                    className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                      viewMode === "table"
                        ? "bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    }`}
                    onClick={() => setViewMode("table")}
                  >
                    Tabel
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    Grid
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            {title} {!isLoading && `(${sortedData.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            viewMode === "table" ? (
              <TableSkeleton columns={columns.length} rows={5} />
            ) : (
              <GridSkeleton cards={6} />
            )
          ) : viewMode === "table" ? (
            /* Table View */
            <div className="overflow-x-auto overflow-y-visible relative">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={`text-left p-4 font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200 ${
                          !disableSorting && column.sortable !== false
                            ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 select-none"
                            : ""
                        }`}
                        onClick={
                          !disableSorting && column.sortable !== false
                            ? () => handleSort(column.key)
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {!disableSorting && column.sortable !== false && (
                            <div className="flex flex-col">
                              <ChevronUp
                                className={`h-3 w-3 transition-colors duration-200 ${
                                  sortConfig.key === column.key &&
                                  sortConfig.direction === "asc"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                              <ChevronDown
                                className={`h-3 w-3 -mt-1 transition-colors duration-200 ${
                                  sortConfig.key === column.key &&
                                  sortConfig.direction === "desc"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                    {allRowActions.length > 0 && (
                      <th className="text-left p-4 font-medium text-gray-600 w-24">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="p-4 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                        >
                          {renderCellContent(item, column)}
                        </td>
                      ))}
                      {allRowActions.length > 0 && (
                        <td className="p-4 relative w-24">
                          <div className="flex justify-center">
                            <ButtonActions
                              actions={allRowActions}
                              item={item}
                              maxVisible={maxVisibleActions}
                              type={rowActionType}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div
              className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
            >
              {paginatedData.map((item, index) => (
                <Card
                  key={index}
                  className="hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <CardContent className="p-4 space-y-3">
                    {columns
                      .slice(0, isMobile ? 3 : 4)
                      .map((column, colIndex) => (
                        <div key={colIndex} className="space-y-1">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200 block">
                            {column.label}:
                          </span>
                          <div className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200 break-words">
                            {renderCellContent(item, column)}
                          </div>
                        </div>
                      ))}
                    {allRowActions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <ButtonActions
                          actions={allRowActions}
                          item={item}
                          maxVisible={isMobile ? 2 : maxVisibleActions}
                          type={isMobile ? "horizontal" : rowActionType}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && paginatedData.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Tidak ada data yang ditemukan
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-6">
              {/* Mobile pagination */}
              {isMobile ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    Halaman {currentPage} dari {totalPages} ({sortedData.length}{" "}
                    data)
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      disabled={currentPage === 1}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      ←
                    </Button>
                    <Button
                      className="min-w-[60px]"
                      size="sm"
                      variant="outline"
                    >
                      {currentPage}
                    </Button>
                    <Button
                      disabled={currentPage === totalPages}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    >
                      →
                    </Button>
                  </div>
                </div>
              ) : (
                /* Desktop pagination */
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    Menampilkan {startIndex + 1} hingga{" "}
                    {Math.min(startIndex + pageSize, sortedData.length)} dari{" "}
                    {sortedData.length} data
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={currentPage === 1}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      Sebelumnya
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 2
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 py-1 text-gray-500">...</span>
                          )}
                          <Button
                            size="sm"
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                    <Button
                      disabled={currentPage === totalPages}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Modal */}
      <ExportModal
        columns={columns}
        data={sortedData}
        exportColumns={exportColumns}
        filename={
          exportFilename ||
          title?.toLowerCase().replace(/\s+/g, "-") ||
          "export"
        }
        isOpen={showExportModal}
        title={title || "Data Export"}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
