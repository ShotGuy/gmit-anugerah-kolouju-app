import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, verifyToken } from "@/lib/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is authenticated and has admin role
    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Get database statistics
    const databaseStats = await getDatabaseStats();
    const tableStats = await getTableStats();
    const systemUsage = await getSystemUsage();

    const responseData = {
      success: true,
      data: {
        database: databaseStats,
        tables: tableStats,
        usage: systemUsage,
        lastUpdated: new Date().toISOString()
      },
      message: "Data sistem database berhasil diambil"
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Database system info error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil informasi sistem database",
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Get general database statistics
async function getDatabaseStats() {
  try {
    // Get total counts for main entities
    const [
      totalJemaat,
      totalKeluarga,
      totalRayon,
      totalMajelis,
      totalUsers,
      totalJadwalIbadah,
      totalPengumuman,
      totalDokumen
    ] = await Promise.all([
      prisma.jemaat.count(),
      prisma.keluarga.count(),
      prisma.rayon.count(),
      prisma.majelis.count(),
      prisma.user.count(),
      prisma.jadwalIbadah.count(),
      prisma.pengumuman.count(),
      prisma.dokumenJemaat.count()
    ]);

    // Get active vs inactive counts
    const [
      activeJemaat,
      activeKeluarga,
      publishedPengumuman,
      approvedDokumen
    ] = await Promise.all([
      prisma.jemaat.count({ where: { status: 'AKTIF' } }),
      prisma.keluarga.count(),
      prisma.pengumuman.count({ where: { status: 'PUBLISHED' } }),
      prisma.dokumenJemaat.count({ where: { statusDokumen: 'APPROVED' } })
    ]);

    return {
      totals: {
        jemaat: totalJemaat,
        keluarga: totalKeluarga,
        rayon: totalRayon,
        majelis: totalMajelis,
        users: totalUsers,
        jadwalIbadah: totalJadwalIbadah,
        pengumuman: totalPengumuman,
        dokumen: totalDokumen
      },
      active: {
        jemaat: activeJemaat,
        keluarga: activeKeluarga,
        pengumuman: publishedPengumuman,
        dokumen: approvedDokumen
      },
      percentages: {
        activeJemaat: totalJemaat > 0 ? ((activeJemaat / totalJemaat) * 100).toFixed(1) : 0,
        publishedPengumuman: totalPengumuman > 0 ? ((publishedPengumuman / totalPengumuman) * 100).toFixed(1) : 0,
        approvedDokumen: totalDokumen > 0 ? ((approvedDokumen / totalDokumen) * 100).toFixed(1) : 0
      }
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}

// Get table-specific statistics
async function getTableStats() {
  try {
    const tables = [
      { name: 'jemaat', label: 'Jemaat' },
      { name: 'keluarga', label: 'Keluarga' },
      { name: 'rayon', label: 'Rayon' },
      { name: 'majelis', label: 'Majelis' },
      { name: 'user', label: 'Users' },
      { name: 'jadwalIbadah', label: 'Jadwal Ibadah' },
      { name: 'pengumuman', label: 'Pengumuman' },
      { name: 'dokumenJemaat', label: 'Dokumen Jemaat' },
      { name: 'suku', label: 'Master Suku' },
      { name: 'pekerjaan', label: 'Master Pekerjaan' },
      { name: 'pendidikan', label: 'Master Pendidikan' },
      { name: 'provinsi', label: 'Master Provinsi' },
      { name: 'kotaKab', label: 'Master Kota/Kab' },
      { name: 'kecamatan', label: 'Master Kecamatan' },
      { name: 'kelurahan', label: 'Master Kelurahan' }
    ];

    const tableData = await Promise.all(
      tables.map(async (table) => {
        try {
          const count = await prisma[table.name].count();
          return {
            name: table.name,
            label: table.label,
            count: count,
            category: table.name.includes('master') || ['suku', 'pekerjaan', 'pendidikan', 'provinsi', 'kotaKab', 'kecamatan', 'kelurahan'].includes(table.name) ? 'master' : 'operational'
          };
        } catch (error) {
          console.error(`Error counting ${table.name}:`, error);
          return {
            name: table.name,
            label: table.label,
            count: 0,
            category: 'error'
          };
        }
      })
    );

    // Group by category
    const masterTables = tableData.filter(t => t.category === 'master');
    const operationalTables = tableData.filter(t => t.category === 'operational');

    return {
      all: tableData,
      master: masterTables,
      operational: operationalTables,
      summary: {
        totalTables: tableData.length,
        masterTables: masterTables.length,
        operationalTables: operationalTables.length,
        totalRecords: tableData.reduce((sum, table) => sum + table.count, 0)
      }
    };
  } catch (error) {
    console.error('Error getting table stats:', error);
    throw error;
  }
}

// Get system usage statistics
async function getSystemUsage() {
  try {
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      recentJemaat,
      recentUsers,
      recentPengumuman,
      recentJadwal,
      recentDokumen
    ] = await Promise.all([
      prisma.jemaat.count({
        where: {
          // Note: Jemaat model doesn't have createdAt, so we'll skip this
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.pengumuman.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.jadwalIbadah.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.dokumenJemaat.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })
    ]);

    // Get role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true
      }
    });

    // Get document status distribution
    const documentStatus = await prisma.dokumenJemaat.groupBy({
      by: ['statusDokumen'],
      _count: {
        _all: true
      }
    });

    return {
      recentActivity: {
        users: recentUsers,
        pengumuman: recentPengumuman,
        jadwal: recentJadwal,
        dokumen: recentDokumen
      },
      distributions: {
        roles: roleDistribution.map(role => ({
          role: role.role,
          count: role._count._all
        })),
        dokumentStatus: documentStatus.map(status => ({
          status: status.statusDokumen,
          count: status._count._all
        }))
      },
      systemHealth: {
        status: 'healthy',
        lastBackup: null, // You can implement backup tracking
        connectionPool: 'active'
      }
    };
  } catch (error) {
    console.error('Error getting system usage:', error);
    throw error;
  }
}