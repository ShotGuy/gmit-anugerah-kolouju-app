import { PrismaClient } from '@prisma/client';
import { publicEndpoint } from '../../../../lib/apiMiddleware';

const prisma = new PrismaClient();

async function handler(req, res) {
  try {
    // Hanya return nama rayon untuk publik (tanpa detail sensitif)
    const rayons = await prisma.rayon.findMany({
      select: {
        id: true,
        namaRayon: true
      }
    });

    // Sort berdasarkan angka di dalam nama rayon
    const sortedRayons = rayons.sort((a, b) => {
      const numA = parseInt(a.namaRayon.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.namaRayon.match(/\d+/)?.[0] || "0");
      return numA - numB;
    });

    const options = sortedRayons.map(rayon => ({
      value: rayon.id,
      label: rayon.namaRayon
    }));

    res.status(200).json({
      success: true,
      data: options
    });

  } catch (error) {
    console.error('Error fetching public rayon options:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Export with public middleware
export default publicEndpoint(handler);