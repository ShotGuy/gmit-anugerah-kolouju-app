"use server";

import { prisma as prismaBase } from "@/lib/prisma";
const prisma = prismaBase as any;
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export type ItemKeuanganState = {
    errors?: {
        kategoriId?: string[];
        periodeId?: string[];
        nama?: string[];
        kode?: string[];
        targetFrekuensi?: string[];
        satuanFrekuensi?: string[];
        nominalSatuan?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
};

// ... (existing code)

// Helper type for the query result
// Helper type for the query result
// Using inferred type from the query result to avoid explicit type name issues
type ItemWithRelations = any;

// Helper: Generate hierarchical code
async function generateKode(
    kategoriId: string,
    periodeId: string,
    level: number,
    parentId: string | null,
    parentKode: string | null
): Promise<string> {
    const siblingCount = await prisma.itemKeuangan.count({
        where: {
            kategoriId,
            periodeId,
            parentId: parentId || null,
            level,
            isActive: true,
        },
    });

    const index = siblingCount; // 0-based index

    if (level === 1) {
        // Level 1: Depends on Kategori Kode? Or just A, B, C?
        // Let's assume we use Kategori Kode as prefix if available, or just letters.
        // The reference used: `kategori.kode` as base for Level 1.
        const kategori = await prisma.kategoriKeuangan.findUnique({
            where: { id: kategoriId },
        });
        // If multiple root items in same category, we might want A1, A2?
        // Reference implementation: `finalKode = ${kategori.kode}`.
        // But this implies only 1 root item per category?
        // Let's stick to reference: Level 1 = Kategori Kode.
        // Wait, if there are multiple root items, they would clash.
        // Let's append index if count > 0.
        if (!kategori) return "UNK";
        return index === 0 ? kategori.kode : `${kategori.kode}.${index + 1}`;
    } else {
        // Level 2+: ParentKode.ChildIndex
        return `${parentKode}.${index + 1}`;
    }
}

export async function createItemKeuangan(
    prevState: ItemKeuanganState,
    formData: FormData
): Promise<ItemKeuanganState> {
    const kategoriId = formData.get("kategoriId") as string;
    const periodeId = formData.get("periodeId") as string;
    const parentId = (formData.get("parentId") as string) || null;
    const nama = formData.get("nama") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const targetFrekuensi = formData.get("targetFrekuensi") as string;
    const satuanFrekuensi = formData.get("satuanFrekuensi") as string;
    const nominalSatuan = formData.get("nominalSatuan") as string;
    const customKode = formData.get("kode") as string;

    const errors: ItemKeuanganState["errors"] = {};
    if (!kategoriId) errors.kategoriId = ["Kategori wajib dipilih"];
    if (!periodeId) errors.periodeId = ["Periode wajib dipilih"];
    if (!nama) errors.nama = ["Nama item wajib diisi"];

    if (Object.keys(errors).length > 0) return { errors, success: false };

    try {
        // 1. Validate Parent & Determine Level
        let level = 1;
        let parentKode = null;

        if (parentId) {
            const parent = await prisma.itemKeuangan.findUnique({
                where: { id: parentId },
            });
            if (!parent) return { message: "Parent item tidak ditemukan", success: false };
            if (parent.kategoriId !== kategoriId)
                return { message: "Parent harus dalam kategori yang sama", success: false };

            level = parent.level + 1;
            parentKode = parent.kode;
        }

        // 2. Generate Code
        let kode = customKode;
        if (!kode) {
            kode = await generateKode(kategoriId, periodeId, level, parentId, parentKode);
        }

        // 3. Validation: Check Duplicate Code
        const existing = await prisma.itemKeuangan.findFirst({
            where: { kategoriId, periodeId, kode },
        });
        if (existing) {
            return {
                success: false,
                message: `Kode ${kode} sudah digunakan dalam periode ini.`,
            };
        }

        // 4. Calculate Total Target
        const freq = targetFrekuensi ? parseInt(targetFrekuensi) : null;
        const nominal = nominalSatuan ? parseFloat(nominalSatuan) : null;
        let totalTarget = null;
        if (freq && nominal) {
            totalTarget = freq * nominal;
        }

        // 5. Get Urutan
        const maxUrutan = await prisma.itemKeuangan.findFirst({
            where: { kategoriId, periodeId, level, parentId: parentId || null },
            orderBy: { urutan: "desc" },
        });
        const urutan = maxUrutan ? maxUrutan.urutan + 1 : 1;

        // 6. Create
        await prisma.itemKeuangan.create({
            data: {
                kategoriId,
                periodeId,
                parentId,
                kode,
                nama,
                deskripsi,
                level,
                urutan,
                targetFrekuensi: freq,
                satuanFrekuensi,
                nominalSatuan: nominal,
                totalTarget: totalTarget,
            },
        });

        revalidatePath("/keuangan");
        return { success: true, message: "Item Anggaran berhasil dibuat" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Gagal membuat item anggaran" };
    }
}

export async function getItemsTree(periodeId: string, kategoriId?: string) {
    try {
        const where: any = { isActive: true };
        if (periodeId) where.periodeId = periodeId;
        if (kategoriId && kategoriId !== "all") where.kategoriId = kategoriId;

        const items = await prisma.itemKeuangan.findMany({
            where,
            include: {
                kategori: true,
                _count: { select: { children: true } },
            },
            orderBy: [
                { kategori: { kode: "asc" } },
                { level: "asc" },
                { urutan: "asc" },
            ],
        });

        // Convert Decimal to number for Client Components
        // Convert Decimal to number for Client Components
        const formattedItems = items.map((item: any) => ({
            ...item,
            nominalSatuan: item.nominalSatuan ? Number(item.nominalSatuan) : 0,
            totalTarget: item.totalTarget ? Number(item.totalTarget) : 0,
            nominalActual: item.nominalActual ? Number(item.nominalActual) : 0,
            // Flatten _count for easier client usage
            hasChildren: item._count ? item._count.children > 0 : false,
        }));

        return { success: true, data: formattedItems };
    } catch (error) {
        console.error("Error fetching items:", error);
        return { success: false, data: [] };
    }
}

export async function getItemById(id: string) {
    try {
        const item = await prisma.itemKeuangan.findUnique({
            where: { id },
            include: { kategori: true }
        });

        if (!item) return { success: false, message: "Item tidak ditemukan" };

        // Format for client
        const formattedItem = {
            ...item,
            nominalSatuan: item.nominalSatuan ? Number(item.nominalSatuan) : 0,
            totalTarget: item.totalTarget ? Number(item.totalTarget) : 0,
            nominalActual: item.nominalActual ? Number(item.nominalActual) : 0,
        };

        return { success: true, data: formattedItem };
    } catch (error) {
        console.error("Error fetching item:", error);
        return { success: false, message: "Gagal memuat item" };
    }
}

export async function updateItemKeuangan(
    id: string,
    prevState: ItemKeuanganState,
    formData: FormData
): Promise<ItemKeuanganState> {
    const nama = formData.get("nama") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const targetFrekuensi = formData.get("targetFrekuensi") as string;
    const satuanFrekuensi = formData.get("satuanFrekuensi") as string;
    const nominalSatuan = formData.get("nominalSatuan") as string;
    const isActive = formData.get("isActive") === "true"; // Assuming checkbox handling

    const errors: ItemKeuanganState["errors"] = {};
    if (!nama) errors.nama = ["Nama item wajib diisi"];

    if (Object.keys(errors).length > 0) return { errors, success: false };

    try {
        // Calculate Total Target
        const freq = targetFrekuensi ? parseInt(targetFrekuensi) : null;
        const nominal = nominalSatuan ? parseFloat(nominalSatuan) : null;
        let totalTarget = null;
        if (freq && nominal) {
            totalTarget = freq * nominal;
        }

        await prisma.itemKeuangan.update({
            where: { id },
            data: {
                nama,
                deskripsi,
                targetFrekuensi: freq,
                satuanFrekuensi,
                nominalSatuan: nominal,
                totalTarget: totalTarget,
                isActive: true, // Always active on update for now unless specified
            },
        });

        revalidatePath("/keuangan");
        return { success: true, message: "Item Anggaran berhasil diperbarui" };
    } catch (error) {
        return { success: false, message: "Gagal memperbarui item anggaran" };
    }
}

export async function deleteItemKeuangan(id: string) {
    try {
        // Check if has children
        const hasChildren = await prisma.itemKeuangan.count({
            where: { parentId: id },
        });

        if (hasChildren > 0) {
            return {
                success: false,
                message: "Tidak dapat menghapus item yang memiliki sub-item. Hapus sub-item terlebih dahulu.",
            };
        }

        // Check if has transactions (realisasi)
        const hasTransactions = await prisma.realisasiItemKeuangan.count({
            where: { itemKeuanganId: id },
        });

        if (hasTransactions > 0) {
            return {
                success: false,
                message: "Tidak dapat menghapus item yang sudah memiliki transaksi.",
            };
        }

        await prisma.itemKeuangan.delete({
            where: { id },
        });

        revalidatePath("/keuangan");
        return { success: true, message: "Item Anggaran berhasil dihapus" };
    } catch (error) {
        return { success: false, message: "Gagal menghapus item anggaran" };
    }
}

// --- DRAG AND DROP REORDER LOGIC ---

export async function reorderItemKeuangan(
    itemId: string,
    newParentId: string | null,
    newIndex: number
) {
    try {
        const item = await prisma.itemKeuangan.findUnique({
            where: { id: itemId },
        });

        if (!item) return { success: false, message: "Item tidak ditemukan" };

        const { periodeId, kategoriId } = item;

        // Verify new parent if exists
        if (newParentId) {
            const parent = await prisma.itemKeuangan.findUnique({
                where: { id: newParentId },
            });
            if (!parent) return { success: false, message: "Parent tidak ditemukan" };
            if (parent.kategoriId !== kategoriId) {
                return { success: false, message: "Tidak dapat memindahkan item ke kategori lain" };
            }
        }

        // Transaction for safety
        await prisma.$transaction(async (tx: any) => {
            // 1. Fetch ALL items for this Category & Period
            const allItems = await tx.itemKeuangan.findMany({
                where: { periodeId, kategoriId, isActive: true },
                orderBy: { urutan: "asc" },
                include: { kategori: true }
            });

            // 2. Build In-Memory Tree
            const itemMap = new Map<string, any>();
            const roots: any[] = [];

            // Initialize with children array
            const nodes = allItems.map((i: any) => ({ ...i, children: [] }));
            nodes.forEach((n: any) => itemMap.set(n.id, n));

            // Link children
            nodes.forEach((n: any) => {
                if (n.parentId && itemMap.has(n.parentId)) {
                    itemMap.get(n.parentId).children.push(n);
                } else if (!n.parentId) {
                    roots.push(n);
                }
            });

            // Sort children by current 'urutan'
            const sortNodes = (list: any[]) => list.sort((a, b) => a.urutan - b.urutan);
            sortNodes(roots);
            nodes.forEach((n: any) => sortNodes(n.children));

            // 3. Move Logic
            const targetNode = itemMap.get(itemId);
            if (!targetNode) throw new Error("Target node lost during processing");

            // Remove from old location
            const oldParentId = targetNode.parentId;
            if (oldParentId && itemMap.has(oldParentId)) {
                const oldParent = itemMap.get(oldParentId);
                const idx = oldParent.children.findIndex((c: any) => c.id === itemId);
                if (idx !== -1) oldParent.children.splice(idx, 1);
            } else {
                const idx = roots.findIndex(r => r.id === itemId);
                if (idx !== -1) roots.splice(idx, 1);
            }

            // Insert to new location
            targetNode.parentId = newParentId;

            if (newParentId && itemMap.has(newParentId)) {
                const newParent = itemMap.get(newParentId);
                const safeIndex = Math.min(newIndex, newParent.children.length);
                newParent.children.splice(safeIndex, 0, targetNode);
            } else {
                const safeIndex = Math.min(newIndex, roots.length);
                roots.splice(safeIndex, 0, targetNode);
            }

            // 4. Recalculate & Collect Updates
            const updates: any[] = [];

            const traverse = (nodeList: any[], level: number, parentCode: string | null, parentId: string | null) => {
                nodeList.forEach((node, idx) => {
                    const urutan = idx + 1;

                    // Generate new Code
                    let newKode = "";
                    if (level === 1) {
                        const catCode = node.kategori?.kode || "UNK";
                        newKode = `${catCode}.${urutan}`;
                    } else {
                        newKode = `${parentCode}.${urutan}`;
                    }

                    if (
                        node.urutan !== urutan ||
                        node.kode !== newKode ||
                        node.parentId !== parentId ||
                        node.level !== level
                    ) {
                        updates.push({
                            id: node.id,
                            urutan,
                            kode: newKode,
                            parentId,
                            level
                        });
                    }

                    if (node.children.length > 0) {
                        traverse(node.children, level + 1, newKode, node.id);
                    }
                });
            };

            traverse(roots, 1, null, null);

            // 5. Execute Updates
            for (const update of updates) {
                await tx.itemKeuangan.update({
                    where: { id: update.id },
                    data: {
                        urutan: update.urutan,
                        kode: update.kode,
                        parentId: update.parentId,
                        level: update.level
                    }
                });
            }
        });

        revalidatePath("/keuangan");
        return { success: true, message: "Urutan item berhasil diperbarui" };

    } catch (error) {
        console.error("Error reordering:", error);
        return { success: false, message: "Gagal memperbarui urutan item" };
    }
}
