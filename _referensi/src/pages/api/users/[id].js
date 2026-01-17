import bcrypt from "bcryptjs";

import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: id },
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
          include: {
            statusDalamKeluarga: true,
            suku: true,
            pendidikan: true,
            pekerjaan: true,
            pendapatan: true,
            jaminanKesehatan: true,
            pernikahan: true,
            keluarga: {
              include: {
                alamat: {
                  include: {
                    kelurahan: true,
                  },
                },
                rayon: true,
              },
            },
          },
        },
        majelis: {
          include: {
            jenisJabatan: true,
            rayon: true,
            jemaat: true,
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json(apiResponse(false, null, "User tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, user, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching user:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data user", error.message)
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    let {
      username,
      email,
      password,
      currentPassword,
      newPassword,
      role,
      idJemaat,
      noWhatsapp,
    } = req.body;

    // Convert empty strings to null for optional fields (only if explicitly provided)
    if (noWhatsapp !== undefined) {
      noWhatsapp = noWhatsapp && noWhatsapp.trim() !== "" ? noWhatsapp : null;
    }

    const updateData = {};

    // Update username if provided and different
    if (username) {
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUserByUsername && existingUserByUsername.id !== id) {
        return res
          .status(409)
          .json(apiResponse(false, null, "Username sudah digunakan"));
      }

      updateData.username = username;
    }

    // Update email if provided and different
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        return res
          .status(409)
          .json(apiResponse(false, null, "Email sudah digunakan"));
      }

      updateData.email = email;
    }

    // Handle password change with validation
    if (newPassword && currentPassword) {
      // Get current user data to verify current password
      const currentUser = await prisma.user.findUnique({
        where: { id },
        select: { password: true },
      });

      if (!currentUser) {
        return res
          .status(404)
          .json(apiResponse(false, null, "User tidak ditemukan"));
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );

      if (!isCurrentPasswordValid) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Password lama tidak benar"));
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 12);
    } else if (password) {
      // Fallback for direct password update (for admin use)
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update role if provided
    if (role) {
      updateData.role = role;
    }

    // Update noWhatsapp if provided
    if (noWhatsapp !== undefined) {
      updateData.noWhatsapp = noWhatsapp;
    }

    // Handle jemaat relation - only process if explicitly provided with valid value

    // Only process idJemaat if it's explicitly in the request body and has a valid value
    if (
      "idJemaat" in req.body &&
      idJemaat !== undefined &&
      idJemaat !== null &&
      idJemaat !== ""
    ) {
      // Validate jemaat exists
      const jemaat = await prisma.jemaat.findUnique({
        where: { id: idJemaat },
      });

      if (!jemaat) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Data jemaat tidak ditemukan"));
      }

      // Check if another user already linked to this jemaat
      const existingUserForJemaat = await prisma.user.findUnique({
        where: { idJemaat },
      });

      if (existingUserForJemaat && existingUserForJemaat.id !== id) {
        return res
          .status(409)
          .json(
            apiResponse(false, null, "Jemaat ini sudah memiliki akun user")
          );
      }

      updateData.idJemaat = idJemaat;
    }
    // If idJemaat is not in request body or is null/empty, don't modify it

    const updatedUser = await prisma.user.update({
      where: { id: id },
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
      .json(apiResponse(false, null, "Gagal memperbarui user", error.message));
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedUser = await prisma.user.delete({
      where: { id: id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedUser, "User berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting user:", error);

    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menghapus user", error.message));
  }
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,
  DELETE: handleDelete,
});
