import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "nama", // <- this is your Prisma model field
      defaultSortBy: "nama",
    });

    const total = await prisma.kecamatan.count({ where });

    const items = await prisma.kecamatan.findMany({
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
    console.error("Error fetching kecamatan:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data kecamatan",
          error.message
        )
      );
  }
}

async function handlePost(req, res) {
  try {
    const newKecamatan = await prisma.kecamatan.create({
      data: req.body,
    });
    return res
      .status(201)
      .json(apiResponse(true, newKecamatan, "Data berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating kecamatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data kecamatan",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedItem = await prisma.kecamatan.delete({
      where: { id: Number(id) },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedItem, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting kecamatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data kecamatan",
          error.message
        )
      );
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedKecamatan = await prisma.kecamatan.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedKecamatan, "Data kecamatan berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating kecamatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data kecamatan",
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
