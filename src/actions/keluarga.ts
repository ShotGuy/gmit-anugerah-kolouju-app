"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session.server";

export async function getKeluargaAction(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, string>,
    searchQuery?: string
) {
    await verifySession();
    try {
        const where: any = {};

        if (filters) {
            if (filters.idRayon && filters.idRayon !== "all") {
                where.idRayon = filters.idRayon;
            }
            if (filters.idStatusKepemilikan && filters.idStatusKepemilikan !== "all") {
                where.idStatusKepemilikan = filters.idStatusKepemilikan;
            }
            if (filters.idStatusTanah && filters.idStatusTanah !== "all") {
                where.idStatusTanah = filters.idStatusTanah;
            }
            if (filters.idKelurahan && filters.idKelurahan !== "all") {
                where.alamat = { idKelurahan: filters.idKelurahan };
            }
        }

        if (searchQuery) {
            where.OR = [
                { noKK: { contains: searchQuery, mode: "insensitive" } },
                {
                    jemaat: {
                        some: {
                            nama: { contains: searchQuery, mode: "insensitive" },
                            status: { status: { contains: "Kepala", mode: "insensitive" } }
                        }
                    }
                }
            ];
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.keluarga.findMany({
                where,
                orderBy: { idKeluarga: "asc" },
                take: limit,
                skip: skip,
                include: {
                    alamat: {
                        include: {
                            kelurahan: {
                                include: {
                                    kecamatan: {
                                        include: {
                                            kotaKab: {
                                                include: { provinsi: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    statusKepemilikan: true,
                    statusTanah: true,
                    rayon: true,
                    jemaat: {
                        include: {
                            status: true,
                        },
                    },
                },
            }),
            prisma.keluarga.count({ where }),
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
    } catch (error) {
        console.error("Failed to fetch keluarga:", error);
        throw new Error("Failed to fetch keluarga data");
    }
}
