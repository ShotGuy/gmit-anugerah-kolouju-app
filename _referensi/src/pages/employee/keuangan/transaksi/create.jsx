import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import TextInput from "@/components/ui/inputs/TextInput";
import PageHeader from "@/components/ui/PageHeader";

export default function EmployeeCreateRealisasiPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm({
        defaultValues: {
            periodeId: "",
            kategoriId: "",
            itemKeuanganId: "",
            tanggalRealisasi: new Date().toISOString().split("T")[0],
            totalRealisasi: "",
            keterangan: "",
        },
    });

    const {
        watch,
        setValue,
        formState: { isSubmitting },
        handleSubmit,
    } = form;

    const watchedPeriodeId = watch("periodeId");
    const watchedKategoriId = watch("kategoriId");

    // Options State
    const [periodeOptions, setPeriodeOptions] = useState([]);
    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);

    const { data: periodeOptionsRaw } = useQuery({
        queryKey: ["periode-list-active"],
        queryFn: async () => {
            const response = await axios.get("/api/keuangan/periode/options", {
                params: { active: true },
            });
            return response.data.data;
        },
    });

    // Handle side effects and state updates for Periode

    useEffect(() => {
        if (periodeOptionsRaw && periodeOptionsRaw.length > 0) {
            setPeriodeOptions(periodeOptionsRaw);
            // Auto select first active period if available and none selected
            if (!form.getValues("periodeId")) {
                setValue("periodeId", periodeOptionsRaw[0].value);
            }
        }
    }, [periodeOptionsRaw, setValue, form]);

    // Fetch Kategori
    const { data: kategoriOptionsRaw } = useQuery({
        queryKey: ["kategori-list"],
        queryFn: async () => {
            const response = await axios.get("/api/keuangan/kategori/options");
            // Options endpoint returns array directly in data.data
            return response.data.data;
        },
    });

    useEffect(() => {
        if (kategoriOptionsRaw) {
            setKategoriOptions(kategoriOptionsRaw);
        }
    }, [kategoriOptionsRaw]);

    // Fetch Items based on Periode & Kategori
    const { data: rawItemData, isLoading: isLoadingItems } = useQuery({
        queryKey: ["item-keuangan-options", watchedPeriodeId, watchedKategoriId],
        queryFn: async () => {
            const params = {};
            if (watchedPeriodeId) params.periodeId = watchedPeriodeId;
            if (watchedKategoriId) params.kategoriId = watchedKategoriId;

            const response = await axios.get("/api/keuangan/item", { params });
            return response.data.data.items;
        },
        enabled: !!watchedPeriodeId, // Only fetch if periode is selected
    });

    useEffect(() => {
        if (rawItemData) {
            // Filter only leaf nodes (items that don't have children)
            const leafItems = rawItemData.filter(item => item._count?.children === 0);

            setItemOptions(
                leafItems.map((item) => ({
                    value: item.id,
                    label: `${item.kode} - ${item.nama}`,
                }))
            );
        }
    }, [rawItemData]);

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (data) => {
            // Convert string amount to number
            // Convert string amount to number and remove UI-only fields
            const { kategoriId, ...rest } = data; // Exclude kategoriId from payload
            const payload = {
                ...rest,
                totalRealisasi: parseFloat(data.totalRealisasi.replace(/[^0-9.-]+/g, "")),
            };

            const response = await axios.post("/api/keuangan/realisasi", payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Realisasi berhasil disimpan");
            queryClient.invalidateQueries(["realisasi-summary"]);
            queryClient.invalidateQueries(["realisasi-list"]);
            router.push("/employee/keuangan/transaksi");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Gagal menyimpan realisasi");
        },
    });

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            <PageHeader
                actions={[
                    {
                        label: "Kembali",
                        icon: ArrowLeft,
                        variant: "outline",
                        onClick: () => router.push("/employee/keuangan/transaksi"),
                    },
                ]}
                breadcrumb={[
                    { label: "Dashboard", href: "/employee/dashboard" },
                    { label: "Transaksi", href: "/employee/keuangan/transaksi" },
                    { label: "Tambah Transaksi" },
                ]}
                description="Catat realisasi pemasukan atau pengeluaran baru"
                title="Tambah Transaksi"
            />

            <Card>
                <CardContent className="p-6">
                    <FormProvider {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Periode Selection */}
                                <AutoCompleteInput
                                    label="Periode Anggaran"
                                    name="periodeId"
                                    options={periodeOptions}
                                    placeholder="Pilih periode"
                                    required
                                />

                                {/* Kategori Selection (Optional Filter) */}
                                <AutoCompleteInput
                                    label="Filter Kategori (Opsional)"
                                    name="kategoriId"
                                    options={kategoriOptions}
                                    placeholder="Semua Kategori"
                                />
                            </div>

                            {/* Item Selection */}
                            <AutoCompleteInput
                                disabled={!watchedPeriodeId || isLoadingItems}
                                label="Item Keuangan (Pos Anggaran)"
                                name="itemKeuanganId"
                                options={itemOptions}
                                placeholder={
                                    !watchedPeriodeId
                                        ? "Pilih periode terlebih dahulu"
                                        : isLoadingItems
                                            ? "Memuat item..."
                                            : "Cari item keuangan (Kode atau Nama)"
                                }
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tanggal */}
                                <DatePicker
                                    label="Tanggal Transaksi"
                                    name="tanggalRealisasi"
                                    placeholder="Pilih tanggal"
                                    required
                                />

                                {/* Jumlah Realisasi */}
                                <TextInput
                                    label="Jumlah (Rp)"
                                    name="totalRealisasi"
                                    placeholder="Contoh: 1500000"
                                    required
                                    type="number"
                                    min="0"
                                />
                            </div>

                            {/* Keterangan */}
                            <TextAreaInput
                                label="Keterangan / Uraian"
                                name="keterangan"
                                placeholder="Masukkan keterangan detail transaksi..."
                                rows={4}
                            />

                            {/* Actions */}
                            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button
                                    disabled={createMutation.isLoading || isSubmitting}
                                    type="submit"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {createMutation.isLoading ? "Menyimpan..." : "Simpan Transaksi"}
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    );
}
