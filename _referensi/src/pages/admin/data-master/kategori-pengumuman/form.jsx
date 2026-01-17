import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import masterService from "@/services/masterService";
import TextInput from "@/components/ui/inputs/TextInput";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import RichTextInput from "@/components/ui/inputs/RichTextInput";
import ToggleInput from "@/components/ui/inputs/ToggleInput";

export default function KategoriPengumumanForm() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    pasalDeskripsi: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // Fetch data jika edit mode
  const { data: kategoriData, isLoading } = useQuery({
    queryKey: ["kategori-pengumuman", id],
    queryFn: async () => {
      const response = await masterService.getKategoriPengumuman({
        limit: -1,
      });
      const item = response.data.items.find((item) => item.id === id);
      return item;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (kategoriData) {
      setFormData({
        nama: kategoriData.nama || "",
        deskripsi: kategoriData.deskripsi || "",
        pasalDeskripsi: kategoriData.pasalDeskripsi || "",
        isActive: kategoriData.isActive ?? true,
      });
    }
  }, [kategoriData]);

  // Mutation untuk create
  const createMutation = useMutation({
    mutationFn: (data) => masterService.createKategoriPengumuman(data),
    onSuccess: () => {
      toast.success("Kategori pengumuman berhasil ditambahkan");
      queryClient.invalidateQueries(["kategori-pengumuman"]);
      router.push("/admin/data-master/kategori-pengumuman");
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      }
      toast.error(errorData?.message || "Gagal menambahkan kategori pengumuman");
    },
  });

  // Mutation untuk update
  const updateMutation = useMutation({
    mutationFn: (data) => masterService.updateKategoriPengumuman(id, data),
    onSuccess: () => {
      toast.success("Kategori pengumuman berhasil diperbarui");
      queryClient.invalidateQueries(["kategori-pengumuman"]);
      router.push("/admin/data-master/kategori-pengumuman");
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      }
      toast.error(errorData?.message || "Gagal memperbarui kategori pengumuman");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validasi
    const newErrors = {};
    if (!formData.nama.trim()) {
      newErrors.nama = "Nama kategori wajib diisi";
    }
    if (formData.nama.trim().length < 2) {
      newErrors.nama = "Nama kategori minimal 2 karakter";
    }
    if (formData.nama.trim().length > 100) {
      newErrors.nama = "Nama kategori maksimal 100 karakter";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      nama: formData.nama.trim(),
      deskripsi: formData.deskripsi.trim() || null,
      pasalDeskripsi: formData.pasalDeskripsi || null,
      isActive: formData.isActive,
    };

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleCancel = () => {
    router.push("/admin/data-master/kategori-pengumuman");
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm breadcrumbs mb-4">
        <ul>
          <li>
            <a href="/admin/dashboard" className="text-primary hover:underline">
              Admin
            </a>
          </li>
          <li>
            <a
              href="/admin/data-master/kategori-pengumuman"
              className="text-primary hover:underline"
            >
              Kategori Pengumuman
            </a>
          </li>
          <li className="text-gray-700 dark:text-gray-300">
            {isEditMode ? "Edit" : "Tambah"} Kategori
          </li>
        </ul>
      </nav>

      {/* Form Card */}
      <div className="card bg-white dark:bg-gray-800 shadow-xl">
        <div className="card-body">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit" : "Tambah"} Kategori Pengumuman
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Lengkapi form di bawah untuk{" "}
              {isEditMode ? "memperbarui" : "menambahkan"} kategori pengumuman
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Kategori */}
            <TextInput
              name="nama"
              label="Nama Kategori"
              placeholder="Contoh: Kategorial, Umum, Khusus"
              value={formData.nama}
              onChange={(val) => setFormData({ ...formData, nama: val })}
              error={errors.nama}
              required
            />

            {/* Deskripsi */}
            <TextAreaInput
              name="deskripsi"
              label="Deskripsi"
              placeholder="Deskripsi kategori pengumuman (opsional)"
              value={formData.deskripsi}
              onChange={(val) => setFormData({ ...formData, deskripsi: val })}
              error={errors.deskripsi}
              rows={3}
            />

            {/* Pasal Deskripsi dengan Quill Editor */}
            <RichTextInput
              name="pasalDeskripsi"
              label="Pasal & Deskripsi Lengkap"
              placeholder="Tulis pasal dan deskripsi lengkap kategori pengumuman..."
              value={formData.pasalDeskripsi}
              onChange={(val) => setFormData({ ...formData, pasalDeskripsi: val })}
              error={errors.pasalDeskripsi}
              description="Gunakan editor untuk menulis pasal (Pasal 1, 2, 3, dst.) dan deskripsi lengkap dengan format HTML"
              minHeight="300px"
            />

            {/* Status Aktif */}
            <div className="form-control">
              <ToggleInput
                name="isActive"
                label="Status Aktif"
                value={formData.isActive}
                onChange={(val) => setFormData({ ...formData, isActive: val })}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {formData.isActive
                  ? "Kategori aktif dapat digunakan untuk membuat pengumuman"
                  : "Kategori tidak aktif"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancel}
              >
                <ArrowLeft size={18} />
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {isEditMode ? "Perbarui" : "Simpan"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
