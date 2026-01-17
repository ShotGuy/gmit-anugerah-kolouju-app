import { useMutation, useQuery } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";
import { Calendar, Clock } from "lucide-react";
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
    { id: 1, title: "Informasi Dasar", description: "Jenis ibadah, kategori, dan judul" },
    { id: 2, title: "Jadwal & Lokasi", description: "Tanggal, waktu, dan tempat ibadah" },
    { id: 3, title: "Konten & Detail", description: "Tema, firman, dan keterangan" },
    { id: 4, title: "Target & Rencana", description: "Target peserta dan informasi tambahan" },
];

export default function CreateJadwalIbadahEmployee() {
    const router = useRouter();
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
        },
    });

    const { data: optionsData, isLoading: isOptionsLoading } = useQuery({
        queryKey: ["jadwal-ibadah-options"],
        queryFn: () => jadwalIbadahService.getOptions(),
    });

    const createMutation = useMutation({
        mutationFn: jadwalIbadahService.create,
        onSuccess: () => {
            showToast({ title: "Berhasil", description: "Jadwal ibadah berhasil ditambahkan", color: "success" });
            router.push("/employee/jadwal-ibadah");
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
            jumlahLaki: null,
            jumlahPerempuan: null,
            targetPeserta: data.targetPeserta ? parseInt(data.targetPeserta) : null,
        };
        createMutation.mutate(submitData);
    });

    const options = optionsData?.data || {};

    if (isOptionsLoading) return <div className="p-8 text-center">Loading options...</div>;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <StepContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AutoCompleteInput required label="Jenis Ibadah *" name="idJenisIbadah" options={options.jenisIbadah || []} placeholder="Pilih jenis ibadah..." />
                            <AutoCompleteInput required label="Kategori Jadwal *" name="idKategori" options={options.kategoriJadwal || []} placeholder="Pilih kategori..." />
                            <AutoCompleteInput required label="Pemimpin Ibadah *" name="idPemimpin" options={options.pemimpin || []} placeholder="Pilih pemimpin..." />
                            <TextInput label="Judul Ibadah *" name="judul" placeholder="Masukkan judul ibadah" />
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
                                <p className="text-sm text-blue-700">Data jumlah peserta aktual diisi setelah ibadah selesai.</p>
                            </div>
                        </div>
                    </StepContent>
                );
            default: return null;
        }
    };

    return (
        <>
            <PageTitle title="Tambah Jadwal Ibadah" />
            <div className="space-y-6 p-4">
                <PageHeader subtitle="Buat jadwal ibadah baru" title="Tambah Jadwal Ibadah" onBack={() => router.push("/employee/jadwal-ibadah")} />
                <Card className="p-6">
                    <FormProvider {...form}>
                        <form onSubmit={handleSubmit}>
                            <Stepper currentStep={currentStep} steps={steps} onStepClick={setCurrentStep} />
                            {renderStepContent()}
                            <StepperNavigation canGoNext={true} currentStep={currentStep} isLoading={createMutation.isLoading} totalSteps={steps.length} onNext={handleNext} onPrevious={handlePrevious} onSubmit={handleSubmit} />
                        </form>
                    </FormProvider>
                </Card>
            </div>
        </>
    );
}
