import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, Clock, User, Users, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import DatePicker from "@/components/ui/inputs/DatePicker";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextInput from "@/components/ui/inputs/TextInput";
import axios from "@/lib/axios";
import { showToast } from "@/utils/showToast";

const validationSchema = z.object({
  nama: z.string().min(1, "Nama lengkap harus diisi"),
  jenisKelamin: z.string().min(1, "Jenis kelamin harus dipilih"),
  tempatLahir: z.string().min(1, "Tempat lahir harus diisi"),
  tanggalLahir: z.date({ required_error: "Tanggal lahir harus diisi" }),
  statusDalamKeluarga: z.string().min(1, "Status dalam keluarga harus dipilih"),
  keluargaId: z.string().min(1, "Keluarga harus dipilih"),
  noTelepon: z.string().optional(),
  pekerjaan: z.string().optional(),
  alamat: z.string().optional(),
});

const jenisKelaminOptions = [
  { value: "LAKI_LAKI", label: "Laki-laki" },
  { value: "PEREMPUAN", label: "Perempuan" },
];

const statusDalamKeluargaOptions = [
  { value: "KEPALA_KELUARGA", label: "Kepala Keluarga" },
  { value: "ISTRI", label: "Istri" },
  { value: "ANAK", label: "Anak" },
  { value: "CUCU", label: "Cucu" },
  { value: "ORANGTUA", label: "Orang Tua" },
  { value: "SAUDARA", label: "Saudara" },
  { value: "LAINNYA", label: "Lainnya" },
];

export default function OnboardingDialog({
  isOpen,
  onClose,
  user,
  keluargaOptions = [],
}) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
    reset,
  } = useForm({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/jemaat", {
        ...data,
        tanggalBergabung: new Date(),
        statusAktif: true,
      });

      return response.data;
    },
    onSuccess: async () => {
      showToast({
        title: "Berhasil",
        description: "Profil berhasil dilengkapi! Halaman akan dimuat ulang",
        color: "success",
      });

      // Invalidate user data and refresh
      queryClient.invalidateQueries(["current-user"]);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      console.error("Error onboarding:", error);
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal melengkapi profil",
        color: "danger",
      });
    },
  });

  const onSubmit = (data) => {
    onboardingMutation.mutate(data);
  };

  const handleNext = async () => {
    let fieldsToValidate = [];

    if (currentStep === 1) {
      fieldsToValidate = ["nama", "jenisKelamin"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["tempatLahir", "tanggalLahir", "statusDalamKeluarga"];
    }

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    reset();
    setCurrentStep(1);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="mx-auto h-12 w-12 text-blue-600 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Dasar
              </h3>
              <p className="text-sm text-gray-500">
                Masukkan nama lengkap dan jenis kelamin Anda
              </p>
            </div>

            <TextInput
              required
              control={control}
              error={errors.nama}
              label="Nama Lengkap"
              name="nama"
              placeholder="Masukkan nama lengkap"
            />

            <SelectInput
              required
              control={control}
              error={errors.jenisKelamin}
              label="Jenis Kelamin"
              name="jenisKelamin"
              options={jenisKelaminOptions}
              placeholder="Pilih jenis kelamin"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Calendar className="mx-auto h-12 w-12 text-green-600 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Detail Pribadi
              </h3>
              <p className="text-sm text-gray-500">
                Lengkapi informasi tempat dan tanggal lahir
              </p>
            </div>

            <TextInput
              required
              control={control}
              error={errors.tempatLahir}
              label="Tempat Lahir"
              name="tempatLahir"
              placeholder="Masukkan tempat lahir"
            />

            <DatePicker
              required
              control={control}
              error={errors.tanggalLahir}
              label="Tanggal Lahir"
              name="tanggalLahir"
              placeholder="Pilih tanggal lahir"
            />

            <SelectInput
              required
              control={control}
              error={errors.statusDalamKeluarga}
              label="Status dalam Keluarga"
              name="statusDalamKeluarga"
              options={statusDalamKeluargaOptions}
              placeholder="Pilih status dalam keluarga"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="mx-auto h-12 w-12 text-purple-600 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Keluarga
              </h3>
              <p className="text-sm text-gray-500">
                Pilih keluarga tempat Anda bergabung
              </p>
            </div>

            <SelectInput
              required
              control={control}
              error={errors.keluargaId}
              label="Pilih Keluarga"
              name="keluargaId"
              options={keluargaOptions}
              placeholder="Pilih keluarga"
            />

            {/* Optional Fields */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Informasi Tambahan (Opsional)
              </h4>

              <div className="space-y-4">
                <TextInput
                  control={control}
                  label="No. Telepon"
                  name="noTelepon"
                  placeholder="Masukkan nomor telepon"
                />

                <TextInput
                  control={control}
                  label="Pekerjaan"
                  name="pekerjaan"
                  placeholder="Masukkan pekerjaan"
                />

                <TextInput
                  control={control}
                  label="Alamat"
                  name="alamat"
                  placeholder="Masukkan alamat"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Lengkapi Profil Jemaat
                  </h3>
                  <p className="text-sm text-gray-500">
                    Selamat datang! Silakan lengkapi profil Anda untuk
                    melanjutkan
                  </p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={onboardingMutation.isLoading}
                onClick={handleClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Langkah {currentStep} dari {totalSteps}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}

            {/* Footer */}
            <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    disabled={onboardingMutation.isLoading}
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    Sebelumnya
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="text-gray-500 hover:text-gray-700"
                  disabled={onboardingMutation.isLoading}
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                >
                  Tutup
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    disabled={onboardingMutation.isLoading}
                    type="button"
                    onClick={handleNext}
                  >
                    Selanjutnya
                  </Button>
                ) : (
                  <Button
                    className="min-w-[120px]"
                    disabled={!isValid || onboardingMutation.isLoading}
                    type="submit"
                  >
                    {onboardingMutation.isLoading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Simpan Profil
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
