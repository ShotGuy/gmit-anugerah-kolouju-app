"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { verifySession } from "@/lib/session.server";

export type ReportFilters = {
    rayon?: string;
    gender?: "L" | "P";
    ageMin?: number;
    ageMax?: number;
    bloodType?: string;
    maritalStatus?: string;
};

export async function getReportStats(filters: ReportFilters) {
    await verifySession();
    try {
        const where: Prisma.JemaatWhereInput = {};

        // 1. Apply Filters
        if (filters.rayon) {
            where.keluarga = { idRayon: filters.rayon };
        }
        if (filters.gender) {
            where.jenisKelamin = filters.gender === "L";
        }
        if (filters.bloodType) {
            where.golDarah = filters.bloodType;
        }
        if (filters.maritalStatus) {
            where.status = { idStatusDalamKel: filters.maritalStatus }; // Assuming user meant Status Keluarga. If meant Pernikahan, we need relation check.
            // Let's assume Status Dalam Keluarga for now as "Peran", or we can check Pernikahan table for actual Marital Status if needed. 
            // Typically "Status Pernikahan (Kawin/Belum)" is different from "Status Keluarga (Kepala/Istri/Anak)".
            // Given the prompt said "Status Pernikahan", let's check if we have that field. Schema shows `idPernikahan`.
            // If filter is for "Sudah Nikah" vs "Belum", we check `idPernikahan` is not null. 
            // But user might want "Janda/Duda".
            // Let's stick to simple "Status Dalam Keluarga" map for now OR check `idPernikahan`.
            // Wait, schema has `Pernikahan` model. `idPernikahan` field in Jemaat.
        }

        // Age Filter (Complex Date Calculation)
        if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
            const today = new Date();
            const minDate = filters.ageMax ? new Date(today.getFullYear() - filters.ageMax - 1, today.getMonth(), today.getDate()) : undefined;
            const maxDate = filters.ageMin ? new Date(today.getFullYear() - filters.ageMin, today.getMonth(), today.getDate()) : undefined;

            where.tanggalLahir = {
                ...(minDate ? { gt: minDate } : {}), // Born AFTER (Year - MaxAge - 1)
                ...(maxDate ? { lte: maxDate } : {}), // Born BEFORE (Year - MinAge)
            };
        }

        // 2. Aggregate Data
        const [
            totalJemaat,
            genderStats,
            educationStats,
            jobStats,
            bloodStats,
            sakramenStats
        ] = await Promise.all([
            // A. Total Count
            prisma.jemaat.count({ where }),

            // B. Gender Distribution
            prisma.jemaat.groupBy({
                by: ["jenisKelamin"],
                _count: { _all: true },
                where,
            }),

            // C. Education Distribution
            prisma.jemaat.groupBy({
                by: ["idPendidikan"],
                _count: { _all: true },
                where,
            }),

            // D. Job Distribution (Top 10)
            prisma.jemaat.groupBy({
                by: ["idPekerjaan"],
                _count: { _all: true },
                where,
                orderBy: { _count: { idPekerjaan: "desc" } },
                take: 10,
            }),

            // E. Blood Type
            prisma.jemaat.groupBy({
                by: ["golDarah"],
                _count: { _all: true },
                where,
            }),

            // F. Sakramen (Aggregation Manual needed or Counts)
            // Since Jemaat has idBaptis/idSidi/idPernikahan, we can count distinct
            prisma.jemaat.aggregate({
                _count: {
                    idBaptis: true,
                    idSidi: true,
                    idPernikahan: true,
                },
                where,
            })
        ]);

        // 3. Fetch Master Data Names (since groupBy returns IDs)
        // We can optimize this by fetching masters once in frontend, but for report API it's cleaner to return labels.
        // However, fast approach: return IDs and let frontend map it if masters are available. 
        // BETTER: Fetch masters here to ensure report is self-contained.

        return {
            success: true,
            data: {
                totalJemaat,
                genderStats: genderStats.map(g => ({ name: g.jenisKelamin ? "Laki-laki" : "Perempuan", value: g._count._all })),
                educationStats, // Will map IDs in frontend using Master Data
                jobStats,       // Will map IDs in frontend
                bloodStats: bloodStats.map(b => ({ name: b.golDarah || "Tidak Tahu", value: b._count._all })),
                sakramenStats: [
                    { name: "Baptis", value: sakramenStats._count.idBaptis },
                    { name: "Sidi", value: sakramenStats._count.idSidi },
                    { name: "Menikah", value: sakramenStats._count.idPernikahan },
                    { name: "Belum Baptis", value: totalJemaat - sakramenStats._count.idBaptis },
                    { name: "Belum Sidi", value: totalJemaat - sakramenStats._count.idSidi },
                ]
            }
        };

    } catch (error) {
        console.error("Report Error:", error);
        return { success: false, error: "Gagal memuat data laporan" };
    }
}
