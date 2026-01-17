import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET: Get users (jemaat only) in majelis's rayon
async function handleGet(req, res) {
  try {
    // Require authentication
    const authResult = await requireAuth(req, res);
    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const user = authResult.user;

    // Only MAJELIS can access this endpoint
    if (user.role !== "MAJELIS") {
      return res
        .status(403)
        .json(apiResponse(false, null, "Akses ditolak. Hanya untuk Majelis"));
    }

    // Get majelis data to get rayon id
    const majelis = await prisma.majelis.findUnique({
      where: { id: user.idMajelis },
      include: {
        rayon: true,
      },
    });

    if (!majelis || !majelis.idRayon) {
      return res
        .status(404)
        .json(
          apiResponse(
            false,
            null,
            "Data majelis atau rayon tidak ditemukan"
          )
        );
    }

    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: ["username", "email"],
      defaultSortBy: "username",
    });

    // Filter only JEMAAT role and by majelis's rayon (using user.idRayon directly)
    const userWhere = {
      ...where,
      role: "JEMAAT",
      idRayon: majelis.idRayon,
    };

    const total = await prisma.user.count({ where: userWhere });

    const items = await prisma.user.findMany({
      where: userWhere,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
      select: {
        id: true,
        username: true,
        email: true,
        noWhatsapp: true,
        role: true,
        idJemaat: true,
        idRayon: true,
        createdAt: true,
        updatedAt: true,
        rayon: {
          select: {
            id: true,
            namaRayon: true,
          },
        },
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            statusDalamKeluarga: {
              select: {
                status: true,
              },
            },
            keluarga: {
              select: {
                noBagungan: true,
                rayon: {
                  select: {
                    namaRayon: true,
                  },
                },
              },
            },
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
      rayonInfo: {
        id: majelis.rayon.id,
        namaRayon: majelis.rayon.namaRayon,
      },
    };

    return res
      .status(200)
      .json(apiResponse(true, result, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data user", error.message)
      );
  }
}

// POST: Create user (jemaat only) for majelis's rayon
async function handlePost(req, res) {
  try {
    // Require authentication
    const authResult = await requireAuth(req, res);
    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const user = authResult.user;

    // Only MAJELIS can access this endpoint
    if (user.role !== "MAJELIS") {
      return res
        .status(403)
        .json(apiResponse(false, null, "Akses ditolak. Hanya untuk Majelis"));
    }

    // Get majelis data to get rayon id
    const majelis = await prisma.majelis.findUnique({
      where: { id: user.idMajelis },
      include: {
        rayon: true,
      },
    });

    if (!majelis || !majelis.idRayon) {
      return res
        .status(404)
        .json(
          apiResponse(
            false,
            null,
            "Data majelis atau rayon tidak ditemukan"
          )
        );
    }

    let { username, email, password, idJemaat, noWhatsapp } = req.body;

    // Convert empty strings to null for optional fields
    idJemaat = idJemaat && idJemaat.trim() !== "" ? idJemaat : null;
    noWhatsapp = noWhatsapp && noWhatsapp.trim() !== "" ? noWhatsapp : null;

    // Validate required fields
    if (!username || !email || !password) {
      return res
        .status(400)
        .json(
          apiResponse(false, null, "Username, email, dan password wajib diisi")
        );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Email sudah terdaftar"));
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Username sudah terdaftar"));
    }

    // Validate jemaat if idJemaat is provided
    if (idJemaat) {
      const jemaat = await prisma.jemaat.findUnique({
        where: { id: idJemaat },
        include: {
          keluarga: {
            include: {
              rayon: true,
            },
          },
        },
      });

      if (!jemaat) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Data jemaat tidak ditemukan"));
      }

      // Validate that jemaat belongs to majelis's rayon
      if (jemaat.keluarga?.idRayon !== majelis.idRayon) {
        return res
          .status(403)
          .json(
            apiResponse(
              false,
              null,
              "Jemaat ini bukan dari rayon Anda. Anda hanya bisa membuat akun untuk jemaat di rayon Anda"
            )
          );
      }

      // Check if jemaat already has a user account
      const existingUserForJemaat = await prisma.user.findUnique({
        where: { idJemaat },
      });

      if (existingUserForJemaat) {
        return res
          .status(409)
          .json(
            apiResponse(false, null, "Jemaat ini sudah memiliki akun user")
          );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        noWhatsapp,
        role: "JEMAAT", // Force role to JEMAAT
        idJemaat: idJemaat || null,
        idRayon: majelis.idRayon, // Auto-assign rayon dari majelis
      },
      select: {
        id: true,
        username: true,
        email: true,
        noWhatsapp: true,
        role: true,
        idJemaat: true,
        idRayon: true,
        createdAt: true,
        updatedAt: true,
        rayon: {
          select: {
            id: true,
            namaRayon: true,
          },
        },
        jemaat: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, newUser, "User berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menambahkan user", error.message));
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});
