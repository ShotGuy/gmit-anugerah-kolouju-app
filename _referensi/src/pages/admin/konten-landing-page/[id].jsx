import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Globe, Save } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUser } from "@/hooks/useUser";
import kontenLandingPageService from "@/services/kontenLandingPageService";
import { showToast } from "@/utils/showToast";

export default function EditKontenLandingPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const { user } = useUser({ requiredRole: "admin" });

  // State
  const [formData, setFormData] = useState({
    section: "VISI",
    judul: "",
    konten: "",
    deskripsi: "",
    urutan: 0,
    isPublished: false,
  });

  // Query: Fetch konten by ID
  const {
    data: kontenData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["konten-landing-page", id],
    queryFn: () => kontenLandingPageService.getById(id),
    enabled: !!id,
  });

  // Update form when data loaded
  useEffect(() => {
    if (kontenData?.data) {
      const konten = kontenData.data;

      setFormData({
        section: konten.section || "VISI",
        judul: konten.judul || "",
        konten: konten.konten || "",
        deskripsi: konten.deskripsi || "",
        urutan: konten.urutan || 0,
        isPublished: konten.isPublished || false,
      });
    }
  }, [kontenData]);

  // Mutation: Update konten
  const updateMutation = useMutation({
    mutationFn: kontenLandingPageService.update,
    onSuccess: (response) => {
      queryClient.invalidateQueries(["konten-landing-page"]);
      showToast.success(response.message || "Konten berhasil diperbarui");
      router.push("/admin/konten-landing-page");
    },
    onError: (error) => {
      showToast.error(error.message || "Gagal memperbarui konten");
    },
  });

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.judul.trim()) {
      showToast.error("Judul wajib diisi");

      return;
    }

    if (!formData.konten.trim()) {
      showToast.error("Konten wajib diisi");

      return;
    }

    await updateMutation.mutateAsync({
      id,
      ...formData,
    });
  };

  const handleBack = () => {
    router.push("/admin/konten-landing-page");
  };

  // Breadcrumb
  const breadcrumb = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Konten Landing Page", href: "/admin/konten-landing-page" },
    { label: "Edit Konten" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Error: {error.message}</p>
          <Button className="mt-4" onClick={handleBack}>
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex mb-4">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumb.map((item, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <svg
                      className="w-6 h-6 text-gray-400"
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
                      className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 md:ml-2 transition-colors"
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

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handleBack} size="sm" variant="outline">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                  Edit Konten Landing Page
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  Perbarui konten landing page gereja
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Form Konten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  htmlFor="section"
                >
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  id="section"
                  name="section"
                  onChange={handleChange}
                  required
                  value={formData.section}
                >
                  <option value="VISI">VISI</option>
                  <option value="MISI">MISI</option>
                  <option value="SEJARAH">SEJARAH</option>
                  <option value="HERO">HERO</option>
                  <option value="TEMAGMIT">TEMA GMIT</option>
                  <option value="TENTANG">TENTANG</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Pilih section dimana konten ini akan ditampilkan
                </p>
              </div>

              {/* Judul */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  htmlFor="judul"
                >
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  id="judul"
                  name="judul"
                  onChange={handleChange}
                  placeholder="Masukkan judul konten"
                  required
                  type="text"
                  value={formData.judul}
                />
              </div>

              {/* Konten */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  htmlFor="konten"
                >
                  Konten <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  id="konten"
                  name="konten"
                  onChange={handleChange}
                  placeholder="Masukkan konten"
                  required
                  rows={6}
                  value={formData.konten}
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  htmlFor="deskripsi"
                >
                  Deskripsi (Opsional)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  id="deskripsi"
                  name="deskripsi"
                  onChange={handleChange}
                  placeholder="Masukkan deskripsi tambahan"
                  rows={3}
                  value={formData.deskripsi}
                />
              </div>

              {/* Urutan */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  htmlFor="urutan"
                >
                  Urutan
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  id="urutan"
                  min="0"
                  name="urutan"
                  onChange={handleChange}
                  placeholder="0"
                  type="number"
                  value={formData.urutan}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Urutan tampil konten dalam section yang sama
                </p>
              </div>

              {/* Published */}
              <div className="flex items-center">
                <input
                  checked={formData.isPublished}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  id="isPublished"
                  name="isPublished"
                  onChange={handleChange}
                  type="checkbox"
                />
                <label
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="isPublished"
                >
                  Publish konten (tampilkan di website)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  disabled={updateMutation.isLoading}
                  type="submit"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button
                  onClick={handleBack}
                  type="button"
                  variant="outline"
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
}
