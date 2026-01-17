import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "jemaat.nama",
      defaultSortBy: "tanggal",
      defaultSortOrder: "desc",
    });

    // Build search conditions
    const searchConditions = {
      ...where,
    };

    // Handle jemaat name search
    if (where["jemaat.nama"]) {
      searchConditions.OR = [
        {
          jemaat: {
            nama: {
              contains: where["jemaat.nama"],
              mode: "insensitive",
            },
          },
        },
        {
          namaCalonJemaat: {
            contains: where["jemaat.nama"],
            mode: "insensitive",
          },
        },
      ];
      delete searchConditions["jemaat.nama"];
    }

    const total = await prisma.atestasi.count({
      where: searchConditions,
    });

    const items = await prisma.atestasi.findMany({
      where: searchConditions,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
      include: {
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            status: true,
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
        klasis: {
          select: {
            id: true,
            nama: true,
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
    console.error("Error fetching atestasi:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data atestasi", error.message)
      );
  }
}

async function handlePost(req, res) {
  try {
    const {
      tipe,
      tanggal,
      idJemaat,
      idKlasis,
      gerejaAsal,
      gerejaTujuan,
      alasan,
      keterangan,
      namaCalonJemaat,
    } = req.body;

    // Validasi required fields
    if (!tipe || !tanggal) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Tipe dan tanggal wajib diisi"));
    }

    if (tipe === "MASUK" && !namaCalonJemaat) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama calon jemaat wajib diisi untuk atestasi masuk"));
    }

    if (tipe === "KELUAR" && !idJemaat) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Jemaat harus dipilih untuk atestasi keluar"));
    }

    // Validasi jemaat jika ada idJemaat
    if (idJemaat) {
      const jemaat = await prisma.jemaat.findUnique({
        where: { id: idJemaat },
      });

      if (!jemaat) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Data jemaat tidak ditemukan"));
      }

      // Update status jemaat jika keluar
      if (tipe === "KELUAR") {
        await prisma.jemaat.update({
          where: { id: idJemaat },
          data: { status: "KELUAR" },
        });
      }
    }

    const newAtestasi = await prisma.atestasi.create({
      data: {
        tipe,
        tanggal: new Date(tanggal),
        idJemaat: idJemaat || null,
        idKlasis: idKlasis || null,
        gerejaAsal,
        gerejaTujuan,
        alasan,
        keterangan,
        namaCalonJemaat,
      },
      include: {
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            status: true,
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
        klasis: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, newAtestasi, "Data atestasi berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating atestasi:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menambahkan data atestasi", error.message));
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});