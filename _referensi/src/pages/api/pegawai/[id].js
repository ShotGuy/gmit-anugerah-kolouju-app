import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function handleGet(req, res) {
    try {
        const { id } = req.query;

        const auth = await requireAuth(req, res, ["ADMIN", "EMPLOYEE"]);
        // Admin can see anyone. Employee can only see themselves? Or maybe all employees? Let's allow view.
        // If restricted, check auth.user.idPegawai === id OR user.isAdmin

        if (auth.error) return res.status(auth.status).json(apiResponse(false, null, auth.error));

        const pegawai = await prisma.pegawai.findUnique({
            where: { id: id },
            include: {
                jenisJabatan: {
                    select: {
                        id: true, // Needed for edit form
                        namaJabatan: true,
                    },
                },
                jemaat: {
                    select: {
                        id: true,
                        nama: true,
                    }
                },
                User: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        noWhatsapp: true,
                        role: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!pegawai) {
            return res
                .status(404)
                .json(apiResponse(false, null, "Pegawai tidak ditemukan"));
        }

        return res
            .status(200)
            .json(apiResponse(true, pegawai, "Data berhasil diambil"));
    } catch (error) {
        console.error("Error fetching pegawai:", error);
        return res
            .status(500)
            .json(
                apiResponse(
                    false,
                    null,
                    "Gagal mengambil data pegawai",
                    error.message
                )
            );
    }
}

async function handlePatch(req, res) {
    try {
        const auth = await requireAuth(req, res, ["ADMIN"]);
        if (auth.error) return res.status(auth.status).json(apiResponse(false, null, auth.error));

        const { id } = req.query;
        const {
            idJenisJabatan,
            idJemaat,
            // Dates
            mulai,
            selesai,
            // Permissions
            canViewJemaat,
            canManageJemaat,
            canManageJadwal,
            canManagePengumuman,
            canManageGaleri,
            canViewKeuangan,
            canManageKeuangan,
            isActive,
        } = req.body;

        if (!idJenisJabatan) {
            return res
                .status(400)
                .json(apiResponse(false, null, "Jenis jabatan wajib diisi"));
        }

        // Prepare update data
        const updateData = {
            idJenisJabatan,
            idJemaat: idJemaat || null,
        };

        // Dates
        if (mulai) updateData.mulai = new Date(mulai);
        if (selesai !== undefined) updateData.selesai = selesai ? new Date(selesai) : null;

        // Permissions
        if (typeof canViewJemaat === "boolean") updateData.canViewJemaat = canViewJemaat;
        if (typeof canManageJemaat === "boolean") updateData.canManageJemaat = canManageJemaat;

        if (typeof canManageJadwal === "boolean") updateData.canManageJadwal = canManageJadwal;
        if (typeof canManagePengumuman === "boolean") updateData.canManagePengumuman = canManagePengumuman;
        if (typeof canManageGaleri === "boolean") updateData.canManageGaleri = canManageGaleri;

        if (typeof canViewKeuangan === "boolean") updateData.canViewKeuangan = canViewKeuangan;
        if (typeof canManageKeuangan === "boolean") updateData.canManageKeuangan = canManageKeuangan;

        if (typeof isActive === "boolean") updateData.isActive = isActive;

        const updatedPegawai = await prisma.pegawai.update({
            where: { id: id },
            data: updateData,
            include: {
                jenisJabatan: {
                    select: {
                        namaJabatan: true,
                    },
                },
            },
        });

        return res
            .status(200)
            .json(apiResponse(true, updatedPegawai, "Pegawai berhasil diperbarui"));
    } catch (error) {
        console.error("Error updating pegawai:", error);
        return res
            .status(500)
            .json(
                apiResponse(false, null, "Gagal memperbarui pegawai", error.message)
            );
    }
}

async function handleDelete(req, res) {
    try {
        const auth = await requireAuth(req, res, ["ADMIN"]);
        if (auth.error) return res.status(auth.status).json(apiResponse(false, null, auth.error));

        const { id } = req.query;

        // Start transaction to delete both pegawai and associated user
        const result = await prisma.$transaction(async (tx) => {
            // First, delete the associated user account
            const userToDelete = await tx.user.findUnique({
                where: { idPegawai: id },
            });

            if (userToDelete) {
                await tx.user.delete({
                    where: { id: userToDelete.id },
                });
            }

            // Then delete the pegawai
            const deletedPegawai = await tx.pegawai.delete({
                where: { id: id },
                select: {
                    id: true,
                    // namaLengkap: true, // Removed
                },
            });

            return {
                pegawai: deletedPegawai,
                userDeleted: !!userToDelete,
            };
        });

        return res
            .status(200)
            .json(
                apiResponse(
                    true,
                    result,
                    result.userDeleted
                        ? "Pegawai dan akun pengguna berhasil dihapus"
                        : "Pegawai berhasil dihapus"
                )
            );
    } catch (error) {
        console.error("Error deleting pegawai:", error);
        return res
            .status(500)
            .json(
                apiResponse(false, null, "Gagal menghapus pegawai", error.message)
            );
    }
}

export default createApiHandler({
    GET: handleGet,
    PATCH: handlePatch,
    DELETE: handleDelete,
});
