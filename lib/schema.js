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
  balance: z.number({
    required_error: "Balance is required",
    invalid_type_error: "Balance must be a valid number",
  }).min(0, "Balance cannot be negative").transform((val) => {
    // Round to 2 decimal places
    return Math.round(val * 100) / 100;
  }),
  isDefault: z.boolean().optional(),
});
