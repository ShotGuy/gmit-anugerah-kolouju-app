"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Printer, Search, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { getLaporanKas, LaporanKasResult } from "@/actions/keuangan/laporan";
import { DateRange } from "react-day-picker";
// import { useReactToPrint } from "react-to-print"; // Removed
import { ExportDialog } from "./export-dialog";

interface MutasiTabProps {
    akunList: any[];
}

export function MutasiTab({ akunList }: MutasiTabProps) {
    const [selectedAkun, setSelectedAkun] = useState<string>("");

    // Default: This Month
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date()
    });

    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<LaporanKasResult | null>(null);

    // Initial Selection
    useEffect(() => {
        if (akunList.length > 0 && !selectedAkun) {
            const defaultAkun = akunList.find((a: any) => a.isDefault) || akunList[0];
            setSelectedAkun(defaultAkun.id);
        }
    }, [akunList]);

    // Fetch Report
    useEffect(() => {
        const fetchReport = async () => {
            if (!selectedAkun || !dateRange?.from || !dateRange?.to) return;

            setLoading(true);
            const res = await getLaporanKas({
                akunKasId: selectedAkun,
                startDate: dateRange.from,
                endDate: dateRange.to
            });

            if (res.success && res.data) {
                setReport(res.data);
            } else {
                setReport(null);
            }
            setLoading(false);
        };

        fetchReport();
    }, [selectedAkun, dateRange]);

    // ... (lines 22-60 same)

    // Print Handler Removed - Replaced by Export Dialog

    const selectedAkunData = akunList.find(a => a.id === selectedAkun);
    const akunNama = selectedAkunData ? selectedAkunData.nama : "Kas";

    if (akunList.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">Belum ada Akun Kas. Silakan buat master data dulu.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-lg border shadow-sm">
                <div className="w-full md:w-1/3">
                    <label className="text-sm font-medium mb-1.5 block">Akun Kas</label>
                    <Select value={selectedAkun} onValueChange={setSelectedAkun}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Akun Kas" />
                        </SelectTrigger>
                        <SelectContent>
                            {akunList.map((akun) => (
                                <SelectItem key={akun.id} value={akun.id}>{akun.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full md:w-1/3">
                    <label className="text-sm font-medium mb-1.5 block">Periode Laporan</label>
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
                <div className="w-full md:w-auto">
                    <ExportDialog data={report || undefined} akunNama={akunNama} />
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-sm border min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : !report ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Pilih Akun Kas dan Tanggal untuk menampilkan data.
                    </div>
                ) : (
                    <div className="p-4 md:p-8 print:p-0">
                        {/* KOP LAPORAN (Hidden on screen usually, shown on print, but good to see here too) */}
                        <div className="hidden print:block text-center border-b pb-4 mb-6">
                            <h2 className="text-xl font-bold uppercase tracking-wider mb-1">Gereja Masehi Injili di Timor</h2>
                            <h3 className="text-lg font-bold uppercase mb-1">Jemaat Anugerah Koluju</h3>
                            <div className="mt-4 border-t-2 border-black w-32 mx-auto"></div>
                            <h1 className="text-2xl font-bold mt-2 underline decoration-double underline-offset-4">LAPORAN {akunNama.toUpperCase()}</h1>
                            <p className="text-sm mt-2 font-medium">Periode: {report.periodeLabel}</p>
                            <p className="text-sm font-medium">Akun Kas: {akunList.find(a => a.id === selectedAkun)?.nama}</p>
                        </div>

                        {/* RINGKASAN */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 bg-gray-50 p-4 border rounded-md print:bg-transparent print:border-0 print:p-0">
                            <div>
                                <span className="block text-muted-foreground print:text-black text-xs md:text-sm">Saldo Awal</span>
                                <span className="font-bold text-base md:text-lg">{formatCurrency(report.saldoAwal)}</span>
                            </div>
                            <div>
                                <span className="block text-muted-foreground print:text-black text-xs md:text-sm">Penerimaan (+)</span>
                                <span className="font-bold text-base md:text-lg text-blue-700 print:text-black">{formatCurrency(report.totalDebet)}</span>
                            </div>
                            <div>
                                <span className="block text-muted-foreground print:text-black text-xs md:text-sm">Pengeluaran (-)</span>
                                <span className="font-bold text-base md:text-lg text-red-700 print:text-black">{formatCurrency(report.totalKredit)}</span>
                            </div>
                            <div className="border-l pl-4 print:border-0">
                                <span className="block text-muted-foreground print:text-black text-xs md:text-sm">Saldo Akhir</span>
                                <span className="font-bold text-lg md:text-xl">{formatCurrency(report.saldoAkhir)}</span>
                            </div>
                        </div>

                        {/* TABLE VIEW (Desktop) */}
                        <div className="hidden md:block rounded-md border">
                            <Table className="border-collapse w-full text-sm">
                                <TableHeader>
                                    <TableRow className="bg-gray-100 print:bg-gray-200">
                                        <TableHead className="w-[120px] border border-gray-300 font-bold text-black border-r">Tanggal</TableHead>
                                        <TableHead className="w-[100px] border border-gray-300 font-bold text-black border-r">No. Bukti</TableHead>
                                        <TableHead className="border border-gray-300 font-bold text-black border-r">Uraian Transaksi</TableHead>
                                        <TableHead className="text-right border border-gray-300 font-bold text-black w-[140px] border-r">Pemasukan</TableHead>
                                        <TableHead className="text-right border border-gray-300 font-bold text-black w-[140px] border-r">Pengeluaran</TableHead>
                                        <TableHead className="text-right border border-gray-300 font-bold text-black w-[150px]">Saldo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="bg-gray-50/50 print:bg-transparent border-b">
                                        <TableCell className="border-r border-gray-300 text-center">-</TableCell>
                                        <TableCell className="border-r border-gray-300 text-center">-</TableCell>
                                        <TableCell className="border-r border-gray-300 font-semibold italic">Saldo Awal Periode</TableCell>
                                        <TableCell className="border-r border-gray-300 text-right text-gray-400">-</TableCell>
                                        <TableCell className="border-r border-gray-300 text-right text-gray-400">-</TableCell>
                                        <TableCell className="border-gray-300 text-right font-bold">{formatCurrency(report.saldoAwal)}</TableCell>
                                    </TableRow>
                                    {report.items.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-gray-50 print:hover:bg-transparent border-b">
                                            <TableCell className="border-r border-gray-300 text-center align-top py-3">
                                                {new Date(item.tanggal).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="border-r border-gray-300 text-center align-top py-3 font-mono text-xs">
                                                {item.noBukti || "-"}
                                            </TableCell>
                                            <TableCell className="border-r border-gray-300 align-top py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    {item.kodeItem && item.namaItem && (
                                                        <span className="text-[11px] font-semibold text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded w-fit">
                                                            [{item.kodeItem}] {item.namaItem}
                                                        </span>
                                                    )}
                                                    <span className="font-medium text-sm mt-0.5">{item.uraian}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-r border-gray-300 text-right align-top py-3 font-medium text-blue-700 bg-blue-50/10">
                                                {item.debet > 0 ? formatCurrency(item.debet) : "-"}
                                            </TableCell>
                                            <TableCell className="border-r border-gray-300 text-right align-top py-3 font-medium text-red-700 bg-red-50/10">
                                                {item.kredit > 0 ? formatCurrency(item.kredit) : "-"}
                                            </TableCell>
                                            <TableCell className="border-gray-300 text-right align-top py-3 font-bold">
                                                {formatCurrency(item.saldoBerjalan)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {report.items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground border border-gray-300">
                                                Tidak ada transaksi pada periode ini.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* MOBILE CARD VIEW (Phone) */}
                        <div className="block md:hidden space-y-4">
                            {/* Saldo Awal Card */}
                            <Card className="bg-gray-50 border-dashed">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Saldo Awal</span>
                                    <span className="text-lg font-bold">{formatCurrency(report.saldoAwal)}</span>
                                </CardContent>
                            </Card>

                            {report.items.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-gray-50">
                                    Tidak ada transaksi pada periode ini.
                                </div>
                            ) : (
                                report.items.map((item) => (
                                    <Card key={item.id} className="shadow-sm border">
                                        <CardContent className="p-4">
                                            {/* Header: Date & No Bukti */}
                                            <div className="flex justify-between items-start mb-3 border-b pb-2">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tanggal</span>
                                                    <span className="text-sm font-semibold">
                                                        {new Date(item.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">No. Bukti</span>
                                                    <Badge variant="outline" className="font-mono text-xs">{item.noBukti || "-"}</Badge>
                                                </div>
                                            </div>

                                            {/* Body: Uraian */}
                                            <div className="mb-4">
                                                {item.kodeItem && item.namaItem && (
                                                    <Badge variant="secondary" className="mb-1.5 text-[10px] px-1.5">
                                                        {item.kodeItem} - {item.namaItem}
                                                    </Badge>
                                                )}
                                                <p className="text-sm font-medium leading-relaxed">{item.uraian}</p>
                                            </div>

                                            {/* Footer: Nominal */}
                                            <div className="bg-gray-50/50 -mx-4 -mb-4 p-3 border-t grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs text-muted-foreground block mb-0.5">Mutasi</span>
                                                    {item.debet > 0 && <span className="text-blue-600 font-bold block text-sm">+ {formatCurrency(item.debet)}</span>}
                                                    {item.kredit > 0 && <span className="text-red-600 font-bold block text-sm">- {formatCurrency(item.kredit)}</span>}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-muted-foreground block mb-0.5">Saldo Akhir</span>
                                                    <span className="font-bold text-sm">{formatCurrency(item.saldoBerjalan)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* SIGNATURE (Print Only) */}
                        <div className="hidden print:grid mt-12 pt-8 grid-cols-2 text-center break-inside-avoid">
                            <div>
                                <p className="mb-20">Mengetahui,<br />Ketua Majelis Jemaat</p>
                                <p className="font-bold underline">Pdt. [Nama Pendeta]</p>
                            </div>
                            <div>
                                <p className="mb-20">Dibuat Oleh,<br />Bendahara</p>
                                <p className="font-bold underline">[Nama Bendahara]</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
