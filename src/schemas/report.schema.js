import z from "zod";
import { uuidSchema } from "./common.schema.js";

// Query
export const reportQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    type: z.enum(["income", "expense"]).optional(),
    categoryId: uuidSchema.optional(),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date must be greater than or equal to start date",
      path: ["endDate"],
    },
  );

// Get all reports
export const getReportSchema = z.object({
  query: reportQuerySchema,
});
