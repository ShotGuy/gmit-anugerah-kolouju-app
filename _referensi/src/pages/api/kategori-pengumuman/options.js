import prisma from "@/lib/prisma";

// Helper function untuk response API
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
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json(apiResponse(false, null, `Method ${req.method} not allowed`));
  }

  try {
    const { includeJenis = "true", isActive = "true" } = req.query;

    // Build where condition
    const where = {
      AND: [isActive === "true" ? { isActive: true } : {}],
    };

    // Build query options
    let queryOptions = {
      where,
      orderBy: {
        nama: "asc",
      },
    };

    // Add include if needed
    if (includeJenis === "true") {
      queryOptions.include = {
        jenisPengumuman: {
          where: {
            isActive: true, // Only include active JenisPengumuman
          },
          select: {
            id: true,
            nama: true,
            deskripsi: true,
          },
          orderBy: {
            nama: "asc",
          },
        },
      };
    }

    // Fetch categories with their sub-categories
    const kategoriOptions = await prisma.kategoriPengumuman.findMany(queryOptions);

    return res.status(200).json(apiResponse(true, kategoriOptions, "Kategori pengumuman berhasil diambil"));
  } catch (error) {
    console.error("Error fetching kategori pengumuman options:", error);
    return res.status(500).json(apiResponse(false, null, "Gagal mengambil data kategori pengumuman", error.message));
  }
}
