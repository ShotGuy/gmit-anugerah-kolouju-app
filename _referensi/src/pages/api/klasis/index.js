import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "nama",
      defaultSortBy: "nama",
    });

    const total = await prisma.klasis.count({ where });

    const items = await prisma.klasis.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
      include: {
        _count: {
          select: {
            pernikahans: true,
            baptiss: true,
            sidis: true,
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
    console.error("Error fetching klasis:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data klasis", error.message)
      );
  }
}

async function handlePost(req, res) {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama klasis wajib diisi"));
    }

    // Check if already exists
    const existingKlasis = await prisma.klasis.findFirst({
      where: { 
        nama: {
          equals: nama,
          mode: 'insensitive'
        }
      },
    });

    if (existingKlasis) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Klasis sudah ada"));
    }

    const newKlasis = await prisma.klasis.create({
      data: {
        nama,
      },
      include: {
        _count: {
          select: {
            pernikahans: true,
            baptiss: true,
            sidis: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, newKlasis, "Klasis berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating klasis:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menambahkan klasis", error.message));
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});