import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { search, limit = 1000 } = req.query;

    const where = search
      ? {
          namaRayon: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    const options = await prisma.rayon.findMany({
      where,
      select: {
        id: true,
        namaRayon: true,
      },
      take: parseInt(limit), // Customizable limit untuk dropdown/autocomplete
    });

    // Sort berdasarkan angka di dalam nama rayon
    const sortedOptions = options.sort((a, b) => {
      const numA = parseInt(a.namaRayon.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.namaRayon.match(/\d+/)?.[0] || "0");
      return numA - numB;
    });

    // Format untuk AutoCompleteInput
    const formattedOptions = sortedOptions.map((item) => ({
      value: item.id,
      label: item.namaRayon,
    }));

    return res
      .status(200)
      .json(apiResponse(true, formattedOptions, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching rayon options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data rayon",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});