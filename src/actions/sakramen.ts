"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session.server";

export async function getSakramenAction(
    filters?: Record<string, string>,
    tab: "baptis" | "sidi" | "pernikahan" | "all" = "all",
    page: number = 1,
    limit: number = 10
) {
    await verifySession();
    try {
        const skip = (page - 1) * limit;

        const buildWhere = (type: "baptis" | "sidi" | "pernikahan") => {
            const where: any = {};
            if (!filters) return where;

            if (filters.idKlasis && filters.idKlasis !== "all") {
                if (type === "pernikahan") {
                    // Handled separately below due to async
                } else {
                    where.idKlasis = filters.idKlasis;
                }
            }

            if (filters.jenisKelamin && filters.jenisKelamin !== "all" && type !== "pernikahan") {
                where.jemaat = { ...where.jemaat, jenisKelamin: filters.jenisKelamin === "L" };
            }

            if (filters.rayon && filters.rayon !== "all") {
                const rayonKey = type === "pernikahan" ? "jemaats" : "jemaat";
                if (type === "pernikahan") {
                    where[rayonKey] = { some: { keluarga: { idRayon: filters.rayon } } };
                } else {
                    where[rayonKey] = { ...where[rayonKey], keluarga: { idRayon: filters.rayon } };
                }
            }

            if (filters.tahun && filters.tahun !== "all") {
                const year = parseInt(filters.tahun);
                where.tanggal = {
                    gte: new Date(`${year}-01-01`),
                    lte: new Date(`${year}-12-31`)
                };
            }

            if (filters.kategoriUsia && filters.kategoriUsia !== "all" && type !== "pernikahan") {
                const today = new Date();
                const yearsAgo = (y: number) => {
                    const d = new Date(today);
                    d.setFullYear(today.getFullYear() - y);
                    return d;
                };
                const dobFilter: any = {};
                if (filters.kategoriUsia === "anak") dobFilter.gte = yearsAgo(13);
                else if (filters.kategoriUsia === "remaja") { dobFilter.lte = yearsAgo(13); dobFilter.gte = yearsAgo(18); }
                else if (filters.kategoriUsia === "pemuda") { dobFilter.lte = yearsAgo(18); dobFilter.gte = yearsAgo(36); }
                else if (filters.kategoriUsia === "dewasa") { dobFilter.lte = yearsAgo(36); dobFilter.gte = yearsAgo(61); }
                else if (filters.kategoriUsia === "lansia") { dobFilter.lte = yearsAgo(61); }

                where.jemaat = { ...where.jemaat, tanggalLahir: dobFilter };
            }
            return where;
        };

        const baptisWhere = buildWhere("baptis");
        const sidiWhere = buildWhere("sidi");
        let pernikahanWhere = buildWhere("pernikahan");

        // Special handling for Klasis in Pernikahan (async check)
        if (filters?.idKlasis && filters.idKlasis !== "all") {
            const klasis = await prisma.klasis.findUnique({
                where: { idKlasis: filters.idKlasis },
                select: { nama: true }
            });
            if (klasis) pernikahanWhere.klasis = klasis.nama;
        }

        const fetchPaginated = async (model: any, where: any, include: any) => {
            const [total, data] = await Promise.all([
                model.count({ where }),
                model.findMany({
                    where,
                    orderBy: { tanggal: "desc" },
                    include,
                    skip,
                    take: limit,
                })
            ]);
            return {
                data,
                metadata: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        };

        const result: any = { baptis: null, sidi: null, pernikahan: null };
        const requests = [];

        if (tab === "all" || tab === "baptis") {
            requests.push(fetchPaginated(prisma.baptis, baptisWhere, {
                jemaat: { select: { idJemaat: true, nama: true } },
                klasis: true
            }).then(res => result.baptis = res));
        }

        if (tab === "all" || tab === "sidi") {
            requests.push(fetchPaginated(prisma.sidi, sidiWhere, {
                jemaat: { select: { idJemaat: true, nama: true } },
                klasis: true
            }).then(res => result.sidi = res));
        }

        if (tab === "all" || tab === "pernikahan") {
            requests.push(fetchPaginated(prisma.pernikahan, pernikahanWhere, {
                jemaats: { select: { idJemaat: true, nama: true } }
            }).then(res => result.pernikahan = res));
        }

        await Promise.all(requests);
        return result;

    } catch (error) {
        console.error("Failed to fetch sakramen data:", error);
        throw new Error("Failed to fetch sakramen data");
    }
}
