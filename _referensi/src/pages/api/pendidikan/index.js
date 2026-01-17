import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
 
export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { page = 1, limit = 1000, search = "" } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = search
        ? {
            jenjang: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {};

      const total = await prisma.pendidikan.count({ where });

      const pendidikan = await prisma.pendidikan.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          jenjang: "asc",
        },
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        apiResponse(true, {
          items: pendidikan,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        })
      );
    } catch (error) {
      console.error("Error fetching pendidikan:", error);
      res
        .status(500)
        .json(
          apiResponse(
            false,
            null,
            "Gagal mengambil data pendidikan",
            error.message
          )
        );
    }
  } else if (req.method === "POST") {
    try {
      const { jenjang } = req.body;

      if (!jenjang || jenjang.trim() === "") {
        return res.status(400).json(
          apiResponse(false, null, "Jenjang pendidikan wajib diisi", {
            jenjang: "Jenjang pendidikan tidak boleh kosong",
          })
        );
      }

      const existing = await prisma.pendidikan.findFirst({
        where: {
          jenjang: {
            equals: jenjang.trim(),
            mode: "insensitive",
          },
        },
      });

      if (existing) {
        return res.status(409).json(
          apiResponse(false, null, "Jenjang pendidikan sudah ada", {
            jenjang: "Jenjang ini sudah terdaftar",
          })
        );
      }

      const created = await prisma.pendidikan.create({
        data: { jenjang: jenjang.trim() },
      });

      res
        .status(201)
        .json(
          apiResponse(true, created, "Data pendidikan berhasil ditambahkan")
        );
    } catch (error) {
      console.error("Error creating pendidikan:", error);
      res
        .status(500)
        .json(
          apiResponse(false, null, "Gagal menambahkan data", error.message)
        );
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
