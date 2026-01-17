import { Suspense } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { getRealisasiList, getRealisasiSummary } from "@/actions/keuangan/realisasi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "@/components/keuangan/summary-card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Filter, Search, Plus, Trash2, Edit, Target,
    TrendingUp, TrendingDown, BarChart3, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// --- Formatter ---
const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
};
const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

export default async function RealisasiKeuanganPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;

    // 1. Get Filters from URL
    const periodeId = typeof params.periodeId === "string" ? params.periodeId : undefined;
    const kategoriId = typeof params.kategoriId === "string" ? params.kategoriId : undefined;
    const limit = typeof params.limit === "string" ? parseInt(params.limit) : 50;

    // 2. Fetch Initial Data (Periodes & Kategoris for Filter)
    const [periodes, kategoris] = await Promise.all([
        (prisma as any).periodeAnggaran.findMany({ where: { isActive: true }, orderBy: { tahun: "desc" } }),
        (prisma as any).kategoriKeuangan.findMany({ where: { isActive: true }, orderBy: { kode: "asc" } })
    ]);

    // Use latest period if none selected
    const activePeriodeId = periodeId || (periodes.length > 0 ? periodes[0].id : "");

    // 3. Fetch Realisasi Data
    const [summaryRes, historyRes] = await Promise.all([
        getRealisasiSummary({ periodeId: activePeriodeId, kategoriId }),
        getRealisasiList({ periodeId: activePeriodeId, kategoriId, limit })
    ]);

    const summaryData = summaryRes.success && summaryRes.data ? summaryRes.data : null;
    const historyData = historyRes.success ? historyRes.data : [];

    return (
        <div className="space-y-6 container mx-auto p-6 max-w-7xl">
            <PageHeader
                title="Manajemen Realisasi Keuangan"
                description="Kelola dan pantau realisasi vs target anggaran"
                breadcrumb={[
                    { label: "Admin", href: "/dashboard" },
                    { label: "Keuangan", href: "/keuangan" },
                    { label: "Realisasi" },
                ]}
            // actions prop not supported yet?
            // actions={[...]} 
            />
            <div className="flex justify-end">
                <Button asChild>
                    <Link href="/keuangan/realisasi/create">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Transaksi
                    </Link>
                </Button>
            </div>

            {/* --- Filter Section --- */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Filter className="h-4 w-4" /> Filter Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Period Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Periode Anggaran</label>
                            <SelectTriggerFilter
                                name="periodeId"
                                options={periodes.map((p: any) => ({ label: p.nama, value: p.id }))}
                                defaultValue={activePeriodeId}
                            />
                        </div>
                        {/* Kategori Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Kategori</label>
                            <SelectTriggerFilter
                                name="kategoriId"
                                options={[{ label: "Semua Kategori", value: "all" }, ...kategoris.map((k: any) => ({ label: k.nama, value: k.id }))]}
                                defaultValue={kategoriId || "all"}
                            />
                        </div>
                        {/* Search (Client-side usually, but we can make it submit) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cari Item</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Cari kode atau nama..." className="pl-9" name="q" defaultValue={typeof params.q === "string" ? params.q : ""} />
                            </div>
                        </div>
                        {/* Hidden submit button for Enter key */}
                        <button type="submit" className="hidden" />
                    </form>
                </CardContent>
            </Card>

            {/* --- Summary Cards --- */}
            {summaryData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard
                        title="Total Target"
                        value={formatRupiah(summaryData.summary.totalTargetAmount)}
                        icon={Target}
                        iconColor="text-blue-600"
                        bgColor="bg-blue-100/50"
                    />
                    <SummaryCard
                        title="Total Realisasi"
                        value={formatRupiah(summaryData.summary.totalRealisasiAmount)}
                        icon={TrendingUp}
                        iconColor="text-emerald-600"
                        bgColor="bg-emerald-100/50"
                    />
                    <SummaryCard
                        title="Selisih (Variance)"
                        value={formatRupiah(summaryData.summary.totalVarianceAmount)}
                        icon={summaryData.summary.totalVarianceAmount >= 0 ? TrendingUp : TrendingDown}
                        iconColor={summaryData.summary.totalVarianceAmount >= 0 ? "text-emerald-600" : "text-rose-600"}
                        textColor={summaryData.summary.totalVarianceAmount >= 0 ? "text-emerald-600" : "text-rose-600"}
                        bgColor={summaryData.summary.totalVarianceAmount >= 0 ? "bg-emerald-100/50" : "bg-rose-100/50"}
                    />
                    <SummaryCard
                        title="Target Tercapai"
                        value={`${summaryData.summary.itemsTargetAchieved} / ${summaryData.summary.totalItems}`}
                        subtext="Item Anggaran"
                        icon={BarChart3}
                        iconColor="text-violet-600"
                        bgColor="bg-violet-100/50"
                    />
                </div>
            )}

            {/* --- Item Summary Table --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan Realisasi per Item Anggaran</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode & Nama Item</TableHead>
                                    <TableHead className="text-right">Target</TableHead>
                                    <TableHead className="text-right">Realisasi</TableHead>
                                    <TableHead className="text-right">Selisih</TableHead>
                                    <TableHead className="text-center">Capaian</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summaryData?.items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada data item anggaran untuk periode ini.</TableCell>
                                    </TableRow>
                                ) : (
                                    summaryData?.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{item.nama}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{item.kode}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">{formatRupiah(item.totalTarget)}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap font-medium text-blue-600">{formatRupiah(item.totalRealisasiAmount)}</TableCell>
                                            <TableCell className={`text-right whitespace-nowrap font-semibold ${item.varianceAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatRupiah(item.varianceAmount)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={item.isTargetAchieved ? "default" : "secondary"} className={item.isTargetAchieved ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                                                    {formatPercentage(item.achievementPercentage)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/keuangan/realisasi/${item.id}`}>
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* --- Recent History Table --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Transaksi Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead>Item Anggaran</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada transaksi realisasi.</TableCell>
                                    </TableRow>
                                ) : (
                                    historyData.map((trx: any) => (
                                        <TableRow key={trx.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(trx.tanggalRealisasi).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate" title={trx.keterangan || ""}>
                                                {trx.keterangan || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{trx.itemKeuangan?.nama}</span>
                                                    <span className="text-xs text-muted-foreground">{trx.itemKeuangan?.kode}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-green-600">
                                                {formatRupiah(Number(trx.totalRealisasi))}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {/* TODO: Add Edit/Delete Actions */}
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/keuangan/realisasi/edit/${trx.id}`}>Edit</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Client Component Wrapper for Filters (Simplified for now) ---
// Note: In Next.js App Router, using <form> with get method automatically updates URL params.
// --- Client Component Wrapper for Filters ---
// --- Client Component Wrapper for Filters ---
function SelectTriggerFilter({ name, options, defaultValue }: { name: string, options: { label: string, value: string }[], defaultValue: string }) {
    return (
        <select
            name={name}
            defaultValue={defaultValue}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    )
}

// Local SummaryCard removed, using imported one.
