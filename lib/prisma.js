import { PrismaClient } from "@prisma/client";

// Check if DATABASE_URL is available
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Database operations will fail.");
}

export const db = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}