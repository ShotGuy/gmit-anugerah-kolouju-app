import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const kategoriJadwals = await prisma.kategoriJadwal.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        namaKategori: true,
        deskripsi: true,
      },
      orderBy: {
        namaKategori: 'asc'
      }
    });

    // Format for options dropdown
    const options = kategoriJadwals.map(kategori => ({
      value: kategori.id,
      label: kategori.namaKategori,
      deskripsi: kategori.deskripsi,
    }));

    return res
      .status(200)
      .json(apiResponse(true, options, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching kategori jadwal options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data kategori jadwal",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});