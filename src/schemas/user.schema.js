import { z } from "zod";

export const userRegisterSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, { message: "Name is required" }),
      email: z.email({ message: "Invalid email address format" }),
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .regex(/[0-9]/, {
          message: "Password must include at least one number",
        })
        .regex(/[^A-Za-z0-9]/, {
          message: "Password must include at least one special character",
        }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"], // Attaches the error specifically to the confirmPassword field
    }),
});

export const userLoginSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email address format" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/[0-9]/, { message: "Password must include at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must include at least one special character",
      }),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ message: "Invalid email address format" }),
    currency: z.enum(["INR", "USD", "EUR"]),
    defaultTransactionType: z.enum(["INCOME", "EXPENSE"]),
  }),
});
