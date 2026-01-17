"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Types ---
export type RealisasiState = {
    errors?: {
        itemKeuanganId?: string[];
        tanggalRealisasi?: string[];
        totalRealisasi?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
};

// --- Actions ---

export async function createRealisasi(
    prevState: RealisasiState,
    formData: FormData
): Promise<RealisasiState> {
    const itemKeuanganId = formData.get("itemKeuanganId") as string;
    const periodeId = formData.get("periodeId") as string;
    const tanggalRealisasi = formData.get("tanggalRealisasi") as string;
    const totalRealisasi = formData.get("totalRealisasi") as string; // String number
    const keterangan = formData.get("keterangan") as string;
    const buktiUrl = formData.get("buktiUrl") as string;

    // Validation
    if (!itemKeuanganId) return { success: false, message: "Item Anggaran wajib dipilih" };
    if (!totalRealisasi) return { success: false, message: "Jumlah uang wajib diisi" };

    const amount = parseFloat(totalRealisasi);
    if (isNaN(amount)) return { success: false, message: "Format uang tidak valid" };

    try {
        // Transaction to ensure atomicity (Create Realisasi + Update Item Summary)
        await prisma.$transaction(async (tx) => {
            // 1. Create Realisasi record
            await (tx as any).realisasiItemKeuangan.create({
                data: {
                    itemKeuanganId,
                    periodeId,
                    tanggalRealisasi: new Date(tanggalRealisasi),
                    totalRealisasi: amount,
                    keterangan,
                    buktiUrl,
                },
            });

            // 2. Update Item Actuals
            await (tx as any).itemKeuangan.update({
                where: { id: itemKeuanganId },
                data: {
                    nominalActual: { increment: amount },
                    jumlahTransaksi: { increment: 1 },
                },
            });
        });

        revalidatePath("/keuangan");
        revalidatePath(`/keuangan/item/${itemKeuanganId}`);
        return { success: true, message: "Transaksi berhasil disimpan" };
    } catch (error) {
        console.error("Create Realisasi Error:", error);
        return { success: false, message: "Gagal menyimpan transaksi" };
    }
}

// Update Action
export async function updateRealisasi(
    id: string,
    prevState: RealisasiState,
    formData: FormData
): Promise<RealisasiState> {
    const itemKeuanganId = formData.get("itemKeuanganId") as string;
    const periodeId = formData.get("periodeId") as string;
    const tanggalRealisasi = formData.get("tanggalRealisasi") as string;
    const totalRealisasi = formData.get("totalRealisasi") as string;
    const keterangan = formData.get("keterangan") as string;
    const buktiUrl = formData.get("buktiUrl") as string;

    if (!itemKeuanganId) return { success: false, message: "Item Anggaran wajib dipilih" };
    if (!totalRealisasi) return { success: false, message: "Jumlah uang wajib diisi" };

    const amount = parseFloat(totalRealisasi);
    if (isNaN(amount)) return { success: false, message: "Format uang tidak valid" };

    try {
        const existing = await (prisma as any).realisasiItemKeuangan.findUnique({ where: { id } });
        if (!existing) return { success: false, message: "Data tidak ditemukan" };

        const oldAmount = Number(existing.totalRealisasi);
        const oldItemId = existing.itemKeuanganId;

        await prisma.$transaction(async (tx) => {
            // 1. Revert Old Stats
            await (tx as any).itemKeuangan.update({
                where: { id: oldItemId },
                data: {
                    nominalActual: { decrement: oldAmount },
                    jumlahTransaksi: { decrement: 1 },
                },
            });

            // 2. Update Realisasi
            await (tx as any).realisasiItemKeuangan.update({
                where: { id },
                data: {
                    itemKeuanganId,
                    periodeId,
                    tanggalRealisasi: new Date(tanggalRealisasi),
                    totalRealisasi: amount,
                    keterangan,
                    buktiUrl,
                },
            });

            // 3. Apply New Stats
            await (tx as any).itemKeuangan.update({
                where: { id: itemKeuanganId },
                data: {
                    nominalActual: { increment: amount },
                    jumlahTransaksi: { increment: 1 },
                },
            });
        });

        revalidatePath("/keuangan");
        revalidatePath(`/keuangan/realisasi/${itemKeuanganId}`);
        return { success: true, message: "Transaksi berhasil diperbarui" };
    } catch (error) {
        console.error("Update Error:", error);
        return { success: false, message: "Gagal memperbarui transaksi" };
    }
}

export async function deleteRealisasi(id: string) {
    try {
        // Check existing to get amount/itemId for rollback
        const realisasi = await (prisma as any).realisasiItemKeuangan.findUnique({
            where: { id },
        });

        if (!realisasi) return { success: false, message: "Data tidak ditemukan" };

        const { itemKeuanganId, totalRealisasi } = realisasi;

        await prisma.$transaction(async (tx) => {
            // 1. Delete
            await (tx as any).realisasiItemKeuangan.delete({ where: { id } });

            // 2. Rollback stats
            await (tx as any).itemKeuangan.update({
                where: { id: itemKeuanganId },
                data: {
                    nominalActual: { decrement: totalRealisasi },
                    jumlahTransaksi: { decrement: 1 },
                },
            });
        });

        revalidatePath("/keuangan");
        return { success: true, message: "Transaksi berhasil dihapus" };
    } catch (error) {
        return { success: false, message: "Gagal menghapus transaksi" };
    }
}

// --- Helpers ---
const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
};

