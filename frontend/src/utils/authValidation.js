import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[A-Z][a-zA-Z\s]*$/, "Name must start with uppercase"),

  email: z
    .string()
    .email("Invalid email")
    .regex(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Email must end with @gmail.com"),

  password: z
    .string()
    .min(5, "Password must be at least 5 characters")
    .regex(/[A-Z]/, "Password must contain one uppercase letter")
    .regex(/[0-9]/, "Password must contain one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain one special character"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .regex(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Email must end with @gmail.com"),

  password: z.string().min(5, "Password must be at least 5 characters"),
});
