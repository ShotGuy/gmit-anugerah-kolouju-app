import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Edit2, Save, Shield, X } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TextInput from "@/components/ui/inputs/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/utils/showToast";

const majelisSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap harus diisi"),
  mulai: z
    .string()
    .min(1, "Tanggal mulai harus diisi")
    .transform((str) => new Date(str)),
  selesai: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : null)),
  jenisJabatanId: z.string().optional(),
  idRayon: z.string().optional(),
});

export default function MajelisProfileSection({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const { refreshUser } = useAuth();

  const majelis = user.majelis;

  if (!majelis) return null;

  const methods = useForm({
    resolver: zodResolver(majelisSchema),
    defaultValues: {
      namaLengkap: majelis.namaLengkap || "",
      mulai: majelis.mulai
        ? new Date(majelis.mulai).toISOString().split("T")[0]
        : "",
      selesai: majelis.selesai
        ? new Date(majelis.selesai).toISOString().split("T")[0]
        : "",
      jenisJabatanId: majelis.jenisJabatanId || "",
      idRayon: majelis.idRayon || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch(`/api/majelis/${majelis.id}`, data);

      return response.data;
    },
    onSuccess: async () => {
      showToast({
        title: "Berhasil",
        description: "Profil majelis berhasil diperbarui",
        color: "success",
      });
      setIsEditing(false);
      await refreshUser();
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal memperbarui profil",
        color: "danger",
      });
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    methods.reset();
    setIsEditing(false);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Profil Majelis
        </CardTitle>
        {!isEditing ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button
              disabled={updateMutation.isLoading}
              size="sm"
              onClick={methods.handleSubmit(onSubmit)}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-gray-500 text-sm">Nama Lengkap</span>
              <span className="block text-gray-800 font-medium">
                {majelis.namaLengkap}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Jenis Jabatan</span>
              <span className="block text-gray-800 font-medium">
                {majelis.jenisJabatan?.namaJabatan || "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Tanggal Mulai</span>
              <span className="block text-gray-800 font-medium">
                {majelis.mulai
                  ? new Date(majelis.mulai).toLocaleDateString("id-ID")
                  : "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">
                Tanggal Selesai
              </span>
              <span className="block text-gray-800 font-medium">
                {majelis.selesai
                  ? new Date(majelis.selesai).toLocaleDateString("id-ID")
                  : "Aktif"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Rayon</span>
              <span className="block text-gray-800 font-medium">
                {majelis.rayon?.namaRayon || "-"}
              </span>
            </div>

            {majelis.jemaat && (
              <div>
                <span className="block text-gray-500 text-sm">
                  Sebagai Jemaat
                </span>
                <span className="block text-gray-800 font-medium">
                  {majelis.jemaat.nama}
                </span>
              </div>
            )}

            <div className="md:col-span-2">
              <span className="block text-gray-500 text-sm">Status</span>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                  majelis.selesai
                    ? "bg-gray-100 text-gray-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {majelis.selesai ? "Tidak Aktif" : "Aktif"}
              </span>
            </div>
          </div>
        ) : (
          <FormProvider {...methods}>
            <form
              className="space-y-4"
              onSubmit={methods.handleSubmit(onSubmit)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  required
                  label="Nama Lengkap"
                  name="namaLengkap"
                  placeholder="Masukkan nama lengkap"
                />

                <AutoCompleteInput
                  apiEndpoint="/jenis-jabatan/options"
                  label="Jenis Jabatan"
                  name="jenisJabatanId"
                  placeholder="Pilih jenis jabatan"
                />

                <DatePicker
                  required
                  label="Tanggal Mulai"
                  name="mulai"
                  placeholder="Pilih tanggal mulai"
                />

                <DatePicker
                  label="Tanggal Selesai"
                  name="selesai"
                  placeholder="Pilih tanggal selesai (opsional)"
                />

                <AutoCompleteInput
                  apiEndpoint="/rayon/options"
                  label="Rayon"
                  name="idRayon"
                  placeholder="Pilih rayon"
                />
              </div>
            </form>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  );
}
