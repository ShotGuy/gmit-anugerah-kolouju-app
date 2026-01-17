import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function handlePost(req, res) {
    try {
        // Check auth (only Admin)
        const auth = await requireAuth(req, res, ["ADMIN"]);
        if (auth.error) return res.status(auth.status).json(apiResponse(false, null, auth.error));

        const {
            idJenisJabatan,
            idJemaat,
            // Dates
            mulai,
            selesai,
            // Permission fields
            canViewJemaat,
            canManageJemaat,
            canManageJadwal,
            canManagePengumuman,
            canManageGaleri,
            canViewKeuangan,
            canManageKeuangan,
            // User account data
            username,
            email,
            password,
            noWhatsapp,
        } = req.body;

        // Validate required fields
        if (!idJenisJabatan || !idJemaat || !mulai || !username || !email || !password) {
            return res
                .status(400)
                .json(
                    apiResponse(
                        false,
                        null,
                        "Data yang wajib diisi: Jemaat, Jenis Jabatan, Tanggal Mulai, Username, Email, dan Password"
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
            const jenisJabatan = await tx.jenisJabatan.findUnique({
                where: { id: idJenisJabatan },
            });

            if (!jenisJabatan) {
                throw new Error("JENIS_JABATAN_NOT_FOUND");
            }

            // 4. Validate Jemaat
            const jemaat = await tx.jemaat.findUnique({
                where: { id: idJemaat },
            });

            if (!jemaat) {
                throw new Error("JEMAAT_NOT_FOUND");
            }

            // 5. Create Pegawai
            const pegawaiData = {
                idJenisJabatan,
                idJemaat,
                // Dates
                mulai: new Date(mulai),
                selesai: selesai ? new Date(selesai) : null,

                // Permissions
                // 1. Administrasi Jemaat
                canViewJemaat: Boolean(canViewJemaat),
                canManageJemaat: Boolean(canManageJemaat),

                // 2. Operasional
                canManageJadwal: Boolean(canManageJadwal),
                canManagePengumuman: Boolean(canManagePengumuman),
                canManageGaleri: Boolean(canManageGaleri),

                // 3. Keuangan
                canViewKeuangan: Boolean(canViewKeuangan),
                canManageKeuangan: Boolean(canManageKeuangan),

                isActive: true,
            };

            const newPegawai = await tx.pegawai.create({
                data: pegawaiData,
                include: {
                    jenisJabatan: {
                        select: {
                            namaJabatan: true,
                        },
                    },
                    jemaat: {
                        select: {
                            nama: true,
                        }
                    }
                },
            });

            // 6. Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // 7. Create User account linked to Pegawai
            const newUser = await tx.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    noWhatsapp: noWhatsapp || null,
                    role: "EMPLOYEE",
                    idPegawai: newPegawai.id,
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
                pegawai: newPegawai,
                user: newUser,
            };
        });

        return res
            .status(201)
            .json(
                apiResponse(
                    true,
                    result,
                    "Pegawai dan akun berhasil dibuat"
                )
            );
    } catch (error) {
        // console.error("Error creating pegawai with account:", error);

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
            return res
                .status(404)
                .json(apiResponse(false, null, "Data Jemaat tidak ditemukan"));
        }

        return res
            .status(500)
            .json(
                apiResponse(
                    false,
                    null,
                    "Gagal membuat pegawai dan akun",
                    error.message
                )
            );
    }
}

export default createApiHandler({
    POST: handlePost,
});
