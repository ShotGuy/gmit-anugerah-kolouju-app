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

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);

    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${method} not allowed`));
  }

  try {
    const { section } = req.query;

    if (!section) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          section: "Section wajib diisi",
        })
      );
    }

    // Validasi section enum
    const validSections = ["VISI", "MISI", "SEJARAH", "HERO", "TENTANG", "TEMAGMIT"];

    if (!validSections.includes(section)) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          section: `Section harus salah satu dari: ${validSections.join(", ")}`,
        })
      );
    }

    // Ambil konten berdasarkan section yang sudah dipublish
    const konten = await prisma.kontenLandingPage.findMany({
      where: {
        section: section,
        isActive: true,
        isPublished: true,
      },
      orderBy: {
        urutan: "asc",
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, konten, `Data ${section.toLowerCase()} berhasil diambil`)
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data konten",
          error.message
        )
      );
  }
}
