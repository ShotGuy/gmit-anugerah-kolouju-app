import bcrypt from "bcryptjs";

import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function handlePost(req, res) {
  try {
    // Require authentication
    const authResult = await requireAuth(req, res);
    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const user = authResult.user;

    // Get majelis data to get rayon id (if user is MAJELIS)
    let rayonId = null;
    if (user.role === "MAJELIS") {
      const majelis = await prisma.majelis.findUnique({
        where: { id: user.idMajelis },
        include: {
          rayon: true,
        },
      });

      if (majelis && majelis.idRayon) {
        rayonId = majelis.idRayon;
      }
    }

    const {
      // Jemaat data
      idKeluarga,
      idStatusDalamKeluarga,
      idSuku,
      idPendidikan,
      idPekerjaan,
      idPendapatan,
      idJaminanKesehatan,
      nama,
      jenisKelamin,
      tanggalLahir,
      golonganDarah,
      // User data
      createUser,
      username,
      email,
      password,
      noWhatsapp,
      role = "JEMAAT",
      // Keluarga data (if status is Kepala Keluarga)
      createKeluarga,
      keluargaData,
      // Alamat data (if creating keluarga)
      createAlamat,
      alamatData,
    } = req.body;

    // Get rayon ID - from keluargaData (new keluarga) or from existing keluarga
    let rayonIdForUser = null;
    if (createKeluarga && keluargaData?.idRayon) {
      rayonIdForUser = keluargaData.idRayon;
    } else if (idKeluarga) {
      // Get rayon from existing keluarga
      const existingKeluarga = await prisma.keluarga.findUnique({
        where: { id: idKeluarga },
        select: { idRayon: true },
      });
      if (existingKeluarga?.idRayon) {
        rayonIdForUser = existingKeluarga.idRayon;
      }
    }

    // Hash password outside transaction to reduce transaction time
    let hashedPassword = null;

    if (createUser && username && email && password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Start transaction with increased timeout
    const result = await prisma.$transaction(
      async (tx) => {
        let alamatId = null;
        let keluargaId = idKeluarga;

        // Step 1: Create Alamat if needed (for new Keluarga)
        if (createKeluarga && createAlamat && alamatData) {
          // Validate kelurahan exists
          const kelurahan = await tx.kelurahan.findUnique({
            where: { id: alamatData.idKelurahan },
          });

          if (!kelurahan) {
            throw new Error(
              `Kelurahan dengan ID ${alamatData.idKelurahan} tidak ditemukan`
            );
          }

          const newAlamat = await tx.alamat.create({
            data: alamatData,
          });

          alamatId = newAlamat.id;
        }

        // Step 2: Create Keluarga if status is Kepala Keluarga
        if (createKeluarga && keluargaData) {
          const newKeluarga = await tx.keluarga.create({
            data: {
              ...keluargaData,
              idAlamat: alamatId || keluargaData.idAlamat,
            },
          });

          keluargaId = newKeluarga.id;
        }

        // Step 3: Create Jemaat
        const newJemaat = await tx.jemaat.create({
          data: {
            idKeluarga: keluargaId,
            idStatusDalamKeluarga,
            idSuku,
            idPendidikan,
            idPekerjaan,
            idPendapatan,
            idJaminanKesehatan,
            nama,
            jenisKelamin: jenisKelamin === true || jenisKelamin === 'true' || jenisKelamin === 1,
            tanggalLahir: new Date(tanggalLahir),
            golonganDarah,
          },
        });

        // Step 4: Create User if requested
        let newUser = null;

        if (createUser && username && email && hashedPassword) {
          // Check if email already exists
          const existingUser = await tx.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            throw new Error("Email sudah terdaftar");
          }

          // Check if username already exists
          const existingUsername = await tx.user.findUnique({
            where: { username },
          });

          if (existingUsername) {
            throw new Error("Username sudah terdaftar");
          }

          newUser = await tx.user.create({
            data: {
              username,
              email,
              password: hashedPassword,
              noWhatsapp: noWhatsapp || null,
              role,
              idJemaat: newJemaat.id,
              idRayon: rayonIdForUser || rayonId, // Auto-assign rayon from keluarga or majelis
            },
            select: {
              id: true,
              username: true,
              email: true,
              noWhatsapp: true,
              role: true,
              idJemaat: true,
              idRayon: true,
            },
          });
        }

        return {
          jemaatId: newJemaat.id,
          userId: newUser?.id,
          createdKeluarga: createKeluarga,
          createdAlamat: createAlamat,
        };
      },
      {
        timeout: 20000, // Increase timeout to 10 seconds
      }
    );

    // Fetch complete data outside transaction
    const completeJemaat = await prisma.jemaat.findUnique({
      where: { id: result.jemaatId },
      include: {
        keluarga: {
          include: {
            alamat: {
              include: {
                kelurahan: {
                  include: {
                    kecamatan: {
                      include: {
                        kotaKab: {
                          include: {
                            provinsi: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            statusKeluarga: true,
            statusKepemilikanRumah: true,
            keadaanRumah: true,
            rayon: true,
          },
        },
        statusDalamKeluarga: true,
        suku: true,
        pendidikan: true,
        pekerjaan: true,
        pendapatan: true,
        jaminanKesehatan: true,
      },
    });

    const finalResult = {
      jemaat: completeJemaat,
      user: result.userId ? { id: result.userId } : null,
      createdKeluarga: result.createdKeluarga,
      createdAlamat: result.createdAlamat,
    };

    return res
      .status(201)
      .json(apiResponse(true, finalResult, "Data jemaat berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating jemaat with user:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menambahkan data jemaat", error.message)
      );
  }
}

export default createApiHandler({
  POST: handlePost,
});
