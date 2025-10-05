import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  const results = {
    clerk: false,
    database: false,
    user: null,
    accounts: [],
    error: null
  };

  try {
    // Test Clerk
    const { userId } = await auth();
    results.clerk = !!userId;
    
    if (userId) {
      // Test Database - Find or create user
      let user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });

      if (!user) {
        // Create user if they don't exist
        user = await db.user.create({
          data: {
            clerkUserId: userId,
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
          },
        });
        results.user = user;
      } else {
        results.user = user;
      }

      // Test getting accounts
      const accounts = await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      results.accounts = accounts;
      results.database = true;

      // Test creating a test account
      const testAccount = await db.account.create({
        data: {
          name: "Test Account",
          type: "CURRENT",
          balance: 100.00,
          userId: user.id,
          isDefault: true,
        },
      });

      results.testAccount = testAccount;
    }

  } catch (error) {
    results.error = error.message;
    console.error("Debug error:", error);
  }

  return NextResponse.json(results);
}
