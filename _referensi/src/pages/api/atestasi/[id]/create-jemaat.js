import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import bcrypt from "bcryptjs";

async function handlePost(req, res) {
  try {
    const { id: atestasiId } = req.query;
    const { jemaat, user, keluarga, alamat } = req.body;

    // Check if atestasi exists and is MASUK type
    const existingAtestasi = await prisma.atestasi.findUnique({
      where: { id: atestasiId },
    });

    if (!existingAtestasi) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data atestasi tidak ditemukan"));
    }

    if (existingAtestasi.tipe !== "MASUK") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Hanya bisa membuat jemaat dari atestasi masuk"));
    }

    if (existingAtestasi.idJemaat) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Jemaat sudah dibuat untuk atestasi ini"));
    }

    // Validate required jemaat fields
    if (!jemaat.nama || !jemaat.tanggalLahir || !jemaat.idStatusDalamKeluarga) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Data jemaat tidak lengkap"));
    }

    let keluargaId = jemaat.idKeluarga;
    let alamatId = null;

    // Create alamat first if needed
    if (alamat) {
      const newAlamat = await prisma.alamat.create({
        data: {
          idKelurahan: alamat.idKelurahan,
          rt: alamat.rt,
          rw: alamat.rw,
          jalan: alamat.jalan,
        },
      });
      alamatId = newAlamat.id;
    }

    // Create keluarga if needed
    if (keluarga) {
      // If no alamat provided and no existing keluarga, we need an alamat
      if (!alamatId && !keluargaId) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Alamat diperlukan untuk keluarga baru"));
      }

      const newKeluarga = await prisma.keluarga.create({
        data: {
          idAlamat: alamatId, // This could be null if using existing alamat
          idStatusKeluarga: keluarga.idStatusKeluarga,
          idStatusKepemilikanRumah: keluarga.idStatusKepemilikanRumah,
          idKeadaanRumah: keluarga.idKeadaanRumah,
          idRayon: keluarga.idRayon,
          noBagungan: keluarga.noBagungan,
        },
      });
      keluargaId = newKeluarga.id;
    }

    // Validate keluargaId exists
    if (!keluargaId) {
      return res
        .status(400)
        .json(apiResponse(false, null, "ID Keluarga diperlukan"));
    }

    // Create jemaat
    const newJemaat = await prisma.jemaat.create({
      data: {
        nama: jemaat.nama,
        jenisKelamin: jemaat.jenisKelamin,
        tanggalLahir: new Date(jemaat.tanggalLahir),
        golonganDarah: jemaat.golonganDarah,
        idKeluarga: keluargaId,
        idStatusDalamKeluarga: jemaat.idStatusDalamKeluarga,
        idSuku: jemaat.idSuku,
        idPendidikan: jemaat.idPendidikan,
        idPekerjaan: jemaat.idPekerjaan,
        idPendapatan: jemaat.idPendapatan,
        idJaminanKesehatan: jemaat.idJaminanKesehatan,
        status: "AKTIF", // Set as active since they're entering
      },
      include: {
        keluarga: {
          include: {
            rayon: true,
          },
        },
        statusDalamKeluarga: true,
      },
    });

    // Create user account if requested
    let newUser = null;
    if (user && user.email && user.password) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      newUser = await prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          role: user.role || "JEMAAT",
          idJemaat: newJemaat.id,
        },
      });
    }

    // Update atestasi to link with jemaat
    await prisma.atestasi.update({
      where: { id: atestasiId },
      data: {
        idJemaat: newJemaat.id,
      },
    });

    const result = {
      jemaat: newJemaat,
      user: newUser,
      keluargaCreated: !!keluarga,
      alamatCreated: !!alamat,
    };

    return res
      .status(201)
      .json(apiResponse(true, result, "Jemaat berhasil dibuat dari atestasi"));
  } catch (error) {
    console.error("Error creating jemaat from atestasi:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal membuat jemaat dari atestasi", error.message));
  }
}

export default createApiHandler({
  POST: handlePost,
});