import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { parseQueryParams } from "@/lib/queryParams";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "namaRayon",
      defaultSortBy: "namaRayon",
    });

    const total = await prisma.rayon.count({ where });

    const items = await prisma.rayon.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        namaRayon: true,
        _count: {
          select: {
            keluargas: true, // hanya hitung jumlah keluarga
          },
        },
      },
    });

    // Sort berdasarkan angka di dalam nama rayon jika sortBy adalah namaRayon
    let sortedItems = items;

    if (sort.sortBy === "namaRayon") {
      sortedItems = items.sort((a, b) => {
        const numA = parseInt(a.namaRayon.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.namaRayon.match(/\d+/)?.[0] || "0");

        return sort.sortOrder === "asc" ? numA - numB : numB - numA;
      });
    } else {
      sortedItems = items.sort((a, b) => {
        if (sort.sortOrder === "asc") {
          return a[sort.sortBy] > b[sort.sortBy] ? 1 : -1;
        }

        return a[sort.sortBy] < b[sort.sortBy] ? 1 : -1;
      });
    }

    const totalPages = Math.ceil(total / pagination.limit);

    const result = {
      items: sortedItems.map((item) => ({
        id: item.id,
        namaRayon: item.namaRayon,
        totalKeluarga: item._count.keluargas, // ubah nama field untuk lebih jelas
      })),
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
    console.error("Error fetching rayon:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data rayon", error.message)
      );
  }
}

async function handlePost(req, res) {
  try {
    const { namaRayon } = req.body;

    // Validate required fields
    if (!namaRayon) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama rayon wajib diisi"));
    }

    // Check if rayon name already exists
    const existingRayon = await prisma.rayon.findFirst({
      where: {
        namaRayon: {
          equals: namaRayon,
          mode: "insensitive",
        },
      },
    });

    if (existingRayon) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Nama rayon sudah ada"));
    }

    const newRayon = await prisma.rayon.create({
      data: {
        namaRayon,
      },
      include: {
        _count: {
          select: {
            keluargas: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, newRayon, "Data rayon berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating rayon:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menambahkan data rayon", error.message)
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});
