import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, FormProvider } from "react-hook-form";
import "leaflet/dist/leaflet.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Book,
  Target,
} from "lucide-react";

import { showToast } from "@/utils/showToast";
import jadwalIbadahService from "@/services/jadwalIbadahService";
import Stepper, {
  StepContent,
  StepperNavigation,
} from "@/components/ui/Stepper";
import { Card } from "@/components/ui/Card";
import PageTitle from "@/components/ui/PageTitle";
import TextInput from "@/components/ui/inputs/TextInput";
import SelectInput from "@/components/ui/inputs/SelectInput";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TimeInput from "@/components/ui/inputs/TimeInput";
import LocationMapPicker from "@/components/ui/inputs/LocationMapPicker";
import PageHeader from "@/components/ui/PageHeader";
import NumberInput from "@/components/ui/inputs/NumberInput";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";

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
    title: "Target & Peserta",
    description: "Target peserta dan data kehadiran aktual",
  },
];

export default function EditJadwalIbadah() {
  const router = useRouter();
  const { id } = router.query;
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
      jumlahLaki: "",
      jumlahPerempuan: "",
    },
  });

  // Fetch jadwal ibadah detail
  const {
    data: jadwalData,
    isLoading: isLoadingJadwal,
    error: jadwalError,
  } = useQuery({
    queryKey: ["jadwal-ibadah", id],
    queryFn: () => jadwalIbadahService.getById(id),
    enabled: !!id,
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
      console.error("Error fetching options:", error);
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal mengambil data options",
        color: "danger",
      });
    },
  });

  // Effect to populate form when jadwal data is loaded
  useEffect(() => {
    if (jadwalData?.data) {
      const jadwal = jadwalData.data;

      // Format date for input
      const formattedDate = jadwal.tanggal
        ? new Date(jadwal.tanggal).toISOString().split("T")[0]
        : "";

      // Format time for input
      const formatTimeForInput = (timeString) => {
        if (!timeString) return "";
        try {
          const date = new Date(timeString);
          return date.toTimeString().slice(0, 5);
        } catch (error) {
          try {
            return timeString.slice(0, 5);
          } catch (fallbackError) {
            return "";
          }
        }
      };

      // Set form values
      form.reset({
        idJenisIbadah: jadwal.idJenisIbadah || "",
        idKategori: jadwal.idKategori || "",
        idPemimpin: jadwal.idPemimpin || "",
        idKeluarga: jadwal.idKeluarga || "",
        idRayon: jadwal.idRayon || "",
        judul: jadwal.judul || "",
        tanggal: formattedDate,
        waktuMulai: formatTimeForInput(jadwal.waktuMulai),
        waktuSelesai: formatTimeForInput(jadwal.waktuSelesai),
        alamat: jadwal.alamat || "",
        lokasi: jadwal.lokasi || "",
        latitude: jadwal.latitude?.toString() || "",
        longitude: jadwal.longitude?.toString() || "",
        googleMapsLink: jadwal.googleMapsLink || "",
        firman: jadwal.firman || "",
        tema: jadwal.tema || "",
        keterangan: jadwal.keterangan || "",
        targetPeserta: jadwal.targetPeserta?.toString() || "",
        jumlahLaki: jadwal.jumlahLaki?.toString() || "",
        jumlahPerempuan: jadwal.jumlahPerempuan?.toString() || "",
      });

      console.log("Form populated wi th data:", jadwal);
    }
  }, [jadwalData, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => jadwalIbadahService.update(id, data),
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Jadwal ibadah berhasil diperbarui",
        color: "success",
      });
      router.push(`/majelis/jadwal-ibadah/${id}`);
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal memperbarui jadwal",
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
      // Convert numeric fields
      targetPeserta: data.targetPeserta ? parseInt(data.targetPeserta) : null,
      jumlahLaki: data.jumlahLaki ? parseInt(data.jumlahLaki) : null,
      jumlahPerempuan: data.jumlahPerempuan
        ? parseInt(data.jumlahPerempuan)
        : null,
    };

    console.log("Submit data:", submitData);
    updateMutation.mutate({ id, data: submitData });
  });

  const options = optionsData?.data || {};
  const jadwal = jadwalData?.data;

  if (isLoadingJadwal || isOptionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">
            {isLoadingJadwal
              ? "Memuat data jadwal..."
              : "Memuat data options..."}
          </p>
        </div>
      </div>
    );
  }

  if (jadwalError || optionsError) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading data: {jadwalError?.message || optionsError?.message}
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

  if (!jadwal) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Jadwal ibadah tidak ditemukan</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => router.push("/majelis/jadwal-ibadah")}
          >
            Kembali
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
                  label="Target Peserta"
                  min={0}
                  name="targetPeserta"
                  placeholder="Contoh: 50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Perkiraan jumlah peserta yang diharapkan hadir
                </p>
              </div>

              {/* Actual Attendance */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900 mb-2">
                      📊 Jumlah Peserta Aktual
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Isi data ini setelah ibadah selesai untuk mencatat jumlah
                      peserta yang hadir.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <NumberInput
                        label="Jumlah Laki-laki"
                        min={0}
                        name="jumlahLaki"
                        placeholder="0"
                      />
                      <NumberInput
                        label="Jumlah Perempuan"
                        min={0}
                        name="jumlahPerempuan"
                        placeholder="0"
                      />
                    </div>

                    {/* Total Display */}
                    <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-900">
                          Total Peserta:
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          {(parseInt(form.watch("jumlahLaki")) || 0) +
                            (parseInt(form.watch("jumlahPerempuan")) || 0)}{" "}
                          orang
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  📝 Informasi Pembaruan
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Semua perubahan akan tersimpan setelah submit</p>
                  <p>• Data peserta aktual bersifat opsional</p>
                  <p>• Anda dapat mengubah informasi ini kapan saja</p>
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
        description="Perbarui informasi jadwal ibadah"
        title={`Edit: ${jadwal?.judul || "Jadwal Ibadah"}`}
      />

      <div className="space-y-6 p-4">
        <PageHeader
          subtitle="Perbarui informasi jadwal ibadah"
          title="Edit Jadwal Ibadah"
          onBack={() => router.push("/majelis/jadwal-ibadah")}
        />

        <Card className="p-6">
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
                isLoading={updateMutation.isLoading}
                nextButtonText="Lanjut"
                submitButtonText="Perbarui Jadwal"
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
