import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Calculator, Save } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageHeader from "@/components/ui/PageHeader";

export default function EmployeeEditRealisasiPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = router.query;
    const [formData, setFormData] = useState({
        itemKeuanganId: "",
        periodeId: "",
        tanggalRealisasi: "",
        totalRealisasi: "",
        keterangan: "",
    });

    // Query untuk get realisasi data
    const { data: realisasiData, isLoading: realisasiLoading } = useQuery({
        queryKey: ["realisasi-detail", id],
        queryFn: async () => {
            const response = await axios.get(`/api/keuangan/realisasi/${id}`);
            return response.data.data;
        },
        enabled: !!id,
    });

    // Query untuk get item keuangan (level 4 only)
    const { data: itemList, isLoading: itemLoading } = useQuery({
        queryKey: ["item-level-4"],
        queryFn: async () => {
            const response = await axios.get("/api/keuangan/item", {
                params: { level: 4, limit: 200 },
            });
            return response.data.data.items;
        },
    });

    // Query untuk get periode list
    const { data: periodeList } = useQuery({
        queryKey: ["periode-list"],
        queryFn: async () => {
            const response = await axios.get("/api/keuangan/periode", {
                params: { limit: 50, isActive: true },
            });
            return response.data.data.items;
        },
    });

    // Set form data when realisasi data is loaded
    useEffect(() => {
        if (realisasiData) {
            setFormData({
                itemKeuanganId: realisasiData.itemKeuanganId || "",
                periodeId: realisasiData.periodeId || "",
                tanggalRealisasi: realisasiData.tanggalRealisasi
                    ? new Date(realisasiData.tanggalRealisasi).toISOString().split('T')[0]
                    : "",
                totalRealisasi: realisasiData.totalRealisasi || "",
                keterangan: realisasiData.keterangan || "",
            });
        }
    }, [realisasiData]);

    // Get selected item details
    const selectedItem = itemList?.find(
        (item) => item.id === formData.itemKeuanganId
    );

    // Mutation untuk update realisasi
    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const response = await axios.put(`/api/keuangan/realisasi/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            // Refetch all realisasi-related queries
            queryClient.invalidateQueries(["realisasi-summary"]);
            queryClient.invalidateQueries(["realisasi-list"]);
            queryClient.invalidateQueries(["realisasi-item-summary"]);
            queryClient.invalidateQueries(["realisasi-item-list"]);
            queryClient.invalidateQueries(["realisasi-detail", id]);
            toast.success("Realisasi berhasil diperbarui");
            router.push("/employee/keuangan/transaksi");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Gagal memperbarui realisasi");
        },
    });

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Auto set periode when item is selected
        if (name === "itemKeuanganId" && value) {
            const item = itemList?.find(item => item.id === value);
            if (item) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    periodeId: item.periodeId,
                }));
            }
        }
    };

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (
            !formData.itemKeuanganId ||
            !formData.periodeId ||
            !formData.tanggalRealisasi ||
            !formData.totalRealisasi
        ) {
            toast.error("Mohon lengkapi semua field yang wajib diisi");
            return;
        }

        updateMutation.mutate(formData);
    };

    // Format rupiah for display
    const formatRupiah = (amount) => {
        if (!amount || amount === 0) return "Rp 0";
        return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
    };

    if (realisasiLoading || itemLoading) {
        return <LoadingScreen isLoading={true} message="Memuat data realisasi..." />;
    }

    if (!realisasiData) {
        return (
            <div className="space-y-6 p-4">
                <PageHeader
                    breadcrumb={[
                        { label: "Dashboard", href: "/employee/dashboard" },
                        { label: "Transaksi", href: "/employee/keuangan/transaksi" },
                        { label: "Edit" },
                    ]}
                    title="Data Tidak Ditemukan"
                />
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-gray-500">Realisasi tidak ditemukan</p>
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/employee/keuangan/transaksi")}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <PageHeader
                breadcrumb={[
                    { label: "Dashboard", href: "/employee/dashboard" },
                    { label: "Transaksi", href: "/employee/keuangan/transaksi" },
                    { label: "Edit Transaksi" },
                ]}
                description="Edit data realisasi untuk item keuangan"
                title="Edit Realisasi Keuangan"
            />

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                {/* Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Realisasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* Item Keuangan */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Item Keuangan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        name="itemKeuanganId"
                                        value={formData.itemKeuanganId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Pilih Item Keuangan</option>
                                        {Array.isArray(itemList) &&
                                            itemList.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.kode} - {item.nama} ({item.kategori.nama})
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Periode */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Periode <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        name="periodeId"
                                        value={formData.periodeId}
                                        onChange={handleInputChange}
                                        disabled={formData.itemKeuanganId}
                                    >
                                        <option value="">Pilih Periode</option>
                                        {Array.isArray(periodeList) &&
                                            periodeList.map((periode) => (
                                                <option key={periode.id} value={periode.id}>
                                                    {periode.nama} ({periode.tahun})
                                                </option>
                                            ))}
                                    </select>
                                    {formData.itemKeuanganId && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Periode otomatis dipilih berdasarkan item keuangan
                                        </p>
                                    )}
                                </div>

                                {/* Tanggal Realisasi */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Tanggal Realisasi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        name="tanggalRealisasi"
                                        type="date"
                                        value={formData.tanggalRealisasi}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Total Realisasi */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Total Realisasi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        name="totalRealisasi"
                                        placeholder="Contoh: 5500000"
                                        step="0.01"
                                        type="number"
                                        value={formData.totalRealisasi}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Keterangan */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Keterangan
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        name="keterangan"
                                        placeholder="Catatan tambahan..."
                                        rows="3"
                                        value={formData.keterangan}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-6">
                                    <Button
                                        className="flex items-center gap-2"
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push("/employee/keuangan/transaksi")}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Kembali
                                    </Button>

                                    <Button
                                        className="flex items-center gap-2"
                                        disabled={updateMutation.isPending}
                                        type="submit"
                                    >
                                        <Save className="h-4 w-4" />
                                        {updateMutation.isPending ? "Menyimpan..." : "Perbarui"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Side Info */}
                <div className="space-y-6">
                    {/* Selected Item Info */}
                    {selectedItem && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Target Item
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600">Kode:</span>
                                    <p className="font-mono font-medium">{selectedItem.kode}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Nama:</span>
                                    <p className="font-medium">{selectedItem.nama}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Kategori:</span>
                                    <p>{selectedItem.kategori.nama}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Nominal Target:</span>
                                    <p>{formatRupiah(selectedItem.nominalSatuan)}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Total Target:</span>
                                    <p className="text-lg font-bold text-blue-600">
                                        {formatRupiah(selectedItem.totalTarget)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Calculation Preview */}
                    {formData.totalRealisasi && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview Realisasi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Tanggal:
                                    </span>
                                    <span>
                                        {formData.tanggalRealisasi ?
                                            new Date(formData.tanggalRealisasi).toLocaleDateString('id-ID')
                                            : '-'}
                                    </span>
                                </div>
                                <hr />
                                <div className="flex justify-between font-bold">
                                    <span>Total Realisasi:</span>
                                    <span className="text-green-600">
                                        {formatRupiah(formData.totalRealisasi)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
