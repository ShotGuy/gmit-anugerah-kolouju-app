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
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(
      apiResponse(false, null, "Validasi gagal", {
        id: "ID konten wajib diisi",
      })
    );
  }

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res, id);
      default:
        res.setHeader("Allow", ["GET"]);

        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res, id) {
  try {
    const konten = await prisma.kontenLandingPage.findUnique({
      where: { id },
    });

    if (!konten) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Konten tidak ditemukan"));
    }

    return res
      .status(200)
      .json(
        apiResponse(true, konten, "Data konten landing page berhasil diambil")
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data konten landing page",
          error.message
        )
      );
  }
}
