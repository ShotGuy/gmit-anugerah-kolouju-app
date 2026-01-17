import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method === "GET") {
    try {
      const data = await prisma.pendidikan.findUnique({
        where: { id },
      });

      if (!data) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Data tidak ditemukan"));
      }

      res.status(200).json(apiResponse(true, data));
    } catch (error) {
      res
        .status(500)
        .json(apiResponse(false, null, "Gagal mengambil data", error.message));
    }
  } else if (method === "PATCH" || method === "PUT") {
    try {
      const { jenjang, isActive } = req.body;

      // Check if jenjang already exists (exclude current record)
      if (jenjang) {
        const duplicatePendidikan = await prisma.pendidikan.findFirst({
          where: {
            jenjang: {
              equals: jenjang,
              mode: "insensitive",
            },
            NOT: { id: id },
          },
        });

        if (duplicatePendidikan) {
          return res
            .status(409)
            .json(apiResponse(false, null, "Jenjang pendidikan sudah ada"));
        }
      }

      const updated = await prisma.pendidikan.update({
        where: { id },
        data: { jenjang, isActive },
      });

      res
        .status(200)
        .json(apiResponse(true, updated, "Data berhasil diperbarui"));
    } catch (error) {
      res
        .status(500)
        .json(apiResponse(false, null, "Gagal update data", error.message));
    }
  } else if (method === "DELETE") {
    try {
      await prisma.pendidikan.delete({
        where: { id },
      });

      res.status(200).json(apiResponse(true, null, "Data berhasil dihapus"));
    } catch (error) {
      res
        .status(500)
        .json(apiResponse(false, null, "Gagal hapus data", error.message));
    }
  } else {
    res.setHeader("Allow", ["GET", "PATCH", "PUT", "DELETE"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
