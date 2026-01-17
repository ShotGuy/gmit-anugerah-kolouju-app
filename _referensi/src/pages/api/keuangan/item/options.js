// api/keuangan/item/options.js
import { apiResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";

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
    console.error("API Item Keuangan Options Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res) {
  try {
    const { kategoriId, level, active = "true" } = req.query;

    const where = {};

    if (active === "true") {
      where.isActive = true;
    }

    if (kategoriId) {
      where.kategoriId = kategoriId;
    }

    if (level) {
      where.level = parseInt(level);
    }

    const items = await prisma.itemKeuangan.findMany({
      where,
      select: {
        id: true,
        nama: true,
        kode: true,
        level: true,
      },
      orderBy: [{ level: "asc" }, { urutan: "asc" }, { kode: "asc" }],
    });

    // Format untuk select options dengan indentasi
    const options = items.map((item) => ({
      value: item.id,
      label: `${"  ".repeat(item.level - 1)}${item.kode} - ${item.nama} (Level ${item.level})`,
      id: item.id,
      nama: item.nama,
      kode: item.kode,
      level: item.level,
    }));

    return res
      .status(200)
      .json(apiResponse(true, options, "Item options berhasil diambil"));
  } catch (error) {
    console.error("Error fetching item options:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil item options", error.message)
      );
  }
}
