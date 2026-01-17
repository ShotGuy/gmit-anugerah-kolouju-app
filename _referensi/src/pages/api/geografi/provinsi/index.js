import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { parseQueryParams } from "@/lib/queryParams";

// export default async  function handler

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "nama", // <- this is your Prisma model field
      defaultSortBy: "nama",
    });

    const total = await prisma.provinsi.count({ where });

    const items = await prisma.provinsi.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
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
    // eslint-disable-next-line no-console
    console.error("Error fetching jaminan kesehatan:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jaminan kesehatan",
          error.message
        )
      );
  }
}

async function handlePost(req, res) {
  try {
    const { nama } = req.body;

    // Validasi input
    if (!nama || nama.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama provinsi wajib diisi",
        })
      );
    }

    // Cek duplikasi
    const existingProvinsi = await prisma.provinsi.findFirst({
      where: {
        nama: {
          equals: nama.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingProvinsi) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          nama: "Provinsi ini sudah terdaftar",
        })
      );
    }

    // Buat data baru
    const newProvinsi = await prisma.provinsi.create({
      data: {
        nama: nama.trim(),
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(true, newProvinsi, "Data provinsi berhasil ditambahkan")
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating provinsi:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data provinsi",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedItem = await prisma.provinsi.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedItem, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting provinsi:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menghapus data provinsi", error.message)
      );
  }
}
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { nama } = req.body;

    if (!nama || nama.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama provinsi wajib diisi",
        })
      );
    }

    const updatedProvinsi = await prisma.provinsi.update({
      where: { id: id },
      data: {
        nama: nama.trim(),
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedProvinsi, "Data provinsi berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating provinsi:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data provinsi",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
  DELETE: handleDelete,
  PUT: handlePut,
});
