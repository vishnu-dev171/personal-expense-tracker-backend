import z from "zod";
import { commonQuerySchema, uuidSchema } from "./common.schema.js";
import { PAYMENT_METHODS } from "../utils/constants.js";

export const transactionParamsSchema = z.object({
  transactionId: uuidSchema,
});

export const transactionQuerySchema = commonQuerySchema
  .extend({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    type: z.enum(["income", "expense"]).optional(),
    categoryId: uuidSchema.optional(),
    paymentMethod: z
      .enum(PAYMENT_METHODS)
      .transform((value) => value.replace(" ", "_"))
      .optional(),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date must be greater than or equal to start date",
      path: ["endDate"],
    },
  );

export const transactionSchema = z.object({
  type: z.enum(["expense", "income"], {
    error: "Select a type",
  }),

  amount: z.coerce
    .number({ error: "Amount is required" })
    .positive("Amount must be greater than 0"),

  categoryId: z.string().min(1, "Category is required"),

  description: z.string().optional(),

  transactionDate: z.coerce.date({
    message: "Invalid transaction date",
  }),

  paymentMethod: z.enum(PAYMENT_METHODS, {
    error: "Select a payment method",
  }),

  notes: z.string().optional(),
});

export const getTransactionSchema = z.object({
  query: transactionQuerySchema,
});

export const getTransactionByIdSchema = z.object({
  params: transactionParamsSchema,
});

export const getCreateTransactionSchema = z.object({
  body: transactionSchema,
});

export const getUpdateTransactionSchema = z.object({
  body: transactionSchema.extend({
    transactionId: uuidSchema,
    deleteFileIds: z.preprocess(
      (value) => (typeof value === "string" ? [value] : value),
      z.array(z.string().min(1)),
    ).optional(),
  }),
});
