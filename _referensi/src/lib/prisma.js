import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton Pattern untuk Serverless Environment
 *
 * Masalah:
 * - Di serverless (Vercel/Netlify), setiap request bisa membuat instance baru
 * - Supabase Free Plan hanya support ~20-40 concurrent connections
 * - Tanpa pooling, kena error "Max client connections reached"
 *
 * Solusi:
 * - Singleton pattern: reuse instance yang sama di development
 * - Connection pooling via PgBouncer (port 6543) di production
 * - Auto-disconnect saat tidak digunakan
 */

const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Konfigurasi connection pooling
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // Gunakan PgBouncer port 6543
      },
    },
  });

// Di development, simpan instance ke global untuk hot-reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown: disconnect saat process berhenti
if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
