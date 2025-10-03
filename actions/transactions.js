"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@/lib/arcjet";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

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

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Delete Transactions
export async function deleteTransactions(ids) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const transactionsToDelete = await db.transaction.findMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
    });

    if (transactionsToDelete.length === 0) {
      return { success: false, error: "No transactions found to delete" };
    }

    await db.$transaction(async (tx) => {
      for (const transaction of transactionsToDelete) {
        const account = await tx.account.findUnique({
          where: { id: transaction.accountId },
        });

        if (account) {
          const balanceChange =
            transaction.type === "EXPENSE"
              ? transaction.amount.toNumber()
              : -transaction.amount.toNumber();
          await tx.account.update({
            where: { id: account.id },
            data: { balance: account.balance.toNumber() + balanceChange },
          });
        }
      }
      await tx.transaction.deleteMany({
        where: {
          id: { in: ids },
          userId: user.id,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/account"); // Revalidate all accounts

    return { success: true, data: { deletedCount: transactionsToDelete.length } };
  } catch (error) {
    throw new Error(error.message);
  }
}


// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

// AI Receipt Scanner
export async function scanReceipt(file) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    // Initialize Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create prompt for receipt analysis
    const prompt = `
    Analyze this receipt image and extract the following information in JSON format:
    {
      "amount": number (total amount spent),
      "description": string (brief description of the purchase),
      "category": string (one of: food, transportation, entertainment, shopping, healthcare, utilities, other-expense),
      "date": string (date in YYYY-MM-DD format if visible, otherwise use today's date),
      "merchant": string (store/merchant name if visible)
    }
    
    If any information is not clearly visible, make reasonable assumptions based on the receipt content.
    Return only the JSON object, no additional text or markdown formatting.
    `;

    // Generate content with the image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    let extractedData;
    try {
      // Clean the response text to extract JSON
      // First try to find JSON within markdown code blocks
      let jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) {
        // If no markdown code block, try to find JSON directly
        jsonMatch = text.match(/\{[\s\S]*\}/);
      }
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        extractedData = JSON.parse(jsonString);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", text);
      throw new Error("Failed to parse receipt data");
    }

    // Validate and format the extracted data
    const formattedData = {
      amount: parseFloat(extractedData.amount) || 0,
      description: extractedData.description || "Receipt scan",
      category: extractedData.category || "other-expense",
      date: extractedData.date || new Date().toISOString().split('T')[0],
      merchant: extractedData.merchant || "Unknown"
    };

    return { success: true, data: formattedData };

  } catch (error) {
    console.error("Receipt scanning error:", error);
    throw new Error(`Receipt scanning failed: ${error.message}`);
  }
}