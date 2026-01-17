// api/keuangan/kategori/options.js
import prisma from "@/lib/prisma";

const apiResponse = (success, data = null, message = "", errors = null) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      default:
        res.setHeader("Allow", ["GET"]);
        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    console.error("API Kategori Keuangan Options Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res) {
  try {
    const kategoris = await prisma.kategoriKeuangan.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        nama: true,
        kode: true,
      },
      orderBy: {
        kode: "asc",
      },
    });

    // Format untuk select options
    const options = kategoris.map((kategori) => ({
      value: kategori.id,
      label: `${kategori.kode} - ${kategori.nama}`,
      id: kategori.id,
      nama: kategori.nama,
      kode: kategori.kode,
    }));

    return res
      .status(200)
      .json(apiResponse(true, options, "Kategori options berhasil diambil"));
  } catch (error) {
    console.error("Error fetching kategori options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil kategori options",
          error.message
        )
      );
  }
}
