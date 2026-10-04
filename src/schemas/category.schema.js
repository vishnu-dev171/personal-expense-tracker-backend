import z from "zod";
import { commonQuerySchema, uuidSchema } from "./common.schema.js";

export const categoryParamsSchema = z.object({
  categoryId: uuidSchema,
});

export const categoryQuerySchema = commonQuerySchema;

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["income", "expense"], {
    message: "Invalid category type",
  }),
});

export const getCategorySchema = z.object({
  query: categoryQuerySchema,
});

export const getCategoryByIdSchema = z.object({
  params: categoryParamsSchema,
});

export const getCreateCategorySchema = z.object({
  body: createCategorySchema,
});

export const getUpdateCategorySchema = z.object({
  body: createCategorySchema.extend({
    categoryId: uuidSchema,
  }),
});
