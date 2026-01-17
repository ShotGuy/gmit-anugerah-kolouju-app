import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { search, limit = 1000 } = req.query;

    const where = {
      isActive: true,
      ...(search && {
        jenisJaminan: {
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    const options = await prisma.jaminanKesehatan.findMany({
      where,
      select: {
        id: true,
        jenisJaminan: true,
      },
      orderBy: {
        jenisJaminan: "asc",
      },
      take: parseInt(limit), // Customizable limit untuk dropdown/autocomplete
    });

    // Format untuk AutoCompleteInput
    const formattedOptions = options.map((item) => ({
      value: item.id,
      label: item.jenisJaminan,
    }));

    return res
      .status(200)
      .json(apiResponse(true, formattedOptions, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching jaminan kesehatan options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jaminan kesehatan",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});