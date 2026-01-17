import { useEffect, useState } from "react";

export const useJenisPengumuman = (kategoriId = null) => {
  const [jenisOptions, setJenisOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJenisOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (kategoriId) {
        params.append("kategoriId", kategoriId);
      }
      params.append("isActive", "true");

      const response = await fetch(
        `/api/jenis-pengumuman/options?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setJenisOptions(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch jenis pengumuman");
      }
    } catch (err) {
      console.error("Error fetching jenis pengumuman:", err);
      setError(err.message || "Failed to fetch jenis pengumuman data");
      setJenisOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJenisOptions();
  }, [kategoriId]);

  const refetch = () => {
    fetchJenisOptions();
  };

  return {
    jenisOptions,
    loading,
    error,
    refetch,
  };
};

export default useJenisPengumuman;
