import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TextInput from "@/components/ui/inputs/TextInput";
import PageTitle from "@/components/ui/PageTitle";
import SkeletonInput from "@/components/ui/skeletons/SkeletonInput";
import Stepper, {
  StepContent,
  StepperNavigation,
} from "@/components/ui/Stepper";
import { GOLONGAN_DARAH_OPTIONS } from "@/constants/golonganDarah";
import { JENIS_KELAMIN_OPTIONS } from "@/constants/jenisKelamin";
import { useAuth } from "@/contexts/AuthContext";
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
    description: "Pembuatan akun login (Wajib)",
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

export default function MajelisCreateJemaat() {
  const router = useRouter();
  const { user } = useAuth();
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
  const [createKeluarga, setCreateKeluarga] = useState(false);
  const [createAlamat, setCreateAlamat] = useState(false);
  const [preSelectedKeluarga, setPreSelectedKeluarga] = useState(null);

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
      // User fields - WAJIB untuk semua jemaat
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
      idRayon: user?.majelis?.idRayon || "", // Auto-set ke rayon majelis
      noBagungan: "",
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
    staleTime: 10 * 60 * 1000, // 10 menit (static data)
    cacheTime: 30 * 60 * 1000,
  });

  // Only get keluarga for this majelis's rayon
  const {
    data: keluargaListData,
    isLoading: isLoadingKeluargaList,
    refetch: refetchKeluargaList,
  } = useQuery({
    queryKey: ["keluarga-list", user?.majelis?.idRayon],
    queryFn: async () => {
      const response = await masterService.getKeluargaByRayon(
        user?.majelis?.idRayon
      );
      return (
        response.data?.items?.map((item) => {
          const kepalaKeluarga = item.jemaats?.find((j) =>
            j.statusDalamKeluarga?.status?.toLowerCase().includes("kepala")
          );
          const kepalaName =
            kepalaKeluarga?.nama || "Belum ada kepala keluarga";

          const displayNik = item.noKK ? `NIK: ${item.noKK}` : "NIK Belum diisi";

          return {
            value: item.id,
            label: `${displayNik} - ${kepalaName} (No. Bagungan: ${item.noBagungan})`,
          };
        }) || []
      );
    },
    enabled: false,
    staleTime: 3 * 60 * 1000, // 3 menit (dynamic data)
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
  const [kelurahanOptions, setKelurahanOptions] = useState([]);

  // Sync query data to local state
  useEffect(() => {
    if (statusDalamKeluargaData) setStatusDalamKeluargaOptions(statusDalamKeluargaData);
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
    if (kelurahanData) setKelurahanOptions(kelurahanData);
  }, [kelurahanData]);

  // Load Step 1 options
  const loadStep1Options = async () => {
    await refetchStatusDalamKeluarga();
    await refetchSuku();
    await refetchPendidikan();
    await refetchPekerjaan();
    await refetchPendapatan();
    await refetchJaminanKesehatan();
    if (!isKepalaKeluarga) {
      await refetchKeluargaList();
    }
  };

  // Load Step 3 options
  const loadStep3Options = async () => {
    await refetchStatusKeluarga();
    await refetchStatusKepemilikanRumah();
    await refetchKeadaanRumah();
  };

  // Load Step 4 options
  const loadStep4Options = async () => {
    await refetchKelurahan();
  };

  // Load step 1 options when component mounts
  useEffect(() => {
    loadStep1Options();
  }, [user?.majelis?.idRayon]);

  // Watch status dalam keluarga to determine if user is kepala keluarga
  const watchStatusDalamKeluarga = form.watch("idStatusDalamKeluarga");

  // Handle URL parameters for pre-filled keluarga
  useEffect(() => {
    if (keluargaId && isKepalaKeluargaParam === "true") {
      form.setValue("idKeluarga", keluargaId);
      setPreSelectedKeluarga(keluargaId);
      setIsKepalaKeluarga(true);
      // DON'T create keluarga or alamat since they already exist
      setCreateKeluarga(false);
      setCreateAlamat(false);

      // Auto-set kepala keluarga status
      if (statusDalamKeluargaOptions.length > 0) {
        const kepalaKeluargaStatus = statusDalamKeluargaOptions.find(
          (status) => status.label.toLowerCase().includes("kepala")
        );

        if (kepalaKeluargaStatus) {
          form.setValue("idStatusDalamKeluarga", kepalaKeluargaStatus.value);
        }
      }
    }
  }, [keluargaId, isKepalaKeluargaParam, statusDalamKeluargaOptions, form]);

  useEffect(() => {
    if (statusDalamKeluargaOptions.length > 0) {
      const kepalaKeluargaStatus = statusDalamKeluargaOptions.find(
        (status) => status.label.toLowerCase().includes("kepala")
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
  }, [watchStatusDalamKeluarga, statusDalamKeluargaOptions, preSelectedKeluarga, form]);

  // Auto-set rayon to majelis's rayon when creating keluarga
  useEffect(() => {
    if (createKeluarga && user?.majelis?.idRayon) {
      form.setValue("idRayon", user.majelis.idRayon);
    }
  }, [createKeluarga, user?.majelis?.idRayon, form]);

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

      // Invalidate jemaat query to refetch data
      queryClient.invalidateQueries({ queryKey: ["jemaat"] });

      // Redirect to majelis jemaat page
      router.push("/majelis/jemaat");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal membuat jemaat",
        color: "error",
      });
    },
  });

  // Check if user has rayon access AFTER all hooks are declared
  if (!user?.majelis?.idRayon) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Akses Terbatas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Anda belum memiliki akses ke rayon manapun. Silakan hubungi
                administrator.
              </p>
              <Button variant="outline" onClick={() => router.push("/majelis/dashboard")}>
                Kembali ke Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate jemaat data
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
    } else if (currentStep === 2) {
      // Validate user data - WAJIB untuk semua jemaat
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

      // Load step 3 options if creating keluarga
      if (createKeluarga) {
        await loadStep3Options();
      }
    } else if (currentStep === 3 && createKeluarga) {
      // Validate keluarga data
      const keluargaData = {
        idStatusKeluarga: form.getValues("idStatusKeluarga"),
        idStatusKepemilikanRumah: form.getValues("idStatusKepemilikanRumah"),
        idKeadaanRumah: form.getValues("idKeadaanRumah"),
        idRayon: user?.majelis?.idRayon, // Force to majelis's rayon
        noBagungan: Number(form.getValues("noBagungan")) || 0, // Use Number() with fallback
      };

      setFormData((prev) => ({ ...prev, keluarga: keluargaData }));

      // Load step 4 options
      await loadStep4Options();
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

  const handleGenerateDefaultPassword = () => {
    const defaultPassword = "oepura78";

    form.setValue("password", defaultPassword);
    form.setValue("confirmPassword", defaultPassword);
    showToast({
      title: "Password Generated",
      description: `Password default "${defaultPassword}" berhasil diisi`,
      color: "success",
    });
  };

  const getMaxStep = () => {
    if (!createKeluarga) return 2; // Always include user account step

    // Alamat is always required when creating keluarga
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
    "username",
    "email",
    "password",
    "confirmPassword",
    "noWhatsapp",
    "idStatusKeluarga",
    "idStatusKepemilikanRumah",
    "idKeadaanRumah",
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
      // User account is MANDATORY
      return (
        values.username &&
        values.email &&
        values.password &&
        values.confirmPassword
      );
    }

    if (currentStep === 3 && createKeluarga) {
      // Check if keluarga data is still loading
      const isKeluargaDataLoaded =
        !isLoadingStatusKeluarga &&
        !isLoadingStatusKepemilikanRumah &&
        !isLoadingKeadaanRumah;

      if (!isKeluargaDataLoaded) return false;

      return (
        values.idStatusKeluarga &&
        values.idStatusKepemilikanRumah &&
        values.idKeadaanRumah &&
        values.noBagungan
      );
    }

    if (currentStep === 4 && createKeluarga) {
      if (isLoadingKelurahan) return false;

      return values.idKelurahan && values.rt && values.rw && values.jalan;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Get user data directly from form (in case user clicked submit without clicking "next" on step 2)
    const userData = {
      username: form.getValues("username"),
      email: form.getValues("email"),
      password: form.getValues("password"),
      noWhatsapp: form.getValues("noWhatsapp") || null,
      role: form.getValues("role"),
    };

    const submitData = {
      ...formData.jemaat,
      createUser: true, // ALWAYS create user account for majelis
      ...userData, // Use fresh data from form instead of formData.user
      createKeluarga,
      ...(createKeluarga && {
        keluargaData: {
          ...formData.keluarga,
          idRayon: user?.majelis?.idRayon, // Ensure idRayon is always set from user's majelis
        },
      }),
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

    createJemaatMutation.mutate(submitData);
  };

  return (
    <ProtectedRoute allowedRoles="MAJELIS">
      <PageTitle
        description={`Tambah jemaat baru untuk ${user?.majelis?.rayon?.namaRayon || "rayon Anda"}`}
        title="Tambah Jemaat Baru"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                className="flex items-center space-x-2"
                variant="outline"
                onClick={() => router.push("/majelis/jemaat")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tambah Jemaat Baru
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rayon: {user?.majelis?.rayon?.namaRayon || "Tidak diketahui"}
                </p>
              </div>
            </div>
          </div>

          <Card className="p-6">
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
                      <div>
                        <TextInput
                          required
                          label="Nama Lengkap"
                          name="nama"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>

                      <div>
                        <AutoCompleteInput
                          required
                          label="Jenis Kelamin"
                          name="jenisKelamin"
                          options={JENIS_KELAMIN_OPTIONS}
                          placeholder="Pilih jenis kelamin"
                        />
                      </div>

                      <div>
                        <DatePicker
                          label="Tanggal Lahir"
                          name="tanggalLahir"
                          placeholder="Pilih tanggal lahir"
                          required={true}
                        />
                      </div>

                      <div>
                        <AutoCompleteInput
                          label="Golongan Darah"
                          name="golonganDarah"
                          options={GOLONGAN_DARAH_OPTIONS}
                          placeholder="Pilih golongan darah"
                        />
                      </div>

                      <div>
                        {isLoadingStatusDalamKeluarga ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            required
                            label="Status Dalam Keluarga"
                            name="idStatusDalamKeluarga"
                            options={statusDalamKeluargaOptions}
                            placeholder="Pilih status"
                          />
                        )}
                      </div>

                      {!isKepalaKeluarga && !preSelectedKeluarga && (
                        <div>
                          {isLoadingKeluargaList ? (
                            <SkeletonInput />
                          ) : (
                            <AutoCompleteInput
                              label="Keluarga (Cari berdasarkan NIK Kepala Keluarga)"
                              name="idKeluarga"
                              options={keluargaListOptions}
                              placeholder="Ketik NIK untuk mencari keluarga..."
                              required={
                                !isKepalaKeluarga && !preSelectedKeluarga
                              }
                            />
                          )}
                        </div>
                      )}

                      {preSelectedKeluarga && (
                        <div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              <strong>Kepala Keluarga</strong> - Jemaat ini akan
                              menjadi kepala keluarga untuk keluarga yang sudah
                              dibuat.
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        {isLoadingSuku ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            required
                            label="Suku"
                            name="idSuku"
                            options={sukuOptions}
                            placeholder="Pilih suku"
                          />
                        )}
                      </div>

                      <div>
                        {isLoadingPendidikan ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            required
                            label="Pendidikan"
                            name="idPendidikan"
                            options={pendidikanOptions}
                            placeholder="Pilih pendidikan"
                          />
                        )}
                      </div>

                      <div>
                        {isLoadingPekerjaan ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            required
                            label="Pekerjaan"
                            name="idPekerjaan"
                            options={pekerjaanOptions}
                            placeholder="Pilih pekerjaan"
                          />
                        )}
                      </div>

                      <div>
                        {isLoadingPendapatan ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            required
                            label="Pendapatan"
                            name="idPendapatan"
                            options={pendapatanOptions}
                            placeholder="Pilih pendapatan"
                          />
                        )}
                      </div>

                      <div>
                        {isLoadingJaminanKesehatan ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            required
                            label="Jaminan Kesehatan"
                            name="idJaminanKesehatan"
                            options={jaminanKesehatanOptions}
                            placeholder="Pilih jaminan kesehatan"
                          />
                        )}
                      </div>
                    </div>
                  </StepContent>
                )}

                {/* Step 2: User Account - MANDATORY */}
                {currentStep === 2 && (
                  <StepContent>
                    <div className="mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Akun User Wajib</strong> - Semua jemaat harus
                          memiliki akun untuk login ke sistem.
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                        type="button"
                        onClick={handleGenerateDefaultPassword}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clipRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            fillRule="evenodd"
                          />
                        </svg>
                        Generate Password Default (oepura78)
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Klik tombol di atas untuk mengisi password dengan
                        default <strong>oepura78</strong>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <TextInput
                          required
                          label="Username"
                          name="username"
                          placeholder="Username untuk login"
                        />
                      </div>

                      <div>
                        <TextInput
                          required
                          label="Email"
                          name="email"
                          placeholder="contoh@email.com"
                          type="email"
                        />
                      </div>

                      <div>
                        <TextInput
                          label="No. WhatsApp"
                          name="noWhatsapp"
                          placeholder="08123456789"
                          type="tel"
                        />
                      </div>

                      <div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Role <span className="text-red-500">*</span>
                          </label>
                          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              JEMAAT
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Role otomatis diset ke JEMAAT
                          </p>
                        </div>
                      </div>

                      <div>
                        <TextInput
                          required
                          label="Password"
                          name="password"
                          placeholder="Masukkan password"
                          type="password"
                        />
                      </div>

                      <div>
                        <TextInput
                          required
                          label="Konfirmasi Password"
                          name="confirmPassword"
                          placeholder="Ulangi password"
                          type="password"
                        />
                      </div>
                    </div>
                  </StepContent>
                )}

                {/* Step 3: Keluarga Data */}
                {currentStep === 3 && createKeluarga && (
                  <StepContent>
                    <div className="mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Jemaat ini adalah kepala keluarga. Silakan lengkapi
                          data keluarga.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        {isLoadingStatusKeluarga ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            label="Status Keluarga"
                            name="idStatusKeluarga"
                            options={statusKeluargaOptions}
                            placeholder="Pilih status keluarga"
                            required={createKeluarga}
                          />
                        )}
                      </div>

                      <div>
                        {isLoadingStatusKepemilikanRumah ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            label="Status Kepemilikan Rumah"
                            name="idStatusKepemilikanRumah"
                            options={statusKepemilikanRumahOptions}
                            placeholder="Pilih status kepemilikan"
                            required={createKeluarga}
                          />
                        )}
                      </div>

                      <div>
                        {isLoadingKeadaanRumah ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            label="Keadaan Rumah"
                            name="idKeadaanRumah"
                            options={keadaanRumahOptions}
                            placeholder="Pilih keadaan rumah"
                            required={createKeluarga}
                          />
                        )}
                      </div>

                      <div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Rayon <span className="text-red-500">*</span>
                          </label>
                          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {user?.majelis?.rayon?.namaRayon || "Rayon Anda"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Rayon otomatis diset sesuai dengan tugas Anda
                          </p>
                        </div>
                      </div>

                      <div>
                        <TextInput
                          label="No. Bagungan"
                          name="noBagungan"
                          placeholder="Masukkan nomor bagungan"
                          required={createKeluarga}
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Alamat akan otomatis dibuat untuk keluarga baru ini.
                        </p>
                      </div>
                    </div>
                  </StepContent>
                )}

                {/* Step 4: Alamat */}
                {currentStep === 4 && createKeluarga && (
                  <StepContent>
                    <div className="mb-6">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Lengkapi alamat untuk keluarga baru ini.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        {isLoadingKelurahan ? (
                          <SkeletonInput />
                        ) : (
                          <AutoCompleteInput
                            label="Kelurahan"
                            name="idKelurahan"
                            options={kelurahanOptions}
                            placeholder="Pilih kelurahan"
                            required={createKeluarga}
                          />
                        )}
                      </div>

                      <div>
                        <TextInput
                          label="Jalan"
                          name="jalan"
                          placeholder="Nama jalan / kampung"
                          required={createKeluarga}
                        />
                      </div>

                      <div>
                        <TextInput
                          label="RT"
                          name="rt"
                          placeholder="001"
                          required={createKeluarga}
                          type="number"
                        />
                      </div>

                      <div>
                        <TextInput
                          label="RW"
                          name="rw"
                          placeholder="001"
                          required={createKeluarga}
                          type="number"
                        />
                      </div>
                    </div>
                  </StepContent>
                )}

                <StepperNavigation
                  canGoNext={canGoNext()}
                  currentStep={currentStep}
                  isLoading={createJemaatMutation.isPending}
                  nextButtonText="Lanjut"
                  submitButtonText="Simpan Jemaat"
                  totalSteps={getMaxStep()}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onSubmit={handleSubmit}
                />
              </form>
            </FormProvider>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
