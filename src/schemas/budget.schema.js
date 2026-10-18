import z from "zod";
import { commonQuerySchema, uuidSchema } from "./common.schema.js";

// Params
export const budgetParamsSchema = z.object({
  budgetId: uuidSchema,
});

// Query
export const budgetQuerySchema = commonQuerySchema.extend({
  month: z.coerce.number().int().min(1).max(12).optional(),

  year: z.coerce.number().int().min(1, "Invalid year").optional(),

  categoryId: uuidSchema.optional(),
});

// Create / Update body
export const budgetSchema = z.object({
  categoryId: uuidSchema,

  amount: z.coerce
    .number({ error: "Amount is required" })
    .positive("Amount must be greater than 0"),

  month: z.coerce
    .number({ error: "Month is required" })
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),

  year: z.coerce
    .number({ error: "Year is required" })
    .int("Year must be an integer")
    .min(1, "Invalid year"),
});

// Get all budgets
export const getBudgetSchema = z.object({
  query: budgetQuerySchema,
});

// Get budget by ID
export const getBudgetByIdSchema = z.object({
  params: budgetParamsSchema,
});

// Create budget
export const getCreateBudgetSchema = z.object({
  body: budgetSchema,
});

// Update budget
export const getUpdateBudgetSchema = z.object({
  body: budgetSchema.extend({
    budgetId: uuidSchema,
  }),
});

// Delete budget
export const getDeleteBudgetSchema = z.object({
  params: budgetParamsSchema,
});
