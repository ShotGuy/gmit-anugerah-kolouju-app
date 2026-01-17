import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bell,
  FileText,
  Upload,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Pin,
  Calendar,
  Target,
  Settings,
  ArrowLeft,
} from "lucide-react";

import { showToast } from "@/utils/showToast";
import pengumumanService from "@/services/pengumumanService";
import Stepper, {
  StepContent,
  StepperNavigation,
} from "@/components/ui/Stepper";
import { Card } from "@/components/ui/Card";
import PageTitle from "@/components/ui/PageTitle";
import TextInput from "@/components/ui/inputs/TextInput";
import SelectInput from "@/components/ui/inputs/SelectInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import PageHeader from "@/components/ui/PageHeader";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    id: 1,
    title: "Informasi Dasar",
    description: "Judul, kategori, dan jenis pengumuman",
  },
  {
    id: 2,
    title: "Konten Pengumuman",
    description: "Konten dinamis sesuai kategori",
  },
  {
    id: 3,
    title: "Lampiran & Pengaturan",
    description: "Upload file dan pengaturan publikasi",
  },
];

const DynamicContentForm = ({ form, kategoriId, jenisId }) => {
  // Similar to create page - you can implement specific content forms based on category
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <TextAreaInput
          form={form}
          label="Konten Pengumuman"
          name="konten"
          placeholder="Masukkan konten pengumuman..."
          rows={8}
        />
        <TextAreaInput
          form={form}
          label="Konten Tambahan"
          name="kontenDinamis"
          placeholder="Konten tambahan sesuai kategori (opsional)..."
          rows={6}
        />
      </div>
    </Card>
  );
};

