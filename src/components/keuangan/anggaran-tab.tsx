"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, Plus, ArrowRight, Target, TrendingUp, TrendingDown, BarChart3, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { deleteRealisasi, getRealisasiList, getRealisasiSummary } from "@/actions/keuangan/realisasi";
import { SummaryCard } from "@/components/keuangan/summary-card";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AnggaranTabProps {
    periodes: any[];
    kategoris: any[];
}

export function AnggaranTab({ periodes, kategoris }: AnggaranTabProps) {
    // Filters
    const [selectedPeriode, setSelectedPeriode] = useState<string>("");
    const [selectedKategori, setSelectedKategori] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Data State
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    // Initialize Filter
    useEffect(() => {
        if (!selectedPeriode && periodes.length > 0) {
            setSelectedPeriode(periodes[0].id);
        }
    }, [periodes]);

    // Fetch Data
    const fetchData = async () => {
        if (!selectedPeriode) return;
        setLoading(true);

        const [summaryRes, historyRes] = await Promise.all([
            getRealisasiSummary({ periodeId: selectedPeriode, kategoriId: selectedKategori === "all" ? undefined : selectedKategori }),
            getRealisasiList({ periodeId: selectedPeriode, kategoriId: selectedKategori === "all" ? undefined : selectedKategori, limit: 50, q: searchQuery })
        ]);

        if (summaryRes.success) setSummary(summaryRes.data);
        if (historyRes.success) setHistory(historyRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [selectedPeriode, selectedKategori, searchQuery]); // Re-fetch on filter change

    // Delete Handler
    const handleDelete = async (id: string) => {
        toast.promise(deleteRealisasi(id), {
            loading: "Menghapus...",
            success: (data) => {
                if (data.success) {
                    fetchData(); // Refresh data
                    return "Transaksi berhasil dihapus";
                }
                throw new Error(data.message);
            },
            error: (err) => `Gagal: ${err.message}`
        });
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-muted-foreground w-full sm:w-auto">
                    Menampilkan data realisasi anggaran vs target.
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button asChild className="w-full sm:w-auto font-medium shadow-sm hover:shadow-md transition-all">
                        <Link href="/keuangan/realisasi/create">
                            <Plus className="mr-2 h-4 w-4" /> Transaksi Baru
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filter Card */}
            <Card className="shadow-sm border-muted/40">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Periode</label>
                            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Pilih Periode" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periodes.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kategori</label>
                            <Select value={selectedKategori} onValueChange={setSelectedKategori}>
                                <SelectTrigger className="bg-background">
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
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pencarian</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari item..."
                                    className="pl-9 bg-background"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard
                        title="Total Target"
                        value={formatCurrency(summary.summary.totalTargetAmount)}
                        icon={Target}
                        iconColor="text-blue-600"
                        bgColor="bg-blue-50"
                    />
                    <SummaryCard
                        title="Total Realisasi"
                        value={formatCurrency(summary.summary.totalRealisasiAmount)}
                        icon={TrendingUp}
                        iconColor="text-emerald-600"
                        bgColor="bg-emerald-50"
                    />
                    <SummaryCard
                        title="Selisih (Variance)"
                        value={formatCurrency(summary.summary.totalVarianceAmount)}
                        icon={summary.summary.totalVarianceAmount >= 0 ? TrendingUp : TrendingDown}
                        subtext={summary.summary.totalVarianceAmount < 0 ? "Over Budget / Defisit" : "Surplus / Hemat"}
                        iconColor={summary.summary.totalVarianceAmount >= 0 ? "text-emerald-600" : "text-rose-600"}
                        textColor={summary.summary.totalVarianceAmount >= 0 ? "text-emerald-600" : "text-rose-600"}
                        bgColor={summary.summary.totalVarianceAmount >= 0 ? "bg-emerald-50" : "bg-rose-50"}
                    />
                    <SummaryCard
                        title="Capaian Target"
                        value={`${summary.summary.itemsTargetAchieved} / ${summary.summary.totalItems}`}
                        subtext="Item Tercapai"
                        icon={BarChart3}
                        iconColor="text-violet-600"
                        bgColor="bg-violet-50"
                    />
                </div>
            )}

            {/* Main Table: Item Realization */}
            <Card className="shadow-sm border-muted/40">
                <CardHeader className="bg-muted/10 pb-4">
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                        <span>Detail Realisasi per Item</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-none border-t">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/5">
                                    <TableHead className="w-[300px]">Item Anggaran</TableHead>
                                    <TableHead className="text-right">Target</TableHead>
                                    <TableHead className="text-right">Realisasi</TableHead>
                                    <TableHead className="text-right">Selisih</TableHead>
                                    <TableHead className="text-center w-[100px]">Status</TableHead>
                                    <TableHead className="text-center w-[80px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!loading && summary?.items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {summary?.items.map((item: any) => (
                                    <TableRow key={item.id} className="hover:bg-muted/5 group">
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{item.nama}</span>
                                                <span className="text-[11px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">{item.kode}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{formatCurrency(item.totalTarget)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(item.totalRealisasiAmount)}</TableCell>
                                        <TableCell className={`text-right font-semibold ${item.varianceAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {formatCurrency(item.varianceAmount)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={item.isTargetAchieved ? "outline" : "secondary"} className={`text-[10px] ${item.isTargetAchieved ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : ''}`}>
                                                {item.isTargetAchieved ? "Tercapai" : "Belum"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                                                <Link href={`/keuangan/realisasi/${item.id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Recent History Table */}
            <Card className="shadow-sm border-muted/40">
                <CardHeader className="bg-muted/10 pb-4">
                    <CardTitle className="text-base font-medium">Riwayat Transaksi Terakhir (50 Teratas)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/5">
                                <TableHead className="w-[150px]">Tanggal</TableHead>
                                <TableHead className="w-[200px]">Item</TableHead>
                                <TableHead>Keterangan</TableHead>
                                <TableHead className="text-right w-[150px]">Jumlah</TableHead>
                                <TableHead className="text-center w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada riwayat transaksi.</TableCell>
                                </TableRow>
                            )}
                            {history.map((trx: any) => (
                                <TableRow key={trx.id} className="hover:bg-muted/5">
                                    <TableCell className="text-sm">
                                        {new Date(trx.tanggalRealisasi).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">{trx.itemKeuangan?.nama}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground truncate max-w-[300px]">
                                        {trx.keterangan || "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-emerald-600">
                                        {formatCurrency(Number(trx.totalRealisasi))}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-blue-600" asChild>
                                                <Link href={`/keuangan/realisasi/edit/${trx.id}`}><Edit className="h-3.5 w-3.5" /></Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tindakan ini tidak dapat dibatalkan. Saldo kas juga akan dikoreksi otomatis.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(trx.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                                            Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
