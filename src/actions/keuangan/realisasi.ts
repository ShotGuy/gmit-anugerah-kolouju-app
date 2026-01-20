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
    const akunKasId = formData.get("akunKasId") as string; // NEW
    const tanggalRealisasi = formData.get("tanggalRealisasi") as string;
    const totalRealisasi = formData.get("totalRealisasi") as string;
    const keterangan = formData.get("keterangan") as string;
    const buktiUrl = formData.get("buktiUrl") as string;
    const noBukti = formData.get("noBukti") as string; // NEW

    // Validation
    if (!itemKeuanganId) return { success: false, message: "Item Anggaran wajib dipilih" };
    if (!totalRealisasi) return { success: false, message: "Jumlah uang wajib diisi" };
    if (!akunKasId) return { success: false, message: "Akun Kas (Dompet) wajib dipilih" }; // Check this

    const amount = parseFloat(totalRealisasi);
    if (isNaN(amount)) return { success: false, message: "Format uang tidak valid" };

    try {
        const item = await (prisma as any).itemKeuangan.findUnique({
            where: { id: itemKeuanganId },
            include: { kategori: true }
        });

        if (!item) return { success: false, message: "Item Anggaran tidak valid" };

        const isIncome = item.kategori.jenis === "PENERIMAAN"; // Assuming we added 'jenis' to Kategori

        await prisma.$transaction(async (tx) => {
            // 1. Create Realisasi record
            await (tx as any).realisasiItemKeuangan.create({
                data: {
                    itemKeuanganId,
                    periodeId,
                    akunKasId, // Save the Account
                    tanggalRealisasi: new Date(tanggalRealisasi),
                    totalRealisasi: amount,
                    keterangan,
                    buktiUrl,
                    noBukti, // Save No Kwitansi
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

            // 3. Update Akun Kas Balance (NEW)
            if (akunKasId) {
                if (isIncome) {
                    await (tx as any).akunKas.update({
                        where: { id: akunKasId },
                        data: { saldoSaatIni: { increment: amount } }
                    });
                } else {
                    await (tx as any).akunKas.update({
                        where: { id: akunKasId },
                        data: { saldoSaatIni: { decrement: amount } }
                    });
                }
            }
        });

        revalidatePath("/keuangan");
        revalidatePath(`/keuangan/item/${itemKeuanganId}`);
        revalidatePath("/master-data/akun-kas"); // Revalidate balance list

        return { success: true, message: "Transaksi berhasil disimpan, Saldo Kas diperbarui." };
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
    console.log("updateRealisasi called with ID:", id);
    // console.log("FormData entries:", [...formData.entries()]); 

    const itemKeuanganId = formData.get("itemKeuanganId") as string;
    const periodeId = formData.get("periodeId") as string;
    const akunKasId = formData.get("akunKasId") as string;
    const tanggalRealisasi = formData.get("tanggalRealisasi") as string;
    const totalRealisasi = formData.get("totalRealisasi") as string;
    const keterangan = (formData.get("keterangan") as string) || null;
    const buktiUrl = (formData.get("buktiUrl") as string) || null;
    const noBukti = (formData.get("noBukti") as string) || null; // NEW

    console.log("Payload:", { itemKeuanganId, periodeId, akunKasId, amount: totalRealisasi, keterangan });

    if (!itemKeuanganId) return { success: false, message: "Item Anggaran wajib dipilih" };
    if (!totalRealisasi) return { success: false, message: "Jumlah uang wajib diisi" };

    const amount = parseFloat(totalRealisasi);
    if (isNaN(amount)) return { success: false, message: "Format uang tidak valid" };

    try {
        const existing = await (prisma as any).realisasiItemKeuangan.findUnique({
            where: { id },
            include: {
                itemKeuangan: { include: { kategori: true } },
                akunKas: true
            }
        });
        if (!existing) return { success: false, message: "Data tidak ditemukan" };

        const oldAmount = Number(existing.totalRealisasi);
        const oldItemId = existing.itemKeuanganId;
        const oldAkunKasId = existing.akunKasId;
        const oldIsIncome = existing.itemKeuangan.kategori.jenis === "PENERIMAAN";

        // Fetch New Item details to check Type (in case Item changed)
        const newItem = await (prisma as any).itemKeuangan.findUnique({
            where: { id: itemKeuanganId },
            include: { kategori: true }
        });
        if (!newItem) return { success: false, message: "Item baru tidak valid" };
        const newIsIncome = newItem.kategori.jenis === "PENERIMAAN";

        await prisma.$transaction(async (tx) => {
            console.log("Starting transaction...");
            // 1. Revert Old Stats (Item)
            console.log("Reverting old stats for Item:", oldItemId);
            await (tx as any).itemKeuangan.update({
                where: { id: oldItemId },
                data: {
                    nominalActual: { decrement: oldAmount },
                    jumlahTransaksi: { decrement: 1 },
                },
            });

            // 2. Revert Old Stats (Akun Kas)
            if (oldAkunKasId) {
                console.log("Reverting old stats for AkunKas:", oldAkunKasId);
                if (oldIsIncome) {
                    await (tx as any).akunKas.update({
                        where: { id: oldAkunKasId },
                        data: { saldoSaatIni: { decrement: oldAmount } }
                    });
                } else {
                    await (tx as any).akunKas.update({
                        where: { id: oldAkunKasId },
                        data: { saldoSaatIni: { increment: oldAmount } }
                    });
                }
            }

            // 3. Update Realisasi
            console.log("Updating Realisasi record:", id);
            await (tx as any).realisasiItemKeuangan.update({
                where: { id },
                data: {
                    itemKeuangan: { connect: { id: itemKeuanganId } },
                    periode: { connect: { id: periodeId } },
                    akunKas: akunKasId ? { connect: { id: akunKasId } } : { disconnect: true },
                    tanggalRealisasi: new Date(tanggalRealisasi),
                    totalRealisasi: amount,
                    keterangan,
                    buktiUrl,
                    noBukti,
                },
            });

            // 4. Apply New Stats (Item)
            console.log("Applying new stats for Item:", itemKeuanganId);
            await (tx as any).itemKeuangan.update({
                where: { id: itemKeuanganId },
                data: {
                    nominalActual: { increment: amount },
                    jumlahTransaksi: { increment: 1 },
                },
            });

            // 5. Apply New Stats (Akun Kas)
            if (akunKasId) {
                console.log("Applying new stats for AkunKas:", akunKasId);
                if (newIsIncome) {
                    await (tx as any).akunKas.update({
                        where: { id: akunKasId },
                        data: { saldoSaatIni: { increment: amount } }
                    });
                } else {
                    await (tx as any).akunKas.update({
                        where: { id: akunKasId },
                        data: { saldoSaatIni: { decrement: amount } }
                    });
                }
            }
            console.log("Transaction completed successfully.");
        });

        revalidatePath("/keuangan");
        revalidatePath(`/keuangan/realisasi/${itemKeuanganId}`);
        revalidatePath("/master-data/akun-kas");
        return { success: true, message: "Transaksi berhasil diperbarui" };
    } catch (error: any) {
        console.error("Update Error Detailed:", error);
        return { success: false, message: `Gagal memperbarui transaksi: ${error.message}` };
    }
}

export async function deleteRealisasi(id: string) {
    try {
        // Check existing to get amount/itemId for rollback
        const realisasi = await (prisma as any).realisasiItemKeuangan.findUnique({
            where: { id },
            include: {
                itemKeuangan: { include: { kategori: true } },
            }
        });

        if (!realisasi) return { success: false, message: "Data tidak ditemukan" };

        const { itemKeuanganId, totalRealisasi, akunKasId } = realisasi;
        const isIncome = realisasi.itemKeuangan.kategori.jenis === "PENERIMAAN";
        const amount = Number(totalRealisasi);

        await prisma.$transaction(async (tx) => {
            // 1. Delete
            await (tx as any).realisasiItemKeuangan.delete({ where: { id } });

            // 2. Rollback stats (Item)
            await (tx as any).itemKeuangan.update({
                where: { id: itemKeuanganId },
                data: {
                    nominalActual: { decrement: amount },
                    jumlahTransaksi: { decrement: 1 },
                },
            });

            // 3. Rollback stats (Akun Kas)
            if (akunKasId) {
                if (isIncome) {
                    // Was Income (added to wallet), so removing it should Decrement wallet
                    await (tx as any).akunKas.update({
                        where: { id: akunKasId },
                        data: { saldoSaatIni: { decrement: amount } }
                    });
                } else {
                    // Was Expense (removed from wallet), so removing it should Increment wallet
                    await (tx as any).akunKas.update({
                        where: { id: akunKasId },
                        data: { saldoSaatIni: { increment: amount } }
                    });
                }
            }
        });

        revalidatePath("/keuangan");
        revalidatePath("/master-data/akun-kas");
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
    limit = 50,
    q
}: {
    periodeId?: string;
    kategoriId?: string;
    itemKeuanganId?: string;
    limit?: number;
    q?: string;
}) {
    try {
        const where: any = {};
        if (periodeId) where.periodeId = periodeId;
        // Filter by Kategori requires joining ItemKeuangan
        if (kategoriId) {
            where.itemKeuangan = { kategoriId };
        }
        if (itemKeuanganId) where.itemKeuanganId = itemKeuanganId;

        if (q) {
            where.OR = [
                { keterangan: { contains: q, mode: "insensitive" } },
                { itemKeuangan: { nama: { contains: q, mode: "insensitive" } } },
                { itemKeuangan: { kode: { contains: q, mode: "insensitive" } } }
            ];
        }

        const data = await (prisma as any).realisasiItemKeuangan.findMany({
            where,
            include: {
                itemKeuangan: true,
                periode: true,
            },
            orderBy: { tanggalRealisasi: "desc" },
            take: limit,
        });

        const serializedData = data.map((item: any) => ({
            ...item,
            totalRealisasi: Number(item.totalRealisasi),
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            tanggalRealisasi: item.tanggalRealisasi.toISOString(),
            periode: {
                ...item.periode,
                createdAt: item.periode.createdAt.toISOString(),
                updatedAt: item.periode.updatedAt.toISOString(),
                tanggalMulai: item.periode.tanggalMulai.toISOString(),
                tanggalAkhir: item.periode.tanggalAkhir.toISOString(),
            },
            itemKeuangan: {
                ...item.itemKeuangan,
                nominalSatuan: Number(item.itemKeuangan.nominalSatuan),
                totalTarget: Number(item.itemKeuangan.totalTarget),
                nominalActual: Number(item.itemKeuangan.nominalActual),
                createdAt: item.itemKeuangan.createdAt.toISOString(),
                updatedAt: item.itemKeuangan.updatedAt.toISOString(),
            }
        }));

        return { success: true, data: serializedData };
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
        // 1. Build Filter for ITEMS
        // Remove isActive filter to ensure we calculate EVERYTHING that exists
        const whereItem: any = {};
        if (periodeId) whereItem.periodeId = periodeId;
        if (kategoriId) whereItem.kategoriId = kategoriId;
        if (itemKeuanganId) whereItem.id = itemKeuanganId;

        // 2. Fetch Items
        // Order by LEVEL desc so we process deepest children first (for rollup)
        const items = await (prisma as any).itemKeuangan.findMany({
            where: whereItem,
            orderBy: [
                { level: 'desc' }, // Process children before parents
                { kode: 'asc' }
            ],
            include: { kategori: true }
        });

        // 3. Fetch ACTUAL Realization Data via Aggregation (Group By)
        const whereRealisasi: any = {};
        if (periodeId) whereRealisasi.periodeId = periodeId;

        const realisasiAggregations = await (prisma as any).realisasiItemKeuangan.groupBy({
            by: ['itemKeuanganId'],
            where: whereRealisasi,
            _sum: {
                totalRealisasi: true
            }
        });

        // Create a Map with INITIAL values (Direct Realization)
        // Structure: ItemID -> { target, realisasi }
        // We will mutate this map during Rollup
        const statsMap = new Map<string, { target: number, realisasi: number, parentId: string | null }>();

        // Initialize Map
        items.forEach((item: any) => {
            // Find direct realization for this item
            const agg = realisasiAggregations.find((a: any) => a.itemKeuanganId === item.id);
            const directRealisasi = agg ? Number(agg._sum.totalRealisasi) : 0;
            const directTarget = Number(item.totalTarget) || 0;

            statsMap.set(item.id, {
                target: directTarget,
                realisasi: directRealisasi,
                parentId: item.parentId
            });
        });

        // 4. PERFORM HIERARCHY ROLLUP (Bottom-Up)
        // Since 'items' is sorted by level DESC, we are guaranteed to process children before parents.
        items.forEach((item: any) => {
            if (item.parentId && statsMap.has(item.parentId)) {
                const myStats = statsMap.get(item.id);
                const parentStats = statsMap.get(item.parentId);

                if (myStats && parentStats) {
                    parentStats.target += myStats.target;
                    parentStats.realisasi += myStats.realisasi;
                    // Note: We modifying the object reference in the Map, so it updates validly.
                }
            }
        });

        // 5. Calculate Final Summary (e.g. Total of Root Items)
        let totalTargetAmount = 0;
        let totalRealisasiAmount = 0;
        let totalItems = 0;
        let itemsTargetAchieved = 0;

        // Note: For total summary, we should only sum ROOT items (level 1) to avoid double counting
        // OR, simply sum the final values of level 1 items.

        // Map back to array format
        const summaryItems = items.map((item: any) => {
            const stats = statsMap.get(item.id) || { target: 0, realisasi: 0 };
            const target = stats.target;
            const realisasi = stats.realisasi;

            const variance = realisasi - target;
            const percentage = target === 0 ? (realisasi > 0 ? 100 : 0) : (realisasi / target) * 100;
            const isAchieved = percentage >= 100;

            // Only add to GLOBAL Totals if it's a Root item (or filtered root) 
            // to prevent double counting in the Big Summary Card
            if (!item.parentId || item.level === 1) {
                totalTargetAmount += target;
                totalRealisasiAmount += realisasi;
            }

            totalItems++; // This is count of all nodes
            if (isAchieved) itemsTargetAchieved++;

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

export async function getRealisasiByItem(itemKeuanganId: string) {
    try {
        const data = await (prisma as any).realisasiItemKeuangan.findMany({
            where: { itemKeuanganId },
            include: {
                akunKas: true,
                periode: true,
            },
            orderBy: { tanggalRealisasi: "desc" },
        });
        return { success: true, data };
    } catch (error) {
        console.error("Get Realisasi By Item Error:", error);
        return { success: false, data: [] };
    }
}

export async function recalculateItemStats() {
    try {
        // 1. Reset all nominalActual to 0
        await prisma.itemKeuangan.updateMany({
            data: { nominalActual: 0, jumlahTransaksi: 0 }
        });

        // 2. Aggregate from Realisasi
        const aggregations = await prisma.realisasiItemKeuangan.groupBy({
            by: ['itemKeuanganId'],
            _sum: { totalRealisasi: true },
            _count: { id: true }
        });

        // 3. Update each item
        for (const agg of aggregations) {
            if (agg.itemKeuanganId) {
                await prisma.itemKeuangan.update({
                    where: { id: agg.itemKeuanganId },
                    data: {
                        nominalActual: agg._sum.totalRealisasi || 0,
                        jumlahTransaksi: agg._count.id || 0
                    }
                });
            }
        }
        return { success: true, message: "Sinkronisasi data berhasil" };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Gagal sinkronisasi" };
    }
}
