import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { rayonId } = req.query;

    if (!rayonId) {
      return res
        .status(400)
        .json(apiResponse(false, null, "ID Rayon wajib diisi"));
    }

    // Get majelis by rayon
    const items = await prisma.majelis.findMany({
      where: {
        idRayon: rayonId,
      },
      orderBy: [
        { isUtama: "desc" }, // Majelis utama di urutan pertama
        { namaLengkap: "asc" },
      ],
      include: {
        jenisJabatan: {
          select: {
            namaJabatan: true,
          },
        },
        rayon: {
          select: {
            id: true,
            namaRayon: true,
          },
        },
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
          },
        },
        User: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    const result = {
      items,
      total: items.length,
    };

    return res
      .status(200)
      .json(apiResponse(true, result, "Data majelis berhasil diambil"));
  } catch (error) {
    console.error("Error fetching majelis by rayon:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data majelis",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});
