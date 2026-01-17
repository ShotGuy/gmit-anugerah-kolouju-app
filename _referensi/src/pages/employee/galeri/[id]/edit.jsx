  import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DatePicker from "@/components/ui/inputs/DatePicker";
import SwitchInput from "@/components/ui/inputs/SwitchInput";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import TextInput from "@/components/ui/inputs/TextInput";
import PageHeader from "@/components/ui/PageHeader";
import { showToast } from "@/utils/showToast";

const galeriSchema = z.object({
  namaKegiatan: z
    .string()
    .min(1, "Nama kegiatan harus diisi")
    .max(255, "Nama kegiatan maksimal 255 karakter"),
  deskripsi: z.string().optional(),
  tempat: z
    .string()
    .min(1, "Tempat harus diisi")
    .max(255, "Tempat maksimal 255 karakter"),
  tanggalKegiatan: z.string().min(1, "Tanggal kegiatan harus diisi"),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
});

export default function EditGaleriPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const [fotos, setFotos] = useState([]);
  const [fotosToDelete, setFotosToDelete] = useState([]);
  const [uploading, setUploading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(galeriSchema),
    defaultValues: {
      namaKegiatan: "",
      deskripsi: "",
      tempat: "",
      tanggalKegiatan: "",
      isActive: true,
      isPublished: false,
    },
  });

  const { data: galeri, isLoading: loadingGaleri } = useQuery({
    queryKey: ["galeri", id],
    queryFn: async () => {
      const response = await axios.get(`/api/galeri/${id}`);

      return response.data.data;
    },
    enabled: !!id,
  });

  // Use useEffect to populate form when data is loaded
  React.useEffect(() => {
    if (galeri) {
      // Handle fotos - can be array (detail API) or JSON string (list API)
      let parsedFotos = [];

      if (galeri.fotos) {
        // If it's already an array, use it directly
        if (Array.isArray(galeri.fotos)) {
          parsedFotos = galeri.fotos;
        }
        // If it's a string, try to parse as JSON
        else if (typeof galeri.fotos === "string") {
          try {
            parsedFotos = JSON.parse(galeri.fotos);
          } catch (error) {
            console.error("Failed to parse fotos JSON:", error);
            parsedFotos = [];
          }
        }
      }
      setFotos(parsedFotos);
      methods.reset({
        namaKegiatan: galeri.namaKegiatan,
        deskripsi: galeri.deskripsi || "",
        tempat: galeri.tempat,
        tanggalKegiatan: new Date(galeri.tanggalKegiatan)
          .toISOString()
          .split("T")[0],
        isActive: galeri.isActive,
        isPublished: galeri.isPublished,
      });
    }
  }, [galeri, methods]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const finalFotos = fotos.filter(
        (_, index) => !fotosToDelete.includes(index)
      );

      const response = await axios.patch(`/api/galeri/${id}`, {
        ...data,
        fotos: finalFotos,
      });

      return response.data;
    },
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Galeri berhasil diperbarui",
        color: "success",
      });
      // Invalidate galeri queries to refresh the list and detail
      queryClient.invalidateQueries(["galeri"]);
      router.push(`/employee/galeri/${id}`);
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal memperbarui galeri",
        color: "error",
      });
    },
  });

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();

        formData.append("file", file);

        const response = await axios.post("/api/galeri/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return {
          url: response.data.data.url,
          caption: "",
          uploadedAt: new Date().toISOString(),
        };
      });

      const uploadedFotos = await Promise.all(uploadPromises);

      setFotos((prev) => [...prev, ...uploadedFotos]);

      showToast({
        title: "Berhasil",
        description: `${files.length} foto berhasil diunggah`,
        color: "success",
      });
    } catch (error) {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal mengunggah foto",
        color: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFoto = (index) => {
    setFotosToDelete((prev) => [...prev, index]);
  };

  const handleRestoreFoto = (index) => {
    setFotosToDelete((prev) => prev.filter((i) => i !== index));
  };

  const handleUpdateCaption = (index, caption) => {
    setFotos((prev) =>
      prev.map((foto, i) => (i === index ? { ...foto, caption } : foto))
    );
  };

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  if (loadingGaleri) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            Memuat data galeri...
          </p>
        </div>
      </div>
    );
  }

  if (!galeri) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">
            Galeri tidak ditemukan
          </p>
          <Button onClick={() => router.push("/employee/galeri")}>Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Employee", href: "/employee/dashboard" },
          { label: "Galeri", href: "/employee/galeri" },
          { label: galeri.namaKegiatan, href: `/employee/galeri/${id}` },
          { label: "Edit" },
        ]}
        description="Edit informasi dan foto galeri kegiatan"
        title="Edit Galeri"
      />

      <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        <div className="mb-6 flex items-center justify-between">
          <Button
            className="flex items-center"
            variant="outline"
            onClick={() => router.push("/employee/galeri")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          <Button
            className="flex items-center"
            disabled={updateMutation.isLoading}
            onClick={methods.handleSubmit(onSubmit)}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

        <FormProvider {...methods}>
          <form className="space-y-6" onSubmit={methods.handleSubmit(onSubmit)}>
            {/* Form Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kegiatan</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <TextInput
                    required
                    label="Nama Kegiatan"
                    name="namaKegiatan"
                    placeholder="Masukkan nama kegiatan"
                  />
                </div>

                <DatePicker
                  required
                  label="Tanggal Kegiatan"
                  name="tanggalKegiatan"
                />

                <TextInput
                  required
                  label="Tempat"
                  name="tempat"
                  placeholder="Masukkan lokasi kegiatan"
                />

                <div className="md:col-span-2">
                  <TextAreaInput
                    label="Deskripsi"
                    name="deskripsi"
                    placeholder="Deskripsi kegiatan (opsional)"
                    rows={3}
                  />
                </div>

                <SwitchInput
                  description="Galeri aktif dapat dilihat oleh staff"
                  label="Status Aktif"
                  name="isActive"
                />

                <SwitchInput
                  description="Galeri terpublikasi dapat dilihat oleh publik"
                  label="Publikasikan"
                  name="isPublished"
                />
              </CardContent>
            </Card>

            {/* Foto Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Foto Kegiatan ({fotos.length - fotosToDelete.length})
                  </CardTitle>
                  <div className="relative">
                    <input
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      id="foto-upload"
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <Button
                      className="flex items-center"
                      disabled={uploading}
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("foto-upload").click()
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {uploading ? "Mengunggah..." : "Tambah Foto"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {fotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {fotos.map((foto, index) => (
                      <div
                        key={index}
                        className={`relative group ${
                          fotosToDelete.includes(index)
                            ? "opacity-50 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
                            : "bg-gray-100 dark:bg-gray-800"
                        } rounded-lg overflow-hidden transition-colors`}
                      >
                        <div className="aspect-square">
                          <img
                            alt={foto.caption || `Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                            src={foto.url}
                          />
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                            {fotosToDelete.includes(index) ? (
                              <Button
                                className="bg-white text-gray-700"
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => handleRestoreFoto(index)}
                              >
                                Restore
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                type="button"
                                variant="destructive"
                                onClick={() => handleDeleteFoto(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Caption Input */}
                        <div className="p-2">
                          <input
                            className="w-full text-xs border dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            disabled={fotosToDelete.includes(index)}
                            placeholder="Keterangan foto..."
                            type="text"
                            value={foto.caption || ""}
                            onChange={(e) =>
                              handleUpdateCaption(index, e.target.value)
                            }
                          />
                        </div>

                        {/* Delete Indicator */}
                        {fotosToDelete.includes(index) && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                            Akan Dihapus
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="mb-4">Belum ada foto untuk kegiatan ini</p>
                    <Button
                      disabled={uploading}
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("foto-upload").click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Mengunggah..." : "Unggah Foto"}
                    </Button>
                  </div>
                )}

                {fotosToDelete.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors">
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      {fotosToDelete.length} foto akan dihapus. Klik "Simpan"
                      untuk mengkonfirmasi perubahan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </FormProvider>
      </div>
    </>
  );
}

EditGaleriPage.getLayout = function getLayout(page) {
  return <EmployeeLayout>{page}</EmployeeLayout>;
};
