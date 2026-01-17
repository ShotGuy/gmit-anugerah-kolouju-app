import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

async function handlePost(req, res) {
  try {
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const authenticatedUser = authResult.user;

    // Only ADMIN and MAJELIS can generate invitation
    if (authenticatedUser.role !== "ADMIN" && authenticatedUser.role !== "MAJELIS") {
      return res
        .status(403)
        .json(apiResponse(false, null, "Akses ditolak. Hanya untuk Admin dan Majelis"));
    }

    const { userId, keluargaId, whatsappNumber, password } = req.body;

    if (!userId || !whatsappNumber) {
      return res
        .status(400)
        .json(
          apiResponse(false, null, "User ID dan nomor WhatsApp harus diisi")
        );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        idRayon: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json(apiResponse(false, null, "User tidak ditemukan"));
    }

    if (user.role !== "JEMAAT") {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Hanya user dengan role JEMAAT yang dapat diundang"
          )
        );
    }

    // If authenticated user is MAJELIS, validate that target user belongs to their rayon
    if (authenticatedUser.role === "MAJELIS") {
      const majelis = await prisma.majelis.findUnique({
        where: { id: authenticatedUser.idMajelis },
        select: {
          idRayon: true,
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

      // Check if user belongs to majelis's rayon
      if (user.idRayon !== majelis.idRayon) {
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
    }

    // Get keluarga data (optional)
    let keluarga = null;

    if (keluargaId) {
      keluarga = await prisma.keluarga.findUnique({
        where: { id: keluargaId },
        select: {
          id: true,
          noBagungan: true,
          rayon: {
            select: {
              id: true,
              namaRayon: true,
            },
          },
          jemaats: {
            where: {
              statusDalamKeluarga: {
                status: "Kepala Keluarga",
              },
            },
            select: {
              nama: true,
            },
            take: 1,
          },
        },
      });

      if (!keluarga) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Keluarga tidak ditemukan"));
      }
    }

    // Generate compact invitation token - only essential IDs
    const tokenPayload = {
      type: "invitation",
      userId: user.id,
      keluargaId: keluarga?.id || null,
      whatsappNumber, // Keep this for tracking
    };

    const invitationToken = signToken(tokenPayload, "7d");

    // Create WhatsApp invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const onboardingUrl = `${baseUrl}/onboarding?token=${invitationToken}`;

    // Ensure URL has proper protocol for WhatsApp link detection
    const cleanUrl = onboardingUrl.startsWith("http")
      ? onboardingUrl
      : `https://${onboardingUrl}`;

    // Build WhatsApp message - conditional based on keluarga data
    let whatsappMessage;

    // Build account info section
    let accountInfo = `\n\n📱 *DATA AKUN ANDA:*\n` +
      `👤 Username: ${user.username}\n` +
      `📧 Email: ${user.email}\n`;

    if (password) {
      accountInfo += `🔑 Password: ${password}\n`;
    }

    accountInfo += `\n💡 Setelah lengkapi data jemaat, Anda bisa login dengan data akun di atas.`;

    if (keluarga) {
      const keluargaDisplayName =
        keluarga.jemaats[0]?.nama || `Bangunan ${keluarga.noBagungan}`;

      whatsappMessage = encodeURIComponent(
        `🙏 *GMIT Betlehem Oesapa Barat*\n\n` +
        `Halo ${user.username}!\n\n` +
        `Anda telah diundang untuk melengkapi profil jemaat.\n\n` +
        `👨‍👩‍👧‍👦 *Keluarga:* ${keluargaDisplayName}\n` +
        `📍 *Rayon:* ${keluarga.rayon.namaRayon}\n\n` +
        `👆 *KLIK LINK DI BAWAH INI:*\n` +
        `${cleanUrl}\n\n` +
        `⏰ Link berlaku 7 hari\n` +
        `📝 Lengkapi data pribadi Anda` +
        accountInfo +
        `\n\nTerima kasih! 🙏`
      );
    } else {
      whatsappMessage = encodeURIComponent(
        `🙏 *GMIT Betlehem Oesapa Barat*\n\n` +
        `Halo ${user.username}!\n\n` +
        `Anda telah diundang untuk melengkapi profil jemaat.\n\n` +
        `👆 *KLIK LINK DI BAWAH INI:*\n` +
        `${cleanUrl}\n\n` +
        `⏰ Link berlaku 7 hari\n` +
        `📝 Lengkapi data pribadi Anda\n` +
        `🔍 Siapkan Nomor KK (Kartu Keluarga) untuk mencari keluarga Anda` +
        accountInfo +
        `\n\nTerima kasih! 🙏`
      );
    }

    // Format WhatsApp number for Indonesia (+62)
    const formatWhatsAppNumber = (phone) => {
      // Remove all non-digit characters
      const cleaned = phone.replace(/\D/g, "");

      // If starts with 0, replace with 62
      if (cleaned.startsWith("0")) {
        return "62" + cleaned.substring(1);
      }

      // If already starts with 62, keep as is
      if (cleaned.startsWith("62")) {
        return cleaned;
      }

      // Otherwise, assume it needs 62 prefix
      return "62" + cleaned;
    };

    const formattedWhatsAppNumber = formatWhatsAppNumber(whatsappNumber);
    const whatsappUrl = `https://wa.me/${formattedWhatsAppNumber}?text=${whatsappMessage}`;

    return res.status(200).json(
      apiResponse(
        true,
        {
          token: invitationToken,
          onboardingUrl,
          whatsappUrl,
          user: {
            username: user.username,
            email: user.email,
          },
          keluarga: keluarga
            ? {
              noBagungan: keluarga.noBagungan,
              namaKepalaKeluarga: keluarga.jemaats[0]?.nama || null,
              rayon: keluarga.rayon.namaRayon,
            }
            : null,
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        "Token undangan berhasil dibuat"
      )
    );
  } catch (error) {
    console.error("Error generating invitation token:", error);

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
