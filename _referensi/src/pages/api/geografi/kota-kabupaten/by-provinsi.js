import prisma from "@/lib/prisma";
import { apiResponse, handleApiError, successResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  const { idProvinsi } = req.query;

  try {
    const kotaKabupaten = await prisma.kotaKab.findMany({
      where: {
        idProvinsi: idProvinsi,
      },
    });

    successResponse(res, kotaKabupaten, "Data berhasil diambil");
  } catch (error) {
    console.error("Error fetching kota/kabupaten:", error);
    handleApiError(res, error, "Gagal mengambil data kota/kabupaten");
  }
}

export default createApiHandler({
  GET: handleGet,
});
