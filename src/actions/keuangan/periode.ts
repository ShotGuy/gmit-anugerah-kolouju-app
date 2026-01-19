"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type PeriodeState = {
    errors?: {
        nama?: string[];
        tahun?: string[];
        tanggalMulai?: string[];
        tanggalAkhir?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
};

export async function getPeriodes(
    page: number = 1,
    limit: number = 10,
    search?: string
) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };

    if (search) {
        where.OR = [
            { nama: { contains: search, mode: "insensitive" } },
            { keterangan: { contains: search, mode: "insensitive" } },
        ];
    }

    try {
        const [items, total] = await Promise.all([
            prisma.periodeAnggaran.findMany({
                where,
                orderBy: [{ tahun: "desc" }, { tanggalMulai: "desc" }],
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { itemKeuangan: true },
                    },
                },
            }),
            prisma.periodeAnggaran.count({ where }),
        ]);

        return {
            success: true,
            data: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching periods:", error);
        return { success: false, data: [], message: "Gagal mengambil data periode" };
    }
}

export async function createPeriode(
    prevState: PeriodeState,
    formData: FormData
): Promise<PeriodeState> {
    const nama = formData.get("nama") as string;
    const tahun = parseInt(formData.get("tahun") as string);
    const tanggalMulai = formData.get("tanggalMulai") as string;
    const tanggalAkhir = formData.get("tanggalAkhir") as string;
    const keterangan = formData.get("keterangan") as string;

    const errors: PeriodeState["errors"] = {};
    if (!nama) errors.nama = ["Nama periode wajib diisi"];
    if (!tahun) errors.tahun = ["Tahun wajib diisi"];
    if (!tanggalMulai) errors.tanggalMulai = ["Tanggal mulai wajib diisi"];
    if (!tanggalAkhir) errors.tanggalAkhir = ["Tanggal akhir wajib diisi"];

    if (Object.keys(errors).length > 0) return { errors, success: false };

    const start = new Date(tanggalMulai);
    const end = new Date(tanggalAkhir);

    if (start >= end) {
        return {
            errors: { tanggalAkhir: ["Tanggal akhir harus setelah tanggal mulai"] },
            success: false,
        };
    }

    try {
        // Check overlap
        const overlap = await prisma.periodeAnggaran.findFirst({
            where: {
                isActive: true, // Only check active periods
                OR: [
                    {
                        AND: [
                            { tanggalMulai: { lte: start } },
                            { tanggalAkhir: { gte: start } },
                        ],
                    },
                    {
                        AND: [
                            { tanggalMulai: { lte: end } },
                            { tanggalAkhir: { gte: end } },
                        ],
                    },
                ],
            },
        });

        if (overlap) {
            return {
                // Just generic error
                message: `Periode bertabrakan dengan: ${overlap.nama}`,
                success: false,
            };
        }

        await prisma.periodeAnggaran.create({
            data: {
                nama,
                tahun,
                tanggalMulai: start,
                tanggalAkhir: end,
                keterangan,
                status: "ACTIVE", // Default to active for now
            },
        });

        revalidatePath("/master-data/periode-anggaran");
        return { success: true, message: "Periode berhasil dibuat" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Gagal membuat periode" };
    }
}

export async function updatePeriode(
    id: string,
    prevState: PeriodeState,
    formData: FormData
): Promise<PeriodeState> {
    const nama = formData.get("nama") as string;
    const tahun = parseInt(formData.get("tahun") as string);
    const tanggalMulai = formData.get("tanggalMulai") as string;
    const tanggalAkhir = formData.get("tanggalAkhir") as string;
    const keterangan = formData.get("keterangan") as string;
    const status = formData.get("status") as string || "ACTIVE";

    const errors: PeriodeState["errors"] = {};
    if (!nama) errors.nama = ["Nama periode wajib diisi"];
    if (!tahun) errors.tahun = ["Tahun wajib diisi"];
    if (!tanggalMulai) errors.tanggalMulai = ["Tanggal mulai wajib diisi"];
    if (!tanggalAkhir) errors.tanggalAkhir = ["Tanggal akhir wajib diisi"];

    if (Object.keys(errors).length > 0) return { errors, success: false };

    const start = new Date(tanggalMulai);
    const end = new Date(tanggalAkhir);

    if (start >= end) {
        return {
            errors: { tanggalAkhir: ["Tanggal akhir harus setelah tanggal mulai"] },
            success: false,
        };
    }

    try {
        // Check overlap (excluding itself)
        const overlap = await prisma.periodeAnggaran.findFirst({
            where: {
                isActive: true,
                id: { not: id }, // Exclude self
                OR: [
                    {
                        AND: [
                            { tanggalMulai: { lte: start } },
                            { tanggalAkhir: { gte: start } },
                        ],
                    },
                    {
                        AND: [
                            { tanggalMulai: { lte: end } },
                            { tanggalAkhir: { gte: end } },
                        ],
                    },
                ],
            },
        });

        if (overlap) {
            return {
                message: `Periode bertabrakan dengan: ${overlap.nama}`,
                success: false,
            };
        }

        await prisma.periodeAnggaran.update({
            where: { id },
            data: {
                nama,
                tahun,
                tanggalMulai: start,
                tanggalAkhir: end,
                keterangan,
                status,
            },
        });

        revalidatePath("/master-data/periode-anggaran");
        return { success: true, message: "Periode berhasil diperbarui" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Gagal memperbarui periode" };
    }
}

export async function deletePeriode(id: string) {
    try {
        // 1. Check Integrity: Item Keuangan
        const hasItems = await prisma.itemKeuangan.count({
            where: { periodeId: id }
        });
        if (hasItems > 0) {
            return { success: false, message: "Tidak dapat menghapus: Periode ini masih digunakan oleh Item Anggaran." };
        }

        // 2. Check Integrity: Realisasi
        const hasRealisasi = await prisma.realisasiItemKeuangan.count({
            where: { periodeId: id }
        });
        if (hasRealisasi > 0) {
            return { success: false, message: "Tidak dapat menghapus: Periode ini masih memiliki data Transaksi Realisasi." };
        }

        // 3. Soft Delete (or Hard Delete if preferred, but usually Soft Delete for Master Data safe keeping)
        // User asked for "hapus", usually implies hard delete if unused, or soft delete.
        // Given 'isActive' flag exists in type definition in client-page, let's check schema.
        // Assuming Soft Delete via isActive=false is safer, BUT user explicitly concerned about FKs 
        // which implies they want to CLEAN UP unused data.
        // Let's try Hard Delete since we did the checks. If schema has restrictive delete cascade, it might fail, 
        // but we manual checked.

        await prisma.periodeAnggaran.delete({
            where: { id }
        });

        revalidatePath("/master-data/periode-anggaran");
        return { success: true, message: "Periode berhasil dihapus" };
    } catch (error: any) {
        console.error("Delete Periode Error:", error);
        // Fallback for DB constraint errors
        if (error.code === 'P2003') {
            return { success: false, message: "Gagal menghapus: Data masih digunakan di tabel lain (Foreign Key Constraint)." };
        }
        return { success: false, message: "Gagal menghapus periode" };
    }
}
