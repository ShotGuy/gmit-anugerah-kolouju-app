import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { requireAuth } from "@/lib/auth";

// PATCH: Update user
async function handlePatch(req, res) {
  try {
    // Require authentication
    const authResult = await requireAuth(req, res);
    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const user = authResult.user;

    // Only MAJELIS can access this endpoint
    if (user.role !== "MAJELIS") {
      return res
        .status(403)
        .json(apiResponse(false, null, "Akses ditolak. Hanya untuk Majelis"));
    }

    // Get majelis data to get rayon id
    const majelis = await prisma.majelis.findUnique({
      where: { id: user.idMajelis },
      include: {
        rayon: true,
      },
    });

    if (!majelis || !majelis.idRayon) {
      return res
        .status(404)
        .json(
          apiResponse(
            false,
            null,
            "Data majelis atau rayon tidak ditemukan"
          )
        );
    }

    const { id } = req.query;
    const { username, email, noWhatsapp, idJemaat } = req.body;

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        jemaat: {
          include: {
            keluarga: true,
          },
        },
      },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json(apiResponse(false, null, "User tidak ditemukan"));
    }

    // Check if user is JEMAAT role
    if (existingUser.role !== "JEMAAT") {
      return res
        .status(403)
        .json(
          apiResponse(
            false,
            null,
            "Anda hanya dapat mengelola akun dengan role JEMAAT"
          )
        );
    }

    // Check if user belongs to majelis's rayon (using user.idRayon directly)
    if (existingUser.idRayon !== majelis.idRayon) {
      return res
        .status(403)
        .json(
          apiResponse(
            false,
            null,
            "User ini bukan dari rayon Anda"
          )
        );
    }

    // Prepare update data
    const updateData = {};

    if (username !== undefined && username !== existingUser.username) {
      // Check if new username already exists
      const usernameExists = await prisma.user.findUnique({
        where: { username },
      });
      if (usernameExists) {
        return res
          .status(409)
          .json(apiResponse(false, null, "Username sudah digunakan"));
      }
      updateData.username = username;
    }

    if (email !== undefined && email !== existingUser.email) {
      // Check if new email already exists
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return res
          .status(409)
          .json(apiResponse(false, null, "Email sudah digunakan"));
      }
      updateData.email = email;
    }

    if (noWhatsapp !== undefined) {
      updateData.noWhatsapp =
        noWhatsapp && noWhatsapp.trim() !== "" ? noWhatsapp : null;
    }

    if (idJemaat !== undefined) {
      if (idJemaat && idJemaat.trim() !== "") {
        // Validate jemaat
        const jemaat = await prisma.jemaat.findUnique({
          where: { id: idJemaat },
          include: {
            keluarga: {
              include: {
                rayon: true,
              },
            },
          },
        });

        if (!jemaat) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Data jemaat tidak ditemukan"));
        }

        // Validate that jemaat belongs to majelis's rayon
        if (jemaat.keluarga?.idRayon !== majelis.idRayon) {
          return res
            .status(403)
            .json(
              apiResponse(
                false,
                null,
                "Jemaat ini bukan dari rayon Anda"
              )
            );
        }

        // Check if jemaat already has another user account
        if (idJemaat !== existingUser.idJemaat) {
          const existingUserForJemaat = await prisma.user.findUnique({
            where: { idJemaat },
          });

          if (existingUserForJemaat) {
            return res
              .status(409)
              .json(
                apiResponse(false, null, "Jemaat ini sudah memiliki akun user")
              );
          }
        }

        updateData.idJemaat = idJemaat;
      } else {
        updateData.idJemaat = null;
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        noWhatsapp: true,
        role: true,
        idJemaat: true,
        createdAt: true,
        updatedAt: true,
        jemaat: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(apiResponse(true, updatedUser, "User berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal memperbarui user", error.message)
      );
  }
}

// DELETE: Delete user
async function handleDelete(req, res) {
  try {
    // Require authentication
    const authResult = await requireAuth(req, res);
    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const user = authResult.user;

    // Only MAJELIS can access this endpoint
    if (user.role !== "MAJELIS") {
      return res
        .status(403)
        .json(apiResponse(false, null, "Akses ditolak. Hanya untuk Majelis"));
    }

    // Get majelis data to get rayon id
    const majelis = await prisma.majelis.findUnique({
      where: { id: user.idMajelis },
      include: {
        rayon: true,
      },
    });

    if (!majelis || !majelis.idRayon) {
      return res
        .status(404)
        .json(
          apiResponse(
            false,
            null,
            "Data majelis atau rayon tidak ditemukan"
          )
        );
    }

    const { id } = req.query;

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        jemaat: {
          include: {
            keluarga: true,
          },
        },
      },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json(apiResponse(false, null, "User tidak ditemukan"));
    }

    // Check if user is JEMAAT role
    if (existingUser.role !== "JEMAAT") {
      return res
        .status(403)
        .json(
          apiResponse(
            false,
            null,
            "Anda hanya dapat menghapus akun dengan role JEMAAT"
          )
        );
    }

    // Check if user belongs to majelis's rayon (using user.idRayon directly)
    if (existingUser.idRayon !== majelis.idRayon) {
      return res
        .status(403)
        .json(
          apiResponse(
            false,
            null,
            "User ini bukan dari rayon Anda"
          )
        );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "User berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menghapus user", error.message));
  }
}

export default createApiHandler({
  PATCH: handlePatch,
  DELETE: handleDelete,
});
