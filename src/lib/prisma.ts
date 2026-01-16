import { PrismaClient } from "@prisma/client";
// `pg` bindings are used at runtime; import via require to avoid missing types in build
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Pool } = require("pg") as any;
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: any | undefined;
};

const logLevels =
  process.env.NODE_ENV === "development"
    ? ["query", "info", "warn", "error"]
    : ["error"];

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pgPool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    max: 1,
  });

const adapter = new PrismaPg(pgPool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logLevels as any,
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  console.log("Initializing Prisma Client...");
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pgPool;
}

