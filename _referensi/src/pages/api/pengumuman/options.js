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

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${method} not allowed`));
  }

  try {
    const { type = "all", kategoriId = null } = req.query;

    const result = {};

    // Get kategori pengumuman
    if (type === "all" || type === "kategori") {
      const kategoriOptions = await prisma.kategoriPengumuman.findMany({
        where: { isActive: true },
        select: {
          id: true,
          nama: true,
          deskripsi: true,
        },
        orderBy: { nama: "asc" },
      });

      result.kategori = kategoriOptions;
    }

    // Get jenis pengumuman
    if (type === "all" || type === "jenis") {
      const jenisWhere = kategoriId ? { kategoriId, isActive: true } : { isActive: true };
      
      const jenisOptions = await prisma.jenisPengumuman.findMany({
        where: jenisWhere,
        select: {
          id: true,
          nama: true,
          deskripsi: true,
          kategoriId: true,
          kategori: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
        orderBy: { nama: "asc" },
      });

      result.jenis = jenisOptions;
    }

    // Get enum values
    if (type === "all" || type === "enums") {
      result.enums = {
        status: [
          { value: "DRAFT", label: "Draft" },
          { value: "PUBLISHED", label: "Published" },
          { value: "ARCHIVED", label: "Archived" },
        ],
        prioritas: [
          { value: "LOW", label: "Low" },
          { value: "MEDIUM", label: "Medium" },
          { value: "HIGH", label: "High" },
          { value: "URGENT", label: "Urgent" },
        ],
      };
    }

    return res
      .status(200)
      .json(apiResponse(true, result, "Data options berhasil diambil"));
  } catch (error) {
    console.error("Error fetching options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data options",
          error.message
        )
      );
  }
}