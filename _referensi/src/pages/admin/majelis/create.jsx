import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  Crown,
  Key,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import HookForm from "@/components/form/HookForm";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import JemaatSearchInput from "@/components/ui/inputs/JemaatSearchInput";
import TextInput from "@/components/ui/inputs/TextInput";
import PageTitle from "@/components/ui/PageTitle";
import Stepper, {
  StepContent,
  StepperNavigation,
} from "@/components/ui/Stepper";
import majelisService from "@/services/majelisService";
import { showToast } from "@/utils/showToast";
import { majelisCreationSchema } from "@/validations/masterSchema";

const steps = [
  {
    id: "majelis-info",
    title: "Data Majelis",
    description: "Informasi dasar majelis",
  },
  {
    id: "permission-info",
    title: "Permission",
    description: "Atur hak akses majelis (opsional)",
  },
  {
    id: "account-info",
    title: "Data Akun",
    description: "Buat akun login untuk majelis",
  },
  {
    id: "confirmation",
    title: "Konfirmasi",
    description: "Review dan simpan data",
  },
];

export default function CreateMajelisPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  const methods = useForm({
    resolver: zodResolver(majelisCreationSchema),
    defaultValues: {
      idJemaat: "",
      jemaatName: "", // For display only
      mulai: "",
      selesai: "",
      idRayon: router.query.rayon || "",
      jenisJabatanId: "",
      // Permission fields
      isUtama: false,
      canView: true,
      canEdit: false,
      canCreate: false,
      canDelete: false,
      canManageRayon: false,
      // Account fields
      username: "",
      email: "",
      password: "",
      noWhatsapp: "",
    },
  });

  const {
    handleSubmit,
    watch,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = methods;

  const watchedValues = watch();

  // Check if current step can proceed
  const checkCanProceed = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);

    if (fieldsToValidate.length === 0) {
      setCanProceed(true);

      return;
    }

    const values = getValues();
    let canProceed = true;

    // Check required fields for current step
    for (const field of fieldsToValidate) {
      if (!values[field] || values[field] === "") {
        canProceed = false;
        break;
      }
    }

    setCanProceed(canProceed);
  };

  const validateCurrentStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);

    if (fieldsToValidate.length === 0) {
      return true;
    }

    const isValid = await trigger(fieldsToValidate);

    return isValid;
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1:
        return ["idJemaat", "mulai", "jenisJabatanId"];
      case 2:
        return []; // Permission step - optional
      case 3:
        return ["username", "email", "password"];
      case 4:
        return []; // No validation needed for confirmation step
      default:
        return [];
    }
  };

  const handleNext = async () => {
    try {
      const isValid = await validateCurrentStep();

      if (isValid) {
        const nextStep = Math.min(currentStep + 1, steps.length);

        setCurrentStep(nextStep);
        // Reset can proceed for next step
        await checkCanProceed();
      } else {
        showToast({
          title: "Validasi Gagal",
          description:
            "Mohon lengkapi semua field yang wajib diisi dengan benar",
          color: "error",
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      showToast({
        title: "Error",
        description: "Terjadi kesalahan saat validasi",
        color: "error",
      });
    }
  };

  const handlePrevious = async () => {
    const prevStep = Math.max(currentStep - 1, 1);

    setCurrentStep(prevStep);
    // Check can proceed for previous step
    await checkCanProceed();
  };

  const handleStepClick = async (stepNumber) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    } else if (stepNumber === currentStep + 1) {
      await handleNext();
    }
  };

  // Format nomor WhatsApp dengan prefix +62
  const formatWhatsAppNumber = (number) => {
    if (!number) return null;

    // Remove all non-numeric characters
    let cleaned = number.replace(/\D/g, "");

    // Handle different formats
    if (cleaned.startsWith("62")) {
      // Already has 62 prefix
      return `+${cleaned}`;
    } else if (cleaned.startsWith("0")) {
      // Remove leading 0 and add +62
      return `+62${cleaned.substring(1)}`;
    } else {
      // Assume it's already without prefix
      return `+62${cleaned}`;
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      // Clean up the data before sending
      const formattedData = { ...data };

      // Remove display-only fields
      delete formattedData.jemaatName;

      // Format WhatsApp number with +62 prefix
      if (formattedData.noWhatsapp && formattedData.noWhatsapp !== "") {
        formattedData.noWhatsapp = formatWhatsAppNumber(
          formattedData.noWhatsapp
        );
      } else {
        formattedData.noWhatsapp = null;
      }

      // Clean up empty optional fields
      if (!formattedData.selesai) {
        delete formattedData.selesai;
      }
      if (!formattedData.idRayon) {
        delete formattedData.idRayon;
      }

      const result = await majelisService.createWithAccount(formattedData);

      if (result.success) {
        showToast({
          title: "Berhasil",
          description: "Majelis dan akun berhasil dibuat",
          color: "success",
        });

        // Invalidate majelis query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["majelis"] });

        router.push("/admin/majelis");
      } else {
        showToast({
          title: "Gagal",
          description: result.message || "Gagal membuat majelis dan akun",
          color: "error",
        });
      }
    } catch (error) {
      console.error("Error creating majelis:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan sistem";

      showToast({
        title: "Error",
        description: errorMessage,
        color: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for form changes and update canProceed
  useEffect(() => {
    checkCanProceed();
  }, [watchedValues, currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <JemaatSearchInput
                required
                label="Cari Jemaat"
                name="idJemaat"
                placeholder="Ketik nama jemaat..."
                onSelect={(jemaat) => {
                  setValue("jemaatName", jemaat ? jemaat.nama : "");
                }}
              />

              <DatePicker
                required
                label="Tanggal Mulai Jabatan"
                leftIcon={<Calendar className="w-4 h-4" />}
                name="mulai"
                placeholder="Pilih tanggal mulai"
              />

              <DatePicker
                label="Tanggal Selesai Jabatan"
                leftIcon={<Calendar className="w-4 h-4" />}
                name="selesai"
                placeholder="Pilih tanggal selesai (opsional)"
              />

              <AutoCompleteInput
                required
                apiEndpoint="/jenis-jabatan/options"
                label="Jenis Jabatan"
                leftIcon={<Crown className="w-4 h-4" />}
                name="jenisJabatanId"
                placeholder="Pilih jenis jabatan"
              />

              <AutoCompleteInput
                apiEndpoint="/rayon/options"
                label="Rayon"
                leftIcon={<MapPin className="w-4 h-4" />}
                name="idRayon"
                placeholder="Pilih rayon (opsional)"
              />
            </div>
          </StepContent>
        );

      case 2:
        return (
          <StepContent>
            <div className="space-y-6">
              <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Informasi Permission
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    <strong>Majelis Utama:</strong> Full akses (CRUD + kelola
                    rayon) |<strong> Koordinator Rayon:</strong> View + kelola
                    rayon |<strong> Majelis Biasa:</strong> View only
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    * Hanya boleh 1 Majelis Utama per rayon. Step ini opsional,
                    bisa dilewati.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold">Atur Hak Akses</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      className="w-4 h-4"
                      type="checkbox"
                      {...methods.register("isUtama")}
                      onChange={(e) => {
                        methods.setValue("isUtama", e.target.checked);
                        if (e.target.checked) {
                          // Auto-enable all permissions if isUtama
                          methods.setValue("canView", true);
                          methods.setValue("canEdit", true);
                          methods.setValue("canCreate", true);
                          methods.setValue("canDelete", true);
                          methods.setValue("canManageRayon", true);
                        }
                      }}
                    />
                    <div>
                      <span className="text-sm font-medium">Majelis Utama</span>
                      <p className="text-xs text-gray-500">Full access</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      className="w-4 h-4"
                      disabled={watchedValues.isUtama}
                      type="checkbox"
                      {...methods.register("canView")}
                    />
                    <div>
                      <span className="text-sm font-medium">View</span>
                      <p className="text-xs text-gray-500">Lihat data</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      className="w-4 h-4"
                      disabled={watchedValues.isUtama}
                      type="checkbox"
                      {...methods.register("canEdit")}
                    />
                    <div>
                      <span className="text-sm font-medium">Edit</span>
                      <p className="text-xs text-gray-500">Ubah data</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      className="w-4 h-4"
                      disabled={watchedValues.isUtama}
                      type="checkbox"
                      {...methods.register("canCreate")}
                    />
                    <div>
                      <span className="text-sm font-medium">Create</span>
                      <p className="text-xs text-gray-500">Tambah data</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      className="w-4 h-4"
                      disabled={watchedValues.isUtama}
                      type="checkbox"
                      {...methods.register("canDelete")}
                    />
                    <div>
                      <span className="text-sm font-medium">Delete</span>
                      <p className="text-xs text-gray-500">Hapus data</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      className="w-4 h-4"
                      disabled={watchedValues.isUtama}
                      type="checkbox"
                      {...methods.register("canManageRayon")}
                    />
                    <div>
                      <span className="text-sm font-medium">Kelola Rayon</span>
                      <p className="text-xs text-gray-500">Akses rayon</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </StepContent>
        );

      case 3:
        return (
          <StepContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  required
                  label="Username"
                  leftIcon={<UserCheck className="w-4 h-4" />}
                  name="username"
                  placeholder="Masukkan username"
                />

                <TextInput
                  required
                  label="Email"
                  leftIcon={<Mail className="w-4 h-4" />}
                  name="email"
                  placeholder="Masukkan email"
                  type="email"
                />

                <div className="md:col-span-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <TextInput
                        required
                        label="Password"
                        leftIcon={<Lock className="w-4 h-4" />}
                        name="password"
                        placeholder="Masukkan password"
                        type="password"
                      />
                    </div>
                  </div>
                  <div className="flex">
                    <button
                      className="px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-4 whitespace-nowrap h-[42px]"
                      type="button"
                      onClick={() => setValue("password", "oepura78")}
                    >
                      <Key className="w-4 h-4" />
                      Generate Password
                    </button>
                  </div>
                </div>

                <TextInput
                  label="No. WhatsApp"
                  leftIcon={<Phone className="w-4 h-4" />}
                  name="noWhatsapp"
                  placeholder="Contoh: 085298343432"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">
                      Informasi Password & WhatsApp:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Password default: <strong>oepura78</strong>
                      </li>
                      <li>
                        Nomor WhatsApp akan otomatis diformat dengan prefix +62
                      </li>
                      <li>Contoh: 085298343432 akan menjadi +6285298343432</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </StepContent>
        );

      case 4:
        return (
          <StepContent>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 transition-colors duration-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Konfirmasi Data Majelis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">
                    Data Majelis
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Nama Jemaat:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {watchedValues.jemaatName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tanggal Mulai:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {watchedValues.mulai}
                      </span>
                    </div>
                    {watchedValues.selesai && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Tanggal Selesai:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {watchedValues.selesai}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">
                    Data Akun
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Username:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {watchedValues.username}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Email:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {watchedValues.email}
                      </span>
                    </div>
                    {watchedValues.noWhatsapp && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          WhatsApp:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {watchedValues.noWhatsapp}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Permission Summary if any is set */}
              {(watchedValues.isUtama ||
                watchedValues.canEdit ||
                watchedValues.canCreate ||
                watchedValues.canDelete ||
                watchedValues.canManageRayon) && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Permission
                    </h4>
                    <div className="space-y-1">
                      {watchedValues.isUtama && (
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          ✓ Majelis Utama (Full Access)
                        </p>
                      )}
                      {!watchedValues.isUtama && (
                        <>
                          {watchedValues.canView && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ✓ View
                            </p>
                          )}
                          {watchedValues.canEdit && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ✓ Edit
                            </p>
                          )}
                          {watchedValues.canCreate && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ✓ Create
                            </p>
                          )}
                          {watchedValues.canDelete && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ✓ Delete
                            </p>
                          )}
                          {watchedValues.canManageRayon && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ✓ Kelola Rayon
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-300">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Catatan:</strong> Setelah data disimpan, akun majelis
                  akan otomatis dibuat dan dapat digunakan untuk login dengan
                  username dan password yang telah ditentukan.
                </p>
              </div>
            </div>
          </StepContent>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageTitle title="Tambah Majelis Baru" />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tambah Majelis Baru
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Buat data majelis baru beserta akun login dalam satu proses
        </p>
      </div>

      {/* Stepper */}
      <Stepper
        currentStep={currentStep}
        steps={steps}
        onStepClick={handleStepClick}
      />

      {/* Form */}
      <HookForm methods={methods} onSubmit={onSubmit}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-300">
          {renderStepContent()}

          <StepperNavigation
            canGoNext={canProceed}
            currentStep={currentStep}
            isLoading={isLoading}
            nextButtonText="Lanjut"
            submitButtonText="Buat Majelis & Akun"
            totalSteps={steps.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit(onSubmit)}
          />
        </div>
      </HookForm>
    </div>
  );
}
