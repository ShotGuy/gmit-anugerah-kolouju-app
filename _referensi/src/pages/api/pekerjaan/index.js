import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "namaPekerjaan",
      defaultSortBy: "namaPekerjaan",
    });

    const total = await prisma.pekerjaan.count({ where });

    const items = await prisma.pekerjaan.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit, // Corrected from .take
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
    console.error("Error fetching pekerjaan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data pekerjaan",
          error.message
        )
      );
  }
}

async function handlePost(req, res) {
  try {
    const data = req.body;

    const newPekerjaan = await prisma.pekerjaan.create({
      data,
    });

    return res
      .status(201)
      .json(apiResponse(true, newPekerjaan, "Data berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating pekerjaan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data pekerjaan",
          error.message
        )
      );
  }
}


export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});
