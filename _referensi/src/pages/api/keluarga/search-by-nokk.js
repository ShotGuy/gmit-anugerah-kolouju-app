import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { noKK } = req.body;

    // Validate noKK
    if (!noKK) {
      return res.status(400).json({
        success: false,
        message: "Nomor KK harus diisi",
      });
    }

    // Validate noKK length (must be 16 digits)
    if (noKK.length !== 16) {
      return res.status(400).json({
        success: false,
        message: "Nomor KK harus 16 digit",
      });
    }

    // Validate noKK is numeric
    if (!/^\d+$/.test(noKK)) {
      return res.status(400).json({
        success: false,
        message: "Nomor KK harus berupa angka",
      });
    }

    // Search keluarga by noKK
    const keluarga = await prisma.keluarga.findUnique({
      where: {
        noKK: noKK,
      },
      include: {
        rayon: true,
        alamat: {
          include: {
            kelurahan: {
              include: {
                kecamatan: {
                  include: {
                    kotaKab: true,
                  },
                },
              },
            },
          },
        },
        jemaats: {
          where: {
            statusDalamKeluarga: {
              status: "Kepala Keluarga",
            },
          },
          include: {
            statusDalamKeluarga: true,
          },
        },
      },
    });

    if (!keluarga) {
      return res.status(404).json({
        success: false,
        message: "Keluarga dengan nomor KK tersebut tidak ditemukan",
      });
    }

    // Get kepala keluarga
    const kepalaKeluarga = keluarga.jemaats[0];

    return res.status(200).json({
      success: true,
      message: "Keluarga ditemukan",
      data: {
        id: keluarga.id,
        noBagungan: keluarga.noBagungan,
        noKK: keluarga.noKK,
        rayon: keluarga.rayon?.namaRayon,
        alamat: keluarga.alamat
          ? `${keluarga.alamat.jalan}, RT ${keluarga.alamat.rt}/RW ${keluarga.alamat.rw}, ${keluarga.alamat.kelurahan?.nama}, ${keluarga.alamat.kelurahan?.kecamatan?.nama}, ${keluarga.alamat.kelurahan?.kecamatan?.kotaKab?.nama}`
          : null,
        kepalaKeluarga: kepalaKeluarga
          ? {
              nama: kepalaKeluarga.nama,
              id: kepalaKeluarga.id,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error searching keluarga by noKK:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mencari data keluarga",
      error: error.message,
    });
  }
}
