import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health check endpoint for diagnosing database connectivity.
 * GET /api/health — returns database connection status.
 */
export async function GET() {
  try {
    // Try a simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as ping`;
    
    return NextResponse.json({
      status: "ok",
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
      query: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Health check failed:", errorMessage);
    
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
