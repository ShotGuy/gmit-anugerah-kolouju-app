import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const provinsi = await prisma.provinsi.findUnique({
      where: { id: id },
    });

    if (!provinsi) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data provinsi tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, provinsi, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching provinsi:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data provinsi",
          error.message
        )
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

    // Check for duplicates excluding current record
    const existingProvinsi = await prisma.provinsi.findFirst({
      where: {
        nama: {
          equals: nama.trim(),
          mode: "insensitive",
        },
        id: {
          not: id,
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

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedProvinsi = await prisma.provinsi.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedProvinsi, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting provinsi:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menghapus data provinsi", error.message)
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PUT: handlePut,
  DELETE: handleDelete,
});