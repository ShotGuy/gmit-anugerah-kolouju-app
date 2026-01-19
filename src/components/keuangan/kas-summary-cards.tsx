"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AkunKas {
    id: string;
    nama: string;
    deskripsi?: string;
    saldoSaatIni: number;
    isDefault: boolean;
}

interface KasSummaryCardsProps {
    akunKasList: AkunKas[];
}

export function KasSummaryCards({ akunKasList }: KasSummaryCardsProps) {
    const totalSaldo = akunKasList.reduce((acc, curr) => acc + curr.saldoSaatIni, 0);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Consolidated */}
            <Card className="bg-primary text-primary-foreground shadow-md border-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Total Saldo Kas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatRupiah(totalSaldo)}</div>
                    <p className="text-xs opacity-75 mt-1">Gabungan semua akun kas</p>
                </CardContent>
            </Card>

            {/* Individual Accounts */}
            {akunKasList.map((akun) => (
                <Card key={akun.id} className="hover:shadow-md transition-shadow cursor-default relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Wallet className="w-12 h-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                            {akun.nama}
                            {akun.isDefault && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Utama</span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{formatRupiah(akun.saldoSaatIni)}</div>
                        <div className="mt-3 flex justify-between items-center">
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]" title={akun.deskripsi || ""}>
                                {akun.deskripsi || "Tidak ada deskripsi"}
                            </p>
                            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-0 hover:bg-transparent hover:text-primary" asChild>
                                <Link href={`/keuangan/laporan?akun=${akun.id}`}>
                                    Lihat Mutasi <ArrowRight className="w-3 h-3" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
