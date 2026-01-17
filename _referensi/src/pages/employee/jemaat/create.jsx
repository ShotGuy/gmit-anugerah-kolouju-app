import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import SwitchInput from "@/components/ui/inputs/SwitchInput";
import TextInput from "@/components/ui/inputs/TextInput";
import PageHeader from "@/components/ui/PageHeader";
import PageTitle from "@/components/ui/PageTitle";
import Stepper, {
    StepContent,
    StepperNavigation,
} from "@/components/ui/Stepper";
import { GOLONGAN_DARAH_OPTIONS } from "@/constants/golonganDarah";
import { USER_ROLE_OPTIONS } from "@/constants/userRoles";
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

export default function EmployeeCreateJemaat() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { keluargaId, isKepalaKeluarga: isKepalaKeluargaParam } = router.query;
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        jemaat: {},
        user: {},
        keluarga: {},
        alamat: {},
    });
    const [isKepalaKeluarga, setIsKepalaKeluarga] = useState(false);
    const [createUserAccount, setCreateUserAccount] = useState(true);
    const [createKeluarga, setCreateKeluarga] = useState(false);
    const [createAlamat, setCreateAlamat] = useState(false);
    const [preSelectedKeluarga, setPreSelectedKeluarga] = useState(null);
    const [selectedKeluargaRayon, setSelectedKeluargaRayon] = useState(null); // Track selected keluarga's rayon

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
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            noWhatsapp: "",
            role: "JEMAAT",
            // Keluarga fields
            idStatusKeluarga: "",
            idStatusKepemilikanRumah: "",
            idKeadaanRumah: "",
            idRayon: "",
            noBagungan: "",
            noKK: "",
            // Alamat fields
            idKelurahan: "",
            rt: "",
            rw: "",
            jalan: "",
        },
    });

    // ===== STEP 1 OPTIONS (Lazy Load with Cache) =====
    const {
        data: statusDalamKeluargaData,
        isLoading: isLoadingStatusDalamKeluarga,
        refetch: refetchStatusDalamKeluarga,
    } = useQuery({
        queryKey: ["status-dalam-keluarga"],
        queryFn: async () => {
            const response = await masterService.getStatusDalamKeluarga();

            return (
                response.data?.items?.map((item) => ({
                    value: item.id,
                    label: item.status,
                    raw: item,
                })) || []
            );
        },
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const {
        data: keluargaListData,
        isLoading: isLoadingKeluargaList,
        refetch: refetchKeluargaList,
    } = useQuery({
        queryKey: ["keluarga-list"],
        queryFn: async () => {
            const response = await masterService.getKeluarga();

            return (
                response.data?.items?.map((item) => {
                    const kepalaKeluarga = item.jemaats?.find((j) =>
                        j.statusDalamKeluarga?.status?.toLowerCase().includes("kepala")
                    );
                    const kepalaName =
                        kepalaKeluarga?.nama || "Belum ada kepala keluarga";

                    return {
                        value: item.id,
                        label: `${kepalaName} - No. ${item.noBagungan} (${item.rayon?.namaRayon})`,
                        rayonId: item.idRayon,
                        rayonName: item.rayon?.namaRayon,
                    };
                }) || []
            );
        },
        enabled: false,
        staleTime: 3 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    const {
        data: sukuData,
        isLoading: isLoadingSuku,
        refetch: refetchSuku,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });
    const {
        data: pendidikanData,
        isLoading: isLoadingPendidikan,
        refetch: refetchPendidikan,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const {
        data: pekerjaanData,
        isLoading: isLoadingPekerjaan,
        refetch: refetchPekerjaan,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const {
        data: pendapatanData,
        isLoading: isLoadingPendapatan,
        refetch: refetchPendapatan,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const {
        data: jaminanKesehatanData,
        isLoading: isLoadingJaminanKesehatan,
        refetch: refetchJaminanKesehatan,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    // ===== STEP 3 OPTIONS (Conditional Load) =====
    const {
        data: statusKeluargaData,
        isLoading: isLoadingStatusKeluarga,
        refetch: refetchStatusKeluarga,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const {
        data: statusKepemilikanRumahData,
        isLoading: isLoadingStatusKepemilikanRumah,
        refetch: refetchStatusKepemilikanRumah,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const {
        data: keadaanRumahData,
        isLoading: isLoadingKeadaanRumah,
        refetch: refetchKeadaanRumah,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const {
        data: rayonData,
        isLoading: isLoadingRayon,
        refetch: refetchRayon,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    // ===== STEP 4 OPTIONS =====
    const {
        data: kelurahanData,
        isLoading: isLoadingKelurahan,
        refetch: refetchKelurahan,
    } = useQuery({
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
        enabled: false,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    // Local state for options
    const [statusDalamKeluargaOptions, setStatusDalamKeluargaOptions] = useState(
        []
    );
    const [keluargaListOptions, setKeluargaListOptions] = useState([]);
    const [sukuOptions, setSukuOptions] = useState([]);
    const [pendidikanOptions, setPendidikanOptions] = useState([]);
    const [pekerjaanOptions, setPekerjaanOptions] = useState([]);
    const [pendapatanOptions, setPendapatanOptions] = useState([]);
    const [jaminanKesehatanOptions, setJaminanKesehatanOptions] = useState([]);
    const [statusKeluargaOptions, setStatusKeluargaOptions] = useState([]);
    const [statusKepemilikanRumahOptions, setStatusKepemilikanRumahOptions] =
        useState([]);
    const [keadaanRumahOptions, setKeadaanRumahOptions] = useState([]);
    const [rayonOptions, setRayonOptions] = useState([]);
    const [kelurahanOptions, setKelurahanOptions] = useState([]);

    // Sync query data to local state
    useEffect(() => {
        if (statusDalamKeluargaData)
            setStatusDalamKeluargaOptions(statusDalamKeluargaData);
    }, [statusDalamKeluargaData]);

    useEffect(() => {
        if (keluargaListData) setKeluargaListOptions(keluargaListData);
    }, [keluargaListData]);

    useEffect(() => {
        if (sukuData) setSukuOptions(sukuData);
    }, [sukuData]);

    useEffect(() => {
        if (pendidikanData) setPendidikanOptions(pendidikanData);
    }, [pendidikanData]);

    useEffect(() => {
        if (pekerjaanData) setPekerjaanOptions(pekerjaanData);
    }, [pekerjaanData]);

    useEffect(() => {
        if (pendapatanData) setPendapatanOptions(pendapatanData);
    }, [pendapatanData]);

    useEffect(() => {
        if (jaminanKesehatanData) setJaminanKesehatanOptions(jaminanKesehatanData);
    }, [jaminanKesehatanData]);

    useEffect(() => {
        if (statusKeluargaData) setStatusKeluargaOptions(statusKeluargaData);
    }, [statusKeluargaData]);

    useEffect(() => {
        if (statusKepemilikanRumahData)
            setStatusKepemilikanRumahOptions(statusKepemilikanRumahData);
    }, [statusKepemilikanRumahData]);

    useEffect(() => {
        if (keadaanRumahData) setKeadaanRumahOptions(keadaanRumahData);
    }, [keadaanRumahData]);

    useEffect(() => {
        if (rayonData) setRayonOptions(rayonData);
    }, [rayonData]);

    useEffect(() => {
        if (kelurahanData) setKelurahanOptions(kelurahanData);
    }, [kelurahanData]);

    // Load functions with cache check
    const loadStep1Options = () => {
        if (statusDalamKeluargaOptions.length === 0) refetchStatusDalamKeluarga();
        if (sukuOptions.length === 0) refetchSuku();
        if (pendidikanOptions.length === 0) refetchPendidikan();
        if (pekerjaanOptions.length === 0) refetchPekerjaan();
        if (pendapatanOptions.length === 0) refetchPendapatan();
        if (jaminanKesehatanOptions.length === 0) refetchJaminanKesehatan();
        if (!isKepalaKeluarga && keluargaListOptions.length === 0)
            refetchKeluargaList();
    };

    const loadStep3Options = () => {
        if (statusKeluargaOptions.length === 0) refetchStatusKeluarga();
        if (statusKepemilikanRumahOptions.length === 0)
            refetchStatusKepemilikanRumah();
        if (keadaanRumahOptions.length === 0) refetchKeadaanRumah();
        if (rayonOptions.length === 0) refetchRayon();
    };

    const loadStep4Options = () => {
        if (kelurahanOptions.length === 0) refetchKelurahan();
    };

    // Auto-load options when component mounts (Step 1)
    useEffect(() => {
        loadStep1Options();
    }, []);

    // Load options when navigating to steps
    useEffect(() => {
        if (currentStep === 2 && isKepalaKeluarga && rayonOptions.length === 0) {
            // Load rayon options in step 2 if creating new keluarga
            refetchRayon();
        } else if (currentStep === 3 && createKeluarga) {
            loadStep3Options();
        } else if (currentStep === 4 && createAlamat) {
            loadStep4Options();
        }
    }, [currentStep, createKeluarga, createAlamat, isKepalaKeluarga, rayonOptions]);

    // Watch status dalam keluarga to determine if user is kepala keluarga
    const watchStatusDalamKeluarga = form.watch("idStatusDalamKeluarga");

    // Handle URL parameters for pre-filled keluarga
    useEffect(() => {
        if (keluargaId && isKepalaKeluargaParam === "true") {
            form.setValue("idKeluarga", keluargaId);
            setPreSelectedKeluarga(keluargaId);

            // Auto-set kepala keluarga status
            if (statusDalamKeluargaOptions.length > 0) {
                const kepalaKeluargaStatus = statusDalamKeluargaOptions.find((status) =>
                    status.label.toLowerCase().includes("kepala")
                );

                if (kepalaKeluargaStatus) {
                    form.setValue("idStatusDalamKeluarga", kepalaKeluargaStatus.value);
                    setIsKepalaKeluarga(true);
                }
            }

            // Auto-fill rayon from selected keluarga
            if (keluargaListOptions.length > 0) {
                const selectedKeluarga = keluargaListOptions.find(
                    (k) => k.value === keluargaId
                );
                if (selectedKeluarga?.rayonId) {
                    setSelectedKeluargaRayon(selectedKeluarga.rayonId);
                    form.setValue("idRayon", selectedKeluarga.rayonId);
                }
            }
        }
    }, [keluargaId, isKepalaKeluargaParam, statusDalamKeluargaOptions, keluargaListOptions, form]);

    // Watch keluarga selection and auto-fill rayon
    const watchIdKeluarga = form.watch("idKeluarga");
    useEffect(() => {
        if (watchIdKeluarga && !isKepalaKeluarga) {
            // If selecting existing keluarga (not creating new)
            const selectedKeluarga = keluargaListOptions.find(
                (k) => k.value === watchIdKeluarga
            );
            if (selectedKeluarga?.rayonId) {
                setSelectedKeluargaRayon(selectedKeluarga.rayonId);
                form.setValue("idRayon", selectedKeluarga.rayonId);
            }
        }
    }, [watchIdKeluarga, keluargaListOptions, isKepalaKeluarga, form]);

    useEffect(() => {
        if (statusDalamKeluargaOptions.length > 0) {
            const kepalaKeluargaStatus = statusDalamKeluargaOptions.find((status) =>
                status.label.toLowerCase().includes("kepala")
            );

            if (
                kepalaKeluargaStatus &&
                watchStatusDalamKeluarga === kepalaKeluargaStatus.value
            ) {
                setIsKepalaKeluarga(true);
                setCreateKeluarga(true);
                setCreateAlamat(true); // Always create alamat when creating keluarga
            } else {
                setIsKepalaKeluarga(false);
                // Don't set createKeluarga to false if we have pre-selected keluarga
                if (!preSelectedKeluarga) {
                    setCreateKeluarga(false);
                    setCreateAlamat(false);
                }
            }
        }
    }, [
        watchStatusDalamKeluarga,
        statusDalamKeluargaOptions,
        preSelectedKeluarga,
    ]);

    const createJemaatMutation = useMutation({
        mutationFn: jemaatService.createWithUser,
        onSuccess: (data) => {
            showToast({
                title: "Berhasil",
                description: preSelectedKeluarga
                    ? "Kepala keluarga berhasil dibuat! Keluarga sudah lengkap."
                    : "Jemaat berhasil dibuat!",
                color: "success",
            });

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["jemaat"] });
            queryClient.invalidateQueries({ queryKey: ["keluarga"] });
            queryClient.invalidateQueries({ queryKey: ["rayon"] });

            // Redirect to employee routes
            router.push(preSelectedKeluarga ? "/employee/keluarga" : "/employee/jemaat");
        },
        onError: (error) => {
            showToast({
                title: "Gagal",
                description: error.response?.data?.message || "Gagal membuat jemaat",
                color: "error",
            });
        },
    });

    const handleNext = () => {
        // Simpan data form ke state sesuai step
        if (currentStep === 1) {
            const jemaatData = {
                nama: form.getValues("nama"),
                jenisKelamin: form.getValues("jenisKelamin"),
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
        } else if (currentStep === 2 && createUserAccount) {
            const password = form.getValues("password");
            const confirmPassword = form.getValues("confirmPassword");

            if (password !== confirmPassword) {
                showToast({
                    title: "Error",
                    description: "Password dan konfirmasi password tidak cocok",
                    color: "error",
                });

                return;
            }

            const userData = {
                username: form.getValues("username"),
                email: form.getValues("email"),
                password: form.getValues("password"),
                noWhatsapp: form.getValues("noWhatsapp") || null,
                role: form.getValues("role"),
            };

            setFormData((prev) => ({ ...prev, user: userData }));
        } else if (currentStep === 3 && createKeluarga) {
            const keluargaData = {
                idStatusKeluarga: form.getValues("idStatusKeluarga"),
                idStatusKepemilikanRumah: form.getValues("idStatusKepemilikanRumah"),
                idKeadaanRumah: form.getValues("idKeadaanRumah"),
                idRayon: form.getValues("idRayon"),
                noBagungan: Number(form.getValues("noBagungan")) || 0, // Use Number() with fallback
                noKK: form.getValues("noKK"),
            };

            setFormData((prev) => ({ ...prev, keluarga: keluargaData }));
        }

        // HANYA lanjut jika belum mencapai step terakhir
        if (currentStep < getMaxStep()) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGenerateDefaultPassword = () => {
        const defaultPassword = "oepura78";

        form.setValue("password", defaultPassword);
        form.setValue("confirmPassword", defaultPassword);
    };

    const getMaxStep = () => {
        let maxStep = 1;

        if (createUserAccount) {
            maxStep = 2;
        }

        if (isKepalaKeluarga) {
            maxStep = 4;
        }

        return maxStep;
    };

    const isLastStep = () => {
        return currentStep === getMaxStep();
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
        "username",
        "email",
        "password",
        "confirmPassword",
        "noWhatsapp",
        "idStatusKeluarga",
        "idStatusKepemilikanRumah",
        "idKeadaanRumah",
        "idRayon",
        "noBagungan",
        "idKelurahan",
        "rt",
        "rw",
        "jalan",
    ]);

    const canGoNext = () => {
        const values = form.getValues();

        if (currentStep === 1) {
            // Check if required data is still loading
            const isDataLoaded =
                !isLoadingStatusDalamKeluarga &&
                !isLoadingSuku &&
                !isLoadingPendidikan &&
                !isLoadingPekerjaan &&
                !isLoadingPendapatan &&
                !isLoadingJaminanKesehatan;

            if (!isKepalaKeluarga && !preSelectedKeluarga && isLoadingKeluargaList) {
                return false;
            }

            if (!isDataLoaded) return false;

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
            if (!createUserAccount) {
                return true;
            }

            // If creating user account, validate required fields
            const hasUsername = values.username && values.username.trim() !== "";
            const hasEmail = values.email && values.email.trim() !== "";
            const hasPassword = values.password && values.password.length >= 1;
            const hasConfirmPassword =
                values.confirmPassword && values.confirmPassword.length >= 1;

            return hasUsername && hasEmail && hasPassword && hasConfirmPassword;
        }

        if (currentStep === 3 && createKeluarga) {
            // Check if keluarga data is still loading
            const isKeluargaDataLoaded =
                !isLoadingStatusKeluarga &&
                !isLoadingStatusKepemilikanRumah &&
                !isLoadingKeadaanRumah &&
                !isLoadingRayon;

            if (!isKeluargaDataLoaded) return false;

            return (
                values.idStatusKeluarga &&
                values.idStatusKepemilikanRumah &&
                values.idKeadaanRumah &&
                values.idRayon &&
                values.noBagungan
            );
        }

        if (currentStep === 4 && createKeluarga) {
            if (isLoadingKelurahan) return false;

            return values.idKelurahan && values.rt && values.rw && values.jalan;
        }

        return true;
    };

    const handleFormSubmit = async () => {
        // Get latest data from form for current step
        let latestKeluargaData = formData.keluarga;
        let latestUserData = formData.user;

        // Collect keluarga data if on step 3 or step 4
        if ((currentStep === 3 || currentStep === 4) && createKeluarga) {
            latestKeluargaData = {
                idStatusKeluarga: form.getValues("idStatusKeluarga"),
                idStatusKepemilikanRumah: form.getValues("idStatusKepemilikanRumah"),
                idKeadaanRumah: form.getValues("idKeadaanRumah"),
                idRayon: form.getValues("idRayon"),
                noBagungan: Number(form.getValues("noBagungan")) || 0, // Use Number() with fallback
                noKK: form.getValues("noKK"),
            };
        }

        // Get user data if creating account (in case user clicked submit without clicking "next" on step 2)
        if (createUserAccount) {
            latestUserData = {
                username: form.getValues("username"),
                email: form.getValues("email"),
                password: form.getValues("password"),
                noWhatsapp: form.getValues("noWhatsapp") || null,
                role: form.getValues("role"),
            };
        }

        const finalData = {
            ...formData.jemaat,
            createUser: createUserAccount,
            ...(createUserAccount && latestUserData),
            createKeluarga: createKeluarga,
            ...(createKeluarga && { keluargaData: latestKeluargaData }),
            createAlamat: createKeluarga, // Always create alamat when creating keluarga
            ...(createKeluarga && {
                alamatData: {
                    idKelurahan: form.getValues("idKelurahan"),
                    rt: parseInt(form.getValues("rt")),
                    rw: parseInt(form.getValues("rw")),
                    jalan: form.getValues("jalan"),
                },
            }),
        };

        createJemaatMutation.mutate(finalData);
    };

    return (
        <>
            <PageTitle title="Tambah Jemaat Baru" />

            {/* Header */}
            <PageHeader
                breadcrumb={[
                    { label: "Dashboard", href: "/employee/dashboard" }, // Updated
                    { label: "Jemaat", href: "/employee/jemaat" }, // Updated
                    { label: "Tambah Jemaat" },
                ]}
                description="Tambahkan data anggota jemaat baru ke dalam sistem"
                title="Tambah Jemaat"
            />

            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <Stepper currentStep={currentStep} steps={steps.slice(0, getMaxStep())} />

                <div className="mt-8">
                    <FormProvider {...form}>
                        <form onSubmit={(e) => e.preventDefault()}>
                            {/* Step 1: Data Jemaat */}
                            {currentStep === 1 && (
                                <StepContent>
                                    <Card className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <TextInput
                                                required
                                                label="Nama Lengkap"
                                                name="nama"
                                                placeholder="Masukkan nama lengkap"
                                            />

                                            <SwitchInput
                                                checkedText="Laki-laki"
                                                label="Jenis Kelamin"
                                                name="jenisKelamin"
                                                uncheckedText="Perempuan"
                                            />

                                            <DatePicker
                                                label="Tanggal Lahir"
                                                name="tanggalLahir"
                                                placeholder="Pilih tanggal lahir"
                                                required={true}
                                            />

                                            <AutoCompleteInput
                                                label="Golongan Darah"
                                                name="golonganDarah"
                                                options={GOLONGAN_DARAH_OPTIONS}
                                                placeholder="Pilih golongan darah"
                                            />

                                            <AutoCompleteInput
                                                required
                                                label="Status Dalam Keluarga"
                                                name="idStatusDalamKeluarga"
                                                options={statusDalamKeluargaOptions}
                                                placeholder="Pilih status"
                                            />

                                            {/* Tampilkan pilihan keluarga JIKA bukan kepala keluarga */}
                                            {!isKepalaKeluarga && (
                                                <AutoCompleteInput
                                                    required
                                                    className={preSelectedKeluarga ? "opacity-70" : ""}
                                                    disabled={!!preSelectedKeluarga}
                                                    label="Keluarga"
                                                    name="idKeluarga"
                                                    options={keluargaListOptions}
                                                    placeholder="Pilih keluarga"
                                                />
                                            )}

                                            <AutoCompleteInput
                                                required
                                                label="Suku"
                                                name="idSuku"
                                                options={sukuOptions}
                                                placeholder="Pilih suku"
                                            />

                                            <AutoCompleteInput
                                                required
                                                label="Pendidikan"
                                                name="idPendidikan"
                                                options={pendidikanOptions}
                                                placeholder="Pilih pendidikan"
                                            />

                                            <AutoCompleteInput
                                                required
                                                label="Pekerjaan"
                                                name="idPekerjaan"
                                                options={pekerjaanOptions}
                                                placeholder="Pilih pekerjaan"
                                            />

                                            <AutoCompleteInput
                                                required
                                                label="Pendapatan"
                                                name="idPendapatan"
                                                options={pendapatanOptions}
                                                placeholder="Pilih pendapatan"
                                            />

                                            <AutoCompleteInput
                                                required
                                                label="Jaminan Kesehatan"
                                                name="idJaminanKesehatan"
                                                options={jaminanKesehatanOptions}
                                                placeholder="Pilih jaminan kesehatan"
                                            />
                                        </div>
                                    </Card>
                                </StepContent>
                            )}

                            {/* Step 2: Akun User */}
                            {currentStep === 2 && (
                                <StepContent>
                                    <Card className="p-6">
                                        <div className="mb-6 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                    Buat Akun Pengguna?
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Jemaat akan bisa login ke aplikasi
                                                </p>
                                            </div>
                                            <SwitchInput
                                                checkedText="Ya"
                                                name="createUserAccount"
                                                uncheckedText="Tidak"
                                                value={createUserAccount}
                                                onChange={(val) => setCreateUserAccount(val)}
                                            />
                                        </div>

                                        {createUserAccount && (
                                            <div className="space-y-4 animate-fadeIn">
                                                <TextInput
                                                    required
                                                    label="Username"
                                                    name="username"
                                                    placeholder="Masukkan username"
                                                />

                                                <TextInput
                                                    required
                                                    label="Email"
                                                    name="email"
                                                    placeholder="Masukkan email"
                                                    type="email"
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <TextInput
                                                        required
                                                        label="Password"
                                                        name="password"
                                                        placeholder="Masukkan password"
                                                        type="password"
                                                    />

                                                    <TextInput
                                                        required
                                                        label="Konfirmasi Password"
                                                        name="confirmPassword"
                                                        placeholder="Ulangi password"
                                                        type="password"
                                                    />
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                                                        type="button"
                                                        onClick={handleGenerateDefaultPassword}
                                                    >
                                                        Gunakan Password Default (oepura78)
                                                    </button>
                                                </div>

                                                <TextInput
                                                    label="No. WhatsApp"
                                                    name="noWhatsapp"
                                                    placeholder="Contoh: 628123456789"
                                                    type="tel"
                                                />

                                                <AutoCompleteInput
                                                    required
                                                    label="Role Pengguna"
                                                    name="role"
                                                    options={USER_ROLE_OPTIONS}
                                                    placeholder="Pilih role"
                                                />
                                            </div>
                                        )}
                                    </Card>
                                </StepContent>
                            )}

                            {/* Step 3: Data Keluarga */}
                            {currentStep === 3 && createKeluarga && (
                                <StepContent>
                                    <Card className="p-6">
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

                                            <TextInput
                                                label="Nomor Kartu Keluarga (KK)"
                                                name="noKK"
                                                placeholder="Masukkan nomor KK"
                                                type="tex"
                                            />
                                        </div>
                                    </Card>
                                </StepContent>
                            )}

                            {/* Step 4: Alamat */}
                            {currentStep === 4 && createKeluarga && (
                                <StepContent>
                                    <Card className="p-6">
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
                                    </Card>
                                </StepContent>
                            )}

                            {/* Navigation Actions */}
                            <StepperNavigation
                                canGoNext={canGoNext()}
                                currentStep={currentStep}
                                isLastStep={isLastStep()}
                                isSubmitting={createJemaatMutation.isLoading}
                                onNext={isLastStep() ? handleFormSubmit : handleNext}
                                onPrevious={handlePrevious}
                            />
                        </form>
                    </FormProvider>
                </div>
            </div>
        </>
    );
}
