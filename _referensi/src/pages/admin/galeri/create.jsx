import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import PageTitle from "@/components/ui/PageTitle";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import TextInput from "@/components/ui/inputs/TextInput";
import galeriService from "@/services/galeriService";
import { showToast } from "@/utils/showToast";

// Photo Upload Component
function PhotoUploadSection({ photos, setPhotos }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    try {
      // Validasi files sebelum preview
      galeriService.validateFiles(files);

      // Buat preview tanpa upload dulu
      const newPhotos = files.map((file) => ({
        file: file, // File asli untuk upload nanti
        originalName: file.name,
        size: file.size,
        mimetype: file.type,
        previewUrl: URL.createObjectURL(file), // Untuk preview saja
        isNew: true, // Flag untuk tahu ini file baru
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);

      showToast({
        title: "Berhasil",
        description: `${files.length} foto ditambahkan untuk di-upload`,
        color: "success",
      });
    } catch (error) {
      showToast({
        title: "Gagal",
        description: error.message || "Gagal memilih foto",
        color: "danger",
      });
    } finally {
      // Reset input
      event.target.value = "";
    }
  };

  const removePhoto = (index) => {
    const photoToRemove = photos[index];

    // Bersihkan preview URL jika ada
    if (photoToRemove.previewUrl) {
      URL.revokeObjectURL(photoToRemove.previewUrl);
    }

    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Foto Kegiatan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button
                className="relative"
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                Pilih Foto
              </Button>
              <input
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                type="file"
                onChange={handleFileSelect}
              />
              <p className="mt-2 text-sm text-gray-500">
                PNG, JPG, JPEG, WEBP (Max 5MB per file, max 10 files)
              </p>
            </div>
          </div>
        </div>

        {/* File Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Panduan Upload Foto
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Format yang didukung: PNG, JPG, JPEG, WEBP</li>
                  <li>Ukuran maksimal: 5MB per foto</li>
                  <li>Upload maksimal 10 foto sekaligus</li>
                  <li>Foto akan disimpan ke cloud storage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Photos Preview */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-500" />
              Foto Terpilih ({photos.length}) - Akan diupload saat submit
            </h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-700">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Foto belum terupload ke server. Klik "Simpan Galeri" untuk
                mengupload semua foto.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      alt={photo.originalName}
                      className="w-full h-full object-cover"
                      src={photo.previewUrl || photo.url}
                    />
                    <button
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {photo.isNew && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                        Siap upload
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 truncate">
                      {photo.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(photo.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CreateGaleri() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      namaKegiatan: "",
      deskripsi: "",
      tempat: "",
      tanggalKegiatan: "",
      isPublished: false,
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: galeriService.create,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Galeri berhasil dibuat",
        color: "success",
      });
      // Invalidate galeri queries to refresh the list
      queryClient.invalidateQueries(["galeri"]);
      router.push("/admin/galeri");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal membuat galeri",
        color: "danger",
      });
    },
  });

  const handleSubmit = async (data) => {
    try {
      if (photos.length === 0) {
        showToast({
          title: "Validasi Gagal",
          description: "Minimal upload 1 foto untuk galeri",
          color: "danger",
        });

        return;
      }

      setIsUploading(true);

      // Upload foto yang baru dipilih ke S3
      const newPhotos = photos.filter((photo) => photo.isNew);
      const existingPhotos = photos.filter((photo) => !photo.isNew);

      let uploadedPhotos = [...existingPhotos];

      if (newPhotos.length > 0) {
        const filesToUpload = newPhotos.map((photo) => photo.file);
        const uploadResult = await galeriService.uploadPhotos(filesToUpload);

        if (uploadResult.success) {
          uploadedPhotos = [...uploadedPhotos, ...uploadResult.data.files];
        } else {
          throw new Error(uploadResult.message || "Gagal mengupload foto");
        }
      }

      const submitData = {
        ...data,
        fotos: uploadedPhotos,
      };

      await createMutation.mutateAsync(submitData);

      // Bersihkan preview URLs
      photos.forEach((photo) => {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl);
        }
      });
    } catch (error) {
      console.error("Submit error:", error);
      showToast({
        title: "Gagal",
        description: error.message || "Gagal menyimpan galeri",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = createMutation.isLoading || isUploading;

  return (
    <div className="space-y-6 p-4">
      <PageTitle title="Buat Galeri Baru" />
      <PageHeader
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Galeri", href: "/admin/galeri" },
          { label: "Buat Baru" },
        ]}
        description="Dokumentasikan kegiatan gereja dalam galeri foto"
        title="Buat Galeri Baru"
      />

      <FormProvider {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          {/* Form Informasi Kegiatan */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kegiatan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <TextInput
                    required
                    label="Nama Kegiatan"
                    name="namaKegiatan"
                    placeholder="Masukkan nama kegiatan..."
                    validation={{
                      required: "Nama kegiatan wajib diisi",
                      maxLength: {
                        value: 255,
                        message: "Nama kegiatan maksimal 255 karakter",
                      },
                    }}
                  />
                </div>

                <TextInput
                  required
                  label="Tempat Kegiatan"
                  name="tempat"
                  placeholder="Masukkan lokasi/tempat kegiatan..."
                  validation={{
                    required: "Tempat kegiatan wajib diisi",
                    maxLength: {
                      value: 255,
                      message: "Tempat maksimal 255 karakter",
                    },
                  }}
                />

                <DatePicker
                  required
                  label="Tanggal Kegiatan"
                  name="tanggalKegiatan"
                  validation={{ required: "Tanggal kegiatan wajib diisi" }}
                />

                <div className="lg:col-span-2">
                  <TextAreaInput
                    label="Deskripsi"
                    name="deskripsi"
                    placeholder="Tuliskan deskripsi kegiatan... (opsional)"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload Section */}
          <PhotoUploadSection photos={photos} setPhotos={setPhotos} />

          {/* Publishing Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Publikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <input
                  id="isPublished"
                  type="checkbox"
                  {...form.register("isPublished")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  className="text-sm font-medium text-gray-900"
                  htmlFor="isPublished"
                >
                  Publikasikan galeri (akan tampil di website publik)
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Jika tidak dicentang, galeri akan disimpan sebagai draft dan
                hanya bisa diakses oleh admin
              </p>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex justify-end gap-4">
            <Button
              disabled={isSubmitting}
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/galeri")}
            >
              Batal
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? "Mengupload foto..." : "Menyimpan..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Simpan & Upload Galeri
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
