import { apiResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);

    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { active } = req.query;

    let where = {};

    if (active === "true") {
      where.isActive = true; // filter hanya data aktif
    }

    const profiles = await prisma.profilPendeta.findMany({
      where,
      select: {
        id: true,
        nama: true,
        urlFoto: true,
        status: true,
        periode: true,
        quote: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    return res
      .status(200)
      .json(
        apiResponse(true, profiles, "Data profil pendeta berhasil diambil")
      );
  } catch (error) {
    console.error("Error fetching public pastor profiles:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data profil pendeta",
          error.message
        )
      );
  }
}
