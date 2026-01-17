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
      case "POST":
        return await handlePost(req, res);
      case "PUT":
        return await handlePut(req, res);
      case "DELETE":
        return await handleDelete(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);

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

async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      section = "",
      isPublished = "",
      sortBy = "urutan",
      sortOrder = "asc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      AND: [
        search
          ? {
            OR: [
              {
                judul: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                konten: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                deskripsi: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
          : {},
        { isActive: true },
        section ? { section: section } : {},
        isPublished ? { isPublished: isPublished === "true" } : {},
      ],
    };

    const total = await prisma.kontenLandingPage.count({ where });

    const konten = await prisma.kontenLandingPage.findMany({
      where,
      skip: limitNum === -1 ? undefined : skip,
      take: limitNum === -1 ? undefined : limitNum,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = limitNum === -1 ? 1 : Math.ceil(total / limitNum);

    const result = {
      items: konten,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: limitNum === -1 ? false : pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };

    return res
      .status(200)
      .json(
        apiResponse(true, result, "Data konten landing page berhasil diambil")
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

async function handlePost(req, res) {
  try {
    const {
      section,
      judul,
      konten,
      deskripsi = null,
      urutan = 0,
      metadata = null,
      isPublished = false,
    } = req.body;

    // Validasi input
    if (!section || section.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          section: "Section wajib diisi",
        })
      );
    }

    if (!judul || judul.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          judul: "Judul wajib diisi",
        })
      );
    }

    if (!konten || konten.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          konten: "Konten wajib diisi",
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

    // Buat konten baru
    const newKonten = await prisma.kontenLandingPage.create({
      data: {
        section: section,
        judul: judul.trim(),
        konten: konten.trim(),
        deskripsi: deskripsi ? deskripsi.trim() : null,
        urutan: parseInt(urutan),
        metadata: metadata,
        isPublished: Boolean(isPublished),
        publishedAt: Boolean(isPublished) ? new Date() : null,
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(true, newKonten, "Konten landing page berhasil dibuat")
      );
  } catch (error) {
    // Handle unique constraint error
    if (error.code === "P2002") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          urutan: "Urutan untuk section ini sudah ada",
        })
      );
    }

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal membuat konten landing page",
          error.message
        )
      );
  }
}

async function handlePut(req, res) {
  try {
    const {
      id,
      section,
      judul,
      konten,
      deskripsi,
      urutan,
      metadata,
      isPublished,
      isActive,
    } = req.body;

    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID konten wajib diisi",
        })
      );
    }

    // Cek apakah konten exists
    const existingKonten = await prisma.kontenLandingPage.findUnique({
      where: { id },
    });

    if (!existingKonten) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Konten tidak ditemukan"));
    }

    // Prepare data untuk update
    const updateData = {};

    if (section !== undefined) {
      // Validasi section enum
      const validSections = ["VISI", "MISI", "SEJARAH", "HERO", "TENTANG", "TEMAGMIT"];

      if (!validSections.includes(section)) {
        return res.status(400).json(
          apiResponse(false, null, "Validasi gagal", {
            section: `Section harus salah satu dari: ${validSections.join(", ")}`,
          })
        );
      }
      updateData.section = section;
    }

    if (judul !== undefined) updateData.judul = judul.trim();
    if (konten !== undefined) updateData.konten = konten.trim();
    if (deskripsi !== undefined)
      updateData.deskripsi = deskripsi ? deskripsi.trim() : null;
    if (urutan !== undefined) updateData.urutan = parseInt(urutan);
    if (metadata !== undefined) updateData.metadata = metadata;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished);
      // Set publishedAt jika status berubah ke published dan belum pernah dipublish
      if (Boolean(isPublished) && !existingKonten.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    // Update konten
    const updatedKonten = await prisma.kontenLandingPage.update({
      where: { id },
      data: updateData,
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedKonten,
          "Konten landing page berhasil diperbarui"
        )
      );
  } catch (error) {
    // Handle unique constraint error
    if (error.code === "P2002") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          urutan: "Urutan untuk section ini sudah ada",
        })
      );
    }

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui konten landing page",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID konten wajib diisi",
        })
      );
    }

    // Cek apakah konten exists
    const existingKonten = await prisma.kontenLandingPage.findUnique({
      where: { id },
    });

    if (!existingKonten) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Konten tidak ditemukan"));
    }

    // Hapus konten dari database (soft delete)
    await prisma.kontenLandingPage.update({
      where: { id },
      data: { isActive: false },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, null, "Konten landing page berhasil dihapus")
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus konten landing page",
          error.message
        )
      );
  }
}
