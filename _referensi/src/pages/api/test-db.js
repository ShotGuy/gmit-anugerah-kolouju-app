import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    // Simple database connection test
    const result = await prisma.kategoriKeuangan.findMany({
      take: 1,
      select: { id: true, nama: true }
    });
    
    res.status(200).json({
      success: true,
      message: "Database connection successful",
      data: result
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
}