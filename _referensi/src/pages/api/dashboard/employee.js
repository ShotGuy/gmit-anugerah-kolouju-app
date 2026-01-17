import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { requireAuth } from "@/lib/auth";

async function handleGet(req, res) {
  try {
    // Get authenticated user for role-based access
    const authResult = await requireAuth(req, res, ['EMPLOYEE', 'ADMIN', 'MAJELIS']);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    // For employee users, simply return all data without rayon filtering
    // Get statistics for all data
    const [
      totalBaptis,
      totalSidi,
      totalPernikahan,
      totalAtestasi
    ] = await Promise.all([
      // Total data Baptis
      prisma.baptis.count(),

      // Total data Sidi
      prisma.sidi.count(),

      // Total data Pernikahan
      prisma.pernikahan.count(),

      // Total data Atestasi
      prisma.atestasi.count()
    ]);

    const result = {
      statistics: {
        totalBaptis,
        totalSidi,
        totalPernikahan,
        totalAtestasi
      }
    };

    return res
      .status(200)
      .json(apiResponse(true, result, "Data dashboard berhasil diambil"));

  } catch (error) {
    console.error("Error fetching employee dashboard:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data dashboard",
          error.message
        )
      );
  }
}

// Export using createApiHandler
export default createApiHandler({
  GET: handleGet,
});