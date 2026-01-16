"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session.server";

export async function getJabatanAction(filters?: Record<string, string>) {
    await verifySession();
    try {
        const where: any = {};

        if (filters) {
            if (filters.idJabatan && filters.idJabatan !== "all") {
                where.idJabatan = filters.idJabatan;
            }
            if (filters.statusAktif && filters.statusAktif !== "all") {
                where.statusAktif = filters.statusAktif === "true";
            }
        }

        const data = await prisma.jemaatJabatan.findMany({
            where,
            orderBy: { tanggalMulai: "desc" },
            include: {
                jabatan: true,
            },
        });
        return data;
    } catch (error) {
        console.error("Failed to fetch jabatan assignments:", error);
        throw new Error("Failed to fetch jabatan assignments");
    }
}
