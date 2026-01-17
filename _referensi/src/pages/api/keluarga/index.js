import jwt from "jsonwebtoken";

import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";

async function handleGet(req, res) {
  try {
    // Get token from header untuk majelis filter
    const token = req.headers.authorization?.replace("Bearer ", "");
    let rayonFilter = {};

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Get user info to check if majelis
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            majelis: true,
          },
        });

        // If user is majelis, filter by rayon
        if (user && user.majelis && user.role === "MAJELIS") {
          rayonFilter = {
            idRayon: user.majelis.idRayon,
          };
        }
      } catch (error) {
        // Continue without filter if token invalid
      }
    }

    // Handle query parameters manually for keluarga
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "noBagungan";
    const sortOrder = req.query.sortOrder || "asc";

    const pagination = { page, limit, skip };
    const sort = { sortBy, sortOrder };

    // Build where clause for keluarga
    let where = {
      ...rayonFilter,
    };

    // Add search functionality for keluarga
    if (search) {
      where.OR = [
        {
          noBagungan: {
            equals: parseInt(search) || 0,
          },
        },
        {
          jemaats: {
            some: {
              nama: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    // Handle idRayon filter from query (for masterService.getKeluargaByRayon)
    if (req.query.idRayon) {
      where.idRayon = req.query.idRayon;
    }

    // Other keluarga-specific filters
    if (req.query.idStatusKeluarga) {
      where.idStatusKeluarga = req.query.idStatusKeluarga;
    }

    if (req.query.idKeadaanRumah) {
      where.idKeadaanRumah = req.query.idKeadaanRumah;
    }

    if (req.query.idStatusKepemilikanRumah) {
      where.idStatusKepemilikanRumah = req.query.idStatusKepemilikanRumah;
    }

    const finalWhere = where;

    const total = await prisma.keluarga.count({ where: finalWhere });

    const items = await prisma.keluarga.findMany({
      where: finalWhere,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
      include: {
        alamat: {
          include: {
            kelurahan: {
              include: {
                kecamatan: {
                  include: {
                    kotaKab: {
                      include: {
                        provinsi: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        statusKeluarga: true,
        statusKepemilikanRumah: true,
        keadaanRumah: true,
        rayon: true,
        jemaats: {
          include: {
            statusDalamKeluarga: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / pagination.limit);

    const result = {
      items,
      pagination: {
        ...pagination,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    };

    return res
      .status(200)
      .json(apiResponse(true, result, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching keluarga:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data keluarga", error.message)
      );
  }
}

async function handlePost(req, res) {
  try {
    const { alamat, ...keluargaData } = req.body;

    let newKeluarga;

    if (alamat) {
      // Create alamat first, then keluarga
      const newAlamat = await prisma.alamat.create({
        data: alamat,
      });

      // Create keluarga with the alamat ID
      newKeluarga = await prisma.keluarga.create({
        data: {
          ...keluargaData,
          idAlamat: newAlamat.id,
        },
        include: {
          alamat: {
            include: {
              kelurahan: {
                include: {
                  kecamatan: {
                    include: {
                      kotaKab: {
                        include: {
                          provinsi: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          statusKeluarga: true,
          statusKepemilikanRumah: true,
          keadaanRumah: true,
          rayon: true,
        },
      });
    } else {
      // Create keluarga only
      newKeluarga = await prisma.keluarga.create({
        data: keluargaData,
        include: {
          alamat: {
            include: {
              kelurahan: {
                include: {
                  kecamatan: {
                    include: {
                      kotaKab: {
                        include: {
                          provinsi: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          statusKeluarga: true,
          statusKepemilikanRumah: true,
          keadaanRumah: true,
          rayon: true,
        },
      });
    }

    return res
      .status(201)
      .json(apiResponse(true, newKeluarga, "Data berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating keluarga:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data keluarga",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});
