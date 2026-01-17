import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

async function handlePost(req, res) {
  try {
    const { token, jemaatData } = req.body;

    if (!token || !jemaatData) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Data tidak lengkap"));
    }

    // Verify token
    const tokenPayload = verifyToken(token);

    if (!tokenPayload || tokenPayload.type !== "invitation") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Token tidak valid"));
    }

    // JWT tokens with 7d expiration are automatically checked by verifyToken
    // No need for manual expiration check since JWT handles this

    // Verify user still exists and doesn't have profile
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        idJemaat: true
      }
    });

    if (!user) {
      return res
        .status(404)
        .json(apiResponse(false, null, "User tidak ditemukan"));
    }

    if (user.idJemaat) {
      return res
        .status(400)
        .json(apiResponse(false, null, "User sudah memiliki profil lengkap"));
    }

    // Verify keluarga still exists
    const keluarga = await prisma.keluarga.findUnique({
      where: { id: tokenPayload.keluargaId }
    });

    if (!keluarga) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Keluarga tidak ditemukan"));
    }

    // Validate required fields according to Jemaat schema
    const { 
      nama, 
      jenisKelamin, 
      tanggalLahir, 
      idStatusDalamKeluarga,
      idSuku,
      idPendidikan,
      idPekerjaan,
      idPendapatan,
      idJaminanKesehatan
    } = jemaatData;

    if (!nama || jenisKelamin === undefined || !tanggalLahir || 
        !idStatusDalamKeluarga || !idSuku || !idPendidikan || 
        !idPekerjaan || !idPendapatan || !idJaminanKesehatan) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Data wajib belum lengkap"));
    }

    // Create jemaat record and update user
    const result = await prisma.$transaction(async (tx) => {
      // Create jemaat record with proper schema mapping
      const newJemaat = await tx.jemaat.create({
        data: {
          nama,
          jenisKelamin, // boolean value from form
          tanggalLahir: new Date(tanggalLahir),
          idKeluarga: keluarga.id,
          idStatusDalamKeluarga,
          idSuku,
          idPendidikan,
          idPekerjaan,
          idPendapatan,
          idJaminanKesehatan,
          golonganDarah: jemaatData.golonganDarah || null,
          idPernikahan: jemaatData.idPernikahan || null
        }
      });

      // Update user with jemaat ID
      await tx.user.update({
        where: { id: user.id },
        data: { 
          idJemaat: newJemaat.id,
          updatedAt: new Date()
        }
      });

      return newJemaat;
    });

    return res
      .status(200)
      .json(apiResponse(true, {
        jemaat: {
          id: result.id,
          nama: result.nama,
          jenisKelamin: result.jenisKelamin
        },
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          hasProfile: true
        }
      }, "Profil berhasil dilengkapi"));

  } catch (error) {
    console.error("Error processing onboarding:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Terjadi kesalahan server", error.message));
  }
}

export default createApiHandler({
  POST: handlePost,
});