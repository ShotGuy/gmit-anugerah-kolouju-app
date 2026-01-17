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
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json(
      apiResponse(false, null, "Validasi gagal", {
        id: "ID galeri wajib diisi",
      })
    );
  }

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res, id);
      case "PATCH":
        return await handlePatch(req, res, id);
      case "DELETE":
        return await handleDelete(req, res, id);
      default:
        res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
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
    const galeri = await prisma.galeri.findUnique({
      where: { id },
    });

    if (!galeri) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Galeri tidak ditemukan"));
    }

    // Parse fotos dari JSON string jika ada
    const parsedGaleri = {
      ...galeri,
      fotos: galeri.fotos ? JSON.parse(galeri.fotos) : [],
    };

    return res
      .status(200)
      .json(apiResponse(true, parsedGaleri, "Data galeri berhasil diambil"));
  } catch (error) {
    console.error("Error fetching galeri:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data galeri",
          error.message
        )
      );
  }
}

async function handlePatch(req, res, id) {
  try {
    const { namaKegiatan, deskripsi, tempat, tanggalKegiatan, fotos, isActive, isPublished } = req.body;

    // Check if galeri exists
    const existingGaleri = await prisma.galeri.findUnique({
      where: { id }
    });

    if (!existingGaleri) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Galeri tidak ditemukan"));
    }

    // Prepare update data
    const updateData = {};
    
    if (namaKegiatan !== undefined) updateData.namaKegiatan = namaKegiatan;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (tempat !== undefined) updateData.tempat = tempat;
    if (tanggalKegiatan !== undefined) updateData.tanggalKegiatan = new Date(tanggalKegiatan);
    if (fotos !== undefined) updateData.fotos = JSON.stringify(fotos);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished && !existingGaleri.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedGaleri = await prisma.galeri.update({
      where: { id },
      data: updateData
    });

    // Parse fotos untuk response
    const parsedGaleri = {
      ...updatedGaleri,
      fotos: updatedGaleri.fotos ? JSON.parse(updatedGaleri.fotos) : [],
    };

    return res
      .status(200)
      .json(apiResponse(true, parsedGaleri, "Galeri berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating galeri:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui galeri",
          error.message
        )
      );
  }
}

async function handleDelete(req, res, id) {
  try {
    // Check if galeri exists
    const existingGaleri = await prisma.galeri.findUnique({
      where: { id }
    });

    if (!existingGaleri) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Galeri tidak ditemukan"));
    }

    await prisma.galeri.delete({
      where: { id }
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Galeri berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting galeri:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus galeri",
          error.message
        )
      );
  }
}