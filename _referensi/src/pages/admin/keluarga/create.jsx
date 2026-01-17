import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import PageTitle from "@/components/ui/PageTitle";
import Stepper, {
  StepContent,
  StepperNavigation,
} from "@/components/ui/Stepper";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import NumberInput from "@/components/ui/inputs/NumberInput";
import TextInput from "@/components/ui/inputs/TextInput";
import SkeletonInput from "@/components/ui/skeletons/SkeletonInput";
import keluargaService from "@/services/keluargaService";
import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";

const steps = [
  {
    id: 1,
    title: "Data Keluarga",
    description: "Informasi dasar keluarga",
  },
  {
    id: 2,
    title: "Alamat",
    description: "Alamat keluarga",
  },
];

export default function CreateKeluarga() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm({
    defaultValues: {
      idStatusKeluarga: "",
      idStatusKepemilikanRumah: "",
      idKeadaanRumah: "",
      idRayon: "",
      noBagungan: "",
      noKK: "",
      idKelurahan: "",
      rt: "",
      rw: "",
      jalan: "",
    },
  });

  // Fetch master data with loading states
  const { data: statusKeluarga, isLoading: isLoadingStatusKeluarga } = useQuery(
    {
      queryKey: ["status-keluarga"],
      queryFn: () => masterService.getStatusKeluarga(),
    }
  );

  const {
    data: statusKepemilikanRumah,
    isLoading: isLoadingStatusKepemilikanRumah,
  } = useQuery({
    queryKey: ["status-kepemilikan-rumah"],
    queryFn: () => masterService.getStatusKepemilikanRumah(),
  });

  const { data: keadaanRumah, isLoading: isLoadingKeadaanRumah } = useQuery({
    queryKey: ["keadaan-rumah"],
    queryFn: () => masterService.getKeadaanRumah(),
  });

  const { data: rayon, isLoading: isLoadingRayon } = useQuery({
    queryKey: ["rayon"],
    queryFn: () => masterService.getRayon(),
  });

  const { data: kelurahan, isLoading: isLoadingKelurahan } = useQuery({
    queryKey: ["kelurahan"],
    queryFn: () => masterService.getKelurahan(),
  });

  // Transform data for AutoCompleteInput
  const statusKeluargaOptions =
    statusKeluarga?.data?.items?.map((item) => ({
      value: item.id,
      label: item.status,
    })) || [];

  const statusKepemilikanRumahOptions =
    statusKepemilikanRumah?.data?.items?.map((item) => ({
      value: item.id,
      label: item.status,
    })) || [];

  const keadaanRumahOptions =
    keadaanRumah?.data?.items?.map((item) => ({
      value: item.id,
      label: item.keadaan,
    })) || [];

  const rayonOptions =
    rayon?.data?.items?.map((item) => ({
      value: item.id,
      label: item.namaRayon,
    })) || [];

  const kelurahanOptions =
    kelurahan?.data?.items?.map((item) => ({
      value: item.id,
      label: item.kodepos ? `${item.nama} - ${item.kodepos}` : item.nama,
    })) || [];

  const createKeluargaMutation = useMutation({
    mutationFn: keluargaService.create,
    onSuccess: (data) => {
      showToast({
        title: "Berhasil",
        description:
          "Keluarga berhasil dibuat! Sekarang tambahkan jemaat sebagai kepala keluarga.",
        color: "success",
      });

      // Invalidate rayon queries to update family counts
      queryClient.invalidateQueries({ queryKey: ["rayon"] });

      // Redirect ke halaman create jemaat dengan pre-filled keluarga ID
      router.push(
        `/admin/jemaat/create?keluargaId=${data.data.id}&isKepalaKeluarga=true`
      );
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal membuat keluarga",
        color: "error",
      });
    },
  });

  const handleNext = () => {
    if (currentStep === 1) {
      // Check if data is still loading
      const isDataLoaded =
        !isLoadingStatusKeluarga &&
        !isLoadingStatusKepemilikanRumah &&
        !isLoadingKeadaanRumah &&
        !isLoadingRayon;

      if (!isDataLoaded) {
        showToast({
          title: "Tunggu",
          description: "Data masih dimuat, mohon tunggu sebentar",
          color: "warning",
        });

        return;
      }

      // Validate keluarga data
      const values = form.getValues();

      if (
        !values.idStatusKeluarga ||
        !values.idStatusKepemilikanRumah ||
        !values.idKeadaanRumah ||
        !values.idRayon ||
        !values.noBagungan ||
        !values.noKK
      ) {
        showToast({
          title: "Error",
          description: "Semua field wajib harus diisi",
          color: "error",
        });

        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Watch form values untuk real-time validation
  const watchedValues = form.watch([
    "idStatusKeluarga",
    "idStatusKepemilikanRumah",
    "idKeadaanRumah",
    "idRayon",
    "noBagungan",
    "noKK",
    "idKelurahan",
    "rt",
    "rw",
    "jalan",
  ]);

  const canGoNext = () => {
    const values = form.getValues();

    if (currentStep === 1) {
      // Check if all required data is loaded and fields are filled
      const isDataLoaded =
        !isLoadingStatusKeluarga &&
        !isLoadingStatusKepemilikanRumah &&
        !isLoadingKeadaanRumah &&
        !isLoadingRayon;

      if (!isDataLoaded) return false;

      const canProceed = !!(
        values.idStatusKeluarga &&
        values.idStatusKepemilikanRumah &&
        values.idKeadaanRumah &&
        values.idRayon &&
        values.noBagungan &&
        values.noBagungan.toString().trim() !== "" &&
        values.noKK &&
        values.noKK.toString().trim() !== ""
      );

      return canProceed;
    }

    if (currentStep === 2) {
      // Check if kelurahan data is loaded
      if (isLoadingKelurahan) return false;

      const canProceed = !!(
        values.idKelurahan &&
        values.rt &&
        values.rw &&
        values.jalan &&
        values.rt.toString().trim() !== "" &&
        values.rw.toString().trim() !== "" &&
        values.jalan.trim() !== ""
      );

      return canProceed;
    }

    return true;
  };

  const handleSubmit = async () => {
    const values = form.getValues();

    // Validate all required fields
    if (
      !values.idStatusKeluarga ||
      !values.idStatusKepemilikanRumah ||
      !values.idKeadaanRumah ||
      !values.idRayon ||
      !values.noBagungan ||
      !values.noKK ||
      !values.idKelurahan ||
      !values.rt ||
      !values.rw ||
      !values.jalan
    ) {
      showToast({
        title: "Error",
        description: "Semua field wajib harus diisi",
        color: "error",
      });

      return;
    }

    // Create alamat first
    const alamatData = {
      idKelurahan: values.idKelurahan,
      rt: parseInt(values.rt),
      rw: parseInt(values.rw),
      jalan: values.jalan,
    };

    // Create keluarga with alamat
    const submitData = {
      idStatusKeluarga: values.idStatusKeluarga,
      idStatusKepemilikanRumah: values.idStatusKepemilikanRumah,
      idKeadaanRumah: values.idKeadaanRumah,
      idRayon: values.idRayon,
      noBagungan: Number(values.noBagungan) || 0, // Use Number() with fallback
      noKK: values.noKK,
      alamat: alamatData,
    };

    createKeluargaMutation.mutate(submitData);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageTitle title="Tambah Keluarga Baru" />
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Keluarga", href: "/admin/keluarga" },
          { label: "Tambah Keluarga" },
        ]}
        description="Lengkapi data keluarga dengan mengikuti langkah-langkah berikut"
        title="Tambah Keluarga Baru"
      />

      <Card className="p-6 mt-4">
        <Stepper currentStep={currentStep} steps={steps} />

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Step 1: Data Keluarga */}
            {currentStep === 1 && (
              <StepContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {isLoadingStatusKeluarga ? (
                      <SkeletonInput />
                    ) : (
                      <AutoCompleteInput
                        required
                        label="Status Keluarga"
                        name="idStatusKeluarga"
                        options={statusKeluargaOptions}
                        placeholder="Pilih status keluarga"
                      />
                    )}
                  </div>

                  <div>
                    {isLoadingStatusKepemilikanRumah ? (
                      <SkeletonInput />
                    ) : (
                      <AutoCompleteInput
                        required
                        label="Status Kepemilikan Rumah"
                        name="idStatusKepemilikanRumah"
                        options={statusKepemilikanRumahOptions}
                        placeholder="Pilih status kepemilikan"
                      />
                    )}
                  </div>

                  <div>
                    {isLoadingKeadaanRumah ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    ) : (
                      <AutoCompleteInput
                        required
                        label="Keadaan Rumah"
                        name="idKeadaanRumah"
                        options={keadaanRumahOptions}
                        placeholder="Pilih keadaan rumah"
                      />
                    )}
                  </div>

                  <div>
                    {isLoadingRayon ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    ) : (
                      <AutoCompleteInput
                        required
                        label="Rayon"
                        name="idRayon"
                        options={rayonOptions}
                        placeholder="Pilih rayon"
                      />
                    )}
                  </div>

                  <NumberInput
                    required
                    label="No. Bagungan"
                    min={1}
                    name="noBagungan"
                    placeholder="Masukkan nomor bagungan"
                    rules={{
                      required: "No. Bagungan wajib diisi",
                      min: {
                        value: 1,
                        message: "No. Bagungan harus lebih dari 0",
                      },
                    }}
                  />

                  <TextInput
                    required
                    label="No. Kartu Keluarga (KK)"
                    maxLength={16}
                    name="noKK"
                    placeholder="Masukkan NIK (16 digit)"
                    type="text"
                  />
                </div>
              </StepContent>
            )}

            {/* Step 2: Alamat */}
            {currentStep === 2 && (
              <StepContent>
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      Lengkapi alamat untuk keluarga baru ini.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {isLoadingKelurahan ? (
                      <>
                        <SkeletonInput />
                      </>
                    ) : (
                      <AutoCompleteInput
                        required
                        label="Kelurahan"
                        name="idKelurahan"
                        options={kelurahanOptions}
                        placeholder="Pilih kelurahan"
                      />
                    )}
                  </div>

                  <TextInput
                    required
                    label="Jalan"
                    name="jalan"
                    placeholder="Nama jalan / kampung"
                    type="text"
                  />

                  <NumberInput
                    required
                    label="RT"
                    name="rt"
                    placeholder="001"
                  />

                  <NumberInput
                    required
                    label="RW"
                    name="rw"
                    placeholder="001"
                  />
                </div>
              </StepContent>
            )}

            <StepperNavigation
              canGoNext={canGoNext()}
              currentStep={currentStep}
              isLoading={createKeluargaMutation.isPending}
              nextButtonText="Lanjut"
              submitButtonText="Simpan Keluarga"
              totalSteps={steps.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
            />
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}
