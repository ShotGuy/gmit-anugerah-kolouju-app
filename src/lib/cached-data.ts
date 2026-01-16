import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Revalidate every hour (3600 seconds)
const REVALIDATE_TIME = 3600;

export const getStatusDalamKeluarga = unstable_cache(
    async () => prisma.statusDalamKeluarga.findMany({ orderBy: { status: "asc" } }),
    ["status-dalam-keluarga"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getPendidikan = unstable_cache(
    async () => prisma.pendidikan.findMany({ orderBy: { jenjang: "asc" } }),
    ["pendidikan"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getPekerjaan = unstable_cache(
    async () => prisma.pekerjaan.findMany({ orderBy: { namaPekerjaan: "asc" } }),
    ["pekerjaan"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getPendapatan = unstable_cache(
    async () => prisma.pendapatan.findMany({ orderBy: { rentang: "asc" } }),
    ["pendapatan"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getJaminanKes = unstable_cache(
    async () => prisma.jaminanKes.findMany({ orderBy: { jenisJaminan: "asc" } }),
    ["jaminan-kes"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getStatusKepemilikanRumah = unstable_cache(
    async () => prisma.statusKepemilikanRumah.findMany({ orderBy: { status: "asc" } }),
    ["status-kepemilikan-rumah"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getStatusTanah = unstable_cache(
    async () => prisma.statusTanah.findMany({ orderBy: { status: "asc" } }),
    ["status-tanah"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getRayon = unstable_cache(
    async () => prisma.rayon.findMany({ orderBy: { namaRayon: "asc" } }),
    ["rayon"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getKelurahan = unstable_cache(
    async () => prisma.kelurahan.findMany({ orderBy: { nama: "asc" } }),
    ["kelurahan"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getKlasis = unstable_cache(
    async () => prisma.klasis.findMany({ orderBy: { nama: "asc" } }),
    ["klasis"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getJabatan = unstable_cache(
    async () => prisma.jabatan.findMany({ orderBy: { namaJabatan: "asc" } }),
    ["jabatan"],
    { revalidate: REVALIDATE_TIME, tags: ["master-data"] }
);

export const getDashboardStats = unstable_cache(
    async () => {
        const [totalJemaat, totalKeluarga, totalBaptis, totalPernikahan, totalSidi, allJemaat] = await prisma.$transaction([
            prisma.jemaat.count(),
            prisma.keluarga.count(),
            prisma.baptis.count(),
            prisma.pernikahan.count(),
            prisma.sidi.count(),
            prisma.jemaat.findMany({
                select: {
                    idJemaat: true,
                    nama: true,
                    jenisKelamin: true,
                    tanggalLahir: true,
                    keluarga: {
                        select: {
                            rayon: {
                                select: { namaRayon: true }
                            }
                        }
                    }
                }
            })
        ]);

        // Process Gender Stats
        const genderStats = {
            lakiLaki: 0,
            perempuan: 0
        };

        // Process Age Stats
        const ageStats = {
            "0-12": 0,
            "13-17": 0,
            "18-35": 0,
            "36-60": 0,
            ">60": 0
        };

        // Process Rayon Stats
        const rayonStats: Record<string, number> = {};

        // Process Birthdays (Next 7 Days)
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const upcomingBirthdays: Array<{ id: string; nama: string; tanggal: Date; usia: number }> = [];

        allJemaat.forEach(j => {
            // Gender
            if (j.jenisKelamin) genderStats.lakiLaki++;
            else genderStats.perempuan++;

            // Rayon
            const rayonName = j.keluarga?.rayon?.namaRayon ?? "Tanpa Rayon";
            rayonStats[rayonName] = (rayonStats[rayonName] || 0) + 1;

            // Age
            const birthDate = new Date(j.tanggalLahir);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age <= 12) ageStats["0-12"]++;
            else if (age <= 17) ageStats["13-17"]++;
            else if (age <= 35) ageStats["18-35"]++;
            else if (age <= 60) ageStats["36-60"]++;
            else ageStats[">60"]++;

            // Birthday Check
            // Create a date object for this year's birthday
            const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());

            if (thisYearBirthday >= today && thisYearBirthday <= nextWeek) {
                upcomingBirthdays.push({ id: j.idJemaat, nama: j.nama, tanggal: thisYearBirthday, usia: age + 1 });
            } else if (nextYearBirthday >= today && nextYearBirthday <= nextWeek) {
                upcomingBirthdays.push({ id: j.idJemaat, nama: j.nama, tanggal: nextYearBirthday, usia: age + 1 });
            }
        });

        // Sort birthdays by date
        upcomingBirthdays.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());

        return {
            counts: { jemaat: totalJemaat, keluarga: totalKeluarga, baptis: totalBaptis, pernikahan: totalPernikahan, sidi: totalSidi },
            genderStats: [
                { name: "Laki-laki", value: genderStats.lakiLaki, fill: "#3b82f6" }, // Blue
                { name: "Perempuan", value: genderStats.perempuan, fill: "#ec4899" }  // Pink
            ],
            ageStats: Object.entries(ageStats).map(([name, value]) => ({ name, value })),
            rayonStats: Object.entries(rayonStats)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value) // Sort by count descending
                .slice(0, 10), // Top 10 Rayons
            upcomingBirthdays
        };
    },
    ["dashboard-stats"],
    { revalidate: 60, tags: ["dashboard"] }
);
