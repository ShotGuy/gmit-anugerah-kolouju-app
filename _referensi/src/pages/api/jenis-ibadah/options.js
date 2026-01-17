import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const jenisIbadahs = await prisma.jenisIbadah.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        namaIbadah: true,
      },
      orderBy: {
        namaIbadah: 'asc'
      }
    });

    // Format for options dropdown
    const options = jenisIbadahs.map(jenis => ({
      value: jenis.id,
      label: jenis.namaIbadah,
    }));

    return res
      .status(200)
      .json(apiResponse(true, options, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching jenis ibadah options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jenis ibadah",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});