import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    // Public endpoint - no auth required for onboarding
    const { search, limit = 1000 } = req.query;

    const where = {
      isActive: true,
      // Exclude "Kepala Keluarga" from options since each family already has one
      status: {
        not: "Kepala Keluarga",
        ...(search ? { contains: search, mode: "insensitive" } : {})
      },
    };

    const options = await prisma.statusDalamKeluarga.findMany({
      where,
      select: {
        id: true,
        status: true,
      },
      orderBy: {
        status: "asc",
      },
      take: parseInt(limit), // Customizable limit untuk dropdown/autocomplete
    });

    // Format untuk AutoCompleteInput
    const formattedOptions = options.map((item) => ({
      value: item.id,
      label: item.status,
    }));

    return res
      .status(200)
      .json(apiResponse(true, formattedOptions, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching status dalam keluarga options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data status dalam keluarga",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});