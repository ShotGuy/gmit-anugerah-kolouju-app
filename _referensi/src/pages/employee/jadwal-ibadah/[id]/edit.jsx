import { useMutation, useQuery } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";
import { Calendar, Clock } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import PageTitle from "@/components/ui/PageTitle";
import Stepper, { StepContent, StepperNavigation } from "@/components/ui/Stepper";
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
    { id: 1, title: "Informasi Dasar", description: "Jenis ibadah, kategori, dan judul" },
    { id: 2, title: "Jadwal & Lokasi", description: "Tanggal, waktu, dan tempat ibadah" },
    { id: 3, title: "Konten & Detail", description: "Tema, firman, dan keterangan" },
    { id: 4, title: "Target & Peserta", description: "Target peserta dan data kehadiran aktual" },
];

export default function EditJadwalIbadahEmployee() {
    const router = useRouter();
    const { id } = router.query;
    const [currentStep, setCurrentStep] = useState(1);

    const form = useForm({
        mode: "onChange",
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

    const { data: jadwalData, isLoading: isLoadingJadwal } = useQuery({
        queryKey: ["jadwal-ibadah", id],
        queryFn: () => jadwalIbadahService.getById(id),
        enabled: !!id,
    });

    const { data: optionsData, isLoading: isOptionsLoading } = useQuery({
        queryKey: ["jadwal-ibadah-options"],
        queryFn: () => jadwalIbadahService.getOptions(),
    });

    useEffect(() => {
        if (jadwalData?.data) {
            const jadwal = jadwalData.data;
            const formattedDate = jadwal.tanggal ? new Date(jadwal.tanggal).toISOString().split("T")[0] : "";

            const formatTimeForInput = (timeString) => {
                if (!timeString) return "";
                try { return new Date(timeString).toTimeString().slice(0, 5); }
                catch { try { return timeString.slice(0, 5); } catch { return ""; } }
            };

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
        }
    }, [jadwalData, form]);

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => jadwalIbadahService.update(id, data),
        onSuccess: () => {
            showToast({ title: "Berhasil", description: "Jadwal ibadah berhasil diperbarui", color: "success" });
            router.push(`/employee/jadwal-ibadah/${id}`);
        },
        onError: (error) => {
            showToast({ title: "Gagal", description: error.message, color: "danger" });
        },
    });

    const validateCurrentStep = async () => {
        const values = form.getValues();
        switch (currentStep) {
            case 1:
                if (!values.idJenisIbadah || !values.idKategori || !values.idPemimpin || !values.judul?.trim()) {
                    showToast({ title: "Validasi Gagal", description: "Lengkapi field wajib langkah 1", color: "danger" });
                    return false;
                }
                break;
            case 2:
                if (!values.tanggal) {
                    showToast({ title: "Validasi Gagal", description: "Tanggal wajib diisi", color: "danger" });
                    return false;
                }
                break;
        }
        return true;
    };

    const handleNext = async () => {
        if (await validateCurrentStep()) setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => setCurrentStep(currentStep - 1);

    const handleSubmit = form.handleSubmit((data) => {
        const submitData = {
            ...data,
            targetPeserta: data.targetPeserta ? parseInt(data.targetPeserta) : null,
            jumlahLaki: data.jumlahLaki ? parseInt(data.jumlahLaki) : null,
            jumlahPerempuan: data.jumlahPerempuan ? parseInt(data.jumlahPerempuan) : null,
        };
        updateMutation.mutate({ id, data: submitData });
    });

    const options = optionsData?.data || {};
    const jadwal = jadwalData?.data;

    if (isLoadingJadwal || isOptionsLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!jadwal) return <div className="p-8 text-center text-red-500">Jadwal tidak ditemukan</div>;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <StepContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AutoCompleteInput required label="Jenis Ibadah *" name="idJenisIbadah" options={options.jenisIbadah || []} />
                            <AutoCompleteInput required label="Kategori Jadwal *" name="idKategori" options={options.kategoriJadwal || []} />
                            <AutoCompleteInput required label="Pemimpin Ibadah *" name="idPemimpin" options={options.pemimpin || []} />
                            <TextInput label="Judul Ibadah *" name="judul" />
                        </div>
                    </StepContent>
                );
            case 2:
                return (
                    <StepContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DatePicker required label="Tanggal Ibadah *" leftIcon={<Calendar className="h-4 w-4" />} name="tanggal" />
                                <TimeInput label="Waktu Mulai" leftIcon={<Clock className="h-4 w-4" />} name="waktuMulai" />
                                <TimeInput label="Waktu Selesai" leftIcon={<Clock className="h-4 w-4" />} name="waktuSelesai" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AutoCompleteInput label="Keluarga" name="idKeluarga" options={options.keluarga || []} />
                                <AutoCompleteInput label="Rayon" name="idRayon" options={options.rayon || []} />
                            </div>
                            <LocationMapPicker />
                        </div>
                    </StepContent>
                );
            case 3:
                return (
                    <StepContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextInput label="Tema Ibadah" name="tema" />
                            <TextInput label="Firman (Ayat)" name="firman" />
                            <TextAreaInput className="md:col-span-2" label="Keterangan" name="keterangan" rows={6} />
                        </div>
                    </StepContent>
                );
            case 4:
                return (
                    <StepContent>
                        <div className="space-y-6">
                            <NumberInput label="Target Peserta" min={0} name="targetPeserta" />
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-medium text-blue-900 mb-2">📊 Jumlah Peserta Aktual</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <NumberInput label="Jumlah Laki-laki" min={0} name="jumlahLaki" />
                                    <NumberInput label="Jumlah Perempuan" min={0} name="jumlahPerempuan" />
                                </div>
                                <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                                    <span className="font-medium text-blue-900">Total Peserta:</span>
                                    <span className="text-xl font-bold text-blue-600 ml-2">
                                        {(parseInt(form.watch("jumlahLaki")) || 0) + (parseInt(form.watch("jumlahPerempuan")) || 0)} orang
                                    </span>
                                </div>
                            </div>
                        </div>
                    </StepContent>
                );
            default: return null;
        }
    };

    return (
        <>
            <PageTitle title={`Edit: ${jadwal?.judul}`} />
            <div className="space-y-6 p-4">
                <PageHeader subtitle="Perbarui informasi jadwal" title="Edit Jadwal Ibadah" onBack={() => router.push("/employee/jadwal-ibadah")} />
                <Card className="p-6">
                    <FormProvider {...form}>
                        <form onSubmit={handleSubmit}>
                            <Stepper currentStep={currentStep} steps={steps} onStepClick={setCurrentStep} />
                            {renderStepContent()}
                            <StepperNavigation canGoNext={true} currentStep={currentStep} isLoading={updateMutation.isLoading} totalSteps={steps.length} onNext={handleNext} onPrevious={handlePrevious} onSubmit={handleSubmit} nextButtonText="Lanjut" submitButtonText="Perbarui Jadwal" />
                        </form>
                    </FormProvider>
                </Card>
            </div>
        </>
    );
}
