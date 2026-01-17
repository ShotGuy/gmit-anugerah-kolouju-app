import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, User } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import DatePicker from "@/components/ui/inputs/DatePicker";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextInput from "@/components/ui/inputs/TextInput";
import PageHeader from "@/components/ui/PageHeader";
import Stepper, {
  StepContent,
  StepperNavigation,
} from "@/components/ui/Stepper";
import atestasiService from "@/services/atestasiService";
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

export default function CreateJemaatFromAtestasi() {
  const router = useRouter();
  const { id: atestasiId } = router.query;

  const [currentStep, setCurrentStep] = useState(1);
  const [isKepalaKeluarga, setIsKepalaKeluarga] = useState(false);
  const [createUserAccount, setCreateUserAccount] = useState(true);
  const [createKeluarga, setCreateKeluarga] = useState(false);
  const [createAlamat, setCreateAlamat] = useState(false);

  const form = useForm({
    defaultValues: {
      // Jemaat fields
      nama: "",
      jenisKelamin: true,
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

  // Get atestasi data
  const { data: atestasiData, isLoading: atestasiLoading } = useQuery({
    queryKey: ["atestasi", atestasiId],
    queryFn: () => atestasiService.getById(atestasiId),
    enabled: !!atestasiId,
  });

  // Fetch master data
  const { data: statusDalamKeluarga } = useQuery({
    queryKey: ["status-dalam-keluarga"],
    queryFn: () => masterService.getStatusDalamKeluarga(),
  });

  const { data: keluargaList } = useQuery({
    queryKey: ["keluarga-list"],
    queryFn: () => masterService.getKeluarga(),
  });

  const { data: suku } = useQuery({
    queryKey: ["suku"],
    queryFn: () => masterService.getSuku(),
  });

  const { data: pendidikan } = useQuery({
    queryKey: ["pendidikan"],
    queryFn: () => masterService.getPendidikan(),
  });

  const { data: pekerjaan } = useQuery({
    queryKey: ["pekerjaan"],
    queryFn: () => masterService.getPekerjaan(),
  });

  const { data: pendapatan } = useQuery({
    queryKey: ["pendapatan"],
    queryFn: () => masterService.getPendapatan(),
  });

  const { data: jaminanKesehatan } = useQuery({
    queryKey: ["jaminan-kesehatan"],
    queryFn: () => masterService.getJaminanKesehatan(),
  });

  const { data: statusKeluarga } = useQuery({
    queryKey: ["status-keluarga"],
    queryFn: () => masterService.getStatusKeluarga(),
    enabled: createKeluarga,
  });

  const { data: statusKepemilikanRumah } = useQuery({
    queryKey: ["status-kepemilikan-rumah"],
    queryFn: () => masterService.getStatusKepemilikanRumah(),
    enabled: createKeluarga,
  });

  const { data: keadaanRumah } = useQuery({
    queryKey: ["keadaan-rumah"],
    queryFn: () => masterService.getKeadaanRumah(),
    enabled: createKeluarga,
  });

  const { data: rayon } = useQuery({
    queryKey: ["rayon"],
    queryFn: () => masterService.getRayon(),
    enabled: createKeluarga,
  });

  const { data: kelurahan } = useQuery({
    queryKey: ["kelurahan"],
    queryFn: () => masterService.getKelurahan(),
    enabled: createAlamat,
  });

  // Pre-fill nama from atestasi
  useEffect(() => {
    if (atestasiData?.data?.namaCalonJemaat) {
      form.setValue("nama", atestasiData.data.namaCalonJemaat);
    }
  }, [atestasiData, form]);

  const createJemaatMutation = useMutation({
    mutationFn: async (data) => {
      // Create jemaat and link to atestasi
      const response = await atestasiService.createJemaatFromAtestasi(
        atestasiId,
        data
      );

      return response;
    },
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Data jemaat berhasil dibuat dari atestasi",
        color: "success",
      });
      router.push("/employee/lainnya/atestasi");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal membuat data jemaat",
        color: "error",
      });
    },
  });

  const handleNext = () => {
    if (currentStep === 1) {
      // Dari step 1, selalu ke step 2 (akun user)
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Dari step 2, cek apakah perlu ke step 3
      if (createKeluarga) {
        setCurrentStep(3); // Ke step keluarga
      } else {
        // Skip ke submit langsung jika tidak buat keluarga
        return;
      }
    } else if (currentStep === 3) {
      // Dari step 3 ke step 4 (alamat)
      setCurrentStep(4);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (data) => {
    const submitData = {
      jemaat: {
        nama: data.nama,
        jenisKelamin: data.jenisKelamin,
        tanggalLahir: data.tanggalLahir,
        golonganDarah: data.golonganDarah || null,
        idKeluarga: data.idKeluarga,
        idStatusDalamKeluarga: data.idStatusDalamKeluarga,
        idSuku: data.idSuku,
        idPendidikan: data.idPendidikan,
        idPekerjaan: data.idPekerjaan,
        idPendapatan: data.idPendapatan,
        idJaminanKesehatan: data.idJaminanKesehatan,
      },
      user: createUserAccount
        ? {
            email: data.email,
            password: data.password,
            role: data.role,
          }
        : null,
      keluarga: createKeluarga
        ? {
            idStatusKeluarga: data.idStatusKeluarga,
            idStatusKepemilikanRumah: data.idStatusKepemilikanRumah,
            idKeadaanRumah: data.idKeadaanRumah,
            idRayon: data.idRayon,
            noBagungan: Number(data.noBagungan) || 0, // Use Number() with fallback
          }
        : null,
      alamat: createAlamat
        ? {
            idKelurahan: data.idKelurahan,
            rt: parseInt(data.rt),
            rw: parseInt(data.rw),
            jalan: data.jalan,
          }
        : null,
    };

    createJemaatMutation.mutate(submitData);
  };

  const getMaxStep = () => {
    if (!createUserAccount) return 1;
    if (!createKeluarga) return 2;

    return 4; // Keluarga + Alamat
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return (
          form.watch("nama") &&
          form.watch("tanggalLahir") &&
          form.watch("idStatusDalamKeluarga") &&
          form.watch("idSuku") &&
          form.watch("idPendidikan") &&
          form.watch("idPekerjaan") &&
          form.watch("idPendapatan") &&
          form.watch("idJaminanKesehatan") &&
          (createKeluarga || form.watch("idKeluarga"))
        );
      case 2:
        return (
          !createUserAccount ||
          (form.watch("email") &&
            form.watch("password") &&
            form.watch("confirmPassword") &&
            form.watch("password") === form.watch("confirmPassword"))
        );
      case 3:
        return (
          !createKeluarga ||
          (form.watch("idStatusKeluarga") &&
            form.watch("idStatusKepemilikanRumah") &&
            form.watch("idKeadaanRumah") &&
            form.watch("idRayon") &&
            form.watch("noBagungan"))
        );
      case 4:
        return (
          !createKeluarga ||
          (form.watch("idKelurahan") &&
            form.watch("rt") &&
            form.watch("rw") &&
            form.watch("jalan"))
        );
      default:
        return true;
    }
  };

  // Show loading indicator for atestasi (non-blocking)
  const isAtestasisLoading = atestasiLoading;

  return (
    <>
      <PageHeader
        actions={[
          {
            label: "Kembali",
            icon: ArrowLeft,
            variant: "outline",
            onClick: () => router.push("/employee/lainnya/atestasi"),
          },
        ]}
        breadcrumb={[
          { label: "Dashboard", href: "/employee/dashboard" },
          { label: "Atestasi", href: "/employee/lainnya/atestasi" },
          { label: "Buat Jemaat" },
        ]}
        description="Lengkapi data jemaat berdasarkan atestasi masuk"
        title="Buat Data Jemaat dari Atestasi"
      />

      <div className="space-y-6">
        {/* Atestasi Info */}
        {atestasiData?.data && (
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Atestasi Masuk</h3>
                <p className="text-sm text-gray-600">
                  Calon Jemaat:{" "}
                  <strong>{atestasiData.data.namaCalonJemaat}</strong>
                  {atestasiData.data.gerejaAsal && (
                    <span> • Dari: {atestasiData.data.gerejaAsal}</span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <Stepper
            currentStep={currentStep}
            steps={steps.slice(0, getMaxStep())}
          />

          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Step 1: Data Jemaat */}
            {currentStep === 1 && (
              <StepContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      {...form.register("nama", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin *
                    </label>
                    <select
                      {...form.register("jenisKelamin", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={true}>Laki-laki</option>
                      <option value={false}>Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <DatePicker
                      label="Tanggal Lahir"
                      placeholder="Pilih tanggal lahir"
                      required={true}
                      value={form.watch("tanggalLahir")}
                      onChange={(value) => form.setValue("tanggalLahir", value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Golongan Darah
                    </label>
                    <select
                      {...form.register("golonganDarah")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih golongan darah</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Dalam Keluarga *
                    </label>
                    <select
                      {...form.register("idStatusDalamKeluarga", {
                        required: true,
                        onChange: (e) => {
                          const selectedStatus =
                            statusDalamKeluarga?.data?.items?.find(
                              (s) => s.id === e.target.value
                            );
                          const isKepalaKeluarga = selectedStatus?.status
                            ?.toLowerCase()
                            .includes("kepala");

                          setIsKepalaKeluarga(isKepalaKeluarga);
                          setCreateKeluarga(isKepalaKeluarga);
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih status</option>
                      {statusDalamKeluarga?.data?.items?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suku *
                    </label>
                    <select
                      {...form.register("idSuku", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih suku</option>
                      {suku?.data?.items?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.namaSuku}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pendidikan *
                    </label>
                    <select
                      {...form.register("idPendidikan", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih pendidikan</option>
                      {pendidikan?.data?.items?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.jenjang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pekerjaan *
                    </label>
                    <select
                      {...form.register("idPekerjaan", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih pekerjaan</option>
                      {pekerjaan?.data?.items?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.namaPekerjaan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pendapatan *
                    </label>
                    <select
                      {...form.register("idPendapatan", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih pendapatan</option>
                      {pendapatan?.data?.items?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jaminan Kesehatan *
                    </label>
                    <select
                      {...form.register("idJaminanKesehatan", {
                        required: true,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih jaminan kesehatan</option>
                      {jaminanKesehatan?.data?.items?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.jenisJaminan}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Keluarga Selection */}
                <div className="mt-6">
                  {!isKepalaKeluarga && (
                    <label className="flex items-center mb-4">
                      <input
                        checked={createKeluarga}
                        className="mr-2"
                        type="checkbox"
                        onChange={(e) => setCreateKeluarga(e.target.checked)}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Buat keluarga baru
                      </span>
                    </label>
                  )}

                  {isKepalaKeluarga && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        Jemaat ini adalah kepala keluarga. Keluarga baru akan
                        otomatis dibuat.
                      </p>
                    </div>
                  )}

                  {!createKeluarga && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Keluarga *
                      </label>
                      <select
                        {...form.register("idKeluarga", {
                          required: !createKeluarga,
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih keluarga</option>
                        {keluargaList?.data?.items?.map((item) => (
                          <option key={item.id} value={item.id}>
                            Bag. {item.noBagungan} - {item.rayon?.namaRayon}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </StepContent>
            )}

            {/* Step 2: Akun User */}
            {currentStep === 2 && (
              <StepContent>
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      checked={createUserAccount}
                      className="mr-2"
                      type="checkbox"
                      onChange={(e) => setCreateUserAccount(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Buatkan akun user untuk jemaat ini
                    </span>
                  </label>
                </div>

                {createUserAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInput
                      required
                      label="Email"
                      placeholder="user@example.com"
                      type="email"
                      {...form.register("email")}
                      error={form.formState.errors.email?.message}
                    />

                    <SelectInput
                      disabled
                      label="Role"
                      options={[{ value: "JEMAAT", label: "Jemaat" }]}
                      value={form.watch("role")}
                      onChange={(value) => form.setValue("role", value)}
                    />

                    <TextInput
                      required
                      label="Password"
                      placeholder="Masukkan password"
                      type="password"
                      {...form.register("password")}
                      error={form.formState.errors.password?.message}
                    />

                    <TextInput
                      required
                      label="Konfirmasi Password"
                      placeholder="Konfirmasi password"
                      type="password"
                      {...form.register("confirmPassword")}
                      error={form.formState.errors.confirmPassword?.message}
                    />
                  </div>
                )}

                {!createUserAccount && (
                  <p className="text-gray-600 text-sm">
                    Jemaat akan dibuat tanpa akun login. Akun dapat dibuat nanti
                    melalui halaman manajemen jemaat.
                  </p>
                )}
              </StepContent>
            )}

            {/* Step 3: Data Keluarga */}
            {currentStep === 3 && createKeluarga && (
              <StepContent>
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      Jemaat ini adalah kepala keluarga. Silakan lengkapi data
                      keluarga.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectInput
                    required
                    error={form.formState.errors.idStatusKeluarga?.message}
                    label="Status Keluarga"
                    options={
                      statusKeluarga?.data?.items?.map((item) => ({
                        value: item.id,
                        label: item.status,
                      })) || []
                    }
                    placeholder="Pilih status keluarga"
                    value={form.watch("idStatusKeluarga")}
                    onChange={(value) =>
                      form.setValue("idStatusKeluarga", value)
                    }
                  />

                  <SelectInput
                    required
                    error={
                      form.formState.errors.idStatusKepemilikanRumah?.message
                    }
                    label="Status Kepemilikan Rumah"
                    options={
                      statusKepemilikanRumah?.data?.items?.map((item) => ({
                        value: item.id,
                        label: item.status,
                      })) || []
                    }
                    placeholder="Pilih status kepemilikan"
                    value={form.watch("idStatusKepemilikanRumah")}
                    onChange={(value) =>
                      form.setValue("idStatusKepemilikanRumah", value)
                    }
                  />

                  <SelectInput
                    required
                    error={form.formState.errors.idKeadaanRumah?.message}
                    label="Keadaan Rumah"
                    options={
                      keadaanRumah?.data?.items?.map((item) => ({
                        value: item.id,
                        label: item.keadaan,
                      })) || []
                    }
                    placeholder="Pilih keadaan rumah"
                    value={form.watch("idKeadaanRumah")}
                    onChange={(value) => form.setValue("idKeadaanRumah", value)}
                  />

                  <SelectInput
                    required
                    error={form.formState.errors.idRayon?.message}
                    label="Rayon"
                    options={
                      rayon?.data?.items?.map((item) => ({
                        value: item.id,
                        label: item.namaRayon,
                      })) || []
                    }
                    placeholder="Pilih rayon"
                    value={form.watch("idRayon")}
                    onChange={(value) => form.setValue("idRayon", value)}
                  />

                  <TextInput
                    required
                    label="No. Bagungan"
                    placeholder="Masukkan nomor bagungan"
                    type="number"
                    {...form.register("noBagungan")}
                    error={form.formState.errors.noBagungan?.message}
                  />
                </div>

                <div className="mt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700">
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
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      Lengkapi alamat untuk keluarga baru ini.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectInput
                    required
                    error={form.formState.errors.idKelurahan?.message}
                    label="Kelurahan/Desa"
                    options={
                      kelurahan?.data?.items?.map((item) => ({
                        value: item.id,
                        label: item.nama,
                      })) || []
                    }
                    placeholder="Pilih kelurahan/desa"
                    value={form.watch("idKelurahan")}
                    onChange={(value) => form.setValue("idKelurahan", value)}
                  />

                  <TextInput
                    required
                    label="Nama Jalan"
                    placeholder="Masukkan nama jalan"
                    {...form.register("jalan")}
                    error={form.formState.errors.jalan?.message}
                  />

                  <TextInput
                    required
                    label="RT"
                    placeholder="RT"
                    type="number"
                    {...form.register("rt")}
                    error={form.formState.errors.rt?.message}
                  />

                  <TextInput
                    required
                    label="RW"
                    placeholder="RW"
                    type="number"
                    {...form.register("rw")}
                    error={form.formState.errors.rw?.message}
                  />
                </div>
              </StepContent>
            )}

            <StepperNavigation
              canGoNext={canProceedToNext()}
              currentStep={currentStep}
              isLoading={createJemaatMutation.isLoading}
              nextButtonText="Lanjut"
              submitButtonText="Buat Jemaat"
              totalSteps={getMaxStep()}
              onNext={handleNext}
              onPrevious={handlePrev}
              onSubmit={form.handleSubmit(handleSubmit)}
            />
          </form>
        </Card>
      </div>
    </>
  );
}
