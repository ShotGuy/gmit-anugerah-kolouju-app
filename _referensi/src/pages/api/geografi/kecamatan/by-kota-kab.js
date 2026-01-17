import prisma from "@/lib/prisma";
import { apiResponse, handleApiError, successResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  const { idKotaKab } = req.query;

  try {
    const kecamatan = await prisma.kecamatan.findMany({
      where: {
        idKotaKab: idKotaKab,
      },
    });

    successResponse(res, kecamatan, "Data berhasil diambil");
  } catch (error) {
    console.error("Error fetching kecamatan:", error);
    handleApiError(res, error, "Gagal mengambil data kecamatan");
  }
}

export default createApiHandler({
  GET: handleGet,
});