// --- Extended Actions ---

export async function getRealisasiList({
    periodeId,
    kategoriId,
    itemKeuanganId,
    limit = 50
}: {
    periodeId?: string;
    kategoriId?: string;
    itemKeuanganId?: string;
    limit?: number;
}) {
    try {
        const where: any = {};
        if (periodeId) where.periodeId = periodeId;
        // Filter by Kategori requires joining ItemKeuangan
        if (kategoriId) {
            where.itemKeuangan = { kategoriId };
        }
        if (itemKeuanganId) where.itemKeuanganId = itemKeuanganId;

        const data = await (prisma as any).realisasiItemKeuangan.findMany({
            where,
            include: {
                itemKeuangan: true,
                periode: true,
            },
            orderBy: { tanggalRealisasi: "desc" },
            take: limit,
        });

        return { success: true, data };
    } catch (error) {
        console.error("Get Realisasi List Error:", error);
        return { success: false, data: [] };
    }
}

export async function getRealisasiSummary({
    periodeId,
    kategoriId,
    itemKeuanganId
}: {
    periodeId?: string;
    kategoriId?: string;
    itemKeuanganId?: string;
}) {
    try {
        // 1. Build Filter
        const whereItem: any = { isActive: true };
        if (periodeId) whereItem.periodeId = periodeId;
        if (kategoriId) whereItem.kategoriId = kategoriId;
        if (itemKeuanganId) whereItem.id = itemKeuanganId;

        // 2. Fetch Items with their stats
        // 2. Fetch Items with their stats
        // Note: ItemKeuangan has 'nominalActual' cached, which makes this fast.
        const items = await (prisma as any).itemKeuangan.findMany({
            where: whereItem,
            orderBy: { kode: "asc" },
        });

        // 3. Calculate Summary
        let totalTargetAmount = 0;
        let totalRealisasiAmount = 0;
        let totalItems = 0;
        let itemsTargetAchieved = 0;

        const summaryItems = items.map((item: any) => {
            const target = Number(item.totalTarget) || 0;
            const realisasi = Number(item.nominalActual) || 0;
            const variance = realisasi - target; // Positive means surplus/achieved if Income, check logic context later.
            // For now assuming:
            // If Kategori is TYPE_INCOME (Penerimaan): Realisasi >= Target is Good.
            // If Kategori is TYPE_EXPENSE (Pengeluaran): Realisasi <= Target is Good.
            // But usually 'Target Tercapai' means Realisasi >= Target for income.
            // Let's stick to generic: Achieved if realisasi >= target.

            const percentage = target === 0 ? (realisasi > 0 ? 100 : 0) : (realisasi / target) * 100;
            const isAchieved = percentage >= 100;

            totalTargetAmount += target;
            totalRealisasiAmount += realisasi;
            totalItems++;
            if (isAchieved) itemsTargetAchieved++;

            // Serialize Prisma Decimals to prevent Client Component errors
            return {
                id: item.id,
                kategoriId: item.kategoriId,
                periodeId: item.periodeId,
                parentId: item.parentId,
                kode: item.kode,
                nama: item.nama,
                deskripsi: item.deskripsi,
                level: item.level,
                urutan: item.urutan,
                targetFrekuensi: item.targetFrekuensi,
                satuanFrekuensi: item.satuanFrekuensi,
                nominalSatuan: Number(item.nominalSatuan) || 0,
                // Calculated fields
                totalTarget: target,
                totalRealisasiAmount: realisasi,
                varianceAmount: variance,
                achievementPercentage: percentage,
                isTargetAchieved: isAchieved,
                // Relation counts if needed (none for now in this view)
                isActive: item.isActive,
                createdAt: item.createdAt.toISOString(),
                updatedAt: item.updatedAt.toISOString(),
            };
        });

        return {
            success: true,
            data: {
                summary: {
                    totalTargetAmount,
                    totalRealisasiAmount,
                    totalVarianceAmount: totalRealisasiAmount - totalTargetAmount,
                    totalItems,
                    itemsTargetAchieved,
                },
                items: summaryItems
            }
        };

    } catch (error) {
        console.error("Get Summary Error:", error);
        return { success: false, message: "Gagal memuat ringkasan" };
    }
}

export async function getRealisasiById(id: string) {
    try {
        const data = await (prisma as any).realisasiItemKeuangan.findUnique({
            where: { id },
            include: {
                itemKeuangan: {
                    include: {
                        kategori: true,
                        periode: true
                    }
                },
                periode: true
            }
        });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: "Data tidak ditemukan" };
    }
}
