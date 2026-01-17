import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const klasisList = await prisma.klasis.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        nama: true,
      },
      orderBy: {
        nama: 'asc',
      },
    });

    const options = klasisList.map(klasis => ({
      value: klasis.id,
      label: klasis.nama,
    }));

    return res
      .status(200)
      .json(apiResponse(true, options, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching klasis options:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data klasis", error.message)
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});