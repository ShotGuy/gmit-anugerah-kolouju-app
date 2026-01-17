import prisma from "@/lib/prisma";
import { apiResponse, handleApiError, successResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  const { idKecamatan } = req.query;

  try {
    const kelurahanDesa = await prisma.kelurahan.findMany({
      where: {
        idKecamatan: idKecamatan,
      },
    });

    successResponse(res, kelurahanDesa, "Data berhasil diambil");
  } catch (error) {
    console.error("Error fetching kelurahan/desa:", error);
    handleApiError(res, error, "Gagal mengambil data kelurahan/desa");
  }
}

export default createApiHandler({
  GET: handleGet,
});