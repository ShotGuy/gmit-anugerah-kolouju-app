import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function handlePost(req, res) {
  try {
    const {
      // Majelis data
      // namaLengkap, // Removed
      idJemaat, // New Required
      mulai,
      selesai,
      idRayon,
      jenisJabatanId,
      // Permission fields
      isUtama,
      canView,
      canEdit,
      canCreate,
      canDelete,
      canManageRayon,
      // User account data
      username,
      email,
      password,
      noWhatsapp,
    } = req.body;

    // Validate required fields
    if (!idJemaat || !mulai || !jenisJabatanId || !username || !email || !password) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Data yang wajib diisi: Jemaat, Tanggal Mulai, Jenis Jabatan, Username, Email, dan Password"
          )
        );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if email already exists
      const existingEmail = await tx.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new Error("EMAIL_EXISTS");
      }

      // 2. Check if username already exists
      const existingUsername = await tx.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        throw new Error("USERNAME_EXISTS");
      }

      // 3. Validate jenis jabatan
      if (jenisJabatanId) {
        const jenisJabatan = await tx.jenisJabatan.findUnique({
          where: { id: jenisJabatanId },
        });

        if (!jenisJabatan) {
          throw new Error("JENIS_JABATAN_NOT_FOUND");
        }
      }

      // 4. Validate Jemaat
      const jemaat = await tx.jemaat.findUnique({
        where: { id: idJemaat }, // Majelis uses idJemaat
      });

      if (!jemaat) {
        throw new Error("JEMAAT_NOT_FOUND");
      }

      // 5. Validate rayon if provided
      if (idRayon) {
        const rayon = await tx.rayon.findUnique({
          where: { id: idRayon },
        });

        if (!rayon) {
          throw new Error("RAYON_NOT_FOUND");
        }

        // 6. Jika isUtama = true, pastikan hanya 1 majelis utama per rayon
        if (isUtama === true) {
          const existingUtama = await tx.majelis.findFirst({
            where: {
              idRayon: idRayon,
              isUtama: true,
            },
          });

          if (existingUtama) {
            throw new Error("MAJELIS_UTAMA_EXISTS");
          }
        }
      }

      // 7. Create Majelis
      const majelisData = {
        // namaLengkap, // Removed
        jemaat: {
          connect: {
            id: idJemaat,
          },
        },
        mulai: new Date(mulai),
        selesai: selesai ? new Date(selesai) : null,
        rayon: idRayon ? { connect: { id: idRayon } } : undefined,
        jenisJabatan: jenisJabatanId ? { connect: { id: jenisJabatanId } } : undefined,
      };

      // Tambahkan permission fields jika ada
      if (typeof isUtama === "boolean") majelisData.isUtama = isUtama;
      if (typeof canView === "boolean") majelisData.canView = canView;
      if (typeof canEdit === "boolean") majelisData.canEdit = canEdit;
      if (typeof canCreate === "boolean") majelisData.canCreate = canCreate;
      if (typeof canDelete === "boolean") majelisData.canDelete = canDelete;
      if (typeof canManageRayon === "boolean")
        majelisData.canManageRayon = canManageRayon;

      const newMajelis = await tx.majelis.create({
        data: majelisData,
        include: {
          jenisJabatan: {
            select: {
              namaJabatan: true,
            },
          },
          rayon: {
            select: {
              namaRayon: true,
            },
          },
          jemaat: {
            select: {
              nama: true,
            }
          }
        },
      });

      // 8. Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // 9. Create User account linked to Majelis
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          noWhatsapp: noWhatsapp || null,
          role: "MAJELIS",
          idMajelis: newMajelis.id,
        },
        select: {
          id: true,
          username: true,
          email: true,
          noWhatsapp: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        majelis: newMajelis,
        user: newUser,
      };
    });

    return res
      .status(201)
      .json(
        apiResponse(
          true,
          result,
          "Majelis dan akun berhasil dibuat"
        )
      );
  } catch (error) {
    console.error("Error creating majelis with account:", error);

    // Handle specific transaction errors
    if (error.message === "EMAIL_EXISTS") {
      return res
        .status(409)
        .json(apiResponse(false, null, "Email sudah terdaftar"));
    }

    if (error.message === "USERNAME_EXISTS") {
      return res
        .status(409)
        .json(apiResponse(false, null, "Username sudah terdaftar"));
    }

    if (error.message === "JENIS_JABATAN_NOT_FOUND") {
      return res
        .status(404)
        .json(apiResponse(false, null, "Jenis jabatan tidak ditemukan"));
    }

    if (error.message === "JEMAAT_NOT_FOUND") {
      return res.status(404).json(apiResponse(false, null, "Data Jemaat tidak ditemukan"));
    }

    if (error.message === "RAYON_NOT_FOUND") {
      return res
        .status(404)
        .json(apiResponse(false, null, "Rayon tidak ditemukan"));
    }

    if (error.message === "MAJELIS_UTAMA_EXISTS") {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Sudah ada Majelis Utama di rayon ini. Hanya boleh ada 1 Majelis Utama per rayon."
          )
        );
    }

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal membuat majelis dan akun",
          error.message
        )
      );
  }
}

export default createApiHandler({
  POST: handlePost,
});