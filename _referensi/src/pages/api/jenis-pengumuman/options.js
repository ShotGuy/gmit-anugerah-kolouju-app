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
    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${req.method} not allowed`));
  }

  try {
    const { kategoriId, isActive = "true" } = req.query;

    // Build where condition
    const where = {
      AND: [
        kategoriId ? { kategoriId } : {},
        isActive === "true" ? { isActive: true } : {},
      ],
    };

    // Get jenis pengumuman options
    const jenisOptions = await prisma.jenisPengumuman.findMany({
      where,
      select: {
        id: true,
        nama: true,
        kategoriId: true,
        kategori: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          jenisOptions,
          "Options jenis pengumuman berhasil diambil"
        )
      );
  } catch (error) {
    console.error("Error fetching jenis pengumuman options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil options jenis pengumuman",
          error.message
        )
      );
  }
}