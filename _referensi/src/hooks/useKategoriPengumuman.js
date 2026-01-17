import { useEffect, useState } from "react";

export const useKategoriPengumuman = () => {
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKategoriOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      params.append("includeJenis", "true");
      params.append("isActive", "true");

      const response = await fetch(
        `/api/kategori-pengumuman/options?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setKategoriOptions(result.data || []);
      } else {
        throw new Error(
          result.message || "Failed to fetch kategori pengumuman"
        );
      }
    } catch (err) {
      console.error("Error fetching kategori pengumuman:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategoriOptions();
  }, []);

  const refetch = () => {
    fetchKategoriOptions();
  };

  // Helper function to get category by name (slug)
  const getCategoryBySlug = (slug) => {
    return kategoriOptions.find(
      (category) => category.nama.toLowerCase().replace(/\s+/g, "-") === slug
    );
  };

  // Helper function to get subcategory by name within a category
  const getSubcategoryBySlug = (categorySlug, subcategorySlug) => {
    const category = getCategoryBySlug(categorySlug);

    if (!category || !category.jenisPengumuman) return null;

    return category.jenisPengumuman.find(
      (jenis) =>
        jenis.nama.toLowerCase().replace(/\s+/g, "-") === subcategorySlug
    );
  };

  return {
    kategoriOptions,
    loading,
    error,
    refetch,
    getCategoryBySlug,
    getSubcategoryBySlug,
  };
};

export default useKategoriPengumuman;
