import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) {
      throw new Error("Amount must be a valid number");
    }
    if (num < 0) {
      throw new Error("Amount cannot be negative");
    }
    return num;
  }),
  description: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
  category: z.string().min(1, "Category is required"),
  date: z.date(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
});

export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["CURRENT", "SAVINGS", "INVESTMENT", "CREDIT"]),
  balance: z.number().min(0, "Balance must be 0 or greater"),
  isDefault: z.boolean().optional(),
});
