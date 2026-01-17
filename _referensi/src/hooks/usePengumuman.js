import { useEffect, useState } from "react";

export const usePengumuman = (filters = {}) => {
  const [pengumumanData, setPengumumanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Apply filters
      if (filters.jenisId) params.append("jenisId", filters.jenisId);
      if (filters.kategoriId) params.append("kategoriId", filters.kategoriId);
      if (filters.status) params.append("status", filters.status);
      if (filters.prioritas) params.append("prioritas", filters.prioritas);
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      // Include relations by default for better data
      params.append("includeRelations", "true");

      const response = await fetch(`/api/pengumuman?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPengumumanData(result.data.items || []);
        setPagination(
          result.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            hasNext: false,
            hasPrev: false,
          }
        );
      } else {
        throw new Error(result.message || "Failed to fetch pengumuman");
      }
    } catch (err) {
      console.error("Error fetching pengumuman:", err);
      setError(err.message || "Failed to fetch pengumuman data");
      setPengumumanData([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, [
    filters.jenisId,
    filters.kategoriId,
    filters.status,
    filters.prioritas,
    filters.search,
    filters.page,
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const refetch = () => {
    fetchPengumuman();
  };

  return {
    pengumumanData,
    loading,
    error,
    pagination,
    refetch,
  };
};

export default usePengumuman;
