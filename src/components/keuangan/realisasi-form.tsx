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
    initialData?: any; // For Edit Mode
}

export function RealisasiForm({ periodes, kategoris, initialData }: RealisasiFormProps) {
    const router = useRouter();
    const isEditMode = !!initialData;

    // Setup Action
    // If Edit, bind ID to update action. If Create, use create action.
    const action = isEditMode && initialData?.id
        ? updateRealisasi.bind(null, initialData.id)
        : createRealisasi;

    const [state, formAction, isPending] = useActionState(action, {} as RealisasiState);

    // Form States (Pre-fill if Edit)
    const [selectedPeriode, setSelectedPeriode] = useState<string>(
        initialData?.periodeId || periodes[0]?.id || ""
    );
    const [selectedKategori, setSelectedKategori] = useState<string>(
        // If editing, try to deduce category from item? Or just use "all"/initialData categorization if available
        initialData?.itemKeuangan?.kategoriId || "all"
    );
    const [selectedItem, setSelectedItem] = useState<any>(initialData?.itemKeuangan || null);
    const [amount, setAmount] = useState<string>(
        initialData?.totalRealisasi ? String(Number(initialData.totalRealisasi)) : ""
    );

    // Items Data
    const [items, setItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);

    // Fetch items when filters change
    useEffect(() => {
        const fetchItems = async () => {
            if (!selectedPeriode) return;
            setIsLoadingItems(true);
            try {
                const res = await getItemsTree(selectedPeriode, selectedKategori);
                if (res.success && res.data) {
                    // Only show leaf nodes (items without children)
                    setItems(res.data.filter((item: any) => !item.hasChildren));
                }
            } catch (error) {
                console.error("Failed to fetch items", error);
            } finally {
                setIsLoadingItems(false);
            }
        };
        fetchItems();
    }, [selectedPeriode, selectedKategori]);

    // Handle Server Action Response
    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
            router.push("/keuangan/realisasi");
            router.refresh(); // Refresh to show updated data
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state, router]);

    // Form Submit Handler
    const handleSubmit = (formData: FormData) => {
        if (!selectedItem) {
            toast.error("Silakan pilih Item Anggaran terlebih dahulu");
            return;
        }
        formAction(formData);
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form */}
            <div className="lg:col-span-2">
                <form action={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{isEditMode ? "Edit Transaksi Realisasi" : "Form Input Realisasi"}</CardTitle>
                            <CardDescription>
                                {isEditMode ? "Ubah data realisasi keuangan." : "Masukkan data realisasi keuangan (Penerimaan/Pengeluaran)."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Periode Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>
                                <div className="space-y-2">
                                    <Label>Filter Kategori (Opsional)</Label>
                                    <Select
                                        value={selectedKategori}
                                        onValueChange={(val) => {
                                            setSelectedKategori(val);
                                            // Only reset item if not initial load or explicit change
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
                                                <SelectItem key={k.id} value={k.id}>
                                                    {k.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Item Selection (Combobox) */}
                            <div className="space-y-2 flex flex-col">
                                <Label>Item Anggaran</Label>
                                <input type="hidden" name="itemKeuanganId" value={selectedItem?.id || ""} />
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="w-full justify-between"
                                            disabled={isLoadingItems || !selectedPeriode}
                                        >
                                            {selectedItem
                                                ? `${selectedItem.kode} - ${selectedItem.nama}`
                                                : isLoadingItems ? "Memuat data..." : "Pilih Item Anggaran..."}
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Cari kode atau nama item..." />
                                            <CommandList>
                                                <CommandEmpty>Item tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {items.map((item) => (
                                                        <CommandItem
                                                            key={item.id}
                                                            value={`${item.kode} ${item.nama}`}
                                                            disabled={item.hasChildren}
                                                            onSelect={() => {
                                                                if (item.hasChildren) return;
                                                                setSelectedItem(item);
                                                                setOpenCombobox(false);
                                                            }}
                                                            className={cn(item.hasChildren && "opacity-50 cursor-not-allowed font-semibold bg-muted/50")}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className={cn("font-medium", item.hasChildren && "font-bold")}>{item.kode} - {item.nama}</span>
                                                                <span className="text-xs text-muted-foreground w-64 truncate">
                                                                    {item.kategori?.nama} {item.hasChildren && "(Group)"}
                                                                </span>
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

                            {/* Details: Date & Amount */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal Transaksi</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            name="tanggalRealisasi"
                                            className="pl-9"
                                            defaultValue={initialData?.tanggalRealisasi ? new Date(initialData.tanggalRealisasi).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
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

                            {/* TODO: Image Upload for 'buktiUrl' */}
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                                {isEditMode ? "Simpan Perubahan" : "Simpan Transaksi"}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>

            {/* Right Column: Information Panel */}
            <div className="space-y-6">
                {/* Selected Item Detail Card */}
                <Card className={cn("transition-all duration-300", selectedItem ? "opacity-100 translate-x-0" : "opacity-50 translate-x-4")}>
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
                                    <p className="text-base font-medium">{formatRupiah(selectedItem.totalTarget)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Realisasi Saat Ini</p>
                                    <p className="text-base font-medium text-blue-600">{formatRupiah(selectedItem.nominalActual)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Sisa / Selisih</p>
                                    <p className={cn("text-base font-medium", (selectedItem.nominalActual - selectedItem.totalTarget) >= 0 ? "text-green-600" : "text-amber-600")}>
                                        {formatRupiah(selectedItem.nominalActual - selectedItem.totalTarget)}
                                    </p>
                                </div>
                            </div>

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
