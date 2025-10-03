import { PrismaClient } from "@prisma/client";

// Check if DATABASE_URL is available
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Database operations will fail.");
}

// Create a safe database client that won't crash if DATABASE_URL is missing
let db;

try {
  db = globalThis.prisma || new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
      },
    },
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = db;
  }
} catch (error) {
  console.error("Failed to initialize Prisma client:", error);
  // Create a mock db object to prevent crashes
  db = {
    user: { findUnique: () => Promise.reject(new Error("Database not configured")) },
    account: { findUnique: () => Promise.reject(new Error("Database not configured")) },
    transaction: { create: () => Promise.reject(new Error("Database not configured")) },
    $transaction: () => Promise.reject(new Error("Database not configured")),
  };
}

export { db };