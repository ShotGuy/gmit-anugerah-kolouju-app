import bcrypt from "bcryptjs";

import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { adminOnly } from "@/lib/apiMiddleware";
import prisma from "@/lib/prisma";
import { parseQueryParams } from "@/lib/queryParams";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: ["username", "email"],
      defaultSortBy: "username",
    });

    const total = await prisma.user.count({ where });

    const items = await prisma.user.findMany({
      where,
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

async function handlePost(req, res) {
  try {
    let { username, email, password, role, idJemaat, noWhatsapp } = req.body;

    // Convert empty strings to null for optional fields
    idJemaat = idJemaat && idJemaat.trim() !== "" ? idJemaat : null;
    noWhatsapp = noWhatsapp && noWhatsapp.trim() !== "" ? noWhatsapp : null;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Email sudah terdaftar"));
    }

    // Check if username already exists (only if username is provided)
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        return res
          .status(409)
          .json(apiResponse(false, null, "Username sudah terdaftar"));
      }
    } else {
      return res
        .status(400)
        .json(apiResponse(false, null, "Username wajib diisi"));
    }

    // Validate jemaat if role is JEMAAT and idJemaat is provided
    if (role === "JEMAAT" && idJemaat) {
      try {
        const jemaat = await prisma.jemaat.findUnique({
          where: { id: idJemaat },
        });

        if (!jemaat) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Data jemaat tidak ditemukan"));
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
      } catch (jemaatError) {
        console.error("Error validating jemaat:", jemaatError);

        return res
          .status(500)
          .json(apiResponse(false, null, "Gagal memvalidasi data jemaat"));
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
        role,
        idJemaat: role === "JEMAAT" && idJemaat ? idJemaat : null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        noWhatsapp: true,
        role: true,
        idJemaat: true,
        createdAt: true,
        updatedAt: true,
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
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menambahkan user", error.message));
  }
}

// Apply admin-only middleware to user management endpoints
export default adminOnly(
  createApiHandler({
    GET: handleGet,
    POST: handlePost,
  })
);
