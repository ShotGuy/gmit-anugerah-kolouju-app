// api/keuangan/realisasi/summary.js
import prisma from "@/lib/prisma";

const apiResponse = (success, data = null, message = "", errors = null) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      default:
        res.setHeader("Allow", ["GET"]);
        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    console.error("API Realisasi Summary Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res) {
  try {
    const {
      itemKeuanganId,
      kategoriId,
      periodeId,
      level,
      tanggalMulai,
      tanggalSelesai,
    } = req.query;

    if (!periodeId && !itemKeuanganId) {
      return res.status(400).json(apiResponse(false, null, "Periode ID required"));
    }

    // --- 1. Fetch All Items & Realizations for the context (Periode) ---
    const whereItem = {
      isActive: true,
      periodeId: periodeId
    };

    const whereRealisasi = {};
    if (tanggalMulai || tanggalSelesai) {
      whereRealisasi.tanggalRealisasi = {};
      if (tanggalMulai) whereRealisasi.tanggalRealisasi.gte = new Date(tanggalMulai);
      if (tanggalSelesai) whereRealisasi.tanggalRealisasi.lte = new Date(tanggalSelesai);
    }

    // --- 1. Fetch All Items for the Period ---
    // Fetch items sorted by level descending (leaf first) to help building tree
    const items = await prisma.itemKeuangan.findMany({
      where: whereItem,
      include: {
        kategori: { select: { id: true, nama: true, kode: true } },
        periode: { select: { id: true, nama: true, tahun: true } },
      },
      orderBy: { level: 'desc' }, // Process from leaves (deepest level) up to root
    });

    // --- 2. Calculate Realization from Transactions (Source of Truth) ---
    // We do NOT trust 'nominalActual' column as it causes double counting (if pre-aggregated) or zero (if not updated)
    const realisasiSums = await prisma.realisasiItemKeuangan.groupBy({
      by: ['itemKeuanganId'],
      where: {
        ...whereRealisasi,
        periodeId: periodeId,
      },
      _sum: {
        totalRealisasi: true,
      },
      _count: {
        id: true,
      }
    });

    // Create Map for fast lookup
    const realisasiMap = new Map();
    realisasiSums.forEach(r => {
      realisasiMap.set(r.itemKeuanganId, {
        sum: Number(r._sum.totalRealisasi || 0),
        count: r._count.id || 0
      });
    });

    // --- 3. Build Tree & Calculate Aggregates (Bottom-Up) ---
    const itemMap = new Map();

    // Initialize Map with Direct Data
    items.forEach(item => {
      // Get direct realization from transactions (or 0 if none)
      const realisasiData = realisasiMap.get(item.id) || { sum: 0, count: 0 };
      const directRealisasi = realisasiData.sum;

      itemMap.set(item.id, {
        ...item,
        children: [],
        directRealisasi: directRealisasi, // Source of Truth
        jumlahRealisasi: realisasiData.count, // Direct transaction count
        aggregatedRealisasi: directRealisasi, // Start with own, add children later

        // Target Logic
        directTarget: item.totalTarget ? Number(item.totalTarget) : 0,
        effectiveTarget: item.totalTarget ? Number(item.totalTarget) : 0,

        hasChildren: false
      });
    });

    // Recursive Aggregation (Bottom-Up because we ordered by level desc)
    items.forEach(item => {
      const currentNode = itemMap.get(item.id);

      if (item.parentId && itemMap.has(item.parentId)) {
        const parentNode = itemMap.get(item.parentId);

        // Add child to parent
        parentNode.children.push(currentNode);
        parentNode.hasChildren = true;

        // Roll up Realization
        parentNode.aggregatedRealisasi += currentNode.aggregatedRealisasi;

        // Roll up Target (Safety net: Calculate effective target from children)
        // This ensures Dashboard shows correct total event if Data Master hasn't synced it to DB yet
        parentNode.effectiveTarget += currentNode.effectiveTarget;
      }
    });

    // --- 3. Filter Result ---
    const processedItems = Array.from(itemMap.values());
    let resultItems = processedItems;

    if (kategoriId && kategoriId !== 'all') {
      resultItems = resultItems.filter(i => i.kategoriId === kategoriId);
    }

    if (level && level !== 'all') {
      resultItems = resultItems.filter(i => i.level === parseInt(level));
    }

    if (itemKeuanganId && itemKeuanganId !== 'all') {
      resultItems = resultItems.filter(i => i.id === itemKeuanganId);
    }

    // --- 4. Format Output ---
    const formattedData = resultItems.map(item => {
      const targetAmount = item.effectiveTarget;
      const realisasiAmount = item.aggregatedRealisasi;
      const varianceAmount = realisasiAmount - targetAmount;
      const variancePercentage = targetAmount > 0
        ? (realisasiAmount / targetAmount) * 100
        : 0;

      return {
        id: item.id,
        kode: item.kode,
        nama: item.nama,
        level: item.level,
        deskripsi: item.deskripsi,
        kategori: item.kategori,
        parentId: item.parentId,

        // Original vs Effective Stats
        totalTarget: targetAmount.toString(),
        totalRealisasiAmount: realisasiAmount.toString(),

        // Detailed breakdown
        directTarget: item.totalTarget?.toString(),
        directRealisasi: item.directRealisasi.toString(),

        // Variance
        varianceAmount: varianceAmount.toString(),
        variancePercentage: Math.round(variancePercentage * 100) / 100,
        isTargetAchieved: realisasiAmount >= targetAmount,
        achievementPercentage: Math.round(variancePercentage * 100) / 100,

        // Extras
        jumlahRealisasi: item.jumlahRealisasi || 0, // Direct count from map
        hasChildren: item.hasChildren
      };
    });

    // Sort output (Hierarchical sort)
    formattedData.sort((a, b) => {
      if (a.kategori?.id !== b.kategori?.id) return (a.kategori?.kode || '').localeCompare(b.kategori?.kode || '');
      return a.kode.localeCompare(b.kode, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Calculate Global Summary (of the filtered result)
    const overallSummary = {
      totalItems: formattedData.length,
      totalTargetAmount: formattedData.reduce((sum, i) => sum + Number(i.totalTarget), 0).toString(),
      totalRealisasiAmount: formattedData.reduce((sum, i) => sum + Number(i.totalRealisasiAmount), 0).toString(),
      totalVarianceAmount: formattedData.reduce((sum, i) => sum + Number(i.varianceAmount), 0).toString(),
      itemsWithRealisasi: formattedData.filter(item => item.jumlahRealisasi > 0).length, // approximate
      itemsTargetAchieved: formattedData.filter(item => item.isTargetAchieved).length,
    };

    return res.status(200).json(apiResponse(true, {
      items: formattedData,
      summary: overallSummary
    }, "Summary realisasi berhasil diambil"));

  } catch (error) {
    console.error("Error fetching realisasi summary:", error);
    return res.status(500).json(apiResponse(false, null, "Gagal mengambil summary realisasi", error.message));
  }
}