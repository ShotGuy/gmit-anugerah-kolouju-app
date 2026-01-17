import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
    Calendar,
    Crown,
    Key,
    Lock,
    Mail,
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
import pegawaiService from "@/services/pegawaiService";
import { showToast } from "@/utils/showToast";
import { pegawaiCreationSchema } from "@/validations/masterSchema";

const steps = [
    {
        id: "pegawai-info",
        title: "Data Pegawai",
        description: "Informasi dasar pegawai",
    },
    {
        id: "permission-info",
        title: "Permission",
        description: "Atur hak akses sistem",
    },
    {
        id: "account-info",
        title: "Data Akun",
        description: "Buat akun login untuk pegawai",
    },
    {
        id: "confirmation",
        title: "Konfirmasi",
        description: "Review dan simpan data",
    },
];

export default function CreatePegawaiPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [canProceed, setCanProceed] = useState(false);

    const methods = useForm({
        resolver: zodResolver(pegawaiCreationSchema),
        defaultValues: {
            idJemaat: "",
            jemaatName: "", // For display only
            mulai: "",
            selesai: "",
            idJenisJabatan: "",

            // Permissions
            canViewJemaat: false,
            canManageJemaat: false,
            canManageJadwal: false,
            canManagePengumuman: false,
            canManageGaleri: false,
            canViewKeuangan: false,
            canManageKeuangan: false,
            isActive: true,

            // Account
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

    const checkCanProceed = async () => {
        const fieldsToValidate = getFieldsForStep(currentStep);

        if (fieldsToValidate.length === 0) {
            setCanProceed(true);
            return;
        }

        const values = getValues();
        let canProceed = true;

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
        if (fieldsToValidate.length === 0) return true;
        const isValid = await trigger(fieldsToValidate);
        return isValid;
    };

    const getFieldsForStep = (step) => {
        switch (step) {
            case 1:
                return ["idJemaat", "mulai", "idJenisJabatan"];
            case 2:
                return []; // Permission step optional/defaults
            case 3:
                return ["username", "email", "password"];
            case 4:
                return [];
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
                await checkCanProceed();
            } else {
                showToast({
                    title: "Validasi Gagal",
                    description: "Mohon lengkapi field yang wajib diisi",
                    color: "error",
                });
            }
        } catch (error) {
            console.error("Validation error:", error);
        }
    };

    const handlePrevious = async () => {
        const prevStep = Math.max(currentStep - 1, 1);
        setCurrentStep(prevStep);
        await checkCanProceed();
    };

    const handleStepClick = async (stepNumber) => {
        if (stepNumber < currentStep) {
            setCurrentStep(stepNumber);
        } else if (stepNumber === currentStep + 1) {
            await handleNext();
        }
    };

    const formatWhatsAppNumber = (number) => {
        if (!number) return null;
        let cleaned = number.replace(/\D/g, "");
        if (cleaned.startsWith("62")) return `+${cleaned}`;
        else if (cleaned.startsWith("0")) return `+62${cleaned.substring(1)}`;
        else return `+62${cleaned}`;
    };

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const formattedData = { ...data };

            delete formattedData.jemaatName;

            if (formattedData.noWhatsapp) {
                formattedData.noWhatsapp = formatWhatsAppNumber(formattedData.noWhatsapp);
            } else {
                formattedData.noWhatsapp = null;
            }

            if (!formattedData.selesai) delete formattedData.selesai;

            const result = await pegawaiService.create(formattedData);

            if (result.success) {
                showToast({
                    title: "Berhasil",
                    description: "Pegawai dan akun berhasil dibuat",
                    color: "success",
                });
                queryClient.invalidateQueries({ queryKey: ["pegawai"] });
                router.push("/admin/pegawai");
            } else {
                showToast({
                    title: "Gagal",
                    description: result.message || "Gagal membuat pegawai",
                    color: "error",
                });
            }
        } catch (error) {
            console.error("Error creating pegawai:", error);
            const errorMessage = error.response?.data?.message || "Terjadi kesalahan sistem";
            showToast({
                title: "Error",
                description: errorMessage,
                color: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                                label="Tanggal Mulai"
                                leftIcon={<Calendar className="w-4 h-4" />}
                                name="mulai"
                                placeholder="Pilih tanggal mulai"
                            />
                            <DatePicker
                                label="Tanggal Selesai"
                                leftIcon={<Calendar className="w-4 h-4" />}
                                name="selesai"
                                placeholder="Pilih tanggal selesai (opsional)"
                            />
                            <AutoCompleteInput
                                required
                                apiEndpoint="/jenis-jabatan/options"
                                label="Jenis Jabatan"
                                leftIcon={<Crown className="w-4 h-4" />}
                                name="idJenisJabatan"
                                placeholder="Pilih jenis jabatan"
                            />
                        </div>
                    </StepContent>
                );
            case 2:
                return (
                    <StepContent>
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                <div className="flex items-start">
                                    <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                            Pengaturan Hak Akses
                                        </h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-200">
                                            Pilih fitur yang dapat diakses oleh pegawai ini. Berikan akses sesuai kebutuhan tanggung jawabnya.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Group 1: Administrasi Jemaat */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900 border-b pb-2">Administrasi Jemaat</h4>
                                    <PermissionCheckbox label="Lihat Data Jemaat" description="Hanya melihat data" name="canViewJemaat" register={methods.register} />
                                    <PermissionCheckbox label="Kelola Data Jemaat" description="Tambah, ubah & hapus data" name="canManageJemaat" register={methods.register} />
                                </div>

                                {/* Group 2: Operasional */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900 border-b pb-2">Operasional & Ibadah</h4>
                                    <PermissionCheckbox label="Kelola Jadwal Ibadah" description="Buat & ubah jadwal" name="canManageJadwal" register={methods.register} />
                                    <PermissionCheckbox label="Kelola Pengumuman" description="Buat & ubah warta" name="canManagePengumuman" register={methods.register} />
                                    <PermissionCheckbox label="Kelola Galeri" description="Upload foto kegiatan" name="canManageGaleri" register={methods.register} />
                                </div>

                                {/* Group 3: Keuangan */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900 border-b pb-2">Keuangan</h4>
                                    <PermissionCheckbox label="Lihat Laporan Keuangan" description="View dashboard keuangan" name="canViewKeuangan" register={methods.register} />
                                    <PermissionCheckbox label="Kelola Transaksi" description="Input pemasukan/pengeluaran" name="canManageKeuangan" register={methods.register} />
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
                                <TextInput required label="Username" leftIcon={<UserCheck className="w-4 h-4" />} name="username" placeholder="Masukkan username" />
                                <TextInput required type="email" label="Email" leftIcon={<Mail className="w-4 h-4" />} name="email" placeholder="Masukkan email" />
                                <div className="md:col-span-2">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <TextInput required type="password" label="Password" leftIcon={<Lock className="w-4 h-4" />} name="password" placeholder="Masukkan password" />
                                        </div>
                                    </div>
                                    <div className="flex mt-2">
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm" type="button" onClick={() => setValue("password", "oepura78")}>
                                            <Key className="w-4 h-4" />
                                            Generate Password Default
                                        </button>
                                    </div>
                                </div>
                                <TextInput label="No. WhatsApp" leftIcon={<Phone className="w-4 h-4" />} name="noWhatsapp" placeholder="Contoh: 0852xxx" />
                            </div>
                        </div>
                    </StepContent>
                );
            case 4:
                return (
                    <StepContent>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Konfirmasi Data Pegawai</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Data Personal</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-500">Nama:</span> <span className="font-medium">{watchedValues.jemaatName}</span></p>
                                        <p><span className="text-gray-500">Mulai:</span> <span className="font-medium">{watchedValues.mulai}</span></p>
                                        <p><span className="text-gray-500">Selesai:</span> <span className="font-medium">{watchedValues.selesai || "-"}</span></p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Akun</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-500">Username:</span> <span className="font-medium">{watchedValues.username}</span></p>
                                        <p><span className="text-gray-500">Email:</span> <span className="font-medium">{watchedValues.email}</span></p>
                                    </div>
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
        <div className="max-w-4xl mx-auto p-6">
            <PageTitle title="Tambah Pegawai Baru" />
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Pegawai Baru</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Buat data pegawai baru beserta akun login dan hak akses.</p>
            </div>

            <Stepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

            <HookForm methods={methods} onSubmit={onSubmit}>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-6">
                    {renderStepContent()}
                    <StepperNavigation
                        canGoNext={canProceed}
                        currentStep={currentStep}
                        isLoading={isLoading}
                        nextButtonText="Lanjut"
                        submitButtonText="Simpan Pegawai"
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

function PermissionCheckbox({ label, description, name, register }) {
    return (
        <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600" {...register(name)} />
            <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">{label}</span>
                <span className="block text-xs text-gray-500">{description}</span>
            </div>
        </label>
    );
}
