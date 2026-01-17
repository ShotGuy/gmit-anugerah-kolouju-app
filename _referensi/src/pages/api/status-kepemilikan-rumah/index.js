import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      case "PUT":
        return await handlePut(req, res);
      case "DELETE":
        return await handleDelete(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);

        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

// GET - Ambil semua data status kepemilikan rumah
async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "status",
      sortOrder = "asc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter untuk search
    const where = search
      ? {
          status: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    // Get total count untuk pagination
    const total = await prisma.statusKepemilikanRumah.count({ where });

    // Get data dengan pagination
    const statusKepemilikanRumah = await prisma.statusKepemilikanRumah.findMany(
      {
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }
    );

    const totalPages = Math.ceil(total / limitNum);

    const result = {
      items: statusKepemilikanRumah,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          result,
          "Data status kepemilikan rumah berhasil diambil"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching status kepemilikan rumah:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data status kepemilikan rumah",
          error.message
        )
      );
  }
}

// POST - Tambah data status kepemilikan rumah baru
async function handlePost(req, res) {
  try {
    const { status } = req.body;

    // Validasi input
    if (!status || status.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          status: "Status kepemilikan rumah wajib diisi",
        })
      );
    }

    // Cek duplikasi
    const existingStatus = await prisma.statusKepemilikanRumah.findFirst({
      where: {
        status: {
          equals: status.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingStatus) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          status: "Status kepemilikan rumah ini sudah terdaftar",
        })
      );
    }

    // Buat data baru
    const newStatus = await prisma.statusKepemilikanRumah.create({
      data: {
        status: status.trim(),
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(
          true,
          newStatus,
          "Data status kepemilikan rumah berhasil ditambahkan"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating status kepemilikan rumah:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data status kepemilikan rumah",
          error.message
        )
      );
  }
}

// PUT - Update data status kepemilikan rumah
async function handlePut(req, res) {
  try {
    const { id, status } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID status kepemilikan rumah wajib diisi",
        })
      );
    }

    if (!status || status.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          status: "Status kepemilikan rumah wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingStatus = await prisma.statusKepemilikanRumah.findUnique({
      where: { id },
    });

    if (!existingStatus) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek duplikasi (kecuali untuk data yang sedang di-update)
    const duplicateCheck = await prisma.statusKepemilikanRumah.findFirst({
      where: {
        AND: [
          {
            status: {
              equals: status.trim(),
              mode: "insensitive",
            },
          },
          {
            NOT: {
              id: id,
            },
          },
        ],
      },
    });

    if (duplicateCheck) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          status: "Status kepemilikan rumah ini sudah terdaftar",
        })
      );
    }

    // Update data
    const updatedStatus = await prisma.statusKepemilikanRumah.update({
      where: { id },
      data: {
        status: status.trim(),
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedStatus,
          "Data status kepemilikan rumah berhasil diperbarui"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating status kepemilikan rumah:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data status kepemilikan rumah",
          error.message
        )
      );
  }
}

// DELETE - Hapus data status kepemilikan rumah
async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID status kepemilikan rumah wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingStatus = await prisma.statusKepemilikanRumah.findUnique({
      where: { id },
    });

    if (!existingStatus) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek apakah data sedang digunakan by keluarga
    const usageCount = await prisma.keluarga.count({
      where: {
        idStatusKepemilikanRumah: id,
      },
    });

    if (usageCount > 0) {
      return res
        .status(409)
        .json(
          apiResponse(
            false,
            null,
            "Data tidak dapat dihapus",
            `Data ini sedang digunakan oleh ${usageCount} keluarga`
          )
        );
    }

    // Hapus data
    await prisma.statusKepemilikanRumah.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          null,
          "Data status kepemilikan rumah berhasil dihapus"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting status kepemilikan rumah:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data status kepemilikan rumah",
          error.message
        )
      );
  }
}
