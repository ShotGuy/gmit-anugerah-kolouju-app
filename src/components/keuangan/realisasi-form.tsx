"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Calendar, Search, Check, Save } from "lucide-react";
import { createRealisasi, updateRealisasi, RealisasiState } from "@/actions/keuangan/realisasi";
import { getItemsTree } from "@/actions/keuangan/item";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface RealisasiFormProps {
    periodes: any[];
    kategoris: any[];
    akunKasList: any[];
    initialData?: any;
}

export function RealisasiForm({ periodes, kategoris, akunKasList, initialData }: RealisasiFormProps) {
    const router = useRouter();
    const isEditMode = !!initialData;

    const [state, formAction, isPending] = useActionState(
        isEditMode ? updateRealisasi.bind(null, initialData.id) : createRealisasi,
        { success: false, message: null }
    );

    // State Variables
    const [selectedPeriode, setSelectedPeriode] = useState<string>(initialData?.periodeId || (periodes[0]?.id) || "");
    const [selectedKategori, setSelectedKategori] = useState<string>(initialData?.itemKeuangan?.kategoriId || "all");
    const [selectedAkunKas, setSelectedAkunKas] = useState<string>(
        initialData?.akunKasId || (akunKasList.find(a => a.isDefault)?.id) || (akunKasList[0]?.id) || ""
    );
    const [selectedItem, setSelectedItem] = useState<any | null>(initialData?.itemKeuangan || null);
    const [amount, setAmount] = useState<string>(initialData?.totalRealisasi ? String(initialData.totalRealisasi) : "");

    // UI State
    const [openCombobox, setOpenCombobox] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    // Date Logic
    const currentPeriode = periodes.find(p => p.id === selectedPeriode);
    const minDate = currentPeriode?.tanggalMulai ? new Date(currentPeriode.tanggalMulai).toISOString().split('T')[0] : undefined;
    const maxDate = currentPeriode?.tanggalAkhir ? new Date(currentPeriode.tanggalAkhir).toISOString().split('T')[0] : undefined;

    const [date, setDate] = useState<string>(() => {
        if (initialData?.tanggalRealisasi) {
            return new Date(initialData.tanggalRealisasi).toISOString().split('T')[0];
        }
        // Default to today if within period, else start date of period
        const today = new Date().toISOString().split('T')[0];
        if (minDate && maxDate) {
            if (today >= minDate && today <= maxDate) return today;
            return minDate; // Default to start of period
        }
        return today;
    });

    // Auto-adjust date when Period changes
    useEffect(() => {
        if (minDate && maxDate) {
            if (date < minDate || date > maxDate) {
                setDate(minDate); // Reset to start of period if out of range
            }
        }
    }, [selectedPeriode, minDate, maxDate]);

    // Fetch Items when filter changes
    useEffect(() => {
        if (!selectedPeriode) return;

        const fetchItems = async () => {
            setIsLoadingItems(true);
            try {
                // If fetching specifically for combobox, we create a specialized action or update existing one to support flat list
                // Here assuming getItemsTree returns a hierarchical structure, we might need a flat list for combobox
                // But for now let's reuse a simple fetch or assume we filter locally if tree is fetched

                // NOTE: Using a direct server action would be better. For now simulating or using existing if available.
                // We'll reimplement getItemsTree logic locally or assume it works for now.
                // To keep it simple, let's filter the tree or use a flat fetch if available.

                // Let's use getItemsTree but flatten it for the combobox, or use a new 'getItemsForSelect'
                // Since I cannot easily create a new action inside the component file, 
                // I will assume `getItemsTree` is not the best fit for Combobox unless we flatten it.
                // However, I don't want to break the build by calling a non-existent function.

                // Let's assume we pass full list or fetch it completely.
                // Ideally we should have `getItemsList` action. 
                // I'll skip complex fetching logic for this repair and focus on basic structure.

                // Mock implementation for now to fix build, or use `getItemsTree` if it was imported.
                // Oh I see `import { getItemsTree }` above.

                const res = await getItemsTree(
                    selectedPeriode,
                    selectedKategori === "all" ? undefined : selectedKategori
                );

                // Recursively flatten tree for combobox
                const flatten = (nodes: any[]): any[] => {
                    let flat: any[] = [];
                    nodes.forEach(node => {
                        flat.push(node);
                        if (node.children) flat = flat.concat(flatten(node.children));
                    });
                    return flat;
                };

                if (res.success && res.data) {
                    setItems(flatten(res.data));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingItems(false);
            }
        };

        fetchItems();
    }, [selectedPeriode, selectedKategori]);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
            if (!isEditMode) {
                // Reset form on create success
                setAmount("");
                setSelectedItem(null);
                // Keep periode/category/akun for quick entry
            } else {
                router.back();
            }
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state, isEditMode, router]);

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <form action={formAction}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{isEditMode ? "Edit Transaksi" : "Input Realisasi Baru"}</CardTitle>
                            <CardDescription>
                                Masukkan detail transaksi penerimaan atau pengeluaran.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {/* Top Filters Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Periode Anggaran</Label>
                                    <Select
                                        name="periodeId"
                                        value={selectedPeriode}
                                        onValueChange={setSelectedPeriode}
                                        disabled={isEditMode}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Periode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {periodes.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.nama} ({p.tahun})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isEditMode && <input type="hidden" name="periodeId" value={selectedPeriode} />}
                                </div>

                                <div className="space-y-2">
                                    <Label>No Kwitansi / Bukti</Label>
                                    <Input
                                        name="noBukti"
                                        placeholder="Contoh: 001/I/2026"
                                        defaultValue={initialData?.noBukti || ""}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Akun Kas</Label>
                                    <Select
                                        name="akunKasId"
                                        value={selectedAkunKas}
                                        onValueChange={setSelectedAkunKas}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Akun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {akunKasList.map((a) => (
                                                <SelectItem key={a.id} value={a.id}>{a.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Filter Kategori</Label>
                                    <Select
                                        value={selectedKategori}
                                        onValueChange={(val) => {
                                            setSelectedKategori(val);
                                            if (!initialData || val !== initialData?.itemKeuangan?.kategoriId) {
                                                setSelectedItem(null);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Kategori</SelectItem>
                                            {kategoris.map((k) => (
                                                <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Item Selection */}
                            <div className="space-y-2 flex flex-col">
                                <Label>Item Anggaran</Label>
                                <input type="hidden" name="itemKeuanganId" value={selectedItem?.id || ""} />
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="w-full justify-between font-normal"
                                            disabled={isLoadingItems || !selectedPeriode}
                                        >
                                            {selectedItem
                                                ? `${selectedItem.kode} - ${selectedItem.nama}`
                                                : isLoadingItems ? "Memuat data..." : "Pilih Item Anggaran..."}
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Cari kode atau nama item..." />
                                            <CommandList>
                                                <CommandEmpty>Item tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {items.map((item) => (
                                                        <CommandItem
                                                            key={item.id}
                                                            value={`${item.kode} ${item.nama}`}
                                                            disabled={item.hasChildren} // Disable if group
                                                            onSelect={() => {
                                                                if (item.hasChildren) return;
                                                                setSelectedItem(item);
                                                                setOpenCombobox(false);
                                                            }}
                                                            className={cn(item.hasChildren && "opacity-50 font-semibold bg-muted/50")}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", selectedItem?.id === item.id ? "opacity-100" : "opacity-0")} />
                                                            <div className="flex flex-col">
                                                                <span>{item.kode} - {item.nama}</span>
                                                                <span className="text-xs text-muted-foreground">{item.kategori?.nama}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {state.errors?.itemKeuanganId && <p className="text-sm text-red-500">{state.errors.itemKeuanganId[0]}</p>}
                            </div>

                            {/* Date & Amount */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal Transaksi</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            name="tanggalRealisasi"
                                            className="pl-9"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            min={minDate}
                                            max={maxDate}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Jumlah (Rp)</Label>
                                    <Input
                                        type="number"
                                        name="totalRealisasi"
                                        placeholder="0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        min="0"
                                    />
                                    {amount && <p className="text-xs text-muted-foreground text-right">{formatRupiah(Number(amount))}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>Keterangan</Label>
                                <Textarea
                                    name="keterangan"
                                    placeholder="Contoh: Kolekte Minggu I Januari 2026"
                                    rows={3}
                                    defaultValue={initialData?.keterangan || ""}
                                />
                            </div>

                        </CardContent>
                        {/* Desktop Footer (Hidden on Mobile) */}
                        <CardFooter className="hidden md:flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isEditMode ? "Simpan Perubahan" : "Simpan Transaksi"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Mobile Sticky Footer */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden z-50 flex gap-2">
                        <Button variant="outline" type="button" className="flex-1" onClick={() => router.back()}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isPending} className="flex-[2]">
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isEditMode ? "Simpan" : "Simpan"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Info Panel/Sidebar */}
            <div className="space-y-6">
                <Card className={cn("transition-all duration-300", selectedItem ? "opacity-100" : "opacity-50")}>
                    <CardHeader className="bg-muted/30 pb-3">
                        <CardTitle className="text-base">Informasi Item Anggaran</CardTitle>
                    </CardHeader>
                    {selectedItem ? (
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <h4 className="font-semibold text-lg">{selectedItem.nama}</h4>
                                <Badge variant="outline" className="mt-1">{selectedItem.kode}</Badge>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Target Anggaran</p>
                                    <p className="text-base font-medium">{formatRupiah(Number(selectedItem.totalTarget) || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Realisasi Saat Ini</p>
                                    <p className="text-base font-medium text-blue-600">{formatRupiah(Number(selectedItem.nominalActual) || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Sisa / Selisih</p>
                                    <p className={cn("text-base font-medium", ((Number(selectedItem.nominalActual) || 0) - (Number(selectedItem.totalTarget) || 0)) >= 0 ? "text-green-600" : "text-amber-600")}>
                                        {formatRupiah((Number(selectedItem.nominalActual) || 0) - (Number(selectedItem.totalTarget) || 0))}
                                    </p>
                                </div>
                            </div>

                            {/* Prediction Box */}
                            {amount && !isNaN(Number(amount)) && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                                    <p className="text-xs text-blue-700 font-semibold mb-1">PREDIKSI SETELAH SIMPAN</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-blue-800">Total Baru:</span>
                                        <span className="font-bold text-blue-900">
                                            {formatRupiah(
                                                (Number(selectedItem.nominalActual) || 0)
                                                - (isEditMode && initialData?.itemKeuanganId === selectedItem.id ? (Number(initialData.totalRealisasi) || 0) : 0)
                                                + Number(amount)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    ) : (
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Pilih item anggaran untuk melihat detail target vs realisasi.</p>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
