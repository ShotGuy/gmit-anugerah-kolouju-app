"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

interface BudgetItemInput {
    id: string; // "temp_..." or UUID
    kode: string;
    nama: string;
    deskripsi?: string | null;
    level: number;
    urutan: number;
    targetFrekuensi?: number | null;
    satuanFrekuensi?: string | null;
    nominalSatuan?: number | null;
    totalTarget?: number | null;
    // We don't need parentId here because hierarchy is defined by the tree structure passed to this function
    children?: BudgetItemInput[];
}

export async function saveBudgetTree(
    periodeId: string,
    kategoriId: string,
    items: BudgetItemInput[]
) {
    if (!periodeId || !kategoriId) {
        return { success: false, message: "Periode dan Kategori harus dipilih" };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Get all IDs present in the new payload (excluding temp ones)
            const getIds = (nodes: BudgetItemInput[]): string[] => {
                return nodes.reduce((acc, node) => {
                    const ids = node.id.startsWith("temp_") ? [] : [node.id];
                    return [...acc, ...ids, ...(node.children ? getIds(node.children) : [])];
                }, [] as string[]);
            };
            const activeIds = getIds(items);

            // 2. Fetch Existing Items to find deleted ones
            const existingItems = await (tx as any).itemKeuangan.findMany({
                where: { periodeId, kategoriId },
                select: { id: true }
            });

            const existingIds = existingItems.map((i: any) => i.id);
            const toDeleteIds = existingIds.filter((id: string) => !activeIds.includes(id));
            const toUpdateIds = existingIds.filter((id: string) => activeIds.includes(id));

            // 3. Delete Steps (Check consistency)
            if (toDeleteIds.length > 0) {
                // Check for transactions first
                const hasTransactions = await (tx as any).realisasiItemKeuangan.findFirst({
                    where: { itemKeuanganId: { in: toDeleteIds } }
                });

                if (hasTransactions) {
                    throw new Error("Beberapa item yang dihapus memiliki riwayat transaksi. Hapus transaksi terlebih dahulu.");
                }

                // Delete items
                await (tx as any).itemKeuangan.deleteMany({
                    where: { id: { in: toDeleteIds } }
                });
            }

            // 3.5. TEMP FIX: Mass Update Codes to avoid Unique Conflict
            // If we are swapping codes or shifting, we might hit unique constraint during the loop.
            // So we set all existing items to temporary codes first.
            if (toUpdateIds.length > 0) {
                // Use Raw SQL for performance and to avoid multiple round-trips causing timeout
                await (tx as any).$executeRaw(
                    Prisma.sql`UPDATE "item_keuangan" SET "kode" = 'TMP_' || substring("id", 1, 8) WHERE "id" IN (${Prisma.join(toUpdateIds)})`
                );
            }

            // 4. Process Upserts (Existing Logic)
            const processItems = async (itemList: BudgetItemInput[], parentId: string | null) => {
                for (const item of itemList) {
                    let savedId = item.id;

                    // Prepare data object
                    const data = {
                        periodeId,
                        kategoriId,
                        parentId,
                        kode: item.kode,
                        nama: item.nama,
                        deskripsi: item.deskripsi,
                        level: item.level,
                        urutan: item.urutan,
                        targetFrekuensi: item.targetFrekuensi,
                        satuanFrekuensi: item.satuanFrekuensi,
                        nominalSatuan: item.nominalSatuan,
                        totalTarget: item.totalTarget,
                        isActive: true
                    };

                    if (item.id.startsWith("temp_")) {
                        // CREATE
                        const newItem = await (tx as any).itemKeuangan.create({
                            data: data
                        });
                        savedId = newItem.id;
                    } else {
                        // UPDATE
                        await (tx as any).itemKeuangan.update({
                            where: { id: item.id },
                            data: data
                        });
                    }

                    // Process Children
                    if (item.children && item.children.length > 0) {
                        await processItems(item.children, savedId);
                    }
                }
            };

            await processItems(items, null);
        }, {
            maxWait: 5000, // default: 2000
            timeout: 20000 // default: 5000
        });

        revalidatePath("/keuangan");
        return { success: true, message: "Struktur anggaran berhasil disimpan (Sinkronisasi Selesai)" };
    } catch (error: any) {
        console.error("Save Budget Tree Error:", error);
        return { success: false, message: error.message || "Gagal menyimpan struktur anggaran" };
    }
}
