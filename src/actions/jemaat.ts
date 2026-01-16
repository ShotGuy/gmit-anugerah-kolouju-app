"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session.server";

export async function getJemaatAction(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, string | string[]>,
    searchQuery?: string
) {
    await verifySession();
    try {
        const where: any = {};

        if (filters) {
            const hasValues = (key: string) => {
                const val = filters[key];
                if (!val) return false;
                if (Array.isArray(val)) return val.length > 0 && !val.includes("all");
                return val !== "all";
            };

            const getValues = (key: string): string[] => {
                const val = filters[key];
                if (!val) return [];
                return Array.isArray(val) ? val : [val];
            };

            // Helper for simple "IN" filters
            const applyInFilter = (key: string, dbField: string) => {
                if (hasValues(key)) {
                    where[dbField] = { in: getValues(key) };
                }
            };

            if (hasValues("jenisKelamin")) {
                where.jenisKelamin = { in: getValues("jenisKelamin") };
            }

            applyInFilter("golDarah", "golDarah");
            applyInFilter("statusDalamKel", "statusDalamKel");
            applyInFilter("idPendidikan", "idPendidikan");
            applyInFilter("idPekerjaan", "idPekerjaan");
            applyInFilter("idPendapatan", "idPendapatan");
            applyInFilter("idJaminan", "idJaminan");

            if (hasValues("idRayon")) {
                where.keluarga = { ...where.keluarga, idRayon: { in: getValues("idRayon") } };
            }
            // Removed other keluarga filters for brevity/focus as they aren't in main export UI yet, but logic is extensible

            // Status Baptis & Sidi Logic
            // If strictly one is selected, apply it. If both or none, do nothing (show all).
            const applyStatusFilter = (key: string, dbField: string) => {
                if (hasValues(key)) {
                    const vals = getValues(key);
                    // If both "sudah" and "belum" are present, it cancels out -> show all
                    if (vals.includes("sudah") && vals.includes("belum")) {
                        // no-op
                    } else if (vals.includes("sudah")) {
                        where[dbField] = { isNot: null };
                    } else if (vals.includes("belum")) {
                        where[dbField] = null;
                    }
                }
            };

            applyStatusFilter("statusBaptis", "baptisOwned");
            applyStatusFilter("statusSidi", "sidiOwned");

            // Kategori Umur Logic (OR condition)
            if (hasValues("kategoriUmur")) {
                const today = new Date();
                const createDateFromAge = (age: number) => {
                    const d = new Date(today);
                    d.setFullYear(today.getFullYear() - age);
                    return d;
                };

                const ageConditions = getValues("kategoriUmur").map(cat => {
                    switch (cat) {
                        case "anak": return { tanggalLahir: { gt: createDateFromAge(12) } };
                        case "remaja": return { tanggalLahir: { lte: createDateFromAge(12), gt: createDateFromAge(18) } };
                        case "pemuda": return { tanggalLahir: { lte: createDateFromAge(18), gt: createDateFromAge(36) } };
                        case "dewasa": return { tanggalLahir: { lte: createDateFromAge(36), gt: createDateFromAge(60) } };
                        case "lansia": return { tanggalLahir: { lte: createDateFromAge(60) } };
                        default: return null;
                    }
                }).filter(Boolean);

                if (ageConditions.length > 0) {
                    where.OR = [
                        ...(where.OR || []),
                        ...ageConditions
                    ];
                }
            }
        }

        if (searchQuery) {
            const isNumeric = /^\d+$/.test(searchQuery);
            where.OR = [
                { nama: { contains: searchQuery, mode: "insensitive" } },
                // If it looks like NIK (numeric), try startsWith which is faster for indexes
                // If not numeric, no point searching ID (char 16) usually
                ...(isNumeric ? [{ idJemaat: { startsWith: searchQuery } }] : [])
            ];
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.jemaat.findMany({
                where,
                include: {
                    keluarga: {
                        include: {
                            alamat: {
                                include: {
                                    kelurahan: true,
                                },
                            },
                            rayon: true,
                            statusKepemilikan: true,
                            statusTanah: true,
                        },
                    },
                    status: true,
                    pendidikan: true,
                    pekerjaan: true,
                    pendapatan: true,
                    jaminan: true,
                    pernikahan: true,
                    baptisOwned: true,
                    sidiOwned: true,
                    jabatanRel: {
                        include: {
                            jabatan: true,
                        },
                    },
                },
                orderBy: {
                    nama: "asc",
                },
                take: limit,
                skip: skip,
            }),
            prisma.jemaat.count({ where }),
        ]);

        return {
            data,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    } catch (error: any) {
        console.error("Failed to fetch jemaat:", error);
        throw new Error(error.message || "Failed to fetch jemaat data");
    }
}
