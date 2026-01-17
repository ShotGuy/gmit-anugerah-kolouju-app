import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function handleGet(req, res) {
    try {
        // 1. Auth Check (Admin, Majelis, Employee)
        const authResult = await requireAuth(req, res, ['ADMIN', 'MAJELIS', 'EMPLOYEE']);
        if (authResult.error) {
            return res.status(authResult.status).json(apiResponse(false, null, authResult.error));
        }

        const { user } = authResult;

        // 2. Permission Check
        let hasAccess = false;
        if (user.role === 'ADMIN') hasAccess = true;
        else if (user.role === 'MAJELIS' && user.majelis?.isUtama) hasAccess = true;
        else if (user.role === 'EMPLOYEE') {
            const pegawai = await prisma.pegawai.findUnique({
                where: { id: user.idPegawai },
                select: { canManageJadwal: true }
            });
            if (pegawai?.canManageJadwal) hasAccess = true;
        }

        if (!hasAccess) {
            return res.status(403).json(apiResponse(false, null, "Anda tidak memiliki akses melihat statistik kehadiran."));
        }

        // 3. Parse Query Parameters
        const { startDate, endDate, idJenisIbadah, idKategori, idRayon } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(apiResponse(false, null, "Parameter startDate dan endDate wajib diisi."));
        }

        // 4. Build Filter (Where Clause)
        const where = {
            tanggal: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
            // Hanya ambil yang sudah selesai/lewat (opsional, tapi masuk akal utk statistik)
            // waktuMulai: { lt: new Date() } 
        };

        if (idJenisIbadah) where.idJenisIbadah = idJenisIbadah;
        if (idKategori) where.idKategori = idKategori;
        if (idRayon) where.idRayon = idRayon; // Bisa null kalau user admin filter rayon

        // Filter tambahan untuk Majelis Rayon (Non-Utama) jika peraturan berubah
        // Tapi di requirements, hanya Majelis UTAMA yang boleh akses statistik global.

        // 5. Fetch Data
        const jadwalList = await prisma.jadwalIbadah.findMany({
            where,
            select: {
                id: true,
                tanggal: true,
                jumlahLaki: true,
                jumlahPerempuan: true,
                targetPeserta: true,
                jenisIbadah: { select: { namaIbadah: true } },
                kategori: { select: { namaKategori: true } },
                rayon: { select: { namaRayon: true } },
            },
            orderBy: { tanggal: 'asc' }
        });

        // 6. Aggregations (Manual Processing for granular charts)

        let totalLaki = 0;
        let totalPerempuan = 0;
        let totalTarget = 0;
        let countTargetAvailable = 0; // count jadwal that has target set
        let maxKehadiran = 0;

        // Data structures for charts
        const trendData = {}; // Key: "yyyy-mm-dd"
        const distributionData = {}; // Key: "Nama Ibadah"
        const rayonData = {}; // Key: "Nama Rayon"

        jadwalList.forEach(jadwal => {
            const L = jadwal.jumlahLaki || 0;
            const P = jadwal.jumlahPerempuan || 0;
            const total = L + P;

            // Summary Totals
            totalLaki += L;
            totalPerempuan += P;

            // Target Tracking
            if (jadwal.targetPeserta && jadwal.targetPeserta > 0) {
                totalTarget += jadwal.targetPeserta;
                countTargetAvailable++;
            }

            // High Score
            if (total > maxKehadiran) maxKehadiran = total;

            // Trend Data (Group by Date - or Week if range is large, currently by date)
            const dateKey = jadwal.tanggal.toISOString().split('T')[0];
            if (!trendData[dateKey]) {
                trendData[dateKey] = { date: dateKey, total: 0, laki: 0, perempuan: 0, count: 0 };
            }
            trendData[dateKey].total += total;
            trendData[dateKey].laki += L;
            trendData[dateKey].perempuan += P;
            trendData[dateKey].count += 1;

            // Distribution Data (By Jenis Ibadah)
            const jenis = jadwal.jenisIbadah?.namaIbadah || "Lainnya";
            if (!distributionData[jenis]) distributionData[jenis] = 0;
            distributionData[jenis] += total;

            // Rayon Data
            if (jadwal.rayon?.namaRayon) {
                const rayonName = jadwal.rayon.namaRayon;
                if (!rayonData[rayonName]) rayonData[rayonName] = { name: rayonName, total: 0, count: 0 };
                rayonData[rayonName].total += total;
                rayonData[rayonName].count += 1;
            }
        });

        // Finalize Arrays for Recharts
        const trendChart = Object.values(trendData).sort((a, b) => new Date(a.date) - new Date(b.date));

        const distributionChart = Object.keys(distributionData).map(key => ({
            name: key,
            value: distributionData[key]
        }));

        const rayonChart = Object.values(rayonData)
            .map(r => ({ name: r.name, average: Math.round(r.total / r.count), total: r.total }))
            .sort((a, b) => b.average - a.average)
            .slice(0, 10); // Top 10 Rayon

        // Safe division for Gauge
        const totalHadir = totalLaki + totalPerempuan;
        // Calculate Target Achievement % (Only for events that had targets)
        // This is tricky. Let's do a sum of realization vs sum of target for those specific events.
        // Re-looping slightly inefficient but clearer:
        let realizationForTargetedEvents = 0;
        jadwalList.forEach(j => {
            if (j.targetPeserta > 0) realizationForTargetedEvents += ((j.jumlahLaki || 0) + (j.jumlahPerempuan || 0));
        });

        const targetAchievement = totalTarget > 0
            ? Math.round((realizationForTargetedEvents / totalTarget) * 100)
            : 0;

        const summary = {
            totalKehadiran: totalHadir,
            avgPerIbadah: jadwalList.length > 0 ? Math.round(totalHadir / jadwalList.length) : 0,
            rekorTertinggi: maxKehadiran,
            targetAchievement: targetAchievement
        };

        const composition = [
            { name: 'Pria', value: totalLaki },
            { name: 'Wanita', value: totalPerempuan }
        ];

        return res.status(200).json(apiResponse(true, {
            summary,
            trend: trendChart,
            composition,
            distribution: distributionChart,
            rayonPerformance: rayonChart
        }, "Data statistik berhasil diambil"));

    } catch (error) {
        console.error("Error fetching statistics:", error);
        return res.status(500).json(apiResponse(false, null, "Gagal mengambil data statistik", error.message));
    }
}

export default createApiHandler({
    GET: handleGet
});
