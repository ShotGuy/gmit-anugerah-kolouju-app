import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { search, limit = 1000 } = req.query;

    const where = {
      isActive: true,
      ...(search && {
        label: {
          // Ganti dari 'kategori' ke 'label'
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    const options = await prisma.pendapatan.findMany({
      where,
      select: {
        id: true,
        label: true, // Ganti dari 'kategori' ke 'label'
      },
      orderBy: {
        label: "asc", // Ganti dari 'kategori' ke 'label'
      },
      take: parseInt(limit),
    });

    // Format untuk AutoCompleteInput
    const formattedOptions = options.map((item) => ({
      value: item.id,
      label: item.label, // Ganti dari 'kategori' ke 'label'
    }));

    return res
      .status(200)
      .json(apiResponse(true, formattedOptions, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching pendapatan options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data pendapatan",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});
