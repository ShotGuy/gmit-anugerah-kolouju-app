"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type AkunKasState = {
    errors?: {
        nama?: string[];
        saldoSaatIni?: string[];
        deskripsi?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
};

export async function getAkunKasList() {
    try {
        const rawData = await (prisma as any).akunKas.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
        });

        const data = rawData.map((item: any) => ({
            ...item,
            saldoSaatIni: Number(item.saldoSaatIni),
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        }));

        return { success: true, data };
    } catch (error) {
        return { success: false, data: [] };
    }
}

export async function createAkunKas(
    prevState: AkunKasState,
    formData: FormData
): Promise<AkunKasState> {
    const nama = formData.get("nama") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const isDefault = formData.get("isDefault") === "on";
    const saldoAwal = formData.get("saldoAwal") as string;

    console.log("createAkunKas called:", { nama, isDefault, saldoAwal });

    if (!nama) return { success: false, errors: { nama: ["Nama akun wajib diisi"] } };

    try {
        // If set as default, unset others
        if (isDefault) {
            await (prisma as any).akunKas.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        const newAkun = await (prisma as any).akunKas.create({
            data: {
                nama,
                deskripsi,
                isDefault,
                saldoSaatIni: saldoAwal ? Number(saldoAwal) : 0,
            },
        });

        console.log("Akun Created:", newAkun);

        revalidatePath("/master-data/akun-kas");
        return { success: true, message: "Akun kas berhasil dibuat" };
    } catch (error) {
        console.error("Error creating Akun Kas:", error);
        return { success: false, message: "Gagal membuat akun kas: " + (error as Error).message };
    }
}

export async function updateAkunKas(
    id: string,
    prevState: AkunKasState,
    formData: FormData
): Promise<AkunKasState> {
    const nama = formData.get("nama") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const isDefault = formData.get("isDefault") === "on";

    if (!nama) return { success: false, errors: { nama: ["Nama akun wajib diisi"] } };

    try {
        if (isDefault) {
            await (prisma as any).akunKas.updateMany({
                where: { isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        await (prisma as any).akunKas.update({
            where: { id },
            data: {
                nama,
                deskripsi,
                isDefault,
            },
        });

        revalidatePath("/master-data/akun-kas");
        return { success: true, message: "Akun kas berhasil diperbarui" };
    } catch (error) {
        return { success: false, message: "Gagal memperbarui akun kas" };
    }
}

export async function deleteAkunKas(id: string) {
    try {
        await (prisma as any).akunKas.update({
            where: { id },
            data: { isActive: false }, // Soft delete
        });
        revalidatePath("/master-data/akun-kas");
        return { success: true, message: "Akun kas berhasil dihapus" };
    } catch (error) {
        return { success: false, message: "Gagal menghapus akun kas" };
    }
}
