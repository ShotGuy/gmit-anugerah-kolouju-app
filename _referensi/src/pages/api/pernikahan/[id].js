import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const pernikahan = await prisma.pernikahan.findUnique({
        where: { id },
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
              keluarga: {
                select: {
                  id: true,
                  noBagungan: true,
                  rayon: {
                    select: {
                      namaRayon: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!pernikahan) {
        return res.status(404).json(
          apiResponse(false, null, "Data pernikahan tidak ditemukan")
        );
      }

      res.status(200).json(apiResponse(true, pernikahan));
    } catch (error) {
      console.error("Error fetching pernikahan by id:", error);
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
  } else if (req.method === "PUT") {
    try {
      const { idKlasis, tanggal, jemaatIds } = req.body;

      // Validasi required fields
      if (!idKlasis || !tanggal) {
        return res.status(400).json(
          apiResponse(false, null, "Klasis dan tanggal wajib diisi")
        );
      }

      // Cek apakah pernikahan exists
      const existingPernikahan = await prisma.pernikahan.findUnique({
        where: { id },
        include: {
          jemaats: {
            select: { id: true },
          },
        },
      });

      if (!existingPernikahan) {
        return res.status(404).json(
          apiResponse(false, null, "Data pernikahan tidak ditemukan")
        );
      }

      // Update dalam transaction
      const result = await prisma.$transaction(async (tx) => {
        // Reset jemaat lama
        await tx.jemaat.updateMany({
          where: {
            id: { in: existingPernikahan.jemaats.map((j) => j.id) },
          },
          data: {
            idPernikahan: null,
          },
        });

        // Update pernikahan
        const updatedPernikahan = await tx.pernikahan.update({
          where: { id },
          data: {
            idKlasis,
            tanggal: new Date(tanggal),
          },
        });

        // Set jemaat baru jika ada
        if (jemaatIds && jemaatIds.length > 0) {
          await tx.jemaat.updateMany({
            where: {
              id: { in: jemaatIds },
            },
            data: {
              idPernikahan: updatedPernikahan.id,
            },
          });
        }

        // Return dengan relasi
        return await tx.pernikahan.findUnique({
          where: { id },
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
        .status(200)
        .json(apiResponse(true, result, "Data pernikahan berhasil diperbarui"));
    } catch (error) {
      console.error("Error updating pernikahan:", error);
      res
        .status(500)
        .json(
          apiResponse(false, null, "Gagal memperbarui data", error.message)
        );
    }
  } else if (req.method === "DELETE") {
    try {
      // Cek apakah pernikahan exists
      const existingPernikahan = await prisma.pernikahan.findUnique({
        where: { id },
        include: {
          jemaats: {
            select: { id: true },
          },
        },
      });

      if (!existingPernikahan) {
        return res.status(404).json(
          apiResponse(false, null, "Data pernikahan tidak ditemukan")
        );
      }

      // Delete dalam transaction
      await prisma.$transaction(async (tx) => {
        // Reset jemaat
        await tx.jemaat.updateMany({
          where: {
            id: { in: existingPernikahan.jemaats.map((j) => j.id) },
          },
          data: {
            idPernikahan: null,
          },
        });

        // Delete pernikahan
        await tx.pernikahan.delete({
          where: { id },
        });
      });

      res
        .status(200)
        .json(apiResponse(true, null, "Data pernikahan berhasil dihapus"));
    } catch (error) {
      console.error("Error deleting pernikahan:", error);
      res
        .status(500)
        .json(
          apiResponse(false, null, "Gagal menghapus data", error.message)
        );
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}