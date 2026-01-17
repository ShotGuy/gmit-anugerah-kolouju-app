import { useState } from "react";
import {
  Edit2,
  Save,
  X,
  User,
  Calendar,
  Users,
  Heart,
  Briefcase,
  GraduationCap,
  DollarSign,
  Shield,
} from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import TextInput from "@/components/ui/inputs/TextInput";
import SelectInput from "@/components/ui/inputs/SelectInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import { showToast } from "@/utils/showToast";
import { useAuth } from "@/contexts/AuthContext";

const jemaatSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  jenisKelamin: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === "string") {
      return val === "true";
    }
    return val;
  }),
  tanggalLahir: z
    .string()
    .min(1, "Tanggal lahir harus diisi")
    .transform((str) => new Date(str)),
  idStatusDalamKeluarga: z
    .string()
    .min(1, "Status dalam keluarga harus dipilih"),
  idSuku: z.string().min(1, "Suku harus dipilih"),
  idPendidikan: z.string().min(1, "Pendidikan harus dipilih"),
  idPekerjaan: z.string().min(1, "Pekerjaan harus dipilih"),
  idPendapatan: z.string().min(1, "Pendapatan harus dipilih"),
  idJaminanKesehatan: z.string().min(1, "Jaminan kesehatan harus dipilih"),
  golonganDarah: z.string().optional(),
});

const jenisKelaminOptions = [
  { value: "true", label: "Laki-laki" },
  { value: "false", label: "Perempuan" },
];

const golonganDarahOptions = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
  { value: "O", label: "O" },
];

export default function JemaatProfileSection({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const { refreshUser } = useAuth();

  const jemaat = user.jemaat;

  if (!jemaat) return null;

  const methods = useForm({
    resolver: zodResolver(jemaatSchema),
    defaultValues: {
      nama: jemaat.nama || "",
      jenisKelamin: jemaat.jenisKelamin?.toString() || "",
      tanggalLahir: jemaat.tanggalLahir
        ? new Date(jemaat.tanggalLahir).toISOString().split("T")[0]
        : "",
      idStatusDalamKeluarga: jemaat.idStatusDalamKeluarga || "",
      idSuku: jemaat.idSuku || "",
      idPendidikan: jemaat.idPendidikan || "",
      idPekerjaan: jemaat.idPekerjaan || "",
      idPendapatan: jemaat.idPendapatan || "",
      idJaminanKesehatan: jemaat.idJaminanKesehatan || "",
      golonganDarah: jemaat.golonganDarah || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch(`/api/jemaat/${jemaat.id}`, data);
      return response.data;
    },
    onSuccess: async () => {
      showToast({
        title: "Berhasil",
        description: "Profil jemaat berhasil diperbarui",
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
          <User className="h-5 w-5 mr-2" />
          Profil Jemaat
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
                {jemaat.nama}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Jenis Kelamin</span>
              <span className="block text-gray-800 font-medium">
                {jemaat.jenisKelamin ? "Laki-laki" : "Perempuan"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Tanggal Lahir</span>
              <span className="block text-gray-800 font-medium">
                {jemaat.tanggalLahir
                  ? new Date(jemaat.tanggalLahir).toLocaleDateString("id-ID")
                  : "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">
                Status dalam Keluarga
              </span>
              <span className="block text-gray-800 font-medium">
                {jemaat.statusDalamKeluarga?.status || "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Suku</span>
              <span className="block text-gray-800 font-medium">
                {jemaat.suku?.namaSuku || "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Pendidikan</span>
              <span className="block text-gray-800 font-medium">
                {jemaat.pendidikan?.jenjang || "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Pekerjaan</span>
              <span className="block text-gray-800 font-medium">
                {jemaat.pekerjaan?.namaPekerjaan || "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Pendapatan</span>
              <span className="block text-gray-800 font-medium">
                {jemaat.pendapatan?.label || "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">
                Jaminan Kesehatan
              </span>
              <span className="block text-gray-800 font-medium">
                {jemaat.jaminanKesehatan?.jenisJaminan || "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">
                Golongan Darah
              </span>
              <span className="block text-gray-800 font-medium">
                {jemaat.golonganDarah || "-"}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm">Keluarga</span>
              <span className="block text-gray-800 font-medium">
                Bangunan {jemaat.keluarga?.noBagungan} -{" "}
                {jemaat.keluarga?.rayon?.namaRayon}
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
                  name="nama"
                  placeholder="Masukkan nama lengkap"
                />

                <SelectInput
                  required
                  label="Jenis Kelamin"
                  name="jenisKelamin"
                  options={jenisKelaminOptions}
                  placeholder="Pilih jenis kelamin"
                />

                <DatePicker
                  required
                  label="Tanggal Lahir"
                  name="tanggalLahir"
                  placeholder="Pilih tanggal lahir"
                />

                <AutoCompleteInput
                  required
                  apiEndpoint="/status-dalam-keluarga/options"
                  label="Status dalam Keluarga"
                  name="idStatusDalamKeluarga"
                  placeholder="Pilih status dalam keluarga"
                />

                <AutoCompleteInput
                  required
                  apiEndpoint="/suku/options"
                  label="Suku"
                  name="idSuku"
                  placeholder="Pilih suku"
                />

                <AutoCompleteInput
                  required
                  apiEndpoint="/pendidikan/options"
                  label="Pendidikan"
                  name="idPendidikan"
                  placeholder="Pilih pendidikan"
                />

                <AutoCompleteInput
                  required
                  apiEndpoint="/pekerjaan/options"
                  label="Pekerjaan"
                  name="idPekerjaan"
                  placeholder="Pilih pekerjaan"
                />

                <AutoCompleteInput
                  required
                  apiEndpoint="/pendapatan/options"
                  label="Pendapatan"
                  name="idPendapatan"
                  placeholder="Pilih kategori pendapatan"
                />

                <AutoCompleteInput
                  required
                  apiEndpoint="/jaminan-kesehatan/options"
                  label="Jaminan Kesehatan"
                  name="idJaminanKesehatan"
                  placeholder="Pilih jaminan kesehatan"
                />

                <SelectInput
                  label="Golongan Darah"
                  name="golonganDarah"
                  options={golonganDarahOptions}
                  placeholder="Pilih golongan darah"
                />
              </div>
            </form>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  );
}
