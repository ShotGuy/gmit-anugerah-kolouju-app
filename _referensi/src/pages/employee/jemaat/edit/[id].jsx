import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextInput from "@/components/ui/inputs/TextInput";
import PageHeader from "@/components/ui/PageHeader";
import Stepper, {
    StepContent,
} from "@/components/ui/Stepper";
import jemaatService from "@/services/jemaatService";
import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";

const steps = [
    {
        id: 1,
        title: "Data Jemaat",
        description: "Informasi dasar jemaat",
    },
    {
        id: 2,
        title: "Akun User",
        description: "Pembuatan akun login",
    },
    {
        id: 3,
        title: "Data Keluarga",
        description: "Informasi keluarga",
    },
    {
        id: 4,
        title: "Alamat",
        description: "Alamat keluarga",
    },
];

export default function EmployeeEditJemaat() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = router.query;

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        jemaat: {},
        user: {},
        keluarga: {},
        alamat: {},
    });
    const [isKepalaKeluarga, setIsKepalaKeluarga] = useState(false);
    const [createUserAccount, setCreateUserAccount] = useState(false);
    const [createKeluarga, setCreateKeluarga] = useState(false);
    const [createAlamat, setCreateAlamat] = useState(false);
    const [hasExistingUser, setHasExistingUser] = useState(false);

    const form = useForm({
        defaultValues: {
            // Jemaat fields
            nama: "",
            jenisKelamin: true, // true = laki-laki, false = perempuan
            tanggalLahir: "",
            golonganDarah: "",
            idKeluarga: "",
            idStatusDalamKeluarga: "",
            idSuku: "",
            idPendidikan: "",
            idPekerjaan: "",
            idPendapatan: "",
            idJaminanKesehatan: "",
            // User fields
            email: "",
            password: "",
            confirmPassword: "",
            role: "JEMAAT",
            // Keluarga fields
            idStatusKeluarga: "",
            idStatusKepemilikanRumah: "",
            idKeadaanRumah: "",
            idRayon: "",
            noBagungan: "",
            // Alamat fields
            idKelurahan: "",
            rt: "",
            rw: "",
            jalan: "",
        },
    });

    // Fetch jemaat data
    const { data: jemaatData, isLoading: jemaatLoading } = useQuery({
        queryKey: ["jemaat", id],
        queryFn: () => jemaatService.getById(id),
        enabled: !!id,
    });

    // Fetch master data with caching (same queryKey as create/filters for cache reuse!)
    const { data: statusDalamKeluarga } = useQuery({
        queryKey: ["status-dalam-keluarga"],
        queryFn: async () => {
            const response = await masterService.getStatusDalamKeluarga();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.status,
                })) || []
            );
        },
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: keluargaList } = useQuery({
        queryKey: ["keluarga-list"],
        queryFn: async () => {
            const response = await masterService.getKeluarga();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: `${item.rayon?.namaRayon} - ${item.noBagungan}`,
                })) || []
            );
        },
        staleTime: 3 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    const { data: suku } = useQuery({
        queryKey: ["suku"],
        queryFn: async () => {
            const response = await masterService.getSuku();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.namaSuku,
                })) || []
            );
        },
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: pendidikan } = useQuery({
        queryKey: ["pendidikan"],
        queryFn: async () => {
            const response = await masterService.getPendidikan();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.jenjang,
                })) || []
            );
        },
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: pekerjaan } = useQuery({
        queryKey: ["pekerjaan"],
        queryFn: async () => {
            const response = await masterService.getPekerjaan();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.namaPekerjaan,
                })) || []
            );
        },
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: pendapatan } = useQuery({
        queryKey: ["pendapatan"],
        queryFn: async () => {
            const response = await masterService.getPendapatan();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.label,
                })) || []
            );
        },
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: jaminanKesehatan } = useQuery({
        queryKey: ["jaminan-kesehatan"],
        queryFn: async () => {
            const response = await masterService.getJaminanKesehatan();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.jenisJaminan,
                })) || []
            );
        },
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: statusKeluarga } = useQuery({
        queryKey: ["status-keluarga"],
        queryFn: async () => {
            const response = await masterService.getStatusKeluarga();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.status,
                })) || []
            );
        },
        enabled: createKeluarga,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: statusKepemilikanRumah } = useQuery({
        queryKey: ["status-kepemilikan-rumah"],
        queryFn: async () => {
            const response = await masterService.getStatusKepemilikanRumah();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.status,
                })) || []
            );
        },
        enabled: createKeluarga,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: keadaanRumah } = useQuery({
        queryKey: ["keadaan-rumah"],
        queryFn: async () => {
            const response = await masterService.getKeadaanRumah();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.keadaan,
                })) || []
            );
        },
        enabled: createKeluarga,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: rayon } = useQuery({
        queryKey: ["rayon"],
        queryFn: async () => {
            const response = await masterService.getRayon();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.namaRayon,
                })) || []
            );
        },
        enabled: createKeluarga,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: kelurahan } = useQuery({
        queryKey: ["kelurahan"],
        queryFn: async () => {
            const response = await masterService.getKelurahan();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.kodepos ? `${item.nama} - ${item.kodepos}` : item.nama,
                })) || []
            );
        },
        enabled: createKeluarga,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    // Pre-fill form when data loaded
    useEffect(() => {
        if (jemaatData?.data) {
            const jemaat = jemaatData.data;

            // Fill jemaat data
            form.setValue("nama", jemaat.nama || "");
            // Convert boolean to string for SelectInput
            form.setValue("jenisKelamin", String(jemaat.jenisKelamin ?? true));
            form.setValue(
                "tanggalLahir",
                jemaat.tanggalLahir
                    ? new Date(jemaat.tanggalLahir).toISOString().split("T")[0]
                    : ""
            );
            form.setValue("golonganDarah", jemaat.golonganDarah || "");
            form.setValue("idKeluarga", jemaat.idKeluarga || "");
            form.setValue(
                "idStatusDalamKeluarga",
                jemaat.idStatusDalamKeluarga || ""
            );
            form.setValue("idSuku", jemaat.idSuku || "");
            form.setValue("idPendidikan", jemaat.idPendidikan || "");
            form.setValue("idPekerjaan", jemaat.idPekerjaan || "");
            form.setValue("idPendapatan", jemaat.idPendapatan || "");
            form.setValue("idJaminanKesehatan", jemaat.idJaminanKesehatan || "");

            // Check if has user account
            if (jemaat.User) {
                setHasExistingUser(true);
                setCreateUserAccount(true);
                form.setValue("email", jemaat.User.email || "");
                form.setValue("role", jemaat.User.role || "JEMAAT");
            } else {
                // If no user exists, still show the step but don't auto-check the checkbox
                setHasExistingUser(false);
                setCreateUserAccount(false);
            }

            // Check if kepala keluarga and has keluarga data
            const isKepala = jemaat.statusDalamKeluarga?.status
                ?.toLowerCase()
                .includes("kepala");

            if (isKepala) {
                setIsKepalaKeluarga(true);
                setCreateKeluarga(true);
                setCreateAlamat(true);
            }

            // Fill keluarga data if exists (regardless of status)
            if (jemaat.keluarga) {
                // If not kepala, still show the data for reference
                if (!isKepala) {
                    setCreateKeluarga(true);
                    setCreateAlamat(true);
                }

                form.setValue(
                    "idStatusKeluarga",
                    jemaat.keluarga.idStatusKeluarga || ""
                );
                form.setValue(
                    "idStatusKepemilikanRumah",
                    jemaat.keluarga.idStatusKepemilikanRumah || ""
                );
                form.setValue("idKeadaanRumah", jemaat.keluarga.idKeadaanRumah || "");
                form.setValue("idRayon", jemaat.keluarga.idRayon || "");
                form.setValue("noBagungan", String(jemaat.keluarga.noBagungan || ""));

                // Fill alamat data if exists
                if (jemaat.keluarga.alamat) {
                    form.setValue(
                        "idKelurahan",
                        jemaat.keluarga.alamat.idKelurahan || ""
                    );
                    form.setValue("rt", String(jemaat.keluarga.alamat.rt || ""));
                    form.setValue("rw", String(jemaat.keluarga.alamat.rw || ""));
                    form.setValue("jalan", jemaat.keluarga.alamat.jalan || "");
                }
            }
        }
    }, [jemaatData, form]);

    // Watch status dalam keluarga to determine if user is kepala keluarga
    const watchStatusDalamKeluarga = form.watch("idStatusDalamKeluarga");

    useEffect(() => {
        if (statusDalamKeluarga?.data?.items) {
            const kepalaKeluargaStatus = statusDalamKeluarga.data.items.find(
                (status) => status.status.toLowerCase().includes("kepala")
            );

            if (
                kepalaKeluargaStatus &&
                watchStatusDalamKeluarga === kepalaKeluargaStatus.id
            ) {
                setIsKepalaKeluarga(true);
                setCreateKeluarga(true);
                setCreateAlamat(true); // Always create alamat when creating keluarga
            } else {
                setIsKepalaKeluarga(false);
                // Don't automatically set to false if editing existing data
                if (
                    !jemaatData?.data?.statusDalamKeluarga?.status
                        ?.toLowerCase()
                        .includes("kepala")
                ) {
                    setCreateKeluarga(false);
                    setCreateAlamat(false);
                }
            }
        }
    }, [watchStatusDalamKeluarga, statusDalamKeluarga, jemaatData]);

    const updateJemaatMutation = useMutation({
        mutationFn: ({ id, data }) => jemaatService.update(id, data),
        onSuccess: (data) => {
            // Invalidate queries related to jemaat data
            queryClient.invalidateQueries(["jemaat"]);
            queryClient.invalidateQueries(["jemaat-list"]);
            queryClient.invalidateQueries(["admin-jemaat"]);
            queryClient.invalidateQueries(["jemaat", id]);

            showToast({
                title: "Berhasil",
                description: "Data jemaat berhasil diperbarui!",
                color: "success",
            });
            router.push("/employee/jemaat");
        },
        onError: (error) => {
            showToast({
                title: "Gagal",
                description:
                    error.response?.data?.message || "Gagal memperbarui data jemaat",
                color: "error",
            });
        },
    });

    const handleNext = () => {
        if (currentStep === 1) {
            // Validate jemaat data
            const jemaatData = {
                nama: form.getValues("nama"),
                jenisKelamin: form.getValues("jenisKelamin") === "true", // Convert string to boolean
                tanggalLahir: form.getValues("tanggalLahir"),
                idStatusDalamKeluarga: form.getValues("idStatusDalamKeluarga"),
                idSuku: form.getValues("idSuku"),
                idPendidikan: form.getValues("idPendidikan"),
                idPekerjaan: form.getValues("idPekerjaan"),
                idPendapatan: form.getValues("idPendapatan"),
                idJaminanKesehatan: form.getValues("idJaminanKesehatan"),
                golonganDarah: form.getValues("golonganDarah"),
            };

            if (!isKepalaKeluarga) {
                jemaatData.idKeluarga = form.getValues("idKeluarga");
            }

            setFormData((prev) => ({ ...prev, jemaat: jemaatData }));
        } else if (currentStep === 2) {
            // Validate user data
            if (createUserAccount && !hasExistingUser) {
                const password = form.getValues("password");
                const confirmPassword = form.getValues("confirmPassword");

                if (password && password !== confirmPassword) {
                    showToast({
                        title: "Error",
                        description: "Password dan konfirmasi password tidak cocok",
                        color: "error",
                        description: "Password dan konfirmasi password tidak cocok",
                        color: "error",
                    });

                    return;
                }

                const userData = {
                    email: form.getValues("email"),
                    password: form.getValues("password"),
                    role: form.getValues("role"),
                };

                setFormData((prev) => ({ ...prev, user: userData }));
            } else if (createUserAccount && hasExistingUser) {
                // Update existing user
                const userData = {
                    email: form.getValues("email"),
                    role: form.getValues("role"),
                };

                const password = form.getValues("password");

                if (password) {
                    userData.password = password;
                }

                setFormData((prev) => ({ ...prev, user: userData }));
            }
        } else if (currentStep === 3 && createKeluarga) {
            // Validate keluarga data
            const keluargaData = {
                idStatusKeluarga: form.getValues("idStatusKeluarga"),
                idStatusKepemilikanRumah: form.getValues("idStatusKepemilikanRumah"),
                idKeadaanRumah: form.getValues("idKeadaanRumah"),
                idRayon: form.getValues("idRayon"),
                noBagungan: Number(form.getValues("noBagungan")) || 0,
            };

            setFormData((prev) => ({ ...prev, keluarga: keluargaData }));
        }

        if (currentStep < getMaxStep()) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getMaxStep = () => {
        // Always show step 1 (Data Jemaat) and step 2 (User Account)
        if (!createKeluarga) return 2;

        // If creating/editing keluarga, show all 4 steps (including alamat)
        return 4;
    };

    // Watch form values for real-time validation
    const watchedValues = form.watch([
        "nama",
        "tanggalLahir",
        "idStatusDalamKeluarga",
        "idSuku",
        "idPendidikan",
        "idPekerjaan",
        "idPendapatan",
        "idJaminanKesehatan",
        "idKeluarga",
        "email",
        "password",
        "confirmPassword",
        "idStatusKeluarga",
        "idStatusKepemilikanRumah",
        "idKeadaanRumah",
        "idRayon",
        "noBagungan",
    ]);

    const canGoNext = () => {
        const values = form.getValues();

        if (currentStep === 1) {
            return (
                values.nama &&
                values.tanggalLahir &&
                values.idStatusDalamKeluarga &&
                values.idSuku &&
                values.idPendidikan &&
                values.idPekerjaan &&
                values.idPendapatan &&
                values.idJaminanKesehatan &&
                (isKepalaKeluarga || values.idKeluarga)
            );
        }

        if (currentStep === 2) {
            // If not creating user account, can proceed
            if (!createUserAccount) return true;

            // If creating new user, require email and password
            if (!hasExistingUser) {
                return values.email && values.password && values.confirmPassword;
            }

            // If updating existing user, only require email
            return values.email;
        }

        if (currentStep === 3 && createKeluarga) {
            return (
                values.idStatusKeluarga &&
                values.idStatusKepemilikanRumah &&
                values.idKeadaanRumah &&
                values.idRayon &&
                values.noBagungan
            );
        }

        if (currentStep === 4 && createKeluarga) {
            return values.idKelurahan && values.rt && values.rw && values.jalan;
        }

        return true;
    };

    const handleSubmit = async () => {
        const submitData = {
            ...formData.jemaat,
            updateUser: createUserAccount,
            ...(createUserAccount && formData.user),
            updateKeluarga: createKeluarga,
            ...(createKeluarga && { keluargaData: formData.keluarga }),
            updateAlamat: createKeluarga, // Always create alamat when creating keluarga
            ...(createKeluarga && {
                alamatData: {
                    idKelurahan: form.getValues("idKelurahan"),
                    rt: parseInt(form.getValues("rt")),
                    rw: parseInt(form.getValues("rw")),
                    jalan: form.getValues("jalan"),
                },
            }),
        };

        updateJemaatMutation.mutate({ id, data: submitData });
    };

    if (jemaatLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <PageHeader
                    breadcrumb={[
                        { label: "Dashboard", href: "/employee/dashboard" },
                        { label: "Jemaat", href: "/employee/jemaat" },
                        { label: "Edit Jemaat" },
                    ]}
                    description="Perbarui data jemaat"
                    title="Edit Jemaat"
                />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Memuat data jemaat...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!jemaatData?.data) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <PageHeader
                    breadcrumb={[
                        { label: "Dashboard", href: "/employee/dashboard" },
                        { label: "Jemaat", href: "/employee/jemaat" },
                        { label: "Edit Jemaat" },
                    ]}
                    description="Perbarui data jemaat"
                    title="Edit Jemaat"
                />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">Data jemaat tidak ditemukan</p>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            onClick={() => router.push("/employee/jemaat")}
                        >
                            Kembali ke Daftar Jemaat
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <PageHeader
                actions={[
                    {
                        label: "Kembali",
                        icon: ArrowLeft,
                        variant: "outline",
                        onClick: () => router.push("/employee/jemaat"),
                    },
                ]}
                breadcrumb={[
                    { label: "Dashboard", href: "/employee/dashboard" },
                    { label: "Jemaat", href: "/employee/jemaat" },
                    { label: "Edit Jemaat" },
                ]}
                description="Perbarui data jemaat dengan mengikuti langkah-langkah berikut"
                title="Edit Jemaat"
            />

            <Card className="p-6 mt-4">
                {/* Pass the dynamic steps slice to Stepper */}
                <Stepper
                    currentStep={currentStep}
                    steps={steps.slice(0, getMaxStep())}
                />

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        {/* Step 1: Data Jemaat */}
                        {currentStep === 1 && (
                            <StepContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        options={[
                                            { value: "true", label: "Laki-laki" },
                                            { value: "false", label: "Perempuan" },
                                        ]}
                                        placeholder="Pilih jenis kelamin"
                                    />

                                    <DatePicker
                                        label="Tanggal Lahir"
                                        name="tanggalLahir"
                                        placeholder="Pilih tanggal lahir"
                                        required={true}
                                    />

                                    <SelectInput
                                        label="Golongan Darah"
                                        name="golonganDarah"
                                        options={[
                                            { value: "A", label: "A" },
                                            { value: "B", label: "B" },
                                            { value: "AB", label: "AB" },
                                            { value: "O", label: "O" },
                                        ]}
                                        placeholder="Pilih golongan darah"
                                    />

                                    <AutoCompleteInput
                                        required
                                        label="Status Dalam Keluarga"
                                        name="idStatusDalamKeluarga"
                                        options={statusDalamKeluarga || []}
                                        placeholder="Pilih status"
                                    />

                                    {!isKepalaKeluarga && (
                                        <AutoCompleteInput
                                            required
                                            label="Keluarga"
                                            name="idKeluarga"
                                            options={keluargaList || []}
                                            placeholder="Pilih keluarga"
                                        />
                                    )}

                                    <AutoCompleteInput
                                        required
                                        label="Suku"
                                        name="idSuku"
                                        options={suku || []}
                                        placeholder="Pilih suku"
                                    />

                                    <AutoCompleteInput
                                        required
                                        label="Pendidikan"
                                        name="idPendidikan"
                                        options={pendidikan || []}
                                        placeholder="Pilih pendidikan"
                                    />

                                    <AutoCompleteInput
                                        required
                                        label="Pekerjaan"
                                        name="idPekerjaan"
                                        options={pekerjaan || []}
                                        placeholder="Pilih pekerjaan"
                                    />

                                    <AutoCompleteInput
                                        required
                                        label="Pendapatan"
                                        name="idPendapatan"
                                        options={pendapatan || []}
                                        placeholder="Pilih pendapatan"
                                    />

                                    <AutoCompleteInput
                                        required
                                        label="Jaminan Kesehatan"
                                        name="idJaminanKesehatan"
                                        options={jaminanKesehatan || []}
                                        placeholder="Pilih jaminan kesehatan"
                                    />
                                </div>
                            </StepContent>
                        )}

                        {/* Step 2: User Account */}
                        {currentStep === 2 && (
                            <StepContent>
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            Akun Pengguna
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Kelola akses login jemaat ini
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {createUserAccount ? "Aktif" : "Tidak Aktif"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setCreateUserAccount(!createUserAccount)}
                                            className={`${createUserAccount ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`${createUserAccount ? 'translate-x-5' : 'translate-x-0'
                                                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {createUserAccount && (
                                    <div className="space-y-4 animate-fadeIn">
                                        <TextInput
                                            required={!hasExistingUser}
                                            label="Email"
                                            name="email"
                                            placeholder="Masukkan email"
                                            type="email"
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <TextInput
                                                required={!hasExistingUser}
                                                label="Password"
                                                name="password"
                                                placeholder={hasExistingUser ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                                                type="password"
                                            />

                                            <TextInput
                                                required={!hasExistingUser}
                                                label="Konfirmasi Password"
                                                name="confirmPassword"
                                                placeholder="Ulangi password"
                                                type="password"
                                            />
                                        </div>

                                        <AutoCompleteInput
                                            required
                                            label="Role Pengguna"
                                            name="role"
                                            options={[
                                                { value: "JEMAAT", label: "Jemaat" },
                                                { value: "MAJELIS", label: "Majelis" },
                                                // Typically admin/employee roles are not assigned here
                                            ]}
                                            placeholder="Pilih role"
                                        />
                                    </div>
                                )}
                            </StepContent>
                        )}

                        {/* Step 3: Data Keluarga */}
                        {currentStep === 3 && createKeluarga && (
                            <StepContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AutoCompleteInput
                                        required
                                        label="Status Keluarga"
                                        name="idStatusKeluarga"
                                        options={statusKeluargaOptions}
                                        placeholder="Pilih status keluarga"
                                    />

                                    <AutoCompleteInput
                                        required
                                        label="Status Kepemilikan Rumah"
                                        name="idStatusKepemilikanRumah"
                                        options={statusKepemilikanRumahOptions}
                                        placeholder="Pilih status kepemilikan"
                                    />

                                    <AutoCompleteInput
                                        required
                                        label="Keadaan Rumah"
                                        name="idKeadaanRumah"
                                        options={keadaanRumahOptions}
                                        placeholder="Pilih keadaan rumah"
                                    />

                                    <AutoCompleteInput
                                        required
                                        label="Rayon"
                                        name="idRayon"
                                        options={rayonOptions}
                                        placeholder="Pilih rayon"
                                    />

                                    <TextInput
                                        required
                                        label="Nomor Bagungan"
                                        name="noBagungan"
                                        placeholder="Masukkan nomor bagungan"
                                        type="number"
                                    />
                                </div>
                            </StepContent>
                        )}

                        {/* Step 4: Alamat */}
                        {currentStep === 4 && createKeluarga && (
                            <StepContent>
                                <div className="grid grid-cols-1 gap-6">
                                    <AutoCompleteInput
                                        required
                                        label="Kelurahan"
                                        name="idKelurahan"
                                        options={kelurahanOptions}
                                        placeholder="Cari kelurahan..."
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <TextInput
                                            required
                                            label="RT"
                                            name="rt"
                                            placeholder="001"
                                        />
                                        <TextInput
                                            required
                                            label="RW"
                                            name="rw"
                                            placeholder="001"
                                        />
                                    </div>

                                    <TextInput
                                        required
                                        label="Nama Jalan / Alamat Lengkap"
                                        name="jalan"
                                        placeholder="Jl. Mawar No. 123"
                                    />
                                </div>
                            </StepContent>
                        )}

                        {/* Navigation Actions */}
                        <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${currentStep === 1 ? 'invisible' : 'visible'
                                        }`}
                                >
                                    Kembali
                                </button>
                                <button
                                    type="button"
                                    onClick={canGoNext() ? (currentStep === getMaxStep() ? form.handleSubmit(handleSubmit) : handleNext) : undefined}
                                    disabled={!canGoNext() || updateJemaatMutation.isLoading}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!canGoNext() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {updateJemaatMutation.isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : currentStep === getMaxStep() ? (
                                        'Simpan Perubahan'
                                    ) : (
                                        'Selanjutnnya'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </Card>
        </div>
    );
}
