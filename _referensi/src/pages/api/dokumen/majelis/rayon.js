import { verifyToken } from "@/lib/jwt";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan",
    });
  }

  try {
    const user = verifyToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    if (user.role !== "MAJELIS") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya majelis yang dapat mengakses",
      });
    }

    // Get majelis data with rayon info
    const majelis = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        majelis: {
          include: {
            rayon: true,
          },
        },
      },
    });

    if (!majelis?.majelis?.rayon) {
      return res.status(404).json({
        success: false,
        message: "Majelis tidak memiliki rayon yang ditugaskan",
      });
    }

    const rayonId = majelis.majelis.rayon.id;

    // Get all documents from jemaat in the majelis's rayon
    const dokumen = await prisma.dokumenJemaat.findMany({
      where: {
        jemaat: {
          keluarga: {
            rayon: {
              id: rayonId,
            },
          },
        },
      },
      orderBy: [
        { statusDokumen: "asc" }, // PENDING first
        { createdAt: "desc" },
      ],
      include: {
        jemaat: {
          select: {
            id: true,
            nama: true,
            keluarga: {
              select: {
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
        uploader: {
          select: {
            id: true,
            username: true,
          },
        },
        verifier: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        rayon: majelis.majelis.rayon,
        dokumen: dokumen,
      },
      message: "Data dokumen berhasil diambil",
    });
  } catch (error) {
    console.error("Get rayon dokumen error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data dokumen",
    });
  }
}
