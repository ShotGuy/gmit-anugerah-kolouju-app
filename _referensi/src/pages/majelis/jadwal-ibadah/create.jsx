import { useMutation, useQuery } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";
import { Calendar, Clock, Users } from "lucide-react";
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
import DatePicker from "@/components/ui/inputs/DatePicker";
import LocationMapPicker from "@/components/ui/inputs/LocationMapPicker";
import NumberInput from "@/components/ui/inputs/NumberInput";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import TextInput from "@/components/ui/inputs/TextInput";
import TimeInput from "@/components/ui/inputs/TimeInput";
import jadwalIbadahService from "@/services/jadwalIbadahService";
import { showToast } from "@/utils/showToast";

const steps = [
  {
    id: 1,
    title: "Informasi Dasar",
    description: "Jenis ibadah, kategori, dan judul",
  },
  {
    id: 2,
    title: "Jadwal & Lokasi",
    description: "Tanggal, waktu, dan tempat ibadah",
  },
  {
    id: 3,
    title: "Konten & Detail",
    description: "Tema, firman, dan keterangan",
  },
  {
    id: 4,
    title: "Target & Rencana",
    description: "Target peserta dan informasi tambahan",
  },
];

export default function CreateJadwalIbadah() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm({
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      idJenisIbadah: "",
      idKategori: "",
      idPemimpin: "",
      idKeluarga: "",
      idRayon: "",
      judul: "",
      tanggal: "",
      waktuMulai: "",
      waktuSelesai: "",
      alamat: "",
      lokasi: "",
      latitude: "",
      longitude: "",
      googleMapsLink: "",
      firman: "",
      tema: "",
      keterangan: "",
      targetPeserta: "",
    },
  });

  // Fetch options
  const {
    data: optionsData,
    isLoading: isOptionsLoading,
    error: optionsError,
  } = useQuery({
    queryKey: ["jadwal-ibadah-options"],
    queryFn: () => jadwalIbadahService.getOptions(),
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal mengambil data options",
        color: "danger",
      });
    },
    onSuccess: (data) => {},
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: jadwalIbadahService.create,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Jadwal ibadah berhasil ditambahkan",
        color: "success",
      });
      router.push("/majelis/jadwal-ibadah");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal menambahkan jadwal",
        color: "danger",
      });
    },
  });

  // Step validation logic
  const validateCurrentStep = async () => {
    const values = form.getValues();

    switch (currentStep) {
      case 1:
        // Validate required fields for step 1
        const step1Required = [
          "idJenisIbadah",
          "idKategori",
          "idPemimpin",
          "judul",
        ];
        const step1Valid = step1Required.every(
          (field) => values[field] && values[field].trim() !== ""
        );

        if (!step1Valid) {
          showToast({
            title: "Validasi Gagal",
            description:
              "Harap lengkapi semua field yang wajib diisi pada langkah ini",
            color: "danger",
          });

          return false;
        }
        break;

      case 2:
        // Validate required fields for step 2
        if (!values.tanggal) {
          showToast({
            title: "Validasi Gagal",
            description: "Tanggal ibadah wajib diisi",
            color: "danger",
          });

          return false;
        }
        break;
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step) => {
    // Only allow going back or to completed steps
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    // Convert empty strings to null for optional numeric fields
    const submitData = {
      ...data,
      // Jumlah peserta aktual selalu null saat create (diisi setelah ibadah selesai)
      jumlahLaki: null,
      jumlahPerempuan: null,
      // Target peserta opsional untuk perencanaan
      targetPeserta: data.targetPeserta ? parseInt(data.targetPeserta) : null,
    };

    createMutation.mutate(submitData);
  });

  const options = optionsData?.data || {};

 

  if (isOptionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat data options...</p>
        </div>
      </div>
    );
  }

  if (optionsError) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading options: {optionsError.message}
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AutoCompleteInput
                required
                label="Jenis Ibadah *"
                name="idJenisIbadah"
                options={options.jenisIbadah || []}
                placeholder="Pilih atau cari jenis ibadah..."
              />
              <AutoCompleteInput
                required
                label="Kategori Jadwal *"
                name="idKategori"
                options={options.kategoriJadwal || []}
                placeholder="Pilih atau cari kategori..."
              />
              <AutoCompleteInput
                required
                label="Pemimpin Ibadah *"
                name="idPemimpin"
                options={options.pemimpin || []}
                placeholder="Pilih atau cari pemimpin..."
              />
              <TextInput
                label="Judul Ibadah *"
                name="judul"
                placeholder="Masukkan judul ibadah"
              />
            </div>
          </StepContent>
        );

      case 2:
        return (
          <StepContent>
            <div className="space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DatePicker
                  required
                  label="Tanggal Ibadah *"
                  leftIcon={<Calendar className="h-4 w-4" />}
                  name="tanggal"
                />
                <TimeInput
                  label="Waktu Mulai"
                  leftIcon={<Clock className="h-4 w-4" />}
                  name="waktuMulai"
                />
                <TimeInput
                  label="Waktu Selesai"
                  leftIcon={<Clock className="h-4 w-4" />}
                  name="waktuSelesai"
                />
              </div>

              {/* Location Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AutoCompleteInput
                  label="Keluarga (Ibadah Keluarga)"
                  name="idKeluarga"
                  options={options.keluarga || []}
                  placeholder="Pilih keluarga untuk ibadah keluarga..."
                />
                <AutoCompleteInput
                  label="Rayon (Ibadah Rayon)"
                  name="idRayon"
                  options={options.rayon || []}
                  placeholder="Pilih rayon untuk ibadah rayon..."
                />
              </div>

              {/* Map Location Picker */}
              <LocationMapPicker
                alamatName="alamat"
                googleMapsLinkName="googleMapsLink"
                label="Pilih Lokasi di Peta"
                latitudeName="latitude"
                lokasiName="lokasi"
                longitudeName="longitude"
              />
            </div>
          </StepContent>
        );

      case 3:
        return (
          <StepContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="Tema Ibadah"
                name="tema"
                placeholder="Masukkan tema ibadah"
              />
              <TextInput
                label="Firman (Ayat)"
                name="firman"
                placeholder="Contoh: Yohanes 3:16"
              />

              <TextAreaInput
                className="md:col-span-2"
                label="Keterangan"
                name="keterangan"
                placeholder="Masukkan keterangan tambahan"
                rows={6}
              />
              {/* <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan
                </label>
                <textarea
                  {...form.register("keterangan")}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Masukkan keterangan tambahan"
                />
              </div> */}
            </div>
          </StepContent>
        );

      case 4:
        return (
          <StepContent>
            <div className="space-y-6">
              {/* Target Peserta */}
              <div className="max-w-md">
                <NumberInput
                  label={"Target Peserta"}
                  min={0}
                  name={"targetPeserta"}
                  placeholder="Contoh: 50"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Perkiraan jumlah peserta yang diharapkan hadir
                </p>
              </div>

              {/* Info Box untuk Estimasi Actual */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">
                      📊 Jumlah Peserta Aktual
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Data jumlah peserta laki-laki dan perempuan akan diisi{" "}
                      <strong>setelah ibadah selesai</strong>
                      melalui fitur edit jadwal ibadah.
                    </p>

                    {/* Visual representation */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">Laki-laki</span>
                        </div>
                        <p className="text-gray-500 mt-1">
                          Diisi setelah ibadah
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">Perempuan</span>
                        </div>
                        <p className="text-gray-500 mt-1">
                          Diisi setelah ibadah
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-blue-100 rounded-md">
                      <p className="text-xs text-blue-800">
                        💡 <strong>Tips:</strong> Setelah ibadah selesai, kamu
                        bisa edit jadwal ini untuk menambahkan jumlah peserta
                        yang hadir secara aktual.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  📝 Ringkasan Jadwal
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Jadwal ibadah akan dibuat dengan informasi dasar</p>
                  <p>• Target peserta bersifat opsional (untuk perencanaan)</p>
                  <p>• Data peserta aktual diisi setelah ibadah berlangsung</p>
                  <p>
                    • Semua informasi dapat diedit kapan saja setelah dibuat
                  </p>
                </div>
              </div>
            </div>
          </StepContent>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PageTitle
        description="Buat jadwal ibadah baru untuk rayon Anda"
        title="Tambah Jadwal Ibadah"
      />
      <div className="space-y-6 p-4">
        <PageHeader
          subtitle="Buat jadwal ibadah baru untuk rayon Anda"
          title="Tambah Jadwal Ibadah"
          onBack={() => router.push("/majelis/jadwal-ibadah")}
        />

        <Card className={"p-6"}>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit}>
              <Stepper
                currentStep={currentStep}
                steps={steps}
                onStepClick={handleStepClick}
              />

              {renderStepContent()}

              <StepperNavigation
                canGoNext={true}
                currentStep={currentStep}
                isLoading={createMutation.isLoading}
                nextButtonText="Lanjut"
                submitButtonText="Simpan Jadwal"
                totalSteps={steps.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSubmit={handleSubmit}
              />
            </form>
          </FormProvider>
        </Card>
      </div>
    </>
  );
}
