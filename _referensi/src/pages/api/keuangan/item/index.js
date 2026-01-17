// api/keuangan/item.js
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
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    console.error("API Item Keuangan Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 100, // Increase default limit untuk tree view
      search,
      kategoriId,
      periodeId, // TAMBAH: Filter berdasarkan periode
      parentId,
      level,
      includeTree = false,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { isActive: true }; // Only get active items

    // Filter berdasarkan periode jika disediakan
    if (periodeId && periodeId !== "" && periodeId !== "all") {
      where.periodeId = periodeId;
    }

    // Build where conditions
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { kode: { contains: search, mode: "insensitive" } },
        { deskripsi: { contains: search, mode: "insensitive" } },
      ];
    }

    if (kategoriId && kategoriId !== "" && kategoriId !== "all") {
      where.kategoriId = kategoriId;
    }

    if (parentId && parentId !== "") {
      if (parentId === "null") {
        where.parentId = null;
      } else {
        where.parentId = parentId;
      }
    }

    if (level && level !== "all") {
      where.level = parseInt(level);
    }

    const [itemsRaw, total] = await Promise.all([
      prisma.itemKeuangan.findMany({
        where,
        include: {
          kategori: {
            select: {
              id: true,
              nama: true,
              kode: true,
            },
          },
          parent: {
            select: {
              id: true,
              nama: true,
              kode: true,
              level: true,
            },
          },
          _count: {
            select: {
              children: true,
            },
          },
        },
        skip: parseInt(page) === 1 && includeTree ? 0 : skip, // Don't skip for tree view
        take: parseInt(page) === 1 && includeTree ? undefined : parseInt(limit), // No limit for tree view
        orderBy: [
          { kategoriId: "asc" },
          { level: "asc" },
          { urutan: "asc" },
          { kode: "asc" },
        ],
      }),
      prisma.itemKeuangan.count({ where }),
    ]);

    // Convert BigInt fields to string for JSON serialization
    const items = itemsRaw.map(item => ({
      ...item,
      targetFrekuensi: item.targetFrekuensi,
      satuanFrekuensi: item.satuanFrekuensi,
      nominalSatuan: item.nominalSatuan ? item.nominalSatuan.toString() : null,
      totalTarget: item.totalTarget ? item.totalTarget.toString() : null,
      nominalActual: item.nominalActual ? item.nominalActual.toString() : "0",
    }));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    };

    return res
      .status(200)
      .json(apiResponse(true, { items, pagination }, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching item keuangan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data item keuangan",
          error.message
        )
      );
  }
}

// Helper function untuk generate kode otomatis
function generateKodeHierarkis(parentKode, childIndex, level) {
  if (level === 1) {
    // Level 1: A, B, C, dst
    return String.fromCharCode(65 + childIndex);
  } else {
    // Level 2+: A.1, A.1.1, A.1.1.1, dst
    return `${parentKode}.${childIndex + 1}`;
  }
}

async function handlePost(req, res) {
  try {
    const {
      kategoriId,
      periodeId, // TAMBAH: Periode wajib
      parentId,
      kode, // Optional - akan di-generate jika tidak ada
      nama,
      deskripsi,
      // Target/anggaran fields (TAMBAH)
      targetFrekuensi,
      satuanFrekuensi,
      nominalSatuan,
      totalTarget,
      // Actual data fields
      nominalActual = 0,
      jumlahTransaksi = 0,
      keterangan,
      isActive = true,
    } = req.body;

    // Validation
    if (!kategoriId || !periodeId || !nama) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          kategoriId: !kategoriId ? "Kategori wajib dipilih" : undefined,
          periodeId: !periodeId ? "Periode wajib dipilih" : undefined,
          nama: !nama ? "Nama item wajib diisi" : undefined,
        })
      );
    }

    // Verify kategori and periode exist
    const [kategori, periode] = await Promise.all([
      prisma.kategoriKeuangan.findUnique({
        where: { id: kategoriId },
      }),
      prisma.periodeAnggaran.findUnique({
        where: { id: periodeId },
      }),
    ]);

    if (!kategori) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Kategori tidak ditemukan"));
    }

    if (!periode) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Periode tidak ditemukan"));
    }

    // Determine level and validate parent
    let level = 1;
    let parentItem = null;

    if (parentId) {
      parentItem = await prisma.itemKeuangan.findUnique({
        where: { id: parentId },
      });

      if (!parentItem) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Parent item tidak ditemukan"));
      }

      // Validate parent is in same category
      if (parentItem.kategoriId !== kategoriId) {
        return res
          .status(400)
          .json(
            apiResponse(false, null, "Parent harus dalam kategori yang sama")
          );
      }

      level = parentItem.level + 1;
    }

    // Generate kode if not provided
    let finalKode = kode;
    if (!finalKode) {
      // Count siblings untuk generate kode dalam periode yang sama
      const siblingCount = await prisma.itemKeuangan.count({
        where: {
          kategoriId,
          periodeId,
          parentId: parentId || null,
          level,
          isActive: true,
        },
      });

      if (level === 1) {
        // Level 1 menggunakan kode kategori sebagai base
        finalKode = `${kategori.kode}`;
      } else {
        // Level 2+ menggunakan parent kode + index
        finalKode = generateKodeHierarkis(parentItem.kode, siblingCount, level);
      }
    }

    // Check if kode already exists in this category and period
    const existingItem = await prisma.itemKeuangan.findFirst({
      where: {
        kategoriId,
        periodeId,
        kode: finalKode,
      },
    });

    if (existingItem) {
      return res
        .status(400)
        .json(
          apiResponse(false, null, "Kode sudah digunakan dalam kategori dan periode ini")
        );
    }

    // Get next urutan for this level in this period
    const maxUrutan = await prisma.itemKeuangan.findFirst({
      where: {
        kategoriId,
        periodeId,
        level,
        parentId: parentId || null,
        isActive: true,
      },
      orderBy: { urutan: "desc" },
    });

    const urutan = maxUrutan ? maxUrutan.urutan + 1 : 1;

    // Prepare item data
    const itemData = {
      kategoriId,
      periodeId, // TAMBAH: Periode
      parentId: parentId || null,
      kode: finalKode,
      nama,
      deskripsi: deskripsi || null,
      level,
      urutan,
      // Target/anggaran fields (TAMBAH)
      targetFrekuensi: targetFrekuensi ? parseInt(targetFrekuensi) : null,
      satuanFrekuensi: satuanFrekuensi || null,
      nominalSatuan: nominalSatuan ? parseFloat(nominalSatuan) : null,
      totalTarget: totalTarget ? parseFloat(totalTarget) : null,
      // Actual data fields
      nominalActual: parseFloat(nominalActual) || 0,
      jumlahTransaksi: parseInt(jumlahTransaksi) || 0,
      keterangan: keterangan || null,
      isActive,
    };

    // Create the item
    const item = await prisma.itemKeuangan.create({
      data: itemData,
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
        parent: {
          select: {
            id: true,
            nama: true,
            kode: true,
            level: true,
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, item, "Item keuangan berhasil dibuat"));
  } catch (error) {
    console.error("Error creating item keuangan:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Kode item sudah digunakan"));
    }

    if (error.code === "P2003") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Kategori atau parent tidak valid"));
    }

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal membuat item keuangan", error.message)
      );
  }
}

// Export untuk digunakan di route lain jika perlu
export { generateKodeHierarkis };