export default function EditPengumumanPage() {
  const router = useRouter();
  const { id } = router.query;
  const [currentStep, setCurrentStep] = useState(1);
  const [attachments, setAttachments] = useState([]);

  const form = useForm({
    defaultValues: {
      judul: "",
      kategoriId: "",
      jenisId: "",
      konten: "",
      kontenDinamis: "",
      tanggalPengumuman: new Date(),
      status: "DRAFT",
      prioritas: "MEDIUM",
      isPinned: false,
    },
  });

  // Fetch pengumuman detail
  const { data: pengumumanData, isLoading: isLoadingPengumuman } = useQuery({
    queryKey: ["pengumuman", id],
    queryFn: () => pengumumanService.getById(id),
    enabled: !!id,
    onSuccess: (data) => {
      const pengumuman = data.data;
      form.reset({
        judul: pengumuman.judul || "",
        kategoriId: pengumuman.kategoriId || "",
        jenisId: pengumuman.jenisId || "",
        konten: pengumuman.konten || "",
        kontenDinamis: pengumuman.kontenDinamis || "",
        tanggalPengumuman: pengumuman.tanggalPengumuman
          ? new Date(pengumuman.tanggalPengumuman)
          : new Date(),
        status: pengumuman.status || "DRAFT",
        prioritas: pengumuman.prioritas || "MEDIUM",
        isPinned: pengumuman.isPinned || false,
      });
      setAttachments(pengumuman.attachments || []);
    },
  });

  // Fetch options for dropdowns
  const { data: optionsData } = useQuery({
    queryKey: ["pengumuman-options"],
    queryFn: () => pengumumanService.getOptions(),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => pengumumanService.update(id, data),
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Pengumuman berhasil diperbarui",
        color: "success",
      });
      router.push(`/admin/pengumuman/${id}`);
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal memperbarui pengumuman",
        color: "danger",
      });
    },
  });

  const onSubmit = (data) => {
    const submitData = {
      ...data,
      attachments,
    };

    updateMutation.mutate(submitData);
  };

  const watchKategoriId = form.watch("kategoriId");
  const watchJenisId = form.watch("jenisId");

  const kategoriOptions = optionsData?.data?.kategori || [];
  const jenisOptions =
    kategoriOptions
      .find((k) => k.id === watchKategoriId)
      ?.jenisPengumuman?.map((j) => ({
        value: j.id,
        label: j.nama,
      })) || [];
  const statusOptions = optionsData?.data?.enums?.status || [];
  const prioritasOptions = optionsData?.data?.enums?.prioritas || [];

  if (isLoadingPengumuman) {
    return (
      <div className="space-y-6 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  const pengumuman = pengumumanData?.data || {};

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Pengumuman", href: "/admin/pengumuman" },
          { label: pengumuman.judul || "Edit", href: `/admin/pengumuman/${id}` },
          { label: "Edit" },
        ]}
        description="Perbarui informasi pengumuman"
        title={`Edit: ${pengumuman.judul || "Pengumuman"}`}
      />

      {/* Back Button */}
      <div>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/pengumuman/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Detail
        </Button>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stepper currentStep={currentStep} steps={steps}>
            {/* Step 1: Informasi Dasar */}
            <StepContent stepId={1}>
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="h-6 w-6 text-blue-600" />
                    <PageTitle title="Informasi Dasar" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <TextInput
                        required
                        form={form}
                        label="Judul Pengumuman"
                        name="judul"
                        placeholder="Masukkan judul pengumuman"
                      />
                    </div>

                    <SelectInput
                      required
                      form={form}
                      label="Kategori"
                      name="kategoriId"
                      options={kategoriOptions.map((k) => ({
                        value: k.id,
                        label: k.nama,
                      }))}
                      placeholder="Pilih kategori"
                    />

                    <SelectInput
                      disabled={!watchKategoriId}
                      form={form}
                      label="Jenis Pengumuman"
                      name="jenisId"
                      options={jenisOptions}
                      placeholder="Pilih jenis"
                    />

                    <DatePicker
                      required
                      form={form}
                      label="Tanggal Pengumuman"
                      name="tanggalPengumuman"
                    />

                    <SelectInput
                      required
                      form={form}
                      label="Prioritas"
                      name="prioritas"
                      options={prioritasOptions.map((p) => ({
                        value: p.value,
                        label: p.label,
                      }))}
                    />
                  </div>
                </div>
              </Card>
            </StepContent>

            {/* Step 2: Konten */}
            <StepContent stepId={2}>
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-6 w-6 text-green-600" />
                  <PageTitle title="Konten Pengumuman" />
                </div>

                <DynamicContentForm
                  form={form}
                  jenisId={watchJenisId}
                  kategoriId={watchKategoriId}
                />
              </div>
            </StepContent>

            {/* Step 3: Lampiran & Pengaturan */}
            <StepContent stepId={3}>
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="h-6 w-6 text-purple-600" />
                    <PageTitle title="Pengaturan Publikasi" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectInput
                      required
                      form={form}
                      label="Status"
                      name="status"
                      options={statusOptions.map((s) => ({
                        value: s.value,
                        label: s.label,
                      }))}
                    />

                    <div className="flex items-center space-x-2">
                      <input
                        id="isPinned"
                        type="checkbox"
                        {...form.register("isPinned")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        htmlFor="isPinned"
                      >
                        <Pin className="h-4 w-4 text-red-500" />
                        Pin Pengumuman
                      </label>
                    </div>
                  </div>

                  {/* Attachment Management */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Lampiran</h3>
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        Fitur upload lampiran akan ditambahkan
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Untuk saat ini, kelola lampiran di halaman terpisah
                      </p>
                      <Button
                        className="mt-4"
                        type="button"
                        variant="outline"
                        onClick={() =>
                          router.push(`/admin/pengumuman/${id}/attachments`)
                        }
                      >
                        Kelola Lampiran
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </StepContent>

            {/* Navigation */}
            <StepperNavigation
              currentStep={currentStep}
              isSubmitting={updateMutation.isPending}
              submitLabel="Perbarui Pengumuman"
              totalSteps={steps.length}
              onStepChange={setCurrentStep}
              onSubmit={form.handleSubmit(onSubmit)}
            />
          </Stepper>
        </form>
      </FormProvider>
    </div>
  );
}