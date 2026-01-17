import prisma from "@/lib/prisma";

// Helper for API responses
const apiResponse = (success, data = null, message = "", errors = null) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

// Main handler function
export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await getKategoris(req, res);
      case "POST":
        return await createKategori(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    console.error("API Kategori Keuangan Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function getKategoris(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [kategoris, total] = await Promise.all([
      prisma.kategoriKeuangan.findMany({
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              itemKeuangan: true,
            },
          },
        },
        orderBy: {
          kode: "asc",
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.kategoriKeuangan.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    };

    return res
      .status(200)
      .json(apiResponse(true, { items: kategoris, pagination }, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching kategoris:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil kategori", error.message)
      );
  }
}

async function createKategori(req, res) {
  try {
    const { nama, kode, isActive = true } = req.body;

    if (!nama || !kode) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: !nama ? "Nama kategori wajib diisi" : undefined,
          kode: !kode ? "Kode kategori wajib diisi" : undefined,
        })
      );
    }

    // Check if kode already exists
    const existingKategori = await prisma.kategoriKeuangan.findFirst({
      where: {
        kode: kode.toUpperCase(),
      },
    });

    if (existingKategori) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Kode kategori sudah digunakan"));
    }

    const kategori = await prisma.kategoriKeuangan.create({
      data: {
        nama,
        kode: kode.toUpperCase(),
        isActive,
      },
      include: {
        _count: {
          select: {
            itemKeuangan: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, kategori, "Kategori berhasil dibuat"));
  } catch (error) {
    console.error("Error creating kategori:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Kode kategori sudah digunakan"));
    }

    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal membuat kategori", error.message));
  }
}
