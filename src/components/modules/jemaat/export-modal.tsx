"use client";

import { useState, useMemo } from "react";
import {
    Download,
    FileSpreadsheet,
    FileText,
    Check,
    Filter,
    LayoutTemplate,
    Users,
    FileBarChart,
    ChevronDown,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { exportToExcel, exportToPdf, exportStatisticsToPdf, ExportColumn } from "@/lib/export-utils";
import { toast } from "sonner";

// --- Helper Functions ---
const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// --- Constants ---
const AVAILABLE_COLUMNS: ExportColumn[] = [
    { header: "ID Jemaat", accessorKey: "idJemaat" },
    { header: "Nama Lengkap", accessorKey: "nama" },
    { header: "Jenis Kelamin", accessorKey: "jenisKelamin", cell: (item: any) => item.jenisKelamin ? "Laki-laki" : "Perempuan" },
    { header: "Tanggal Lahir", accessorKey: "tanggalLahir", cell: (item: any) => new Date(item.tanggalLahir).toLocaleDateString("id-ID") },
    { header: "Umur", accessorKey: "age", cell: (item: any) => calculateAge(item.tanggalLahir).toString() },
    { header: "Status Keluarga", accessorKey: "statusDalamKel", cell: (item: any) => item.status?.status || "-" },
    { header: "Golongan Darah", accessorKey: "golDarah", cell: (item: any) => item.golDarah || "-" },
    { header: "Pendidikan", accessorKey: "pendidikan", cell: (item: any) => item.pendidikan?.jenjang || "-" },
    { header: "Pekerjaan", accessorKey: "pekerjaan", cell: (item: any) => item.pekerjaan?.namaPekerjaan || "-" },
    { header: "Pendapatan", accessorKey: "pendapatan", cell: (item: any) => item.pendapatan?.rentang || "-" },
    { header: "Rayon", accessorKey: "rayon", cell: (item: any) => item.keluarga?.rayon?.namaRayon || "-" },
    { header: "Jaminan Sosial", accessorKey: "jaminan", cell: (item: any) => item.jaminan?.jenisJaminan || "-" },
    { header: "Status Baptis", accessorKey: "baptisOwned", cell: (item: any) => item.baptisOwned ? "Sudah Baptis" : "Belum Baptis" },
    { header: "Status Sidi", accessorKey: "sidiOwned", cell: (item: any) => item.sidiOwned ? "Sudah Sidi" : "Belum Sidi" },
];

// Presets
const PRESETS = {
    ringkas: {
        label: "Ringkas",
        desc: "Nama, Rayon, Umur",
        columns: ["nama", "rayon", "age"]
    },
    lengkap: {
        label: "Lengkap",
        desc: "Semua data jemaat",
        columns: AVAILABLE_COLUMNS.map(c => String(c.accessorKey))
    },
    administratif: {
        label: "Administratif",
        desc: "ID, Status, Alamat",
        columns: ["idJemaat", "nama", "statusDalamKel", "rayon", "baptisOwned", "sidiOwned"]
    }
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    currentPageData: any[];
    totalDataCount: number;
    onFetchAllData: (filters: any) => Promise<any[]>;
    filterOptions: {
        rayons: { label: string; value: string }[];
        pendidikans: { label: string; value: string }[];
        pekerjaans: { label: string; value: string }[];
        pendapatans: { label: string; value: string }[];
        jaminans: { label: string; value: string }[];
    };
};

export function ExportModal({
    isOpen,
    onClose,
    currentPageData,
    totalDataCount,
    onFetchAllData,
    filterOptions,
}: Props) {
    // --- State ---
    const [format, setFormat] = useState<"excel" | "pdf">("excel");
    const [scope, setScope] = useState<"current" | "all">("all"); // Default to "all" for super export feel
    const [selectedColumns, setSelectedColumns] = useState<string[]>(PRESETS.lengkap.columns);
    const [activePreset, setActivePreset] = useState<string>("lengkap");
    const [reportType, setReportType] = useState<"data" | "stats">("data");

    // Filters State
    const [localFilters, setLocalFilters] = useState<Record<string, string[]>>({
        jenisKelamin: [],
        golDarah: [],
        idRayon: [],
        idPendidikan: [],
        idPekerjaan: [],
        idPendapatan: [],
        idJaminan: [],
        statusBaptis: [],
        statusSidi: [],
        kategoriUmur: [],
    });

    const [isExporting, setIsExporting] = useState(false);

    // --- Actions ---
    const updateFilter = (key: string, value: string) => {
        setLocalFilters(prev => {
            const current = prev[key] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [key]: updated };
        });
    };

    const toggleAllFilter = (key: string, allValues: string[]) => {
        setLocalFilters(prev => {
            const current = prev[key] || [];
            // If all selected (or equal count), clear. Else select all.
            if (current.length === allValues.length) {
                return { ...prev, [key]: [] };
            } else {
                return { ...prev, [key]: allValues };
            }
        });
    };

    const handlePresetSelect = (key: keyof typeof PRESETS) => {
        setActivePreset(key);
        setSelectedColumns(PRESETS[key].columns);
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);

            // 1. Get Data
            let dataToExport = [];
            if (scope === "current") {
                dataToExport = currentPageData;
            } else {
                toast.info("Sedang mengambil data...");
                dataToExport = await onFetchAllData(localFilters);
            }

            if (dataToExport.length === 0) {
                toast.error("Gagal ekspor: Data kosong");
                setIsExporting(false);
                return;
            }

            // 2. Filter Columns
            const finalColumns = AVAILABLE_COLUMNS.filter((col) =>
                selectedColumns.includes(String(col.accessorKey))
            );

            // Calculate age if needed
            if (selectedColumns.includes("age")) {
                dataToExport = dataToExport.map(item => ({
                    ...item,
                    age: calculateAge(item.tanggalLahir)
                }));
            }


            // 3. Generate File
            const filename = `Data-Jemaat-${new Date().toISOString().split("T")[0]}`;

            if (reportType === "stats") {
                // Calculation Logic
                const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

                // Helper to Aggregation
                const aggregate = (data: any[], keyFn: (item: any) => string) => {
                    const counts = data.reduce((acc: any, curr) => {
                        const key = keyFn(curr) || "Tidak Diketahui";
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                    }, {});
                    return Object.entries(counts)
                        .map(([label, count]) => ({ label, count: Number(count) }))
                        .sort((a, b) => b.count - a.count);
                };

                const stats = {
                    totalJiwa: dataToExport.length,
                    totalKK: new Set(dataToExport.map(d => d.keluarga?.idKeluarga).filter(Boolean)).size,
                    gender: [
                        { label: "Laki-laki", count: dataToExport.filter(d => d.jenisKelamin === true).length, color: "#2563EB" },
                        { label: "Perempuan", count: dataToExport.filter(d => d.jenisKelamin === false).length, color: "#EC4899" }
                    ],
                    umur: [
                        { label: "Anak (0-11)", count: dataToExport.filter(d => { const age = calculateAge(d.tanggalLahir); return age <= 11; }).length, color: "#BFDBFE" },
                        { label: "Remaja (12-17)", count: dataToExport.filter(d => { const age = calculateAge(d.tanggalLahir); return age >= 12 && age <= 17; }).length, color: "#60A5FA" },
                        { label: "Pemuda (18-35)", count: dataToExport.filter(d => { const age = calculateAge(d.tanggalLahir); return age >= 18 && age <= 35; }).length, color: "#3B82F6" },
                        { label: "Dewasa (36-60)", count: dataToExport.filter(d => { const age = calculateAge(d.tanggalLahir); return age >= 36 && age <= 60; }).length, color: "#2563EB" },
                        { label: "Lansia (>60)", count: dataToExport.filter(d => { const age = calculateAge(d.tanggalLahir); return age > 60; }).length, color: "#1E40AF" }
                    ],
                    pekerjaan: aggregate(dataToExport, (d) => d.pekerjaan?.namaPekerjaan).slice(0, 5),
                    rayon: aggregate(dataToExport, (d) => d.keluarga?.rayon?.namaRayon),
                    baptis: {
                        sudan: dataToExport.filter(d => d.baptisOwned).length,
                        belum: dataToExport.filter(d => !d.baptisOwned).length
                    },
                    sidi: {
                        sudan: dataToExport.filter(d => d.sidiOwned).length,
                        belum: dataToExport.filter(d => !d.sidiOwned).length
                    },
                    // New Stats
                    pendidikan: aggregate(dataToExport, (d) => d.pendidikan?.jenjang),
                    pendapatan: aggregate(dataToExport, (d) => d.pendapatan?.rentang),
                    golDarah: aggregate(dataToExport, (d) => d.golDarah?.toUpperCase() || "-"), // Normalize case
                    statusPerkawinan: aggregate(dataToExport, (d) => d.statusPerkawinan || (d.pernikahan ? "Menikah" : "Belum Menikah")), // Fallback logical check
                    bulanLahir: monthNames.map((month, index) => ({
                        label: month,
                        count: dataToExport.filter(d => new Date(d.tanggalLahir).getMonth() === index).length
                    }))
                };

                await exportStatisticsToPdf(stats, `Statistik-Jemaat-${new Date().toISOString().split("T")[0]}`, "Laporan Statistik Jemaat");

            } else if (format === "excel") {
                await exportToExcel(dataToExport, finalColumns, filename);
            } else {
                await exportToPdf(dataToExport, finalColumns, filename, "Laporan Data Jemaat");
            }

            toast.success("Export berhasil!");
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal melakukan export");
        } finally {
            setIsExporting(false);
        }
    };

    // --- Computed ---
    const activeFilterCount = Object.values(localFilters).reduce((acc, curr) => acc + curr.length, 0);

    // Filter Options
    const kelaminOpts = [{ label: "Laki-laki", value: "L" }, { label: "Perempuan", value: "P" }];
    const golDarahOpts = ["A", "B", "AB", "O"].map(g => ({ label: g, value: g }));
    const baptisOpts = [{ label: "Sudah Baptis", value: "sudah" }, { label: "Belum Baptis", value: "belum" }];
    const sidiOpts = [{ label: "Sudah Sidi", value: "sudah" }, { label: "Belum Sidi", value: "belum" }];
    const umurOpts = [
        { label: "Anak (< 12 thn)", value: "anak" },
        { label: "Remaja (12 - 17 thn)", value: "remaja" },
        { label: "Pemuda (18 - 35 thn)", value: "pemuda" },
        { label: "Dewasa (36 - 60 thn)", value: "dewasa" },
        { label: "Lansia (> 60 thn)", value: "lansia" },
    ];


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col md:flex-row bg-background">

                {/* --- LEFT PANEL: CONFIGURATION --- */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            Super Export Jemaat
                        </DialogTitle>
                        <DialogDescription>
                            Konfigurasi export data dengan filter presisi.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 min-h-0 relative">
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-8">

                                {/* 0. Report Type Selection */}
                                <section className="space-y-4">
                                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Tipe Laporan
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={cn(
                                                "border rounded-lg p-4 cursor-pointer transition-all hover:bg-accent/50",
                                                reportType === "data" ? "bg-primary/5 border-primary ring-1 ring-primary" : "bg-card"
                                            )}
                                            onClick={() => { setFormat("excel"); setReportType("data"); }}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={cn("p-2 rounded-md", reportType === "data" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="font-semibold">Data Detail</div>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Tabel baris per baris lengkap. Cocok untuk analisis mendalam atau backup data.
                                            </p>
                                        </div>

                                        <div
                                            className={cn(
                                                "border rounded-lg p-4 cursor-pointer transition-all hover:bg-accent/50",
                                                reportType === "stats" ? "bg-primary/5 border-primary ring-1 ring-primary" : "bg-card"
                                            )}
                                            onClick={() => setReportType("stats")}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={cn("p-2 rounded-md", reportType === "stats" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                                    <FileBarChart className="w-5 h-5" />
                                                </div>
                                                <div className="font-semibold">Statistik</div>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Ringkasan visual, grafik, dan angka penting. Cocok untuk laporan eksekutif.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <Separator />

                                {/* 1. Presets (Only for Data Report) */}
                                {reportType === "data" && (
                                    <>
                                        <section className="space-y-4">
                                            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                                <LayoutTemplate className="w-4 h-4" /> Preset Cepat
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {Object.entries(PRESETS).map(([key, preset]) => (
                                                    <div
                                                        key={key}
                                                        onClick={() => handlePresetSelect(key as any)}
                                                        className={cn(
                                                            "border rounded-lg p-3 cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden",
                                                            activePreset === key ? "border-primary bg-primary/5 shadow-sm" : "bg-card"
                                                        )}
                                                    >
                                                        <div className="font-medium text-sm">{preset.label}</div>
                                                        <div className="text-xs text-muted-foreground mt-1 truncate">{preset.desc}</div>
                                                        {activePreset === key && (
                                                            <div className="absolute top-0 right-0 p-1 bg-primary text-primary-foreground rounded-bl-lg">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                        <Separator />
                                    </>
                                )}

                                {/* 2. Format Selection (Only for Data Report) */}
                                {reportType === "data" && (
                                    <>
                                        <section className="space-y-4">
                                            <h3 className="text-sm font-semibold text-muted-foreground">Format File</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div
                                                    onClick={() => setFormat("excel")}
                                                    className={cn(
                                                        "flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-all",
                                                        format === "excel" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""
                                                    )}
                                                >
                                                    <div className="p-2 bg-green-100 text-green-700 rounded-md">
                                                        <FileSpreadsheet className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Excel Spreadsheet</div>
                                                        <div className="text-xs text-muted-foreground">Editable, analisis data</div>
                                                    </div>
                                                </div>
                                                <div
                                                    onClick={() => setFormat("pdf")}
                                                    className={cn(
                                                        "flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-all",
                                                        format === "pdf" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""
                                                    )}
                                                >
                                                    <div className="p-2 bg-red-100 text-red-700 rounded-md">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">PDF Document</div>
                                                        <div className="text-xs text-muted-foreground">Siap cetak, layout tetap</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                        <Separator />
                                    </>
                                )}

                                {/* 3. Column Selection (Only for Data Report) */}
                                {reportType === "data" && (
                                    <>
                                        <section className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                                    <LayoutTemplate className="w-4 h-4" /> Pilih Kolom Data
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={() => {
                                                        if (selectedColumns.length === AVAILABLE_COLUMNS.length) {
                                                            setSelectedColumns([]);
                                                            setActivePreset("custom");
                                                        } else {
                                                            setSelectedColumns(AVAILABLE_COLUMNS.map(c => String(c.accessorKey)));
                                                            setActivePreset("lengkap");
                                                        }
                                                    }}
                                                >
                                                    {selectedColumns.length === AVAILABLE_COLUMNS.length ? "Batal Semua" : "Pilih Semua"}
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                                {AVAILABLE_COLUMNS.map((col) => (
                                                    <div key={String(col.accessorKey)} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`col-${String(col.accessorKey)}`}
                                                            checked={selectedColumns.includes(String(col.accessorKey))}
                                                            onCheckedChange={(checked) => {
                                                                setActivePreset("custom");
                                                                if (checked) {
                                                                    setSelectedColumns([...selectedColumns, String(col.accessorKey)]);
                                                                } else {
                                                                    setSelectedColumns(selectedColumns.filter(c => c !== String(col.accessorKey)));
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`col-${String(col.accessorKey)}`}
                                                            className="text-sm leading-none cursor-pointer truncate"
                                                        >
                                                            {col.header}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                        <Separator />
                                    </>
                                )}

                                {/* 4. Filter Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                            <Filter className="w-4 h-4" /> Filter Lanjutan
                                        </h3>
                                        {activeFilterCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setLocalFilters({
                                                    jenisKelamin: [], golDarah: [], idRayon: [], idPendidikan: [], idPekerjaan: [],
                                                    idPendapatan: [], idJaminan: [], statusBaptis: [], statusSidi: [], kategoriUmur: []
                                                })}
                                            >
                                                Reset Filter
                                            </Button>
                                        )}
                                    </div>

                                    <Accordion type="multiple" defaultValue={["rayon", "pribadi", "gerejawi"]} className="w-full">
                                        {/* A. Data Keluarga (Rayon) */}
                                        <AccordionItem value="rayon" className="border rounded-lg px-4 mb-2">
                                            <AccordionTrigger className="hover:no-underline py-3">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                    Data Wilayah & Keluarga
                                                    {localFilters.idRayon.length > 0 &&
                                                        <Badge variant="secondary" className="ml-2 h-5 text-[10px]">{localFilters.idRayon.length}</Badge>
                                                    }
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-4">
                                                <div className="mb-2 flex justify-end">
                                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs"
                                                        onClick={() => toggleAllFilter('idRayon', filterOptions.rayons.map(r => r.value))}>
                                                        Pilih Semua
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {filterOptions.rayons.map((opt) => (
                                                        <div key={opt.value} className="flex items-start space-x-2">
                                                            <Checkbox
                                                                id={`rayon-${opt.value}`}
                                                                checked={localFilters.idRayon.includes(opt.value)}
                                                                onCheckedChange={() => updateFilter('idRayon', opt.value)}
                                                            />
                                                            <label htmlFor={`rayon-${opt.value}`} className="text-sm leading-none cursor-pointer">
                                                                {opt.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        {/* B. Data Pribadi (Umur, JK, GolDar) */}
                                        <AccordionItem value="pribadi" className="border rounded-lg px-4 mb-2">
                                            <AccordionTrigger className="hover:no-underline py-3">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Users className="w-4 h-4 text-green-500" />
                                                    Data Pribadi
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-4 space-y-4">
                                                {/* Kategori Umur */}
                                                <div>
                                                    <div className="text-xs font-semibold mb-2">Kategori Umur</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {umurOpts.map((opt) => (
                                                            <div key={opt.value} className="flex items-center space-x-2">
                                                                <Checkbox id={`umur-${opt.value}`}
                                                                    checked={localFilters.kategoriUmur.includes(opt.value)}
                                                                    onCheckedChange={() => updateFilter('kategoriUmur', opt.value)}
                                                                />
                                                                <label htmlFor={`umur-${opt.value}`} className="text-sm cursor-pointer">{opt.label}</label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Separator />
                                                {/* Jenis Kelamin & Gol Darah */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-xs font-semibold mb-2">Jenis Kelamin</div>
                                                        <div className="space-y-2">
                                                            {kelaminOpts.map((opt) => (
                                                                <div key={opt.value} className="flex items-center space-x-2">
                                                                    <Checkbox id={`jk-${opt.value}`}
                                                                        checked={localFilters.jenisKelamin.includes(opt.value)}
                                                                        onCheckedChange={() => updateFilter('jenisKelamin', opt.value)}
                                                                    />
                                                                    <label htmlFor={`jk-${opt.value}`} className="text-sm cursor-pointer">{opt.label}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold mb-2">Golongan Darah</div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {golDarahOpts.map((opt) => (
                                                                <div key={opt.value} className="flex items-center space-x-2">
                                                                    <Checkbox id={`gd-${opt.value}`}
                                                                        checked={localFilters.golDarah.includes(opt.value)}
                                                                        onCheckedChange={() => updateFilter('golDarah', opt.value)}
                                                                    />
                                                                    <label htmlFor={`gd-${opt.value}`} className="text-sm cursor-pointer">{opt.label}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                            </AccordionContent>
                                        </AccordionItem>
                                        {/* C. Data Gerejawi (Baptis, Sidi) */}
                                        <AccordionItem value="gerejawi" className="border rounded-lg px-4 mb-2">
                                            <AccordionTrigger className="hover:no-underline py-3">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Users className="w-4 h-4 text-purple-500" />
                                                    Status Gerejawi
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-xs font-semibold mb-2">Baptis</div>
                                                        <div className="space-y-2">
                                                            {baptisOpts.map((opt) => (
                                                                <div key={opt.value} className="flex items-center space-x-2">
                                                                    <Checkbox id={`baptis-${opt.value}`}
                                                                        checked={localFilters.statusBaptis.includes(opt.value)}
                                                                        onCheckedChange={() => updateFilter('statusBaptis', opt.value)}
                                                                    />
                                                                    <label htmlFor={`baptis-${opt.value}`} className="text-sm cursor-pointer">{opt.label}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold mb-2">Sidi</div>
                                                        <div className="space-y-2">
                                                            {sidiOpts.map((opt) => (
                                                                <div key={opt.value} className="flex items-center space-x-2">
                                                                    <Checkbox id={`sidi-${opt.value}`}
                                                                        checked={localFilters.statusSidi.includes(opt.value)}
                                                                        onCheckedChange={() => updateFilter('statusSidi', opt.value)}
                                                                    />
                                                                    <label htmlFor={`sidi-${opt.value}`} className="text-sm cursor-pointer">{opt.label}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </section>
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* --- RIGHT PANEL: PREVIEW --- */}
                <div className="w-full md:w-[350px] bg-muted/30 border-l flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 min-h-0 relative">
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <FileBarChart className="w-4 h-4" /> Preview Export
                                    </h4>
                                    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-dashed">
                                            <span className="text-sm text-muted-foreground">Total Records</span>
                                            <span className="font-mono font-bold text-lg">
                                                {activeFilterCount > 0 ? "Filtered" : totalDataCount}
                                            </span>
                                        </div>

                                        {reportType === "data" ? (
                                            <>
                                                <div className="flex justify-between items-center py-2 border-b border-dashed">
                                                    <span className="text-sm text-muted-foreground">Format</span>
                                                    <Badge variant="outline" className="uppercase">{format}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-dashed">
                                                    <span className="text-sm text-muted-foreground">Fields Selected</span>
                                                    <Badge variant="secondary">{selectedColumns.length}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-dashed">
                                                    <span className="text-sm text-muted-foreground">Est. Size</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ~{((totalDataCount * selectedColumns.length * 0.05) / 1024).toFixed(2)} MB
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center py-2 border-b border-dashed">
                                                    <span className="text-sm text-muted-foreground">Format</span>
                                                    <Badge variant="outline" className="uppercase">PDF (Stats)</Badge>
                                                </div>
                                                <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-xs">
                                                    <p className="font-semibold mb-1">Preview Isi:</p>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        <li>Gender & Age Chart</li>
                                                        <li>Rayon Distribution</li>
                                                        <li>Top Jobs & Education</li>
                                                        <li>Baptis / Sidi Progress</li>
                                                    </ul>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {activeFilterCount > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">Active Filters</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(localFilters).map(key =>
                                                localFilters[key].map(val => (
                                                    <Badge key={`${key}-${val}`} variant="secondary" className="text-xs font-normal">
                                                        {val}
                                                        <X
                                                            className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                                                            onClick={() => updateFilter(key, val)}
                                                        />
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Bottom Action */}
                    <div className="p-6 bg-background border-t shrink-0">
                        <Button className="w-full gap-2" size="lg" onClick={handleExport} disabled={isExporting}>
                            {isExporting ? (
                                <>Loading...</>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    {reportType === "stats" ? "Download Laporan Statistik" : `Download .${format === "excel" ? "xlsx" : "pdf"}`}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
