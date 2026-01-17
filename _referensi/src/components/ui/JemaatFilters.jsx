import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Filter, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import NumberInput from "@/components/ui/inputs/NumberInput";
import TextInput from "@/components/ui/inputs/TextInput";
import masterService from "@/services/masterService";

const JemaatFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Fetch master data with lazy load + caching (same queryKey as create/edit pages for cache reuse!)
  const { data: sukuData } = useQuery({
    queryKey: ["suku"],
    queryFn: async () => {
      const response = await masterService.getSuku();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.namaSuku,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000, // Cache 10 menit
    cacheTime: 30 * 60 * 1000,
  });

  const { data: pendidikanData } = useQuery({
    queryKey: ["pendidikan"],
    queryFn: async () => {
      const response = await masterService.getPendidikan();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.jenjang,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: pekerjaanData } = useQuery({
    queryKey: ["pekerjaan"],
    queryFn: async () => {
      const response = await masterService.getPekerjaan();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.namaPekerjaan,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: pendapatanData } = useQuery({
    queryKey: ["pendapatan"],
    queryFn: async () => {
      const response = await masterService.getPendapatan();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.label,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: jaminanKesehatanData } = useQuery({
    queryKey: ["jaminan-kesehatan"],
    queryFn: async () => {
      const response = await masterService.getJaminanKesehatan();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.jenisJaminan,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: statusDalamKeluargaData } = useQuery({
    queryKey: ["status-dalam-keluarga"],
    queryFn: async () => {
      const response = await masterService.getStatusDalamKeluarga();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.status,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: rayonData } = useQuery({
    queryKey: ["rayon"],
    queryFn: async () => {
      const response = await masterService.getRayon();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.namaRayon,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: statusKeluargaData } = useQuery({
    queryKey: ["status-keluarga"],
    queryFn: async () => {
      const response = await masterService.getStatusKeluarga();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.status,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: keadaanRumahData } = useQuery({
    queryKey: ["keadaan-rumah"],
    queryFn: async () => {
      const response = await masterService.getKeadaanRumah();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.keadaan,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: statusKepemilikanRumahData } = useQuery({
    queryKey: ["status-kepemilikan-rumah"],
    queryFn: async () => {
      const response = await masterService.getStatusKepemilikanRumah();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.status,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const { data: kelurahanData } = useQuery({
    queryKey: ["kelurahan"],
    queryFn: async () => {
      const response = await masterService.getKelurahan();

      return (
        response.data?.items?.map((item) => ({
          value: item.id,
          label: item.kodepos ? `${item.nama} - ${item.kodepos}` : item.nama,
        })) || []
      );
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  // Direct assignment with array safety check
  const sukuOptions = Array.isArray(sukuData) ? sukuData : [];
  const pendidikanOptions = Array.isArray(pendidikanData) ? pendidikanData : [];
  const pekerjaanOptions = Array.isArray(pekerjaanData) ? pekerjaanData : [];
  const pendapatanOptions = Array.isArray(pendapatanData) ? pendapatanData : [];
  const jaminanKesehatanOptions = Array.isArray(jaminanKesehatanData)
    ? jaminanKesehatanData
    : [];
  const statusDalamKeluargaOptions = Array.isArray(statusDalamKeluargaData)
    ? statusDalamKeluargaData
    : [];
  const rayonOptions = Array.isArray(rayonData) ? rayonData : [];
  const statusKeluargaOptions = Array.isArray(statusKeluargaData)
    ? statusKeluargaData
    : [];
  const keadaanRumahOptions = Array.isArray(keadaanRumahData)
    ? keadaanRumahData
    : [];
  const statusKepemilikanRumahOptions = Array.isArray(
    statusKepemilikanRumahData
  )
    ? statusKepemilikanRumahData
    : [];
  const kelurahanOptions = Array.isArray(kelurahanData) ? kelurahanData : [];

  // Static options
  const jenisKelaminOptions = [
    { value: "true", label: "Laki-laki" },
    { value: "false", label: "Perempuan" },
  ];

  const statusJemaatOptions = [
    { value: "AKTIF", label: "Aktif" },
    { value: "TIDAK_AKTIF", label: "Tidak Aktif" },
    { value: "KELUAR", label: "Keluar" },
  ];

  const golonganDarahOptions = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "AB", label: "AB" },
    { value: "O", label: "O" },
  ];

  const hasUserAccountOptions = [
    { value: "true", label: "Memiliki Akun" },
    { value: "false", label: "Tidak Ada Akun" },
  ];

  const userRoleOptions = [
    { value: "ADMIN", label: "Admin" },
    { value: "JEMAAT", label: "Jemaat" },
    { value: "MAJELIS", label: "Majelis" },
    { value: "EMPLOYEE", label: "Employee" },
    { value: "PENDETA", label: "Pendeta" },
  ];

  // Update active filters count
  useEffect(() => {
    const count = Object.values(filters).filter(
      (value) => value && value !== "" && value !== "all"
    ).length;

    setActiveFiltersCount(count);
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value === "all" || value === "" ? undefined : value,
    };

    // Remove undefined values
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key] === undefined) {
        delete newFilters[key];
      }
    });

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  // Filter sections configuration
  const filterSections = [
    {
      title: "Data Pribadi",
      filters: [
        {
          key: "jenisKelamin",
          label: "Jenis Kelamin",
          options: jenisKelaminOptions,
          type: "select",
        },
        {
          key: "status",
          label: "Status Jemaat",
          options: statusJemaatOptions,
          type: "select",
        },
        {
          key: "golonganDarah",
          label: "Golongan Darah",
          options: golonganDarahOptions,
          type: "select",
        },
        {
          key: "ageMin",
          label: "Umur Minimal",
          type: "number",
          placeholder: "Contoh: 18",
        },
        {
          key: "ageMax",
          label: "Umur Maksimal",
          type: "number",
          placeholder: "Contoh: 65",
        },
      ],
    },
    {
      title: "Data Keluarga & Status",
      filters: [
        {
          key: "idStatusDalamKeluarga",
          label: "Status Dalam Keluarga",
          options: statusDalamKeluargaOptions,
          type: "select",
        },
        {
          key: "idRayon",
          label: "Rayon",
          options: rayonOptions,
          type: "select",
        },
        {
          key: "idStatusKeluarga",
          label: "Status Keluarga",
          options: statusKeluargaOptions,
          type: "select",
        },
        {
          key: "idKeadaanRumah",
          label: "Keadaan Rumah",
          options: keadaanRumahOptions,
          type: "select",
        },
        {
          key: "idStatusKepemilikanRumah",
          label: "Status Kepemilikan Rumah",
          options: statusKepemilikanRumahOptions,
          type: "select",
        },
      ],
    },
    {
      title: "Pendidikan & Pekerjaan",
      filters: [
        {
          key: "idSuku",
          label: "Suku",
          options: sukuOptions,
          type: "select",
        },
        {
          key: "idPendidikan",
          label: "Pendidikan",
          options: pendidikanOptions,
          type: "select",
        },
        {
          key: "idPekerjaan",
          label: "Pekerjaan",
          options: pekerjaanOptions,
          type: "select",
        },
        {
          key: "idPendapatan",
          label: "Pendapatan",
          options: pendapatanOptions,
          type: "select",
        },
        {
          key: "idJaminanKesehatan",
          label: "Jaminan Kesehatan",
          options: jaminanKesehatanOptions,
          type: "select",
        },
      ],
    },
    {
      title: "Alamat",
      filters: [
        {
          key: "idKelurahan",
          label: "Kelurahan",
          options: kelurahanOptions,
          type: "select",
        },
        {
          key: "rt",
          label: "RT",
          type: "number",
          placeholder: "Contoh: 001",
        },
        {
          key: "rw",
          label: "RW",
          type: "number",
          placeholder: "Contoh: 001",
        },
      ],
    },
    {
      title: "Akun User",
      filters: [
        {
          key: "hasUserAccount",
          label: "Status Akun",
          options: hasUserAccountOptions,
          type: "select",
        },
        {
          key: "userRole",
          label: "Role User",
          options: userRoleOptions,
          type: "select",
        },
      ],
    },
  ];

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case "select":
        return (
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
            value={filters[filter.key] || "all"}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          >
            <option value="all">Semua {filter.label}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "number":
        return (
          <NumberInput
            placeholder={filter.placeholder}
            value={filters[filter.key] || ""}
            onChange={(value) => handleFilterChange(filter.key, value)}
          />
        );
      default:
        return (
          <TextInput
            placeholder={filter.placeholder}
            value={filters[filter.key] || ""}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        );
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Filter Jemaat
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  {activeFiltersCount} aktif
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                className="text-xs"
                size="sm"
                variant="outline"
                onClick={clearAllFilters}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              className="text-xs"
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Tutup
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Tampilkan Filter
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Filters (always visible) - Full width layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jenis Kelamin
            </label>
            {renderFilterInput({
              key: "jenisKelamin",
              type: "select",
              options: jenisKelaminOptions,
            })}
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status Akun
            </label>
            {renderFilterInput({
              key: "hasUserAccount",
              type: "select",
              options: hasUserAccountOptions,
            })}
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rayon
            </label>
            {renderFilterInput({
              key: "idRayon",
              type: "select",
              options: rayonOptions,
            })}
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status Keluarga
            </label>
            {renderFilterInput({
              key: "idStatusDalamKeluarga",
              type: "select",
              options: statusDalamKeluargaOptions,
            })}
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Suku
            </label>
            {renderFilterInput({
              key: "idSuku",
              type: "select",
              options: sukuOptions,
            })}
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status Jemaat
            </label>
            {renderFilterInput({
              key: "status",
              type: "select",
              options: statusJemaatOptions,
            })}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="space-y-6">
              {filterSections.map((section) => (
                <div key={section.title}>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {section.filters.map((filter) => (
                      <div key={filter.key} className="min-w-0">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {filter.label}
                        </label>
                        {renderFilterInput(filter)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JemaatFilters;
