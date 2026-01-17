import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Home,
  Lock,
  MapPin,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import masterService from "@/services/masterService";

const JemaatSuperExportModal = ({
  isOpen,
  onClose,
  currentFilters = {},
  totalRecords = 0,
  onExport,
}) => {
  const { user } = useAuth();
  const isMajelis = user?.role === "MAJELIS";

  const [exportConfig, setExportConfig] = useState({
    format: "pdf",
    layout: "table", // table, cards, detailed
    includeFields: {
      // Identitas Dasar
      id: true,
      nama: true,
      jenisKelamin: true,
      tanggalLahir: true,
      golonganDarah: false,

      // Status & Keluarga
      statusDalamKeluarga: true,
      statusJemaat: false,

      // Keluarga & Alamat
      keluarga: {
        noBagungan: true,
        rayon: true,
        statusKeluarga: false,
        kepemilikanRumah: false,
        keadaanRumah: false,
      },

      alamat: {
        kelurahan: true,
        kecamatan: false,
        kotaKab: false,
        provinsi: false,
        rt: false,
        rw: false,
        jalan: false,
      },

      // Sosial & Ekonomi
      suku: true,
      pendidikan: true,
      pekerjaan: true,
      pendapatan: false,
      jaminanKesehatan: false,

      // User Account
      userAccount: false,
      userRole: false,
    },
    groupBy: "none", // Fixed to "none" - grouping disabled for jemaat export
    sortBy: "nama",
    sortOrder: "asc",
    pageSize: "a4", // a4, a3, letter, legal
    orientation: "portrait", // portrait, landscape
    includeStats: true,
    includeSummary: true,
    includeHeader: true,
    includeFooter: true,
    title: "",
    subtitle: "",
    customFilters: { ...currentFilters },
    // New: Value selection for each filter field
    selectedValues: {
      idRayon: [], // Selected rayon IDs
      idSuku: [], // Selected suku IDs
      idStatusDalamKeluarga: [], // Selected status dalam keluarga IDs
      idPendidikan: [], // Selected pendidikan IDs
      idPekerjaan: [], // Selected pekerjaan IDs
      idPendapatan: [], // Selected pendapatan IDs
      idJaminanKesehatan: [], // Selected jaminan kesehatan IDs
      idStatusKeluarga: [], // Selected status keluarga IDs
      idKeadaanRumah: [], // Selected keadaan rumah IDs
      idStatusKepemilikanRumah: [], // Selected status kepemilikan rumah IDs
      idKelurahan: [], // Selected kelurahan IDs
      jenisKelamin: [], // Selected jenis kelamin values
      status: [], // Selected status jemaat values
      golonganDarah: [], // Selected golongan darah values
      hasUserAccount: [], // Selected user account status
      userRole: [], // Selected user roles
    },
  });

  const [previewData, setPreviewData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch master data for filter labels
  const { data: masterData } = useQuery({
    queryKey: ["export-master-data"],
    queryFn: async () => {
      const [
        suku,
        pendidikan,
        pekerjaan,
        rayon,
        statusDalamKeluarga,
        pendapatan,
        jaminanKesehatan,
        statusKeluarga,
        keadaanRumah,
        statusKepemilikanRumah,
        kelurahan,
      ] = await Promise.all([
        masterService.getSuku(),
        masterService.getPendidikan(),
        masterService.getPekerjaan(),
        masterService.getRayon(),
        masterService.getStatusDalamKeluarga(),
        masterService.getPendapatan(),
        masterService.getJaminanKesehatan(),
        masterService.getStatusKeluarga(),
        masterService.getKeadaanRumah(),
        masterService.getStatusKepemilikanRumah(),
        masterService.getKelurahan(),
      ]);

      return {
        suku,
        pendidikan,
        pekerjaan,
        rayon,
        statusDalamKeluarga,
        pendapatan,
        jaminanKesehatan,
        statusKeluarga,
        keadaanRumah,
        statusKepemilikanRumah,
        kelurahan,
      };
    },
    enabled: isOpen,
  });

  // Effect to auto-select rayon for Majelis user
  useEffect(() => {
    if (isMajelis && user?.idRayon) {
      setExportConfig((prev) => ({
        ...prev,
        selectedValues: {
          ...prev.selectedValues,
          idRayon: [user.idRayon],
        },
      }));
    }
  }, [isMajelis, user, masterData]);

  // Calculate selected fields count
  const getSelectedFieldsCount = () => {
    let count = 0;
    const fields = exportConfig.includeFields;

    // Count basic fields
    Object.keys(fields).forEach((key) => {
      if (typeof fields[key] === "boolean" && fields[key]) count++;
      else if (typeof fields[key] === "object") {
        Object.values(fields[key]).forEach((val) => val && count++);
      }
    });

    return count;
  };

  // Get export preview info
  const getExportPreview = () => {
    const fieldsCount = getSelectedFieldsCount();
    const filterCount = Object.keys(exportConfig.customFilters).length;

    // Count selected values
    const selectedValuesCount = Object.values(
      exportConfig.selectedValues
    ).reduce((total, values) => total + (values?.length || 0), 0);

    return {
      estimatedSize:
        totalRecords < 100
          ? "Kecil (~1MB)"
          : totalRecords < 1000
            ? "Sedang (~5MB)"
            : "Besar (~10MB+)",
      fieldsCount,
      filterCount,
      selectedValuesCount,
    };
  };

  // Export format options
  const formatOptions = [
    {
      value: "pdf",
      label: "PDF Document",
      icon: FileText,
      description: "Cocok untuk cetak dan arsip",
      pros: ["Print-ready", "Professional look", "Fixed layout"],
      cons: ["File size besar", "Tidak bisa edit"],
    },
    {
      value: "excel",
      label: "Excel Spreadsheet",
      icon: FileSpreadsheet,
      description: "Cocok untuk analisis data",
      pros: ["Editable", "Sortable", "Formula support"],
      cons: ["Butuh Excel software"],
    },
    //!COMMENT THIS FOR A WHILE.
    // {
    //   value: "csv",
    //   label: "CSV File",
    //   icon: Table,
    //   description: "Universal format",
    //   pros: ["Ringan", "Universal", "Import mudah"],
    //   cons: ["Plain text only", "No formatting"],
    // },
  ];

  // Layout options
  const layoutOptions = [
    {
      value: "table",
      label: "Tabel Standar",
      description: "Format tabel tradisional dengan kolom",
    },
    {
      value: "cards",
      label: "Kartu Jemaat",
      description: "Format kartu individual per jemaat",
    },
    {
      value: "detailed",
      label: "Detail Lengkap",
      description: "Format detail dengan semua informasi",
    },
  ];

  // Group by options
  const groupByOptions = [
    { value: "none", label: "Tidak Dikelompokkan" },
    { value: "rayon", label: "Per Rayon" },
    { value: "keluarga", label: "Per Keluarga" },
    { value: "suku", label: "Per Suku" },
    { value: "statusDalamKeluarga", label: "Per Status Keluarga" },
    { value: "jenisKelamin", label: "Per Jenis Kelamin" },
    { value: "pendidikan", label: "Per Tingkat Pendidikan" },
  ];

  // Field groups for better organization
  const fieldGroups = [
    {
      title: "Identitas Dasar",
      icon: Users,
      fields: [
        { key: "id", label: "ID Jemaat", type: "basic" },
        { key: "nama", label: "Nama Lengkap", type: "basic" },
        { key: "jenisKelamin", label: "Jenis Kelamin", type: "basic" },
        { key: "tanggalLahir", label: "Tanggal Lahir", type: "basic" },
        { key: "golonganDarah", label: "Golongan Darah", type: "basic" },
        { key: "statusJemaat", label: "Status Jemaat", type: "basic" },
      ],
    },
    {
      title: "Status & Keluarga",
      icon: Home,
      fields: [
        {
          key: "statusDalamKeluarga",
          label: "Status dalam Keluarga",
          type: "basic",
        },
        { key: "keluarga.noBagungan", label: "No. Bagungan", type: "keluarga" },
        { key: "keluarga.rayon", label: "Rayon", type: "keluarga" },
        {
          key: "keluarga.statusKeluarga",
          label: "Status Keluarga",
          type: "keluarga",
        },
        {
          key: "keluarga.kepemilikanRumah",
          label: "Kepemilikan Rumah",
          type: "keluarga",
        },
        {
          key: "keluarga.keadaanRumah",
          label: "Keadaan Rumah",
          type: "keluarga",
        },
      ],
    },
    {
      title: "Alamat",
      icon: MapPin,
      fields: [
        { key: "alamat.kelurahan", label: "Kelurahan", type: "alamat" },
        { key: "alamat.kecamatan", label: "Kecamatan", type: "alamat" },
        { key: "alamat.kotaKab", label: "Kota/Kabupaten", type: "alamat" },
        { key: "alamat.provinsi", label: "Provinsi", type: "alamat" },
        { key: "alamat.rt", label: "RT", type: "alamat" },
        { key: "alamat.rw", label: "RW", type: "alamat" },
        { key: "alamat.jalan", label: "Jalan", type: "alamat" },
      ],
    },
    {
      title: "Data Sosial & Ekonomi",
      icon: Calendar,
      fields: [
        { key: "suku", label: "Suku", type: "basic" },
        { key: "pendidikan", label: "Pendidikan", type: "basic" },
        { key: "pekerjaan", label: "Pekerjaan", type: "basic" },
        { key: "pendapatan", label: "Pendapatan", type: "basic" },
        { key: "jaminanKesehatan", label: "Jaminan Kesehatan", type: "basic" },
      ],
    },
    {
      title: "Akun User",
      icon: Settings,
      fields: [
        { key: "userAccount", label: "Status Akun", type: "basic" },
        { key: "userRole", label: "Role User", type: "basic" },
      ],
    },
  ];

  // Handle field toggle
  const handleFieldToggle = (fieldPath, type = "basic") => {
    setExportConfig((prev) => {
      const newConfig = { ...prev };

      if (type === "basic") {
        newConfig.includeFields[fieldPath] = !prev.includeFields[fieldPath];
      } else {
        const [parent, child] = fieldPath.split(".");

        if (!newConfig.includeFields[parent])
          newConfig.includeFields[parent] = {};
        newConfig.includeFields[parent][child] =
          !prev.includeFields[parent]?.[child];
      }

      return newConfig;
    });
  };

  // Get field value
  const getFieldValue = (fieldPath, type = "basic") => {
    if (type === "basic") {
      return exportConfig.includeFields[fieldPath] || false;
    } else {
      const [parent, child] = fieldPath.split(".");

      return exportConfig.includeFields[parent]?.[child] || false;
    }
  };

  // Prepare filter options for value selection
  const getFilterOptions = () => {
    if (!masterData) return {};

    const allRayons =
      masterData.rayon?.data?.items?.map((item) => ({
        value: item.id,
        label: item.namaRayon,
      })) || [];

    const rayonOptions =
      isMajelis && user?.idRayon
        ? allRayons.filter((r) => r.value === user.idRayon)
        : allRayons;

    return {
      idRayon: rayonOptions,
      idSuku:
        masterData.suku?.data?.items?.map((item) => ({
          value: item.id,
          label: item.namaSuku,
        })) || [],
      idStatusDalamKeluarga:
        masterData.statusDalamKeluarga?.data?.items?.map((item) => ({
          value: item.id,
          label: item.status,
        })) || [],
      idPendidikan:
        masterData.pendidikan?.data?.items?.map((item) => ({
          value: item.id,
          label: item.jenjang,
        })) || [],
      idPekerjaan:
        masterData.pekerjaan?.data?.items?.map((item) => ({
          value: item.id,
          label: item.namaPekerjaan,
        })) || [],
      idPendapatan:
        masterData.pendapatan?.data?.items?.map((item) => ({
          value: item.id,
          label: item.label,
        })) || [],
      idJaminanKesehatan:
        masterData.jaminanKesehatan?.data?.items?.map((item) => ({
          value: item.id,
          label: item.jenisJaminan,
        })) || [],
      idStatusKeluarga:
        masterData.statusKeluarga?.data?.items?.map((item) => ({
          value: item.id,
          label: item.status,
        })) || [],
      idKeadaanRumah:
        masterData.keadaanRumah?.data?.items?.map((item) => ({
          value: item.id,
          label: item.keadaan,
        })) || [],
      idStatusKepemilikanRumah:
        masterData.statusKepemilikanRumah?.data?.items?.map((item) => ({
          value: item.id,
          label: item.status,
        })) || [],
      idKelurahan:
        masterData.kelurahan?.data?.items?.map((item) => ({
          value: item.id,
          label: item.kodepos ? `${item.nama} - ${item.kodepos}` : item.nama,
        })) || [],
      jenisKelamin: [
        { value: "true", label: "Laki-laki" },
        { value: "false", label: "Perempuan" },
      ],
      status: [
        { value: "AKTIF", label: "Aktif" },
        { value: "TIDAK_AKTIF", label: "Tidak Aktif" },
        { value: "KELUAR", label: "Keluar" },
      ],
      golonganDarah: [
        { value: "A", label: "A" },
        { value: "B", label: "B" },
        { value: "AB", label: "AB" },
        { value: "O", label: "O" },
      ],
      hasUserAccount: [
        { value: "true", label: "Memiliki Akun" },
        { value: "false", label: "Tidak Ada Akun" },
      ],
      userRole: [
        { value: "ADMIN", label: "Admin" },
        { value: "JEMAAT", label: "Jemaat" },
        { value: "MAJELIS", label: "Majelis" },
        { value: "EMPLOYEE", label: "Employee" },
        { value: "PENDETA", label: "Pendeta" },
      ],
    };
  };

  // Render value selection section
  const renderValueSelectionSection = () => {
    const filterOptions = getFilterOptions();

    const filterCategories = [
      {
        title: "Data Keluarga",
        icon: Home,
        filters: [
          {
            key: "idRayon",
            label: "Rayon",
            options: filterOptions.idRayon,
            locked: isMajelis,
          },
          {
            key: "idStatusDalamKeluarga",
            label: "Status Dalam Keluarga",
            options: filterOptions.idStatusDalamKeluarga,
          },
          {
            key: "idStatusKeluarga",
            label: "Status Keluarga",
            options: filterOptions.idStatusKeluarga,
          },
        ],
      },
      {
        title: "Data Pribadi",
        icon: Users,
        filters: [
          {
            key: "jenisKelamin",
            label: "Jenis Kelamin",
            options: filterOptions.jenisKelamin,
          },
          {
            key: "status",
            label: "Status Jemaat",
            options: filterOptions.status,
          },
          {
            key: "golonganDarah",
            label: "Golongan Darah",
            options: filterOptions.golonganDarah,
          },
        ],
      },
      {
        title: "Pendidikan & Pekerjaan",
        icon: Calendar,
        filters: [
          { key: "idSuku", label: "Suku", options: filterOptions.idSuku },
          {
            key: "idPendidikan",
            label: "Pendidikan",
            options: filterOptions.idPendidikan,
          },
          {
            key: "idPekerjaan",
            label: "Pekerjaan",
            options: filterOptions.idPekerjaan,
          },
          {
            key: "idPendapatan",
            label: "Pendapatan",
            options: filterOptions.idPendapatan,
          },
          {
            key: "idJaminanKesehatan",
            label: "Jaminan Kesehatan",
            options: filterOptions.idJaminanKesehatan,
          },
        ],
      },
      {
        title: "Rumah & Alamat",
        icon: MapPin,
        filters: [
          {
            key: "idKeadaanRumah",
            label: "Keadaan Rumah",
            options: filterOptions.idKeadaanRumah,
          },
          {
            key: "idStatusKepemilikanRumah",
            label: "Status Kepemilikan Rumah",
            options: filterOptions.idStatusKepemilikanRumah,
          },
          {
            key: "idKelurahan",
            label: "Kelurahan",
            options: filterOptions.idKelurahan,
          },
        ],
      },
      {
        title: "Akun User",
        icon: Settings,
        filters: [
          {
            key: "hasUserAccount",
            label: "Status Akun",
            options: filterOptions.hasUserAccount,
          },
          {
            key: "userRole",
            label: "Role User",
            options: filterOptions.userRole,
          },
        ],
      },
    ];

    return (
      <div className="space-y-4">
        {filterCategories.map((category) => (
          <Card key={category.title}>
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <category.icon className="h-4 w-4 mr-2 text-gray-500" />
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {category.title}
                </h4>
              </div>

              {category.title === "Data Keluarga" && isMajelis && (
                <div className="mb-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Filter Rayon Terkunci
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Anda hanya dapat mengekspor data untuk rayon Anda:{" "}
                        <span className="font-semibold">
                          {masterData?.rayon?.data?.items?.find(
                            (r) => r.id === user.idRayon,
                          )?.namaRayon || "..."}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {category.filters.map((filter) => {
                  if (filter.locked) return null;

                  return (
                    <div key={filter.key}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          {filter.label}
                        </label>
                        <div className="flex gap-2">
                          <button
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            type="button"
                            onClick={() =>
                              selectAllFilterValues(filter.key, filter.options)
                            }
                          >
                            Pilih Semua
                          </button>
                          <button
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            type="button"
                            onClick={() => clearFilterValues(filter.key)}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                      <div className="max-h-32 overflow-y-auto overflow-x-hidden border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="p-2 space-y-1">
                          {filter.options?.map((option) => {
                            const isSelected =
                              exportConfig.selectedValues[filter.key]?.includes(
                                option.value
                              ) || false;

                            return (
                              <label
                                key={option.value}
                                className="flex items-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                              >
                                <input
                                  checked={isSelected}
                                  className="mr-2"
                                  type="checkbox"
                                  onChange={(e) =>
                                    handleValueSelection(
                                      filter.key,
                                      option.value,
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="text-gray-700 dark:text-gray-300 truncate">
                                  {option.label}
                                </span>
                              </label>
                            );
                          })}
                          {(!filter.options || filter.options.length === 0) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 p-2">
                              Tidak ada data tersedia
                            </p>
                          )}
                        </div>
                      </div>
                      {exportConfig.selectedValues[filter.key]?.length > 0 && (
                        <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                          {exportConfig.selectedValues[filter.key].length} nilai
                          dipilih
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Handle value selection for filters
  const handleValueSelection = (filterKey, value, isSelected) => {
    setExportConfig((prev) => {
      const currentValues = prev.selectedValues[filterKey] || [];
      let newValues;

      if (isSelected) {
        // Add value if not already present
        newValues = currentValues.includes(value)
          ? currentValues
          : [...currentValues, value];
      } else {
        // Remove value
        newValues = currentValues.filter((v) => v !== value);
      }

      return {
        ...prev,
        selectedValues: {
          ...prev.selectedValues,
          [filterKey]: newValues,
        },
      };
    });
  };

  // Clear all selected values for a filter
  const clearFilterValues = (filterKey) => {
    setExportConfig((prev) => ({
      ...prev,
      selectedValues: {
        ...prev.selectedValues,
        [filterKey]: [],
      },
    }));
  };

  // Select all values for a filter
  const selectAllFilterValues = (filterKey, allValues) => {
    setExportConfig((prev) => ({
      ...prev,
      selectedValues: {
        ...prev.selectedValues,
        [filterKey]: allValues.map((v) => v.value),
      },
    }));
  };

  // Handle export
  const handleExport = async () => {
    if (!onExport) return;

    setIsGenerating(true);
    try {
      // Merge custom filters with selected values
      const mergedFilters = { ...exportConfig.customFilters };

      // Add selected values as filters
      Object.entries(exportConfig.selectedValues).forEach(([key, values]) => {
        if (values && values.length > 0) {
          mergedFilters[key] = values;
        }
      });

      await onExport({
        ...exportConfig,
        filters: mergedFilters,
      });
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  // Quick preset configurations
  const presets = [
    {
      name: "Ringkas",
      description: "Data dasar untuk daftar nama",
      config: {
        includeFields: {
          nama: true,
          jenisKelamin: true,
          statusDalamKeluarga: true,
          keluarga: { noBagungan: true, rayon: true },
        },
      },
    },
    {
      name: "Lengkap",
      description: "Semua data jemaat",
      config: {
        includeFields: {
          id: true,
          nama: true,
          jenisKelamin: true,
          tanggalLahir: true,
          statusDalamKeluarga: true,
          suku: true,
          pendidikan: true,
          pekerjaan: true,
          keluarga: { noBagungan: true, rayon: true, statusKeluarga: true },
          alamat: { kelurahan: true, rt: true, rw: true },
        },
      },
    },
    {
      name: "Administratif",
      description: "Data untuk keperluan administrasi",
      config: {
        includeFields: {
          id: true,
          nama: true,
          jenisKelamin: true,
          tanggalLahir: true,
          statusDalamKeluarga: true,
          userAccount: true,
          keluarga: { noBagungan: true, rayon: true },
          alamat: { kelurahan: true, rt: true, rw: true, jalan: true },
        },
      },
    },
  ];

  if (!isOpen) return null;

  const preview = getExportPreview();

  return (
    <div className="fixed inset-0  bg-opacity -50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Super Export Jemaat
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Export {totalRecords} jemaat dengan{" "}
              {Object.keys(currentFilters).length} filter aktif
            </p>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Panel - Configuration */}
          <div className="w-2/3 p-6 overflow-y-auto overflow-x-hidden border-r border-gray-200 dark:border-gray-700">
            {/* Quick Presets */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Preset Cepat
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() =>
                      setExportConfig((prev) => ({ ...prev, ...preset.config }))
                    }
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Format File
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {formatOptions.map((format) => (
                  <div
                    key={format.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                      exportConfig.format === format.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() =>
                      setExportConfig((prev) => ({
                        ...prev,
                        format: format.value,
                      }))
                    }
                  >
                    <div className="flex items-start">
                      <format.icon
                        className={`h-5 w-5 mt-0.5 mr-3 ${
                          exportConfig.format === format.value
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {format.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {format.description}
                        </div>
                        <div className="flex gap-4 mt-2">
                          <div>
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              Kelebihan:{" "}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format.pros.join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                      {exportConfig.format === format.value && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Selection */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Layout Document
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {layoutOptions.map((layout) => (
                  <label key={layout.value} className="flex items-center">
                    <input
                      checked={exportConfig.layout === layout.value}
                      className="mr-3"
                      name="layout"
                      type="radio"
                      value={layout.value}
                      onChange={(e) =>
                        setExportConfig((prev) => ({
                          ...prev,
                          layout: e.target.value,
                        }))
                      }
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {layout.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {layout.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Value Selection for Filters */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Pilih Nilai Spesifik untuk Export
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>💡 Tip:</strong> Pilih nilai spesifik untuk setiap
                  kategori yang ingin diekspor. Misalnya: hanya Rayon 1,2,3 atau
                  hanya Keluarga A,B,C.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Kosongkan jika ingin export semua nilai dalam kategori
                  tersebut.
                </p>
              </div>
              {renderValueSelectionSection()}
            </div>

            {/* Field Selection */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Pilih Data yang Diekspor
              </h3>
              <div className="space-y-4">
                {fieldGroups.map((group) => (
                  <Card key={group.title}>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <group.icon className="h-4 w-4 mr-2 text-gray-500" />
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {group.title}
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.fields.map((field) => (
                          <label
                            key={field.key}
                            className="flex items-center text-sm"
                          >
                            <input
                              checked={getFieldValue(field.key, field.type)}
                              className="mr-2"
                              type="checkbox"
                              onChange={() =>
                                handleFieldToggle(field.key, field.type)
                              }
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {field.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Page Settings */}
            {exportConfig.format === "pdf" && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Pengaturan Halaman
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Ukuran Halaman
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={exportConfig.pageSize}
                      onChange={(e) =>
                        setExportConfig((prev) => ({
                          ...prev,
                          pageSize: e.target.value,
                        }))
                      }
                    >
                      <option value="a4">A4</option>
                      <option value="a3">A3</option>
                      <option value="letter">Letter</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Orientasi
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={exportConfig.orientation}
                      onChange={(e) =>
                        setExportConfig((prev) => ({
                          ...prev,
                          orientation: e.target.value,
                        }))
                      }
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Document Info */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Informasi Dokumen
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Judul Dokumen
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Data Jemaat GMIT Imanuel Oepura"
                    type="text"
                    value={exportConfig.title}
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Subtitle
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Periode: September 2024"
                    type="text"
                    value={exportConfig.subtitle}
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        subtitle: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview & Export */}
          <div className="w-1/3 p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto overflow-x-hidden">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
              Preview Export
            </h3>

            {/* Export Summary */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Records:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {totalRecords}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Fields Selected:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {preview.fieldsCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Active Filters:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {preview.filterCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Selected Values:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {preview.selectedValuesCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Estimated Size:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {preview.estimatedSize}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Filters */}
            {Object.keys(currentFilters).length > 0 && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter Aktif
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(currentFilters).map(([key, value]) => (
                      <div
                        key={key}
                        className="text-xs text-gray-600 dark:text-gray-400"
                      >
                        <span className="font-medium">{key}:</span>{" "}
                        {value.toString()}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Values Preview */}
            {preview.selectedValuesCount > 0 && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Nilai Terpilih
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto overflow-x-hidden">
                    {Object.entries(exportConfig.selectedValues).map(
                      ([key, values]) => {
                        if (!values || values.length === 0) return null;

                        const filterOptions = getFilterOptions();
                        const options = filterOptions[key] || [];

                        // Create a mapping for better labels
                        const getFilterLabel = (key) => {
                          const labelMap = {
                            idRayon: "Rayon",
                            idSuku: "Suku",
                            idStatusDalamKeluarga: "Status dalam Keluarga",
                            jenisKelamin: "Jenis Kelamin",
                            status: "Status Jemaat",
                            idPendidikan: "Pendidikan",
                            idPekerjaan: "Pekerjaan",
                            golonganDarah: "Golongan Darah",
                            hasUserAccount: "Status Akun",
                            userRole: "Role User",
                            idKelurahan: "Kelurahan",
                            idPendapatan: "Pendapatan",
                            idJaminanKesehatan: "Jaminan Kesehatan",
                            idStatusKeluarga: "Status Keluarga",
                            idKeadaanRumah: "Keadaan Rumah",
                            idStatusKepemilikanRumah: "Status Kepemilikan",
                          };

                          return labelMap[key] || key;
                        };

                        return (
                          <div
                            key={key}
                            className="text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {getFilterLabel(key)}:
                            </span>{" "}
                            <span className="text-blue-600 dark:text-blue-400">
                              {values.length} dipilih
                            </span>
                            <div className="ml-4 mt-1 text-gray-500 dark:text-gray-500 text-xs">
                              {values
                                .slice(0, 3)
                                .map((value) => {
                                  const option = options.find(
                                    (opt) => opt.value === value
                                  );

                                  return option?.label;
                                })
                                .filter(Boolean)
                                .join(", ")}
                              {values.length > 3 &&
                                `, +${values.length - 3} lainnya`}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Export Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm">
                  <input
                    checked={exportConfig.includeStats}
                    className="mr-2"
                    type="checkbox"
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        includeStats: e.target.checked,
                      }))
                    }
                  />
                  Include Statistics
                </label>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm">
                  <input
                    checked={exportConfig.includeSummary}
                    className="mr-2"
                    type="checkbox"
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        includeSummary: e.target.checked,
                      }))
                    }
                  />
                  Include Summary
                </label>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm">
                  <input
                    checked={exportConfig.includeHeader}
                    className="mr-2"
                    type="checkbox"
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        includeHeader: e.target.checked,
                      }))
                    }
                  />
                  Include Header
                </label>
              </div>
            </div>

            {/* Export Button */}
            <div className="mt-6 space-y-3">
              <Button
                className="w-full"
                disabled={isGenerating || preview.fieldsCount === 0}
                size="lg"
                onClick={handleExport}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {exportConfig.format.toUpperCase()}
                  </>
                )}
              </Button>

              {preview.fieldsCount === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 text-center">
                  Pilih minimal 1 field untuk export
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JemaatSuperExportModal;
