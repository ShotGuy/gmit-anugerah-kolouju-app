import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { staffOnly } from "@/lib/apiMiddleware";
import { z } from "zod";

// Validation schema
const alamatSchema = z.object({
  rt: z.number().int().min(1, "RT wajib diisi"),
  rw: z.number().int().min(1, "RW wajib diisi"),
  jalan: z.string().min(1, "Jalan wajib diisi"),
  idKelurahan: z.string().nonempty("Kelurahan wajib dipilih"),
});

async function handlePost(req, res) {
  try {
    // Validate request body
    const validation = alamatSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json(
        apiResponse(false, null, "Data tidak valid", validation.error.errors)
      );
    }

    const { rt, rw, jalan, idKelurahan } = validation.data;

    // Check if kelurahan exists
    const kelurahan = await prisma.kelurahan.findUnique({
      where: { id: idKelurahan }
    });

    if (!kelurahan) {
      return res.status(404).json(
        apiResponse(false, null, "Kelurahan tidak ditemukan")
      );
    }

    // Create alamat
    const alamat = await prisma.alamat.create({
      data: {
        rt,
        rw,
        jalan,
        idKelurahan,
      },
      include: {
        kelurahan: {
          include: {
            kecamatan: {
              include: {
                kotaKab: {
                  include: {
                    provinsi: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return res.status(201).json(
      apiResponse(true, alamat, "Alamat berhasil dibuat")
    );

  } catch (error) {
    console.error("Error creating alamat:", error);
    return res.status(500).json(
      apiResponse(false, null, "Gagal membuat alamat", error.message)
    );
  }
}

async function handleGet(req, res) {
  try {
    const alamats = await prisma.alamat.findMany({
      include: {
        kelurahan: {
          include: {
            kecamatan: {
              include: {
                kotaKab: {
                  include: {
                    provinsi: true
                  }
                }
              }
            }
          }
        },
        keluargas: {
          select: {
            id: true,
            noBagungan: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    return res.status(200).json(
      apiResponse(true, alamats, "Data alamat berhasil diambil")
    );

  } catch (error) {
    console.error("Error fetching alamats:", error);
    return res.status(500).json(
      apiResponse(false, null, "Gagal mengambil data alamat", error.message)
    );
  }
}

export default staffOnly(createApiHandler({
  GET: handleGet,
  POST: handlePost,
}));