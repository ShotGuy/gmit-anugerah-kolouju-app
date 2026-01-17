import { Suspense } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { getItemById } from "@/actions/keuangan/item";
import { getRealisasiByItem, deleteRealisasi } from "@/actions/keuangan/realisasi"; // validation needed if export exists
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Trash2, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

// Helper formatter
const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
};
const formatPercentage = (val: number, total: number) => {
    if (total === 0) return "0%";
    return `${((val / total) * 100).toFixed(1)}%`;
}

export default async function RealisasiItemDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
    const { itemId } = await params;

    // 1. Fetch Data
    const itemRes = await getItemById(itemId);
    if (!itemRes.success || !itemRes.data) {
        return notFound();
    }
    const item = itemRes.data;

    const historyRes = await getRealisasiByItem(itemId);
    const history = historyRes.success && historyRes.data ? historyRes.data : [];

    // 2. Calculate Stats
    const target = item.totalTarget || 0;
    const realisasi = item.nominalActual || 0;
    const sisa = target - realisasi;
    // Logic: 
    // If Income (Penerimaan), Sisa > 0 means "Target Not Yet Met" (Keep going). Sisa < 0 means "Surplus" (Good).
    // If Expense (Pengeluaran), Sisa > 0 means "Budget Remaining" (Good). Sisa < 0 means "Overbudget" (Bad).
    // Let's assume generic "Variance" view for now.

    const percentage = target === 0 ? 0 : Math.min((realisasi / target) * 100, 100);

    return (
        <div className="space-y-6 container mx-auto p-6 max-w-7xl">
            <Button variant="ghost" className="pl-0 gap-2" asChild>
                <Link href="/keuangan/realisasi">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Realisasi
                </Link>
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {item.nama}
                        <Badge variant="outline" className="text-base px-2 py-0.5">{item.kode}</Badge>
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="font-medium">{item.kategori?.nama}</span>
                        <span>•</span>
                        <span>Periode {item.periode?.tahun} (Active)</span>
                    </p>
                </div>
                <Button asChild>
                    <Link href={`/keuangan/realisasi/create?itemId=${item.id}&periodeId=${item.periodeId}`}>
                        <TrendingUp className="mr-2 h-4 w-4" /> Tambah Realisasi Baru
                    </Link>
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Progress Pencapaian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-3xl font-bold">{formatRupiah(realisasi)}</span>
                                <span className="text-muted-foreground ml-2">dari target {formatRupiah(target)}</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{formatPercentage(realisasi, target)}</span>
                        </div>
                        <Progress value={percentage} className="h-4" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {sisa >= 0
                                ? `Masih kurang ${formatRupiah(sisa)} dari target.`
                                : `Melebihi target sebesar ${formatRupiah(Math.abs(sisa))}.`
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ringkasan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm">Total Transaksi</span>
                            <span className="font-bold">{history.length} kali</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm">Rata-rata</span>
                            <span className="font-bold">
                                {history.length > 0 ? formatRupiah(realisasi / history.length) : "Rp 0"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Status</span>
                            <Badge variant={percentage >= 100 ? "default" : "secondary"}>
                                {percentage >= 100 ? "Tercapai" : "Belum Tercapai"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" /> Riwayat Transaksi
                    </CardTitle>
                    <CardDescription>Daftar lengkap transaksi realisasi untuk item ini.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Keterangan</TableHead>
                                <TableHead className="text-right">Jumlah</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        Belum ada data realisasi.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((trx: any) => (
                                    <TableRow key={trx.id}>
                                        <TableCell>
                                            {new Date(trx.tanggalRealisasi).toLocaleDateString("id-ID", {
                                                day: "numeric", month: "long", year: "numeric"
                                            })}
                                        </TableCell>
                                        <TableCell>{trx.keterangan || "-"}</TableCell>
                                        <TableCell className="text-right font-medium text-blue-600">
                                            {formatRupiah(Number(trx.totalRealisasi))}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {/* TODO: Implement Delete Action via Server Action Form */}
                                            <div className="flex justify-center gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/keuangan/realisasi/edit/${trx.id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {/* Placeholder for Delete - needs Client Component or Server Action form */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
