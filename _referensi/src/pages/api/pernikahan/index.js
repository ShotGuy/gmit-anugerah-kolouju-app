import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = search
        ? {
            OR: [
              {
                klasis: {
                  nama: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                jemaats: {
                  some: {
                    nama: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {};

      const total = await prisma.pernikahan.count({ where });

      const pernikahan = await prisma.pernikahan.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          klasis: {
            select: {
              id: true,
              nama: true,
            },
          },
          jemaats: {
            select: {
              id: true,
              nama: true,
              jenisKelamin: true,
            },
          },
        },
        orderBy: {
          tanggal: "desc",
        },
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        apiResponse(true, {
          items: pernikahan,
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
      console.error("Error fetching pernikahan:", error);
      res
        .status(500)
        .json(
          apiResponse(
            false,
            null,
            "Gagal mengambil data pernikahan",
            error.message
          )
        );
    }
  } else if (req.method === "POST") {
    try {
      const { idKlasis, tanggal, jemaatIds } = req.body;

      // Validasi required fields
      if (!idKlasis || !tanggal) {
        return res.status(400).json(
          apiResponse(false, null, "Klasis dan tanggal wajib diisi", {
            idKlasis: !idKlasis ? "Klasis tidak boleh kosong" : undefined,
            tanggal: !tanggal ? "Tanggal tidak boleh kosong" : undefined,
          })
        );
      }

      // Validasi minimal 1 jemaat
      if (!jemaatIds || !Array.isArray(jemaatIds) || jemaatIds.length === 0) {
        return res.status(400).json(
          apiResponse(false, null, "Minimal harus ada 1 jemaat yang dipilih", {
            jemaatIds: "Pilih minimal 1 jemaat",
          })
        );
      }

      // Cek apakah jemaat sudah menikah
      const existingMarriage = await prisma.jemaat.findMany({
        where: {
          id: { in: jemaatIds },
          idPernikahan: { not: null },
        },
        select: {
          id: true,
          nama: true,
        },
      });

      if (existingMarriage.length > 0) {
        return res.status(409).json(
          apiResponse(
            false,
            null,
            "Beberapa jemaat sudah menikah",
            `Jemaat berikut sudah menikah: ${existingMarriage
              .map((j) => j.nama)
              .join(", ")}`
          )
        );
      }

      // Create pernikahan dalam transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create pernikahan
        const pernikahan = await tx.pernikahan.create({
          data: {
            idKlasis,
            tanggal: new Date(tanggal),
          },
        });

        // Update jemaat dengan idPernikahan
        await tx.jemaat.updateMany({
          where: {
            id: { in: jemaatIds },
          },
          data: {
            idPernikahan: pernikahan.id,
          },
        });

        // Return pernikahan dengan relasi
        return await tx.pernikahan.findUnique({
          where: { id: pernikahan.id },
          include: {
            klasis: {
              select: {
                id: true,
                nama: true,
              },
            },
            jemaats: {
              select: {
                id: true,
                nama: true,
                jenisKelamin: true,
              },
            },
          },
        });
      });

      res
        .status(201)
        .json(
          apiResponse(true, result, "Data pernikahan berhasil ditambahkan")
        );
    } catch (error) {
      console.error("Error creating pernikahan:", error);
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