"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type KategoriKeuanganState = {
    errors?: {
        nama?: string[];
        kode?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
};

export async function getKategoris(
    page: number = 1,
    limit: number = 100 // Default to show all for dropdowns usually
) {
    try {
        const skip = (page - 1) * limit;

        const [kategoris, total] = await Promise.all([
            (prisma as any).kategoriKeuangan.findMany({
                where: {
                    isActive: true,
                },
                include: {
                    _count: {
                        select: {
                            itemKeuangan: true,
                        },
                    },
                },
                orderBy: {
                    kode: "asc",
                },
                skip,
                take: limit,
            }),
            (prisma as any).kategoriKeuangan.count({
                where: {
                    isActive: true,
                },
            }),
        ]);

        return {
            success: true,
            data: kategoris,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching kategoris:", error);
        return {
            success: false,
            message: "Gagal mengambil data kategori",
        };
    }
}

export async function createKategori(
    prevState: KategoriKeuanganState,
    formData: FormData
): Promise<KategoriKeuanganState> {
    const nama = formData.get("nama") as string;
    const kode = formData.get("kode") as string;

    // Simple validation
    const errors: KategoriKeuanganState["errors"] = {};
    if (!nama) errors.nama = ["Nama kategori wajib diisi"];
    if (!kode) errors.kode = ["Kode kategori wajib diisi"];

    if (Object.keys(errors).length > 0) {
        return { errors, success: false };
    }

    try {
        // Check if duplicate
        const existing = await (prisma as any).kategoriKeuangan.findUnique({
            where: { kode: kode.toUpperCase() },
        });

        if (existing) {
            return {
                errors: { kode: ["Kode kategori sudah digunakan"] },
                success: false,
            };
        }

        await (prisma as any).kategoriKeuangan.create({
            data: {
                nama,
                kode: kode.toUpperCase(),
                isActive: true,
            },
        });

        revalidatePath("/master-data/kategori-keuangan");
        revalidatePath("/keuangan"); // Might affect dashboard dropdowns

        return {
            success: true,
            message: "Kategori berhasil dibuat",
        };
    } catch (error) {
        console.error("Error creating kategori:", error);
        return {
            success: false,
            message: "Gagal membuat kategori. Terjadi kesalahan server.",
        };
    }
}

export async function deleteKategori(id: string) {
    try {
        // Check usage
        const usage = await (prisma as any).itemKeuangan.count({
            where: { kategoriId: id },
        });

        if (usage > 0) {
            return {
                success: false,
                message: "Kategori tidak bisa dihapus karena sedang digunakan oleh Item Anggaran.",
            };
        }

        await (prisma as any).kategoriKeuangan.delete({
            where: { id },
        });

        revalidatePath("/master-data/kategori-keuangan");
        return { success: true, message: "Kategori berhasil dihapus" };
    } catch (error) {
        return { success: false, message: "Gagal menghapus kategori" };
    }
}

export async function updateKategori(
    id: string,
    prevState: KategoriKeuanganState,
    formData: FormData
): Promise<KategoriKeuanganState> {
    const nama = formData.get("nama") as string;
    const kode = formData.get("kode") as string;
    const jenis = formData.get("jenis") as string || "PENGELUARAN"; // Default or form input

    const errors: KategoriKeuanganState["errors"] = {};
    if (!nama) errors.nama = ["Nama kategori wajib diisi"];
    if (!kode) errors.kode = ["Kode kategori wajib diisi"];

    if (Object.keys(errors).length > 0) {
        return { errors, success: false };
    }

    try {
        // Check duplicate code (exclude self)
        const existing = await (prisma as any).kategoriKeuangan.findFirst({
            where: {
                kode: kode.toUpperCase(),
                id: { not: id },
            },
        });

        if (existing) {
            return {
                errors: { kode: ["Kode kategori sudah digunakan"] },
                success: false,
            };
        }

        await (prisma as any).kategoriKeuangan.update({
            where: { id },
            data: {
                nama,
                kode: kode.toUpperCase(),
                // jenis: jenis as any // Update type if schematic supports it
            },
        });

        revalidatePath("/master-data/kategori-keuangan");
        revalidatePath("/keuangan");

        return { success: true, message: "Kategori berhasil diperbarui" };
    } catch (error) {
        console.error("Error updating kategori:", error);
        return { success: false, message: "Gagal memperbarui kategori" };
    }
}
