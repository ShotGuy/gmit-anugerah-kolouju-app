import bcrypt from "bcryptjs";

import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { createToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

async function handlePost(req, res) {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res
        .status(400)
        .json(
          apiResponse(false, null, "Email/Username dan password wajib diisi")
        );
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        noWhatsapp: true,
        idJemaat: true,
        isActive: true,
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            keluarga: {
              select: {
                noBagungan: true,
                rayon: {
                  select: {
                    namaRayon: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(401)
        .json(apiResponse(false, null, "Email/Username atau password salah"));
    }

    // Check if user account is active
    if (!user.isActive) {
      return res
        .status(403)
        .json(
          apiResponse(
            false,
            null,
            "Akun Anda telah dinonaktifkan. Silakan hubungi pihak gereja untuk informasi lebih lanjut."
          )
        );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(apiResponse(false, null, "Email/Username atau password salah"));
    }

    // Create JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const token = createToken(tokenPayload);

    // Prepare user data without password
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      noWhatsapp: user.noWhatsapp,
      jemaat: user.jemaat,
    };

    // Determine redirect URL based on role
    let redirectUrl = "/";

    switch (user.role) {
      case "ADMIN":
      case "PENDETA": // PENDETA has same access as ADMIN
        redirectUrl = "/admin/dashboard";
        break;
      case "JEMAAT":
        redirectUrl = "/jemaat/dashboard";
        break;
      case "MAJELIS":
        redirectUrl = "/majelis/dashboard";
        break;
      case "EMPLOYEE":
        redirectUrl = "/employee/dashboard";
        break;
      default:
        redirectUrl = "/dashboard";
    }

    return res.status(200).json(
      apiResponse(
        true,
        {
          user: userData,
          token: token,
          redirect_url: redirectUrl,
        },
        "Login berhasil"
      )
    );
  } catch (error) {
    console.error("Error during login:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Terjadi kesalahan server", error.message)
      );
  }
}

export default createApiHandler({
  POST: handlePost,
});
