"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
        // We use a recursive function to process items
        // We wrap everything in a transaction to ensure integrity
        await prisma.$transaction(async (tx) => {

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
        });

        revalidatePath("/keuangan");
        return { success: true, message: "Struktur anggaran berhasil disimpan" };
    } catch (error: any) {
        console.error("Save Budget Tree Error:", error);
        return { success: false, message: error.message || "Gagal menyimpan struktur anggaran" };
    }
}
