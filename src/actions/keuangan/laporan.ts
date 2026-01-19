"use server";

import { prisma } from "@/lib/prisma";

export type LaporanKasParams = {
    akunKasId?: string;
    startDate: Date;
    endDate: Date;
};

export type MutasiItem = {
    id: string;
    tanggal: Date;
    uraian: string; // Mapped from keterangan
    debet: number; // Penerimaan
    kredit: number; // Pengeluaran
    saldoBerjalan: number;
    kodeItem?: string; // Optional context
    namaItem?: string;
    noBukti?: string; // New field
};


export type LaporanKasResult = {
    saldoAwal: number;
    totalDebet: number;
    totalKredit: number;
    saldoAkhir: number;
    items: MutasiItem[];
    periodeLabel: string;
};

export async function getLaporanKas(params: LaporanKasParams): Promise<{ success: boolean; data?: LaporanKasResult; message?: string }> {
    try {
        const { akunKasId, startDate, endDate } = params;

        // Ensure dates are boundaries
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // 1. Validate Account
        if (!akunKasId) return { success: false, message: "Akun Kas harus dipilih" };
        const akun = await (prisma as any).akunKas.findUnique({ where: { id: akunKasId } });
        if (!akun) return { success: false, message: "Akun Kas tidak ditemukan" };

        const currentSaldo = Number(akun.saldoSaatIni);

        // 2. Rollback Logic: SaldoAkhirPeriode = CurrentSaldo - (Transactions > endDate)
        // Note: Relation 'realisasiItemKeuangan' must be queried.
        const transactionsAfter = await (prisma as any).realisasiItemKeuangan.findMany({
            where: {
                akunKasId,
                tanggalRealisasi: { gt: end },
            },
            include: { itemKeuangan: { include: { kategori: true } } }
        });

        let movementAfter = 0;
        transactionsAfter.forEach((tx: any) => {
            const amount = Number(tx.totalRealisasi);
            const isIncome = tx.itemKeuangan.kategori.jenis === "PENERIMAAN";
            if (isIncome) movementAfter += amount;
            else movementAfter -= amount;
        });

        const saldoAkhirPeriode = currentSaldo - movementAfter;

        // 3. Fetch Transactions WITHIN Period
        const transactionsInPeriod = await (prisma as any).realisasiItemKeuangan.findMany({
            where: {
                akunKasId,
                tanggalRealisasi: {
                    gte: start,
                    lte: end,
                },
            },
            include: { itemKeuangan: { include: { kategori: true } } },
            orderBy: { tanggalRealisasi: "asc" }
        });

        let totalDebet = 0;
        let totalKredit = 0;
        let runningMovement = 0; // Movement within this period

        transactionsInPeriod.forEach((tx: any) => {
            const amount = Number(tx.totalRealisasi);
            const isIncome = tx.itemKeuangan.kategori.jenis === "PENERIMAAN";
            if (isIncome) {
                totalDebet += amount;
                runningMovement += amount;
            } else {
                totalKredit += amount;
                runningMovement -= amount;
            }
        });

        // Saldo Awal = Saldo Akhir Periode - Movement in Period
        const saldoAwalPeriode = saldoAkhirPeriode - runningMovement;

        // 4. Build List with Running Balance
        // We start from Saldo Awal and add/sub each tx
        let currentRunning = saldoAwalPeriode;

        const items: MutasiItem[] = transactionsInPeriod.map((tx: any) => {
            const amount = Number(tx.totalRealisasi);
            const isIncome = tx.itemKeuangan.kategori.jenis === "PENERIMAAN";

            if (isIncome) currentRunning += amount;
            else currentRunning -= amount;

            return {
                id: tx.id,
                tanggal: tx.tanggalRealisasi,
                uraian: tx.keterangan || tx.itemKeuangan?.nama || "Tanpa Keterangan", // Default to Item Name if empty
                debet: isIncome ? amount : 0,
                kredit: !isIncome ? amount : 0,
                saldoBerjalan: currentRunning,
                kodeItem: tx.itemKeuangan?.kode,
                namaItem: tx.itemKeuangan?.nama,
                noBukti: tx.noBukti,
            };
        });

        return {
            success: true,
            data: {
                saldoAwal: saldoAwalPeriode,
                totalDebet,
                totalKredit,
                saldoAkhir: saldoAkhirPeriode,
                items,
                periodeLabel: `${start.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })} - ${end.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}`
            }
        };

    } catch (error: any) {
        console.error("Error generating report:", error);
        return { success: false, message: error.message };
    }
}
