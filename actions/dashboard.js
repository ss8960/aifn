"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@/lib/arcjet";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function getUserAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("No user ID found, returning empty accounts");
      return [];
    }

    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      // Create user if they don't exist (fallback for webhook issues)
      try {
        user = await db.user.create({
          data: {
            clerkUserId: userId,
            email: "", // Will be updated by webhook
            firstName: "",
            lastName: "",
          },
        });
        console.log("Created user fallback in getUserAccounts:", userId);
      } catch (createError) {
        console.error("Error creating user fallback in getUserAccounts:", createError);
        console.log("User not found, returning empty accounts");
        return [];
      }
    }

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Serialize accounts before sending to client
    const serializedAccounts = accounts.map(serializeTransaction);

    return serializedAccounts;
  } catch (error) {
    console.error("Error getting user accounts:", error);
    return [];
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("No user ID found, cannot create account");
      return { success: false, error: "Unauthorized" };
    }

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      // Create user if they don't exist (fallback for webhook issues)
      try {
        user = await db.user.create({
          data: {
            clerkUserId: userId,
            email: `user-${userId}@temp.local`, // Temporary email to satisfy unique constraint
            name: "User", // Use name field instead of firstName/lastName
          },
        });
        console.log("Created user fallback:", userId);
      } catch (createError) {
        console.error("Error creating user fallback:", createError);
        throw new Error("User not found and could not be created");
      }
    }

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault, // Override the isDefault based on our logic
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    console.error("Error creating account:", error);
    return { success: false, error: error.message };
  }
}

export async function getDashboardData() {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("No user ID found, returning empty transactions");
      return [];
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      console.log("User not found, returning empty transactions");
      return [];
    }

    // Get all user transactions
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return transactions.map(serializeTransaction);
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return [];
  }
}