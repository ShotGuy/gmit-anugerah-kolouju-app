import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Calculator, Save } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import AutoCompleteInput from "@/components/ui/inputs/AutoCompleteInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import TextInput from "@/components/ui/inputs/TextInput";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageHeader from "@/components/ui/PageHeader";

export default function AdminCreateRealisasiPage() {
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
  const watchedItemKeuanganId = watch("itemKeuanganId");
  const watchedTotalRealisasi = watch("totalRealisasi");

  // Options State
  const [periodeOptions, setPeriodeOptions] = useState([]);
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  // Fetch Periode (Active Only)
  const { data: periodeOptionsRaw, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ["periode-list-active"],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/periode/options", {
        params: { active: true },
      });
      return response.data.data;
    },
  });

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

  // Find selected item details for the Info Card
  const selectedItemDetails = rawItemData?.find(item => item.id === watchedItemKeuanganId);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
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
      // Invalidate all relevant queries
      queryClient.invalidateQueries(["realisasi-summary"]);
      queryClient.invalidateQueries(["realisasi-list"]);
      queryClient.invalidateQueries(["realisasi-item-summary"]);
      queryClient.invalidateQueries(["realisasi-item-list"]);
      router.push("/admin/keuangan/realisasi");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menyimpan realisasi");
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const formatRupiah = (amount) => {
    if (!amount) return "Rp 0";
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  if (isLoadingPeriode) {
    return <LoadingScreen isLoading={true} message="Memuat data..." />;
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        actions={[
          {
            label: "Kembali",
            icon: ArrowLeft,
            variant: "outline",
            onClick: () => router.push("/admin/keuangan/realisasi"),
          },
        ]}
        breadcrumb={[
          { label: "Keuangan", href: "/admin/keuangan" },
          { label: "Realisasi", href: "/admin/keuangan/realisasi" },
          { label: "Tambah" },
        ]}
        description="Catat realisasi pemasukan atau pengeluaran baru"
        title="Tambah Realisasi Keuangan"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Data Realisasi</CardTitle>
            </CardHeader>
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
                      disabled={createMutation.isPending || isSubmitting}
                      type="submit"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createMutation.isPending ? "Menyimpan..." : "Simpan Transaksi"}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>

        {/* Side Info Panel */}
        <div className="space-y-6">
          {/* Selected Item Detail */}
          {selectedItemDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="h-5 w-5" />
                  Info Target
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block">Kode & Nama:</span>
                  <p className="font-medium">{selectedItemDetails.kode} - {selectedItemDetails.nama}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 block">Frekuensi:</span>
                    <p>{selectedItemDetails.targetFrekuensi || 0} {selectedItemDetails.satuanFrekuensi}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Nominal/Satuan:</span>
                    <p>{formatRupiah(selectedItemDetails.nominalSatuan)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-dashed">
                  <span className="text-gray-500 block">Total Target:</span>
                  <p className="text-lg font-bold text-blue-600">
                    {formatRupiah(selectedItemDetails.totalTarget)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Calculation */}
          {watchedTotalRealisasi && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatRupiah(watchedTotalRealisasi)}
                  </span>
                </div>
                {selectedItemDetails && (
                  <div className="text-xs text-gray-500 pt-2">
                    Status: {parseFloat(watchedTotalRealisasi) >= parseFloat(selectedItemDetails.totalTarget || 0)
                      ? "Melebihi/Mencapai Target"
                      : "Di bawah Target"}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
