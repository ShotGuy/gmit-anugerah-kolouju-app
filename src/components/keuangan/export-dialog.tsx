
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, FileText, Printer, Eye } from "lucide-react";
import { LaporanKasResult } from "@/actions/keuangan/laporan";
import { pdf } from "@react-pdf/renderer";
import { LaporanPdf } from "./laporan-pdf";
import { saveAs } from "file-saver";
import { generateExcelReport } from "@/lib/export-excel";

interface ExportDialogProps {
    data: LaporanKasResult | undefined;
    akunNama: string;
}

export function ExportDialog({ data, akunNama }: ExportDialogProps) {
    const [open, setOpen] = useState(false);
    const [ketua, setKetua] = useState("");
    const [bendahara, setBendahara] = useState("");
    const [kota, setKota] = useState("Koluju");
    const [tanggal, setTanggal] = useState("");

    // Load saved names
    useEffect(() => {
        const savedKetua = localStorage.getItem("laporan_ketua");
        const savedBendahara = localStorage.getItem("laporan_bendahara");
        if (savedKetua) setKetua(savedKetua);
        if (savedBendahara) setBendahara(savedBendahara);

        // Default Date: Today (Indonesian format)
        const today = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
        setTanggal(today);
    }, [open]);

    const handleSaveSignatories = () => {
        localStorage.setItem("laporan_ketua", ketua);
        localStorage.setItem("laporan_bendahara", bendahara);
    };

    const handlePreview = async () => {
        if (!data) return;
        handleSaveSignatories();

        const signatories = { ketua, bendahara, kota, tanggal };
        const blob = await pdf(<LaporanPdf data={data} akunNama={akunNama} signatories={signatories} />).toBlob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const handleDownloadPDF = async () => {
        if (!data) return;
        handleSaveSignatories();

        const signatories = { ketua, bendahara, kota, tanggal };
        const blob = await pdf(<LaporanPdf data={data} akunNama={akunNama} signatories={signatories} />).toBlob();
        saveAs(blob, `Laporan_${akunNama}_${data.periodeLabel}.pdf`);
        setOpen(false);
    };

    const handleDownloadExcel = async () => {
        if (!data) return;
        handleSaveSignatories();

        const signatories = { ketua, bendahara, kota, tanggal };
        await generateExcelReport(data, akunNama, signatories);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={!data || data.items.length === 0}>
                    <Download className="h-4 w-4" /> Export Laporan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Laporan Kas</DialogTitle>
                    <DialogDescription>
                        Lengkapi data penandatangan sebelum mengunduh laporan.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="kota" className="text-left sm:text-right">Kota</Label>
                        <Input id="kota" value={kota} onChange={(e) => setKota(e.target.value)} className="col-span-1 sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="tanggal" className="text-left sm:text-right">Tanggal</Label>
                        <Input id="tanggal" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="col-span-1 sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="ketua" className="text-left sm:text-right">Nama Ketua</Label>
                        <Input id="ketua" value={ketua} onChange={(e) => setKetua(e.target.value)} placeholder="Ketua Majelis" className="col-span-1 sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="bendahara" className="text-left sm:text-right">Nama Bendahara</Label>
                        <Input id="bendahara" value={bendahara} onChange={(e) => setBendahara(e.target.value)} placeholder="Bendahara Jemaat" className="col-span-1 sm:col-span-3" />
                    </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-2">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="secondary" onClick={handlePreview} className="gap-2 w-full sm:w-auto">
                            <Eye className="h-4 w-4" /> Preview
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={handleDownloadExcel} className="gap-2 w-full sm:w-auto">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" /> Excel
                        </Button>
                        <Button onClick={handleDownloadPDF} className="gap-2 w-full sm:w-auto">
                            <FileText className="h-4 w-4" /> Download PDF
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
