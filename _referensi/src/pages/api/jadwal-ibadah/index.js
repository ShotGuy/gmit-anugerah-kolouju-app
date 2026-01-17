import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseQueryParams } from "@/lib/queryParams";

async function handleGet(req, res) {
  try {
    // Check authentication
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    const { pagination, sort, where: baseWhere } = parseQueryParams(req.query, {
      searchField: "judul",
      defaultSortBy: "tanggal",
      defaultSortOrder: "asc"
    });

    // Extract additional query parameters
    const { rayon, month, year } = req.query;

    // Build where clause based on user role and filters
    let where = { ...baseWhere };

    // Handle rayon filter
    if (rayon) {
      where = {
        ...where,
        OR: [
          // Jadwal ibadah yang terkait dengan rayon tertentu
          { idRayon: rayon },
          // Jadwal ibadah keluarga dimana keluarga ada di rayon tertentu
          {
            keluarga: {
              idRayon: rayon
            }
          }
        ]
      };
    }
    // If user is MAJELIS, filter by their rayon
    else if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
      where = {
        ...where,
        OR: [
          // Jadwal ibadah yang terkait dengan rayon majelis
          { idRayon: user.majelis.idRayon },
          // Jadwal ibadah keluarga dimana keluarga ada di rayon majelis
          {
            keluarga: {
              idRayon: user.majelis.idRayon
            }
          }
        ]
      };
    }
    // If user is JEMAAT, filter by their rayon
    else if (user.role === 'JEMAAT' && user.jemaat && user.jemaat.keluarga && user.jemaat.keluarga.idRayon) {
      where = {
        ...where,
        OR: [
          // Jadwal ibadah yang terkait dengan rayon jemaat
          { idRayon: user.jemaat.keluarga.idRayon },
          // Jadwal ibadah keluarga dimana keluarga ada di rayon jemaat
          {
            keluarga: {
              idRayon: user.jemaat.keluarga.idRayon
            }
          }
        ]
      };
    }

    // Handle month/year filter
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month

      where = {
        ...where,
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    const total = await prisma.jadwalIbadah.count({ where });

    const items = await prisma.jadwalIbadah.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
      include: {
        jenisIbadah: {
          select: {
            id: true,
            namaIbadah: true,
          }
        },
        kategori: {
          select: {
            id: true,
            namaKategori: true,
          }
        },
        pemimpin: {
          select: {
            id: true,
            nama: true,
          }
        },
        keluarga: {
          select: {
            id: true,
            noBagungan: true,
            rayon: {
              select: {
                id: true,
                namaRayon: true,
              }
            }
          }
        },
        rayon: {
          select: {
            id: true,
            namaRayon: true,
          }
        },
        pembuat: {
          select: {
            id: true,
            // namaLengkap: true,
          }
        }
      },
    });

    // If this is a simple filter request (like from jemaat page), return just items
    if (rayon || (month && year)) {
      return res
        .status(200)
        .json(apiResponse(true, items, "Data berhasil diambil"));
    }

    // Otherwise, return with pagination
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
    console.error("Error fetching jadwal ibadah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jadwal ibadah",
          error.message
        )
      );
  }
}

async function handlePost(req, res) {
  try {
    // Check authentication (ADMIN, MAJELIS, EMPLOYEE)
    const authResult = await requireAuth(req, res, ['ADMIN', 'MAJELIS', 'EMPLOYEE']);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;

    // Strict Permission Check for Employees
    if (user.role === 'EMPLOYEE') {
      const pegawaiCheck = await prisma.pegawai.findUnique({
        where: { id: user.idPegawai },
      });

      if (!pegawaiCheck?.canCreateJadwal) {
        return res.status(403).json(apiResponse(false, null, "Anda tidak memiliki izin untuk membuat jadwal ibadah."));
      }
    }

    const {
      idJenisIbadah,
      waktuMulai,
      waktuSelesai,
      alamat,
      lokasi,
      latitude,
      longitude,
      googleMapsLink,
      firman,
      tema,
      keterangan,
      jumlahLaki,
      jumlahPerempuan,
      targetPeserta
    } = req.body;

    if (!idJenisIbadah || !idKategori || !idPemimpin || !judul || !tanggal) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Field wajib harus diisi"));
    }

    // If user is MAJELIS, ensure they can only create jadwal for their rayon
    const createData = {
      idJenisIbadah,
      idKategori,
      idPemimpin,
      judul,
      tanggal: new Date(tanggal),
      waktuMulai: waktuMulai ? new Date(`1970-01-01T${waktuMulai}:00.000Z`) : null,
      waktuSelesai: waktuSelesai ? new Date(`1970-01-01T${waktuSelesai}:00.000Z`) : null,
      alamat,
      lokasi,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      googleMapsLink,
      firman,
      tema,
      keterangan,
      jumlahLaki,
      jumlahPerempuan,
      targetPeserta,
      idPembuat: user.role === 'MAJELIS' ? user.idMajelis : null
    };

    // Add rayon or keluarga based on what's provided
    if (idRayon) {
      // If user is MAJELIS, ensure they can only create for their rayon
      if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon !== idRayon) {
        return res
          .status(403)
          .json(apiResponse(false, null, "Tidak dapat membuat jadwal untuk rayon lain"));
      }
      createData.idRayon = idRayon;
    }

    if (idKeluarga) {
      // If user is MAJELIS, ensure the keluarga is in their rayon
      if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
        const keluarga = await prisma.keluarga.findUnique({
          where: { id: idKeluarga },
          select: { idRayon: true }
        });

        if (!keluarga || keluarga.idRayon !== user.majelis.idRayon) {
          return res
            .status(403)
            .json(apiResponse(false, null, "Tidak dapat membuat jadwal untuk keluarga di rayon lain"));
        }
      }
      createData.idKeluarga = idKeluarga;
    }

    const newJadwalIbadah = await prisma.jadwalIbadah.create({
      data: createData,
      include: {
        jenisIbadah: {
          select: {
            id: true,
            namaIbadah: true,
          }
        },
        kategori: {
          select: {
            id: true,
            namaKategori: true,
          }
        },
        pemimpin: {
          select: {
            id: true,
            nama: true,
          }
        },
        keluarga: {
          select: {
            id: true,
            noBagungan: true,
            rayon: {
              select: {
                id: true,
                namaRayon: true,
              }
            }
          }
        },
        rayon: {
          select: {
            id: true,
            namaRayon: true,
          }
        },
        pembuat: {
          select: {
            id: true,
            namaLengkap: true,
          }
        }
      }
    });

    return res
      .status(201)
      .json(
        apiResponse(true, newJadwalIbadah, "Jadwal ibadah berhasil ditambahkan")
      );
  } catch (error) {
    console.error("Error creating jadwal ibadah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan jadwal ibadah",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});