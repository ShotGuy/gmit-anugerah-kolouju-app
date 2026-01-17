import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function handleGet(req, res) {
  try {
    // Check authentication
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json(apiResponse(false, null, "ID jadwal ibadah diperlukan"));
    }

    const jadwalIbadah = await prisma.jadwalIbadah.findUnique({
      where: { id },
      include: {
        jenisIbadah: {
          select: {
            id: true,
            namaIbadah: true,
          }
        },
        kategori: {
          select: {
            id: true,
            namaKategori: true,
            deskripsi: true,
          }
        },
        pemimpin: {
          select: {
            id: true,
            nama: true,
          }
        },
        keluarga: {
          select: {
            id: true,
            noBagungan: true,
            rayon: {
              select: {
                id: true,
                namaRayon: true,
              }
            }
          }
        },
        rayon: {
          select: {
            id: true,
            namaRayon: true,
          }
        },
        pembuat: {
          select: {
            id: true,
            // namaLengkap: true,
          }
        }
      }
    });

    if (!jadwalIbadah) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Jadwal ibadah tidak ditemukan"));
    }

    // Check access rights based on user role
    const hasAccess = (() => {
      if (user.role === 'ADMIN') return true;

      if (user.role === 'MAJELIS' && user.majelis) {
        // Majelis can access jadwal in their rayon
        if (jadwalIbadah.idRayon === user.majelis.idRayon) return true;
        if (jadwalIbadah.keluarga && jadwalIbadah.keluarga.rayon.id === user.majelis.idRayon) return true;
      }

      if (user.role === 'JEMAAT' && user.jemaat) {
        // Jemaat can access jadwal in their rayon
        if (jadwalIbadah.idRayon === user.jemaat.keluarga.idRayon) return true;
        if (jadwalIbadah.keluarga && jadwalIbadah.keluarga.rayon.id === user.jemaat.keluarga.idRayon) return true;
      }

      return false;
    })();

    if (!hasAccess) {
      return res
        .status(403)
        .json(apiResponse(false, null, "Tidak memiliki akses ke jadwal ibadah ini"));
    }

    return res
      .status(200)
      .json(apiResponse(true, jadwalIbadah, "Data jadwal ibadah berhasil diambil"));

  } catch (error) {
    console.error("Error fetching jadwal ibadah by ID:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jadwal ibadah",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    // Check authentication
    const authResult = await requireAuth(req, res, ['ADMIN', 'MAJELIS', 'EMPLOYEE']);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json(apiResponse(false, null, "ID jadwal ibadah diperlukan"));
    }

    // Check if jadwal exists
    const existingJadwal = await prisma.jadwalIbadah.findUnique({
      where: { id },
      include: {
        keluarga: {
          select: {
            idRayon: true
          }
        }
      }
    });

    if (!existingJadwal) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Jadwal ibadah tidak ditemukan"));
    }

    // Check access rights for editing
    const canEdit = await (async () => {
      if (user.role === 'ADMIN') return true;

      // Employee check
      if (user.role === 'EMPLOYEE') {
        const pegawaiCheck = await prisma.pegawai.findUnique({
          where: { id: user.idPegawai },
          select: { canManageJadwal: true }
        });
        return pegawaiCheck?.canManageJadwal === true;
      }

      if (user.role === 'MAJELIS' && user.majelis) {
        // Majelis can edit jadwal in their rayon
        if (existingJadwal.idRayon === user.majelis.idRayon) return true;
        if (existingJadwal.keluarga && existingJadwal.keluarga.idRayon === user.majelis.idRayon) return true;
      }

      return false;
    })();

    if (!canEdit) {
      return res
        .status(403)
        .json(apiResponse(false, null, "Tidak memiliki akses untuk mengubah jadwal ibadah ini"));
    }

    const {
      idJenisIbadah,
      idKategori,
      idPemimpin,
      idKeluarga,
      idRayon,
      judul,
      tanggal,
      waktuMulai,
      waktuSelesai,
      alamat,
      lokasi,
      latitude,
      longitude,
      googleMapsLink,
      firman,
      tema,
      keterangan,
      jumlahLaki,
      jumlahPerempuan,
      targetPeserta
    } = req.body;

    // Prepare update data
    const updateData = {};

    // Only update provided fields
    if (idJenisIbadah !== undefined) updateData.idJenisIbadah = idJenisIbadah;
    if (idKategori !== undefined) updateData.idKategori = idKategori;
    if (idPemimpin !== undefined) updateData.idPemimpin = idPemimpin;
    if (idKeluarga !== undefined) updateData.idKeluarga = idKeluarga;
    if (idRayon !== undefined) updateData.idRayon = idRayon;
    if (judul !== undefined) updateData.judul = judul;
    if (tanggal !== undefined) updateData.tanggal = new Date(tanggal);
    if (waktuMulai !== undefined) updateData.waktuMulai = waktuMulai ? new Date(`1970-01-01T${waktuMulai}:00.000Z`) : null;
    if (waktuSelesai !== undefined) updateData.waktuSelesai = waktuSelesai ? new Date(`1970-01-01T${waktuSelesai}:00.000Z`) : null;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (lokasi !== undefined) updateData.lokasi = lokasi;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (googleMapsLink !== undefined) updateData.googleMapsLink = googleMapsLink;
    if (firman !== undefined) updateData.firman = firman;
    if (tema !== undefined) updateData.tema = tema;
    if (keterangan !== undefined) updateData.keterangan = keterangan;
    if (jumlahLaki !== undefined) updateData.jumlahLaki = jumlahLaki ? parseInt(jumlahLaki) : null;
    if (jumlahPerempuan !== undefined) updateData.jumlahPerempuan = jumlahPerempuan ? parseInt(jumlahPerempuan) : null;
    if (targetPeserta !== undefined) updateData.targetPeserta = targetPeserta ? parseInt(targetPeserta) : null;

    // Validate rayon restrictions for MAJELIS users
    if (user.role === 'MAJELIS' && user.majelis) {
      if (idRayon && idRayon !== user.majelis.idRayon) {
        return res
          .status(403)
          .json(apiResponse(false, null, "Tidak dapat mengubah jadwal untuk rayon lain"));
      }

      if (idKeluarga) {
        const keluarga = await prisma.keluarga.findUnique({
          where: { id: idKeluarga },
          select: { idRayon: true }
        });

        if (!keluarga || keluarga.idRayon !== user.majelis.idRayon) {
          return res
            .status(403)
            .json(apiResponse(false, null, "Tidak dapat mengubah jadwal untuk keluarga di rayon lain"));
        }
      }
    }

    const updatedJadwal = await prisma.jadwalIbadah.update({
      where: { id },
      data: updateData,
      include: {
        jenisIbadah: {
          select: {
            id: true,
            namaIbadah: true,
          }
        },
        kategori: {
          select: {
            id: true,
            namaKategori: true,
            deskripsi: true,
          }
        },
        pemimpin: {
          select: {
            id: true,
            nama: true,
          }
        },
        keluarga: {
          select: {
            id: true,
            noBagungan: true,
            rayon: {
              select: {
                id: true,
                namaRayon: true,
              }
            }
          }
        },
        rayon: {
          select: {
            id: true,
            namaRayon: true,
          }
        },
        pembuat: {
          select: {
            id: true,
            // namaLengkap: true,
          }
        }
      }
    });

    return res
      .status(200)
      .json(apiResponse(true, updatedJadwal, "Jadwal ibadah berhasil diperbarui"));

  } catch (error) {
    console.error("Error updating jadwal ibadah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui jadwal ibadah",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    // Check authentication
    const authResult = await requireAuth(req, res, ['ADMIN', 'MAJELIS']);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json(apiResponse(false, null, "ID jadwal ibadah diperlukan"));
    }

    // Check if jadwal exists
    const existingJadwal = await prisma.jadwalIbadah.findUnique({
      where: { id },
      include: {
        keluarga: {
          select: {
            idRayon: true
          }
        }
      }
    });

    if (!existingJadwal) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Jadwal ibadah tidak ditemukan"));
    }

    // Check access rights for deleting
    const canDelete = (() => {
      if (user.role === 'ADMIN') return true;

      if (user.role === 'MAJELIS' && user.majelis) {
        // Majelis can delete jadwal in their rayon
        if (existingJadwal.idRayon === user.majelis.idRayon) return true;
        if (existingJadwal.keluarga && existingJadwal.keluarga.idRayon === user.majelis.idRayon) return true;
      }

      return false;
    })();

    if (!canDelete) {
      return res
        .status(403)
        .json(apiResponse(false, null, "Tidak memiliki akses untuk menghapus jadwal ibadah ini"));
    }

    await prisma.jadwalIbadah.delete({
      where: { id }
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Jadwal ibadah berhasil dihapus"));

  } catch (error) {
    console.error("Error deleting jadwal ibadah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus jadwal ibadah",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,
  DELETE: handleDelete,
});